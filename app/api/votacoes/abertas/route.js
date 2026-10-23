import { db } from '@/lib/db';
import { tokenEleitor } from '@/lib/auth';
import { json, qCandidatos } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = await tokenEleitor();
  const jaVotou = db.prepare('SELECT 1 FROM participacoes WHERE votacao_id = ? AND token = ?');
  const lista = db.prepare("SELECT id, ministerio, cargo, mandato, igreja, tipo, max_escolhas FROM votacoes WHERE status = 'aberta' ORDER BY igreja, ministerio, cargo")
    .all()
    .map(v => ({ ...v, candidatos: qCandidatos.all(v.id), ja_votou: !!jaVotou.get(v.id, token) }));
  return json(lista);
}
