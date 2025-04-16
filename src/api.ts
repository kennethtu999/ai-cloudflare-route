import { Env } from './types';

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  
  // Check for x-token header
  const token = request.headers.get('x-token') || url.searchParams.get('x-token');
  
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

      return new Response(JSON.stringify(response), {
        headers: {
          'content-type': 'application/json',
        },
      });
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
} 