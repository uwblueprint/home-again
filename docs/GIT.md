# Git workflow and Jira integration

This guide covers everyday Git commands, when to use them, and how to tie your work to Jira using the work item key in branches, commits, and pull requests.

## Table of contents

- [Best practices](#best-practices)
- [Basics](#basics)
- [Jira integration](#jira-integration)
- [Typical workflow](#typical-workflow)

## Best practices

- **Branch off main**: Create new branches from an up-to-date `main`. Fetch before creating a branch so you're not working from stale history.
- **Include the Jira key** in the branch name, commit messages, and PR title so Jira’s development panel stays linked.
- **Small, atomic commits**: One logical change per commit. Squash or fixup trivial commits before opening a PR.
- **Atomic PRs**: One PR per feature or fix when possible; keep the scope reviewable.
- **When to merge**: After review and approval. Prefer merging your branch into `main` via the PR rather than pushing directly.
- **When to fetch**: Before creating a new branch and before opening or merging a PR so you see the latest remote state.

## Basics

### clone

Get a full copy of the repository on your machine (typically once per machine or workspace).

```bash
git clone <repo-url>
cd <repo-name>
```

### fetch

Update your local view of the remote (e.g. `origin/main`) without changing your working tree or current branch. Use this regularly so you know what’s on the server.

```bash
git fetch origin
```

**When to use**: Before creating a new branch, before merging, or when you want to see if there are new commits on the remote.

### pull

Fetch from the remote and merge into your current branch in one step. Use when you want to update your current branch with the latest from the remote (e.g. before merging your feature branch).

```bash
git pull origin main
```

**When to use**: When you’re on a branch (e.g. your feature branch) and you want it to include the latest changes from `origin/main`.

### checkout / switch

Change which branch you’re on, or restore files. To create a new branch and switch to it:

```bash
git checkout -b <branch-name>
# or
git switch -c <branch-name>
```

**When to use**: When starting new work (create a branch from `main`) or when switching between existing branches.

### branch

List branches or create one. Branch *name* is the label you give (e.g. `feature/HAFB-42/agencies-export`); the branch *ref* (e.g. `refs/heads/feature/HAFB-42/agencies-export`) is how Git refers to it internally.

```bash
git branch              # list local branches
git branch -a           # list all (local + remote)
```

### merge

Integrate another branch into your current branch. Commonly: merge `main` into your feature branch to bring in latest changes, or merge your branch into `main` via a pull request.

**When to merge**: After your PR is approved; the merge is usually done via the host (e.g. GitHub) when you click “Merge.” Locally, you might merge `main` into your branch to update it before that.

## Jira integration

We use Jira for work items. Including the work item key (e.g. `HAFB-42`) in your branch name, commit messages, and PR title links your code to the Jira issue and keeps the Development panel in sync. Use the key in **capitals** (e.g. `HAFB-42`, not `hafb-42`).

### Branch

Use the format: **`<type>/<KEY>/<short-description>`**

- **Types**: `feature`, `bugfix`, `hotfix`, `chore`, etc.
  - **feature** — New functionality or a larger change.
  - **bugfix** — Fix for a bug.
  - **hotfix** — Urgent fix for production.
  - **chore** — Tooling, docs, refactors, or small non-feature work.
- **KEY** — The Jira work item key (e.g. `HAFB-42`).
- **short-description** — Brief, kebab-case description.

Examples:

- `feature/HAFB-42/agencies-export`
- `bugfix/HAFB-17/login-validation`
- `chore/HAFB-99/update-deps`

### Commit

Include the key in the message so Jira links the commit.

- `Add export endpoint (HAFB-42)`

The key must appear in the commit message for Jira (and tools like Bamboo/Bitbucket Pipelines) to link it.

### PR title

Include the key in the pull request title so the PR appears on the Jira issue:

- **Agencies CSV export (HAFB-42)**

At least one of branch name, commit message, or PR title with the key is enough for Jira to link; using all three keeps traceability clear.

## Typical workflow

1. **Fetch** to update your view of the remote: `git fetch origin`
2. **Create a branch** from `main` with the Jira key: `git checkout -b feature/HAFB-42/agencies-export`
3. **Make changes**, then **commit** with the key in the message: `git commit -m "Add export endpoint (HAFB-42)"`
4. **Push** the branch: `git push origin feature/HAFB-42/agencies-export`
5. **Open a PR** with a title that includes the key: e.g. **Agencies CSV export (HAFB-42)**
6. After review, **merge** the PR into `main` (via the host).
