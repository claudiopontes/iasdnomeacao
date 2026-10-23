import { comAdmin, mudarStatus } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const POST = comAdmin(async (req, { params }) => {
  const { id } = await params;
  return mudarStatus(id, ['rascunho', 'encerrada'], 'aberta', 'aberta_em');
});
