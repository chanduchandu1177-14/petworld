export async function onRequestPost(context) {
  const { request, env } = context;
  const { email, username, password } = await request.json();
  const token = crypto.randomUUID();

  try {
    // 1. Check if user exists AND if they are verified
    const existing = await env.DB.prepare(
      "SELECT id, is_verified FROM users WHERE email = ? OR username = ?"
    ).bind(email, username).first();

    if (existing) {
      if (existing.is_verified === 1) {
        // This person is a real member already
        return new Response(JSON.stringify({ error: "You are already registered! Please login. 🐾" }), { status: 400 });
      } else {
        // Not verified yet? Delete the old "stuck" account so they can try again
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(existing.id).run();
      }
    }

    // 2. Create the new account (or re-create the unverified one)
    await env.DB.prepare(
      "INSERT INTO users (id, username, email, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), username, email, password, token).run();

    // 3. Send the Email via Resend
    const verifyLink = `${new URL(request.url).origin}/api/verify?token=${token}`;
    
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PetStory <onboarding@resend.dev>',
        to: [email],
        subject: '🐾 Verify your PetStory Account!',
        html: `<h1>Welcome to the Pack!</h1><p>Click here to verify your account and make your pet a celebrity: <a href="${verifyLink}">Verify Now</a></p>`
      })
    });

    if (!emailRes.ok) {
        throw new Error("Email engine failed. Check your API key!");
    }

    return new Response(JSON.stringify({ success: true }));

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
