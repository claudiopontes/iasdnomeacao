'use client';
import { useEffect, useState } from 'react';

export default function Votacao() {
  const [lista, setLista] = useState(null);

  async function carregar() {
    const r = await fetch('/api/votacoes/abertas', { cache: 'no-store' });
    setLista(await r.json());
  }
  useEffect(() => { carregar(); }, []);

  return (
    <>
      <header>
        <h1>Votação de Cargos</h1>
        <button className="link" onClick={carregar}>Atualizar</button>
      </header>
      <main>
        {lista === null && <div className="vazio">Carregando…</div>}
        {lista?.length === 0 && (
          <div className="vazio">Nenhuma votação aberta no momento.<br />Aguarde o administrador.</div>
        )}
        {lista?.map(v => <Cedula key={v.id} v={v} aoVotar={carregar} />)}
      </main>
    </>
  );
}

function Cedula({ v, aoVotar }) {
  const multipla = v.tipo === 'multipla';
  const limite = multipla ? v.max_escolhas : 1;
  const [escolhidos, setEscolhidos] = useState([]);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (v.ja_votou) {
    return (
      <div className="card">
        <h2>{v.ministerio}</h2>
        <div className="sub">{v.cargo}</div>
        <div className="msg ok">Seu voto já foi registrado nesta votação. Obrigado!</div>
      </div>
    );
  }

  function alternar(id) {
    if (!multipla) return setEscolhidos([id]);
    setEscolhidos(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id]);
  }

  async function votar(ev) {
    ev.preventDefault();
    setErro('');
    if (!escolhidos.length) return setErro('Selecione ao menos um nome.');
    if (escolhidos.length > limite) return setErro(`Você pode escolher no máximo ${limite}.`);
    if (!confirm('Confirmar seu voto? Não será possível alterar depois.')) return;
    setEnviando(true);
    const r = await fetch(`/api/votacoes/${v.id}/votar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidatos: escolhidos }),
    });
    const d = await r.json();
    setEnviando(false);
    if (!r.ok) return setErro(d.erro || 'Erro ao votar');
    aoVotar();
  }

  return (
    <div className="card">
      {v.igreja && <div className="sub" style={{ marginBottom: 2 }}>{v.igreja}</div>}
      <h2>{v.ministerio}</h2>
      <div className="sub">
        Cargo: <strong>{v.cargo}</strong>{v.mandato ? ` · Mandato ${v.mandato}` : ''} · {multipla ? `Escolha até ${limite} nome(s)` : 'Escolha apenas 1 nome'}
      </div>
      <form onSubmit={votar}>
        {v.candidatos.map(c => (
          <label key={c.id} className="opcao">
            <input
              type={multipla ? 'checkbox' : 'radio'}
              name={`v${v.id}`}
              checked={escolhidos.includes(c.id)}
              onChange={() => alternar(c.id)}
            /> {c.nome}
          </label>
        ))}
        {erro && <div className="msg erro">{erro}</div>}
        <div className="acoes"><button type="submit" disabled={enviando}>Confirmar voto</button></div>
      </form>
    </div>
  );
}
