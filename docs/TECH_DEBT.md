# Technical Debt Report

This document tracks known technical debt items in the Home Again Furniture Bank repository. Each entry is categorized by area and includes affected files, a description of the issue, and recommended remediation.

---

## Project Structure

### `db-init/` Directory Mounted but Effectively Unused

- **File(s)**: `db-init/create-multiple-dbs.sh`, `docker-compose.yml`
- **Description**: The `docker-compose.yml` mounts `./db-init:/docker-entrypoint-initdb.d` in the `db` service, so the directory is actively referenced by the infrastructure. However, the script (`create-multiple-dbs.sh`) only creates additional databases when the `POSTGRES_MULTIPLE_DATABASES` environment variable is set — and `docker-compose.yml` does not set this variable. The script is therefore a no-op in the current configuration.
- **Remediation**: Either set `POSTGRES_MULTIPLE_DATABASES` in `docker-compose.yml` if multiple databases are needed, or remove the `db-init/` volume mount and directory if the single-database setup is sufficient. Retain the directory if multi-database support is planned for future environments.
