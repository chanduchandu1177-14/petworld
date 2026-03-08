export async function onRequestGet(context) {
  const { env } = context;
  
  // This logic only pulls pets from the last 12 hours
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM pets WHERE created_at > ? ORDER BY bones DESC LIMIT 50"
    ).bind(twelveHoursAgo).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
