import { ehAdmin } from '@/lib/auth';
import { json } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export async function GET() {
  return json({ autenticado: await ehAdmin() });
}
