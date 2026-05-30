from openai import AsyncOpenAI
from loguru import logger
from src.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """You are an expert code reviewer with deep knowledge of:
- Software architecture and design patterns
- Security vulnerabilities (OWASP Top 10)
- Performance optimization
- Code quality and maintainability
- Testing best practices

Your job is to review pull request diffs and provide structured, actionable feedback.
Always respond in valid JSON format exactly as specified."""

async def review_pull_request(
    diff: str,
    pr_title: str,
    repo_name: str,
    pr_number: int
) -> dict:
    """
    Send PR diff to GPT-4o and get structured review back.
    This is the core AI feature of CodePulse.
    """
    try:
        # Truncate diff if too long (GPT-4o has token limits)
        max_diff_chars = 12000
        if len(diff) > max_diff_chars:
            diff = diff[:max_diff_chars] + "\n\n[Diff truncated due to size...]"

        user_prompt = f"""
Review this pull request and provide structured feedback.

Repository: {repo_name}
PR #{pr_number}: {pr_title}

Diff: Respond ONLY with this exact JSON structure, no extra text:
{{
  "summary": "2-3 sentence overview of what this PR does and overall quality",
  "score": <integer 1-10 representing overall code quality>,
  "issues": [
    {{
      "type": "bug|security|performance|style|maintainability",
      "severity": "critical|high|medium|low",
      "title": "Short issue title",
      "description": "Detailed explanation of the issue",
      "suggestion": "How to fix it",
      "line_hint": "approximate file/line reference if identifiable"
    }}
  ],
  "positives": [
    "Thing done well #1",
    "Thing done well #2"
  ],
  "security_score": <integer 1-10>,
  "performance_score": <integer 1-10>,
  "maintainability_score": <integer 1-10>,
  "recommendation": "approve|request_changes|comment"
}}"""

        logger.info(f"Sending PR #{pr_number} to GPT-4o for review...")

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content
        import json
        review_data = json.loads(raw)

        logger.success(f"AI review complete for PR #{pr_number} — score: {review_data.get('score')}/10")
        return review_data

    except Exception as e:
        logger.error(f"AI review failed: {e}")
        return {
            "summary": "AI review could not be completed.",
            "score": 0,
            "issues": [],
            "positives": [],
            "security_score": 0,
            "performance_score": 0,
            "maintainability_score": 0,
            "recommendation": "comment",
            "error": str(e)
        }


async def generate_review_comment(review_data: dict, pr_number: int) -> str:
    """
    Format the AI review as a markdown comment to post on GitHub.
    """
    score = review_data.get("score", 0)
    score_emoji = "🟢" if score >= 8 else "🟡" if score >= 5 else "🔴"

    rec = review_data.get("recommendation", "comment")
    rec_map = {
        "approve": "✅ APPROVE",
        "request_changes": "❌ REQUEST CHANGES",
        "comment": "💬 COMMENT"
    }

    issues = review_data.get("issues", [])
    severity_emoji = {"critical": "🚨", "high": "🔴", "medium": "🟡", "low": "🔵"}

    issues_text = ""
    if issues:
        for issue in issues:
            emoji = severity_emoji.get(issue.get("severity", "low"), "🔵")
            issues_text += f"""
### {emoji} {issue.get('title', 'Issue')} `{issue.get('severity', '').upper()}`
**Type:** {issue.get('type', 'general')}
**Problem:** {issue.get('description', '')}
**Fix:** {issue.get('suggestion', '')}
"""
    else:
        issues_text = "\n_No significant issues found._\n"

    positives = review_data.get("positives", [])
    positives_text = "\n".join([f"- ✅ {p}" for p in positives]) if positives else "_None noted._"

    comment = f"""## 🤖 CodePulse AI Review

> Automated review powered by GPT-4o

---

### Overall Score: {score_emoji} **{score}/10** | Recommendation: {rec_map.get(rec, rec)}

**Summary:** {review_data.get('summary', '')}

---

### 📊 Scores
| Category | Score |
|---|---|
| Security | {review_data.get('security_score', 0)}/10 |
| Performance | {review_data.get('performance_score', 0)}/10 |
| Maintainability | {review_data.get('maintainability_score', 0)}/10 |

---

### 🐛 Issues Found ({len(issues)})
{issues_text}

---

### 👍 What's Good
{positives_text}

---
_Reviewed by [CodePulse](http://localhost:5173) · AI-powered code review_"""

    return comment