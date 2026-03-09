"""Services package.

Business logic layer; API routes depend on services, not the reverse.
"""

from . import furniture as furniture_service
from . import clients as clients_service

__all__ = ["furniture_service", "clients_service"]
