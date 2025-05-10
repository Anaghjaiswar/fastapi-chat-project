from typing import Union
from pydantic import BaseModel
from sqlalchemy import JSON, Column, Date, DateTime, Float, ForeignKey, Integer, String, Boolean, Table, Text, func
from database import Base
from pytz import timezone
from datetime import datetime
from sqlalchemy.orm import relationship



class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String,unique=True, index=True)
    full_name = Column(String, index=True)
    photo = Column(String)  #we will store the url of photo
    hashed_password = Column(String)
    date_of_birth = Column(Date)
    bio = Column(String(1000))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    otp_hash = Column(String, nullable=True)   # new
    otp_expiry = Column(Float,  nullable=True) 
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')), onupdate=lambda: datetime.now(timezone("Asia/Kolkata")))


# Association table for Room members (many-to-many)
room_members = Table(
    "room_members",
    Base.metadata,
    Column("room_id", ForeignKey("chat_rooms.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

# Association table for Message mentions (many-to-many)
message_mentions = Table(
    "message_mentions",
    Base.metadata,
    Column("message_id", ForeignKey("messages.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)


class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    description = Column(String(1000))
    room_avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')), onupdate=lambda: datetime.now(timezone('Asia/Kolkata')))
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    # relationships
    created_by = relationship("User", backref="created_rooms")
    members = relationship("User", secondary=room_members, backref="rooms")
    messages = relationship("Message", back_populates="room", cascade="all, delete-orphan")


class DirectChat(Base):
    __tablename__ = "direct_chats"
    id = Column(Integer, primary_key=True, index=True)
    user_a_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user_b_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')))

    user_a = relationship("User", foreign_keys=[user_a_id], backref="direct_chats_as_a")
    user_b = relationship("User", foreign_keys=[user_b_id], backref="direct_chats_as_b")
    messages = relationship("Message", back_populates="direct_chat", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=True, index=True)
    direct_chat_id = Column(Integer, ForeignKey("direct_chats.id", ondelete="CASCADE"), nullable=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message_type = Column(String(20), nullable=False)
    content = Column(Text, nullable=True)
    attachment = Column(String, nullable=True)  # Cloudinary URL
    parent_message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=True)
    reactions = Column(JSON, nullable=True)
    status = Column(JSON, nullable=True)
    is_deleted = Column(Boolean, default=False)
    is_edited = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone('Asia/Kolkata')), onupdate=lambda: datetime.now(timezone('Asia/Kolkata')))

    # relationships
    room = relationship("ChatRoom", back_populates="messages")
    direct_chat = relationship("DirectChat", back_populates="messages")
    sender = relationship("User", backref="messages")
    mentions = relationship("User", secondary=message_mentions, backref="mentioned_in")
    replies = relationship(
        "Message",
        back_populates="parent",
        cascade="all, delete-orphan",
        single_parent=True
    )

    # the "many"‑side: each reply has exactly one parent
    parent = relationship(
        "Message",
        back_populates="replies",
        remote_side=[id]
    )


class UserRoomStatus(Base):
    __tablename__ = "user_room_statuses"
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), primary_key=True)
    last_read = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="room_statuses")
    room = relationship("ChatRoom", backref="user_statuses")