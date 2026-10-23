import crypto from 'node:crypto';
import { db } from '@/lib/db';
import { tokenEleitor } from '@/lib/auth';
import { json, erro, qCandidatos, qVotacao } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const { id } = await params;
  const token = await tokenEleitor();
  const v = qVotacao.get(id);
  if (!v || v.status !== 'aberta') return erro('Votação não está aberta');

  const body = await req.json().catch(() => ({}));
  const escolhas = [...new Set((body.candidatos || []).map(Number))];
  const validos = new Set(qCandidatos.all(v.id).map(c => c.id));
  if (escolhas.length === 0 || !escolhas.every(c => validos.has(c))) return erro('Escolha inválida');
  const limite = v.tipo === 'unica' ? 1 : v.max_escolhas;
  if (escolhas.length > limite) return erro(`Escolha no máximo ${limite} opção(ões)`);

  const cedula = crypto.randomUUID();
  const insVoto = db.prepare('INSERT INTO votos (votacao_id, candidato_id, cedula) VALUES (?, ?, ?)');
  const insPart = db.prepare('INSERT INTO participacoes (votacao_id, token) VALUES (?, ?)');
  try {
    db.transaction(() => {
      insPart.run(v.id, token); // falha se este dispositivo já votou (chave primária)
      for (const c of escolhas) insVoto.run(v.id, c, cedula);
    })();
  } catch (e) {
    if (/UNIQUE|PRIMARY/.test(String(e.message))) return erro('Este dispositivo já votou nesta votação', 409);
    throw e;
  }
  return json({ ok: true });
}
