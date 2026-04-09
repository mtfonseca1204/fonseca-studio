(function () {
    const STORAGE_KEY = 'siteLanguage';
    const SUPPORTED_LANGUAGES = new Set(['en', 'pt']);
    const originalText = new WeakMap();
    const originalAttrs = new WeakMap();
    const originalTitle = document.title;

    const TEXT_MAP = {
        'Fonseca Studio — Senior UX/UI & Product Designer | Rio de Janeiro': 'Fonseca Studio — Senior UX/UI e Designer de Produto | Rio de Janeiro',
        'All Projects - Fonseca Studio': 'Todos os Projetos - Fonseca Studio',
        'Transparent.space - Fonseca Studio': 'Transparent.space - Fonseca Studio',
        'Transparent.space Brand - Fonseca Studio': 'Transparent.space Brand - Fonseca Studio',
        'Hedgehog - Fonseca Studio': 'Hedgehog - Fonseca Studio',
        'NORA - Fonseca Studio': 'NORA - Fonseca Studio',
        'Petrobras Saúde - Fonseca Studio': 'Petrobras Sa\u00fade - Fonseca Studio',
        'Picnic - Fonseca Studio': 'Picnic - Fonseca Studio',
        'Caramel - Fonseca Studio': 'Caramel - Fonseca Studio',
        'AURA - Fonseca Studio': 'AURA - Fonseca Studio',
        'Unimed Seguros - Fonseca Studio': 'Unimed Seguros - Fonseca Studio',

        'Work,': 'Projetos,',
        'Services,': 'Servi\u00e7os,',
        'About,': 'Sobre,',
        'Clients': 'Clientes',
        "Let's Talk": 'Vamos conversar',
        'Work': 'Projetos',
        'Services': 'Servi\u00e7os',
        'About': 'Sobre',
        'I design': 'Eu desenho',
        'products people': 'produtos que as pessoas',
        "can't stop": 'n\u00e3o conseguem parar de',
        'using': 'usar',
        'Turning complex ideas into intuitive experiences. Every pixel, every interaction — designed to make your users stay.': 'Transformando ideias complexas em experi\u00eancias intuitivas. Cada pixel, cada intera\u00e7\u00e3o — pensado para fazer seus usu\u00e1rios ficarem.',
        'Based in Rio de Janeiro': 'Baseado no Rio de Janeiro',
        'Working worldwide': 'Atendendo o mundo todo',
        'Open for projects': 'Dispon\u00edvel para projetos',
        'See the work': 'Ver projetos',
        '(Latest drops)': '(Projetos em destaque)',
        'See all projects': 'Ver todos os projetos',
        'View Project': 'Ver projeto',
        'Product Design': 'Design de Produto',
        'UX Design': 'UX Design',
        'Branding': 'Branding',
        'UI Design': 'UI Design',
        'Website Design': 'Design de Site',
        'Key Visual': 'Key Visual',
        '(Services)': '(Servi\u00e7os)',
        'Brand Strategy': 'Estrat\u00e9gia de Marca',
        'Visual Identity': 'Identidade Visual',
        'UX/UI Design': 'UX/UI Design',
        'Systems & Guidelines': 'Sistemas & Diretrizes',
        '(Process)': '(Processo)',
        'How I work': 'Como eu trabalho',
        'A proven approach that ensures we deliver the right solution, on time and on budget.': 'Uma abordagem comprovada para entregar a solu\u00e7\u00e3o certa, no prazo e dentro do escopo.',
        'Discover': 'Descobrir',
        'Research users & business goals to understand the challenge.': 'Pesquiso usu\u00e1rios e objetivos de neg\u00f3cio para entender o desafio.',
        'Define': 'Definir',
        'Synthesize insights and define a clear design strategy.': 'Sintetizo insights e defino uma estrat\u00e9gia de design clara.',
        'Design': 'Desenhar',
        'Create wireframes, prototypes, and polished UI designs.': 'Crio wireframes, prot\u00f3tipos e interfaces refinadas.',
        'Analyze': 'Analisar',
        'Test with real users and iterate based on data insights.': 'Testo com usu\u00e1rios reais e itero com base em dados.',
        'Deliver': 'Entregar',
        'Hand off designs with specs and support development.': 'Fa\u00e7o o handoff com especifica\u00e7\u00f5es e apoio ao desenvolvimento.',
        'About Me': 'Sobre mim',
        "I don't just design interfaces. I solve": 'Eu n\u00e3o apenas desenho interfaces. Eu resolvo',
        'problems.': 'problemas.',
        "I'm Matheus Fonseca aka ''Fonseca'', a UX/UI & Product Designer based in Rio de Janeiro, Brazil. I specialize in translating complex challenges into clear, intuitive experiences that drive real results. From Web3 platforms to healthcare systems, I design products that people actually want to use.": 'Sou Matheus Fonseca, tamb\u00e9m conhecido como Fonseca, um UX/UI & Product Designer baseado no Rio de Janeiro, Brasil. Sou especializado em transformar desafios complexos em experi\u00eancias claras e intuitivas que geram resultados reais. De plataformas Web3 a sistemas de sa\u00fade, desenho produtos que as pessoas realmente querem usar.',
        "My approach is simple: understand deeply, design intentionally, and deliver with precision. I've led design for enterprise clients like Petrobras Saúde and Unimed Seguros, and won 1st place at ETHSamba 2023 and BlockchainRio 2024. Whether it's a bold brand identity or a full product redesign, I bring strategy, craft, and obsessive attention to detail to every project.": 'Minha abordagem \u00e9 simples: entender a fundo, desenhar com inten\u00e7\u00e3o e entregar com precis\u00e3o. Liderei design para clientes enterprise como Petrobras Sa\u00fade e Unimed Seguros e conquistei o 1\u00ba lugar no ETHSamba 2023 e no BlockchainRio 2024. Seja uma identidade ousada ou um redesenho completo de produto, levo estrat\u00e9gia, repert\u00f3rio e aten\u00e7\u00e3o obsessiva aos detalhes para cada projeto.',
        'Tools & Skills': 'Ferramentas & Habilidades',
        'Prototyping': 'Prototipa\u00e7\u00e3o',
        'User Research': 'Pesquisa com Usu\u00e1rios',
        'Website Design': 'Design de Site',
        'Strategy Design': 'Estrat\u00e9gia de Design',
        'Work With Me': 'Trabalhe comigo',
        'Testimonials': 'Depoimentos',
        'What clients say': 'O que os clientes dizem',
        '"Fonseca has been an exceptional designer to work with. He combines strong visual intuition with a clear understanding of product goals, which consistently results in designs that are not only visually striking but also practical and user-focused. What stands out most is his ability to translate abstract ideas and rough direction into clean, well-thought-out design systems. He works fast without sacrificing quality, communicates clearly, and iterates thoughtfully based on feedback."': '"Fonseca tem sido um designer excepcional para trabalhar. Ele combina uma forte intui\u00e7\u00e3o visual com uma compreens\u00e3o clara dos objetivos do produto, o que resulta de forma consistente em designs visualmente marcantes, pr\u00e1ticos e centrados no usu\u00e1rio. O que mais se destaca \u00e9 sua capacidade de transformar ideias abstratas e direcionamentos iniciais em sistemas de design limpos e muito bem pensados. Trabalha r\u00e1pido sem perder qualidade, comunica-se com clareza e evolui o trabalho com crit\u00e9rio a partir do feedback."',
        '"Fonseca is my go-to designer for everything. I explain it once, and he comes back with something insanely premium. Zero back-and-forth, always top-tier."': '"Fonseca \u00e9 meu designer de confian\u00e7a para tudo. Eu explico uma vez, e ele volta com algo absurdamente premium. Zero retrabalho, sempre em alt\u00edssimo n\u00edvel."',
        '"Fonseca is a hardworking guy and I decided to hire him for AI Agent Arena because of his outstanding skills on UX/UI and also his strong communication skills which led to the success of v1 for AI Agent Arena."': '"Fonseca \u00e9 um profissional muito dedicado e decidi contrat\u00e1-lo para a AI Agent Arena por causa das suas habilidades excepcionais em UX/UI e tamb\u00e9m pela sua comunica\u00e7\u00e3o muito forte, que foi essencial para o sucesso da v1 da AI Agent Arena."',
        '"Working with Fonseca was a great experience. He took our brand positioning and translated it into a cohesive visual identity system—defining clear standards and templates that made it so much easier to create social media content and apply our brand consistently across different touchpoints. His ability to understand not just what we needed, but why we needed it, made all the difference. Highly recommended."': '"Trabalhar com o Fonseca foi uma \u00f3tima experi\u00eancia. Ele transformou o posicionamento da nossa marca em um sistema de identidade visual coeso, definindo padr\u00f5es e templates claros que facilitaram muito a cria\u00e7\u00e3o de conte\u00fado para redes sociais e a aplica\u00e7\u00e3o consistente da marca em diferentes pontos de contato. Sua capacidade de entender n\u00e3o apenas o que precis\u00e1vamos, mas por que precis\u00e1vamos, fez toda a diferen\u00e7a. Recomendo muito."',
        'Founder, Transparent Space': 'Fundador, Transparent Space',
        'Founder, Agent Arena': 'Fundador, Agent Arena',
        'Head of Design, Picnic': 'Head de Design, Picnic',
        'Trusted by teams at': 'Marcas e times que confiaram no trabalho',
        'Get in Touch': 'Entre em contato',
        "Let's create something great together": 'Vamos criar algo incr\u00edvel juntos',
        "Have a project in mind? I'd love to hear about it. Let's discuss how I can help bring your vision to life.": 'Tem um projeto em mente? Vou gostar de ouvir sobre ele. Vamos conversar sobre como posso ajudar a transformar sua vis\u00e3o em realidade.',
        'Remote / Worldwide': 'Remoto / Mundo todo',
        'Find me on': 'Me encontre em',
        'Available for new projects': 'Dispon\u00edvel para novos projetos',
        'Your Name': 'Seu nome',
        'Email Address': 'Email',
        'Project Type': 'Tipo de projeto',
        'Budget Range': 'Faixa de or\u00e7amento',
        'Project Details': 'Detalhes do projeto',
        'Branding': 'Branding',
        'UX Research': 'Pesquisa em UX',
        'Design System': 'Design System',
        'Full Project': 'Projeto Completo',
        'Other': 'Outro',
        'Send Message': 'Enviar mensagem',
        'Creating digital experiences that matter.': 'Criando experi\u00eancias digitais que importam.',
        'Contact': 'Contato',
        'All rights reserved.': 'Todos os direitos reservados.',
        'Back to top ↑': 'Voltar ao topo ↑',
        'Message Sent!': 'Mensagem enviada!',
        "Thank you for reaching out. I'll get back to you within 24-48 hours.": 'Obrigado pelo contato. Vou responder em at\u00e9 24-48 horas.',
        'Got it': 'Entendi',

        'Back to Home': 'Voltar para a home',
        'All Projects': 'Todos os projetos',
        'A complete collection of my work across UX research, UI design, and digital product development.': 'Uma cole\u00e7\u00e3o completa do meu trabalho em pesquisa de UX, UI design e desenvolvimento de produtos digitais.',
        'All': 'Todos',
        'Web': 'Web',
        'Mobile': 'Mobile',
        'Visual identity and UI design system crafted for clarity, trust, and innovation.': 'Identidade visual e sistema de interface criados para transmitir clareza, confian\u00e7a e inova\u00e7\u00e3o.',
        'Institutional landing page for a Web3 Prediction Market application with waitlist functionality.': 'Landing page institucional para uma aplica\u00e7\u00e3o Web3 de prediction market com capta\u00e7\u00e3o para lista de espera.',
        'Brand identity for a plant-based bakery built around simplicity, care, and belonging.': 'Identidade de marca para uma padaria plant-based constru\u00edda sobre simplicidade, cuidado e pertencimento.',
        'Brand positioning and visual identity system with templates for consistent brand application.': 'Posicionamento de marca e sistema de identidade visual com templates para aplica\u00e7\u00e3o consistente.',
        'Social Media': 'Redes Sociais',
        'Meme coin creation platform on LaChain, making on-chain token launches accessible to everyone.': 'Plataforma de cria\u00e7\u00e3o de meme coins na LaChain, tornando lan\u00e7amentos on-chain acess\u00edveis para qualquer pessoa.',
        'Meme Coins': 'Meme Coins',
        'Luxury jewelry brand built around presence, contrast, and self-expression.': 'Marca de joias de luxo constru\u00edda em torno de presen\u00e7a, contraste e autoexpress\u00e3o.',
        'Luxury': 'Luxo',
        "Healthcare platform redesign for one of Brazil's largest corporate health plans.": 'Redesenho de plataforma de sa\u00fade para um dos maiores planos corporativos do Brasil.',
        'Healthcare': 'Sa\u00fade',
        'Enterprise': 'Enterprise',
        'Web Platform': 'Plataforma Web',
        'Insurance and healthcare app redesign improving user experience for millions of beneficiaries.': 'Redesenho de aplicativo de seguros e sa\u00fade, melhorando a experi\u00eancia de milh\u00f5es de benefici\u00e1rios.',
        'Insurance': 'Seguros',
        'Mobile App': 'Aplicativo Mobile',
        'Have a project in mind?': 'Tem um projeto em mente?',
        "Let's discuss how I can help bring your vision to life.": 'Vamos conversar sobre como posso ajudar a dar vida \u00e0 sua vis\u00e3o.',
        'Start a Conversation': 'Iniciar uma conversa',

        'Tech / SaaS / Web3': 'Tecnologia / SaaS / Web3',
        'All Projects': 'Todos os projetos',
        'MY ROLE': 'MEU PAPEL',
        'YEAR': 'ANO',
        'TEAM': 'EQUIPE',
        'SCOPE': 'ESCOPO',
        'Overview': 'Vis\u00e3o geral',
        'Problem': 'Problema',
        'Goal': 'Objetivo',
        'Solution': 'Solu\u00e7\u00e3o',
        'Results': 'Resultados',
        'Research': 'Pesquisa',
        'Visual System': 'Sistema Visual',
        'Lessons': 'Aprendizados',
        'Next Steps': 'Pr\u00f3ximos passos',
        'INTRO': 'INTRO',
        'PROBLEM': 'PROBLEMA',
        'GOAL': 'OBJETIVO',
        'SOLUTION': 'SOLU\u00c7\u00c3O',
        'RESULTS': 'RESULTADOS',
        'RESEARCH': 'PESQUISA',
        'DESIGN': 'DESIGN',
        'VISUAL SYSTEM': 'SISTEMA VISUAL',
        'LESSONS': 'APRENDIZADOS',
        'NEXT STEPS': 'PR\u00d3XIMOS PASSOS',
        'Latest Works': 'Projetos recentes',
        'See more clicking here': 'Ver mais projetos',
        '(Contact)': '(Contato)',
        "Let's create everything your brand needs": 'Vamos criar tudo o que a sua marca precisa',

        'Product design and UX for a platform focused on clarity and accessibility in digital experiences.': 'Design de produto e UX para uma plataforma focada em clareza e acessibilidade em experi\u00eancias digitais.',
        'SaaS': 'SaaS',
        'Product Designer': 'Designer de Produto',
        'Brand Designer': 'Designer de Marca',
        'Brand Designer / UI Designer': 'Designer de Marca / UI Designer',
        'Myself': 'Eu',
        'Myself(UX/UI Design) / Bruno Eleodo (Developer)': 'Eu (UX/UI Design) / Bruno Eleodo (Desenvolvedor)',
        'Myself (Design), Picnic Team': 'Eu (Design), time Picnic',
        'Myself / Karla Granadeiro': 'Eu / Karla Granadeiro',
        'Myself (Designer/product), Pedro (Product Manager), Bruno (Developer)': 'Eu (designer/produto), Pedro (gerente de produto), Bruno (desenvolvedor)',
        'Product Design / UX Design': 'Design de Produto / UX Design',
        'Brand Identity / Naming / Visual System': 'Identidade de Marca / Naming / Sistema Visual',
        'UX/UI Design, Token Launch, Product Design': 'UX/UI Design, lan\u00e7amento de token, design de produto',
        'UX/UI Design / Landing Page': 'UX/UI Design / Landing Page',
        'Branding, Visual Identity, Packaging': 'Branding, identidade visual, embalagem',
        'UX Research, UX/UI Design, Healthcare Platform': 'Pesquisa em UX, UX/UI Design, plataforma de sa\u00fade',
        'Key Visual, Brand Guidelines, Social Templates': 'Key Visual, brand guidelines, templates para social',
        'Branding, Visual Identity, UI Design': 'Branding, identidade visual, UI Design',
        'UX Research / UX/UI Design / Design System': 'Pesquisa em UX / UX/UI Design / Design System',
        'DURATION': 'DURA\u00c7\u00c3O',
        '8 Weeks': '8 semanas',
        'Jewelry / Luxury': 'Joalheria / Luxo',
        'Web3 / Meme Coins': 'Web3 / Meme Coins',
        'Web3 / Prediction Market': 'Web3 / Mercado de Previs\u00e3o',
        'Bakery / Vegan Food': 'Padaria / Alimenta\u00e7\u00e3o Vegana',
        'Healthcare / Corporate': 'Sa\u00fade / Corporativo',
        'Insurance / Healthcare': 'Seguros / Sa\u00fade',
        'Fintech, Web3, Digital Payments': 'Fintech, Web3, pagamentos digitais',
        'Design Applications': 'Aplica\u00e7\u00f5es do design',
        'Design Principles': 'Princ\u00edpios de design',
        'Branding & Visual System': 'Branding & Sistema Visual',

        'Transparent.space is a Web3 platform focused on verifiable proof of Market Maker performance, bringing together critical data such as SLA, liquidity, spreads, uptime, pool depth, and historical behavior in a single institutional environment.': 'Transparent.space \u00e9 uma plataforma Web3 focada em prova verific\u00e1vel da performance de market makers, reunindo dados cr\u00edticos como SLA, liquidez, spreads, uptime, profundidade de pool e comportamento hist\u00f3rico em um \u00fanico ambiente institucional.',
        'This project focused on designing the core product experience, transforming complex operational metrics into actionable intelligence.': 'Este projeto teve foco no desenho da experi\u00eancia central do produto, transformando m\u00e9tricas operacionais complexas em intelig\u00eancia acion\u00e1vel.',
        'Users needed a platform that could:': 'Os usu\u00e1rios precisavam de uma plataforma que pudesse:',
        'Centralize performance visibility': 'Centralizar a visibilidade de performance',
        'Surface critical deviations instantly': 'Destacar desvios cr\u00edticos instantaneamente',
        'Provide confidence in operational reliability': 'Transmitir confian\u00e7a na confiabilidade operacional',
        'Design a product experience that:': 'Desenhar uma experi\u00eancia de produto que:',
        'Enables instant situational awareness': 'Permita consci\u00eancia situacional imediata',
        'Turns raw infrastructure data into decision-ready insights': 'Transforme dados brutos de infraestrutura em insights prontos para decis\u00e3o',
        'Supports both real-time monitoring and historical analysis': 'Apoie tanto monitoramento em tempo real quanto an\u00e1lise hist\u00f3rica',
        'The platform experience was designed around three pillars:': 'A experi\u00eancia da plataforma foi desenhada em torno de tr\u00eas pilares:',
        '1. Immediate Status Recognition': '1. Reconhecimento imediato de status',
        'High-level performance summaries allow users to assess system health within seconds.': 'Resumos de performance em alto n\u00edvel permitem avaliar a sa\u00fade do sistema em segundos.',
        '2. Layered Data Exploration': '2. Explora\u00e7\u00e3o de dados em camadas',
        'Users can progressively drill down from global performance metrics into granular operational details without losing context.': 'Os usu\u00e1rios podem aprofundar progressivamente de m\u00e9tricas globais de performance para detalhes operacionais granulares sem perder contexto.',
        '3. Signal-Driven Visual Feedback': '3. Feedback visual guiado por sinais',
        'Color systems, indicators and structured layouts guide attention toward anomalies and critical events.': 'Sistemas de cor, indicadores e layouts estruturados direcionam a aten\u00e7\u00e3o para anomalias e eventos cr\u00edticos.',
        'Dashboards prioritize clarity and hierarchy, ensuring users can interpret performance states quickly during time-sensitive scenarios.': 'Os dashboards priorizam clareza e hierarquia, garantindo que os usu\u00e1rios interpretem estados de performance rapidamente em cen\u00e1rios sens\u00edveis ao tempo.',
        'Faster anomaly detection': 'Detec\u00e7\u00e3o mais r\u00e1pida de anomalias',
        'Reduced time to performance diagnosis': 'Redu\u00e7\u00e3o do tempo para diagnosticar performance',
        'Improved operational confidence for liquidity providers': 'Maior confian\u00e7a operacional para provedores de liquidez',
        'Stronger perception of reliability and professionalism': 'Percep\u00e7\u00e3o mais forte de confiabilidade e profissionalismo',
        'Research included:': 'A pesquisa incluiu:',
        'Interviews with crypto market operators': 'Entrevistas com operadores do mercado cripto',
        'Analysis of trading desk workflows': 'An\u00e1lise de fluxos de mesas de opera\u00e7\u00e3o',
        'Benchmarking observability and monitoring tools': 'Benchmark de ferramentas de observabilidade e monitoramento',
        'Mapping cognitive load in real-time dashboards': 'Mapeamento de carga cognitiva em dashboards em tempo real',
        'Insights revealed that speed of comprehension is more valuable than quantity of metrics displayed.': 'Os insights mostraram que velocidade de compreens\u00e3o vale mais do que quantidade de m\u00e9tricas exibidas.',
        'Design decisions prioritized:': 'As decis\u00f5es de design priorizaram:',
        'Information hierarchy over density': 'Hierarquia da informa\u00e7\u00e3o acima de densidade',
        'Persistent context across navigation layers': 'Contexto persistente entre as camadas de navega\u00e7\u00e3o',
        'Responsive layouts for multi-screen environments': 'Layouts responsivos para ambientes com m\u00faltiplas telas',
        'Interaction patterns were optimized for users operating in parallel trading systems.': 'Os padr\u00f5es de intera\u00e7\u00e3o foram otimizados para usu\u00e1rios que operam sistemas de trading em paralelo.',
        'The product visual language reinforces usability through:': 'A linguagem visual do produto refor\u00e7a a usabilidade por meio de:',
        'Contrast-driven alert states': 'Estados de alerta guiados por contraste',
        'Structured dashboard grids': 'Grades estruturadas de dashboard',
        'Clear metric grouping': 'Agrupamento claro de m\u00e9tricas',
        'Functional iconography for rapid scanning': 'Iconografia funcional para leitura r\u00e1pida',
        'Visual clarity acts as a performance tool, not just an aesthetic choice.': 'Clareza visual atua como ferramenta de performance, n\u00e3o apenas como escolha est\u00e9tica.',
        'Lessons Learned': 'Aprendizados',
        'Monitoring tools must reduce stress, not amplify it': 'Ferramentas de monitoramento precisam reduzir estresse, n\u00e3o aument\u00e1-lo',
        'Operational dashboards require clarity under pressure': 'Dashboards operacionais exigem clareza sob press\u00e3o',
        'Good product design in finance is measured by decision speed': 'Bom design de produto em finan\u00e7as \u00e9 medido pela velocidade de decis\u00e3o',
        'Predictive alerts powered by historical patterns': 'Alertas preditivos baseados em padr\u00f5es hist\u00f3ricos',
        'Cross-platform synchronization': 'Sincroniza\u00e7\u00e3o multiplataforma',
        'Advanced reporting for institutional stakeholders': 'Relat\u00f3rios avan\u00e7ados para stakeholders institucionais',

        'The challenge was to build a visual identity that:': 'O desafio era construir uma identidade visual que:',
        'Signals premium positioning': 'Sinalize posicionamento premium',
        'Feels luxurious without being ornate': 'Pare\u00e7a luxuosa sem ser ornamental',
        'Evokes dark romance not gothic cliché': 'Evoca romance sombrio, n\u00e3o clich\u00ea g\u00f3tico',
        'Translates across identity, packaging, and digital touchpoints': 'Funcione em identidade, embalagem e pontos de contato digitais',
        'Craft a brand identity system that:': 'Criar um sistema de identidade de marca que:',
        'Establishes AURA as a luxury jewelry name': 'Posicione a AURA como uma marca de joalheria de luxo',
        'Conveys depth, mystique, and restraint': 'Transmita profundidade, mist\u00e9rio e conten\u00e7\u00e3o',
        'Uses refined visual language to differentiate from typical jewelry branding': 'Use uma linguagem visual refinada para se diferenciar do branding comum de joias',
        'Sets a foundation for product presentation, packaging, and storytelling': 'Crie uma base para apresenta\u00e7\u00e3o de produto, embalagem e storytelling',
        'The visual identity gelled around a concept of elegant shadow and refined stillness:': 'A identidade visual tomou forma a partir de um conceito de sombra elegante e quietude refinada:',
        'Visual Approach': 'Abordagem visual',
        'Dark Palette: Deep, rich tones combined with elegant neutrals to signal premium quality': 'Paleta escura: tons profundos e ricos combinados com neutros elegantes para comunicar qualidade premium',
        'Typography: High-contrast serif and elegant sans-serif pairings to balance timeless refinement with contemporary poise': 'Tipografia: combina\u00e7\u00f5es de serifas de alto contraste e sans-serifs elegantes para equilibrar sofistica\u00e7\u00e3o atemporal com postura contempor\u00e2nea',
        'Negative Space: Generous use of space to reinforce minimalism and elevate product focus': 'Espa\u00e7o negativo: uso generoso de respiro para refor\u00e7ar o minimalismo e elevar o foco no produto',
        'Logo & Symbol: A subtly distinctive mark that feels like a signature — poised, restrained, and luxurious': 'Logo & s\u00edmbolo: uma marca sutilmente distintiva que funciona como assinatura — precisa, contida e luxuosa',
        'Brand Feeling': 'Sensa\u00e7\u00e3o de marca',
        'AURA’s visual language embraces:': 'A linguagem visual da AURA abra\u00e7a:',
        'Quiet power': 'For\u00e7a silenciosa',
        'Modern refinement': 'Refinamento moderno',
        'Meticulous craftsmanship': 'Acabamento meticuloso',
        'Subtle intensity': 'Intensidade sutil',
        'This identity system doesn’t shout luxury — it asserts it with quiet confidence.': 'Esse sistema de identidade n\u00e3o grita luxo — ele o afirma com confian\u00e7a silenciosa.',
        'The identity extends coherently into:': 'A identidade se estende de forma coerente para:',
        'Logo lockups and signage': 'Assinaturas de logo e sinaliza\u00e7\u00e3o',
        'Jewelry packaging — dark touchpoints with premium materials': 'Embalagens de joias — pontos de contato escuros com materiais premium',
        'Digital presence — elegant layouts that prioritize imagery and mood': 'Presen\u00e7a digital — layouts elegantes que priorizam imagem e atmosfera',
        'Brand materials — editorial elements that reinforce narrative and tone': 'Materiais de marca — elementos editoriais que refor\u00e7am narrativa e tom',
        'The overall visual system ensures that every touchpoint feels considered, intentional, and luxurious.': 'O sistema visual como um todo garante que cada ponto de contato pare\u00e7a pensado, intencional e luxuoso.',
        'A distinctive brand identity that elevates AURA in a crowded category': 'Uma identidade de marca distinta que eleva a AURA em uma categoria competitiva',
        'A visual system with flexibility and longevity for future product lines': 'Um sistema visual com flexibilidade e longevidade para futuras linhas de produto',
        'A refined, premium aura that supports storytelling and experiential design': 'Uma aura refinada e premium que sustenta storytelling e design experiencial',
        'Clear differentiation from traditional jewelry branding tropes': 'Diferencia\u00e7\u00e3o clara em rela\u00e7\u00e3o aos clich\u00eas do branding de joias',
        'Restraint over ornamentation — luxury through simplicity': 'Conten\u00e7\u00e3o acima de ornamenta\u00e7\u00e3o — luxo por meio da simplicidade',
        'Contrast over decoration — shadows, space, tone': 'Contraste acima de decora\u00e7\u00e3o — sombras, espa\u00e7o, tom',
        'Focus over distraction — minimal visual noise, maximal impact': 'Foco acima de distra\u00e7\u00e3o — m\u00ednimo ru\u00eddo visual, impacto m\u00e1ximo',
        'Expand into digital product showcases and editorial storytelling': 'Expandir para showcases digitais de produto e storytelling editorial',
        'Develop e-commerce oriented visual language': 'Desenvolver linguagem visual orientada a e-commerce',
        'Craft campaign visuals for seasonal or collection releases': 'Criar visuais de campanha para lan\u00e7amentos sazonais ou de cole\u00e7\u00f5es',

        'For people interested in experimenting, building communities, or launching cultural internet-native assets, the process can feel intimidating instead of exciting.': 'Para pessoas interessadas em experimentar, construir comunidades ou lan\u00e7ar ativos culturais nativos da internet, o processo pode parecer intimidador em vez de empolgante.',
        'Design a platform that simplifies meme coin creation without making the product feel superficial or untrustworthy.': 'Desenhar uma plataforma que simplifique a cria\u00e7\u00e3o de meme coins sem fazer o produto parecer superficial ou pouco confi\u00e1vel.',
        'The goal was to:': 'O objetivo era:',
        'Reduce the complexity of token creation': 'Reduzir a complexidade da cria\u00e7\u00e3o de tokens',
        'Make the experience intuitive for non-technical users': 'Tornar a experi\u00eancia intuitiva para usu\u00e1rios n\u00e3o t\u00e9cnicos',
        'Create a fast and lightweight flow from idea to launch': 'Criar um fluxo r\u00e1pido e leve da ideia ao lan\u00e7amento',
        'Balance ease of use with transparency around on-chain actions': 'Equilibrar facilidade de uso com transpar\u00eancia sobre as a\u00e7\u00f5es on-chain',
        'Caramel was designed as a frictionless token creation experience, where users can create, launch, and interact with meme coins in just a few clicks.': 'Caramel foi desenhado como uma experi\u00eancia sem fric\u00e7\u00e3o para cria\u00e7\u00e3o de tokens, em que os usu\u00e1rios podem criar, lan\u00e7ar e interagir com meme coins em apenas alguns cliques.',
        'The product approach focused on:': 'A abordagem de produto foi focada em:',
        'Simple step-by-step flows to reduce cognitive load': 'Fluxos simples passo a passo para reduzir carga cognitiva',
        'Clear interface patterns to guide first-time users': 'Padr\u00f5es de interface claros para guiar usu\u00e1rios de primeira viagem',
        'Fast launch interactions inspired by consumer-grade UX': 'Intera\u00e7\u00f5es de lan\u00e7amento r\u00e1pidas inspiradas em UX de n\u00edvel de produto de consumo',
        'Transparent smart contract interactions that abstract complexity without hiding how the system works': 'Intera\u00e7\u00f5es transparentes com smart contracts que abstraem complexidade sem esconder como o sistema funciona',
        'The research process combined market analysis, competitive references, and quick user validation during the hackathon cycle.': 'O processo de pesquisa combinou an\u00e1lise de mercado, refer\u00eancias competitivas e valida\u00e7\u00e3o r\u00e1pida com usu\u00e1rios durante o ciclo do hackathon.',
        'The design direction prioritized a lightweight and intuitive interface, influenced by products that reduce friction through strong visual hierarchy and minimal decision-making.': 'A dire\u00e7\u00e3o de design priorizou uma interface leve e intuitiva, influenciada por produtos que reduzem fric\u00e7\u00e3o por meio de forte hierarquia visual e decis\u00e3o m\u00ednima.',
        'Key principles included:': 'Os princ\u00edpios principais inclu\u00edram:',
        'Intuitive onboarding for first-time users': 'Onboarding intuitivo para usu\u00e1rios de primeira viagem',
        'Reduced form complexity': 'Menor complexidade de formul\u00e1rio',
        'Guided interaction patterns': 'Padr\u00f5es de intera\u00e7\u00e3o guiados',
        'Quick comprehension of each step in the launch flow': 'Compreens\u00e3o r\u00e1pida de cada etapa do fluxo de lan\u00e7amento',
        'The interface was built to feel immediate and simple, while still aligned with the speed and energy of crypto-native products.': 'A interface foi constru\u00edda para parecer imediata e simples, mantendo alinhamento com a velocidade e a energia de produtos nativos de cripto.',
        'Caramel’s branding explored a more playful and internet-native visual language, aligned with meme culture but structured enough to support product trust.': 'O branding da Caramel explorou uma linguagem visual mais divertida e nativa da internet, alinhada \u00e0 cultura meme, mas estruturada o suficiente para sustentar confian\u00e7a no produto.',
        'The identity helped position the platform as:': 'A identidade ajudou a posicionar a plataforma como:',
        'Approachable rather than intimidating': 'Acolhedora em vez de intimidadora',
        'Lightweight rather than overly technical': 'Leve em vez de excessivamente t\u00e9cnica',
        'Community-driven rather than purely transactional': 'Guiada por comunidade em vez de puramente transacional',
        'This balance was important to make the experience feel accessible without losing credibility.': 'Esse equil\u00edbrio foi importante para tornar a experi\u00eancia acess\u00edvel sem perder credibilidade.',
        'Caramel was developed and presented during BlockchainRio 2024, where it stood out as an award-winning concept.': 'Caramel foi desenvolvida e apresentada durante o BlockchainRio 2024, onde se destacou como um conceito premiado.',
        'Caramel reinforced an important product principle: simplifying blockchain UX is not about removing depth, but about removing unnecessary friction.': 'Caramel refor\u00e7ou um princ\u00edpio importante de produto: simplificar UX em blockchain n\u00e3o \u00e9 remover profundidade, mas eliminar fric\u00e7\u00f5es desnecess\u00e1rias.',
        'It also showed how product design can translate complex infrastructure into experiences that feel fast, clear, and culturally relevant.': 'Tamb\u00e9m mostrou como o design de produto pode traduzir infraestruturas complexas em experi\u00eancias r\u00e1pidas, claras e culturalmente relevantes.',
        'The next evolution of Caramel could include:': 'A pr\u00f3xima evolu\u00e7\u00e3o da Caramel pode incluir:',
        'Richer launch customizationg': 'Customiza\u00e7\u00f5es de lan\u00e7amento mais ricas',
        'Community features around token creation': 'Recursos de comunidade em torno da cria\u00e7\u00e3o de tokens',
        'Improved onboarding for first-time wallet users': 'Onboarding melhorado para usu\u00e1rios iniciando em carteiras',
        'Stronger post-launch token management flows': 'Fluxos mais fortes de gest\u00e3o de tokens ap\u00f3s o lan\u00e7amento',

        'Design a landing experience that:': 'Desenhar uma experi\u00eancia de landing page que:',
        'Communicates Hedgehog’s value and positioning in clear, trust-centric terms': 'Comunique o valor e o posicionamento da Hedgehog em termos claros e centrados em confian\u00e7a',
        'Aligns visuals and messaging with institutional expectations': 'Alinhe visual e mensagem \u00e0s expectativas institucionais',
        'Reduces friction toward user interest capture (waitlist sign-ups)': 'Reduza a fric\u00e7\u00e3o na captura de interesse do usu\u00e1rio (lista de espera)',
        'Provides measurable conversion signals for marketing analysis': 'Gere sinais mensur\u00e1veis de convers\u00e3o para an\u00e1lise de marketing',
        'Success metrics included:': 'Os indicadores de sucesso inclu\u00edram:',
        'Waitlist sign-up rate': 'Taxa de inscri\u00e7\u00e3o na lista de espera',
        'Engagement with key sections (scroll depth)': 'Engajamento com se\u00e7\u00f5es-chave (profundidade de scroll)',
        'CTA click-through rate from hero and footer': 'Taxa de clique nos CTAs da hero e do rodap\u00e9',
        'The landing page was structured to guide users from value signal → credibility → action using a clear content hierarchy:': 'A landing page foi estruturada para conduzir o usu\u00e1rio de sinal de valor \u2192 credibilidade \u2192 a\u00e7\u00e3o, usando uma hierarquia de conte\u00fado clara:',
        'Hero with Explicit Value & CTA': 'Hero com proposta de valor expl\u00edcita & CTA',
        'A concise header communicating Hedgehog’s promise': 'Um cabe\u00e7alho conciso comunicando a promessa da Hedgehog',
        'Institutional language tailored to professional users': 'Linguagem institucional voltada para usu\u00e1rios profissionais',
        'Primary CTA: Join Waitlist — placed above the fold to capture early interest': 'CTA principal: entrar na lista de espera — posicionado acima da dobra para capturar interesse cedo',
        'Trust & Context Sections': 'Se\u00e7\u00f5es de confian\u00e7a & contexto',
        'Problem statement for the user’s world': 'Apresenta\u00e7\u00e3o do problema no contexto do usu\u00e1rio',
        'Overview of Hedgehog’s differentiators': 'Vis\u00e3o geral dos diferenciais da Hedgehog',
        'Segments tailored to enterprise concerns (security, reliability, governance)': 'Blocos adaptados a preocupa\u00e7\u00f5es enterprise (seguran\u00e7a, confiabilidade, governan\u00e7a)',
        'Action Reinforcement': 'Refor\u00e7o da a\u00e7\u00e3o',
        'Repeated CTA placement with micro-copy that shifts from awareness to intent': 'Repeti\u00e7\u00e3o de CTAs com microcopy que evolui de consci\u00eancia para inten\u00e7\u00e3o',
        'Social proof and performance indicators (where applicable)': 'Prova social e indicadores de performance (quando aplic\u00e1vel)',
        'Footer with additional context and secondary CTA': 'Rodap\u00e9 com contexto adicional e CTA secund\u00e1rio',
        'Conversion-Driven Patterns': 'Padr\u00f5es orientados \u00e0 convers\u00e3o',
        'Sticky or repeated CTAs for users who scroll': 'CTAs fixos ou repetidos para quem rola a p\u00e1gina',
        'Short, form-first waitlist input modules': 'M\u00f3dulos curtos de capta\u00e7\u00e3o focados no formul\u00e1rio',
        'Microcopy emphasizing exclusivity and benefit': 'Microcopy enfatizando exclusividade e benef\u00edcio',
        'The Hedgehog landing performed strongly within its niche target segment:': 'A landing da Hedgehog performou muito bem dentro do seu segmento de nicho:',
        'Waitlist Conversion Rate: 35% (above industry average for B2B SaaS)': 'Taxa de convers\u00e3o para lista de espera: 35% (acima da m\u00e9dia do setor para SaaS B2B)',
        'CTA Click-Through Rate: strong engagement from hero and mid-page CTAs': 'Taxa de clique em CTA: forte engajamento nos CTAs da hero e do meio da p\u00e1gina',
        'Scroll-Depth Retention: high percentage of users reached trust and metric sections before converting': 'Reten\u00e7\u00e3o por profundidade de scroll: alta porcentagem de usu\u00e1rios alcan\u00e7ou se\u00e7\u00f5es de confian\u00e7a e m\u00e9tricas antes de converter',
        'Visitors demonstrated a pattern of engagement indicative of qualified interest, helping the product team build an early pipeline of users for beta rollouts.': 'Os visitantes demonstraram um padr\u00e3o de engajamento indicativo de interesse qualificado, ajudando o time de produto a formar um pipeline inicial de usu\u00e1rios para o beta.',
        'The design strategy was informed by:': 'A estrat\u00e9gia de design foi orientada por:',
        'Benchmarking institutional product pages (SaaS, FinTech, Web3 tooling)': 'Benchmark de p\u00e1ginas institucionais de produto (SaaS, FinTech, ferramentas Web3)',
        'Audience behavior patterns for professional conversion flows': 'Padr\u00f5es de comportamento de audi\u00eancia em fluxos de convers\u00e3o profissionais',
        'Competitive analysis of waitlist-driven acquisition funnels': 'An\u00e1lise competitiva de funis de aquisi\u00e7\u00e3o baseados em lista de espera',
        'Key insight: in institutional and professional contexts, users convert best when trust, context and clarity are established before asking for contact or commitment.': 'Insight principal: em contextos institucionais e profissionais, os usu\u00e1rios convertem melhor quando confian\u00e7a, contexto e clareza s\u00e3o estabelecidos antes de pedir contato ou compromisso.',
        'Design decisions emphasized:': 'As decis\u00f5es de design enfatizaram:',
        'Institutional typography for clarity and seriousness': 'Tipografia institucional para clareza e seriedade',
        'A restrained visual palette': 'Uma paleta visual contida',
        'High information hierarchy with clear section anchors': 'Alta hierarquia de informa\u00e7\u00e3o com \u00e2ncoras de se\u00e7\u00e3o claras',
        'Efficient information chunking to support scan-driven behavior': 'Blocos eficientes de informa\u00e7\u00e3o para apoiar leitura r\u00e1pida',
        'Structural clarity – grid-based composition': 'Clareza estrutural – composi\u00e7\u00e3o baseada em grid',
        'Functional contrast – for CTA focus': 'Contraste funcional – para foco no CTA',
        'Consistent spacing – for readability': 'Espa\u00e7amento consistente – para legibilidade',
        'Iconography – to support narrative flow': 'Iconografia – para apoiar o fluxo narrativo',
        'This system enabled users to progress logically from problem → value → action.': 'Esse sistema permitiu que os usu\u00e1rios progredissem logicamente de problema \u2192 valor \u2192 a\u00e7\u00e3o.',
        'Institutional audiences respond to clarity, not flash': 'P\u00fablicos institucionais respondem a clareza, n\u00e3o a efeitos',
        'Conversion in professional pages requires trust signals earlier than CTAs': 'Convers\u00e3o em p\u00e1ginas profissionais exige sinais de confian\u00e7a antes dos CTAs',
        'Waitlist CTAs must promise benefit not just access': 'CTAs de lista de espera precisam prometer benef\u00edcio, n\u00e3o apenas acesso',
        'A/B test variations on headline microcopy and CTA placement': 'Testar varia\u00e7\u00f5es de microcopy de headline e posicionamento de CTA',
        'Integrate early user feedback into landing copy refinement': 'Integrar feedback inicial de usu\u00e1rios no refinamento do texto da landing',
        'Segment waitlist users for tailored onboarding flows': 'Segmentar usu\u00e1rios da lista de espera para fluxos de onboarding personalizados',
        'Add tracking to further measure engagement and path drop-offs': 'Adicionar rastreamento para medir melhor engajamento e abandono de fluxo',

        'The project aimed to:': 'O projeto buscou:',
        'Establish a differentiated brand identity that tells a story — not just sells pastries': 'Estabelecer uma identidade de marca diferenciada que conte uma hist\u00f3ria — n\u00e3o apenas venda produtos',
        'Create a flexible visual system adaptible to physical and digital applications': 'Criar um sistema visual flex\u00edvel e adapt\u00e1vel a aplica\u00e7\u00f5es f\u00edsicas e digitais',
        'Build an engaging online presence through a landing page with emphasis on sensory experience and narrative': 'Construir uma presen\u00e7a online envolvente por meio de uma landing page com \u00eanfase em experi\u00eancia sensorial e narrativa',
        'Set a foundation for future engagement campaigns (e.g., seasonal offerings, newsletter signups)': 'Criar uma base para futuras campanhas de engajamento (ofertas sazonais, inscri\u00e7\u00e3o em newsletter)',
        'The design strategy centered around craft-centric storytelling and sensory resonance, with a visual system that balances warmth with refined simplicity.': 'A estrat\u00e9gia de design foi centrada em storytelling orientado ao artesanal e resson\u00e2ncia sensorial, com um sistema visual que equilibra calor e simplicidade refinada.',
        'Brand Identity': 'Identidade de Marca',
        'Logo & Symbol – Custom typography combining subtle craft cues with modern restraint': 'Logo & s\u00edmbolo – tipografia customizada combinando sinais sutis de artesanal com conten\u00e7\u00e3o contempor\u00e2nea',
        'Color Palette – Earth tones and warm neutrals that evoke ingredients, oven glow and artisanal materials': 'Paleta de cores – tons terrosos e neutros quentes que evocam ingredientes, brilho de forno e materiais artesanais',
        'Typography – Elegant yet grounded type choices that feel readable and premium': 'Tipografia – escolhas elegantes, mas com base s\u00f3lida, leg\u00edveis e premium',
        'Vibe & Mood – A visual language inspired by textures (linen, woodgrain, flour dust) and natural light': 'Atmosfera – uma linguagem visual inspirada em texturas (linho, madeira, farinha) e luz natural',
        'This identity system was designed to be flexible, memorable, and rooted in the emotional experience of artisan bakery.': 'Esse sistema de identidade foi desenhado para ser flex\u00edvel, memor\u00e1vel e enraizado na experi\u00eancia emocional de uma padaria artesanal.',
        'Strong visual reception from early users and clients, consistent praise for warmth and premium feeling': 'Forte recep\u00e7\u00e3o visual entre usu\u00e1rios e clientes iniciais, com elogios consistentes ao calor e \u00e0 sensa\u00e7\u00e3o premium',
        'Increased visitor engagement on the landing page, longer scroll depth and time on page': 'Aumento do engajamento na landing page, com maior profundidade de scroll e tempo na p\u00e1gina',
        'Newsletter opt-in engagement that positioned the brand for future seasonal marketing': 'Capta\u00e7\u00e3o para newsletter que preparou a marca para futuros ciclos sazonais de marketing',
        'A scalable brand system that works across digital, print and physical environments': 'Um sistema de marca escal\u00e1vel que funciona em ambientes digitais, impressos e f\u00edsicos',
        'The identity and digital presence succeeded at creating a brand that feels real, tactile and sincere, not just another bakery.': 'A identidade e a presen\u00e7a digital conseguiram criar uma marca que parece real, t\u00e1til e sincera, n\u00e3o apenas mais uma padaria.',
        'Brand and design decisions were informed by:': 'As decis\u00f5es de marca e design foram guiadas por:',
        'Artisanal bakery culture and craft food trends': 'Cultura de padarias artesanais e tend\u00eancias em alimentos autorais',
        'Competitor analysis, identifying gaps in emotional storytelling': 'An\u00e1lise de concorrentes, identificando lacunas em storytelling emocional',
        'Sensory branding studies (how imagery and color evoke smell, taste, and feel)': 'Estudos de branding sensorial (como imagem e cor evocam cheiro, sabor e sensa\u00e7\u00e3o)',
        'Local audience behavior and expectations for premium food brands': 'Comportamento da audi\u00eancia local e expectativas para marcas premium de alimentos',
        'Key takeaway: heritage cues + modern clarity = emotional credibility.': 'Aprendizado principal: sinais de heran\u00e7a + clareza contempor\u00e2nea = credibilidade emocional.',
        'Design principles focused on:': 'Os princ\u00edpios de design focaram em:',
        'Balance between craft warmth and refined elegance': 'Equil\u00edbrio entre calor artesanal e eleg\u00e2ncia refinada',
        'Hierarchy that supports comfort and readability': 'Hierarquia que apoia conforto e legibilidade',
        'Visual pacing that evokes sensory experience': 'Ritmo visual que evoca experi\u00eancia sensorial',
        'Modularity for future expansions (menus, events, seasonal drops)': 'Modularidade para expans\u00f5es futuras (menus, eventos, lan\u00e7amentos sazonais)',
        'The system was built to feel both handcrafted and digitally fluent.': 'O sistema foi criado para parecer ao mesmo tempo artesanal e digitalmente maduro.',
        'The visual system reinforces brand positioning through:': 'O sistema visual refor\u00e7a o posicionamento da marca por meio de:',
        'Natural palettes': 'Paletas naturais',
        'Custom typography': 'Tipografia personalizada',
        'Sensory-rich photography styling': 'Dire\u00e7\u00e3o fotogr\u00e1fica rica em sensorialidade',
        'Clear grids that support clear narrative flow': 'Grades claras que sustentam um fluxo narrativo claro',
        'Together, these elements form a consistent expression of the NORA brand across all touchpoints.': 'Juntos, esses elementos formam uma express\u00e3o consistente da marca NORA em todos os pontos de contato.',
        'Sensory storytelling deepens user engagement beyond functional copy': 'Storytelling sensorial aprofunda o engajamento para al\u00e9m do texto funcional',
        'Emotional connection is as important as visual clarity in premium food brands': 'Conex\u00e3o emocional \u00e9 t\u00e3o importante quanto clareza visual em marcas premium de alimentos',
        'Digital presence must feel like the physical brand, not just represent it': 'A presen\u00e7a digital precisa parecer a marca f\u00edsica, n\u00e3o apenas represent\u00e1-la',
        'Expand into seasonal campaigns and digital newsletters': 'Expandir para campanhas sazonais e newsletters digitais',
        'Develop packaging systems based on the visual identity': 'Desenvolver sistemas de embalagem com base na identidade visual',

        'This project combined UX research, digital health workflows, and service design to deliver a trusted and accessible telehealth experience for a large institutional user base.': 'Este projeto combinou pesquisa em UX, fluxos de sa\u00fade digital e service design para entregar uma experi\u00eancia de telemedicina confi\u00e1vel e acess\u00edvel para uma ampla base institucional.',
        'When the pandemic began, traditional healthcare channels faced capacity challenges, risks of infection, and logistical barriers. Petrobras needed a solution that:': 'Quando a pandemia come\u00e7ou, os canais tradicionais de sa\u00fade enfrentaram desafios de capacidade, risco de infec\u00e7\u00e3o e barreiras log\u00edsticas. A Petrobras precisava de uma solu\u00e7\u00e3o que:',
        'Reduced pressure on physical health clinics': 'Reduzisse a press\u00e3o sobre as cl\u00ednicas presenciais',
        'Allowed employees to access medical support remotely': 'Permitisse que colaboradores acessassem suporte m\u00e9dico remotamente',
        'Provided clear health guidance specific to COVID-19 symptoms and risk factors': 'Oferecesse orienta\u00e7\u00f5es claras sobre sintomas e fatores de risco da COVID-19',
        'Felt reliable and trustworthy for a broad user audience (non-medical and medical alike)': 'Transmitisse confiabilidade para um p\u00fablico amplo, tanto leigo quanto m\u00e9dico',
        'Existing health systems were often fragmented, intimidating, or unfriendly to users unfamiliar with remote care platforms.': 'Sistemas de sa\u00fade existentes eram frequentemente fragmentados, intimidados ou pouco amig\u00e1veis para usu\u00e1rios sem familiaridade com plataformas remotas.',
        'Design a easy-to-use telemedicine platform that:': 'Desenhar uma plataforma de telemedicina f\u00e1cil de usar que:',
        'Enables remote access to medical professionals': 'Permita acesso remoto a profissionais de sa\u00fade',
        'Provides clear direction for COVID-related concerns': 'Ofere\u00e7a orienta\u00e7\u00f5es claras para preocupa\u00e7\u00f5es relacionadas \u00e0 COVID',
        'Reduces user stress and uncertainty in symptom evaluation': 'Reduza estresse e incerteza do usu\u00e1rio na avalia\u00e7\u00e3o de sintomas',
        'Works intuitively for users of all tech proficiency levels': 'Funcione de forma intuitiva para usu\u00e1rios de todos os n\u00edveis de profici\u00eancia digital',
        'Institutional goals also included improved health outcomes and reduced clinic overload.': 'Os objetivos institucionais tamb\u00e9m inclu\u00edam melhores desfechos de sa\u00fade e menor sobrecarga das cl\u00ednicas.',
        'The Saúde Petrobras telemedicine experience was designed around clarity, empathy, and accessibility.': 'A experi\u00eancia de telemedicina da Sa\u00fade Petrobras foi desenhada em torno de clareza, empatia e acessibilidade.',
        'Key Components': 'Componentes principais',
        'Symptom Triage Flow – Simple guided steps to help users describe health concerns and prioritize urgency': 'Fluxo de triagem de sintomas – etapas guiadas e simples para ajudar o usu\u00e1rio a descrever preocupa\u00e7\u00f5es de sa\u00fade e priorizar urg\u00eancia',
        'Remote Consultation Interface – Easy scheduling and live interaction with medical professionals': 'Interface de consulta remota – agendamento simples e intera\u00e7\u00e3o ao vivo com profissionais de sa\u00fade',
        'Resource & Guidance Hub – Centralized health information, FAQs, and personalized recommendations': 'Hub de recursos & orienta\u00e7\u00e3o – informa\u00e7\u00f5es centralizadas, FAQ e recomenda\u00e7\u00f5es personalizadas',
        'Mobile-Friendly Experience – Support for on-the-go access during urgent needs': 'Experi\u00eancia mobile-friendly – suporte para acesso em movimento em situa\u00e7\u00f5es urgentes',
        'Analysis of telehealth usage trends during COVID-19': 'An\u00e1lise das tend\u00eancias de uso de telemedicina durante a COVID-19',
        'User interviews with employees familiar with existing health systems': 'Entrevistas com colaboradores familiarizados com sistemas de sa\u00fade existentes',
        'Mapping of pain points in traditional medical appointment flows': 'Mapeamento de pontos de dor em fluxos tradicionais de consulta',
        'Usability testing on prototype flows': 'Testes de usabilidade em fluxos prototipados',
        'Research revealed that users wanted:': 'A pesquisa revelou que os usu\u00e1rios queriam:',
        'Reassurance, not complexity': 'Seguran\u00e7a, n\u00e3o complexidade',
        'Clear next steps, not medical jargon': 'Pr\u00f3ximos passos claros, n\u00e3o jarg\u00e3o m\u00e9dico',
        'Quick access, not long waiting periods': 'Acesso r\u00e1pido, n\u00e3o longos per\u00edodos de espera',
        'These insights shaped the product’s simplicity and clarity focus.': 'Esses insights moldaram o foco do produto em simplicidade e clareza.',
        'The interface was designed with:': 'A interface foi desenhada com:',
        'Straightforward language and plain visuals': 'Linguagem direta e visual simples',
        'Modular screens that guide step by step': 'Telas modulares que guiam passo a passo',
        'Minimal cognitive load at every interaction': 'Carga cognitiva m\u00ednima em cada intera\u00e7\u00e3o',
        'Progressive health guidance embedded into each flow': 'Orienta\u00e7\u00e3o progressiva de sa\u00fade embutida em cada fluxo',
        'Special care was taken to reduce stress in moments of health concern through predictable structure, clear feedback, and reassuring visual cues.': 'Houve cuidado especial para reduzir estresse em momentos de preocupa\u00e7\u00e3o com sa\u00fade por meio de estrutura previs\u00edvel, feedback claro e sinais visuais tranquilizadores',

        'Fonseca Studio. All rights reserved.': 'Fonseca Studio. Todos os direitos reservados.',
        '(Product Design)': '(Design de Produto)',
        'Prediction Market': 'Mercado de Previs\u00e3o',
        'Food & Beverage': 'Alimentos & Bebidas',
        'DESIGN APPLICATIONS': 'APLICA\u00c7\u00d5ES DO DESIGN',
        'DESIGN PRINCIPLES': 'PRINC\u00cdPIOS DE DESIGN',
        'BRANDING': 'MARCA',
        'BRANDING & VISUAL SYSTEM': 'MARCA & SISTEMA VISUAL',
        'Core Experience': 'Experi\u00eancia principal',
        'Key user insights:': 'Principais insights dos usu\u00e1rios:',
        'Components and assets delivered:': 'Componentes e ativos entregues:',
        'Brand Guidelines': 'Guia de marca',
        'The work spanned:': 'O trabalho abrangeu:',
        'Visual identity system': 'Sistema de identidade visual',
        'Brand narrative and positioning': 'Narrativa e posicionamento de marca',
        'Landing page and digital collateral': 'Landing page e materiais digitais',
        'Packaging mood and visual direction': 'Moodboard de embalagem e dire\u00e7\u00e3o visual',
        'Create social media templates and content direction': 'Criar templates para redes sociais e dire\u00e7\u00e3o de conte\u00fado',
        'The visual system balanced:': 'O sistema visual equilibrou:',
        'Design decisions were informed by:': 'As decis\u00f5es de design foram orientadas por:',
        'I identify the position your brand can own and the language to express it with clarity. Research, competitive mapping, audience insights, naming, messaging, and architecture come together as a practical plan that guides design and go to market.': 'Eu identifico o espa\u00e7o que sua marca pode ocupar e a linguagem para express\u00e1-lo com clareza. Pesquisa, mapeamento competitivo, insights de audi\u00eancia, naming, mensagens e arquitetura se transformam em um plano pr\u00e1tico que orienta o design e o go-to-market.',
        'I craft identities that read fast and feel distinctive across every touchpoint. Custom wordmarks and symbols are paired with a precise system of type, color, imagery, motion, and iconography so recognition and recall grow with each impression.': 'Eu crio identidades que s\u00e3o lidas r\u00e1pido e parecem distintas em cada ponto de contato. Wordmarks e s\u00edmbolos personalizados s\u00e3o combinados a um sistema preciso de tipografia, cor, imagem, movimento e iconografia para que reconhecimento e lembran\u00e7a cres\u00e7am a cada impress\u00e3o.',
        'I create intuitive digital experiences that users love and businesses grow. From research and wireframes to polished interfaces, I design products that solve real problems while delivering seamless, beautiful interactions across all devices.': 'Eu crio experi\u00eancias digitais intuitivas que as pessoas gostam de usar e que ajudam neg\u00f3cios a crescer. Da pesquisa e dos wireframes \u00e0s interfaces finais, eu desenho produtos que resolvem problemas reais enquanto entregam intera\u00e7\u00f5es fluidas e bonitas em todos os dispositivos.',
        'I build living frameworks that keep your brand and product sharp anywhere they appear. Components, templates, and usage rules make teams faster, improve consistency, and scale from product UI to print without losing quality or intent.': 'Eu construo frameworks vivos que mant\u00eam sua marca e seu produto afiados onde quer que apare\u00e7am. Componentes, templates e regras de uso tornam os times mais r\u00e1pidos, melhoram a consist\u00eancia e escalam do UI de produto ao impresso sem perder qualidade nem inten\u00e7\u00e3o.',

        'AURA is a jewelry brand built around presence, contrast, and self-expression. Luxury is not about excess but intention, form, and attitude. The pieces are designed to feel bold yet intimate—sculptural objects that interact with the body and amplify individuality. At AURA, jewelry is a statement of identity, tension, and quiet power.': 'A AURA \u00e9 uma marca de joias constru\u00edda em torno de presen\u00e7a, contraste e autoexpress\u00e3o. Luxo n\u00e3o \u00e9 excesso, e sim inten\u00e7\u00e3o, forma e atitude. As pe\u00e7as foram pensadas para parecer ousadas e \u00edntimas ao mesmo tempo — objetos esculturais que interagem com o corpo e ampliam a individualidade. Na AURA, joias s\u00e3o uma afirma\u00e7\u00e3o de identidade, tens\u00e3o e for\u00e7a silenciosa.',
        'AURA is a luxury jewelry brand that blends minimalist elegance with a brooding, dark sensibility crafted for individuals who value refined mystery and understated luxury.': 'A AURA \u00e9 uma marca de joias de luxo que combina eleg\u00e2ncia minimalista com uma sensibilidade sombria e contemplativa, criada para pessoas que valorizam mist\u00e9rio refinado e luxo sem excesso.',
        'This brand work focused on creating a distinct visual identity that positions AURA within the premium jewelry category while giving it a unique tone: beauty with an edge.': 'Este trabalho de marca teve foco na cria\u00e7\u00e3o de uma identidade visual distinta que posiciona a AURA dentro da categoria de joalheria premium, ao mesmo tempo em que lhe d\u00e1 um tom \u00fanico: beleza com atitude.',
        'In the luxury jewelry segment, many identities rely on classic motifs that can feel overly traditional or decorative. AURA’s vision was to stand apart grounded in high craftsmanship and minimalist perfection, but with a dark, contemplative voice.': 'No segmento de joias de luxo, muitas identidades se apoiam em motivos cl\u00e1ssicos que podem parecer tradicionais ou decorativos demais. A vis\u00e3o da AURA era se diferenciar com base em alto artesanato e perfei\u00e7\u00e3o minimalista, mas com uma voz sombria e contemplativa.',

        'Caramel is a meme coin creation platform built on the LaChain network. Inspired by the pump.fun model, it makes launching tokens simple, fast, and accessible. The UX removes friction from creation so communities can turn ideas into on-chain assets in minutes.': 'Caramel \u00e9 uma plataforma de cria\u00e7\u00e3o de meme coins constru\u00edda na rede LaChain. Inspirada no modelo da pump.fun, ela torna o lan\u00e7amento de tokens simples, r\u00e1pido e acess\u00edvel. A UX remove fric\u00e7\u00e3o da cria\u00e7\u00e3o para que comunidades possam transformar ideias em ativos on-chain em minutos.',
        'Caramel is a meme coin creation platform built on the LaChain network, inspired by the pump.fun model and designed to remove friction from token launches. The project was created with a clear objective: make on-chain creation accessible to anyone, regardless of prior blockchain experience.': 'Caramel \u00e9 uma plataforma de cria\u00e7\u00e3o de meme coins constru\u00edda na rede LaChain, inspirada no modelo da pump.fun e desenhada para remover fric\u00e7\u00e3o do lan\u00e7amento de tokens. O projeto nasceu com um objetivo claro: tornar a cria\u00e7\u00e3o on-chain acess\u00edvel para qualquer pessoa, independentemente da experi\u00eancia pr\u00e9via com blockchain.',
        'Developed during BlockchainRio 2024, Caramel combined product thinking, UX strategy, branding, and interface design into a lightweight launch experience focused on clarity, speed, and accessibility.': 'Desenvolvida durante o BlockchainRio 2024, a Caramel combinou vis\u00e3o de produto, estrat\u00e9gia de UX, branding e design de interface em uma experi\u00eancia leve de lan\u00e7amento focada em clareza, velocidade e acessibilidade.',
        'Launching tokens on-chain still feels overly technical for most users. Existing flows often require too many decisions, unfamiliar wallet interactions, and a level of blockchain knowledge that creates unnecessary friction.': 'Lan\u00e7ar tokens on-chain ainda parece t\u00e9cnico demais para a maioria dos usu\u00e1rios. Fluxos existentes costumam exigir decis\u00f5es demais, intera\u00e7\u00f5es pouco familiares com carteiras e um n\u00edvel de conhecimento em blockchain que cria fric\u00e7\u00e3o desnecess\u00e1ria.',
        'Instead of overwhelming users with technical steps, Caramel turns token creation into a more approachable and understandable process, while still preserving the feeling of being truly on-chain.': 'Em vez de sobrecarregar os usu\u00e1rios com etapas t\u00e9cnicas, a Caramel transforma a cria\u00e7\u00e3o de tokens em um processo mais acess\u00edvel e compreens\u00edvel, preservando ainda assim a sensa\u00e7\u00e3o de estar genuinamente on-chain.',
        'The main insight was clear: users were interested in launching meme coins, but existing tools often felt too complex, confusing, or inaccessible for beginners. This reinforced the need for a product experience centered on clarity, trust, and immediate usability.': 'O principal insight foi claro: as pessoas tinham interesse em lan\u00e7ar meme coins, mas as ferramentas existentes pareciam complexas, confusas ou inacess\u00edveis demais para iniciantes. Isso refor\u00e7ou a necessidade de uma experi\u00eancia de produto centrada em clareza, confian\u00e7a e usabilidade imediata.',
        'More importantly, the project demonstrated how strong UX can make blockchain creation flows feel significantly more accessible. It validated the idea that meme coin creation does not need to be confusing or overly technical to remain on-chain and trustworthy.': 'Mais importante ainda, o projeto demonstrou como uma UX forte pode tornar fluxos de cria\u00e7\u00e3o em blockchain significativamente mais acess\u00edveis. Ele validou a ideia de que criar meme coins n\u00e3o precisa ser confuso nem t\u00e9cnico demais para continuar sendo on-chain e confi\u00e1vel.',

        'Institutional landing page for Hedgehog, a Web3 initiative building an on-chain Prediction Market application. The page opens a waitlist for the product, expected to launch in 2026, and presents the project\'s proposal, vision, and positioning.': 'Landing page institucional da Hedgehog, uma iniciativa Web3 que est\u00e1 construindo uma aplica\u00e7\u00e3o on-chain de mercado de previs\u00e3o. A p\u00e1gina abre uma lista de espera para o produto, previsto para ser lan\u00e7ado em 2026, e apresenta a proposta, a vis\u00e3o e o posicionamento do projeto.',
        'Hedgehog is a strategic landing page created to introduce a new institutional product offering and drive early user interest through a waitlist CTA funnel. The page balances brand authority with clarity of value, targeting professional and enterprise audiences with a polished narrative layout that earns trust before conversion.': 'Hedgehog \u00e9 uma landing page estrat\u00e9gica criada para apresentar uma nova oferta institucional de produto e gerar interesse inicial por meio de um funil de CTA para lista de espera. A p\u00e1gina equilibra autoridade de marca com clareza de valor, mirando p\u00fablicos profissionais e enterprise com uma narrativa refinada que gera confian\u00e7a antes da convers\u00e3o.',
        'Hedgehog needed a first impression that communicates professionalism and establishes credibility for a product not yet publicly released. Unlike consumer-facing landing pages, this page had to cater to institutional users industry professionals who expect precision, clarity and context before engaging.': 'A Hedgehog precisava de uma primeira impress\u00e3o que comunicasse profissionalismo e estabelecesse credibilidade para um produto ainda n\u00e3o lan\u00e7ado publicamente. Diferente de landing pages voltadas ao consumidor final, esta p\u00e1gina precisava atender usu\u00e1rios institucionais e profissionais do setor, que esperam precis\u00e3o, clareza e contexto antes de se envolver.',
        'A key requirement was to drive high-intent visitors into a waitlist, enabling early traction, user segmentation and future outreach. The challenge was to transform an informational, promise-based narrative into measurable conversion outcomes without misrepresenting product readiness.': 'Um requisito central era levar visitantes de alta inten\u00e7\u00e3o para uma lista de espera, permitindo tra\u00e7\u00e3o inicial, segmenta\u00e7\u00e3o de usu\u00e1rios e futuros contatos. O desafio foi transformar uma narrativa informativa e baseada em promessa em resultados mensur\u00e1veis de convers\u00e3o, sem distorcer o est\u00e1gio de maturidade do produto.',
        'The layout supports serious reading, preventing cognitive overload while gently guiding users toward the action.': 'O layout sustenta uma leitura mais s\u00e9ria, evitando sobrecarga cognitiva e conduzindo o usu\u00e1rio com suavidade at\u00e9 a a\u00e7\u00e3o.',

        'NØRA Bakery is a vegan bakery built around simplicity and care. Good food should be honest, well made, and inclusive. Recipes are plant-based by design, with real ingredients and slow processes. At NØRA, everyone belongs and everything starts from the base.': 'A NØRA Bakery \u00e9 uma padaria vegana constru\u00edda em torno de simplicidade e cuidado. Boa comida deve ser honesta, bem feita e inclusiva. As receitas s\u00e3o plant-based por ess\u00eancia, com ingredientes reais e processos lentos. Na NØRA, todo mundo pertence e tudo come\u00e7a pela base.',
        'NORA Bakery is an artisanal bakery brand that blends traditional craft with contemporary elegance. This project involved developing a complete brand identity and a digital presence that reflects the bakery’s philosophy: handcrafted quality, sensory warmth, and a timeless yet modern sensibility.': 'A NORA Bakery \u00e9 uma marca de padaria artesanal que mistura tradi\u00e7\u00e3o e eleg\u00e2ncia contempor\u00e2nea. Este projeto envolveu o desenvolvimento de uma identidade de marca completa e de uma presen\u00e7a digital que reflete a filosofia da padaria: qualidade feita \u00e0 m\u00e3o, calor sensorial e uma sensibilidade atemporal, mas atual.',
        'NORA entered a competitive local market where many bakeries relied on generic visuals and uninspired positioning. The core challenge was to convey craft authenticity and premium experience through a visual language that feels both warm and elevated without resorting to overused bakery clichés.': 'A NORA entrou em um mercado local competitivo, no qual muitas padarias dependiam de visuais gen\u00e9ricos e posicionamentos pouco inspirados. O desafio central era transmitir autenticidade artesanal e experi\u00eancia premium por meio de uma linguagem visual que parecesse acolhedora e elevada ao mesmo tempo, sem recorrer a clich\u00eas batidos do setor.',
        'Additionally, the digital touchpoints needed to extend the brand cohesively online while supporting future campaigns and community engagement.': 'Al\u00e9m disso, os pontos de contato digitais precisavam estender a marca de forma coesa no ambiente online, apoiando futuras campanhas e o engajamento da comunidade.',

        'Petrobras Saúde is the corporate healthcare plan for Petrobras employees and their families, serving hundreds of thousands of beneficiaries across Brazil. The platform redesign focused on modernizing the digital experience, delivered during COVID-19 with user research, beneficiary needs, and provider search at the center.': 'A Petrobras Sa\u00fade \u00e9 o plano corporativo de sa\u00fade para colaboradores da Petrobras e suas fam\u00edlias, atendendo centenas de milhares de benefici\u00e1rios em todo o Brasil. O redesenho da plataforma teve foco em modernizar a experi\u00eancia digital, entregue durante a COVID-19 com pesquisa com usu\u00e1rios, necessidades dos benefici\u00e1rios e busca por prestadores no centro do processo.',
        'Saúde Petrobras is a telemedicine system designed to support the health needs of Petrobras employees and dependents during the COVID-19 era. The platform was created to provide remote medical consultation, symptom tracking, and health guidance at a time when in-person healthcare access was limited and safety concerns were paramount.': 'A Sa\u00fade Petrobras \u00e9 um sistema de telemedicina desenhado para apoiar as necessidades de sa\u00fade de colaboradores e dependentes da Petrobras durante o per\u00edodo da COVID-19. A plataforma foi criada para oferecer consulta m\u00e9dica remota, acompanhamento de sintomas e orienta\u00e7\u00e3o em sa\u00fade em um momento no qual o acesso presencial era limitado e as preocupa\u00e7\u00f5es com seguran\u00e7a eram priorit\u00e1rias.',
        'The user experience was intentionally simple so that even first-time telemedicine users could navigate without confusion. The interface focused on clear language, progressive disclosure, and trust signals (doctor availability, session confirmations, and secure UI cues).': 'A experi\u00eancia do usu\u00e1rio foi intencionalmente simples para que at\u00e9 pessoas usando telemedicina pela primeira vez conseguissem navegar sem confus\u00e3o. A interface se concentrou em linguagem clara, divulga\u00e7\u00e3o progressiva de informa\u00e7\u00f5es e sinais de confian\u00e7a (disponibilidade m\u00e9dica, confirma\u00e7\u00f5es de sess\u00e3o e indicadores visuais de seguran\u00e7a).',
        'Although functional, the visual system supported:': 'Embora funcional, o sistema visual apoiou:',
        'Institutional trust (alignment with Petrobras brand values)': 'Confian\u00e7a institucional (alinhamento com os valores da marca Petrobras)',
        'Calm, approachable UI (soft contrasts, clear typography)': 'Interface calma e acess\u00edvel (contrastes suaves e tipografia clara)',
        'Readability and accessibility for diverse user skill levels': 'Legibilidade e acessibilidade para diferentes n\u00edveis de habilidade digital',
        'Consistency across health flows, helping reduce user anxiety': 'Consist\u00eancia nos fluxos de sa\u00fade, ajudando a reduzir a ansiedade dos usu\u00e1rios',
        'The overall aesthetic was institutional, empathetic, and functional — balancing corporate clarity with human-centric design.': 'A est\u00e9tica geral foi institucional, emp\u00e1tica e funcional — equilibrando clareza corporativa com design centrado nas pessoas.',
        '(Where metrics exist, you can add specifics — otherwise keep it qualitative.)': '(Onde existirem m\u00e9tricas, voc\u00ea pode adicionar dados espec\u00edficos — caso contr\u00e1rio, mantenha qualitativo.)',
        'Improved remote health access for employees during critical pandemic periods': 'Melhor acesso remoto \u00e0 sa\u00fade para colaboradores durante per\u00edodos cr\u00edticos da pandemia',
        'Positive feedback on ease of use, especially from first-time telemedicine users': 'Feedback positivo sobre facilidade de uso, especialmente de quem utilizava telemedicina pela primeira vez',
        'Reduced clinic burden, enabling in-person services to focus on critical care': 'Redu\u00e7\u00e3o da carga sobre cl\u00ednicas, permitindo que os atendimentos presenciais focassem em casos cr\u00edticos',
        'Higher consultation completion rates, attributed to clear, guided UI flows': 'Maior taxa de conclus\u00e3o de consultas, atribu\u00edda a fluxos guiados e claros de interface',
        'The platform helped position telemedicine as a trusted option within a historically in-person healthcare system.': 'A plataforma ajudou a posicionar a telemedicina como uma op\u00e7\u00e3o confi\u00e1vel dentro de um sistema de sa\u00fade historicamente presencial.',
        'Clarity beats complexity, especially during health crises': 'Clareza vence complexidade, especialmente em crises de sa\u00fade',
        'Healthcare UX must reduce cognitive load while increasing confidence': 'UX em sa\u00fade precisa reduzir carga cognitiva enquanto aumenta confian\u00e7a',
        'Institutional systems benefit from empathetic, human-centered language': 'Sistemas institucionais se beneficiam de uma linguagem emp\u00e1tica e centrada nas pessoas',
        'Further improvements could include:': 'Melhorias futuras poderiam incluir:',
        'Expanded health tracking dashboards': 'Dashboards expandidos de acompanhamento de sa\u00fade',
        'Personalized recommendations based on user history': 'Recomenda\u00e7\u00f5es personalizadas com base no hist\u00f3rico do usu\u00e1rio',
        'Mobile app version for on-the-go support': 'Vers\u00e3o mobile para suporte em movimento',
        'Integration with vaccination and preventative care services': 'Integra\u00e7\u00e3o com servi\u00e7os de vacina\u00e7\u00e3o e cuidado preventivo',

        'Brand positioning and visual identity system for Picnic, a Brazilian fintech that eliminates hidden fees from international spending through digital dollars and blockchain technology.': 'Posicionamento de marca e sistema de identidade visual para a Picnic, uma fintech brasileira que elimina taxas ocultas em gastos internacionais por meio de d\u00f3lares digitais e tecnologia blockchain.',
        'Picnic approached me with a challenge: build a visual identity system that could translate their promise of transparency and savings into a cohesive visual language across every touchpoint.': 'A Picnic chegou com um desafio claro: construir um sistema de identidade visual capaz de traduzir a promessa de transpar\u00eancia e economia em uma linguagem coesa em todos os pontos de contato.',
        'Picnic is a Brazilian fintech that eliminates hidden fees from international spending through digital dollars and blockchain technology. The brand needed to communicate transparency, simplicity, and trust—values at the core of their mission to make global payments accessible to everyone.': 'A Picnic \u00e9 uma fintech brasileira que elimina taxas ocultas em gastos internacionais por meio de d\u00f3lares digitais e tecnologia blockchain. A marca precisava comunicar transpar\u00eancia, simplicidade e confian\u00e7a — valores centrais da sua miss\u00e3o de tornar pagamentos globais acess\u00edveis para todos.',
        'We developed a flexible Key Visual system designed for scale: social media templates, communication assets, and brand guidelines that empower the team to maintain consistency across Instagram, in-app, and digital campaigns.': 'Desenvolvemos um sistema flex\u00edvel de Key Visual pensado para escalar: templates para redes sociais, ativos de comunica\u00e7\u00e3o e guias de marca que d\u00e3o autonomia ao time para manter consist\u00eancia no Instagram, no produto e em campanhas digitais.',
        'Picnic needed a Key Visual system that could translate their promise of transparency and savings into a cohesive visual language. The challenge was to create an identity that feels approachable and fresh—breaking away from the cold, corporate aesthetic typical of traditional banks—while maintaining the credibility expected from a fintech handling international transactions.': 'A Picnic precisava de um sistema de Key Visual que traduzisse sua promessa de transpar\u00eancia e economia em uma linguagem visual coesa. O desafio era criar uma identidade acess\u00edvel e fresca, rompendo com a est\u00e9tica fria e corporativa t\u00edpica de bancos tradicionais, sem perder a credibilidade esperada de uma fintech que lida com transa\u00e7\u00f5es internacionais.',
        'Without a defined system, the team faced inconsistency across social media, campaigns, and product touchpoints. Each designer or marketer interpreted the brand differently, leading to a fragmented presence that diluted brand recognition.': 'Sem um sistema definido, o time enfrentava inconsist\u00eancia em redes sociais, campanhas e pontos de contato do produto. Cada designer ou profissional de marketing interpretava a marca de um jeito diferente, gerando uma presen\u00e7a fragmentada que enfraquecia o reconhecimento da marca.',
        'Design and deliver a robust visual identity that empowers the Picnic team to create consistent, on-brand content with autonomy and precision. The system needed to support:': 'Desenhar e entregar uma identidade visual robusta que capacitasse o time da Picnic a criar conte\u00fados consistentes e fi\u00e9is \u00e0 marca com autonomia e precis\u00e3o. O sistema precisava sustentar:',
        'Brand Recognition:': 'Reconhecimento de marca:',
        'A distinct visual language that stands out in the fintech space': 'Uma linguagem visual distinta que se destaca no universo fintech',
        'Key Visual Templates:': 'Templates de Key Visual:',
        'Social media assets, campaign creatives, and communication templates': 'Ativos para redes sociais, pe\u00e7as de campanha e templates de comunica\u00e7\u00e3o',
        'Scalability:': 'Escalabilidade:',
        'Guidelines flexible enough for future product launches and marketing initiatives': 'Diretrizes flex\u00edveis o suficiente para futuros lan\u00e7amentos de produto e iniciativas de marketing',
        'Team Empowerment:': 'Autonomia do time:',
        'Clear standards so anyone can apply the brand correctly': 'Padr\u00f5es claros para que qualquer pessoa consiga aplicar a marca corretamente',
        'I built a full Key Visual system with key deliverables:': 'Eu constru\u00ed um sistema completo de Key Visual com entreg\u00e1veis principais:',
        'Visual Identity Guidelines': 'Diretrizes de identidade visual',
        '— Typography, color, and composition rules': '— Regras de tipografia, cor e composi\u00e7\u00e3o',
        'Social Media Templates': 'Templates para redes sociais',
        '— Instagram, LinkedIn, and campaign formats': '— Formatos para Instagram, LinkedIn e campanhas',
        'Communication Assets': 'Ativos de comunica\u00e7\u00e3o',
        '— Email headers, in-app graphics, and digital banners': '— Cabe\u00e7alhos de e-mail, gr\u00e1ficos in-app e banners digitais',
        'Brand Application Examples': 'Exemplos de aplica\u00e7\u00e3o da marca',
        '— Reference library for the team': '— Biblioteca de refer\u00eancia para o time',
        'The result is a brand presence that feels modern, trustworthy, and distinctly Picnic—whether on Instagram, in-app, or across digital campaigns.': 'O resultado \u00e9 uma presen\u00e7a de marca que parece moderna, confi\u00e1vel e claramente Picnic — seja no Instagram, dentro do app ou em campanhas digitais.',
        'Delivered a complete Key Visual system and brand guidelines on time, meeting the launch deadline': 'Entrega de um sistema completo de Key Visual e guias de marca dentro do prazo de lan\u00e7amento',
        'Created social media templates that reduced design time and improved consistency across channels': 'Cria\u00e7\u00e3o de templates para redes sociais que reduziram tempo de design e aumentaram a consist\u00eancia entre canais',
        'Established a scalable system that supports future campaigns and product expansions': 'Estabelecimento de um sistema escal\u00e1vel que apoia campanhas futuras e expans\u00f5es do produto',
        'The Picnic team now applies the brand with confidence—"His ability to understand not just what we needed, but why we needed it, made all the difference" —': 'O time da Picnic agora aplica a marca com confian\u00e7a — "A capacidade dele de entender n\u00e3o apenas o que precis\u00e1vamos, mas por que precis\u00e1vamos, fez toda a diferen\u00e7a" —',
        'Rafael Queiroz, Head of Design, Picnic': 'Rafael Queiroz, Head de Design, Picnic',
        'Before designing, I focused on:': 'Antes de desenhar, concentrei meu trabalho em:',
        'Studying fintech brand positioning from Nubank, C6 Bank, and international players like Revolut and Wise': 'Estudar o posicionamento de marcas fintech como Nubank, C6 Bank e players internacionais como Revolut e Wise',
        'Reviewing Picnic\'s existing brand materials, positioning docs, and competitor landscape': 'Revisar os materiais de marca j\u00e1 existentes da Picnic, documentos de posicionamento e o cen\u00e1rio competitivo',
        'Aligning with the Head of Design on priorities, constraints, and approval workflows': 'Alinhar com o Head of Design prioridades, restri\u00e7\u00f5es e fluxos de aprova\u00e7\u00e3o',
        'Mapping social media best practices for fintech and Web3 audiences': 'Mapear boas pr\u00e1ticas de redes sociais para p\u00fablicos de fintech e Web3',
        'The design process included:': 'O processo de design incluiu:',
        'Visual exploration balancing approachability with fintech credibility': 'Explora\u00e7\u00e3o visual equilibrando acessibilidade com credibilidade fintech',
        'Iteration on key visual motifs—patterns, compositions, and graphic elements': 'Itera\u00e7\u00e3o sobre motivos do key visual — padr\u00f5es, composi\u00e7\u00f5es e elementos gr\u00e1ficos',
        'Template creation for social, email, and in-app formats': 'Cria\u00e7\u00e3o de templates para formatos sociais, e-mail e in-app',
        'Brand guidelines documentation for typography, color, imagery, and usage rules': 'Documenta\u00e7\u00e3o de guias de marca para tipografia, cor, imag\u00e9tica e regras de uso',
        'Clear briefs save time:': 'Briefings claros economizam tempo:',
        'Early alignment on "why" and "who" accelerated the visual exploration phase': 'Alinhamento inicial sobre "por qu\u00ea" e "para quem" acelerou a fase de explora\u00e7\u00e3o visual',
        'Brand guidelines must be practical:': 'Guias de marca precisam ser pr\u00e1ticos:',
        'Templates and examples matter more than abstract rules—teams need to see how to apply the system': 'Templates e exemplos importam mais do que regras abstratas — os times precisam ver como aplicar o sistema',
        'Fintech can be fresh:': 'Fintech pode ser fresca:',
        'Breaking away from corporate blues and stock imagery creates distinct, memorable brands': 'Romper com azuis corporativos e imagens de banco cria marcas mais distintas e memor\u00e1veis',
        'Expand template library for new campaign formats and product launches': 'Expandir a biblioteca de templates para novos formatos de campanha e lan\u00e7amentos de produto',
        'Explore motion and animation guidelines for video content and social': 'Explorar diretrizes de motion e anima\u00e7\u00e3o para v\u00eddeo e redes sociais',
        'Consider extending the system for product UI and in-app experiences': 'Considerar a extens\u00e3o do sistema para UI de produto e experi\u00eancias in-app',

        'With the product logic, UX flow and system behavior defined in the previous phase, the focus shifted to translating those decisions into a clear, institutional and trustworthy visual language for Transparent.space—branding, visual identity, and UI design built on trust, precision, and institutional confidence.': 'Com a l\u00f3gica de produto, o fluxo de UX e o comportamento do sistema definidos na fase anterior, o foco passou a ser traduzir essas decis\u00f5es em uma linguagem visual clara, institucional e confi\u00e1vel para a Transparent.space — branding, identidade visual e design de interface constru\u00eddos sobre confian\u00e7a, precis\u00e3o e credibilidade institucional.',
        'Transparent.space is a real-time SLA transparency platform designed for market makers and liquidity providers operating in high-frequency digital asset environments. The project focused on translating complex performance infrastructure into a trustworthy, clear and technically sophisticated brand and interface language.': 'A Transparent.space \u00e9 uma plataforma de transpar\u00eancia de SLA em tempo real desenhada para market makers e provedores de liquidez que operam em ambientes de ativos digitais de alta frequ\u00eancia. O projeto teve foco em traduzir uma infraestrutura complexa de performance em uma linguagem de marca e interface confi\u00e1vel, clara e tecnicamente sofisticada.',
        'Most financial infrastructure platforms communicate reliability through dense dashboards and technical jargon, making it difficult for stakeholders to quickly assess operational performance. Transparent.space needed a brand and interface system capable of expressing precision, trust and technical maturity while remaining visually accessible.': 'A maioria das plataformas de infraestrutura financeira comunica confiabilidade por meio de dashboards densos e jarg\u00e3o t\u00e9cnico, dificultando que stakeholders avaliem rapidamente a performance operacional. A Transparent.space precisava de um sistema de marca e interface capaz de expressar precis\u00e3o, confian\u00e7a e maturidade t\u00e9cnica, mantendo acessibilidade visual.',
        'Create a cohesive brand and UI system that:': 'Criar um sistema coeso de marca e interface que:',
        '• Communicates transparency and operational reliability': '• Comunique transpar\u00eancia e confiabilidade operacional',
        '• Positions the platform within institutional-grade financial tooling': '• Posicione a plataforma dentro da categoria de ferramentas financeiras de n\u00edvel institucional',
        '• Simplifies the perception of complex infrastructure metrics': '• Simplifique a percep\u00e7\u00e3o de m\u00e9tricas complexas de infraestrutura',
        '• Establishes a scalable visual foundation for product evolution': '• Estabele\u00e7a uma base visual escal\u00e1vel para a evolu\u00e7\u00e3o do produto',
        'The solution combined a data-driven visual identity with an interface system inspired by institutional trading environments.': 'A solu\u00e7\u00e3o combinou uma identidade visual guiada por dados com um sistema de interface inspirado em ambientes institucionais de trading.',
        'Brand decisions emphasized:': 'As decis\u00f5es de marca enfatizaram:',
        'A restrained, high-contrast palette to signal credibility.': 'Uma paleta contida e de alto contraste para comunicar credibilidade.',
        'Technical typography to reinforce precision and clarity.': 'Tipografia t\u00e9cnica para refor\u00e7ar precis\u00e3o e clareza.',
        'Grid-based compositions referencing data infrastructure.': 'Composi\u00e7\u00f5es baseadas em grid que remetem \u00e0 infraestrutura de dados.',
        'Visual motifs inspired by monitoring systems and observability tools.': 'Motivos visuais inspirados em sistemas de monitoramento e ferramentas de observabilidade.',
        'The interface system translated these principles into modular UI components, enabling dashboards to present performance metrics in a structured, legible and hierarchy-driven manner.': 'O sistema de interface traduziu esses princ\u00edpios em componentes modulares de UI, permitindo que os dashboards apresentassem m\u00e9tricas de performance de maneira estruturada, leg\u00edvel e guiada por hierarquia.',
        'Together, branding and UI established Transparent.space as a platform that looks as reliable as the infrastructure it monitors.': 'Juntos, branding e interface posicionaram a Transparent.space como uma plataforma que parece t\u00e3o confi\u00e1vel quanto a infraestrutura que monitora.',
        'Cohesive brand perception aligned with institutional finance standards': 'Percep\u00e7\u00e3o de marca coesa e alinhada aos padr\u00f5es das finan\u00e7as institucionais',
        'Stronger visual trust signals for enterprise users': 'Sinais visuais de confian\u00e7a mais fortes para usu\u00e1rios enterprise',
        'Improved readability of performance dashboards': 'Melhora na legibilidade dos dashboards de performance',
        'Scalable foundation for product and marketing materials': 'Base escal\u00e1vel para materiais de produto e marketing',
        'Research focused on three pillars:': 'A pesquisa se concentrou em tr\u00eas pilares:',
        'Institutional trading platforms and observability tools': 'Plataformas institucionais de trading e ferramentas de observabilidade',
        'Visual languages used in high-reliability systems': 'Linguagens visuais usadas em sistemas de alta confiabilidade',
        'User expectations from financial infrastructure dashboards': 'Expectativas dos usu\u00e1rios em rela\u00e7\u00e3o a dashboards de infraestrutura financeira',
        'Competitive analysis revealed a gap between overly technical systems and overly simplified fintech visuals, informing a middle ground that balances sophistication and clarity.': 'A an\u00e1lise competitiva revelou um espa\u00e7o entre sistemas excessivamente t\u00e9cnicos e visuais fintech simplificados demais, apontando para um meio-termo que equilibra sofistica\u00e7\u00e3o e clareza.',
        'Design principles centered on:': 'Os princ\u00edpios de design se concentraram em:',
        'Structured visual hierarchy': 'Hierarquia visual estruturada',
        'Functional minimalism': 'Minimalismo funcional',
        'Data-first layouts': 'Layouts orientados por dados',
        'Consistency across product and communication surfaces': 'Consist\u00eancia entre superf\u00edcies de produto e comunica\u00e7\u00e3o',
        'Components were designed as reusable modules, ensuring scalability as new features and dashboards are introduced.': 'Os componentes foram desenhados como m\u00f3dulos reutiliz\u00e1veis, garantindo escalabilidade \u00e0 medida que novas funcionalidades e dashboards s\u00e3o introduzidos.',
        'The visual system was built to reinforce transparency through:': 'O sistema visual foi constru\u00eddo para refor\u00e7ar transpar\u00eancia por meio de:',
        'Precision-driven grid structures': 'Estruturas em grid guiadas por precis\u00e3o',
        'Functional color coding for performance signals': 'Codifica\u00e7\u00e3o funcional de cores para sinais de performance',
        'Consistent spacing and alignment logic': 'L\u00f3gica consistente de espa\u00e7amento e alinhamento',
        'Typography optimized for numerical legibility': 'Tipografia otimizada para legibilidade num\u00e9rica',
        'The result is a system where visual order reflects operational reliability.': 'O resultado \u00e9 um sistema em que a ordem visual reflete a confiabilidade operacional.',
        'Trust in financial tools is built visually before functionally': 'Confian\u00e7a em ferramentas financeiras \u00e9 constru\u00edda visualmente antes de ser funcionalmente comprovada',
        'Data density requires hierarchy, not simplification': 'Densidade de dados exige hierarquia, n\u00e3o simplifica\u00e7\u00e3o',
        'Branding and product UI must evolve as a unified system': 'Branding e UI de produto precisam evoluir como um sistema unificado',
        'Greater agility in creating design systems with Cursor': 'Maior agilidade na cria\u00e7\u00e3o de design systems com Cursor',
        'Extend design system for advanced analytics modules': 'Expandir o design system para m\u00f3dulos avan\u00e7ados de analytics',
        'Expand motion system for live data feedback': 'Expandir o sistema de motion para feedback de dados em tempo real',

        'Transparent.space is a monitoring and transparency platform that allows liquidity providers and trading firms to track SLA performance, operational reliability and service integrity in real time.': 'A Transparent.space \u00e9 uma plataforma de monitoramento e transpar\u00eancia que permite a provedores de liquidez e empresas de trading acompanhar desempenho de SLA, confiabilidade operacional e integridade de servi\u00e7o em tempo real.',
        'Liquidity providers operate in latency-sensitive environments where service interruptions generate financial and reputational risk. However, existing monitoring tools often present fragmented information, making performance evaluation slow and reactive.': 'Provedores de liquidez operam em ambientes sens\u00edveis \u00e0 lat\u00eancia, onde interrup\u00e7\u00f5es de servi\u00e7o geram risco financeiro e reputacional. No entanto, ferramentas de monitoramento existentes frequentemente apresentam informa\u00e7\u00f5es fragmentadas, tornando a avalia\u00e7\u00e3o de performance lenta e reativa.',

        'Unimed Seguros is the insurance arm of Unimed, Brazil\'s largest healthcare cooperative network. The mobile app redesign aimed to simplify insurance management and healthcare access for millions of users—delivered during the COVID-19 timeline, with user research and a strong focus on accessibility and usability.': 'A Unimed Seguros \u00e9 o bra\u00e7o de seguros da Unimed, a maior rede cooperativa de sa\u00fade do Brasil. O redesenho do aplicativo mobile teve como objetivo simplificar a gest\u00e3o do seguro e o acesso \u00e0 sa\u00fade para milh\u00f5es de usu\u00e1rios — entregue durante o per\u00edodo da COVID-19, com pesquisa com usu\u00e1rios e forte foco em acessibilidade e usabilidade.',
        'Unimed Seguros is a telemedicine platform designed to provide remote medical consultations and health services for users within the Unimed Seguros ecosystem. Built to offer accessible virtual care, the app empowers users to connect with doctors, manage appointments, and receive medical support directly from their devices especially useful for users who needed reliable care beyond physical clinics.': 'A Unimed Seguros \u00e9 uma plataforma de telemedicina desenhada para oferecer consultas m\u00e9dicas remotas e servi\u00e7os de sa\u00fade para usu\u00e1rios dentro do ecossistema da Unimed Seguros. Constru\u00eddo para viabilizar cuidado virtual acess\u00edvel, o app permite que os usu\u00e1rios se conectem com m\u00e9dicos, gerenciem consultas e recebam suporte de sa\u00fade diretamente de seus dispositivos, algo especialmente \u00fatil para quem precisava de atendimento confi\u00e1vel al\u00e9m das cl\u00ednicas f\u00edsicas.',
        'This project involved UX research, workflow design, and user-centric interface design in an institutional healthcare environment.': 'Este projeto envolveu pesquisa em UX, desenho de fluxos e design de interface centrado no usu\u00e1rio em um ambiente institucional de sa\u00fade.',
        'Healthcare systems often faced barriers around accessibility, scheduling complexity, and fragmented service delivery, especially when remote care was becoming a necessary alternative to physical appointments.': 'Sistemas de sa\u00fade frequentemente enfrentavam barreiras relacionadas a acessibilidade, complexidade de agendamento e presta\u00e7\u00e3o fragmentada de servi\u00e7os, especialmente quando o cuidado remoto se tornava uma alternativa necess\u00e1ria \u00e0s consultas presenciais.',
        'Unimed needed a solution that could:': 'A Unimed precisava de uma solu\u00e7\u00e3o que pudesse:',
        'Simplify remote access to healthcare professionals': 'Simplificar o acesso remoto a profissionais de sa\u00fade',
        'Provide structured consultation flows with clear user guidance': 'Oferecer fluxos estruturados de consulta com orienta\u00e7\u00e3o clara ao usu\u00e1rio',
        'Maintain credibility and trust through every user interaction': 'Manter credibilidade e confian\u00e7a em cada intera\u00e7\u00e3o do usu\u00e1rio',
        'Work intuitively for a broad audience with varying levels of tech literacy': 'Funcionar de forma intuitiva para um p\u00fablico amplo, com diferentes n\u00edveis de familiaridade tecnol\u00f3gica',
        'Existing options in the app market were either too generic or lacked the tailored experience needed for a large institutional user group.': 'As op\u00e7\u00f5es existentes no mercado de apps eram gen\u00e9ricas demais ou n\u00e3o ofereciam a experi\u00eancia sob medida necess\u00e1ria para uma grande base institucional de usu\u00e1rios.',
        'Design a telemedicine app that:': 'Desenhar um app de telemedicina que:',
        'Enables users to book and manage virtual consultations': 'Permita que os usu\u00e1rios agendem e gerenciem consultas virtuais',
        'Makes remote medical access feel as trustworthy as in-person care': 'Fa\u00e7a o acesso m\u00e9dico remoto parecer t\u00e3o confi\u00e1vel quanto o atendimento presencial',
        'Supports a seamless UX from login to consultation completion': 'Sustente uma UX fluida do login at\u00e9 a conclus\u00e3o da consulta',
        'Reduces complexity and anxiety around healthcare decisions': 'Reduza complexidade e ansiedade em decis\u00f5es de sa\u00fade',
        'The app needed to feel institutional and reliable, while still being easy for users to navigate and understand.': 'O app precisava parecer institucional e confi\u00e1vel, sem deixar de ser f\u00e1cil de navegar e entender.',
        'The Unimed Seguros telemedicine app was structured around clarity, consistency, and care.': 'O app de telemedicina da Unimed Seguros foi estruturado em torno de clareza, consist\u00eancia e cuidado.',
        'Easy Appointment Flow — from symptom description to scheduling and confirmation': 'Fluxo simples de agendamento — da descri\u00e7\u00e3o dos sintomas ao agendamento e confirma\u00e7\u00e3o',
        'Consultation Interface — video/chat with medical professionals': 'Interface de consulta — v\u00eddeo/chat com profissionais de sa\u00fade',
        'Health Guidance & History — centralized access to past consultations and recommendations': 'Orienta\u00e7\u00e3o e hist\u00f3rico de sa\u00fade — acesso centralizado a consultas anteriores e recomenda\u00e7\u00f5es',
        'Clear Navigation — low friction from sign-in to consultation': 'Navega\u00e7\u00e3o clara — baixa fric\u00e7\u00e3o do login \u00e0 consulta',
        'Every interaction was designed to feel supportive and predictable — addressing a common user concern: “Will this actually work when I need it?”': 'Cada intera\u00e7\u00e3o foi desenhada para parecer acolhedora e previs\u00edvel — respondendo a uma preocupa\u00e7\u00e3o comum dos usu\u00e1rios: “Isso realmente vai funcionar quando eu precisar?”',
        'Analysis of existing telemedicine behaviors': 'An\u00e1lise de comportamentos existentes em telemedicina',
        'Surveys and interviews with users seeking remote consultation': 'Pesquisas e entrevistas com usu\u00e1rios em busca de consulta remota',
        'Identification of pain points around digital health confidence': 'Identifica\u00e7\u00e3o de pontos de dor ligados \u00e0 confian\u00e7a em sa\u00fade digital',
        'Benchmarking against other healthcare apps with remote features': 'Benchmark com outros apps de sa\u00fade com recursos remotos',
        'Users wanted clear next steps, not overwhelming options': 'Os usu\u00e1rios queriam pr\u00f3ximos passos claros, n\u00e3o op\u00e7\u00f5es excessivas',
        'Health urgency increases stress — so UI needed to reduce cognitive load': 'Urg\u00eancia em sa\u00fade aumenta o estresse — ent\u00e3o a interface precisava reduzir carga cognitiva',
        'Trust and clarity mattered more than flashy visuals': 'Confian\u00e7a e clareza importavam mais do que visuais chamativos',
        'These insights helped shape a workflow where every tap feels safe and purposeful.': 'Esses insights ajudaram a moldar um fluxo em que cada toque parece seguro e intencional.',
        'Minimal cognitive effort': 'Esfor\u00e7o cognitivo m\u00ednimo',
        'Functional clarity in every screen': 'Clareza funcional em cada tela',
        'Predictable guidance through health flows': 'Orienta\u00e7\u00e3o previs\u00edvel ao longo dos fluxos de sa\u00fade',
        'Accessible language for users of all tech levels': 'Linguagem acess\u00edvel para usu\u00e1rios de todos os n\u00edveis de familiaridade tecnol\u00f3gica',
        'Screens prioritized readable information, clear actions, and consistent visual cues. Ensuring users always understood where they were in the process.': 'As telas priorizaram informa\u00e7\u00e3o leg\u00edvel, a\u00e7\u00f5es claras e sinais visuais consistentes, garantindo que os usu\u00e1rios sempre entendessem em que etapa do processo estavam.',
        'The UI adopted visual elements aligned with institutional healthcare:': 'A interface adotou elementos visuais alinhados ao universo institucional da sa\u00fade:',
        'Neutral color system — calming and professional': 'Sistema de cores neutro — calmo e profissional',
        'Clear typography — readable and accessible': 'Tipografia clara — leg\u00edvel e acess\u00edvel',
        'Functional iconography — supportive visual cues': 'Iconografia funcional — sinais visuais de apoio',
        'Hierarchy based on clarity — important elements stand out without noise': 'Hierarquia baseada em clareza — elementos importantes se destacam sem ru\u00eddo',
        'The result was a system that felt trustworthy and dependable, aligning with Unimed’s core values.': 'O resultado foi um sistema que parece confi\u00e1vel e seguro, alinhado aos valores centrais da Unimed.',
        'Improved remote care access — users could consult doctors without visiting physical clinics': 'Melhor acesso ao cuidado remoto — usu\u00e1rios puderam consultar m\u00e9dicos sem ir a cl\u00ednicas f\u00edsicas',
        'Higher engagement — clear, guided flows reduced drop-offs in scheduling': 'Maior engajamento — fluxos claros e guiados reduziram desist\u00eancias no agendamento',
        'Positive user feedback — users reported the app felt easy and reassuring': 'Feedback positivo dos usu\u00e1rios — o app foi percebido como f\u00e1cil e tranquilizador',
        'Stronger institutional trust — the experience reinforced Unimed Seguros as a supportive healthcare partner': 'Maior confian\u00e7a institucional — a experi\u00eancia refor\u00e7ou a Unimed Seguros como parceira de cuidado em sa\u00fade',
        'The app helped reduce barriers to care and demonstrated how a well-designed UX can make healthcare feel human and accessible.': 'O app ajudou a reduzir barreiras de acesso ao cuidado e demonstrou como uma UX bem desenhada pode tornar a sa\u00fade mais humana e acess\u00edvel.',
        'In health products, clarity and predictability matter more than bells and whistles': 'Em produtos de sa\u00fade, clareza e previsibilidade importam mais do que recursos sup\u00e9rfluos',
        'UX that reduces anxiety directly improves engagement': 'UX que reduz ansiedade melhora o engajamento de forma direta',
        'Institutional products benefit from empathy-driven design language': 'Produtos institucionais se beneficiam de uma linguagem de design guiada por empatia',
        'Future enhancements could include:': 'Melhorias futuras poderiam incluir:',
        'Real-time status tracking for appointments': 'Acompanhamento em tempo real do status das consultas',
        'Expanded symptom triage and self-care tools': 'Expans\u00e3o da triagem de sintomas e de ferramentas de autocuidado',
        'Integration with health records and prescriptions': 'Integra\u00e7\u00e3o com prontu\u00e1rios e prescri\u00e7\u00f5es',
        'Personalized reminders and wellness planning features': 'Lembretes personalizados e recursos de planejamento de bem-estar'
    };

    const ATTRIBUTE_MAP = {
        placeholder: {
            'Your name': 'Seu nome',
            'your@email.com': 'seu@email.com',
            'Tell me about your project...': 'Conte sobre o seu projeto...'
        },
        'aria-label': {
            'Toggle dark mode': 'Alternar modo escuro',
            'Toggle menu': 'Abrir menu',
            'Language switcher': 'Seletor de idioma'
        },
        content: {
            'Award-winning UX/UI Designer specializing in Web3, Healthcare & Enterprise products. ETHSamba 2023 & BlockchainRio 2024 Winner. Helping startups and leading brands ship world-class digital experiences.': 'Designer premiado de UX/UI especializado em produtos Web3, Sa\u00fade e Enterprise. Vencedor do ETHSamba 2023 e BlockchainRio 2024. Ajudando startups e grandes marcas a lan\u00e7arem experi\u00eancias digitais de alto n\u00edvel.',
            'Award-winning designer helping startups and enterprise brands ship world-class digital experiences. Web3, Healthcare, Enterprise.': 'Designer premiado ajudando startups e marcas enterprise a lan\u00e7arem experi\u00eancias digitais de alto n\u00edvel. Web3, Sa\u00fade, Enterprise.',
            'Explore all projects by Fonseca Studio. UX Design, UI Design, and Digital Experiences.': 'Explore todos os projetos da Fonseca Studio. UX Design, UI Design e experi\u00eancias digitais.',
            'Product design and UX for Transparent.space, creating intuitive digital experiences.': 'Design de produto e UX para a Transparent.space, criando experi\u00eancias digitais intuitivas.',
            'Insurance and healthcare app redesign improving user experience for millions of beneficiaries.': 'Redesenho de aplicativo de seguros e sa\u00fade, melhorando a experi\u00eancia de milh\u00f5es de benefici\u00e1rios.',
            'Branding and UI design for Transparent.space, creating a cohesive visual identity system.': 'Branding e design de interface para a Transparent.space, criando um sistema coeso de identidade visual.',
            'Brand positioning and visual identity system for Picnic, creating cohesive standards and templates for consistent brand application.': 'Posicionamento de marca e sistema de identidade visual para a Picnic, criando padr\u00f5es e templates coesos para aplica\u00e7\u00e3o consistente da marca.',
            'NØRA Bakery is a vegan bakery built around simplicity and care.': 'A NØRA Bakery \u00e9 uma padaria vegana constru\u00edda em torno de simplicidade e cuidado.',
            'Healthcare platform redesign for one of Brazil\'s largest corporate health plans.': 'Redesenho de plataforma de sa\u00fade para um dos maiores planos corporativos do Brasil.',
            'Meme coin platform on LaChain with pump.fun-style token launch UX.': 'Plataforma de meme coin na LaChain com UX de lan\u00e7amento de tokens no estilo pump.fun.',
            'Luxury jewelry brand built around presence, contrast, and self-expression.': 'Marca de joias de luxo constru\u00edda em torno de presen\u00e7a, contraste e autoexpress\u00e3o.',
            'Web3 Prediction Market waitlist landing page for Hedgehog, launching 2026.': 'Landing page com lista de espera para o mercado de previs\u00e3o Web3 da Hedgehog, com lan\u00e7amento em 2026.'
        }
    };

    function getStoredLanguage() {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return SUPPORTED_LANGUAGES.has(stored) ? stored : 'en';
    }

    function setStoredLanguage(language) {
        window.localStorage.setItem(STORAGE_KEY, language);
    }

    function normalize(value) {
        return value.replace(/\s+/g, ' ').trim();
    }

    function preserveWhitespace(original, translated) {
        const leading = (original.match(/^\s*/) || [''])[0];
        const trailing = (original.match(/\s*$/) || [''])[0];
        return leading + translated + trailing;
    }

    function shouldSkipNode(node) {
        if (!node.parentElement) return true;
        const tag = node.parentElement.tagName;
        return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'PATH', 'TITLE'].includes(tag) === false
            ? false
            : true;
    }

    function translateTextNodes(language) {
        const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                if (!node.nodeValue || !normalize(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let node;
        while ((node = walker.nextNode())) {
            if (!originalText.has(node)) {
                originalText.set(node, node.nodeValue);
            }

            const original = originalText.get(node);
            const key = normalize(original);

            if (language === 'pt' && TEXT_MAP[key]) {
                node.nodeValue = preserveWhitespace(original, TEXT_MAP[key]);
            } else {
                node.nodeValue = original;
            }
        }
    }

    function translateAttributes(language) {
        const attrs = Object.keys(ATTRIBUTE_MAP);
        document.querySelectorAll('*').forEach((element) => {
            attrs.forEach((attrName) => {
                if (!element.hasAttribute(attrName)) return;

                const currentOriginals = originalAttrs.get(element) || {};
                if (!(attrName in currentOriginals)) {
                    currentOriginals[attrName] = element.getAttribute(attrName);
                    originalAttrs.set(element, currentOriginals);
                }

                const original = currentOriginals[attrName];
                const key = normalize(original);
                const translated = ATTRIBUTE_MAP[attrName][key];

                if (language === 'pt' && translated) {
                    element.setAttribute(attrName, translated);
                } else {
                    element.setAttribute(attrName, original);
                }
            });
        });
    }

    function injectToggle() {
        const navRight = document.querySelector('.nav-right');
        if (navRight && !navRight.querySelector('.language-toggle')) {
            const toggle = document.createElement('div');
            toggle.className = 'language-toggle';
            toggle.setAttribute('aria-label', 'Language switcher');
            toggle.innerHTML = [
                '<button type="button" class="language-toggle-btn" data-lang="en">EN</button>',
                '<button type="button" class="language-toggle-btn" data-lang="pt">PT</button>'
            ].join('');

            const mobileToggle = navRight.querySelector('.mobile-menu-toggle');
            navRight.insertBefore(toggle, mobileToggle || null);
        }

        const mobileLinks = document.querySelector('.mobile-menu-links');
        if (mobileLinks && !mobileLinks.querySelector('.language-toggle-mobile')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'language-toggle language-toggle-mobile';
            wrapper.innerHTML = [
                '<button type="button" class="language-toggle-btn" data-lang="en">EN</button>',
                '<button type="button" class="language-toggle-btn" data-lang="pt">PT</button>'
            ].join('');

            mobileLinks.appendChild(wrapper);
        }
    }

    function updateToggleState(language) {
        document.querySelectorAll('.language-toggle-btn').forEach((button) => {
            const active = button.dataset.lang === language;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function applyLanguage(language) {
        document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
        document.title = language === 'pt' && TEXT_MAP[originalTitle] ? TEXT_MAP[originalTitle] : originalTitle;
        translateTextNodes(language);
        translateAttributes(language);
        updateToggleState(language);
    }

    function initLanguageControls() {
        injectToggle();
        const language = getStoredLanguage();
        applyLanguage(language);

        document.addEventListener('click', (event) => {
            const button = event.target.closest('.language-toggle-btn');
            if (!button) return;

            const nextLanguage = button.dataset.lang;
            if (!SUPPORTED_LANGUAGES.has(nextLanguage)) return;

            setStoredLanguage(nextLanguage);
            applyLanguage(nextLanguage);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageControls, { once: true });
    } else {
        initLanguageControls();
    }
})();
