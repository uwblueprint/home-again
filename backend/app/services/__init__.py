<<<<<<< HEAD
"""Services package.

Business logic layer; API routes depend on services, not the reverse.
"""

from . import admins as admins_service
from . import clients as clients_service

__all__ = ["admins_service", "clients_service"]
