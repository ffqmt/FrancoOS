// Textos de rascunho: ajuste à vontade.
const ADMIN_URL = "https://admin.francotech.com.br";

// Atalhos de acesso às ferramentas. Sem link ainda = aparece como "em breve".
const ferramentas = [
  { nome: "AUTAX", texto: "Automação fiscal e reforma tributária", link: "https://autax.app.br" },
  { nome: "Contai", texto: "Contabilidade com inteligência artificial", link: "https://contai.app.br" },
  { nome: "Medcheck", texto: "Acesso ao Medcheck", link: "" },
];

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
  {
    nome: "Automações",
    texto: "Cobrança, emissão de notas, avisos por WhatsApp e entregas do Simples sem trabalho manual.",
    link: "#contato",
  },
];

const servicos = [
  { nome: "Contabilidade completa", texto: "Escrituração, balancetes, balanço e DRE para Simples, Presumido e Real." },
  { nome: "Fiscal e tributário", texto: "Apuração de tributos, Simples Nacional, SPEDs e obrigações acessórias." },
  { nome: "Departamento pessoal", texto: "Folha de pagamento, admissões, rescisões e encargos." },
  { nome: "Societário", texto: "Abertura, alteração contratual e baixa de empresas." },
  { nome: "Fechamentos terceirizados", texto: "Fechamento contábil por competência para outros escritórios." },
  { nome: "Planejamento", texto: "Escolha do regime e organização financeira da empresa." },
];

const passos = [
  { n: "1", titulo: "Conversa", texto: "Entendemos a rotina da sua empresa ou escritório e onde o trabalho trava." },
  { n: "2", titulo: "Implantação", texto: "Organizamos a contabilidade e ligamos as ferramentas certas ao seu processo." },
  { n: "3", titulo: "Acompanhamento", texto: "Entregas no prazo, avisos automáticos e alguém que responde quando você precisa." },
];

export default function Home() {
  return (
    <>
      <div className="container">
        <header className="topo">
          <span className="marca"><img src="/marca/simbolo-franco.png" alt="" width={34} height={34} /> Franco Tecnologia</span>
          <nav>
            <a href="#produtos">Produtos</a>
            <a href="#contabilidade">Contabilidade</a>
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
            escritórios e empresas, e cuidamos da contabilidade de quem quer foco no próprio negócio.
          </p>
          <p className="hero-botoes">
            <a className="botao" href="#produtos">
              Conheça os produtos
            </a>
            <a className="botao secundario" href="#contabilidade">
              Serviços contábeis
            </a>
          </p>
        </section>

        <section className="acessos" aria-label="Acesso às ferramentas">
          {ferramentas.map((f) =>
            f.link ? (
              <a className="acesso" key={f.nome} href={f.link} target="_blank" rel="noopener noreferrer">
                <strong>{f.nome}</strong>
                <span>{f.texto}</span>
                <span className="acesso-seta" aria-hidden>↗</span>
              </a>
            ) : (
              <div className="acesso em-breve" key={f.nome}>
                <strong>{f.nome}</strong>
                <span>Em breve</span>
              </div>
            ),
          )}
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

        <section className="secao" id="contabilidade">
          <div className="rotulo">Franco Contabilidade</div>
          <h2>Contabilidade com tecnologia junto</h2>
          <div className="grade">
            {servicos.map((s) => (
              <div className="cartao" key={s.nome}>
                <h3>{s.nome}</h3>
                <p>{s.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="secao" id="como">
          <div className="rotulo">Como trabalhamos</div>
          <h2>Simples do começo ao fim</h2>
          <div className="grade">
            {passos.map((p) => (
              <div className="passo" key={p.n}>
                <span className="passo-n">{p.n}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
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

      <a className="atalho-admin" href={ADMIN_URL} aria-label="Entrar no painel" title="Painel">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </a>
    </>
  );
}
