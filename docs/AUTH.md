# Authentication

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
