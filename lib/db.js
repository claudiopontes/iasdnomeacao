import Database from 'better-sqlite3';
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
  const db = new Database(path.join(dataDir, 'voto.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  // migrações simples: adiciona colunas novas se faltarem
  for (const tabela of ['votacoes', 'resultados']) {
    const cols = db.prepare(`PRAGMA table_info(${tabela})`).all().map(c => c.name);
    if (!cols.includes('mandato')) db.exec(`ALTER TABLE ${tabela} ADD COLUMN mandato TEXT NOT NULL DEFAULT ''`);
    if (!cols.includes('igreja')) db.exec(`ALTER TABLE ${tabela} ADD COLUMN igreja TEXT NOT NULL DEFAULT ''`);
  }
  return db;
}

// Uma única conexão por processo (sobrevive ao hot reload do dev)
const g = globalThis;
export const db = g.__votoDb ?? (g.__votoDb = abrir());
