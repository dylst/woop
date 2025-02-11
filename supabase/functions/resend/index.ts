import { config } from "https://deno.land/x/dotenv/mod.ts";
const env = config(); // Loads the variables from .env

import { Resend } from 'resend';

const resendApiKey = env.RESEND_API_KEY;
if (!resendApiKey) {
  throw new Error("Missing RESEND_API_KEY in env");
}

const handler = async (request: Request): Promise<Response> => {
  try {
    const { to, subject, html } = await request.json();
    const resend = new Resend(resendApiKey);
    const result = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error sending email:", err);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

Deno.serve(handler);
