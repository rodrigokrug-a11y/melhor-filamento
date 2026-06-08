// Conteúdo editorial dos Guias (sem banco — dados versionados no código).
// Seguro para o cliente: não importa Prisma nem nada server-only.
//
// Para adicionar um guia novo: crie outro objeto em GUIAS com um `slug` único.
// As páginas /guias e /guias/[slug] e o sitemap leem tudo daqui.

export type GuiaMaterial = {
  /** Chave do material. Quando `catalogo` é true e a chave existe em
   *  FILAMENT_MATERIALS, vira link para /filamentos, /melhor e /dica. */
  key: string;
  nome: string;
  resumo: string;
  oque: string;
  bico: string;
  mesa: string;
  /** 1 = muito fácil … 5 = avançado. */
  dificuldade: number;
  resistencia: string;
  foodSafe: string;
  /** Faixa de preço relativa no Brasil: "$", "$$", "$$$". */
  preco: string;
  pros: string[];
  contras: string[];
  usos: string;
  dica: string;
  /** Tem página de catálogo/ranking própria no site? */
  catalogo: boolean;
};

export type GuiaSecao = {
  id: string;
  titulo: string;
  /** Corpo em markdown leve (ver components/markdown.tsx). */
  corpo: string;
};

export type GuiaFaq = { q: string; a: string };

export type Guia = {
  slug: string;
  /** <title> e H1. */
  titulo: string;
  /** Subtítulo curto sob o H1. */
  subtitulo: string;
  /** meta description (≤ ~160 caracteres). */
  descricao: string;
  /** Texto exibido no card do índice. */
  resumo: string;
  atualizadoEm: string; // ISO (datePublished/dateModified)
  atualizadoLabel: string; // ex.: "Junho de 2026"
  leituraMin: number;
  intro: string; // markdown
  materiais: GuiaMaterial[];
  secoes: GuiaSecao[];
  faq: GuiaFaq[];
};

const guiaFilamentos: Guia = {
  slug: "tipos-de-filamento",
  titulo: "Tipos de filamento para impressão 3D: o guia completo",
  subtitulo:
    "PLA, PETG, ABS, ASA, TPU, Nylon e mais — o que muda na prática, em qual temperatura imprimir cada um e como escolher (sem gastar à toa).",
  descricao:
    "Guia completo dos tipos de filamento para impressão 3D no Brasil: PLA, PETG, ABS, ASA, TPU, Nylon, PC e mais — temperaturas, prós e contras, usos e como escolher.",
  resumo:
    "Comparação prática de todos os principais filamentos (PLA, PETG, ABS, ASA, TPU, Nylon…): temperatura de bico e mesa, dificuldade, resistência, food-safe e para que serve cada um.",
  atualizadoEm: "2026-06-08",
  atualizadoLabel: "Junho de 2026",
  leituraMin: 12,
  intro: `Escolher o filamento certo é metade do sucesso de uma impressão 3D. O material define a resistência da peça, a temperatura que ela aguenta, o acabamento, a dificuldade de imprimir e — algo que pouca gente calcula — o **custo real por quilo**.

Este guia reúne, em um lugar só, os filamentos que você realmente encontra à venda no Brasil. Para cada um você vê o que ele é, a faixa de temperatura de bico e mesa, os prós e contras sem enrolação, para que serve e uma dica prática de impressão. No fim, mostramos **como decidir** entre eles conforme a sua peça.

Uma observação importante sobre as temperaturas: os valores aqui são faixas **orientativas** e típicas. Cada marca formula o material de um jeito, então a referência definitiva é sempre a **embalagem do fabricante** — comece pelo valor que ele indica e ajuste a partir daí.`,
  materiais: [
    {
      key: "PLA",
      nome: "PLA",
      resumo: "O ponto de partida — fácil, barato e versátil.",
      oque: "Plástico derivado de fontes renováveis (como amido de milho). É o filamento mais usado do mundo porque imprime fácil, em baixa temperatura e quase sem empenar.",
      bico: "190–220 °C",
      mesa: "50–60 °C",
      dificuldade: 1,
      resistencia: "Baixa a média",
      foodSafe: "Com ressalvas",
      preco: "$",
      pros: [
        "Imprime fácil, ótimo para começar",
        "Pouco empenamento, dispensa câmara fechada",
        "Boa precisão de detalhes e variedade de cores",
        "Baixo odor durante a impressão",
      ],
      contras: [
        "Amolece com calor (deforma perto de 55–60 °C)",
        "Mais quebradiço que PETG/ABS",
        "Não indicado para peças ao ar livre ou dentro do carro",
      ],
      usos: "Protótipos, peças decorativas, miniaturas, brindes, organizadores e qualquer peça que não pegue sol nem calor.",
      dica: "Use ventoinha de camada no máximo. Se a peça soltar da mesa, limpe o vidro com álcool e suba a mesa 5 °C. Cores escuras costumam pedir 3–5 °C a mais no bico.",
      catalogo: true,
    },
    {
      key: "PLA_PLUS",
      nome: "PLA+ e PLA High Speed",
      resumo: "Versões turbinadas do PLA: mais tenaz ou mais rápido.",
      oque: "Variações do PLA com aditivos. O 'PLA+' é menos quebradiço e mais resistente ao impacto; o 'High Speed' foi formulado para fundir rápido e imprimir nas impressoras velozes de hoje.",
      bico: "205–230 °C",
      mesa: "45–60 °C",
      dificuldade: 1,
      resistencia: "Média",
      foodSafe: "Com ressalvas",
      preco: "$$",
      pros: [
        "Mantém a facilidade do PLA com mais tenacidade",
        "High Speed permite velocidades muito altas sem perder qualidade",
        "Bom acabamento, várias cores",
      ],
      contras: [
        "Continua amolecendo com calor, como o PLA comum",
        "High Speed costuma pedir um pouco mais de temperatura",
        "Preço um pouco acima do PLA padrão",
      ],
      usos: "As mesmas peças do PLA quando você quer um pouco mais de resistência, ou impressões rápidas no dia a dia.",
      dica: "Para High Speed, aumente a temperatura do bico conforme acelera (mais velocidade = mais calor necessário para fundir o filamento a tempo).",
      catalogo: false,
    },
    {
      key: "PETG",
      nome: "PETG",
      resumo: "O melhor custo-benefício para peças funcionais.",
      oque: "O mesmo plástico das garrafas PET, com glicol para imprimir bem. Junta boa resistência mecânica, leve flexibilidade e resistência a calor e químicos — sem a dificuldade do ABS.",
      bico: "230–250 °C",
      mesa: "70–85 °C",
      dificuldade: 2,
      resistencia: "Média a alta",
      foodSafe: "Com ressalvas",
      preco: "$$",
      pros: [
        "Forte e levemente flexível (não estilhaça)",
        "Aguenta mais calor que o PLA",
        "Boa resistência a água e químicos",
        "Imprime sem câmara fechada e com pouco odor",
      ],
      contras: [
        "Tende a 'fiar' (stringing) — exige retração bem ajustada",
        "Gruda demais na mesa: use separador ou cola em pouca quantidade",
        "Sensível à umidade",
      ],
      usos: "Peças funcionais, suportes, ganchos, caixas, peças que pegam sol fraco, vasos e itens que precisam aguentar pancada.",
      dica: "Reduza o fluxo para ~95% e mantenha a ventoinha em nível baixo/médio. Se fiar muito, seque o filamento e ajuste a retração antes de mexer na temperatura.",
      catalogo: true,
    },
    {
      key: "PCTG",
      nome: "PCTG",
      resumo: "Um PETG melhorado: mais forte e transparente.",
      oque: "Evolução do PETG, com mais resistência a impacto e melhor transparência, mantendo a facilidade de impressão. Um meio-termo entre PETG e policarbonato.",
      bico: "240–260 °C",
      mesa: "70–85 °C",
      dificuldade: 2,
      resistencia: "Alta",
      foodSafe: "Com ressalvas",
      preco: "$$",
      pros: [
        "Mais resistente ao impacto que o PETG",
        "Boa transparência para peças translúcidas",
        "Imprime quase tão fácil quanto o PETG",
      ],
      contras: [
        "Pede um pouco mais de temperatura que o PETG",
        "Também é sensível à umidade",
        "Menos comum e um pouco mais caro",
      ],
      usos: "Peças funcionais que precisam de transparência ou de mais resistência que o PETG entrega: tampas, protetores, peças translúcidas.",
      dica: "Trate como um PETG 'parrudo': seque bem, retração ajustada e ventoinha moderada. Suba a temperatura se a adesão entre camadas ficar fraca.",
      catalogo: true,
    },
    {
      key: "ABS",
      nome: "ABS",
      resumo: "Resistente ao calor e ao impacto — mas exige técnica.",
      oque: "O plástico dos brinquedos de montar e de muitas peças automotivas. Aguenta bem calor e impacto e pode ser lixado/colado com facilidade, mas empena com facilidade e solta odor.",
      bico: "230–250 °C",
      mesa: "90–110 °C",
      dificuldade: 4,
      resistencia: "Alta",
      foodSafe: "Não",
      preco: "$$",
      pros: [
        "Aguenta bem calor (peças no carro, perto de motores)",
        "Resistente a impacto e fácil de pós-processar (lixar, colar, acetona)",
        "Bom para peças mecânicas",
      ],
      contras: [
        "Empena muito — praticamente exige câmara fechada",
        "Solta odor forte: precisa de ventilação",
        "Sensível a correntes de ar durante a impressão",
      ],
      usos: "Peças mecânicas, suportes que esquentam, peças automotivas, caixas que ficam expostas a calor.",
      dica: "Imprima em ambiente fechado e sem corrente de ar, com a ventoinha de camada desligada (ou bem baixa). Use cola/separador na mesa e mantenha o ambiente ventilado por causa do odor.",
      catalogo: true,
    },
    {
      key: "ASA",
      nome: "ASA",
      resumo: "O ABS que aguenta sol e chuva.",
      oque: "Primo do ABS, com a grande vantagem de resistir aos raios UV sem amarelar nem ressecar. É o filamento padrão para peças que ficam ao ar livre.",
      bico: "240–260 °C",
      mesa: "90–110 °C",
      dificuldade: 4,
      resistencia: "Alta",
      foodSafe: "Não",
      preco: "$$$",
      pros: [
        "Resistente a UV e intempéries (peças ao ar livre)",
        "Empena um pouco menos que o ABS",
        "Acabamento fosco bonito e resistente",
      ],
      contras: [
        "Mesmas exigências do ABS: câmara fechada e ventilação",
        "Pede temperaturas altas",
        "Mais caro que ABS/PETG",
      ],
      usos: "Suportes de antena, peças de jardim, placas e luminárias externas, suportes de câmera, qualquer peça que vá tomar sol e chuva.",
      dica: "Trate como ABS: ambiente fechado, sem corrente de ar, ventoinha bem baixa. A diferença é que a peça vai durar ao ar livre sem esfarelar.",
      catalogo: true,
    },
    {
      key: "TPU",
      nome: "TPU (flexível)",
      resumo: "Borracha imprimível — flexiona e absorve impacto.",
      oque: "Um elastômero: a peça sai flexível, como borracha. Existe em durezas diferentes (shore A); quanto menor o número, mais mole. Absorve impacto e tem boa resistência à abrasão.",
      bico: "210–235 °C",
      mesa: "30–60 °C",
      dificuldade: 3,
      resistencia: "Flexível / tenaz",
      foodSafe: "Não",
      preco: "$$$",
      pros: [
        "Flexível e elástico, volta ao formato",
        "Absorve impacto e vibração",
        "Boa resistência à abrasão",
      ],
      contras: [
        "Tem que imprimir devagar (10–30 mm/s)",
        "Entope fácil em extrusoras Bowden — melhor em direct drive",
        "Retração e fluxo precisam de ajuste fino",
      ],
      usos: "Capas de celular, rodas, vedações, amortecedores, pulseiras, peças que precisam dobrar ou apertar.",
      dica: "Imprima devagar e com retração baixa. Em extrusora Bowden, prefira durezas mais firmes (95A) e tubo de PTFE bem ajustado para o filamento não enroscar.",
      catalogo: true,
    },
    {
      key: "NYLON",
      nome: "Nylon (PA)",
      resumo: "Tenacidade e baixo atrito para peças de engenharia.",
      oque: "A poliamida (Nylon) é forte, durável e tem baixo coeficiente de atrito — ótima para peças que se movem. O problema: absorve umidade do ar com voracidade e precisa estar bem seca.",
      bico: "240–270 °C",
      mesa: "70–100 °C",
      dificuldade: 5,
      resistencia: "Muito alta",
      foodSafe: "Com ressalvas",
      preco: "$$$",
      pros: [
        "Muito tenaz e resistente ao desgaste",
        "Baixo atrito: ideal para engrenagens e buchas",
        "Boa resistência química e a calor",
      ],
      contras: [
        "Extremamente higroscópico — precisa secar antes e durante",
        "Empena e exige mesa quente + adesivo forte",
        "Difícil para iniciantes",
      ],
      usos: "Engrenagens, buchas, dobradiças, ferramentas, peças mecânicas que sofrem atrito e esforço.",
      dica: "Seque o filamento por horas antes de imprimir e, se possível, mantenha-o seco durante a impressão (caixa seca). Nylon úmido borbulha, fia e sai fraco.",
      catalogo: true,
    },
    {
      key: "PC",
      nome: "Policarbonato (PC)",
      resumo: "O filamento de engenharia mais resistente ao calor.",
      oque: "Plástico técnico extremamente resistente a impacto e a calor (o material dos capacetes e dos vidros à prova de bala). Exige temperaturas muito altas e impressora preparada.",
      bico: "260–300 °C",
      mesa: "100–120 °C",
      dificuldade: 5,
      resistencia: "Muito alta",
      foodSafe: "Não",
      preco: "$$$",
      pros: [
        "Resistência a impacto e a calor excepcionais",
        "Boa transparência em algumas formulações",
        "Rígido e dimensionalmente estável",
      ],
      contras: [
        "Precisa de bico capaz de 270 °C+ e câmara fechada",
        "Empena bastante",
        "Também é higroscópico",
      ],
      usos: "Peças que enfrentam calor e esforço alto: suportes técnicos, peças perto de fontes de calor, componentes estruturais.",
      dica: "Só vale a pena em impressoras que atingem temperaturas altas e têm câmara fechada. Seque o filamento e capriche na adesão da mesa.",
      catalogo: false,
    },
    {
      key: "HIPS",
      nome: "HIPS",
      resumo: "Leve, resistente e ótimo como suporte solúvel do ABS.",
      oque: "Poliestireno de alto impacto. Imprime parecido com ABS, é leve e resistente, e dissolve em limoneno — por isso é muito usado como material de suporte solúvel em impressoras de duplo extrusor com ABS.",
      bico: "230–245 °C",
      mesa: "90–110 °C",
      dificuldade: 3,
      resistencia: "Média",
      foodSafe: "Não",
      preco: "$$",
      pros: [
        "Leve e resistente ao impacto",
        "Dissolve em limoneno (suporte que some)",
        "Empena menos que o ABS",
      ],
      contras: [
        "Pede mesa quente e, de preferência, ambiente fechado",
        "Pouco útil sozinho (brilha mais como suporte)",
        "Odor durante a impressão",
      ],
      usos: "Suporte solúvel para peças de ABS com geometria complexa; peças leves que precisam de alguma resistência.",
      dica: "Para usar como suporte, combine HIPS + ABS em impressora de duplo bico. Depois é só mergulhar a peça em limoneno para o suporte desaparecer.",
      catalogo: false,
    },
    {
      key: "PVA",
      nome: "PVA",
      resumo: "Suporte que dissolve em água.",
      oque: "Álcool polivinílico: solúvel em água, atóxico e biodegradável. Serve como material de suporte para peças de PLA com geometrias impossíveis — depois é só mergulhar em água e o suporte some.",
      bico: "185–210 °C",
      mesa: "45–60 °C",
      dificuldade: 4,
      resistencia: "Baixa (é suporte)",
      foodSafe: "Não aplicável",
      preco: "$$$",
      pros: [
        "Dissolve em água comum, sem solvente",
        "Suporte perfeito para geometrias complexas com PLA",
        "Atóxico e biodegradável",
      ],
      contras: [
        "Absorve umidade muito rápido (estraga se mal guardado)",
        "Exige impressora de duplo extrusor",
        "Caro e exige impressão lenta",
      ],
      usos: "Exclusivamente como suporte solúvel em impressões de duplo material (geralmente com PLA).",
      dica: "Guarde sempre em embalagem selada com sílica. PVA que pegou umidade entope o bico e perde a solubilidade. Imprima devagar.",
      catalogo: false,
    },
    {
      key: "COMPOSITE",
      nome: "Compostos com fibra (carbono/vidro)",
      resumo: "Base técnica + fibra picada = mais rigidez e estabilidade.",
      oque: "São filamentos (normalmente Nylon, PETG ou PC) carregados com fibra de carbono ou de vidro picada. Ficam mais rígidos, leves e estáveis — mas a fibra é abrasiva e desgasta bicos comuns.",
      bico: "Depende da base (+ bico de aço)",
      mesa: "Depende da base",
      dificuldade: 5,
      resistencia: "Muito alta (rígida)",
      foodSafe: "Não",
      preco: "$$$",
      pros: [
        "Muito rígidos e dimensionalmente estáveis",
        "Leves para a resistência que entregam",
        "Acabamento fosco técnico bonito",
      ],
      contras: [
        "A fibra desgasta o bico — precisa de bico de aço endurecido",
        "Herdam as exigências da base (ex.: Nylon-CF precisa secar)",
        "Caros",
      ],
      usos: "Peças estruturais leves, suportes técnicos, drones, gabaritos e peças que não podem entortar.",
      dica: "Troque o bico de latão por um de aço endurecido ou rubi antes de imprimir — senão a fibra 'lixa' o bico por dentro em poucas horas.",
      catalogo: false,
    },
    {
      key: "DECORATIVE",
      nome: "Decorativos (madeira, metal, glow)",
      resumo: "PLA com partículas para efeitos especiais.",
      oque: "Geralmente PLA misturado com partículas: pó de madeira (cheiro e textura de madeira), pó metálico (peso e brilho de metal), ou pigmento que brilha no escuro. Imprimem como PLA, com alguns cuidados.",
      bico: "190–220 °C",
      mesa: "50–60 °C",
      dificuldade: 2,
      resistencia: "Baixa a média",
      foodSafe: "Não",
      preco: "$$",
      pros: [
        "Efeitos visuais únicos (madeira, metal, brilho no escuro)",
        "Imprimem com a facilidade do PLA",
        "Ótimos para decoração e arte",
      ],
      contras: [
        "Partículas podem entupir bicos finos (use ≥ 0,5 mm)",
        "Algumas variações são abrasivas",
        "Menos resistência que o PLA puro",
      ],
      usos: "Esculturas, peças decorativas, luminárias, brindes e qualquer projeto onde o visual importa mais que a resistência.",
      dica: "Use um bico de 0,5 mm ou maior para as partículas passarem sem entupir. Com 'madeira', variar a temperatura entre camadas cria tons diferentes, imitando anéis de árvore.",
      catalogo: false,
    },
  ],
  secoes: [
    {
      id: "como-escolher",
      titulo: "Como escolher o filamento certo",
      corpo: `Em vez de decorar tabelas, parta da **pergunta certa: o que a peça vai enfrentar?**

- **É decorativa ou um protótipo rápido?** PLA. Fácil, barato e bonito.
- **Vai ser usada, apertada, pode cair?** PETG. O melhor custo-benefício para peças funcionais.
- **Vai pegar sol e chuva?** ASA. É o ABS que resiste a UV.
- **Vai esquentar (dentro do carro, perto de motor)?** ABS ou, para calor extremo, policarbonato.
- **Precisa dobrar, vedar ou amortecer?** TPU flexível.
- **É uma peça de engenharia, com atrito (engrenagem, bucha)?** Nylon — lembrando que ele exige secagem.
- **Precisa de rigidez máxima sem entortar?** Compostos com fibra de carbono.

Regra de bolso: **comece sempre pelo mais fácil que resolve**. Muita gente compra ABS achando que precisa de "resistência" e sofre com empenamento, quando um PETG resolveria com metade do trabalho.`,
    },
    {
      id: "umidade",
      titulo: "Umidade: o vilão silencioso (ainda mais no Brasil)",
      corpo: `Quase todo filamento absorve umidade do ar — e no clima brasileiro isso acontece rápido. Filamento úmido **borbulha** no bico, **fia** (stringing), fica **quebradiço** e perde resistência. Muita gente acha que tem problema na impressora quando, na verdade, o filamento está molhado.

Os mais sensíveis: **Nylon** (o campeão), **PVA**, **TPU**, **PETG** e **PC**. PLA também absorve, só que mais devagar.

Como se proteger:
- Guarde os rolos em **sacos selados com sílica** (aquele saquinho que vem em caixas de tênis) ou em **caixas herméticas**.
- Para os mais sensíveis, vale uma **secadora de filamento** ou um forno em temperatura baixa por algumas horas.
- Sinais de filamento úmido: estalos/chiados ao imprimir e fios finos por toda a peça.`,
    },
    {
      id: "aderencia",
      titulo: "Aderência à mesa: fazer a primeira camada grudar",
      corpo: `A primeira camada decide a impressão. Cada material gruda de um jeito:

- **PLA**: gruda fácil em vidro limpo ou superfície PEI. Costuma dispensar adesivo.
- **PETG/PCTG**: o problema é o oposto — gruda **demais** e pode arrancar pedaço do vidro. Use um **separador** ou uma fina camada de cola em bastão como barreira.
- **ABS/ASA/HIPS**: precisam de **mesa quente (90–110 °C)** e câmara fechada. Adesivo ajuda muito.
- **Nylon/PC**: os mais difíceis de fixar — mesa quente e adesivo específico são quase obrigatórios.

Dicas universais: **nivele a mesa** com cuidado, limpe o vidro com **álcool isopropílico** (gordura do dedo solta a peça) e ajuste o **Z-offset** para a primeira camada sair levemente "esmagada", não solta.`,
    },
    {
      id: "seguranca",
      titulo: "Segurança: ventilação e bico abrasivo",
      corpo: `Dois pontos práticos de segurança:

- **Ventilação.** ABS, ASA, HIPS e PC soltam odor e partículas finas (VOCs/UFPs) ao imprimir. Use a impressora em **ambiente arejado** ou com exaustão/filtro, principalmente em câmara fechada. PLA e PETG soltam bem menos, mas ventilar nunca é demais.
- **Bico certo para material abrasivo.** Compostos com fibra (carbono/vidro), 'madeira' e alguns brilho-no-escuro **desgastam o bico de latão** por dentro. Troque por um **bico de aço endurecido** antes de imprimir esses materiais.`,
    },
    {
      id: "food-safe",
      titulo: "Filamento para contato com alimentos: cuidado com o mito",
      corpo: `"Esse filamento é food-safe" é mais complicado do que parece. Mesmo um PETG ou PP com certificação alimentar **deixa de ser seguro** depois de impresso, por dois motivos:

- As **ranhuras entre camadas** acumulam bactérias que não saem na lavagem.
- O **bico de latão** pode conter chumbo, e a peça passa por uma extrusora que já fundiu outros materiais.

Se for inevitável o contato com comida, o caminho mais seguro é: usar material certificado, bico de **aço inox**, paredes contínuas e grossas, e **selar a peça** com resina/verniz de grau alimentício — ou, melhor ainda, usar a peça impressa apenas como **molde/forma** e não em contato direto e prolongado. Para uso único e frio, o risco é menor; para líquidos quentes e uso repetido, evite.`,
    },
    {
      id: "custo",
      titulo: "Quanto custa de verdade: pense no preço por quilo",
      corpo: `O preço do rolo engana. Um rolo de 500 g por R$ 70 parece mais barato que um de 1 kg por R$ 110 — mas o segundo custa **R$ 110/kg** contra **R$ 140/kg** do primeiro. Por isso o nosso ranking sempre normaliza por **preço por quilo (R$/kg)**: é a única forma justa de comparar.

Além do preço do filamento, o custo de uma peça inclui **energia**, **desgaste** e **falhas**. Use nossas ferramentas para calcular o custo real antes de imprimir — e o ranking de preços para achar o filamento mais barato por kg, já com o frete estimado para o seu CEP.`,
    },
  ],
  faq: [
    {
      q: "Qual o melhor filamento para iniciantes?",
      a: "PLA, sem dúvida. Imprime em baixa temperatura, quase não empena, dispensa câmara fechada e custa pouco. Depois de dominar o PLA, o passo natural é o PETG, para peças mais resistentes.",
    },
    {
      q: "PLA ou PETG: qual escolher?",
      a: "PLA para peças decorativas, protótipos e qualquer coisa que não pegue calor — é o mais fácil. PETG para peças funcionais que precisam aguentar pancada, água, sol fraco ou um pouco de calor. O PETG é um pouco mais difícil de imprimir, mas muito mais resistente.",
    },
    {
      q: "Qual filamento aguenta calor (sol, dentro do carro)?",
      a: "Para sol e chuva, ASA é a melhor escolha (resiste a UV). Para calor sem exposição ao sol, ABS. Para calor extremo, policarbonato (PC). Evite PLA em qualquer situação que esquente — ele amolece perto de 55–60 °C.",
    },
    {
      q: "Por que meu filamento está fiando e estalando ao imprimir?",
      a: "Quase sempre é umidade. Filamentos como Nylon, PETG, TPU e PVA absorvem água do ar e passam a borbulhar e fiar. Seque o rolo (secadora de filamento ou forno em temperatura baixa) e guarde-o selado com sílica.",
    },
    {
      q: "Dá para imprimir peça para comida com segurança?",
      a: "Com muita ressalva. Mesmo um filamento certificado deixa de ser seguro após impresso, porque as ranhuras entre camadas acumulam bactérias e o bico pode conter contaminantes. Para contato direto e prolongado com alimentos, o mais seguro é selar a peça com verniz alimentício e usar bico de aço inox — ou evitar.",
    },
    {
      q: "Preciso de uma impressora fechada para todo filamento?",
      a: "Não. PLA, PETG e PCTG imprimem bem em impressora aberta. A câmara fechada vira quase obrigatória para ABS, ASA, HIPS, Nylon e PC, que empenam com correntes de ar.",
    },
  ],
};

export const GUIAS: Guia[] = [guiaFilamentos];

export function getGuias(): Guia[] {
  return GUIAS;
}

export function getGuia(slug: string): Guia | undefined {
  return GUIAS.find((g) => g.slug === slug);
}

export function getGuiaSlugs(): string[] {
  return GUIAS.map((g) => g.slug);
}
