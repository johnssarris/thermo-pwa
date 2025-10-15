import { json, emailFromAccess, importKey, encryptJSON } from '../crypto.js';

export async function onRequestPost({ request, env }) {
  const email = emailFromAccess(request);
  if (!email) return json({ ok:false, error:'unauthorized' }, 401);

  let body;
  try { body = await request.json(); }
  catch { return json({ ok:false, error:'bad json' }, 400); }

  const { access_token, refresh_token, expires_at } = body || {};
  if (!access_token || !refresh_token) return json({ ok:false, error:'missing fields' }, 400);

  const appKey = await importKey(env.APP_CRYPTO_KEY);
  const packed = await encryptJSON(appKey, { access_token, refresh_token, expires_at });
  const key = `user:${email}:ecobee`;
  await env.TOKENS.put(key, packed);
  return json({ ok:true });
}