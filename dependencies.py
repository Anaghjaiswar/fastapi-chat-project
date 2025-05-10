from fastapi import Cookie, Header
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from jose import JWTError
import jwt
from models import User
from database import get_db
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from helper import JWT_SECRET_KEY


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")



# async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
#     try:
#         payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
#         email: str = payload.get("sub")
#         if email is None:
#             raise HTTPException(status_code=401, detail="Invalid token")
#         result = await db.execute(select(User).filter(User.email == email))
#         user = result.scalars().first()
#         if user is None:
#             raise HTTPException(status_code=401, detail="Invalid token")
#         return user
#     except jwt.PyJWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    authorization: str | None = Header(None),
    access_token: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db),
):
    # 1) pick token from header or cookie
    token = None
    if authorization:
        scheme, _, cred = authorization.partition(" ")
        if scheme.lower() == "bearer":
            token = cred
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(401, "Not authenticated")

    # 2) decode it
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if not email:
            raise JWTError()
    except JWTError:
        raise HTTPException(401, "Invalid token")

    # 3) load user
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(401, "Invalid token")
    return user
