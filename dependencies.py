from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
import jwt
from models import User
from database import get_db
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from helper import JWT_SECRET_KEY


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")



def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        result = db.execute(select(User).filter(User.email == email))
        user = result.scalars().first()
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

