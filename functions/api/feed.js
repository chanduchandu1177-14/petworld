export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare(
    "SELECT * FROM pets ORDER BY created_at DESC LIMIT 50"
  ).all();
  return new Response(JSON.stringify(results));
}
