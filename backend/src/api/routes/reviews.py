from fastapi import APIRouter, Depends
from src.api.middleware.auth import get_current_user
from src.core.database import get_db

router = APIRouter()

@router.get("/")
async def get_reviews(current_user: dict = Depends(get_current_user)):
    """Get all AI reviews for current user"""
    db = get_db()
    reviews = await db.reviews.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).to_list(50)

    for r in reviews:
        r["id"] = str(r["_id"])
        del r["_id"]

    return reviews