import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1';
// segredo derivado da senha: a sessão sobrevive a reinícios sem precisar de outro segredo
const SEGREDO = crypto.createHash('sha256').update('voto-sessao:' + ADMIN_PASSWORD).digest();
const DURACAO_SESSAO_S = 12 * 60 * 60;

const opts = { httpOnly: true, sameSite: 'lax', secure: COOKIE_SECURE, path: '/' };

function assinar(payload) {
  const mac = crypto.createHmac('sha256', SEGREDO).update(payload).digest('hex');
  return `${payload}.${mac}`;
}
function verificar(token) {
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const payload = token.slice(0, i), mac = token.slice(i + 1);
  const esperado = crypto.createHmac('sha256', SEGREDO).update(payload).digest('hex');
  if (mac.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(esperado))) return false;
  const exp = Number(payload.split(':')[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

export function senhaCorreta(senha) {
  return typeof senha === 'string' &&
    senha.length === ADMIN_PASSWORD.length &&
    crypto.timingSafeEqual(Buffer.from(senha), Buffer.from(ADMIN_PASSWORD));
}

export async function iniciarSessaoAdmin() {
  const payload = `${crypto.randomBytes(8).toString('hex')}:${Date.now() + DURACAO_SESSAO_S * 1000}`;
  (await cookies()).set('admin_sessao', assinar(payload), { ...opts, maxAge: DURACAO_SESSAO_S });
}
export async function encerrarSessaoAdmin() {
  (await cookies()).delete('admin_sessao');
}
export async function ehAdmin() {
  return verificar((await cookies()).get('admin_sessao')?.value);
}

/** Token anônimo do dispositivo eleitor; cria se não existir. Retorna o token. */
export async function tokenEleitor() {
  const jar = await cookies();
  let t = jar.get('eleitor')?.value;
  if (!t || !/^[a-f0-9]{48}$/.test(t)) {
    t = crypto.randomBytes(24).toString('hex');
    jar.set('eleitor', t, { ...opts, maxAge: 365 * 24 * 60 * 60 });
  }
  return t;
}
