import './globals.css';

export const metadata = {
  title: 'Votação de Cargos',
  description: 'Sistema de votação secreta para cargos de ministérios',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
