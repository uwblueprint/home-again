"""Services package.

Business logic layer; API routes depend on services, not the reverse.
"""

from . import clients as clients_service

__all__ = ["clients_service"]
