import React, { useState } from 'react';
import { BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';

import Logo from './Logo';

const studies = [
  {
    id: 1,
    title: 'A Salvação em Cristo',
    description: 'Entenda os fundamentos da nossa salvação, o perdão dos pecados e a vida eterna.',
    readTime: '10 min',
    tags: ['Salvação', 'Graça'],
    content: (
      <div className="space-y-4 text-app-text">
        <p>A salvação é o tema central da Bíblia. Desde a queda do homem no Éden, Deus planejou um meio de reconciliar a humanidade consigo mesma.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">1. O Problema: O Pecado</h3>
        <p>A Bíblia diz em Romanos 3:23: <em>"Porque todos pecaram e destituídos estão da glória de Deus"</em>. O pecado nos separou de Deus e trouxe a morte espiritual (Romanos 6:23).</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">2. A Solução: Jesus Cristo</h3>
        <p>Deus, em seu infinito amor, enviou seu Filho. João 3:16 declara: <em>"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."</em></p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">3. Como Receber a Salvação?</h3>
        <p>A salvação não é alcançada por boas obras, mas pela graça mediante a fé (Efésios 2:8-9). Precisamos:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Reconhecer</strong> que somos pecadores.</li>
          <li><strong>Crer</strong> que Jesus morreu na cruz em nosso lugar.</li>
          <li><strong>Confessar</strong> a Jesus como nosso Senhor e Salvador (Romanos 10:9-10).</li>
        </ul>

        <h3 className="text-lg font-bold text-app-accent mt-4">Conclusão</h3>
        <p>A salvação é um presente gratuito de Deus. Quando aceitamos a Cristo, nosso passado é perdoado, ganhamos uma nova vida no presente e a garantia da vida eterna no futuro.</p>
      </div>
    )
  },
  {
    id: 2,
    title: 'Os Frutos do Espírito',
    description: 'Um estudo detalhado sobre Gálatas 5 e as características de uma vida guiada pelo Espírito Santo.',
    readTime: '15 min',
    tags: ['Espírito Santo', 'Caráter'],
    content: (
       <div className="space-y-4 text-app-text">
        <p>Em Gálatas 5:22-23, o apóstolo Paulo descreve o <strong>fruto do Espírito</strong>. Note que a palavra está no singular ("fruto"), indicando que essas características devem crescer juntas na vida do crente, como diferentes gomos da mesma fruta.</p>
        
        <div className="bg-app-sidebar p-4 rounded-lg my-4 border-l-4 border-app-accent">
          <em>"Mas o fruto do Espírito é: amor, gozo, paz, longanimidade, benignidade, bondade, fé, mansidão, temperança. Contra estas coisas não há lei."</em> - Gálatas 5:22-23
        </div>

        <h3 className="text-lg font-bold text-app-accent mt-4">As Três Dimensões do Fruto</h3>
        
        <h4 className="font-semibold mt-2 text-app-taupe">1. Relação com Deus</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Amor (Ágape):</strong> O amor incondicional que busca o bem do outro. É a base de todos os outros aspectos do fruto.</li>
          <li><strong>Alegria (Gozo):</strong> Uma satisfação profunda que não depende das circunstâncias, mas da nossa posição em Cristo.</li>
          <li><strong>Paz:</strong> A tranquilidade de coração e mente baseada na nossa reconciliação com Deus.</li>
        </ul>

        <h4 className="font-semibold mt-4 text-app-taupe">2. Relação com os Outros</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Paciência (Longanimidade):</strong> Suportar as dificuldades e as falhas dos outros sem revidar ou perder a calma.</li>
          <li><strong>Amabilidade (Benignidade):</strong> Ser gentil, compassivo e útil aos outros.</li>
          <li><strong>Bondade:</strong> Ação prática e generosa para abençoar os outros.</li>
        </ul>

        <h4 className="font-semibold mt-4 text-app-taupe">3. Relação Consigo Mesmo</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Fidelidade (Fé):</strong> Ser confiável, leal e firme em seus compromissos com Deus e com o próximo.</li>
          <li><strong>Mansidão:</strong> Força sob controle. É ser suave, humilde e ensinável.</li>
          <li><strong>Domínio Próprio (Temperança):</strong> O controle sobre nossos desejos, paixões e impulsos naturais.</li>
        </ul>

        <h3 className="text-lg font-bold text-app-accent mt-4">Como Cultivar o Fruto?</h3>
        <p>O fruto não é produzido por esforço humano, mas pela comunhão constante com o Espírito Santo. Jesus disse: <em>"Eu sou a videira, vós as varas; quem está em mim, e eu nele, esse dá muito fruto; porque sem mim nada podeis fazer."</em> (João 15:5).</p>
      </div>
    )
  },
  {
    id: 3,
    title: 'A Armadura de Deus',
    description: 'Como se preparar para a batalha espiritual diária através de Efésios 6.',
    readTime: '12 min',
    tags: ['Batalha Espiritual'],
    content: (
       <div className="space-y-4 text-app-text">
        <p>A vida cristã não é um parque de diversões, mas um campo de batalha. O apóstolo Paulo, em Efésios 6:10-18, nos adverte sobre a realidade da batalha espiritual e como devemos nos preparar para ela usando a "armadura de Deus".</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">O Inimigo</h3>
        <p>Nossa luta não é contra pessoas (sangue e carne), mas contra principados e potestades espirituais malignas (Efésios 6:12). O diabo procura matar, roubar e destruir (João 10:10).</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">As Peças da Armadura</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-app-accent rounded-full"></div> O Cinto da Verdade</h4>
            <p className="text-sm">O cinto segurava as roupas do soldado romano. A Palavra de Deus (a Verdade) deve ser a base que sustenta a nossa vida, nos protegendo das mentiras do diabo.</p>
          </div>
          
          <div>
            <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-app-accent rounded-full"></div> A Couraça da Justiça</h4>
            <p className="text-sm">Protegia os órgãos vitais. Nossa justiça vem de Cristo. Viver de forma reta e justa nos protege das acusações do inimigo contra o nosso coração e a nossa moral.</p>
          </div>

          <div>
            <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-app-accent rounded-full"></div> Os Calçados do Evangelho da Paz</h4>
            <p className="text-sm">Os calçados davam firmeza aos pés do soldado. O Evangelho nos dá a estabilidade necessária para resistir aos ataques e nos prepara para avançar anunciando a paz de Deus.</p>
          </div>

          <div>
            <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-app-accent rounded-full"></div> O Escudo da Fé</h4>
            <p className="text-sm">Os soldados molhavam seus escudos em água para apagar as flechas incendiárias inimigas. A fé inabalável nas promessas de Deus apaga as flechas da dúvida, do medo e da condenação.</p>
          </div>

          <div>
            <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-app-accent rounded-full"></div> O Capacete da Salvação</h4>
            <p className="text-sm">Protegia a cabeça (sede dos pensamentos). A certeza da salvação protege nossa mente das dúvidas e das falsas doutrinas. Nossa esperança está segura em Cristo.</p>
          </div>

          <div>
            <h4 className="font-bold flex items-center gap-2"><div className="w-2 h-2 bg-app-accent rounded-full"></div> A Espada do Espírito</h4>
            <p className="text-sm">A única arma de ataque. É a Bíblia, a Palavra de Deus. Assim como Jesus derrotou Satanás no deserto citando as Escrituras, devemos usar a Palavra para rebater o mal.</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-app-accent mt-4">A Arma Adicional: Oração</h3>
        <p>Paulo conclui dizendo: <em>"Orando em todo o tempo com toda a oração e súplica no Espírito..."</em> (Efésios 6:18). A armadura deve ser vestida em um ambiente de comunicação contínua com nosso comandante.</p>
      </div>
    )
  },
  {
    id: 4,
    title: 'O Fim dos Tempos',
    description: 'Panorama escatológico segundo as profecias de Daniel e Apocalipse.',
    readTime: '20 min',
    tags: ['Escatologia', 'Apocalipse'],
    content: (
       <div className="space-y-4 text-app-text">
        <p>O estudo do Fim dos Tempos, conhecido como Escatologia, é fundamental para o cristão. As profecias bíblicas não existem para nos colocar medo, mas para nos dar esperança e nos incentivar a viver de forma santa enquanto aguardamos o retorno de Jesus.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">Eventos Principais (Visão Pré-Tribulacionista)</h3>
        
        <h4 className="font-semibold mt-2">1. O Arrebatamento da Igreja</h4>
        <p>Este é o próximo grande evento no calendário profético. Jesus retornará nos ares para buscar Sua Igreja. Os mortos em Cristo ressuscitarão primeiro, e os vivos serão transformados, todos sendo arrebatados para encontrar o Senhor (1 Tessalonicenses 4:16-17, 1 Coríntios 15:51-52).</p>

        <h4 className="font-semibold mt-4">2. O Tribunal de Cristo e as Bodas do Cordeiro</h4>
        <p>Enquanto a terra passa por tribulação, nos céus, os crentes serão julgados, não para condenação (pois já estão salvos), mas para galardão (recompensa) de acordo com suas obras (2 Coríntios 5:10). Após isso, a união gloriosa entre Cristo (o Noivo) e a Igreja (a Noiva) ocorre nas Bodas do Cordeiro (Apocalipse 19:7-9).</p>

        <h4 className="font-semibold mt-4">3. A Grande Tribulação (7 anos)</h4>
        <p>Na Terra, este é um período de 7 anos de julgamento divino sem precedentes, focado em trazer o povo de Israel ao arrependimento ("Semana Setenta de Daniel" - Daniel 9:27). Ocorrerá o surgimento do Anticristo e seus falsos acordos de paz. A segunda metade (3,5 anos) será marcada pela a "Grande Tribulação" abordada intensamente no livro do Apocalipse (selos, trombetas e taças da ira de Deus).</p>

        <h4 className="font-semibold mt-4">4. A Segunda Vinda em Glória</h4>
        <p>A tribulação culminará na Batalha do Armagedom. Neste momento, Jesus não virá oculto, mas todo olho o verá (Apocalipse 1:7). Ele virá com Seus santos montado em um cavalo branco para destruir os impérios humanos, derrotar o Anticristo e julgar as nações (Apocalipse 19:11-21).</p>
        
        <h4 className="font-semibold mt-4">5. O Milênio</h4>
        <p>Satanás será amarrado por mil anos (Apocalipse 20:1-3). Cristo estabelecerá o Seu Reino literal sobre a terra, reinando a partir de Jerusalém com justiça, paz duradoura e longevidade.</p>

        <h4 className="font-semibold mt-4">6. O Juízo Final e a Eternidade</h4>
        <p>Após os 1.000 anos, Satanás é temporariamente solto e depois lançado no Lago de Fogo eternamente. Ocorre o Juízo do Grande Trono Branco para os incrédulos (Apocalipse 20:11-15). Por fim, Deus cria "Novos Céus e Nova Terra", e a Nova Jerusalém desce, onde Deus habitará eternamente com Seu povo (Apocalipse 21, 22).</p>

        <div className="bg-app-accent/10 border border-app-accent/20 p-4 rounded-lg mt-6">
          <h4 className="font-bold text-app-accent">O Que Fazer com Essa Informação?</h4>
          <p className="mt-2 text-sm">Diante dessas promessas, o apóstolo Pedro nos exorta: <em>"Visto que todas estas coisas hão de ser assim desfeitas, que pessoas não deveis ser em santo trato e piedade, aguardando, e apressando-vos para a vinda do dia de Deus..."</em> (2 Pedro 3:11-12). Estejamos preparados, vigiando e orando!</p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'A Importância da Oração',
    description: 'Compreenda o poder e a necessidade da oração na vida do crente.',
    readTime: '10 min',
    tags: ['Oração', 'Devocional'],
    content: (
       <div className="space-y-4 text-app-text">
        <p>A oração é a respiração da alma. É através dela que nos comunicamos com o Criador, expressamos nossa dependência dEle e recebemos direção, consolo e força para a jornada da vida.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">O que é Oração?</h3>
        <p>Orar não é apenas recitar palavras ou seguir um rito religioso. É um diálogo sincero com Deus, baseado em um relacionamento construído através de Jesus Cristo. Como nos ensina Filipenses 4:6: <em>"Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus".</em></p>

        <h3 className="text-lg font-bold text-app-accent mt-4">Por que devemos orar?</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Para buscar a face de Deus:</strong> A oração nos ajuda a conhecer melhor o coração do Pai.</li>
          <li><strong>Para resistir à tentação:</strong> Jesus advertiu Seus discípulos: <em>"Vigiem e orem para que não caiam em tentação"</em> (Mateus 26:41).</li>
          <li><strong>Para interceder por outros:</strong> Somos chamados a orar por nossa família, igreja, cidade e nação (1 Timóteo 2:1-2).</li>
        </ul>

        <h3 className="text-lg font-bold text-app-accent mt-4">Elementos da Oração: O Modelo A.C.A.S.</h3>
        <p>Um método simples e eficaz de estruturar sua oração é seguir este acróstico:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Adoração:</strong> Louvar a Deus pelo que Ele é, Sua grandeza e atributos.</li>
          <li><strong>Confissão:</strong> Reconhecer nossos erros e pedir perdão (1 João 1:9).</li>
          <li><strong>Ação de Graças:</strong> Agradecer por tudo o que Ele tem feito.</li>
          <li><strong>Súplica:</strong> Apresentar pedidos, tanto pessoais quanto por outras pessoas (intercessão).</li>
        </ul>

        <h3 className="text-lg font-bold text-app-accent mt-4">Conclusão</h3>
        <p>A oração move a mão de Deus e molda os nossos corações. Faça da oração um hábito diário. Reúna sua família, ore em silêncio no seu quarto ou cante a Ele. O importante é manter essa conexão constante.</p>
      </div>
    )
  },
  {
    id: 6,
    title: 'A Galeria da Fé (Hebreus 11)',
    description: 'Uma jornada inspiradora pelos heróis da fé nas Escrituras e o que eles nos ensinam.',
    readTime: '15 min',
    tags: ['Fé', 'Personagens Bíblicos'],
    content: (
       <div className="space-y-4 text-app-text">
        <p>O capítulo 11 da carta aos Hebreus é frequentemente chamado de "Galeria da Fé". Nele, somos lembrados de homens e mulheres que, apesar de suas imperfeições, escolheram confiar nas promessas de Deus e foram aprovados por Ele.</p>
        
        <div className="bg-app-sidebar p-4 rounded-lg my-4 border-l-4 border-app-accent">
          <em>"Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos."</em> - Hebreus 11:1
        </div>

        <h3 className="text-lg font-bold text-app-accent mt-4">Exemplos Notáveis na Galeria</h3>
        
        <h4 className="font-semibold mt-2">1. Noé: Fé Que Obedece Sem Entender</h4>
        <p>Noé foi avisado sobre coisas "que ainda não se viam" (o dilúvio). Pela sua fé reverente, ele construiu a arca, salvando sua casa (Hb 11:7). Sua obediência persistente, mesmo num cenário improvável, é um eterno testemunho do valor da obediência radical.</p>

        <h4 className="font-semibold mt-4">2. Abraão: Fé Que Sai da Zona de Conforto</h4>
        <p>Abraão foi chamado para ir a uma terra que receberia por herança e partiu, "sem saber para onde ia" (Hb 11:8). Fé exige movimento. Ele trocou as certezas de sua cultura e conforto por uma promessa do Deus invisível.</p>

        <h4 className="font-semibold mt-4">3. Moisés: Fé Que Renuncia os Prazeres Temporais</h4>
        <p>Criado no palácio egípcio, Moisés "recusou ser chamado filho da filha do faraó" (Hb 11:24). Escolheu ser maltratado com o povo de Deus a desfrutar os prazeres transitórios do pecado. Ele focou na recompensa eterna.</p>

        <h4 className="font-semibold mt-4">4. Raabe: Fé Que Transforma o Destino</h4>
        <p>Raabe, a prostituta de Jericó, acreditou no poder de Iavé ao acolher os espiões israelitas. Sua fé em ação a salvou da destruição da cidade e a inseriu na linhagem do próprio Messias (Hb 11:31; Mateus 1:5).</p>

        <h3 className="text-lg font-bold text-app-accent mt-4">O Que a Vida Deles nos Ensina?</h3>
        <p>Nenhum desses heróis era perfeito. Eles tropeçaram, tiveram dúvidas e medos. O que os distinguiu foi a disposição em confiar no caráter inabalável de Deus. Eles creram na promessa, mesmo não tendo recebido o pleno cumprimento na sua época (Hb 11:39).</p>
        
        <div className="bg-app-accent/10 border border-app-accent/20 p-4 rounded-lg mt-6">
          <h4 className="font-bold text-app-accent">A Corrida da Vida Cristã</h4>
          <p className="mt-2 text-sm">O legado desses heróis deve nos encorajar: <em>"Portanto, também nós... deixemos todo embaraço e o pecado que tão de perto nos rodeia, e corramos com perseverança a carreira que nos está proposta, olhando firmemente para Jesus, o Autor e Consumador da nossa fé."</em> (Hebreus 12:1-2).</p>
        </div>
      </div>
    )
  }
];

export default function StudiesView() {
  const [selectedStudy, setSelectedStudy] = useState<(typeof studies)[0] | null>(null);

  // Scroll para o topo quando abrir um estudo
  if (selectedStudy) {
    window.scrollTo(0, 0);
  }

  return (
    <div className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8 pb-8 border-b border-app-border relative">
          <img 
            src="/logo.png" 
            alt="Logo ADPG" 
            className="w-full max-w-[280px] h-auto object-contain drop-shadow-md"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              document.getElementById('studies-text-logo')!.style.display = 'flex';
            }} 
          />
          <div id="studies-text-logo" className="w-full flex-col items-center mt-2" style={{ display: 'none' }}>
            <Logo />
          </div>
          <h1 className="text-xl sm:text-2xl mt-4 font-serif font-bold text-app-accent text-center">Estudos Bíblicos</h1>
        </div>

        <div className="flex-1 scrollbar-thin">
        {selectedStudy ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setSelectedStudy(null)}
              className="flex items-center gap-2 text-app-taupe hover:text-app-text mb-6 group transition-colors"
            >
              <div className="bg-app-sidebar p-1.5 rounded-lg group-hover:bg-app-accent group-hover:text-white transition-colors">
                <ArrowLeft size={16} />
              </div>
              <span className="text-sm font-semibold">Voltar para Estudos</span>
            </button>
            <div className="flex gap-2 mb-4">
              {selectedStudy.tags.map(tag => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-white bg-app-accent px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
              <span className="text-[10px] text-app-taupe flex items-center ml-auto">
                Leitura de {selectedStudy.readTime}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-6 text-app-text">
              {selectedStudy.title}
            </h1>
            <div className="text-[15px] leading-relaxed">
              {selectedStudy.content}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <p className="text-app-taupe text-sm mb-6">
              Aprofunde-se na Palavra de Deus com nossos estudos temáticos elaborados para fortalecer a sua fé e entendimento cristão.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {studies.map((study) => (
                <div 
                  key={study.id}
                  onClick={() => setSelectedStudy(study)}
                  className="bg-app-sidebar border border-app-border p-5 rounded-xl hover:border-app-accent transition-colors cursor-pointer group flex flex-col h-full"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-2">
                        {study.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-white bg-app-accent px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-app-taupe">{study.readTime}</span>
                    </div>
                    <h3 className="font-bold text-base text-app-accent mb-2 group-hover:underline">{study.title}</h3>
                    <p className="text-sm text-app-text/80 line-clamp-2 leading-relaxed">
                      {study.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-app-border flex items-center justify-between text-app-accent font-semibold text-xs uppercase tracking-wider group-hover:gap-2 transition-all">
                    <span>Ler Estudo</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
              <h4 className="font-bold text-blue-600 mb-2">Mais estudos em breve!</h4>
              <p className="text-xs text-app-taupe">Estamos preparando novos conteúdos para abençoar sua vida.</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
