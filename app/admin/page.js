'use client';
import { useEffect, useState } from 'react';

const rotulo = { rascunho: 'Rascunho', aberta: 'Aberta', encerrada: 'Encerrada', confirmada: 'Confirmada' };
const descTipo = v => v.tipo === 'unica' ? 'Escolha única' : `Escolha múltipla (até ${v.max_escolhas})`;

export default function Admin() {
  const [autenticado, setAutenticado] = useState(null);
  const [tela, setTela] = useState({ nome: 'lista' });

  useEffect(() => {
    fetch('/api/admin/sessao', { cache: 'no-store' }).then(r => r.json()).then(d => setAutenticado(d.autenticado));
  }, []);

  async function api(url, opts = {}) {
    const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, cache: 'no-store', ...opts });
    if (r.status === 401) { setAutenticado(false); throw new Error('login'); }
    const d = await r.json();
    if (!r.ok) { alert(d.erro || 'Erro'); throw new Error(d.erro); }
    return d;
  }
  async function sair() { await fetch('/api/admin/logout', { method: 'POST' }); setAutenticado(false); }

  return (
    <>
      <header>
        <h1>Administração</h1>
        <nav>
          <a href="/" target="_blank" rel="noreferrer">Tela de votação</a>
          <a href="/relatorio">Relatório</a>
          {autenticado && <button className="link" onClick={sair}>Sair</button>}
        </nav>
      </header>
      <main>
        {autenticado === null && <div className="vazio">Carregando…</div>}
        {autenticado === false && <Login aoEntrar={() => { setAutenticado(true); setTela({ nome: 'lista' }); }} />}
        {autenticado && tela.nome === 'lista' && <Lista api={api} ir={setTela} />}
        {autenticado && tela.nome === 'form' && <Formulario api={api} votacao={tela.votacao} igrejaSugerida={tela.igrejaSugerida} mandatoSugerido={tela.mandatoSugerido} voltar={() => setTela({ nome: 'lista' })} />}
        {autenticado && tela.nome === 'apuracao' && <Apuracao api={api} id={tela.id} voltar={() => setTela({ nome: 'lista' })} />}
      </main>
    </>
  );
}

function Login({ aoEntrar }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  async function entrar(ev) {
    ev.preventDefault();
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha }) });
    if (!r.ok) return setErro('Senha incorreta');
    aoEntrar();
  }
  return (
    <div className="card login">
      <h2>Entrar</h2>
      <form onSubmit={entrar}>
        <label>Senha do administrador</label>
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)} autoFocus />
        {erro && <div className="msg erro">{erro}</div>}
        <div className="acoes"><button type="submit">Entrar</button></div>
      </form>
    </div>
  );
}

function Lista({ api, ir }) {
  const [lista, setLista] = useState(null);
  const carregar = () => api('/api/admin/votacoes').then(setLista);
  useEffect(() => { carregar(); }, []);

  async function acao(id, a, confirmar) {
    if (confirmar && !confirm(confirmar)) return;
    await api(`/api/admin/votacoes/${id}/${a}`, { method: 'POST' });
    carregar();
  }
  async function excluir(id) {
    if (!confirm('Excluir esta votação e todos os votos? Esta ação não pode ser desfeita.')) return;
    await api(`/api/admin/votacoes/${id}`, { method: 'DELETE' });
    carregar();
  }

  if (!lista) return <div className="vazio">Carregando…</div>;
  return (
    <>
      <div className="acoes" style={{ margin: '0 0 16px' }}>
        <button onClick={() => ir({ nome: 'form', votacao: null, igrejaSugerida: lista[0]?.igreja || '', mandatoSugerido: lista[0]?.mandato || '' })}>+ Nova votação</button>
      </div>
      {lista.length === 0 && <div className="vazio">Nenhuma votação cadastrada.</div>}
      {lista.map(v => (
        <div className="card" key={v.id}>
          <div className="topo">
            <div>
              {(v.igreja || v.mandato) && <div className="sub" style={{ marginBottom: 2 }}>{[v.igreja, v.mandato].filter(Boolean).join(' · ')}</div>}
              <h2>{v.ministerio} — {v.cargo}</h2>
              <div className="sub">{descTipo(v)} · {v.candidatos.length} candidatos · {v.cedulas} cédula(s)</div>
            </div>
            <span className={`tag ${v.status}`}>{rotulo[v.status]}</span>
          </div>
          <div className="sub">{v.candidatos.map(c => c.nome).join(', ')}</div>
          <div className="acoes">
            {v.status === 'rascunho' && <button className="sm ok" onClick={() => acao(v.id, 'abrir')}>Abrir votação</button>}
            {v.status !== 'confirmada' && <button className="sm sec" onClick={() => ir({ nome: 'form', votacao: v })}>Editar</button>}
            {v.status === 'aberta' && <button className="sm warn" onClick={() => acao(v.id, 'encerrar', 'Encerrar a votação? Ninguém mais poderá votar.')}>Encerrar</button>}
            {v.status !== 'rascunho' && <button className="sm" onClick={() => ir({ nome: 'apuracao', id: v.id })}>Apuração</button>}
            {v.status === 'encerrada' && <button className="sm sec" onClick={() => acao(v.id, 'abrir', 'Reabrir a votação?')}>Reabrir</button>}
            {v.status !== 'confirmada' && <button className="sm danger" onClick={() => excluir(v.id)}>Excluir</button>}
          </div>
        </div>
      ))}
    </>
  );
}

function Formulario({ api, votacao: v, igrejaSugerida = '', mandatoSugerido = '', voltar }) {
  const travado = (v?.cedulas || 0) > 0; // já há votos: só ministério, cargo e mandato podem mudar
  const [catalogo, setCatalogo] = useState([]);
  useEffect(() => { api('/api/admin/cargos').then(setCatalogo).catch(() => {}); }, []);
  const [f, setF] = useState({
    igreja: v?.igreja || igrejaSugerida,
    mandato: v?.mandato || mandatoSugerido || String(new Date().getFullYear() + 1),
    ministerio: v?.ministerio || '',
    cargo: v?.cargo || '',
    tipo: v?.tipo || 'unica',
    max_escolhas: v?.max_escolhas > 1 ? v.max_escolhas : 2,
    candidatos: v ? v.candidatos.map(c => c.nome) : ['', ''],
  });
  const set = (k, val) => setF(s => ({ ...s, [k]: val }));
  const setCand = (i, val) => setF(s => ({ ...s, candidatos: s.candidatos.map((c, j) => j === i ? val : c) }));
  const removeCand = i => setF(s => ({ ...s, candidatos: s.candidatos.filter((_, j) => j !== i) }));

  async function salvar(ev) {
    ev.preventDefault();
    await api(v ? `/api/admin/votacoes/${v.id}` : '/api/admin/votacoes', { method: v ? 'PUT' : 'POST', body: JSON.stringify(f) });
    voltar();
  }

  return (
    <div className="card">
      <h2>{v ? 'Editar' : 'Nova'} votação</h2>
      {travado && <div className="msg erro">Esta votação já tem {v.cedulas} cédula(s). Só é possível alterar ministério e cargo; tipo e candidatos ficam travados para não invalidar os votos.</div>}
      <form onSubmit={salvar}>
        <div className="linha">
          <div><label>Igreja / distrito</label>
            <input type="text" value={f.igreja} onChange={e => set('igreja', e.target.value)} placeholder="Ex.: Bosque - Distrito do Bosque" /></div>
          <div><label>Mandato (ano ou período)</label>
            <input type="text" value={f.mandato} onChange={e => set('mandato', e.target.value)} placeholder="Ex.: 2027 ou 2027-2028" /></div>
        </div>
        <div className="linha">
          <div><label>Ministério / departamento</label>
            <input type="text" list="lista-ministerios" value={f.ministerio} onChange={e => set('ministerio', e.target.value)} placeholder="Ex.: Ministério da Música" required />
            <datalist id="lista-ministerios">{catalogo.map(c => <option key={c.ministerio} value={c.ministerio} />)}</datalist></div>
          <div><label>Cargo</label>
            <input type="text" list="lista-cargos" value={f.cargo} onChange={e => set('cargo', e.target.value)} placeholder="Ex.: Diretor(a)" required />
            <datalist id="lista-cargos">{(catalogo.find(c => c.ministerio === f.ministerio)?.cargos || []).map(c => <option key={c} value={c} />)}</datalist></div>
        </div>
        <div className="sub" style={{ marginTop: 4 }}>Ministérios e cargos sugeridos conforme o Manual da Igreja (2025). Pode digitar outro.</div>
        <div className="linha">
          <div><label>Tipo de voto</label>
            <select value={f.tipo} onChange={e => set('tipo', e.target.value)} disabled={travado}>
              <option value="unica">Escolha única (1 nome)</option>
              <option value="multipla">Escolha múltipla</option>
            </select></div>
          {f.tipo === 'multipla' && <div><label>Máximo de escolhas</label>
            <input type="number" min="1" value={f.max_escolhas} onChange={e => set('max_escolhas', e.target.value)} disabled={travado} /></div>}
        </div>
        <label>Candidatos</label>
        <div className="cand-lista">
          {f.candidatos.map((c, i) => (
            <div key={i}>
              <input type="text" value={c} onChange={e => setCand(i, e.target.value)} placeholder="Nome do candidato" disabled={travado} />
              {!travado && <button type="button" className="sm sec" onClick={() => removeCand(i)}>✕</button>}
            </div>
          ))}
        </div>
        {!travado && <div className="acoes">
          <button type="button" className="sm sec" onClick={() => set('candidatos', [...f.candidatos, ''])}>+ Candidato</button>
        </div>}
        <div className="acoes" style={{ marginTop: 20 }}>
          <button type="submit">Salvar</button>
          <button type="button" className="sec" onClick={voltar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function Apuracao({ api, id, voltar }) {
  const [dados, setDados] = useState(null);
  const [eleitos, setEleitos] = useState(new Set());

  async function carregar() {
    const d = await api(`/api/admin/votacoes/${id}/apuracao`);
    setDados(d);
    const vagas = d.votacao.tipo === 'unica' ? 1 : d.votacao.max_escolhas;
    setEleitos(new Set(d.candidatos.slice(0, vagas).filter(c => c.votos > 0).map(c => c.id)));
  }
  useEffect(() => { carregar(); }, [id]);

  async function confirmar(ev) {
    ev.preventDefault();
    if (!confirm('Confirmar o resultado? Esta ação é definitiva.')) return;
    await api(`/api/admin/votacoes/${id}/confirmar`, { method: 'POST', body: JSON.stringify({ eleitos: [...eleitos] }) });
    voltar();
  }
  const alternar = cid => setEleitos(s => { const n = new Set(s); n.has(cid) ? n.delete(cid) : n.add(cid); return n; });

  if (!dados) return <div className="vazio">Carregando…</div>;
  const { votacao: v, candidatos, total_cedulas } = dados;
  const maxVotos = Math.max(1, ...candidatos.map(c => c.votos));
  const podeConfirmar = v.status === 'encerrada';

  return (
    <div className="card">
      {(v.igreja || v.mandato) && <div className="sub" style={{ marginBottom: 2 }}>{[v.igreja, v.mandato].filter(Boolean).join(' · ')}</div>}
      <h2>{v.ministerio} — {v.cargo}</h2>
      <div className="sub"><span className={`tag ${v.status}`}>{rotulo[v.status]}</span> · {total_cedulas} cédula(s) · {descTipo(v)}</div>
      {v.status === 'aberta' && <div className="msg erro">Votação ainda aberta: resultado parcial. Encerre antes de confirmar.</div>}
      <form onSubmit={confirmar}>
        <div className="tabela-wrap">
          <table>
            <thead><tr>{podeConfirmar && <th>Eleito</th>}<th>Candidato</th><th style={{ width: 110 }}>Votos</th><th style={{ width: '35%' }}></th></tr></thead>
            <tbody>
              {candidatos.map(c => (
                <tr key={c.id}>
                  {podeConfirmar && <td><input type="checkbox" checked={eleitos.has(c.id)} onChange={() => alternar(c.id)} /></td>}
                  <td>{c.nome}</td>
                  <td>{c.votos}{total_cedulas > 0 && <span className="sub"> ({Math.round(100 * c.votos / total_cedulas)}%)</span>}</td>
                  <td><div className="barra"><div style={{ width: `${100 * c.votos / maxVotos}%` }} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="acoes" style={{ marginTop: 16 }}>
          {podeConfirmar && <button type="submit" className="ok">Confirmar resultado</button>}
          <button type="button" className="sec" onClick={voltar}>Voltar</button>
          {v.status === 'aberta' && <button type="button" className="sec" onClick={carregar}>Atualizar</button>}
        </div>
        {podeConfirmar && <div className="sub" style={{ marginTop: 8 }}>
          Marque quem foi eleito (sugestão pré-marcada pelos mais votados). Ao confirmar, o resultado vai para a base de relatórios e a votação é fechada definitivamente.
        </div>}
      </form>
    </div>
  );
}
