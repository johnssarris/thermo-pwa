import { json, emailFromAccess } from '../crypto.js';

export async function onRequestGet({ request, env }) {
  const email = emailFromAccess(request);
  if (!email) return json({ ok:false, error:'unauthorized' }, 401);
  const key = `user:${email}:ecobee`;
  const raw = await env.TOKENS.get(key);
  return json({ ok:true, hasToken: !!raw });
}