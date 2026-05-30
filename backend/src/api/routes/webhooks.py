from fastapi import APIRouter, Request, HTTPException, Header
from loguru import logger
from src.core.database import get_db
from src.services.ai_service import review_pull_request, generate_review_comment
from src.services.github_service import fetch_pr_diff, post_pr_comment
from src.core.config import settings
import hmac
import hashlib
import json
from datetime import datetime
from typing import Optional
from src.sockets.manager import manager

router = APIRouter()

def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    """Verify GitHub webhook HMAC signature"""
    expected = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

@router.post("/github")
async def github_webhook(
    request: Request,
    x_github_event: Optional[str] = Header(None),
    x_hub_signature_256: Optional[str] = Header(None)
):
    payload_bytes = await request.body()

    # Verify signature
    if x_hub_signature_256:
        if not verify_webhook_signature(payload_bytes, x_hub_signature_256):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = json.loads(payload_bytes)
    event = x_github_event

    logger.info(f"GitHub webhook received: {event}")

    # Only handle PR events
    if event != "pull_request":
        return {"message": f"Event {event} ignored"}

    action = payload.get("action")

    # Only review when PR is opened or updated
    if action not in ["opened", "synchronize"]:
        return {"message": f"PR action {action} ignored"}

    pr = payload.get("pull_request", {})
    repo = payload.get("repository", {})

    pr_number = pr.get("number")
    pr_title = pr.get("title", "")
    pr_url = pr.get("html_url", "")
    repo_full_name = repo.get("full_name", "")
    owner, repo_name = repo_full_name.split("/", 1)

    logger.info(f"Processing PR #{pr_number}: {pr_title} in {repo_full_name}")

    db = get_db()

    # Find the user who owns this repo
    repo_doc = await db.repositories.find_one({
        "full_name": repo_full_name,
        "connected": True
    })

    if not repo_doc:
        logger.warning(f"Repo {repo_full_name} not connected — skipping review")
        return {"message": "Repository not connected"}

    user_id = repo_doc["user_id"]

    # Get user's GitHub token
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"message": "User not found"}

    github_token = user["github_access_token"]

    try:
        # Fetch the PR diff
        diff = await fetch_pr_diff(github_token, owner, repo_name, pr_number)
        logger.info(f"Fetched diff: {len(diff)} chars")

        # Run AI review
        review_data = await review_pull_request(diff, pr_title, repo_full_name, pr_number)

        # Save review to MongoDB
        review_doc = {
            "user_id": user_id,
            "repo_full_name": repo_full_name,
            "pr_number": pr_number,
            "pr_title": pr_title,
            "pr_url": pr_url,
            "summary": review_data.get("summary", ""),
            "score": review_data.get("score", 0),
            "security_score": review_data.get("security_score", 0),
            "performance_score": review_data.get("performance_score", 0),
            "maintainability_score": review_data.get("maintainability_score", 0),
            "recommendation": review_data.get("recommendation", "comment"),
            "issues": review_data.get("issues", []),
            "positives": review_data.get("positives", []),
            "created_at": datetime.utcnow()
        }

        result = await db.reviews.insert_one(review_doc)
        review_id = str(result.inserted_id)
        logger.success(f"Review saved: {review_id}")

        # Post comment on GitHub PR
        comment_body = await generate_review_comment(review_data, pr_number)
        comment = await post_pr_comment(github_token, owner, repo_name, pr_number, comment_body)

        # Update PR record
        await db.reviews.update_one(
            {"_id": result.inserted_id},
            {"$set": {"github_comment_id": comment.get("id")}}
        )

        logger.success(f"AI review posted on PR #{pr_number}")
        await manager.send_to_user(user_id, "review_complete", {
    "pr_number": pr_number,
    "pr_title": pr_title,
    "score": review_data.get("score"),
    "repo": repo_full_name,
    "review_id": review_id
})
        return {"message": "Review completed", "review_id": review_id, "score": review_data.get("score")}

    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/manual-review")
async def manual_review(
    repo_full_name: str,
    pr_number: int,
    pr_title: str,
    pr_url: str,
    request: Request
):
    """
    Manually trigger an AI review — useful for testing without webhooks.
    We'll use this to demo the AI review during development.
    """
    db = get_db()

    repo_doc = await db.repositories.find_one({"full_name": repo_full_name})
    if not repo_doc:
        raise HTTPException(status_code=404, detail="Repository not found")

    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(repo_doc["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    owner, repo_name = repo_full_name.split("/", 1)
    github_token = user["github_access_token"]

    diff = await fetch_pr_diff(github_token, owner, repo_name, pr_number)
    review_data = await review_pull_request(diff, pr_title, repo_full_name, pr_number)

    review_doc = {
        "user_id": str(user["_id"]),
        "repo_full_name": repo_full_name,
        "pr_number": pr_number,
        "pr_title": pr_title,
        "pr_url": pr_url,
        "summary": review_data.get("summary", ""),
        "score": review_data.get("score", 0),
        "security_score": review_data.get("security_score", 0),
        "performance_score": review_data.get("performance_score", 0),
        "maintainability_score": review_data.get("maintainability_score", 0),
        "recommendation": review_data.get("recommendation", "comment"),
        "issues": review_data.get("issues", []),
        "positives": review_data.get("positives", []),
        "created_at": datetime.utcnow()
    }

    result = await db.reviews.insert_one(review_doc)
     
    await manager.send_to_user(user_id, "review_complete", {
    "pr_number": pr_number,
    "pr_title": pr_title,
    "score": review_data.get("score"),
    "repo": repo_full_name,
    "review_id": review_id
})

    return {"message": "Review completed", "review_id": str(result.inserted_id), "review": review_data}