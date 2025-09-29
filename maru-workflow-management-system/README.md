# Maru Workflow (MVP)

This repo powers a minimal workflow system for embryo-ai.co.za: CV intake, assessment, and hiring pipeline with HubSpot sync.

## Prereqs
- Node 18+, pnpm 9+
- Azure Subscription
- HubSpot Private App (scopes: crm.objects.contacts/companies/deals r/w, webhooks)
- PostgreSQL (Azure Flexible Server)

## Quickstart (local)
```bash
pnpm install
cp .env.example .env.local
# set DATABASE_URL and others
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy (outline)

- Provision Azure: Storage, Postgres, App Insights, Key Vault (see `infra/bicep`).
- Create Azure Static Web App (build from `apps/web`).
- Configure env vars/secrets in SWA & Functions (DB url, HubSpot token, B2C).
- Push to `main` – CI will build and deploy.

## Roadmap

- Add Azure AD B2C auth & role gates
- Implement CV upload + blob + parsing function
- HubSpot sync + webhook signature verify
- Applications Kanban UI

---

## Cursor / VS Code — Execution Task List (Phase 0 → 1)

**Phase 0 (Foundation)**
1. **Create repo** `maru-workflow` and paste this scaffold.
2. Run: `pnpm install` → `cp .env.example .env.local` → fill `DATABASE_URL`.
3. `pnpm prisma:generate && pnpm prisma:migrate`.
4. `pnpm dev:web` → verify `/api/health` returns `{ ok: true }`.
5. Provision Azure Postgres + Storage (portal or `infra/bicep`).

**Phase 1 (CV Intake & Parsing)**
6. Add file upload endpoint `POST /api/candidates/:id/cv` (multipart → Blob Storage).
7. Implement stub parser (extract email/name via regex) → persist `CandidateProfile`.
8. Replace stub with **Azure Document Intelligence** client (confidence threshold, fallback path).
9. Build **Assessment Queue** page reading `CandidateProfile` + latest `CvAsset`.
10. Add score slider + tags → save to `Application` when linked to a `Job`.

**Integration (HubSpot minimal)**
11. Create HubSpot Private App; store token in SWA secrets.
12. Add `POST /api/integrations/hubspot/sync` to upsert Contact/Company/Deal (job-level); call on job create.
13. Configure **webhook** to `/api/integrations/hubspot/webhook` and verify signature.

**Auth Hardening (B2C)**
14. Configure user flows in Azure AD B2C; wire token validation middleware; map `role` claim.

---

## Minimal HubSpot Sync Helper (pseudo)

```ts
// apps/web/lib/hubspot.ts (create folder)
export async function upsertDealForJob(job:{id:string; title:string; orgId:string}){
// call HubSpot deals API with custom property maru_job_id
}
```

## Notes

- Brand the landing + dashboard with embryo visuals later.
- Use prod and stg environments aligned to your domains.
- Keep sensitive config in Azure Key Vault and reference from SWA/Functions.

## License

MIT
