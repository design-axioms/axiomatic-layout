# Contributing to Axiomatic

Read [the CSS-first axioms](research/CSS-FIRST-AXIOMS.md) before changing layout,
primitives, examples, or inspection. The current public site is an exploration;
the library API and general spacing algebra remain open.

## Make changes through a pull request

Create a branch from the latest `main` (Codex branches use `wycats/`), make a
focused change, and open a ready pull request. Explain why it matters and what
evidence supports the resulting behavior. The PR template provides that shape.

Use the Node version in `.node-version` and pnpm version in `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm format:check
pnpm test
pnpm docs:build
```

The `CI` workflow runs these checks on every PR, including documentation-only
changes. Its `Validate` check is required by the active `main` ruleset. The PR
must be up to date with `main`, and review conversations must be resolved.
Direct pushes, branch deletion, and force pushes are blocked; no actors have a
bypass. GitHub Actions is the required check's source.

Request Codex review and address its findings before merging. Agent-authored
review threads may be resolved after the issue is conclusively fixed. Obtain
Yehuda's approval before merging. The ruleset requires a PR but does not impose
an approving-review count: the owner cannot approve a PR they authored, and
Codex's comment review is not a GitHub approval. Codex review and the owner's
merge approval are explicit workflow obligations in addition to enforced CI.

## Preserve local material and hosted data

Original conversations in `history/`, private review records, and `.local/`
evidence remain outside the repository. The pinned reader tarball under
`documentation/vendor/` lets a clean checkout build without the original reader
workspace. Missing source-view links to local history/review records are known
build warnings; guide and playground routes must still work.

Production deployment remains an explicit action using the
[static deployment procedure](README.md#publish-the-static-site). PR checks do
not have deployment credentials or publish the site. Validate existing hosted
drafts, older snapshot links, and the guide handoff after playground releases.
