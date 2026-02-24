"""Services package.

Business logic layer; API routes depend on services, not the reverse.
"""

from . import furniture as furniture_service

__all__ = ["furniture_service"]
