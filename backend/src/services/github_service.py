import httpx
from loguru import logger
from src.core.config import settings

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"

def get_github_oauth_url() -> str:
    params = (
        f"client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_CALLBACK_URL}"
        f"&scope=read:user,user:email,repo"
    )
    return f"{GITHUB_AUTH_URL}?{params}"

async def exchange_code_for_token(code: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_CALLBACK_URL,
            }
        )
        data = response.json()
        if "access_token" not in data:
            raise Exception("Failed to get GitHub access token")
        return data["access_token"]

async def get_github_user(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        user = response.json()
        if not user.get("email"):
            email_response = await client.get(
                f"{GITHUB_API_URL}/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            emails = email_response.json()
            primary = next(
                (e["email"] for e in emails if e.get("primary")), None
            )
            user["email"] = primary
        return user

async def fetch_user_repos(access_token: str) -> list:
    """Fetch all repos the user has access to"""
    repos = []
    page = 1
    async with httpx.AsyncClient() as client:
        while True:
            response = await client.get(
                f"{GITHUB_API_URL}/user/repos",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={
                    "per_page": 100,
                    "page": page,
                    "sort": "updated",
                    "type": "all"
                }
            )
            data = response.json()
            if not data or not isinstance(data, list):
                break
            repos.extend(data)
            if len(data) < 100:
                break
            page += 1
    logger.info(f"Fetched {len(repos)} repos from GitHub")
    return repos

async def fetch_repo_prs(
    access_token: str,
    owner: str,
    repo: str,
    state: str = "all"
) -> list:
    """Fetch PRs for a specific repo"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/pulls",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            },
            params={"state": state, "per_page": 30, "sort": "updated"}
        )
        data = response.json()
        if not isinstance(data, list):
            return []
        return data

async def fetch_pr_diff(
    access_token: str,
    owner: str,
    repo: str,
    pr_number: int
) -> str:
    """Fetch the actual diff of a PR — used by AI review engine"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/pulls/{pr_number}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.diff"
            }
        )
        return response.text

async def post_pr_comment(
    access_token: str,
    owner: str,
    repo: str,
    pr_number: int,
    body: str
) -> dict:
    """Post a comment on a PR — used after AI review"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GITHUB_API_URL}/repos/{owner}/{repo}/issues/{pr_number}/comments",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            },
            json={"body": body}
        )
        return response.json()