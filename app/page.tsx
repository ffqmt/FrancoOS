// Textos de rascunho: ajuste à vontade.
const produtos = [
  {
    nome: "AUTAX",
    texto: "Automação fiscal para escritórios e empresas, com foco nas mudanças da reforma tributária.",
    link: "https://autax.app.br",
  },
  {
    nome: "Contai",
    texto: "Contabilidade com inteligência artificial para organizar, conferir e responder mais rápido.",
    link: "https://contai.app.br",
  },
  {
    nome: "Consultoria",
    texto: "Diagnóstico e implantação de processos e tecnologia para escritórios contábeis.",
    link: "#contato",
  },
];

export default function Home() {
  return (
    <>
      <div className="container">
        <header className="topo">
          <span className="marca">FrancoTech</span>
          <nav>
            <a href="#produtos">Produtos</a>
            <a href="#historia">História</a>
            <a href="#contato">Contato</a>
          </nav>
        </header>

        <section className="hero">
          <div className="rotulo">Franco Tecnologia</div>
          <h1>
            Tecnologia feita por quem vive a <em>contabilidade</em>.
          </h1>
          <p>
            Nascemos dentro da Franco Contabilidade. Criamos ferramentas que resolvem o dia a dia fiscal e contábil de
            escritórios e empresas.
          </p>
          <p>
            <a className="botao" href="#produtos">
              Conheça os produtos
            </a>
          </p>
        </section>

        <section className="secao" id="produtos">
          <div className="rotulo">Produtos</div>
          <h2>O que fazemos</h2>
          <div className="grade">
            {produtos.map((p) => (
              <div className="cartao" key={p.nome}>
                <h3>{p.nome}</h3>
                <p>{p.texto}</p>
                <a href={p.link}>Saiba mais →</a>
              </div>
            ))}
          </div>
        </section>

        <section className="secao" id="historia">
          <div className="rotulo">História</div>
          <h2>Da contabilidade para o software</h2>
          <p style={{ color: "var(--texto-suave)", maxWidth: "64ch" }}>
            Anos atendendo empresas na Franco Contabilidade mostraram onde o trabalho trava: obrigações que mudam,
            planilhas que não conversam e tempo gasto em tarefas repetidas. A FrancoTech existe para transformar essa
            experiência em produtos.
          </p>
        </section>

        <section className="secao" id="contato">
          <div className="rotulo">Contato</div>
          <h2>Vamos conversar</h2>
          <p>
            <a className="botao" href="https://instagram.com/franco_tecnologia">
              @franco_tecnologia
            </a>
          </p>
        </section>
      </div>
      <footer className="rodape">
        <div className="container">© {new Date().getFullYear()} FrancoTech · francotech.com.br</div>
      </footer>
    </>
  );
}
