import { json, erro, comAdmin, qVotacao, apuracao } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const GET = comAdmin(async (req, { params }) => {
  const { id } = await params;
  const v = qVotacao.get(id);
  if (!v) return erro('Não encontrada', 404);
  return json({ votacao: v, ...apuracao(v.id) });
});
