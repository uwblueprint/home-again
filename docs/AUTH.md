# Authentication

## Local development without a token

With `ENV=DEVELOPMENT` in `backend/.env`, requests that send no bearer token act as `DEV_USER_ID` instead of returning 401, so the API works locally before sign-in exists. Tokens that are sent are still verified, and the backend refuses to start in this mode unless `DEBUG=True`. See [ONBOARDING.md](./ONBOARDING.md#authentication-in-local-development).

## Current user: `GET /api/me`

Returns who the signed-in user is so the frontend can route them after login. It requires a valid bearer token, or acts as `DEV_USER_ID` in local development (see above). The backend looks up the token's Supabase user ID in `admins.supabase_user_id` first, then `agents.supabase_user_id`.

### `200 OK`

```json
{
  "role": "agent",
  "id": "3f6c1e0a-…",
  "email": "alex@agency.org",
  "first_name": "Alex",
  "last_name": "Agent",
  "agency_id": "9b2d4c7e-…",
  "is_agency_admin": true,
  "intake_complete": true
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `role` | `"staff"` \| `"agent"` | `"staff"` when the user has an `admins` row, otherwise `"agent"` |
| `id` | string (UUID) | The `admins.id` or `agents.id`, **not** the Supabase Auth user ID |
| `email` | string | From the `admins` or `agents` row |
| `first_name` | string | |
| `last_name` | string | |
| `agency_id` | string (UUID) \| `null` | `null` for staff, and for a main contact who hasn't finished intake |
| `is_agency_admin` | boolean | `agents.is_admin`; always `false` for staff |
| `intake_complete` | boolean | Whether the user's agency exists; always `false` for staff, so route on `role` first |

### Errors

| Status | When | `detail` |
| --- | --- | --- |
| `401` | No token, or the token is invalid/expired | `"Missing bearer token"`, `"Invalid token"`, … |
| `403` | Valid token, but no `admins` or `agents` row is linked to that user | `"No Home Again account is linked to this login. Contact Home Again Furniture Bank for access."` |

A main contact who hasn't finished intake has an `agents` row with no agency yet, so they get a `200` with `role: "agent"`, `agency_id: null` and `intake_complete: false`; send them to intake. The frontend should show a "contact HAFB" message for any `403` from this endpoint.

To try it locally without a token, set `DEV_USER_ID` to the `supabase_user_id` of an `admins` or `agents` row; otherwise the dev user gets the `403`.

## Create the first staff account

Use [`scripts/seed_first_staff.py`](../scripts/seed_first_staff.py) to create the first HAFB staff account in **hafb-dev**, before another staff member is available to invite them. The script finds or creates a Supabase Auth user and creates or updates the linked `admins` row. The row's `supabase_user_id` contains the Auth user ID; its own `id` is separate.

### Prerequisites

- Python 3. The script uses the standard library and requires no package installation.
- The hafb-dev Supabase project URL and service role key.
- The application's migrations applied to that project, with the `admins` table available through the Supabase Data API and readable/writable by the service role.

The script connects directly to Supabase, so the frontend, FastAPI server, and local Docker database do not need to be running. Verify that the URL and key belong to **hafb-dev**: the supplied environment variables determine the target, and the script does not enforce a specific project.

### Configure the environment

From the repository root, create an untracked `scripts/.env` file containing:

```dotenv
SUPABASE_URL='https://YOUR_HAFB_DEV_PROJECT_REF.supabase.co'
SUPABASE_SERVICE_ROLE_KEY='YOUR_HAFB_DEV_SERVICE_ROLE_KEY'
```

Replace the placeholders with the project's actual values. `scripts/.env` is ignored by Git. Keep the real service role key out of commits, screenshots, and frontend configuration, including `NEXT_PUBLIC_*` variables. The script expects the service role key rather than the anon key or the backend's generic `SUPABASE_KEY` variable.

The script reads process environment variables; it does not load `.env` files automatically. Use the dedicated script env file to keep these credentials separate from the backend application's settings.

### Run the script

Run this command from the repository root using a POSIX-compatible shell such as bash or zsh:

```sh
(
  set -a
  . ./scripts/.env || exit 1
  set +a
  python3 scripts/seed_first_staff.py \
    --email staff@example.org \
    --first-name Alex \
    --last-name Smith \
    --phone '709-555-0100'
)
```

The subshell loads and exports the credentials for this run without leaving them exported in the current shell. If the variables are already exported by your environment, run the `python3` command directly.

All four arguments are required:

| Argument | Purpose | Validation |
| --- | --- | --- |
| `--email` | Staff email address | Trimmed, lowercased, must contain `@`, at most 255 characters; Supabase performs further validation |
| `--first-name` | Staff first name | 1–100 characters after trimming |
| `--last-name` | Staff last name | 1–100 characters after trimming |
| `--phone` | Required `admins.phone_number` value | 1–20 characters after trimming; no phone format validation |



Successful output resembles:

```text
Created Supabase Auth user <user-id>; created admins row for staff@example.org.
```

In the hafb-dev Supabase dashboard, verify that the email appears in Auth users and that the `admins` row has the same Auth user ID in `supabase_user_id`, along with the supplied name and phone number.

### Reruns and conflicts

Rerunning with the same email reuses the Auth user and admin row, preserving their IDs. Email lookups ignore case. The script updates the first and last names in Auth metadata and updates the name, email, and phone number in the admin row. Other existing Auth metadata is preserved. An existing admin row with an empty Auth link can be linked to the selected user.

The script stops before changing Auth data if it finds multiple admin rows matching the email, if the email and Auth user ID match different admin rows, or if the email-matched row already links to a different Auth user. Inspect those records and establish the correct account relationship before correcting the data and rerunning.

Run one instance at a time. Lookups and writes are separate requests, so the script does not guarantee safe concurrent execution.

### Failures and recovery

Auth creation and the admin table write are separate operations. If Auth creation succeeds but the table write fails, the Auth user remains. Correct the reported error and rerun with the same email; the existing Auth user will be reused.

- Missing configuration or invalid arguments exit with status `2`.
- API, network, or detected conflict errors exit with status `1` and print a message to standard error.
- Successful runs exit with status `0`.

For access or table errors, check that the credentials belong to the intended project, its migrations are applied, and its Data API permits the required table operations.

### Initial sign-in

New Auth users are marked email-confirmed, but the script sets no password and sends no invitation. Initial access requires a separately configured sign-in or password setup flow. The `admins` row identifies HAFB staff in application data; the script does not implement application login or authorization checks, or give the staff user the service role key.

### API references

The script calls the HTTP APIs directly to avoid introducing a Supabase Python SDK dependency.

- [Auth HTTP API reference](https://supabase.com/docs/reference/self-hosting-auth), labeled Self-Hosting Auth: documents `GET /admin/users`, `POST /admin/users`, and `PUT /admin/users/{user_id}`. The script calls them under the project's `/auth/v1` prefix.
- [Supabase Auth OpenAPI specification](https://github.com/supabase/auth/blob/master/openapi.yaml): request and response schemas.
- [Supabase Data REST API](https://supabase.com/docs/guides/api): the API used to access the `admins` table under `/rest/v1/admins`.
- [PostgREST table reference](https://docs.postgrest.org/en/stable/references/api/tables_views.html): filtering, inserts, and updates used by the Data API.
