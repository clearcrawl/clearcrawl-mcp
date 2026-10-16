# Clearcrawl MCP

An MCP server for **Clearcrawl**, a pay-per-call API built for AI agents:

- **`read_url`**: turns any public URL into clean markdown or structured JSON (title, author, date, text, links, tables). Ads, menus and footers are stripped. PDF URLs are converted automatically.
- **`convert_file`**: turns a PDF, XLSX/XLS/CSV or DOCX (by URL or local path) into text and tables (per-page text, sheet rows and records, markdown tables).

**Free tier:** 100 calls a day with no signup. **Paid:** 1 credit = $0.001; `read_url` costs 2 credits and `convert_file` costs 3 per page. Credit packs start at $5 for 5,000 credits.

## Option 1: remote (no install)
Streamable HTTP endpoint: `https://agentreader.onrender.com/v1/mcp`

```json
{ "mcpServers": { "clearcrawl": { "url": "https://agentreader.onrender.com/v1/mcp" } } }
```
Claude Code: `claude mcp add --transport http clearcrawl https://agentreader.onrender.com/v1/mcp`
For paid credits, add the header `Authorization: Bearer <your key>`.

## Option 2: local stdio
```json
{ "mcpServers": { "clearcrawl": { "command": "npx", "args": ["-y", "github:clearcrawl/clearcrawl-mcp"], "env": { "CLEARCRAWL_API_KEY": "" } } } }
```
The local mode can also convert files from your disk (`convert_file` with `path`).

## Getting an API key
`POST https://agentreader.onrender.com/v1/credits/checkout {"pack":"ar_pack_5"}` returns a Stripe Checkout URL. Once you pay, the success page shows your key. Full docs: https://agentreader.onrender.com/llms.txt

## Notes
- Clearcrawl runs on a free host, so the first call after it has been idle can take about a minute.
- Limits: public http(s) URLs only, 15 MB max, no JavaScript rendering or OCR yet.

MIT licensed (this client). The Clearcrawl API itself is a hosted service.
