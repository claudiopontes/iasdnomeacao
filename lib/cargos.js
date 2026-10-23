/**
 * Catálogo de ministérios/departamentos e cargos da igreja local.
 * Fonte: Manual da Igreja Adventista do Sétimo Dia, edição 2025:
 *  - Cap. 9 (Organizações e oficiais da igreja local)
 *  - Cap. 11, "Composição da comissão" (Comissão Diretiva, p. 144-145)
 *  - Notas do cap. 10, nº 1, "Exemplo de lista de líderes da Igreja" (p. 195-197)
 *  - Suplemento da Divisão Sul-Americana (Recepção, Adolescente, Aventureiros)
 * O administrador pode digitar outro ministério/cargo fora desta lista.
 */
export const CATALOGO = [
  {
    ministerio: 'Liderança da Igreja',
    cargos: [
      'Primeiro-ancião(ã)', 'Ancião(ã)', 'Diretor(a) de igreja',
      'Diácono-chefe', 'Diácono', 'Diaconisa-chefe', 'Diaconisa',
      'Secretário(a)', 'Secretário(a) associado(a)',
      'Tesoureiro(a)', 'Tesoureiro(a) associado(a)',
      'Coordenador(a) de interessados',
      'Membro da Comissão Diretiva', 'Membro da Comissão de Nomeações',
      'Delegado(a) à Assembleia da Associação',
    ],
  },
  {
    ministerio: 'Escola Sabatina',
    cargos: [
      'Diretor(a)', 'Diretor(a) associado(a)', 'Secretário(a)', 'Secretário(a) associado(a)',
      'Diretor(a) da divisão de adultos', 'Diretor(a) da divisão de jovens',
      'Diretor(a) da divisão de adolescentes', 'Diretor(a) da divisão de juvenis',
      'Diretor(a) da divisão de primários', 'Diretor(a) da divisão de infantis',
      'Diretor(a) da divisão de iniciantes', 'Diretor(a) da divisão de bebês',
      'Diretor(a) da divisão de extensão', 'Secretário(a) do Fundo de Inversão',
      'Professor(a)',
    ],
  },
  {
    ministerio: 'Ministério Pessoal',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)', 'Secretário(a)', 'Coordenador(a) da classe bíblica', 'Coordenador(a) de pequenos grupos'],
  },
  {
    ministerio: 'Ação Solidária Adventista (ASA)',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)', 'Secretário(a)-tesoureiro(a)', 'Coordenador(a)'],
  },
  {
    ministerio: 'Sociedade de Homens Adventistas',
    cargos: ['Coordenador(a)'],
  },
  {
    ministerio: 'Ministério Jovem Adventista',
    cargos: [
      'Diretor(a)', 'Diretor(a) associado(a)', 'Secretário(a)-tesoureiro(a)', 'Secretário(a)-tesoureiro(a) associado(a)',
      'Diretor(a) de música', 'Pianista/organista', 'Líder de Jovens Adultos', 'Conselheiro(a)',
    ],
  },
  {
    ministerio: 'Ministério de Embaixadores',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)', 'Secretário(a)-tesoureiro(a)', 'Secretário(a)-tesoureiro(a) associado(a)', 'Diretor(a) de música'],
  },
  {
    ministerio: 'Ministério de Universitários',
    cargos: ['Coordenador(a)'],
  },
  {
    ministerio: 'Clube de Desbravadores',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)', 'Secretário(a)', 'Tesoureiro(a)', 'Capelão', 'Instrutor(a)', 'Conselheiro(a)'],
  },
  {
    ministerio: 'Clube de Aventureiros',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)', 'Secretário(a)', 'Tesoureiro(a)', 'Capelão', 'Instrutor(a)', 'Conselheiro(a)'],
  },
  {
    ministerio: 'Ministério do Adolescente',
    cargos: ['Coordenador(a)', 'Coordenador(a) associado(a)'],
  },
  {
    ministerio: 'Ministério da Criança',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)', 'Coordenador(a) da Escola Bíblica', 'Diretor(a) da Escola Cristã de Férias'],
  },
  {
    ministerio: 'Ministério da Música',
    cargos: ['Diretor(a) de música', 'Diretor(a) do coral', 'Organista/pianista', 'Coordenador(a)'],
  },
  {
    ministerio: 'Comunicação',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)', 'Membro da comissão de comunicação'],
  },
  {
    ministerio: 'Educação',
    cargos: ['Diretor(a)', 'Presidente da Associação Lar e Escola', 'Secretário(a)-tesoureiro(a) da Associação Lar e Escola', 'Membro do Conselho Escolar'],
  },
  {
    ministerio: 'Ministério da Família',
    cargos: ['Diretor(a)', 'Casal diretor', 'Diretor(a) associado(a)'],
  },
  {
    ministerio: 'Ministério da Saúde',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)'],
  },
  {
    ministerio: 'Ministério de Oração',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)'],
  },
  {
    ministerio: 'Ministério de Publicações',
    cargos: ['Coordenador(a)', 'Diretor(a)'],
  },
  {
    ministerio: 'Assuntos Públicos e Liberdade Religiosa',
    cargos: ['Diretor(a)'],
  },
  {
    ministerio: 'Ministério de Mordomia Cristã',
    cargos: ['Diretor(a)', 'Diretor(a) associado(a)'],
  },
  {
    ministerio: 'Escritos do Espírito de Profecia',
    cargos: ['Coordenador(a)'],
  },
  {
    ministerio: 'Ministério da Mulher',
    cargos: ['Diretora', 'Diretora associada'],
  },
  {
    ministerio: 'Ministério Adventista das Possibilidades',
    cargos: ['Diretor(a)', 'Líder'],
  },
  {
    ministerio: 'Ministério da Recepção',
    cargos: ['Coordenador(a)', 'Recepcionista'],
  },
];

export const MINISTERIOS = CATALOGO.map(c => c.ministerio);
export const cargosDe = (ministerio) => CATALOGO.find(c => c.ministerio === ministerio)?.cargos ?? [];
