import { NextResponse } from 'next/server';
import { db, lazy } from './db.js';
import { ehAdmin } from './auth.js';

export const json = (data, status = 200) => NextResponse.json(data, { status });
export const erro = (msg, status = 400) => json({ erro: msg }, status);

/** Envolve um handler exigindo sessão de administrador. */
export const comAdmin = (handler) => async (req, ctx) => {
  if (!(await ehAdmin())) return erro('Não autenticado', 401);
  return handler(req, ctx);
};

export const qCandidatos = lazy('SELECT id, nome FROM candidatos WHERE votacao_id = ? ORDER BY nome');
export const qVotacao = lazy('SELECT * FROM votacoes WHERE id = ?');

export function apuracao(votacaoId) {
  const candidatos = db.prepare(`
    SELECT c.id, c.nome, COUNT(v.id) AS votos
    FROM candidatos c
    LEFT JOIN votos v ON v.candidato_id = c.id
    WHERE c.votacao_id = ?
    GROUP BY c.id
    ORDER BY votos DESC, c.nome
  `).all(votacaoId);
  const { total } = db.prepare('SELECT COUNT(DISTINCT cedula) AS total FROM votos WHERE votacao_id = ?').get(votacaoId);
  return { candidatos, total_cedulas: total };
}

export function validaCorpo(body) {
  const ministerio = String(body.ministerio || '').trim();
  const cargo = String(body.cargo || '').trim();
  const mandato = String(body.mandato || '').trim();
  const igreja = String(body.igreja || '').trim();
  const tipo = body.tipo === 'multipla' ? 'multipla' : 'unica';
  const max = tipo === 'unica' ? 1 : Math.max(1, parseInt(body.max_escolhas, 10) || 1);
  const candidatos = [...new Set((body.candidatos || []).map(s => String(s).trim()).filter(Boolean))];
  if (!ministerio || !cargo) return { erro: 'Informe ministério e cargo' };
  if (candidatos.length < 2) return { erro: 'Informe ao menos 2 candidatos' };
  return { ministerio, cargo, mandato, igreja, tipo, max, candidatos };
}

export const qResultados = lazy('SELECT * FROM resultados ORDER BY igreja, mandato DESC, confirmado_em DESC, votacao_id DESC, votos DESC');

/** Muda o status de uma votação validando a transição. */
export function mudarStatus(id, de, para, campoData) {
  const v = qVotacao.get(id);
  if (!v) return erro('Não encontrada', 404);
  if (!de.includes(v.status)) return erro(`Transição inválida (${v.status} → ${para})`);
  const set = campoData ? `, ${campoData} = datetime('now','localtime')` : '';
  db.prepare(`UPDATE votacoes SET status = ?${set} WHERE id = ?`).run(para, v.id);
  return json({ ok: true });
}
