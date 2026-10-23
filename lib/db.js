import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS votacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ministerio TEXT NOT NULL,
    cargo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('unica','multipla')),
    max_escolhas INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','aberta','encerrada','confirmada')),
    criada_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    aberta_em TEXT,
    encerrada_em TEXT
  );

  CREATE TABLE IF NOT EXISTS candidatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    votacao_id INTEGER NOT NULL REFERENCES votacoes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL
  );

  -- cédulas: cada linha é uma escolha; sem nenhuma referência ao eleitor
  CREATE TABLE IF NOT EXISTS votos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    votacao_id INTEGER NOT NULL REFERENCES votacoes(id) ON DELETE CASCADE,
    candidato_id INTEGER NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    cedula TEXT NOT NULL
  );

  -- controle de "já votou" por dispositivo (token aleatório, não identifica a pessoa)
  CREATE TABLE IF NOT EXISTS participacoes (
    votacao_id INTEGER NOT NULL REFERENCES votacoes(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    PRIMARY KEY (votacao_id, token)
  );

  -- base simples de resultados confirmados, para relatórios futuros
  CREATE TABLE IF NOT EXISTS resultados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    votacao_id INTEGER NOT NULL,
    ministerio TEXT NOT NULL,
    cargo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    candidato TEXT NOT NULL,
    votos INTEGER NOT NULL,
    total_cedulas INTEGER NOT NULL,
    eleito INTEGER NOT NULL DEFAULT 0,
    confirmado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`;

function abrir() {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const raw = new DatabaseSync(path.join(dataDir, 'voto.db'));
  raw.exec('PRAGMA journal_mode = WAL');
  raw.exec('PRAGMA foreign_keys = ON');
  // Interface mínima compatível com a usada nas rotas (prepare/exec/transaction)
  const db = {
    prepare: (sql) => raw.prepare(sql),
    exec: (sql) => raw.exec(sql),
    /** Executa fn dentro de uma transação; devolve uma função, como no better-sqlite3 */
    transaction: (fn) => (...args) => {
      raw.exec('BEGIN');
      try {
        const r = fn(...args);
        raw.exec('COMMIT');
        return r;
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
  db.exec(SCHEMA);
  // migrações simples: adiciona colunas novas se faltarem
  for (const tabela of ['votacoes', 'resultados']) {
    const cols = db.prepare(`PRAGMA table_info(${tabela})`).all().map(c => c.name);
    if (!cols.includes('mandato')) db.exec(`ALTER TABLE ${tabela} ADD COLUMN mandato TEXT NOT NULL DEFAULT ''`);
    if (!cols.includes('igreja')) db.exec(`ALTER TABLE ${tabela} ADD COLUMN igreja TEXT NOT NULL DEFAULT ''`);
  }
  return db;
}

// Uma única conexão por processo, aberta somente no primeiro uso (nunca na importação do módulo).
// Isso evita "database is locked" quando o `next build` carrega várias rotas em paralelo.
const g = globalThis;
function obter() {
  if (!g.__votoDb) {
    let tentativas = 0;
    for (;;) {
      try { g.__votoDb = abrir(); break; }
      catch (e) {
        if (String(e.message).includes('locked') && tentativas++ < 20) {
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100); // espera 100 ms
          continue;
        }
        throw e;
      }
    }
  }
  return g.__votoDb;
}
export const db = {
  prepare: (sql) => obter().prepare(sql),
  exec: (sql) => obter().exec(sql),
  transaction: (fn) => obter().transaction(fn),
};
/** Consulta preparada de forma preguiçosa: só compila no primeiro uso. */
export function lazy(sql) {
  let st;
  const s = () => (st ??= obter().prepare(sql));
  return { get: (...a) => s().get(...a), all: (...a) => s().all(...a), run: (...a) => s().run(...a) };
}
