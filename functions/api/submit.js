export async function onRequestPost(context) {
const { request, env } = context;
try {
const data = await request.json();
await env.DB.prepare(
"INSERT INTO pets (id, name, pet_type, image_url) VALUES (?, ?, ?, ?)"
).bind(
crypto.randomUUID(),
data.name,
data.pet_type,
""
).run();
return new Response(JSON.stringify({ success: true }), {
headers: { "Content-Type": "application/json" },
});
} catch (err) {
return new Response(JSON.stringify({ error: err.message }), {
status: 500,
headers: { "Content-Type": "application/json" }
});
}
}
