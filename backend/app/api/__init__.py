"""API router registration.

All REST resource routers are mounted under the /api prefix.
Add new routers here after implementing them in app/api/<resource>.py.
"""

from fastapi import APIRouter

from .admins import router as admins_router
from .agencies import router as agencies_router
from .agents import router as agents_router
from .clients import router as clients_router
from .donations import router as donations_router
from .donors import router as donors_router
from .furniture import router as furniture_router
from .referrals import router as referrals_router
from .routes import router as routes_router

router = APIRouter()

router.include_router(admins_router, prefix="/admins", tags=["admins"])
router.include_router(agencies_router, prefix="/agencies", tags=["agencies"])
router.include_router(agents_router, prefix="/agents", tags=["agents"])
router.include_router(donations_router, prefix="/donations", tags=["donations"])
router.include_router(donors_router, prefix="/donors", tags=["donors"])
router.include_router(clients_router, prefix="/clients", tags=["clients"])
router.include_router(furniture_router, prefix="/furniture", tags=["furniture"])
router.include_router(referrals_router, prefix="/referrals", tags=["referrals"])
router.include_router(routes_router, prefix="/routes", tags=["routes"])

__all__ = ["router"]
