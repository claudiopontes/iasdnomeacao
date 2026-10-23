import { db } from '@/lib/db';
import { json, erro, comAdmin, qCandidatos, validaCorpo } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const GET = comAdmin(async () => {
  const lista = db.prepare(`
    SELECT v.*, (SELECT COUNT(DISTINCT cedula) FROM votos WHERE votacao_id = v.id) AS cedulas
    FROM votacoes v ORDER BY v.id DESC
  `).all().map(v => ({ ...v, candidatos: qCandidatos.all(v.id) }));
  return json(lista);
});

export const POST = comAdmin(async (req) => {
  const d = validaCorpo(await req.json().catch(() => ({})));
  if (d.erro) return erro(d.erro);
  const id = db.transaction(() => {
    const r = db.prepare('INSERT INTO votacoes (ministerio, cargo, mandato, igreja, tipo, max_escolhas) VALUES (?, ?, ?, ?, ?, ?)')
      .run(d.ministerio, d.cargo, d.mandato, d.igreja, d.tipo, d.max);
    const ins = db.prepare('INSERT INTO candidatos (votacao_id, nome) VALUES (?, ?)');
    for (const n of d.candidatos) ins.run(r.lastInsertRowid, n);
    return Number(r.lastInsertRowid);
  })();
  return json({ id });
});
