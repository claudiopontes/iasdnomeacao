import { db } from '@/lib/db';
import { json, erro, comAdmin, qVotacao, validaCorpo } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const PUT = comAdmin(async (req, { params }) => {
  const { id } = await params;
  const v = qVotacao.get(id);
  if (!v) return erro('Não encontrada', 404);
  if (v.status === 'confirmada') return erro('Votação confirmada não pode ser editada');
  const d = validaCorpo(await req.json().catch(() => ({})));
  if (d.erro) return erro(d.erro);
  const { n: temVotos } = db.prepare('SELECT COUNT(*) AS n FROM votos WHERE votacao_id = ?').get(v.id);
  db.transaction(() => {
    if (temVotos) {
      // já há cédulas: só o texto pode mudar, para não invalidar os votos
      db.prepare('UPDATE votacoes SET ministerio=?, cargo=?, mandato=?, igreja=? WHERE id=?').run(d.ministerio, d.cargo, d.mandato, d.igreja, v.id);
      return;
    }
    db.prepare('UPDATE votacoes SET ministerio=?, cargo=?, mandato=?, igreja=?, tipo=?, max_escolhas=? WHERE id=?')
      .run(d.ministerio, d.cargo, d.mandato, d.igreja, d.tipo, d.max, v.id);
    db.prepare('DELETE FROM candidatos WHERE votacao_id = ?').run(v.id);
    const ins = db.prepare('INSERT INTO candidatos (votacao_id, nome) VALUES (?, ?)');
    for (const n of d.candidatos) ins.run(v.id, n);
  })();
  return json({ ok: true, somenteTexto: !!temVotos });
});

export const DELETE = comAdmin(async (req, { params }) => {
  const { id } = await params;
  const v = qVotacao.get(id);
  if (!v) return erro('Não encontrada', 404);
  if (v.status === 'confirmada') return erro('Votação confirmada não pode ser excluída');
  db.prepare('DELETE FROM votacoes WHERE id = ?').run(v.id);
  return json({ ok: true });
});
