# Contributing to Quad

Thanks for your interest in contributing to Quad. This document covers the basics to get you started.

## Prerequisites

- Node.js 22+
- pnpm 9+
- Docker and Docker Compose (for Keycloak and Postgres)

## Local setup

```bash
# Clone and install
git clone https://github.com/your-org/quad.git
cd quad
pnpm install

# Start backing services
cd docker
docker compose up -d
cd ..

# Copy env and start dev server
cp apps/web/.env.example apps/web/.env.local
pnpm --filter web dev
```

After Keycloak is up, create a `quad` realm and a `quad-web` client with direct access grants enabled. Then hit `POST http://localhost:3000/api/setup` to configure user profile attributes.

## Project structure

```
apps/
  web/          Next.js app (UI, OIDC provider, API routes)
  api/          NestJS service (planned)
packages/
  shared/       Shared types and utilities
docker/         Docker Compose configs, Caddyfile
docs/           Project documentation
```

## Development workflow

1. Create a branch from `main`
2. Make your changes
3. Test locally (run the dev server, check the feature in browser)
4. Make sure the build passes: `pnpm --filter web build`
5. Open a pull request

## What to work on

Check the open issues for things tagged `good first issue` or `help wanted`. Some areas that could use help:

- Writing SDK examples (Next.js, Express, Flask, etc.)
- Improving test coverage
- Accessibility audit on the UI
- Documentation improvements
- Passkey/WebAuthn support
- TOTP 2FA for reviewers

## Code style

- TypeScript throughout
- Tailwind CSS for styling
- Prefer server components where possible
- No unnecessary abstractions or premature optimization
- Keep PRs focused on a single concern

## Reporting issues

Open an issue with a clear description of the bug or feature request. Include steps to reproduce for bugs.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
