# Verification

Verified on Windows with Python 3.12 and Node.js 24.

| Check | Result |
| --- | --- |
| Backend, frontend, and ML laboratory dependencies | Installed |
| Backend infrastructure tests | 31 passed |
| Frontend API and page tests | 11 passed |
| Live frontend API client → FastAPI → SQLite | 1 passed; temporary database and server |
| Python Ruff lint | Passed |
| Frontend ESLint | Passed, no warnings |
| TypeScript | Passed |
| Next.js production build | Passed; all six application pages prerendered |
| Backend startup and `/health` | Passed |
| SQLite table initialization and persistence | Passed |
| Unimplemented inference and training | HTTP 501 structured errors; no saved predictions or registered models |
| Notebook schema validation | Six valid notebooks; empty code cells |
| Student ownership audit | 94 markers; all ML functions remain raising stubs |
| Final tree and grouped student TODO inventory | Printed and saved in `STUDENT_TODO_INVENTORY.md` |
| Browser review | Production dashboard renders with live zero-ticket state; classification form and navigation verified; no browser errors observed |

The live integration script uses the production TypeScript API client, creates and labels a ticket, verifies both ML development-error responses, checks blocked run persistence and empty metadata lists, then deletes its test ticket and shuts down the temporary server. Windows sandbox restrictions required running the test worker and full server cleanup outside the sandbox. No restrictions were disabled in the application.

The backend tests use fixed mocks only to exercise the classifier protocol, artifact paths, registry replacement, startup restoration, and rejection of invalid output. They contain no ML algorithms and do not provide expected answers for student algorithm tests.

The initial Python dependency download failed; a clean reinstall of pinned ML laboratory versions completed successfully. Backend tests were rerun after that reinstall. An early lint command included a disposable dependency cache; subsequent linting is scoped to authored source directories and cache folders are explicitly excluded.

The dependency audit reports five high-severity development dependency entries in the `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces` chain (one underlying advisory). npm suggests downgrading the Next lint configuration as a breaking change. This remains recorded rather than forcing a mismatched framework lint configuration. The reported Vitest and production PostCSS issues were addressed by updating Vitest and overriding PostCSS with a patched compatible version. The remaining advisory concerns lint-time glob patterns; do not use untrusted glob input in lint tooling.

One upstream Starlette/AnyIO deprecation warning occurs during backend tests; it does not affect the passing results.

V1 limitations are documented in `ARCHITECTURE.md`: local single-process use, synchronous training, no authentication, latest prediction stored on each ticket, student-owned evaluation and artifacts. ML implementation is intentionally unfinished.
