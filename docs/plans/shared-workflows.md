# Adopt MyWorkflows

## Goal

Integrate timurproko.com with the standard tooling from
https://github.com/timurproko/MyWorkflows without changing site content or the existing GitHub Pages deployment.
The upstream adoption instructions and templates are the source of truth; no workflow implementation is copied locally.

## Current state

- `.github/workflows/pages.yml` builds and publishes the site, preview posters and CV PDF on updates to the default branch.
- No shared delivery caller, standard agent instruction files, bootstrap script or dependency-install bootstrap exists.
- No OpenSpec directory exists; this integration does not introduce one.
- GitHub reports neither `DELIVERY_BOT_APP_ID` nor `DELIVERY_BOT_PRIVATE_KEY` among this repository's configured Actions variables and secrets.
- The read-only `delivery protect` report identifies missing default protection and the delivery workflow event policy.
- Local `.artifacts/` and `.worktrees/` directories are not covered by the committed `.gitignore`.

## Implementation outcomes

### 1. Standard shared integration files

- Copy the upstream `templates/delivery-caller.yml` unchanged to `.github/workflows/delivery.yml`.
- Generate `AGENTS.md` and `CLAUDE.md` with `delivery instructions --apply`; retain the shared template exactly.
- Keep delivery logic in MyWorkflows and keep this repository's site deployment intact.

### 2. Automatic local tooling bootstrap

- Copy the upstream `templates/workflow-bootstrap.mjs` unchanged to `scripts/workflow-bootstrap.mjs`.
- Add `node scripts/workflow-bootstrap.mjs` as the npm `prepare` script, preserving all existing commands and dependencies.
- Keep the package lock consistent if npm changes its root metadata.
- Ignore `.artifacts/` and `.worktrees/` in `.gitignore`.
- No hook framework is currently present; do not introduce one just for bootstrap.

### 3. Site-specific CI gate

- Add a separate CI workflow with a check named exactly `CI required`.
- Validate non-draft contributions and default-branch updates using Node 22 and the committed npm lockfile.
- Build the site, generate preview posters and the CV PDF using Chromium, rebuild with those assets and require a nonempty PDF in the output.
- Keep validation read-only, without Pages publishing credentials or deployment actions; use ordinary `pull_request` events for untrusted site code.
- Ensure failed prerequisite steps cannot produce a successful required gate.

## Targeted validation

- Compare copied files byte-for-byte with the upstream templates and run `delivery instructions`.
- Check npm metadata and the bootstrap script's syntax and CI/skip behavior without altering machine setup unnecessarily.
- Validate workflow syntax and inspect trigger, permission and failure-propagation behavior.
- Run the site build and targeted generation checks for this integration; use GitHub CI for the final complete asset-rendering gate.
- Run `git diff --check` and the final body validator.

## GitHub prerequisites and rollout

The delivery GitHub App must have access to this repository. Configure its App id as the Actions variable
`DELIVERY_BOT_APP_ID` and its private key as the Actions secret `DELIVERY_BOT_PRIVATE_KEY` using GitHub's secure
configuration UI or an existing trusted credential source; never store the private key in this repository or in conversation.
The variable and secret are currently absent; App installation access has not been verified.

Once the workflow files and credentials are available, inspect the standard protection report again and apply missing
protection with the shared command. The built-in policy references `CI required` and `delivery / Delivery check`;
no repository override or central registration is needed. Report any conflicting existing settings rather than replacing them.
Do not activate requirements before their checks are available, to avoid blocking adoption.

The existing deployment workflow remains responsible for publishing the site. This change does not modify MyWorkflows
itself, introduce OpenSpec, add a new hook framework or change the harness's local worktree configuration.
