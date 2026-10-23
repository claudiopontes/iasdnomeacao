import Simbolo from './Simbolo';

/**
 * Cabeçalho com o símbolo oficial. Conforme o manual de identidade, o nome da
 * igreja local fica abaixo de "Igreja Adventista do Sétimo Dia".
 */
export default function Cabecalho({ titulo, igreja, children }) {
  return (
    <header className="cab">
      <div className="cab-inner">
        <div className="cab-marca">
          <Simbolo size={44} color="#fff" />
          <div className="cab-nomes">
            <div className="cab-iasd">Igreja Adventista do Sétimo Dia</div>
            {igreja && <div className="cab-local">{igreja}</div>}
          </div>
        </div>
        {children && <nav className="cab-nav">{children}</nav>}
      </div>
      {titulo && <div className="cab-titulo"><div className="cab-inner"><h1>{titulo}</h1></div></div>}
    </header>
  );
}
