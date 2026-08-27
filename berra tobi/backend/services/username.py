"""
=========================================================
INTELLIGENCE OSINT ENGINE
USERNAME SERVICE
Mission 006
=========================================================

Checks publicly accessible profile URLs for supported
platforms.

IMPORTANT:
- This module does not bypass login walls.
- It does not access private accounts.
- A matching username is only a POSSIBLE MATCH.
- A match does not prove account ownership.
=========================================================
"""

import asyncio
import httpx


# =========================================================
# SUPPORTED PUBLIC PLATFORMS
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
# USER AGENT
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


# =========================================================
# CHECK SINGLE PLATFORM
# =========================================================

async def check_platform(
    client: httpx.AsyncClient,
    platform: str,
    url: str
):

    try:

        response = await client.get(
            url,
            headers=HEADERS,
            follow_redirects=True,
            timeout=8.0
        )


        # -------------------------------------------------
        # SUCCESSFUL PUBLIC PAGE
        # -------------------------------------------------

        if response.status_code == 200:

            return {

                "platform": platform,

                "status": "possible_match",

                "url": str(response.url),

                "http_status": response.status_code

            }


        # -------------------------------------------------
        # NOT FOUND
        # -------------------------------------------------

        if response.status_code == 404:

            return {

                "platform": platform,

                "status": "not_found",

                "url": url,

                "http_status": response.status_code

            }


        # -------------------------------------------------
        # BLOCKED / RATE LIMITED / RESTRICTED
        # -------------------------------------------------

        if response.status_code in (
            401,
            403,
            429
        ):

            return {

                "platform": platform,

                "status": "unavailable",

                "url": url,

                "http_status": response.status_code

            }


        # -------------------------------------------------
        # OTHER RESPONSE
        # -------------------------------------------------

        return {

            "platform": platform,

            "status": "unknown",

            "url": url,

            "http_status": response.status_code

        }


    except httpx.TimeoutException:

        return {

            "platform": platform,

            "status": "timeout",

            "url": url

        }


    except httpx.RequestError:

        return {

            "platform": platform,

            "status": "connection_error",

            "url": url

        }


# =========================================================
# USERNAME SEARCH
# =========================================================

async def search_username(username: str):

    username = username.strip().lstrip("@")

    if not username:

        return {

            "username": username,

            "results": []

        }


    results = []


    async with httpx.AsyncClient() as client:

        tasks = []


        for platform, template in PLATFORMS.items():

            url = template.format(
                username=username
            )


            tasks.append(
                check_platform(
                    client,
                    platform,
                    url
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