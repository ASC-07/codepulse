from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReviewIssue(BaseModel):
    type: str
    severity: str
    title: str
    description: str
    suggestion: str
    line_hint: Optional[str] = None

class Review(BaseModel):
    id: Optional[str] = None
    user_id: str
    repo_full_name: str
    pr_number: int
    pr_title: str
    pr_url: str
    summary: str
    score: int
    security_score: int
    performance_score: int
    maintainability_score: int
    recommendation: str
    issues: List[ReviewIssue] = []
    positives: List[str] = []
    github_comment_id: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)