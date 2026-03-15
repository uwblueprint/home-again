"""Services package.

Business logic layer; API routes depend on services, not the reverse.
"""

from . import routes as route_service

__all__ = ["route_service"]
