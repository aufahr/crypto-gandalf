from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agent.initialize_agent import initialize_agent
from agent.run_agent import run_agent
from db.setup import setup
import constants

load_dotenv()
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup SQLite tables
setup()

# Initialize agents with different difficulty levels
agent_executor_easy = initialize_agent(constants.AGENT_PROMPT_EASY)
agent_executor_medium = initialize_agent(constants.AGENT_PROMPT_MEDIUM)
agent_executor_hard = initialize_agent(constants.AGENT_PROMPT_HARD)

class ChatInput(BaseModel):
    input: str
    conversation_id: str

# # Interact with agents of different difficulty levels
# @app.post("/api/chat")
# async def chat(chat_input: ChatInput):
#     try:
#         config = {"configurable": {"thread_id": chat_input.conversation_id}}
#         return StreamingResponse(
#             run_agent(chat_input.input, agent_executor, config),
#             media_type="text/event-stream",
#             headers={
#                 "Cache-Control": "no-cache",
#                 "Connection": "keep-alive",
#                 "X-Accel-Buffering": "no"
#             }
#         )
#     except Exception as e:
#         return {"error": f"An unexpected error occurred: {str(e)}"}, 500

@app.post("/api/chat/easy")
async def chat_easy(chat_input: ChatInput):
    try:
        config = {"configurable": {"thread_id": chat_input.conversation_id}}
        return StreamingResponse(
            run_agent(chat_input.input, agent_executor_easy, config),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}, 500

@app.post("/api/chat/medium")
async def chat_medium(chat_input: ChatInput):
    try:
        config = {"configurable": {"thread_id": chat_input.conversation_id}}
        return StreamingResponse(
            run_agent(chat_input.input, agent_executor_medium, config),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}, 500

@app.post("/api/chat/hard")
async def chat_hard(chat_input: ChatInput):
    try:
        config = {"configurable": {"thread_id": chat_input.conversation_id}}
        return StreamingResponse(
            run_agent(chat_input.input, agent_executor_hard, config),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)
    