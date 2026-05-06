import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ArrowLeft, Plus, Trash2, Edit3, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth, handleFirestoreError, OperationType } from './AuthProvider';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';

import Logo from './Logo';

const studies = [
  {
    id: 101,
    title: 'Escatologia Bíblica: Sinais do Fim (Pr. Elias Soares de Moraes)',
    description: 'Um estudo gratuito introdutório sobre escatologia, os sinais do retorno de Cristo e a preparação da Igreja.',
    readTime: '15 min',
    tags: ['Elias Soares de Moraes', 'Escatologia'],
    youtubeUrls: ['https://www.youtube.com/embed/NRJLq1v61IU', 'https://www.youtube.com/embed/ZuINhttO_6g'],
    content: (
      <div className="space-y-4 text-app-text">
        <p>A escatologia é a doutrina das últimas coisas. Em diversos de seus ensinamentos, o Pr. Elias destaca a importância de estarmos atentos aos sinais dos tempos não com medo, mas com esperança e vigilância.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">1. Por que estudar Escatologia?</h3>
        <p>Estudar as profecias não é tentar adivinhar datas, mas compreender o plano soberano de Deus para a humanidade e para a Igreja. A Bíblia promete bênçãos aos que leem e guardam as profecias (Apocalipse 1:3).</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">2. O Arrebatamento da Igreja</h3>
        <p>Segundo a visão pré-tribulacionista, a Igreja será retirada da Terra antes do período de ira, a Grande Tribulação. <em>"Porque o mesmo Senhor descerá do céu com alarido..."</em> (1 Tessalonicenses 4:16). A iminência do arrebatamento nos chama a viver uma vida santa e dedicada a Cristo hoje.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">3. Sinais que Antecedem a Vinda</h3>
        <p>Jesus em Mateus 24 mencionou "princípios de dores": guerras, fomes, terremotos e pestes, além da multiplicação da iniquidade e o esfriamento do amor humano. Vemos todos esses eventos escalando de forma global, indicando que nos aproximamos do encerramento desta dispensação.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">Conclusão</h3>
        <p>Não fomos chamados para o pânico, fomos chamados para o serviço. Maranata! Ora vem, Senhor Jesus.</p>
      </div>
    )
  },
  {
    id: 102,
    title: 'Os Dons Espirituais na Atualidade (Pr. Elias Soares de Moraes)',
    description: 'Uma reflexão teológica sobre a contemporaneidade dos dons do Espírito Santo e a edificação da Igreja.',
    readTime: '12 min',
    tags: ['Elias Soares de Moraes', 'Dons Espirituais'],
    youtubeUrls: ['https://www.youtube.com/embed/JTfarqLgWqI', 'https://www.youtube.com/embed/1ELxFbWQBxc'],
    content: (
      <div className="space-y-4 text-app-text">
        <p>O derramar do Espírito Santo no Pentecostes marcou a igreja primitiva com manifestações poderosas. Hoje, os dons continuam vivos e essenciais para a edificação do corpo de Cristo.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">A Natureza dos Dons</h3>
        <p>Os dons (charismata) são dádivas da graça. Não são adquiridos por mérito, mas distribuídos pelo Espírito Santo <em>"como Lhe apraz"</em> (1 Coríntios 12:11).</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">O Propósito: A Edificação da Igreja</h3>
        <p>Todos os dons variam em suas categorias (vocal, saber e poder), mas possuem um fim comum: o proveito de todos e a glorificação de Deus. A operação dos dons revela uma Igreja que não atua puramente pelas próprias forças, mas impulsionada pela vitalidade do Espírito.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">Buscando os Dons Com Zelo</h3>
        <p>O apóstolo Paulo exorta: <em>"Portanto, procurai com zelo os melhores dons"</em> (1 Coríntios 12:31). A busca ativa e submissa ao Espírito trará um reavivamento para a vida da igreja e para a devoção individual de cada crente.</p>
      </div>
    )
  },
  {
    id: 103,
    title: 'Hermenêutica: Entendendo a Bíblia (Pr. Elias Soares de Moraes)',
    description: 'Princípios básicos para a interpretação saudável e ortodoxa das Escrituras Sagradas.',
    readTime: '20 min',
    tags: ['Elias Soares de Moraes', 'Bíblia'],
    youtubeUrls: ['https://www.youtube.com/embed/lUPHwSwuxps'],
    content: (
      <div className="space-y-4 text-app-text">
        <p>A Hermenêutica é a ciência e a arte da interpretação textual. Um dos grandes perigos na vida cristã moderna é interpretar mal a Palavra de Deus, gerando heresias e confusões.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">A Bíblia se Interpreta Sozinha</h3>
        <p>Este é o primeiro princípio da Reforma. Passagens obscuras devem ser iluminadas à luz de passagens claras. O contexto é o soberano na exegese, pois um texto isolado gera pretexto.</p>

        <h3 className="text-lg font-bold text-app-accent mt-4">Considerações Histórico-Culturais</h3>
        <p>Toda carta tem um remetente, um destinatário e uma data. Entender a realidade dos coríntios, a cultura de Éfeso ou o contexto da lei judaica para os gálatas impede que impoñamos os nossos usos modernos sobre os escritos antigos.</p>

        <h3 className="text-lg font-bold text-app-accent mt-4">O Papel do Espírito Santo</h3>
        <p>A teologia não descarta o labor intelectual, mas a iluminação bíblica é uma dádiva do Espírito Santo. Nenhum estudo exegético anula a dependência da oração. Somente Aquele que inspirou a Palavra pode iluminá-la plenamente no coração do leitor.</p>
      </div>
    )
  },
  {
    id: 104,
    title: 'A Batalha Espiritual e a Armadura de Deus (Pr. Elias Soares de Moraes)',
    description: 'Compreenda a realidade da guerra invisível e as disciplinas necessárias para a vitória cristã.',
    readTime: '15 min',
    tags: ['Elias Soares de Moraes', 'Batalha Espiritual'],
    youtubeUrls: ['https://www.youtube.com/embed/6z7gKsZpUsY'],
    content: (
      <div className="space-y-4 text-app-text">
        <p>A batalha espiritual é uma realidade iminente na vida do crente. Não lutamos primariamente contra elementos naturais, mas contra hostes espirituais da maldade (Efésios 6:12). O Pr. Elias ensina que o crente não deve temer, pois o Maior está nele.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">As Táticas do Inimigo</h3>
        <p>A principal arma de Satanás é o engano. Ele age na mente, plantando mentiras sobre a identidade de Deus e sobre o nosso perdão. Estar fundamentado na Palavra é a única defesa efetiva contra as flechas inflamadas da falsidade.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">A Armadura de Efésios 6</h3>
        <p>A fé (escudo), a salvação (capacete), a verdade (cinto), a justiça (couraça) e o evangelho (calçados) são peças defensivas. A nossa única arma de ataque é a Espada do Espírito, que é a Palavra de Deus. Manuseá-la com destreza é requisito para a vitória.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">Vigilância e Oração</h3>
        <p>O capítulo termina exortando à oração em todo tempo no Espírito. A oração não é apenas uma peça da armadura, é o ambiente no qual a batalha é lutada e vencida. Um cristão que não ora é um soldado rendido.</p>
      </div>
    )
  },
  {
    id: 105,
    title: 'O Perfil do Obreiro Aprovado (Pr. Elias Soares de Moraes)',
    description: 'Características vitais de liderança e serviço exigidas daqueles que servem no Reino.',
    readTime: '14 min',
    tags: ['Elias Soares de Moraes', 'Liderança', 'Ministério'],
    youtubeUrls: ['https://www.youtube.com/embed/81LQPe9zd4w'],
    content: (
      <div className="space-y-4 text-app-text">
        <p>O chamado ministerial é um privilégio que acompanha pesada responsabilidade. Baseado nas cartas pastorais de Paulo a Timóteo e Tito, o perfil de um obreiro exige caráter aprovado antes de competência técnica.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">A Prioridade do Caráter</h3>
        <p>A lista de exigências em 1 Timóteo 3 fala muito mais de integridade pessoal do que de habilidades oratórias. Ser irrepreensível, não arrogante e senhor de si mesmo demonstra que o ministério flui da vida pessoal do obreiro para fora.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">O Manejo da Palavra</h3>
        <p>Um obreiro aprovado é aquele <em>"que não tem de que se envergonhar e que maneja bem a palavra da verdade"</em> (2 Tm 2:15). Sem intimidade com as Escrituras, não há ministério autêntico que suporte as provações e os ventos de falsas doutrinas.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">O Coração de Servo</h3>
        <p>Cristo lavou os pés de Seus discípulos. Todo obreiro é, primeiramente, um servo. O Pr. Elias reafirma que títulos não curam feridas, mas o amor prático e a disposição para servir as ovelhas do Senhor, no anonimato ou na visibilidade, agradam a Deus.</p>
      </div>
    )
  },
  {
    id: 106,
    title: 'O Reino de Ponta-Cabeça',
    description: 'Um estudo sobre os valores do Reino de Deus em contraste com os valores do mundo, baseado no Sermão do Monte.',
    readTime: '18 min',
    tags: ['Reino de Deus', 'Sermão do Monte', 'Vida Cristã'],
    content: (
      <div className="space-y-4 text-app-text">
        <p>A expressão "O Reino de Ponta-Cabeça" nos ajuda a entender uma verdade fundamental sobre o Evangelho: os valores de Jesus são quase sempre o oposto absoluto daquilo que a sociedade humana valoriza. Enquanto o mundo busca poder, status e domínio, Jesus inaugura um reino onde os servos são os maiores.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">1. A Lógica das Bem-Aventuranças</h3>
        <p>No início do Sermão do Monte (Mateus 5), Jesus subverte a ideia de "felicidade" ou "bênção". Ele não declara bem-aventurados os ricos, os fortes ou os autossuficientes. Ele abençoa os pobres em espírito, os que choram, os mansos e os perseguidos. Para o mundo, essas pessoas são fracas; no Reino, elas são as herdeiras da terra e de Deus.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">2. O Caminho da Grandeza é Servir</h3>
        <p>Em Marcos 10:42-45, Jesus confronta a liderança tiranizante do império romano e estabelece uma nova ordem para os seus discípulos: <em>"quem quiser tornar-se grande entre vós, será esse o que vos sirva"</em>. O próprio Rei dos reis não veio para ser servido, mas para servir e dar a Sua vida em resgate por muitos.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">3. Amor aos Inimigos: O Ápice da Graça</h3>
        <p>A cultura ensina: "Ame seus amigos e odeie seus inimigos." O Reino exige: <em>"Amai os vossos inimigos e orai pelos que vos perseguem"</em> (Mt 5:44). Amar quem nos ama não exige transformação sobrenatural. O amor ágape, que flui do Espírito, é evidenciado quando amamos aqueles que nos desejam o mal, refletindo assim a natureza do Deus Pai.</p>
        
        <h3 className="text-lg font-bold text-app-accent mt-4">4. Tesouros no Céu vs. Acúmulo na Terra</h3>
        <p>O Reino de Ponta-Cabeça redefine a nossa segurança. A segurança terrena baseia-se em acúmulo de bens, contas bancárias e posses que a traça e a ferrugem consomem. Jesus orienta Seus seguidores a investir em "tesouros no céu" através da generosidade, do contentamento e da busca em primeiro lugar pelo Reino de Deus e Sua justiça (Mateus 6:19-33).</p>

        <h3 className="text-lg font-bold text-app-accent mt-4">Conclusão</h3>
        <p>Viver o Reino de Ponta-Cabeça significa estar na contramão do mundo não por rebeldia vazia, mas por uma santa obediência ao Mestre. Ser cidadão deste Reino é renunciar a si mesmo, tomar a cruz e descobrir que, na matemática de Deus, perder a vida por causa de Cristo é a única forma de encontra-la.</p>
      </div>
    )
  },
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
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'marcosnatalina@gmail.com';
  const [selectedStudy, setSelectedStudy] = useState<any | null>(null);
  const [personalStudies, setPersonalStudies] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStudyId, setEditingStudyId] = useState<string | null>(null);
  const [studyToDelete, setStudyToDelete] = useState<any | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newReadTime, setNewReadTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 700 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 700KB para garantir que o estudo possa ser salvo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const q = query(collection(db, 'personalStudies'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studiesObj = snapshot.docs.map(doc => {
        return { 
          id: doc.id, 
          isPersonal: true, 
          ...doc.data() 
        };
      });
      setPersonalStudies(studiesObj);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'personalStudies');
    });

    return () => unsubscribe();
  }, []);

  const handleCreateOrUpdatePersonalStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const path = 'personalStudies';
      const studyData = {
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        content: newContent.trim(),
        imageUrl: newImageUrl.trim() || null,
        videoUrl: newVideoUrl.trim() || null,
        readTime: newReadTime.trim() || null,
        updatedAt: Date.now()
      };

      if (editingStudyId) {
        await updateDoc(doc(db, path, editingStudyId), studyData);
      } else {
        await addDoc(collection(db, path), {
          ...studyData,
          authorId: user.uid,
          createdAt: Date.now(),
        });
      }
      setIsCreating(false);
      setEditingStudyId(null);
      setNewTitle('');
      setNewDescription('');
      setNewImageUrl('');
      setNewVideoUrl('');
      setNewContent('');
      setNewReadTime('');
    } catch (error) {
      console.error("Error saving study:", error);
      handleFirestoreError(error, editingStudyId ? OperationType.UPDATE : OperationType.CREATE, 'personalStudies');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (study: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudyId(study.id);
    setNewTitle(study.title || '');
    setNewDescription(study.description || '');
    setNewContent(study.content || '');
    setNewImageUrl(study.imageUrl || '');
    setNewVideoUrl(study.videoUrl || '');
    setNewReadTime(study.readTime || '');
    setIsCreating(true);
    setSelectedStudy(null);
  };

  const confirmDeletePersonalStudy = (study: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      console.warn("Apenas administradores podem excluir estudos.");
      return;
    }
    setStudyToDelete(study);
  };

  const executeDeleteStudy = async () => {
    if (!studyToDelete) return;
    
    try {
      const path = 'personalStudies';
      await deleteDoc(doc(db, path, studyToDelete.id));
      if (selectedStudy?.id === studyToDelete.id) {
        setSelectedStudy(null);
      }
      setStudyToDelete(null);
    } catch (error: any) {
      console.error("Error deleting study:", error);
      handleFirestoreError(error, OperationType.DELETE, 'personalStudies');
    }
  };

  const [activeTab, setActiveTab] = useState<'oficias' | 'meus'>('oficias');

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
            {isAdmin && (
              <span className="text-[10px] font-bold text-app-accent mt-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse"></div> 
                PAINEL ADMINISTRATIVO
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl mt-4 font-serif font-bold text-app-accent text-center">Estudos Bíblicos</h1>
          
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => { setActiveTab('oficias'); setSelectedStudy(null); setIsCreating(false); }}
              className={`px-4 py-2 font-bold uppercase tracking-wider text-xs rounded-full transition-colors ${activeTab === 'oficias' ? 'bg-app-accent text-white' : 'bg-app-sidebar text-app-taupe hover:text-app-text border border-app-border'}`}
            >
              Estudos Oficiais
            </button>
            <button 
              onClick={() => { setActiveTab('meus'); setSelectedStudy(null); }}
              className={`px-4 py-2 font-bold uppercase tracking-wider text-xs rounded-full transition-colors ${activeTab === 'meus' ? 'bg-app-accent text-white' : 'bg-app-sidebar text-app-taupe hover:text-app-text border border-app-border'}`}
            >
              Estudos da Comunidade
            </button>
          </div>
        </div>

        <div className="flex-1 scrollbar-thin">
        {selectedStudy ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setSelectedStudy(null)}
                className="flex items-center gap-2 text-app-taupe hover:text-app-text group transition-colors"
              >
                <div className="bg-app-sidebar p-1.5 rounded-lg group-hover:bg-app-accent group-hover:text-white transition-colors">
                  <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-semibold">Voltar para Estudos</span>
              </button>

              {isAdmin && selectedStudy.isPersonal && (
                <div className="flex gap-2 ml-auto">
                  <button 
                    onClick={(e) => handleEditClick(selectedStudy, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-app-sidebar border border-app-border rounded-lg text-xs font-bold text-app-taupe hover:text-app-accent hover:border-app-accent transition-colors"
                  >
                    <Edit3 size={14} /> Editar
                  </button>
                  <button 
                    onClick={(e) => confirmDeletePersonalStudy(selectedStudy, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 border border-red-400/20 rounded-lg text-xs font-bold text-red-400 hover:bg-red-400/20 transition-colors"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              {(selectedStudy.tags || []).map((tag: string) => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-white bg-app-accent px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
              {selectedStudy.readTime && <span className="text-[10px] text-app-taupe flex items-center ml-auto">
                Leitura de {selectedStudy.readTime}
              </span>}
            </div>
            {selectedStudy.imageUrl && (
              <div className="w-full aspect-[2/1] rounded-2xl overflow-hidden mb-8 border border-app-border shadow-md">
                <img src={selectedStudy.imageUrl} alt={selectedStudy.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-6 text-app-text">
              {selectedStudy.title}
            </h1>

            
            {/* Renderizar novo tipo de conteudo como pre-wrap se for string, caso contrario (estudos oficiais) manter como react node */}
            <div className="text-[15px] leading-relaxed text-app-text">
              {typeof selectedStudy.content === 'string' ? (
                <div className="whitespace-pre-wrap">{selectedStudy.content}</div>
              ) : (
                selectedStudy.content
              )}
            </div>

            {selectedStudy.youtubeUrls && selectedStudy.youtubeUrls.length > 0 && (
              <div className="mt-12 pt-8 border-t border-app-border">
                <h3 className="text-xl font-bold font-serif mb-6 text-app-accent flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Vídeos Relacionados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-full overflow-hidden">
                  {selectedStudy.youtubeUrls.map((url: string, i: number) => (
                    <div key={i} className="aspect-video w-full max-w-full rounded-xl overflow-hidden shadow-lg border border-app-border bg-app-sidebar flex justify-center items-center">
                      <iframe 
                        className="w-full h-full max-w-full overflow-hidden" 
                        src={url} 
                        title={`Vídeo Aula ${i + 1}`} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedStudy.videoUrl && (
              <div className="mt-12 pt-8 border-t border-app-border">
                <h3 className="text-xl font-bold font-serif mb-6 text-app-accent flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Vídeo do Estudo
                </h3>
                <div className="aspect-video w-full max-w-full rounded-xl overflow-hidden shadow-lg border border-app-border bg-app-sidebar flex justify-center items-center">
                  <iframe 
                    className="w-full h-full max-w-full overflow-hidden" 
                    src={selectedStudy.videoUrl.includes('youtube.com') || selectedStudy.videoUrl.includes('youtu.be') ? `https://www.youtube.com/embed/${selectedStudy.videoUrl.includes('v=') ? selectedStudy.videoUrl.split('v=')[1]?.split('&')[0] : selectedStudy.videoUrl.split('/').pop()}` : selectedStudy.videoUrl} 
                    title="Vídeo do Estudo" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        ) : isCreating ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <button 
                onClick={() => {
                  setIsCreating(false);
                  setEditingStudyId(null);
                  setNewTitle('');
                  setNewDescription('');
                  setNewImageUrl('');
                  setNewContent('');
                  setNewReadTime('');
                }}
                className="flex items-center gap-2 text-app-taupe hover:text-app-text mb-6 group transition-colors"
              >
                <div className="bg-app-sidebar p-1.5 rounded-lg group-hover:bg-app-accent group-hover:text-white transition-colors">
                  <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-semibold">Cancelar Cadastro</span>
              </button>

              <form onSubmit={handleCreateOrUpdatePersonalStudy} className="bg-app-sidebar p-6 rounded-xl border border-app-border space-y-4">
                <h2 className="text-lg font-bold font-serif text-app-accent mb-4">{editingStudyId ? 'Editar Estudo' : 'Adicionar Novo Estudo'}</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-app-text mb-1">Título do Estudo <span className="text-app-accent">*</span></label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text focus:outline-none focus:border-app-accent transition-colors"
                    placeholder="Ex: Estudo sobre a Graça"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-app-text mb-1">Pequena Descrição</label>
                  <input 
                    type="text" 
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text focus:outline-none focus:border-app-accent transition-colors"
                    placeholder="Resumo do estudo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-app-text mb-1">Imagem de Capa (URL ou Arquivo)</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text focus:outline-none focus:border-app-accent transition-colors"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                      <label className="flex items-center justify-center gap-2 px-4 py-2 bg-app-bg border border-app-border rounded-lg text-app-taupe hover:text-app-accent hover:border-app-accent transition-colors cursor-pointer font-bold text-sm">
                        <ImageIcon size={18} />
                        Upload
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                    {newImageUrl && (
                      <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-app-border bg-app-bg">
                        <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setNewImageUrl('')}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="absolute inset-0 pointer-events-none border-2 border-app-accent opacity-30"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-app-text mb-1">Link de Vídeo do YouTube</label>
                  <input 
                    type="url" 
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text focus:outline-none focus:border-app-accent transition-colors"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-app-text mb-1">Tempo de Leitura</label>
                  <input 
                    type="text" 
                    value={newReadTime}
                    onChange={(e) => setNewReadTime(e.target.value)}
                    className="w-full bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text focus:outline-none focus:border-app-accent transition-colors"
                    placeholder="Ex: 5 min"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-app-text mb-1">Conteúdo <span className="text-app-accent">*</span></label>
                  <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full h-64 bg-app-bg border border-app-border rounded-lg px-4 py-2 text-app-text focus:outline-none focus:border-app-accent transition-colors resize-y scrollbar-thin"
                    placeholder="Digite o conteúdo do seu estudo aqui..."
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                    className="bg-app-accent text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Estudo'
                    )}
                  </button>
                </div>
              </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            {activeTab === 'oficias' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="flex justify-end items-center mb-6">
                  {isAdmin && (
                    <button 
                      onClick={() => setIsCreating(true)}
                      className="bg-app-accent text-white px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-opacity-90 flex items-center gap-2"
                    >
                      <Plus size={16} /> Novo Estudo
                    </button>
                  )}
                </div>

                {personalStudies.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-app-border rounded-xl bg-app-bg text-app-taupe">
                    Ainda não existem estudos na comunidade.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {personalStudies.map((study) => (
                      <div 
                        key={study.id}
                        className="bg-app-sidebar border border-app-border p-5 rounded-xl hover:border-app-accent transition-colors cursor-pointer group flex flex-col h-full"
                      >
                        {study.imageUrl && (
                          <div className="-mx-5 -mt-5 mb-4 aspect-[2/1] overflow-hidden border-b border-app-border" onClick={() => setSelectedStudy(study)}>
                             <img src={study.imageUrl} alt={study.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="flex-1" onClick={() => setSelectedStudy(study)}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-app-taupe">{study.readTime}</span>
                          </div>
                          <h3 className="font-bold text-base text-app-accent mb-2 group-hover:underline">{study.title}</h3>
                          {study.description && (
                            <p className="text-sm text-app-text/80 line-clamp-2 leading-relaxed">
                              {study.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-app-border flex items-center justify-between text-app-accent font-semibold text-xs uppercase tracking-wider transition-all">
                          <span className="group-hover:pl-2 transition-all flex items-center gap-1 cursor-pointer" onClick={() => setSelectedStudy(study)}>Ler <ChevronRight size={14} /></span>
                          <div className="flex gap-2">
                            {isAdmin && (
                              <>
                                <button 
                                  onClick={(e) => handleEditClick(study, e)}
                                  className="text-app-taupe hover:text-app-accent p-1 bg-app-sidebar rounded border border-app-border"
                                  title="Editar estudo"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button 
                                  onClick={(e) => confirmDeletePersonalStudy(study, e)}
                                  className="text-red-400 hover:text-red-500 p-1 bg-red-400/10 rounded"
                                  title="Excluir estudo"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Confirmation Modal */}
      {studyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-app-sidebar border border-app-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-400/20 flex items-center justify-center mb-4 text-red-500">
                <Trash2 size={24} />
              </div>
              <h2 className="text-xl font-bold font-serif text-app-text mb-2">Excluir Estudo</h2>
              <p className="text-app-taupe text-sm leading-relaxed mb-6">
                Tem certeza que deseja excluir o estudo <span className="font-bold text-app-text">"{studyToDelete.title}"</span>? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setStudyToDelete(null)}
                  className="px-4 py-2 rounded-lg font-bold text-sm bg-app-bg border border-app-border text-app-text hover:bg-black/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeDeleteStudy}
                  className="px-4 py-2 rounded-lg font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                >
                  Excluir Permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
