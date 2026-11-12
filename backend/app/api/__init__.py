"""API router registration.

``router`` requires login. ``public_router`` does not (health, future public forms).
"""

from fastapi import APIRouter, Depends

from ..auth import get_current_user
from .admins import router as admins_router
from .agencies import router as agencies_router
from .agents import router as agents_router
from .clients import router as clients_router
from .donations import public_router as public_donations_router
from .donations import router as donations_router
from .donors import router as donors_router
from .dropoffs import router as dropoffs_router
from .furniture import router as furniture_router
from .health import router as health_router
from .pickups import router as pickups_router
from .referrals import router as referrals_router
from .routes import router as routes_router

# Every route under this router requires a valid Bearer token.
router = APIRouter(dependencies=[Depends(get_current_user)])

router.include_router(admins_router, prefix="/admins", tags=["admins"])
router.include_router(agencies_router, prefix="/agencies", tags=["agencies"])
router.include_router(agents_router, prefix="/agents", tags=["agents"])
router.include_router(clients_router, prefix="/clients", tags=["clients"])
router.include_router(donations_router, prefix="/donations", tags=["donations"])
router.include_router(donors_router, prefix="/donors", tags=["donors"])
router.include_router(dropoffs_router, prefix="/dropoffs", tags=["dropoffs"])
router.include_router(furniture_router, prefix="/furniture", tags=["furniture"])
router.include_router(pickups_router, prefix="/pickups", tags=["pickups"])
router.include_router(referrals_router, prefix="/referrals", tags=["referrals"])
router.include_router(routes_router, prefix="/routes", tags=["routes"])

# No auth — health and anonymous donation submission.
public_router = APIRouter()
public_router.include_router(health_router, tags=["health"])
public_router.include_router(
    public_donations_router, prefix="/api/donations", tags=["donations"]
)

__all__ = ["router", "public_router"]
