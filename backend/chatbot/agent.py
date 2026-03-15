from groq import Groq
from django.conf import settings
from django.db import connection

# ── Safety: only allow SELECT statements ─────────────────────────────────────
def is_safe_sql(sql: str) -> bool:
    cleaned = sql.strip().lstrip(";").strip().lower()
    return cleaned.startswith("select")

# ── Execute SQL directly via Django connection ────────────────────────────────
def run_sql(sql: str) -> str:
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchmany(50)
            columns = [col[0] for col in cursor.description]
            if not rows:
                return "No results found."
            lines = [" | ".join(columns)]
            lines.append("-" * len(lines[0]))
            for row in rows:
                lines.append(" | ".join(str(v) if v is not None else "NULL" for v in row))
            return "\n".join(lines)
    except Exception as e:
        return f"SQL Error: {str(e)}"

# ── Get DB schema for relevant tables only ────────────────────────────────────
def get_schema() -> str:
    tables = [
        "api_product",
        "api_category",
        "api_department",
        "api_vendor",
        "api_status",
        "api_transferlog",
        "api_repairlog",
        "api_repairstatus",
        "accounts_user",
    ]
    schema_parts = []
    with connection.cursor() as cursor:
        for table in tables:
            try:
                cursor.execute("""
                    SELECT column_name, data_type
                    FROM information_schema.columns
                    WHERE table_name = %s
                    ORDER BY ordinal_position
                """, [table])
                cols = cursor.fetchall()
                if cols:
                    col_defs = ", ".join(f"{c[0]} ({c[1]})" for c in cols)
                    schema_parts.append(f"Table: {table}\nColumns: {col_defs}")
            except Exception:
                pass
    return "\n\n".join(schema_parts)

# ── In-memory history (per session) ──────────────────────────────────────────
_history_store: dict[str, list] = {}

def get_history(session_id: str) -> list:
    if session_id not in _history_store:
        _history_store[session_id] = []
    return _history_store[session_id]

def clear_history(session_id: str):
    _history_store[session_id] = []

# ── Step 1: Generate SQL from question ───────────────────────────────────────
def generate_sql(client: Groq, question: str, schema: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=512,
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": f"""You are a PostgreSQL expert. Given the schema below, write a single SELECT query to answer the question.
Return ONLY the raw SQL query — no explanation, no markdown, no backticks, no semicolon at the end.
If the question cannot be answered from the schema, return exactly: CANNOT_ANSWER

Schema:
{schema}"""
            },
            {
                "role": "user",
                "content": question
            }
        ],
    )
    return response.choices[0].message.content.strip()

# ── Step 2: Format SQL result as natural language ─────────────────────────────
def format_answer(client: Groq, question: str, sql: str, result: str, history: list) -> str:
    messages = [
        {
            "role": "system",
            "content": "You are a helpful IT Asset Management assistant. Answer questions based on database query results. Be concise and clear. Use bullet points when listing multiple items."
        }
    ]

    # Inject conversation history for context
    for entry in history[-6:]:
        messages.append({"role": "user", "content": entry["human"]})
        messages.append({"role": "assistant", "content": entry["ai"]})

    messages.append({
        "role": "user",
        "content": f"""Question: {question}

SQL executed: {sql}

Query result:
{result}

Answer the question clearly and concisely based on the result.
Use bullet points when listing multiple items.
If the result is empty or says 'No results found', say no data was found."""
    })

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1024,
        temperature=0,
        messages=messages,
    )
    return response.choices[0].message.content.strip()

# ── Main entry point ──────────────────────────────────────────────────────────
def run_agent(session_id: str, user_message: str) -> str:
    client = Groq(api_key=settings.GROQ_API_KEY)
    history = get_history(session_id)

    try:
        # Step 1: Get schema
        schema = get_schema()

        # Build question with history context
        question = user_message
        if history:
            context = "\n".join(
                f"Q: {e['human']}\nA: {e['ai']}" for e in history[-3:]
            )
            question = f"Previous context:\n{context}\n\nCurrent question: {user_message}"

        # Step 2: Generate SQL
        sql = generate_sql(client, question, schema)

        # Clean up any accidental markdown the model adds
        sql = sql.replace("```sql", "").replace("```", "").strip()

        if sql == "CANNOT_ANSWER":
            reply = "I couldn't find relevant data in the database to answer that question."
            get_history(session_id).append({"human": user_message, "ai": reply})
            return reply

        # Step 3: Safety check — SELECT only
        if not is_safe_sql(sql):
            reply = "I can only read data, not modify it."
            get_history(session_id).append({"human": user_message, "ai": reply})
            return reply

        # Step 4: Run SQL against DB
        result = run_sql(sql)

        # Step 5: Format as natural language answer
        reply = format_answer(client, user_message, sql, result, history)

        get_history(session_id).append({"human": user_message, "ai": reply})
        return reply

    except Exception as e:
        error = str(e)
        if "api_key" in error.lower() or "authentication" in error.lower():
            return "Invalid Groq API key. Please check your .env file."
        if "rate_limit" in error.lower():
            return "Rate limit reached. Please wait a moment and try again."
        return f"Error: {error}"