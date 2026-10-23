import { senhaCorreta, iniciarSessaoAdmin } from '@/lib/auth';
import { json, erro } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { senha } = await req.json().catch(() => ({}));
  if (!senhaCorreta(senha)) return erro('Senha incorreta', 401);
  await iniciarSessaoAdmin();
  return json({ ok: true });
}
