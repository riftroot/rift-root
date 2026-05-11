<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# i was thinking the exact same thing can you help me make a plan to use mercury api and cf stack to make something from the start that takes 5 minutes instead of 4 hours to migrate to quickbooks

This is a good systems design problem. Here's the plan -- the whole thing runs on your existing CF stack and the migration is literally one Worker endpoint that spits out a pre-formatted QuickBooks CSV.

## The Core Insight

Mercury already exports a native **QuickBooks CSV** directly from the dashboard. So your job is not to reinvent the format -- it's to store your transactions in a schema that *matches* that format from day one, enriched with your own metadata on top. Migration then becomes calling one endpoint.[^1]

## The Stack

**D1 as the ledger.** SQLite on Cloudflare Workers with near-zero latency and zero infrastructure maintenance. You get a single `transactions` table and a `categories` table. Schema:[^2][^3]

```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,          -- Mercury transaction ID (idempotency key)
  created_at TEXT NOT NULL,     -- ISO 8601, from Mercury API
  posted_at TEXT,
  amount REAL NOT NULL,         -- positive = credit, negative = debit
  counterparty TEXT,            -- vendor/client name
  description TEXT,             -- Mercury memo field
  category TEXT,                -- your QB-compatible category label
  type TEXT,                    -- 'income' | 'expense' | 'owner_draw' | 'owner_contribution'
  invoice_ref TEXT,             -- optional link to your SOW/invoice number
  reviewed INTEGER DEFAULT 0    -- 0 = needs review, 1 = confirmed
);
```

That schema maps directly to QuickBooks' 4-column CSV import format (Date, Description, Amount, Category) with zero transformation needed.[^4][^5]

## The Workers

Three Workers cover the whole system. First, a **nightly sync Worker** -- cron triggered, hits the Mercury `/transactions` endpoint, upserts by `id` so it's fully idempotent, skips anything already in D1. Second, a **review Worker** -- a dead-simple authenticated JSON API so you can hit it from a terminal or a Raycast script to flag `reviewed = 0` rows and set categories. Third, an **export Worker** -- one GET request returns a QuickBooks-ready CSV with columns in the exact format QBO expects: `Date,Description,Amount,Category` with dates in `MM/DD/YYYY`, no currency symbols.[^6][^5]

## The QB Export Endpoint

The export Worker does exactly one SQL query and one string transform:

```typescript
const rows = await db.prepare(`
  SELECT posted_at, counterparty || ' - ' || description, amount, category
  FROM transactions
  WHERE reviewed = 1
  ORDER BY posted_at ASC
`).all();

const csv = ["Date,Description,Amount,Category",
  ...rows.results.map(r => 
    `${formatDate(r.posted_at)},${r.counterparty},${r.amount},${r.category}`)
].join('\n');
```

That's your migration. When you hand things to a CPA, you run that endpoint scoped to whatever date range they need, download the CSV, and upload it to QuickBooks in under five minutes.[^5]

## The Category List to Use From Day One

Use QuickBooks' native category names as your `category` values -- that way column mapping in QBO is automatic with no manual matching step:[^5]

- `Consulting Income` / `Software License Revenue`
- `Software & Subscriptions` (Cloudflare, GitHub, etc.)
- `Professional Services` (future CPA fees)
- `Home Office` (Fort Collins apartment, if you claim it)
- `Owner Draw` / `Owner Contribution`


## What You Skip Entirely

No Puzzle subscription, no QuickBooks monthly fee until you actually need a CPA, no Plaid middleman, no CSV hand-editing at migration time. The system is just a D1 database, three Workers, and about 200 lines of TypeScript. Total CF cost at Rift Root's current scale is effectively zero.[^2]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://support.mercury.com/hc/en-us/articles/28768700685844-Exporting-transaction-data

[^2]: https://workers.cloudflare.com/product/d1

[^3]: https://oneuptime.com/blog/post/2026-01-27-cloudflare-d1-database/view

[^4]: https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-get-bank-transactions/L4BjLWckq_US_en_US

[^5]: https://skyvia.com/blog/how-to-import-csv-into-quickbooks-online-and-desktop/

[^6]: https://docs.mercury.com/reference/listtransactions

[^7]: https://docs.mercury.com/docs/welcome

[^8]: https://mercury-template.opencms.org/en/elements/advanced/form/export

[^9]: https://support.kioskgroup.com/article/1099-api-process-encrypted-card-payments-through-mercurypay

[^10]: https://mintlify.com/tp-link-extender/MercuryCore/api/economy/transactions

[^11]: https://news.ycombinator.com/item?id=47341820

[^12]: https://www.jadaktech.com/wp-content/uploads/2022/08/MercuryAPI_ProgrammerGuide_August-2020-1-1.pdf

[^13]: https://quickbooks.intuit.com/learn-support/en-us/banking/how-do-i-import-csv-file/00/1329642

[^14]: https://support.ccdc.cam.ac.uk/support/solutions/articles/103000306414-which-file-formats-does-mercury-support-

[^15]: https://quickbooks.intuit.com/learn-support/en-us/other-questions/importing-checks-from-excel-or-csv/00/1526241

