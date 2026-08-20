# J.R. Enterprises — Bill Management

Lightweight invoice, quotation, and challan app. No authentication.

## Setup

1. Copy `.env.example` to `.env.local` and add your Supabase **project URL** and **anon key**. Never add a service-role key.
2. In the Supabase SQL editor, run `supabase/migrations/001_create_documents.sql`.
3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

PDF letterheads live in `public/templates/` (`invoice.jpg`, `quotation.jpg`, `challan.jpg`). Overlay coordinates are in `components/pdf/template-config.ts`.

Also run `supabase/migrations/003_create_customers.sql` so customer names can be reused from the dropdown.

Also run `supabase/migrations/004_create_descriptions.sql` so line-item descriptions can be reused from the dropdown. Existing document item text is copied into the list; documents keep that text and are not linked to the catalog.

Regenerate layout previews after changing coordinates:

```bash
npx tsx scripts/preview-pdf.tsx
```

