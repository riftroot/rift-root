<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# alright and i also want to tie that into my own accounting spa to manage modifications and approvals and have that update the data. add any schema and meta that makes this truly powerful and easy. prioritize mobile-first. most of my pages are build on hono vite stack but whatever fits

Here's the SPA. It's fully functional as a standalone demo -- everything runs in-memory so you can poke around before wiring it to your actual CF stack.

## What's in It

**Four views:** Dashboard (KPIs + review queue banner), Transactions (filterable, with pending/income/expense/owner tabs), Categories (spend breakdown with QB label mapping), and QB Export (live CSV preview + download).

**The transaction drawer** is where the real work happens -- tap any transaction to open it, change the category and type from dropdowns, add an invoice ref or CPA notes field, then hit Approve to flip `reviewed = 1`. That's the entire approval loop.

## The Extended Schema

The D1 schema in the Export tab adds a few fields beyond the minimum we discussed. `mercury_memo` stores the raw Mercury description separately from your cleaned `description` so you never lose the source data. `tags` is a JSON text field for things like `["deductible","home-office","partial"]` -- searchable with `json_each()` in SQLite. `notes` is freeform CPA context. `qb_exported` and `qb_exported_at` let you track exactly which transactions have been handed off, so a second export never double-counts.[^1][^2]

## Plugging It Into Your Stack

```
The SPA is intentionally framework-agnostic vanilla JS -- drop the HTML into your Hono/Vite project, strip the inline `<style>` and `<script>` into your asset pipeline, and swap the in-memory `TRANSACTIONS` array for `fetch('/api/transactions')` calls to your D1 Worker. The category and type enums in the UI match the `CHECK` constraint in the schema exactly, so there's no translation layer between the SPA and the database.
```

<div align="center">⁂</div>

[^1]: https://docs.mercury.com/reference/listtransactions

[^2]: https://skyvia.com/blog/how-to-import-csv-into-quickbooks-online-and-desktop/

