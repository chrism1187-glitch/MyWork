export async function POST() {
  return new Response(JSON.stringify({ error: 'TEST_v4_API_WORKING', details: 'This is a test', timestamp: new Date().toISOString() }), { 
    status: 418,  // I'm a teapot - very unusual status code
    headers: { 'Content-Type': 'application/json' } 
  });
}
