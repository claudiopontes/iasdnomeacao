# Votação de Cargos (igreja)

Sistema simples de votação secreta para cargos de ministérios. Next.js 15 + SQLite (arquivo local).

## Telas

| Rota | Quem usa | O que faz |
|---|---|---|
| `/` | Membros (sem login) | Lista as votações abertas e registra o voto |
| `/admin` | Administrador (senha) | Cria votações, abre, encerra, apura e confirma resultados |
| `/relatorio` | Administrador | Base de resultados confirmados, com filtro e download CSV |

## Campos de uma votação

| Campo | Exemplo | Observação |
|---|---|---|
| Igreja / distrito | Bosque - Distrito do Bosque | Separa os resultados por congregação no relatório |
| Mandato | 2027 ou 2027-2028 | O manual prevê mandato de 1 ano, ou 2 por voto da igreja (p. 82) |
| Ministério / departamento | Ministério da Música | Lista sugerida conforme o manual; pode digitar outro |
| Cargo | Diretor(a) | Lista sugerida filtrada pelo ministério; pode digitar outro |
| Tipo | única / múltipla | Múltipla define o máximo de escolhas (vagas) |
| Candidatos | nomes | Mínimo de 2 |

O catálogo de ministérios e cargos está em `lib/cargos.js` e segue as Notas do capítulo 10
(p. 195-197), a composição da Comissão Diretiva (p. 144-145) e o Suplemento da Divisão
Sul-Americana do Manual da Igreja 2025. Edite o arquivo para ajustar à sua igreja.

## O que o Manual da Igreja diz sobre eleições (cap. 10)

- A escolha dos oficiais passa pela **Comissão de Nomeações**, que apresenta um relatório à igreja
  em culto de sábado ou Reunião Administrativa. A igreja vota o relatório uma ou duas semanas depois (p. 127).
- A eleição é feita por **maioria de votos dos presentes e votantes** (p. 127). Só **membros em situação
  regular** podem ser eleitos e votar; membro sob censura não vota (p. 73, 126, 142).
- Votos por procuração ou por carta **não são permitidos** (p. 142, 145). Participação por meio eletrônico
  vale como presença, quando autorizada pela Associação e aprovada pela igreja (p. 142).
- Cargos vagos entre eleições são preenchidos por indicação da Comissão Diretiva, submetida ao voto da igreja (p. 128).

Este sistema cobre o momento da **votação em plenário**: registra votos secretos, apura e guarda o
resultado confirmado pelo administrador. O trabalho da Comissão de Nomeações, a verificação de quem
está em situação regular e a condução da reunião continuam sendo responsabilidade da igreja.

## Fluxo de uma votação

1. Admin cadastra: Igreja, Mandato, Ministério, Cargo, tipo (única ou múltipla com limite) e candidatos. Status **rascunho**.
2. Admin clica em **Abrir votação**. Ela aparece na tela `/` para todos.
3. Membros votam. O voto é anônimo: a cédula não guarda nenhum dado do eleitor.
4. Admin clica em **Encerrar**, confere a apuração, marca os eleitos e **Confirma**.
5. Confirmado, o resultado é gravado na tabela `resultados` e aparece em `/relatorio`.

## Controle de voto duplicado

Como ninguém se identifica, o sistema grava um cookie aleatório no navegador e impede
um segundo voto na mesma votação a partir dele. Isso evita o duplo clique e o "votar de novo
sem querer", mas não impede quem limpar os cookies ou usar outro aparelho. Para uma
assembleia presencial é suficiente; se precisar de rigor maior, o próximo passo seria
distribuir códigos de uso único.

## Rodar localmente

```bash
# senha do admin: admin123 (padrão, sem precisar configurar nada)
npm install
npm run dev                  # http://localhost:3000
```

## Publicar no SaveInCloud (Jelastic)

1. Crie um ambiente **Node.js** (versão 20 ou 22).
2. Envie o projeto (Git ou upload) para a pasta `ROOT` do nó.
3. Em **Variables** do nó, defina:
   - `ADMIN_PASSWORD` só se quiser outra senha; sem ela vale `admin123`
   - `COOKIE_SECURE` = `1` (se usar HTTPS/SSL no ambiente)
   - `DATA_DIR` = pasta persistente para o banco, por exemplo `/home/jelastic/data`
   - `PORT` já vem definido pelo Jelastic (normalmente `8080`); o `npm start` o respeita.
4. Em **Entry Point / Start command**, use `npm run build && npm start`
   (ou rode o `npm run build` uma vez via SSH e deixe só `npm start`).
5. Reinicie o nó e acesse `https://seu-ambiente.../admin`.

O arquivo `voto.db` fica em `DATA_DIR`. Faça backup dele antes de redeploys.
