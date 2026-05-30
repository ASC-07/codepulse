from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    id: Optional[str] = None
    github_id: int
    username: str
    email: Optional[str] = None
    avatar_url: str
    name: Optional[str] = None
    github_access_token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    github_id: int
    username: str
    email: Optional[str] = None
    avatar_url: str
    name: Optional[str] = None
    created_at: datetime