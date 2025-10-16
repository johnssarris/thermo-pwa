export const onRequestPost = async ({ env }) => {
  const key = 'ecobee:default';
  const raw = await env.TOKENS.get(key);
  if (!raw) return Response.json({ ok: false, error: 'no record found' }, { status: 404 });

  const obj = JSON.parse(raw);
  if (!obj.expires_at) {
    obj.expires_at = new Date(Date.now() + 45 * 60 * 1000).toISOString();
    obj.updated_at = new Date().toISOString();
    await env.TOKENS.put(key, JSON.stringify(obj));
    return Response.json({ ok: true, fixed: true, expires_at: obj.expires_at });
  }
  return Response.json({ ok: true, fixed: false, expires_at: obj.expires_at });
};