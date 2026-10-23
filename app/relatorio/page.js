'use client';
import { useEffect, useState } from 'react';

export default function Relatorio() {
  const [linhas, setLinhas] = useState(null);
  const [semAcesso, setSemAcesso] = useState(false);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    fetch('/api/admin/resultados', { cache: 'no-store' }).then(async r => {
      if (r.status === 401) return setSemAcesso(true);
      setLinhas(await r.json());
    });
  }, []);

  // agrupa por votação confirmada
  const grupos = [];
  for (const l of linhas || []) {
    const texto = `${l.igreja || ''} ${l.mandato || ''} ${l.ministerio} ${l.cargo} ${l.candidato}`.toLowerCase();
    if (filtro && !texto.includes(filtro.toLowerCase())) continue;
    let g = grupos.find(x => x.votacao_id === l.votacao_id && x.confirmado_em === l.confirmado_em);
    if (!g) grupos.push(g = { ...l, itens: [] });
    g.itens.push(l);
  }

  return (
    <>
      <header>
        <h1>Relatório de Resultados</h1>
        <nav>
          <a href="/admin">Administração</a>
          <a href="/api/admin/resultados.csv">Baixar CSV</a>
        </nav>
      </header>
      <main>
        {semAcesso && <div className="msg erro">Faça login na <a href="/admin">administração</a> para ver o relatório.</div>}
        {linhas && (
          <div className="card">
            <input type="text" placeholder="Filtrar por igreja, ano, ministério, cargo ou candidato…" value={filtro} onChange={e => setFiltro(e.target.value)} />
          </div>
        )}
        {linhas?.length === 0 && <div className="vazio">Nenhum resultado confirmado ainda.</div>}
        {grupos.map(g => (
          <div className="card" key={`${g.votacao_id}-${g.confirmado_em}`}>
            <div className="topo">
              <div>
                {(g.igreja || g.mandato) && <div className="sub" style={{ marginBottom: 2 }}>{[g.igreja, g.mandato].filter(Boolean).join(' · ')}</div>}
                <h2>{g.ministerio} — {g.cargo}</h2>
                <div className="sub">
                  Confirmado em {g.confirmado_em} · {g.tipo === 'unica' ? 'Escolha única' : 'Escolha múltipla'} · {g.total_cedulas} cédula(s)
                </div>
              </div>
            </div>
            <div className="tabela-wrap">
              <table>
                <thead><tr><th>Candidato</th><th style={{ width: 90 }}>Votos</th><th style={{ width: 90 }}>%</th><th>Situação</th></tr></thead>
                <tbody>
                  {g.itens.map(i => (
                    <tr key={i.id}>
                      <td>{i.candidato}</td>
                      <td>{i.votos}</td>
                      <td>{g.total_cedulas ? Math.round(100 * i.votos / g.total_cedulas) : 0}%</td>
                      <td>{i.eleito ? <span className="tag confirmada">Eleito(a)</span> : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
