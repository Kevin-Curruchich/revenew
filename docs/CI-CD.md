# CI/CD Guide

This project uses GitHub Actions for continuous integration and continuous deployment to Firebase Hosting.

## Workflows

- `.github/workflows/ci.yml`
  - Trigger: pull requests to `main` and manual dispatch.
  - Runs: dependency install, lint, build/typecheck, optional tests.

- `.github/workflows/deploy-firebase.yml`
  - Trigger: pushes to `main` and manual dispatch.
  - Runs: dependency install, resolves app version from `package.json`, production build, deploy to Firebase Hosting.
  - Deploy message format by default: `release v<package-version> (<short-sha>)`.
  - Manual dispatch supports custom `release_message` input.

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

## Recommended Release Flow

Use this flow every time you want to publish a new production version.

1. Preview the release result without changing files:

```bash
yarn release:dry
```

2. Run one release command depending on change type:

```bash
yarn release:patch
```

```bash
yarn release:feature
```

```bash
yarn release:major
```

3. Push commits and tags to trigger deployment tracking:

```bash
git push origin main --follow-tags
```

### Command reference

- `yarn release:patch`: bugfix release (`x.y.z` -> `x.y.z+1`)
- `yarn release:feature`: feature release (`x.y.z` -> `x.y+1.0`)
- `yarn release:major`: breaking-change release (`x.y.z` -> `x+1.0.0`)
- `yarn release:custom -- <version>`: exact version override
- `yarn release:first`: first release only

## Troubleshooting

- Build fails in CI due to missing envs:
  - Verify all `VITE_*` secrets are configured.
- Deploy fails with auth errors:
  - Verify `FIREBASE_SERVICE_ACCOUNT` JSON is valid.
  - Verify the service account has permissions for the target project.
- App routes return 404 after refresh:
  - Confirm `firebase.json` has the SPA rewrite to `index.html`.
