from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Repository(BaseModel):
    id: Optional[str] = None
    github_id: int
    user_id: str
    name: str
    full_name: str
    description: Optional[str] = None
    private: bool = False
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    default_branch: str = "main"
    html_url: str
    connected: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)