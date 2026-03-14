from langchain_ollama import ChatOllama
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from django.conf import settings

# ── In-memory conversation history store (per user session) ──────────────────
_history_store: dict[str, list] = {}

def get_history(session_id: str) -> list:
    if session_id not in _history_store:
        _history_store[session_id] = []
    return _history_store[session_id]

def clear_history(session_id: str):
    _history_store[session_id] = []

# ── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_PREFIX = """You are an IT Asset Management assistant.
Answer questions using the database. Be concise and clear.
Use bullet points when listing multiple assets.
Never modify data — only read it.
If something is not in the database, say so."""

# ── Main agent runner ─────────────────────────────────────────────────────────
def run_agent(session_id: str, user_message: str) -> str:
    llm = ChatOllama(
        model="llama3",
        base_url="http://localhost:11434",
        temperature=0,
    )

    db = SQLDatabase.from_uri(
        settings.DATABASE_URL,
        include_tables=[
            "api_asset",
            "api_category",
            "api_location",
            "accounts_user",
        ],
        sample_rows_in_table_info=2,
    )

    # Build conversation context from history
    history = get_history(session_id)
    history_text = ""
    if history:
        lines = []
        for entry in history[-6:]:  # last 3 turns
            lines.append(f"Human: {entry['human']}")
            lines.append(f"Assistant: {entry['ai']}")
        history_text = "\n".join(lines)

    # Inject history into the prompt
    full_input = user_message
    if history_text:
        full_input = f"""Previous conversation:
{history_text}

Current question: {user_message}"""

    agent = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="openai-tools",
        prefix=SYSTEM_PREFIX,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=10,
        max_execution_time=60,
    )

    try:
        result = agent.invoke({"input": full_input})
        reply = result.get("output", "I couldn't find an answer. Please rephrase.")
        get_history(session_id).append({"human": user_message, "ai": reply})
        return reply
    except Exception as e:
        return f"Error: {str(e)}"