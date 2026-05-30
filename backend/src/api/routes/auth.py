from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from starlette.status import HTTP_302_FOUND
from loguru import logger
from src.services.github_service import (
    get_github_oauth_url,
    exchange_code_for_token,
    get_github_user
)
from src.services.jwt_service import (
    create_access_token,
    create_refresh_token,
    store_refresh_token,
    invalidate_refresh_token,
    is_refresh_token_valid,
    verify_token
)
from src.core.database import get_db
from src.core.config import settings
from src.api.middleware.auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.get("/github")
async def github_login():
    """Redirect user to GitHub OAuth page"""
    url = get_github_oauth_url()
    return RedirectResponse(url)

@router.get("/github/callback")
async def github_callback(code: str = Query(...)):
    """Handle GitHub OAuth callback"""
    try:
        # Exchange code for GitHub access token
        github_token = await exchange_code_for_token(code)

        # Get user profile from GitHub
        github_user = await get_github_user(github_token)

        db = get_db()

        # Check if user exists, create or update
        existing_user = await db.users.find_one(
            {"github_id": github_user["id"]}
        )

        user_data = {
            "github_id": github_user["id"],
            "username": github_user["login"],
            "email": github_user.get("email"),
            "avatar_url": github_user.get("avatar_url", ""),
            "name": github_user.get("name"),
            "github_access_token": github_token,
            "updated_at": datetime.utcnow()
        }

        if existing_user:
            await db.users.update_one(
                {"github_id": github_user["id"]},
                {"$set": user_data}
            )
            user_id = str(existing_user["_id"])
            logger.info(f"User updated: {github_user['login']}")
        else:
            user_data["created_at"] = datetime.utcnow()
            result = await db.users.insert_one(user_data)
            user_id = str(result.inserted_id)
            logger.success(f"New user created: {github_user['login']}")

        # Issue JWT tokens
        access_token = create_access_token({"sub": user_id})
        refresh_token = create_refresh_token({"sub": user_id})

        # Store refresh token in Redis
        await store_refresh_token(user_id, refresh_token)

        # Redirect to frontend with tokens
        frontend_url = (
            f"{settings.FRONTEND_URL}/auth/callback"
            f"#access_token={access_token}"
            f"&refresh_token={refresh_token}"
            f"&user_id={user_id}"
        )
        return RedirectResponse(frontend_url, status_code=HTTP_302_FOUND)

    except Exception as e:
        logger.error(f"GitHub OAuth error: {e}")
        return RedirectResponse(
            f"{settings.FRONTEND_URL}/login?error=auth_failed",
    status_code=HTTP_302_FOUND
        )

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current logged in user"""
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user.get("email"),
        "avatar_url": current_user["avatar_url"],
        "name": current_user.get("name"),
    }

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Get new access token using refresh token"""
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    is_valid = await is_refresh_token_valid(user_id, refresh_token)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Refresh token expired")

    new_access_token = create_access_token({"sub": user_id})
    return {"access_token": new_access_token}

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout and invalidate refresh token"""
    await invalidate_refresh_token(current_user["id"])
    return {"message": "Logged out successfully"}