from langchain_ollama import ChatOllama
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from django.conf import settings

_history_store: dict[str, list] = {}

def get_history(session_id: str) -> list:
    if session_id not in _history_store:
        _history_store[session_id] = []
    return _history_store[session_id]

def clear_history(session_id: str):
    _history_store[session_id] = []

SYSTEM_PREFIX = """You are an IT Asset Management assistant with access to a PostgreSQL database.
Never modify data — only SELECT queries allowed.
If something is not in the database, say so clearly.
Use bullet points when listing multiple items.

You MUST follow this EXACT format every single time, no exceptions:

Thought: [your reasoning about what to do]
Action: [one of the available tool names]
Action Input: [the input to the tool]
Observation: [the result of the action]
... (repeat Thought/Action/Action Input/Observation N times if needed)
Thought: I now know the final answer
Final Answer: [your concise answer to the user]

IMPORTANT: Never write anything outside this format. Never skip to Final Answer without using a tool first.
"""

def run_agent(session_id: str, user_message: str) -> str:
    llm = ChatOllama(
        model="tinyllama",
        base_url="http://localhost:11434",
        temperature=0,
        num_predict=1024,
        repeat_penalty=1.1,
    )

    db = SQLDatabase.from_uri(
        settings.DATABASE_URL,
        include_tables=[
            "api_product",
            "api_category",
            "api_department",
            "accounts_user",
        ],
        sample_rows_in_table_info=1, 
    )

    history = get_history(session_id)
    full_input = user_message
    if history:
        lines = []
        for entry in history[-4:]:  
            lines.append(f"Human: {entry['human']}")
            lines.append(f"Assistant: {entry['ai']}")
        history_text = "\n".join(lines)
        full_input = f"Previous conversation:\n{history_text}\n\nCurrent question: {user_message}"

    agent = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="zero-shot-react-description",
        prefix=SYSTEM_PREFIX,
        verbose=True,
        handle_parsing_errors="Please follow the exact Thought/Action/Action Input format.",
        max_iterations=15,
        max_execution_time=120,
    )

    try:
        result = agent.invoke({"input": full_input})
        reply = result.get("output", "I couldn't find an answer. Please rephrase.")
        get_history(session_id).append({"human": user_message, "ai": reply})
        return reply
    except Exception as e:
        return f"Error: {str(e)}"