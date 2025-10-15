// Small AES-GCM helpers (base64url encoding)
const enc = new TextEncoder();
const dec = new TextDecoder();

function b64u(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
}
function b64uToBytes(str) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replaceAll('-','+').replaceAll('_','/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function importKey(raw) {
  // raw is base64url of 32 random bytes
  const keyBytes = b64uToBytes(raw);
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt","decrypt"]);
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}

export async function encryptJSON(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, key, enc.encode(JSON.stringify(obj)));
  return `v1.${b64u(iv)}.${b64u(ct)}`;
}

export async function decryptJSON(key, packed) {
  const [v, ivB64, ctB64] = packed.split('.');
  if (v !== 'v1') throw new Error('bad format');
  const iv = b64uToBytes(ivB64);
  const ct = b64uToBytes(ctB64);
  const pt = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, key, ct);
  return JSON.parse(dec.decode(pt));
}

export function emailFromAccess(request) {
  // Cloudflare Access injects this header AFTER passing policy
  return request.headers.get('Cf-Access-Authenticated-User-Email');
}