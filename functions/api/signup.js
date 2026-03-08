export async function onRequestPost(context) {
  const { request, env } = context;
  const { email, username, password } = await request.json();
  const token = crypto.randomUUID();

  try {
    // 1. Save to DB first
    await env.DB.prepare(
      "INSERT INTO users (id, username, email, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), username, email, password, token).run();

    // 2. Send the Email via Resend
    const verifyLink = `${new URL(request.url).origin}/api/verify?token=${token}`;
    
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PetStory <onboarding@resend.dev>',
        to: [email],
        subject: '🐾 Verify your PetStory Account!',
        html: `<p>Welcome to the elite! Click here to verify: <a href="${verifyLink}">${verifyLink}</a></p>`
      })
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
