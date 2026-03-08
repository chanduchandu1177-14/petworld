export async function onRequestPost(context) {
  const { request, env } = context;
  const { email, username, password } = await request.json();

  try {
    // 1. Check if user already exists
    const existing = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ? OR username = ?"
    ).bind(email, username).first();

    if (existing) {
      return new Response(JSON.stringify({ error: "User or Email already exists" }), { status: 400 });
    }

    // 2. Create User ID and Verification Token
    const userId = crypto.randomUUID();
    const verificationToken = crypto.randomUUID();

    // 3. Save to Database (is_verified = 0)
    await env.DB.prepare(
      "INSERT INTO users (id, username, email, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)"
    ).bind(userId, username, email, password, verificationToken).run();

    // 4. Trigger Email (We will set this up in Step 5)
    // For now, we return success so you can test the flow
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Check your Gmail for verification!" 
    }));

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
