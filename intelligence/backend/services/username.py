"""
=========================================================
INTELLIGENCE OSINT ENGINE
USERNAME INTELLIGENCE SERVICE
MISSION 006
=========================================================

Checks publicly accessible profile URLs.

IMPORTANT:
A profile URL returning successfully is only a
POSSIBLE MATCH. It does NOT establish identity or
ownership of an account.

This service does not:
- bypass authentication
- access private accounts
- scrape private information
- attempt to defeat platform protections
=========================================================
"""

import asyncio
import re

import httpx


# =========================================================
# PUBLIC PROFILE URLS
# =========================================================

PLATFORMS = {
    "X": "https://x.com/{username}",
    "Instagram": "https://www.instagram.com/{username}/",
    "Facebook": "https://www.facebook.com/{username}",
    "TikTok": "https://www.tiktok.com/@{username}",
    "Reddit": "https://www.reddit.com/user/{username}/",
    "GitHub": "https://github.com/{username}",
    "LinkedIn": "https://www.linkedin.com/in/{username}/",
    "YouTube": "https://www.youtube.com/@{username}",
    "Pinterest": "https://www.pinterest.com/{username}/",
    "Twitch": "https://www.twitch.tv/{username}",
}


# =========================================================
# REQUEST SETTINGS
# =========================================================

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/131.0 Safari/537.36"
    )
}

REQUEST_TIMEOUT = 8.0


# =========================================================
# USERNAME VALIDATION
# =========================================================

def clean_username(username: str) -> str:

    username = username.strip()

    # Remove a leading @ if supplied.
    username = username.lstrip("@")

    # Remove accidental spaces.
    username = username.replace(" ", "")

    return username


def valid_username(username: str) -> bool:

    if not username:
        return False

    if len(username) > 100:
        return False

    return bool(
        re.fullmatch(
            r"[A-Za-z0-9._-]+",
            username
        )
    )


# =========================================================
# CHECK ONE PLATFORM
# =========================================================

async def check_platform(
    client: httpx.AsyncClient,
    platform: str,
    profile_url: str
):

    try:

        response = await client.get(
            profile_url,
            headers=HEADERS,
            follow_redirects=True,
            timeout=REQUEST_TIMEOUT
        )


        # -------------------------------------------------
        # POSSIBLE PUBLIC PROFILE
        # -------------------------------------------------

        if response.status_code == 200:

            return {
                "platform": platform,
                "status": "possible_match",
                "url": str(response.url),
                "http_status": response.status_code,
                "confidence": "low"
            }


        # -------------------------------------------------
        # PROFILE NOT FOUND
        # -------------------------------------------------

        if response.status_code == 404:

            return {
                "platform": platform,
                "status": "not_found",
                "url": profile_url,
                "http_status": response.status_code,
                "confidence": "none"
            }


        # -------------------------------------------------
        # PLATFORM DID NOT ALLOW THE REQUEST
        # -------------------------------------------------

        if response.status_code in (
            401,
            403,
            429
        ):

            return {
                "platform": platform,
                "status": "unavailable",
                "url": profile_url,
                "http_status": response.status_code,
                "confidence": "unknown"
            }


        # -------------------------------------------------
        # OTHER RESPONSE
        # -------------------------------------------------

        return {
            "platform": platform,
            "status": "unknown",
            "url": profile_url,
            "http_status": response.status_code,
            "confidence": "unknown"
        }


    except httpx.TimeoutException:

        return {
            "platform": platform,
            "status": "timeout",
            "url": profile_url,
            "confidence": "unknown"
        }


    except httpx.RequestError:

        return {
            "platform": platform,
            "status": "connection_error",
            "url": profile_url,
            "confidence": "unknown"
        }


# =========================================================
# USERNAME INVESTIGATION
# =========================================================

async def search_username(username: str):

    username = clean_username(username)


    if not valid_username(username):

        return {
            "username": username,
            "total_platforms_checked": 0,
            "possible_matches": 0,
            "results": [],
            "error": (
                "Invalid username. Use letters, numbers, "
                "dots, underscores or hyphens."
            )
        }


    async with httpx.AsyncClient() as client:

        tasks = []


        for platform, template in PLATFORMS.items():

            profile_url = template.format(
                username=username
            )

            tasks.append(
                check_platform(
                    client,
                    platform,
                    profile_url
                )
            )


        results = await asyncio.gather(
            *tasks
        )


    possible_matches = [
        result
        for result in results
        if result["status"] == "possible_match"
    ]


    return {

        "username": username,

        "total_platforms_checked":
            len(results),

        "possible_matches":
            len(possible_matches),

        "results":
            results

    }