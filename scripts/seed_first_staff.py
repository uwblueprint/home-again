#!/usr/bin/env python3
"""Create or update the first HAFB staff account in Supabase.

Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the process environment,
then run, for example:

    python scripts/seed_first_staff.py --email staff@example.org \
        --first-name Alex --last-name Smith --phone 709-555-0100

Run this only against the intended Supabase project. The service role key must
stay on the operator's machine; it must never be passed to frontend code.
This creates an email-confirmed Auth user without a password or invitation;
the project's sign-in or password setup flow must handle initial access.
"""


"""
Note: the official API reference can be found here - https://supabase.com/docs/reference/python/auth-admin-createuser
However, this script directly calls the HTTP endpoints documented here - https://supabase.com/docs/reference/self-hosting-auth
This was done to avoid adding dependencies, as we would otherwise need to introduce the supabase Python SDK
"""


import argparse
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class SeedError(Exception):
    """A failure that can be reported without a Python traceback."""


def request_json(base_url, key, method, path, *, params=None, body=None, prefer=None):
    url = base_url.rstrip("/") + path
    if params:
        url += "?" + urlencode(params)
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    data = None
    if body is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode("utf-8")

    try:
        with urlopen(Request(url, data=data, headers=headers, method=method), timeout=20) as response:
            payload = response.read()
            return json.loads(payload) if payload else None
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SeedError(f"{method} {path} failed (HTTP {exc.code}): {detail}") from exc
    except (URLError, TimeoutError) as exc:
        raise SeedError(f"{method} {path} failed: {exc.reason if isinstance(exc, URLError) else exc}") from exc
    except json.JSONDecodeError as exc:
        raise SeedError(f"{method} {path} returned invalid JSON") from exc


def find_auth_user(base_url, key, email):
    """The admin API lists users by page; search every page for an exact email."""
    page = 1
    per_page = 100
    while True:
        result = request_json(
            base_url, key, "GET", "/auth/v1/admin/users",
            params={"page": page, "per_page": per_page},
        )
        users = result.get("users") if isinstance(result, dict) else None
        if not isinstance(users, list):
            raise SeedError("Supabase returned an unexpected user-list response")
        for user in users:
            user_email = user.get("email")
            if isinstance(user_email, str) and user_email.casefold() == email.casefold():
                return user
        if len(users) < per_page:
            return None
        page += 1


def get_admin_row(base_url, key, column, value):
    # Match the whole email without treating punctuation as pattern operators.
    # Unlike ILIKE, imatch does not give '*', '%' or '_' wildcard semantics.
    filter_value = f"imatch.^{re.escape(value)}$" if column == "email" else f"eq.{value}"
    result = request_json(
        base_url, key, "GET", "/rest/v1/admins",
        params={"select": "id,email,supabase_user_id", column: filter_value, "limit": 2},
    )
    if not isinstance(result, list):
        raise SeedError("Supabase returned an unexpected admins response")
    if len(result) > 1:
        raise SeedError(f"More than one admins row matches {column}; resolve this manually")
    return result[0] if result else None


def seed_staff(base_url, key, email, first_name, last_name, phone):
    metadata = {"first_name": first_name, "last_name": last_name}
    user = find_auth_user(base_url, key, email)

    # Validate existing links before creating a user or changing Auth metadata.
    user_id = user.get("id") if user else None
    if user is not None and not user_id:
        raise SeedError("Supabase returned an Auth user without an ID")
    by_email = get_admin_row(base_url, key, "email", email)
    by_user = get_admin_row(base_url, key, "supabase_user_id", user_id) if user_id else None
    if by_user and by_email and by_user["id"] != by_email["id"]:
        raise SeedError("Email and Auth user ID belong to different admins rows; resolve this manually")
    if by_email and by_email.get("supabase_user_id") not in (None, "", user_id):
        raise SeedError("The admins row for this email is linked to a different Auth user; resolve this manually")
    row = by_user or by_email

    if user is None:
        user = request_json(
            base_url, key, "POST", "/auth/v1/admin/users",
            body={"email": email, "email_confirm": True, "user_metadata": metadata},
        )
        action = "Created"
    else:
        user = request_json(
            base_url, key, "PUT", f"/auth/v1/admin/users/{user['id']}",
            body={"user_metadata": {**(user.get("user_metadata") or {}), **metadata}},
        )
        action = "Updated"

    user_id = user.get("id") if isinstance(user, dict) else None
    if not user_id:
        raise SeedError("Supabase did not return an Auth user ID")

    now = datetime.now(timezone.utc).isoformat()
    fields = {
        "supabase_user_id": user_id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "phone_number": phone,
        "updated_at": now,
    }
    if row:
        request_json(
            base_url, key, "PATCH", "/rest/v1/admins",
            params={"id": f"eq.{row['id']}"}, body=fields,
        )
    else:
        request_json(
            base_url, key, "POST", "/rest/v1/admins",
            body={"id": str(uuid.uuid4()), "created_at": now, **fields},
        )
    return action, user_id, "updated" if row else "created"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True, help="Staff email address")
    parser.add_argument("--first-name", required=True)
    parser.add_argument("--last-name", required=True)
    parser.add_argument("--phone", required=True, help="Phone number for the admins row")
    args = parser.parse_args()

    email = args.email.strip().lower()
    first_name = args.first_name.strip()
    last_name = args.last_name.strip()
    phone = args.phone.strip()
    if not email or "@" not in email or len(email) > 255:
        parser.error("--email must be a valid email address of at most 255 characters")
    if not first_name or len(first_name) > 100:
        parser.error("--first-name must be 1–100 characters")
    if not last_name or len(last_name) > 100:
        parser.error("--last-name must be 1–100 characters")
    if not phone or len(phone) > 20:
        parser.error("--phone must be 1–20 characters")

    base_url = os.environ.get("SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not base_url or not key:
        parser.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment")
    if not base_url.startswith(("https://", "http://localhost:", "http://127.0.0.1:")):
        parser.error("SUPABASE_URL must be HTTPS (or a local Supabase URL)")

    try:
        action, user_id, row_action = seed_staff(
            base_url, key, email, first_name, last_name, phone
        )
    except SeedError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    print(f"{action} Supabase Auth user {user_id}; {row_action} admins row for {email}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
