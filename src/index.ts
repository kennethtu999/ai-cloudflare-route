/**
 * Example curl commands:
 * 
 * Development:
   curl -X POST "http://localhost:8787" \
    -H "x-token: 9999" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello World"}'

    curl -X GET "http://localhost:8787?message=Hello+World" \
    -H "x-token: 9999" \
    -H "Content-Type: application/json"
 * 
 * Production:
 * curl -X POST "https://clouldflare-route.kenneth-tu.workers.dev/" \
 *   -H "x-token: 9999" \
 *   -H "Content-Type: application/json" \
 *   -d '{"message": "Hello World"}'
   curl -X GET "https://clouldflare-route.kenneth-tu.workers.dev" \
    -H "x-token: 9999" \
    -H "Content-Type: application/json"
 */

import { handleApi } from './api';
import { Env } from './types';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith("/api")) {
      return handleApi(request, env);
    }

    // Try to serve static assets
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    // Optional: fallback to index.html for SPA routing
    if (request.method === "GET" && !url.pathname.includes(".")) {
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    }

    return new Response("Not found", { status: 404 });
  }
};
