from fastapi import APIRouter, Depends
from src.api.middleware.auth import get_current_user
from src.core.database import get_db
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
async def get_summary(current_user: dict = Depends(get_current_user)):
    """Dashboard summary stats"""
    db = get_db()
    user_id = current_user["id"]

    total_reviews = await db.reviews.count_documents({"user_id": user_id})
    total_repos = await db.repositories.count_documents({"user_id": user_id})
    connected_repos = await db.repositories.count_documents({"user_id": user_id, "connected": True})

    # Average score
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$score"}}}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    avg_score = round(result[0]["avg_score"], 1) if result else 0

    # Issues by severity
    issues_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$unwind": "$issues"},
        {"$group": {"_id": "$issues.severity", "count": {"$sum": 1}}}
    ]
    issues_result = await db.reviews.aggregate(issues_pipeline).to_list(10)
    issues_by_severity = {item["_id"]: item["count"] for item in issues_result}

    # Reviews over last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_reviews = await db.reviews.find(
        {"user_id": user_id, "created_at": {"$gte": seven_days_ago}}
    ).sort("created_at", 1).to_list(100)

    daily_counts = {}
    for review in recent_reviews:
        day = review["created_at"].strftime("%b %d")
        daily_counts[day] = daily_counts.get(day, 0) + 1

    # Score distribution
    score_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$recommendation", "count": {"$sum": 1}}}
    ]
    score_result = await db.reviews.aggregate(score_pipeline).to_list(10)
    by_recommendation = {item["_id"]: item["count"] for item in score_result}

    return {
        "total_reviews": total_reviews,
        "total_repos": total_repos,
        "connected_repos": connected_repos,
        "avg_score": avg_score,
        "issues_by_severity": issues_by_severity,
        "daily_reviews": daily_counts,
        "by_recommendation": by_recommendation,
    }

@router.get("/reviews-trend")
async def reviews_trend(current_user: dict = Depends(get_current_user)):
    """Score trend over last 10 reviews"""
    db = get_db()
    reviews = await db.reviews.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).to_list(10)

    trend = []
    for r in reversed(reviews):
        trend.append({
            "pr": f"#{r['pr_number']}",
            "score": r["score"],
            "security": r.get("security_score", 0),
            "performance": r.get("performance_score", 0),
            "maintainability": r.get("maintainability_score", 0),
        })
    return trend