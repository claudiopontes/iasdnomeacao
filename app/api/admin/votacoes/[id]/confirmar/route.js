import { db } from '@/lib/db';
import { json, erro, comAdmin, qVotacao, apuracao } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const POST = comAdmin(async (req, { params }) => {
  const { id } = await params;
  const v = qVotacao.get(id);
  if (!v) return erro('Não encontrada', 404);
  if (v.status !== 'encerrada') return erro('Encerre a votação antes de confirmar');
  const body = await req.json().catch(() => ({}));
  const eleitos = new Set((body.eleitos || []).map(Number));
  const { candidatos, total_cedulas } = apuracao(v.id);
  db.transaction(() => {
    const ins = db.prepare(`INSERT INTO resultados
      (votacao_id, ministerio, cargo, mandato, igreja, tipo, candidato, votos, total_cedulas, eleito)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of candidatos)
      ins.run(v.id, v.ministerio, v.cargo, v.mandato, v.igreja, v.tipo, c.nome, c.votos, total_cedulas, eleitos.has(c.id) ? 1 : 0);
    db.prepare("UPDATE votacoes SET status = 'confirmada' WHERE id = ?").run(v.id);
  })();
  return json({ ok: true });
});
