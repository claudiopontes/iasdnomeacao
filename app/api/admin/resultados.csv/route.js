import { comAdmin, qResultados } from '@/lib/votacoes';

export const dynamic = 'force-dynamic';

export const GET = comAdmin(async () => {
  const rows = qResultados.all();
  const esc = s => `"${String(s).replace(/"/g, '""')}"`;
  const cab = ['confirmado_em', 'igreja', 'mandato', 'ministerio', 'cargo', 'tipo', 'candidato', 'votos', 'total_cedulas', 'eleito'];
  const csv = [
    cab.join(';'),
    ...rows.map(r => cab.map(k => esc(k === 'eleito' ? (r[k] ? 'Sim' : 'Não') : r[k])).join(';')),
  ].join('\r\n');
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="resultados.csv"',
    },
  });
});
