export async function onRequestPost(context) {
  const { request, env } = context;
  const { petId } = await request.json();

  try {
    // This command finds the pet by ID and adds 1 to their 'bones' count
    await env.DB.prepare(
      "UPDATE pets SET bones = bones + 1 WHERE id = ?"
    ).bind(petId).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
