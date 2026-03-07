"""Services package.

Business logic layer; API routes depend on services, not the reverse.
"""

from . import admins as admins_service

__all__ = ["admins_service"]
