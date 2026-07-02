const BASE_URL = process.env.WHATSAPP_EVOLUTION_API_URL || '';
const API_KEY = process.env.WHATSAPP_EVOLUTION_API_KEY || '';
const DEFAULT_INSTANCE = process.env.WHATSAPP_DEFAULT_INSTANCE || 'marketron';

async function apiFetch(url: string, method: string, body?: any, timeout = 10000) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['apikey'] = API_KEY;
  const opts: RequestInit = { method, headers, signal: AbortSignal.timeout(timeout) };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: { raw: text } };
  }
}

export async function createInstance(instanceName: string) {
  const url = `${BASE_URL}/instance/create`;
  return apiFetch(url, 'POST', {
    instanceName,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
    rejectCall: false,
    groupsIgnore: true,
    alwaysOnline: true,
    readMessages: true,
    syncFullHistory: false,
  }, 15000);
}

export async function getConnectionState(instanceName: string = DEFAULT_INSTANCE) {
  const url = `${BASE_URL}/instance/connectionState/${instanceName}`;
  const res = await apiFetch(url, 'GET');
  return res.ok ? (res.data?.instance?.state || null) : null;
}

export async function logoutInstance(instanceName: string = DEFAULT_INSTANCE) {
  const url = `${BASE_URL}/instance/logout/${instanceName}`;
  return apiFetch(url, 'DELETE');
}

export async function connectInstance(instanceName: string = DEFAULT_INSTANCE) {
  const url = `${BASE_URL}/instance/connect/${instanceName}`;
  return apiFetch(url, 'GET', undefined, 20000);
}

export async function sendTextMessage(to: string, text: string, instanceName: string = DEFAULT_INSTANCE) {
  const url = `${BASE_URL}/message/sendText/${instanceName}`;
  return apiFetch(url, 'POST', {
    number: to,
    text,
    options: { delay: 1200, presence: 'composing' },
  }, 15000);
}

export async function instanceStatus(instanceName: string = DEFAULT_INSTANCE) {
  const url = `${BASE_URL}/instance/fetchInstances`;
  const res = await apiFetch(url, 'GET');
  if (res.ok && Array.isArray(res.data)) {
    const inst = res.data.find((i: any) => i.name === instanceName);
    return inst?.state || null;
  }
  const state = await getConnectionState(instanceName);
  return state;
}

export { BASE_URL, API_KEY, DEFAULT_INSTANCE };
