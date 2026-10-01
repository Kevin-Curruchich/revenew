# CI/CD Guide

This project uses GitHub Actions for continuous integration and continuous deployment to Firebase Hosting.

## Workflows

- `.github/workflows/ci.yml`
  - Trigger: pull requests to `main` and manual dispatch.
  - Runs: dependency install, lint, build/typecheck, optional tests.

- `.github/workflows/release.yml`
  - Trigger: every push to `main` (i.e. every merged PR) and manual dispatch.
  - Runs `standard-version` to bump `package.json`, update `CHANGELOG.md` and create the `v<version>` tag, pushes them to `main`, deploys that tag to Firebase Hosting and publishes the GitHub Release with the changelog section as notes.
  - Release commit format: `chore(release): <version> [skip ci]`.
  - Manual dispatch accepts `release_as` (`auto`, `patch`, `minor`, `major`) to force the bump type.

- `.github/workflows/deploy-firebase.yml`
  - Reusable deploy job (`workflow_call` with a `ref`), called by `release.yml` for production.
  - Also runs on manual dispatch (with optional `release_message`) and on PRs labeled `deploy`.
  - Deploy message format by default: `release v<package-version> (<short-sha>)`.

## Required GitHub Secrets

Set these in `Settings > Secrets and variables > Actions`.

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL`
- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_PROJECT_ID`
- `RELEASE_TOKEN` (optional): only needed if `main` is protected and `GITHUB_TOKEN` cannot push to it. Use a fine-grained PAT or GitHub App token with `contents: write` that is allowed to bypass the protection.

## Service Account for Deployment

Create a service account in Google Cloud for your Firebase project and grant hosting deploy permissions.

1. Go to Google Cloud Console for your Firebase project.
2. Open `IAM & Admin > Service Accounts`.
3. Create a service account and grant a role that can deploy hosting.
4. Create a JSON key and store its full JSON content in the `FIREBASE_SERVICE_ACCOUNT` GitHub secret.

## Local Environment Variables

Use `.env` locally and keep it untracked. Use `.env.example` as the template of required variables.

## Branch Protection (recommended)

Protect `main` and require the CI workflow status check before merge.

## Release Flow

Releases are automatic: merge a PR into `main` and `release.yml` takes care of the version, changelog, tag, deploy and GitHub Release.

The bump type comes from the [Conventional Commits](https://www.conventionalcommits.org) since the last tag:

| Commits since last release | Bump |
| --- | --- |
| at least one `feat:` or breaking change (`feat!:`, `BREAKING CHANGE:`) | minor (`0.9.0` -> `0.10.0`) |
| anything else (`fix:`, `refactor:`, `docs:`, ...) | patch (`0.9.0` -> `0.9.1`) |

A major bump is never automatic: run the **Release** workflow manually with `release_as: major`.

Keep commit messages (or squash-merge PR titles) conventional; plain merge commits are ignored when building the changelog.

### Local commands

Still available to preview or to release by hand:

- `yarn release:dry`: preview the next version and changelog without changing files.
- `yarn release:patch` / `yarn release:feature` / `yarn release:major` / `yarn release:custom -- <version>`.

If you release by hand, push with `git push origin main --follow-tags`: the workflow sees the commit is already tagged, skips the bump and only deploys and publishes the GitHub Release.

## Troubleshooting

- Release job fails pushing to `main`:
  - `main` is protected; configure the `RELEASE_TOKEN` secret (see above).

- Build fails in CI due to missing envs:
  - Verify all `VITE_*` secrets are configured.
- Deploy fails with auth errors:
  - Verify `FIREBASE_SERVICE_ACCOUNT` JSON is valid.
  - Verify the service account has permissions for the target project.
- App routes return 404 after refresh:
  - Confirm `firebase.json` has the SPA rewrite to `index.html`.
