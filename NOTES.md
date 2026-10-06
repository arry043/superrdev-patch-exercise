# Patch Notes

## Summary of changes

**Bug 1 — SQL operator precedence (critical, all layers).** The `WHERE` clause across `TaskRepository.java`, `search_tasks.sql`, and `task_search_package.sql` was missing parentheses around the `OR` condition. Because `AND` binds tighter than `OR`, the query evaluated as `(archived=FALSE AND title LIKE term) OR (description LIKE term AND status=…)` — meaning a description match bypassed both the archived filter and the status filter. Fixed by wrapping the `OR` in parentheses.

**Bug 2 — Artificial `Thread.sleep` in controller.** `TaskController` slept up to 1 second per request based on query length. Removed it — the "complexity" log is kept but the sleep is not.

**Bug 3 — Unhandled `IllegalArgumentException` on invalid status.** Passing `?status=INVALID` threw an uncaught `valueOf()` exception, returning a 500. Wrapped in try/catch to return a 400 with a helpful message.

**Bug 4 — Negative/zero page crashes.** `page=0` caused `subList(-10, 0)` → `IllegalArgumentException` → 500. Added `Math.max(1, page)` sanitization.

**Bug 5 — Frontend: loading stuck on error.** `useTasks` never called `setLoading(false)` in the `.catch()` path, so after any API error the UI showed "Loading tasks…" forever. Fixed.

**Bug 6 — Frontend: no debounce on search.** Every keystroke fired an API call instantly, amplified by the (now-removed) sleep. Added a 300ms debounce with stale-request cancellation.

**Bug 7 — Frontend: page not reset on filter change.** Changing query or status while on page 3+ could show empty results. Page now resets to 1 on filter change.

## What I chose not to change

- **No schema changes** — adding indexes on `LOWER(title)` or `status` would help at scale but is out of scope for a patch.
- **No server-side pagination** — the repository loads all matching rows then slices in Java. A proper fix would use `LIMIT`/`OFFSET` at the SQL level, but that's a larger refactor.
- **No CSS/UI overhaul** — the styles are functional; cosmetic changes are low-value relative to the data-correctness bugs.

## Biggest remaining risk

**Full-table scan with in-memory pagination.** `searchTasks()` returns `List<Task>` (all rows), then `TaskController` slices it. With thousands of rows this will cause memory pressure and slow queries. The fix is to push pagination into the SQL query (Spring `Pageable` or native `LIMIT/OFFSET`).

## Tools/AI used

Used Claude (Antigravity IDE) to assist with code review, fix generation, and test verification. All bugs were identified by reading the source code and testing with curl. Docker was used to run the Java backend without installing Java locally.
