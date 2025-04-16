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
 */

interface Env {
  BACKEND_URL: string;
  XTOKEN: string;
}

export default {
  async fetch(request, env) {
    // Check for x-token header
    const token = request.headers.get('x-token') || new URL(request.url).searchParams.get('x-token');
    
    // Validate token
    if (!token || token !== env.XTOKEN) {
      return new Response('Access denied', {
        status: 403,
        headers: {
          'content-type': 'text/plain',
        },
      });
    }

    // Handle POST requests - forward to backend
    if (request.method === 'POST') {
      try {
        const backendUrl = env.BACKEND_URL;
        if (!backendUrl) {
          throw new Error('BACKEND_URL environment variable not set');
        }

        // Get the request body
        const body = await request.text();
        
        // Forward the request to backend
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: request.headers,
          body: body
        });

        // console.log("AAA");
        // console.log(JSON.stringify(request.text()));
        // console.log(request);
        // console.log("AAAAA");
        // console.log(JSON.stringify(response));
        // console.log(response);
        // console.log("BBBBB");
        return new Response(JSON.stringify(response), {
          headers: {
            'content-type': 'application/json',
          },
        });
        // return response;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return new Response(`Error forwarding request: ${errorMessage}`, {
          status: 500,
          headers: {
            'content-type': 'text/plain',
          },
        });
      }
    }

    // Handle GET requests - fetch and return JSON data
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const json = await response.json();
      
      return new Response(JSON.stringify(json), {
        headers: {
          'content-type': 'application/json',
        },
      });
    } catch (error) {
      return new Response('Error fetching data', {
        status: 500,
        headers: {
          'content-type': 'text/plain',
        },
      });
    }
  },
} satisfies ExportedHandler<Env>;
