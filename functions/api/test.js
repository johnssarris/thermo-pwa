import { json, emailFromAccess } from '../crypto.js';

export async function onRequestGet({ request }) {
  const email = emailFromAccess(request);
  if (!email) return json({ ok:false, error:'unauthorized' }, 401);
  return json({ ok:true, who: email, now: new Date().toISOString() });
}