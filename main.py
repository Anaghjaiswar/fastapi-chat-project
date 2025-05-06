from fastapi import APIRouter, FastAPI, Depends, HTTPException, status
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from routers import auth, user, chat
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import redis_client


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(user.router, prefix="/user", tags=["user"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

@app.get("/")
async def root():
    return {"message": "Hello, FastAPI with NeonDB!"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup logic
    await redis_client.ping()                   
    yield                                        
    # shutdown logic
    await redis_client.close()                 

app = FastAPI(lifespan=lifespan) 


