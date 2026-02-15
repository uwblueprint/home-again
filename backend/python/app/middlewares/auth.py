from functools import wraps
from flask import request


def require_authorization_by_role(_roles):
    """
    Development-friendly authorization decorator.

    Current behavior: permissive no-op so the app and tests can run without
    built-in Firebase auth. For Supabase integration, replace the no-op below
    with JWT verification using Supabase's JWT secret/public key or call
    Supabase's user endpoint to validate the token and check the user's role.

    Example integration points:
    - Read `Authorization` header: `auth_header = request.headers.get("Authorization")`
    - Verify token and extract claims, then check role membership against `_roles`.
    """

    def decorator(api_func):
        @wraps(api_func)
        def wrapper(*args, **kwargs):
            # Permissive default: allow requests through. This keeps the starter
            # application usable without Firebase and prepares the codebase for
            # adding Supabase auth later.
            # To integrate Supabase, implement token validation here.
            return api_func(*args, **kwargs)

        return wrapper

    return decorator
