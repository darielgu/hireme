import dotenv
import uvicorn
from app.routes.pipeline import router as pipeline_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

dotenv.load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipeline_router)


@app.get("/")
def main():
    return {"message": "Hello from backend!"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
