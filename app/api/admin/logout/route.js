import { encerrarSessaoAdmin } from '@/lib/auth';
import { json } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export async function POST() {
  await encerrarSessaoAdmin();
  return json({ ok: true });
}
