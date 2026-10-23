import { json, comAdmin, qResultados } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const GET = comAdmin(async () => json(qResultados.all()));
