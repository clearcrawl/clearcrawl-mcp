#!/usr/bin/env node
// Clearcrawl MCP (stdio). A thin client for the hosted Clearcrawl API.
// Env: CLEARCRAWL_API_KEY (optional; without it you get the free tier), CLEARCRAWL_URL (default https://agentreader.onrender.com)
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = (process.env.CLEARCRAWL_URL || 'https://agentreader.onrender.com').replace(/\/$/, '');
const KEY = process.env.CLEARCRAWL_API_KEY || '';
async function call(p, body) {
  const r = await fetch(BASE + p, { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': 'clearcrawl-mcp/0.4.0', ...(KEY ? { authorization: `Bearer ${KEY}` } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) });
  const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
  if (!r.ok) throw new Error(`${j.error || 'request failed'}${j.buy ? ` (buy credits: ${j.buy})` : ''}`);
  return j;
}
const out = o => ({ content: [{ type: 'text', text: typeof o === 'string' ? o : JSON.stringify(o, null, 2) }] });
const fail = e => ({ isError: true, content: [{ type: 'text', text: `Error: ${e.message}` }] });

const server = new McpServer({ name: 'clearcrawl', version: '0.4.0' });
server.tool('read_url', 'Fetch a public URL and return clean markdown (format="markdown") or structured JSON: title, author, date, markdown, text, links, tables. PDF URLs are converted automatically. Cost: 2 credits ($0.002); free tier 100 calls/day.',
  { url: z.string().url().describe('Public http(s) URL'), format: z.enum(['json', 'markdown']).optional().describe('Default json') },
  async ({ url, format }) => { try { const j = await call('/v1/read', { url, format }); return out(format === 'markdown' ? j.markdown : j); } catch (e) { return fail(e); } });
server.tool('convert_file', 'Convert a PDF, XLSX/XLS/CSV, or DOCX into text and tables. Give a public file URL, or a local file path (read on this machine and uploaded). Cost: 3 credits ($0.003) per page or sheet.',
  { url: z.string().url().optional(), path: z.string().optional().describe('Local file path, max 15 MB') },
  async ({ url, path: p }) => { try {
    if (url) return out(await call('/v1/convert', { url }));
    if (p) { const buf = await fs.readFile(p); return out(await call('/v1/convert', { base64: buf.toString('base64'), filename: path.basename(p) })); }
    throw new Error('provide url or path');
  } catch (e) { return fail(e); } });
await server.connect(new StdioServerTransport());
