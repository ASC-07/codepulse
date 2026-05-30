from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from src.api.middleware.auth import get_current_user
from src.services.github_service import fetch_user_repos, fetch_repo_prs
from src.core.database import get_db
from datetime import datetime

router = APIRouter()

@router.get("/")
async def get_repos(current_user: dict = Depends(get_current_user)):
    """Get all repos for current user (from MongoDB cache)"""
    db = get_db()
    repos = await db.repositories.find(
        {"user_id": current_user["id"]}
    ).sort("updated_at", -1).to_list(100)

    for r in repos:
        r["id"] = str(r["_id"])
        del r["_id"]

    return repos

@router.post("/sync")
async def sync_repos(current_user: dict = Depends(get_current_user)):
    """Sync repos from GitHub into MongoDB"""
    try:
        github_token = current_user["github_access_token"]
        github_repos = await fetch_user_repos(github_token)
        db = get_db()

        synced = 0
        for repo in github_repos:
            repo_data = {
                "github_id": repo["id"],
                "user_id": current_user["id"],
                "name": repo["name"],
                "full_name": repo["full_name"],
                "description": repo.get("description"),
                "private": repo["private"],
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "open_issues": repo.get("open_issues_count", 0),
                "default_branch": repo.get("default_branch", "main"),
                "html_url": repo["html_url"],
                "updated_at": datetime.utcnow()
            }
            await db.repositories.update_one(
                {"github_id": repo["id"], "user_id": current_user["id"]},
                {"$set": repo_data, "$setOnInsert": {"connected": False, "created_at": datetime.utcnow()}},
                upsert=True
            )
            synced += 1

        logger.success(f"Synced {synced} repos for {current_user['username']}")
        return {"message": f"Synced {synced} repositories", "count": synced}

    except Exception as e:
        logger.error(f"Repo sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{repo_full_name:path}/connect")
async def connect_repo(
    repo_full_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a repo as connected for AI review"""
    db = get_db()
    result = await db.repositories.update_one(
        {"full_name": repo_full_name, "user_id": current_user["id"]},
        {"$set": {"connected": True, "updated_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Repository not found")
    return {"message": f"Repository {repo_full_name} connected"}

@router.get("/{repo_full_name:path}/prs")
async def get_repo_prs(
    repo_full_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Get PRs for a specific repo"""
    try:
        owner, repo = repo_full_name.split("/", 1)
        github_token = current_user["github_access_token"]
        prs = await fetch_repo_prs(github_token, owner, repo)
        return prs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))