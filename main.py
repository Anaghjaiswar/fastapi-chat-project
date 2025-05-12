from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routers import auth, user, chat
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import redis_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    await redis_client.ping()
    yield
    # Shutdown logic
    await redis_client.close()

# Define the FastAPI app with lifespan
app = FastAPI(lifespan=lifespan) 


# replace this with the exact origin (scheme + host + port) where your HTML/JS is served
origins = [
    "http://127.0.0.1:5500",   
    "http://localhost:5173",
    "http://localhost:8000",    # if you serve static from FastAPI
    "null",                     # needed if you open file://…/login.html in browser
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # <<< your front‑end origins here
    allow_credentials=True,          # <<< allow cookies (HttpOnly) to be sent
    allow_methods=["*"],             # allow all HTTP methods
    allow_headers=["*"],             # allow all headers
    expose_headers=["*"],            # expose all response headers if needed
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
