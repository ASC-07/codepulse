from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PullRequest(BaseModel):
    id: Optional[str] = None
    github_pr_id: int
    number: int
    repo_full_name: str
    user_id: str
    title: str
    body: Optional[str] = None
    state: str
    author: str
    author_avatar: str
    base_branch: str
    head_branch: str
    additions: int = 0
    deletions: int = 0
    changed_files: int = 0
    html_url: str
    ai_reviewed: bool = False
    ai_review_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)