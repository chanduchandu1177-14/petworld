export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const token = searchParams.get('token');

  if (!token) return new Response("Invalid Link 🐾", { status: 400 });

  try {
    // Find user with this token and verify them
    const result = await context.env.DB.prepare(
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE verification_token = ?"
    ).bind(token).run();

    if (result.meta.changes > 0) {
      // Redirect to login page after successful verification
      return Response.redirect(`${new URL(context.request.url).origin}/auth.html?verified=true`, 302);
    } else {
      return new Response("Link expired or already used! 🦴", { status: 400 });
    }
  } catch (err) {
    return new Response("Database error. Sniffing it out...", { status: 500 });
  }
}
