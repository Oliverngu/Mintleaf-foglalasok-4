# MintLeaf Legacy Before

Historical baseline: `3e73da9c62dcf35b3c68debf06ce11a1c06dd6cc` (first successful preview).

This branch preserves the old UI for before/after comparison. Open `/` to enter the fictional manager dashboard directly. The scheduler includes five staff members, published and draft shifts, and a leave request. Reservations include confirmed and pending bookings. Dates follow the current week (previous week through two weeks ahead).

All Firebase module imports resolve to local adapters. Both Firebase configuration entrypoints contain no real project configuration. Authentication, storage and AI integrations are local stubs; email already uses the historical mock provider. The production frontend bundle contains no production Firebase project or endpoints. The backend is not required and must not be deployed for this demo.

Edits affect only memory and reset on reload. Unit selection uses a separate legacy storage key and discards stale unit IDs. The amber banner identifies fictional data and reset behavior. Historical Tailwind/SheetJS CDN dependencies remain for presentation/export; this is database-isolated, not a fully offline package.

Build: `npm install && npm run build`. Publish only `dist/` as a static site with SPA fallback. No Firebase credentials, Render backend, or database variables are needed. Use branch `demo/legacy-before` for a separate comparison preview.

Validation: production Vite build PASS; DOM runtime smoke test PASS for dashboard, populated published schedule, draft schedule controls, and reservations calendar (three fictional bookings per seeded day); no runtime errors. Full browser visual QA was unavailable because browser download failed.
