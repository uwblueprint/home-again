# Technical Debt Report

This document tracks known technical debt items in the Home Again Furniture Bank repository. Each entry is categorized by area and includes affected files, a description of the issue, and recommended remediation.

---

## Project Structure

### `db-init/` Directory Mounted but Effectively Unused

- **File(s)**: `db-init/create-multiple-dbs.sh`, `docker-compose.yml`
- **Description**: The `docker-compose.yml` mounts `./db-init:/docker-entrypoint-initdb.d` in the `db` service, so the directory is actively referenced by the infrastructure. However, the script (`create-multiple-dbs.sh`) only creates additional databases when the `POSTGRES_MULTIPLE_DATABASES` environment variable is set — and `docker-compose.yml` does not set this variable. The script is therefore a no-op in the current configuration.
- **Remediation**: Either set `POSTGRES_MULTIPLE_DATABASES` in `docker-compose.yml` if multiple databases are needed, or remove the `db-init/` volume mount and directory if the single-database setup is sufficient. Retain the directory if multi-database support is planned for future environments.

---

## Frontend Architecture

### Donation Flow Uses Client State Instead of Server Fetch After Submission

- **File(s)**: `frontend/app/donate/[id]/page.tsx`, `frontend/app/donate/context/DonationFormContext.tsx`, `frontend/app/donate/components/StepDonationSummary.tsx`
- **Description**: The donation multi-step wizard stores form data (furniture items, pickup address, household details) in a React context/Zustand store. After the donor is created via POST, the flow navigates to `/donate/[id]` which continues reading from client state rather than fetching the persisted record from the server. This means the summary page data doesn't survive a page refresh and can't be deep-linked. In contrast, the agency intake flow correctly navigates to a server-backed detail page (`/agencies/[id]`) that fetches fresh data via GET.
- **Remediation**: After final donation submission (POST to create the donation record), redirect to a server-backed detail/confirmation page that fetches the created donation by ID — matching the agency flow pattern. Keep client state for the in-progress wizard steps only. This ensures data durability, supports page refresh, and enables deep-linking to the confirmation.
