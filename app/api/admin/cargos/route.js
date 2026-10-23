import { CATALOGO } from '@/lib/cargos';
import { json, comAdmin } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const GET = comAdmin(async () => json(CATALOGO));
