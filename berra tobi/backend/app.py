"""
=========================================================
INTELLIGENCE OSINT ENGINE
BACKEND - APP.PY
MISSION 006
=========================================================
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from services.username import search_username


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="INTELLIGENCE OSINT ENGINE",
    description="Public-source intelligence analysis API.",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
async def root():

    return {
        "name": "INTELLIGENCE OSINT ENGINE",
        "mission": "006",
        "status": "online",
        "version": "1.0.0",
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
async def health():

    return {
        "status": "operational",
        "engine": "INTELLIGENCE OSINT",
    }


# =========================================================
# USERNAME OSINT
# =========================================================

@app.get("/api/username")
async def username_lookup(
    target: str = Query(
        ...,
        min_length=1,
        max_length=100
    )
):

    target = target.strip().lstrip("@")

    if not target:

        raise HTTPException(
            status_code=400,
            detail="Username is required."
        )


    try:

        results = await search_username(
            target
        )


        return {

            "backendReady": True,

            "type": "username",

            "target": target,

            "status": "completed",

            "intelligence": results

        }


    except Exception as error:

        print(
            f"Username lookup error: {error}"
        )

        raise HTTPException(

            status_code=500,

            detail="Username investigation failed."

        )


# =========================================================
# PLACEHOLDER ENDPOINTS
# =========================================================

@app.get("/api/phone")
async def phone_lookup(
    target: str = Query(...)
):

    return {

        "backendReady": True,

        "type": "phone",

        "target": target,

        "status": "provider_pending"

    }


@app.get("/api/email")
async def email_lookup(
    target: str = Query(...)
):

    return {

        "backendReady": True,

        "type": "email",

        "target": target,

        "status": "provider_pending"

    }


@app.get("/api/ip")
async def ip_lookup(
    target: str = Query(...)
):

    return {

        "backendReady": True,

        "type": "ip",

        "target": target,

        "status": "provider_pending"

    }


@app.get("/api/domain")
async def domain_lookup(
    target: str = Query(...)
):

    return {

        "backendReady": True,

        "type": "domain",

        "target": target,

        "status": "provider_pending"

    }


@app.get("/api/location")
async def location_lookup(
    target: str = Query(...)
):

    return {

        "backendReady": True,

        "type": "location",

        "target": target,

        "status": "provider_pending"

    }


# =========================================================
# SYSTEM INFORMATION
# =========================================================

@app.get("/api/system")
async def system_information():

    return {

        "engine": "INTELLIGENCE OSINT",

        "mission": "006",

        "version": "1.0.0",

        "mode": "PUBLIC DATA",

        "status": "OPERATIONAL"

    }