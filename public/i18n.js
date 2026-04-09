/* ══════════════════════════════════════════════════════
   i18n.js — Music Hub West localization
   Default: English. Swedish as secondary.
   ══════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  en: {
    // NAV
    'nav.start':    'Start',
    'nav.events':   'Events',
    'nav.articles': 'Articles',
    'nav.about':    'About',

    // FOOTER
    'footer.tagline':  "A platform for the music industry's growth in Western Sweden.",
    'footer.col.nav':  'Navigate',
    'footer.col.proj': 'Project',
    'footer.col.part': 'Partners',
    'footer.link.about':   'About us',
    'footer.link.contact': 'Contact',
    'footer.copy2': 'Part of Tune In West 2026–2029',

    // BUTTONS
    'btn.register':   'Register now',
    'btn.read-more':  'Read more',
    'btn.send':       'Send',
    'btn.send-msg':   'Send message',
    'btn.read-tiw':   'Read more about Tune In West →',
    'btn.read-us':    'Read more about us',
    'btn.contact':    'Contact us →',
    'btn.send-email': 'Send email',

    // FILTER / TABS
    'filter.label': 'Filter',
    'filter.all':   'All',
    'tab.about':    'About us',
    'tab.contact':  'Contact',
    'tab.partners': 'Partners',

    // INDEX
    'index.events.title': 'Upcoming Events',
    'index.events.more':  'All events',
    'index.news.title':   'News & Articles',
    'index.news.more':    'All articles',
    'index.strip.kicker': 'Project 2026–2029',
    'index.strip.text':   "Funded by Tillväxtverket, Västra Götalandsregionen, the Academy of Music and Drama, and Brewhouse Göteborg to support the music industry's growth in Western Sweden.",

    // HERO SLIDES
    'hero.s1.title': 'Masterclass in AI for the Music Industry',
    'hero.s1.sub':   'June 17th at Brewhouse',
    'hero.s2.title': 'Music Tech Summit 2026',
    'hero.s2.sub':   'October 24th at HSM, Gothenburg',
    'hero.s3.title': 'Play Bongo with Your Left Hand',
    'hero.s3.sub':   'September 3rd at Kulturverkstaden',
    'hero.s4.title': 'AI and Copyright – Where is the Line?',
    'hero.s4.sub':   'May 12th at HSM, Gothenburg',

    // EVENT CARDS
    'ev.c1.title': 'Masterclass in AI for the Music Industry',
    'ev.c1.desc':  'Learn how to leverage AI for making good decisions in your music career.',
    'ev.c2.title': 'Play Bongo with Your Left Hand',
    'ev.c2.desc':  'Learn how to leverage AI for making good decisions.',
    'ev.c3.title': 'AI and Copyright',
    'ev.c3.desc':  'Learn how to leverage AI for making good decisions.',
    'ev.c4.title': 'Music Tech Summit 2026',
    'ev.c4.desc':  'The entire music industry tech day gathers in Gothenburg to explore future possibilities.',
    'ev.c5.title': 'Open Stage – Show Your Material',
    'ev.c5.desc':  'The evening is open to everyone who wants to showcase their music in a relaxed environment.',
    'ev.c6.title': 'Seminar: The Future of the Music Industry',
    'ev.c6.desc':  'Leading voices discuss how the industry is changing and where we are headed.',

    // ARTICLES PAGE
    'art.hero.title':    'Articles &\nNews',
    'art.hero.sub':      'Reportage, reflections and news from music industry players in Western Sweden.',
    'art.feat.title':    '20 Companies Attended the AI Agents Workshop',
    'art.feat.meta':     'Angelica Kranz · May 12th 2026',
    'art.feat.desc':     'Musicians, Producers and Record Labels gathered at Brewhouse to learn how AI agents can streamline their work. "So much fun" said one participant spontaneously after the workshop.',
    'art.c1.title': 'Why Is It So Hard to Find Funding?',
    'art.c1.desc':  'Learn how to leverage AI for making good decisions in the music industry.',
    'art.c2.title': 'AI and Copyright – A Legal Vacuum',
    'art.c2.desc':  'Learn how to leverage AI for making good decisions.',
    'art.c3.title': 'New Report: Music Industry Growth in the West',
    'art.c3.desc':  'A new report from Tillväxtverket shows that the music industry in Western Sweden is growing faster than the national average.',
    'art.c4.title': 'Five Tips for Booking Your First Tour',
    'art.c4.desc':  'Booking a tour can feel overwhelming. Here are five concrete steps to get started.',
    'art.c5.title': 'Streaming Revenue – What Actually Reaches the Artist?',
    'art.c5.desc':  'We go through how money flows through the major platforms and what it means for you as an artist.',
    'art.c6.title': 'Brewhouse Opens New Studio for Members',
    'art.c6.desc':  'A brand new recording studio with state-of-the-art equipment opens for Brewhouse members on March 1st.',

    // OM PAGE
    'om.hero.sub':     'A platform that brings together music industry players in Western Sweden.',
    'om.contact.title': 'Contact us',
    'om.contact.sub':  "Funded by Tillväxtverket, Västra Götalandsregionen, the Academy of Music and Drama, and Brewhouse Göteborg to support the growth of the music industry.",
    'om.form.title':   'Send a message',
    'om.form.name':    'Name',
    'om.form.email':   'Email',
    'om.form.org':     'Organisation',
    'om.form.msg':     'Message',
    'om.form.name.ph': 'Your name',
    'om.form.email.ph':'your@email.com',
    'om.form.org.ph':  'Company / Organisation',
    'om.form.msg.ph':  'How can we help you?',
    'om.form.btn':     'Send',
    'om.strip.text':   "Funded by Tillväxtverket, Västra Götalandsregionen, the Academy of Music and Drama, and Brewhouse Göteborg to support the music industry's growth in Western Sweden.",
    'om.strip.link':   'Read more about the project',

    // TIW PAGE
    'tiw.hero.kicker': 'Project 2026–2029',
    'tiw.hero.text':   "Funded by Tillväxtverket, Västra Götalandsregionen, the Academy of Music and Drama, and Brewhouse Göteborg to create conditions for the music industry's growth in Western Sweden.",
    'tiw.hero.link':   'Contact us →',
    'tiw.stats.title': 'The project in numbers',
    'tiw.stat1.lbl':   'participating companies',
    'tiw.stat2.lbl':   'in funding',
    'tiw.stat3.lbl':   'events per year',
    'tiw.about.t1':    'What is Tune In West?',
    'tiw.about.p1':    "Tune In West is a time-limited project (2026–2029) aimed at strengthening the music industry's infrastructure and growth in Western Sweden.",
    'tiw.about.p2':    "The project is jointly funded by Tillväxtverket, Västra Götalandsregionen, the Academy of Music and Drama (HSM), and Brewhouse Göteborg — and is run through the Music Hub West platform.",
    'tiw.about.p3':    "Tune In West is the sender and co-organiser of a range of activities within Music Hub West — but Music Hub West is an open platform for the entire industry.",
    'tiw.about.t2':    'What do we do?',
    'tiw.b1.title':    'Workshops & Masterclasses',
    'tiw.b1.text':     'Practical training in AI, copyright, funding and business development for the music industry.',
    'tiw.b2.title':    'Music Tech Summit',
    'tiw.b2.text':     "The region's largest gathering where technology and music meet. Held once a year.",
    'tiw.b3.title':    'Network & Matchmaking',
    'tiw.b3.text':     'Connecting artists, producers, record labels and tech companies in the region.',
    'tiw.b4.title':    'Knowledge Sharing',
    'tiw.b4.text':     'Articles, reports and newsletters keeping the industry up to date.',
    'tiw.partners.ttl': 'Funded by',
    'tiw.contact.kicker': 'Contact',
    'tiw.contact.title':  'Contact Tune In West',
    'tiw.contact.text':   'Do you have questions about the project, want to know more about how to participate, or are interested in a collaboration? Get in touch with us directly or fill in the form.',
    'tiw.p1.role':     'Project Manager · Tune In West',
    'tiw.p2.role':     'Communications Manager · Music Hub West',
    'tiw.form.title':  'Send a message',
    'tiw.form.name':   'Name',
    'tiw.form.org':    'Organisation',
    'tiw.form.email':  'Email',
    'tiw.form.msg':    'Message',
    'tiw.form.name.ph':'Your name',
    'tiw.form.org.ph': 'Company / Organisation',
    'tiw.form.email.ph':'your@email.com',
    'tiw.form.msg.ph': 'How can we help you?',
    'tiw.form.btn':    'Send message',

    // EVENT-DETALJ
    'ev.back':         '← All events',
    'ev.meta.date':    'Date',
    'ev.meta.time':    'Time',
    'ev.meta.place':   'Location',
    'ev.meta.cost':    'Cost',
    'ev.meta.free':    'Free of charge',
    'ev.meta.spots':   'Spots left',
    'ev.what.title':   "What's included?",
    'ev.who.title':    'Who is it for?',
    'ev.practical.title': 'Practical information',
    'ev.body.p1':      '<strong>During an intensive half-day you\'ll learn how AI agents can streamline work in the music industry</strong> — whether you\'re an artist, producer, manager or run a record label.',
    'ev.body.p2':      'The workshop is practical and hands-on. We go through tools available today and show you how to start using them immediately — no technical background required.',
    'ev.body.p3':      'The workshop is aimed at those working in the music industry in Western Sweden — artist, songwriter, producer, manager, booker, or running a music-related business. No technical knowledge required.',
    'ev.body.p4':      'The workshop is held at Brewhouse in central Gothenburg. Coffee and a light lunch are included. Max 25 participants — register early to secure your spot.',
    'ev.li1': 'Introduction to AI agents and what they can actually do',
    'ev.li2': 'Hands-on: Automate communication with bookers and promoters',
    'ev.li3': 'AI-assisted text production for press releases and EPKs',
    'ev.li4': 'Data analysis with AI — better understand your Spotify statistics',
    'ev.li5': 'Networking and mingling after the workshop',
    'ev.sidebar.title': 'Register for the event',
    'ev.sidebar.btn':   'Register now',
    'ev.sidebar.note':  'Confirmation sent by email',
    'ev.org.label':     'Organiser',
    'ev.related.title': 'More events',

    // ARTIKEL-DETALJ
    'art.back':         '← All articles',
    'art.related.title':'More articles',
  },

  sv: {
    // NAV
    'nav.start':    'Start',
    'nav.events':   'Event',
    'nav.articles': 'Artiklar',
    'nav.about':    'Om',

    // FOOTER
    'footer.tagline':  'En plattform för musikindustrins tillväxt i Västra Sverige.',
    'footer.col.nav':  'Navigera',
    'footer.col.proj': 'Projekt',
    'footer.col.part': 'Partners',
    'footer.link.about':   'Om oss',
    'footer.link.contact': 'Kontakt',
    'footer.copy2': 'En del av Tune In West 2026–2029',

    // BUTTONS
    'btn.register':   'Anmäl dig nu',
    'btn.read-more':  'Läs mer',
    'btn.send':       'Skicka',
    'btn.send-msg':   'Skicka meddelande',
    'btn.read-tiw':   'Läs mer om Tune In West →',
    'btn.read-us':    'Läs mer om oss',
    'btn.contact':    'Kontakta oss →',
    'btn.send-email': 'Skicka e-post',

    // FILTER / TABS
    'filter.label': 'Filtrera',
    'filter.all':   'Alla',
    'tab.about':    'Om oss',
    'tab.contact':  'Kontakt',
    'tab.partners': 'Partners',

    // INDEX
    'index.events.title': 'Kommande Event',
    'index.events.more':  'Alla event',
    'index.news.title':   'Nyheter & Artiklar',
    'index.news.more':    'Alla artiklar',
    'index.strip.kicker': 'Projekt 2026–2029',
    'index.strip.text':   'Med finansiering från Tillväxtverket, Västra Götalandsregionen, Högskolan för Scen och Musik samt Brewhouse Göteborg skapas förutsättningar för musikindustrins tillväxt inom Västra Götaland.',

    // HERO SLIDES
    'hero.s1.title': 'Masterclass i AI för Musikindustrin',
    'hero.s1.sub':   '17:e Juni på Brewhouse',
    'hero.s2.title': 'Music Tech Summit 2026',
    'hero.s2.sub':   '24:e Oktober på HSM, Göteborg',
    'hero.s3.title': 'Spela Bongotrumma med Vänster Hand',
    'hero.s3.sub':   '3:e September på Kulturverkstaden',
    'hero.s4.title': 'AI och Upphovsrätt – Var går gränsen?',
    'hero.s4.sub':   '12:e Maj på HSM, Göteborg',

    // EVENT CARDS
    'ev.c1.title': 'Masterclass i AI för Musikindustrin',
    'ev.c1.desc':  'Lär dig hur du kan använda AI för att fatta bra beslut i din musikkarriär.',
    'ev.c2.title': 'Spela bongotrumma med vänster hand',
    'ev.c2.desc':  'Get to learn all about how to leverage AI for making good decisions.',
    'ev.c3.title': 'AI och upphovsrätt',
    'ev.c3.desc':  'Get to learn all about how to leverage AI for making good decisions.',
    'ev.c4.title': 'Music Tech Summit 2026',
    'ev.c4.desc':  'Hela musikindustrins techdag samlas i Göteborg för att utforska framtidens möjligheter.',
    'ev.c5.title': 'Öppen scen – Visa upp ditt material',
    'ev.c5.desc':  'Kvällen är öppen för alla som vill visa upp sin musik i en avslappnad miljö.',
    'ev.c6.title': 'Seminarium: Musikbranschens framtid',
    'ev.c6.desc':  'Ledande röster samtalar om hur branschen förändras och vart vi är på väg.',

    // ARTICLES PAGE
    'art.hero.title':    'Artiklar &\nNyheter',
    'art.hero.sub':      'Reportage, reflektioner och nyheter från musikindustrins aktörer i Västra Sverige.',
    'art.feat.title':    '20 bolag deltog i workshoppen om AI-agenter',
    'art.feat.meta':     'Angelica Kranz · 12:e maj 2026',
    'art.feat.desc':     'Musiker, Producenter och Skivbolag hängde tillsammans på Brewhouse och lärde sig hur AI agenter kan effektivisera deras arbete. "Kul som fan" sa en deltagare spontant efter workshopen.',
    'art.c1.title': 'Varför är det så svårt att hitta finansiering för x',
    'art.c1.desc':  'Get to learn all about how to leverage AI for making good decisions in the music industry.',
    'art.c2.title': 'AI och upphovsrätt – ett rättsligt vakuum',
    'art.c2.desc':  'Get to learn all about how to leverage AI for making good decisions.',
    'art.c3.title': 'Ny rapport: Musikbranschens tillväxt i Väst',
    'art.c3.desc':  'En ny rapport från Tillväxtverket visar att musikbranschen i Västra Götaland växer snabbare än rikssnittet.',
    'art.c4.title': 'Fem tips för att boka din första turné',
    'art.c4.desc':  'Att boka en turné kan kännas överväldigande. Här är fem konkreta steg för att komma igång.',
    'art.c5.title': 'Streaming-intäkter – vad hamnar faktiskt hos artisten?',
    'art.c5.desc':  'Vi går igenom hur pengar flödar genom de stora plattformarna och vad det innebär för dig som artist.',
    'art.c6.title': 'Brewhouse öppnar ny studio för members',
    'art.c6.desc':  'En helt ny inspelningsstudio med toppmodern utrustning öppnar för Brewhouse-members den 1 mars.',

    // OM PAGE
    'om.hero.sub':     'En plattform som samlar musikindustrins aktörer i Västra Sverige.',
    'om.contact.title': 'Kontakta oss',
    'om.contact.sub':  'Med finansiering från Tillväxtverket, Västra Götalandsregionen, Högskolan för Scen och Musik samt Brewhouse Göteborg skapas förutsättningar för musikindustrins tillväxt.',
    'om.form.title':   'Skicka ett meddelande',
    'om.form.name':    'Namn',
    'om.form.email':   'E-post',
    'om.form.org':     'Organisation',
    'om.form.msg':     'Meddelande',
    'om.form.name.ph': 'Ditt namn',
    'om.form.email.ph':'din@email.se',
    'om.form.org.ph':  'Företag / Organisation',
    'om.form.msg.ph':  'Vad kan vi hjälpa dig med?',
    'om.form.btn':     'Skicka',
    'om.strip.text':   'Med finansiering från Tillväxtverket, Västra Götalandsregionen, Högskolan för Scen och Musik samt Brewhouse Göteborg skapas förutsättningar för musikindustrins tillväxt inom Västra Götaland.',
    'om.strip.link':   'Läs mer om Projektet',

    // TIW PAGE
    'tiw.hero.kicker': 'Projekt 2026–2029',
    'tiw.hero.text':   'Med finansiering från Tillväxtverket, Västra Götalandsregionen, Högskolan för Scen och Musik samt Brewhouse Göteborg skapas förutsättningar för musikindustrins tillväxt inom Västra Götaland.',
    'tiw.hero.link':   'Kontakta oss →',
    'tiw.stats.title': 'Projektet i siffror',
    'tiw.stat1.lbl':   'deltagande bolag',
    'tiw.stat2.lbl':   'i finansiering',
    'tiw.stat3.lbl':   'event per år',
    'tiw.about.t1':    'Vad är Tune In West?',
    'tiw.about.p1':    'Tune In West är ett tidsbegränsat projekt (2026–2029) med syfte att stärka musikindustrins infrastruktur och tillväxt i Västra Götaland.',
    'tiw.about.p2':    'Projektet finansieras gemensamt av Tillväxtverket, Västra Götalandsregionen, Högskolan för Scen och Musik (HSM) samt Brewhouse Göteborg — och drivs genom plattformen Music Hub West.',
    'tiw.about.p3':    'Tune In West är avsändare och medarrangör för en rad aktiviteter inom ramen för Music Hub West — men Music Hub West är en öppen plattform för hela branschen.',
    'tiw.about.t2':    'Vad gör vi?',
    'tiw.b1.title':    'Workshops & Masterclasses',
    'tiw.b1.text':     'Praktiska utbildningar i AI, upphovsrätt, finansiering och affärsutveckling för musikbranschen.',
    'tiw.b2.title':    'Music Tech Summit',
    'tiw.b2.text':     'Regionens stora mötesplats där teknik och musik möts. Arrangeras en gång per år.',
    'tiw.b3.title':    'Nätverk & matchmaking',
    'tiw.b3.text':     'Kopplar samman artister, producenter, skivbolag och tech-bolag i regionen.',
    'tiw.b4.title':    'Kunskapsspridning',
    'tiw.b4.text':     'Artiklar, rapporter och nyhetsbrev som håller branschen uppdaterad.',
    'tiw.partners.ttl': 'Finansieras av',
    'tiw.contact.kicker': 'Kontakt',
    'tiw.contact.title':  'Kontakta Tune In West',
    'tiw.contact.text':   'Har du frågor om projektet, vill veta mer om hur du kan delta eller är intresserad av ett samarbete? Hör av dig till oss direkt eller fyll i formuläret.',
    'tiw.p1.role':     'Projektledare · Tune In West',
    'tiw.p2.role':     'Kommunikationsansvarig · Music Hub West',
    'tiw.form.title':  'Skicka ett meddelande',
    'tiw.form.name':   'Namn',
    'tiw.form.org':    'Organisation',
    'tiw.form.email':  'E-post',
    'tiw.form.msg':    'Meddelande',
    'tiw.form.name.ph':'Ditt namn',
    'tiw.form.org.ph': 'Företag / Organisation',
    'tiw.form.email.ph':'din@email.se',
    'tiw.form.msg.ph': 'Vad kan vi hjälpa dig med?',
    'tiw.form.btn':    'Skicka meddelande',

    // EVENT-DETALJ
    'ev.back':         '← Alla event',
    'ev.meta.date':    'Datum',
    'ev.meta.time':    'Tid',
    'ev.meta.place':   'Plats',
    'ev.meta.cost':    'Kostnad',
    'ev.meta.free':    'Kostnadsfritt',
    'ev.meta.spots':   'Platser kvar',
    'ev.what.title':   'Vad ingår?',
    'ev.who.title':    'För vem?',
    'ev.practical.title': 'Praktisk information',
    'ev.body.p1':      '<strong>Under en intensiv halvdag lär du dig hur AI-agenter kan effektivisera arbetet i musikbranschen</strong> — oavsett om du är artist, producent, manager eller driver ett skivbolag.',
    'ev.body.p2':      'Workshopen är praktisk och hands-on. Vi går igenom verktyg som redan finns tillgängliga idag och visar hur du kan börja använda dem direkt i din vardag — utan teknisk bakgrund.',
    'ev.body.p3':      'Workshopen riktar sig till dig som jobbar inom musikbranschen i Västra Sverige — artist, låtskrivare, producent, manager, bokare, eller driver ett musikrelaterat företag. Inga tekniska förkunskaper krävs.',
    'ev.body.p4':      'Workshopen hålls på Brewhouse i centrala Göteborg. Kaffe och enklare lunch ingår. Max 25 deltagare — anmäl dig tidigt för att säkra din plats.',
    'ev.li1': 'Introduktion till AI-agenter och vad de faktiskt kan göra',
    'ev.li2': 'Hands-on: Automatisera kommunikation med bokare och promotors',
    'ev.li3': 'AI-assisterad textproduktion för pressreleaser och EPK:er',
    'ev.li4': 'Dataanalys med AI — förstå din Spotify-statistik bättre',
    'ev.li5': 'Nätverksträff och mingel efter workshopen',
    'ev.sidebar.title': 'Anmäl dig till eventet',
    'ev.sidebar.btn':   'Anmäl dig nu',
    'ev.sidebar.note':  'Bekräftelse skickas via e-post',
    'ev.org.label':     'Arrangör',
    'ev.related.title': 'Fler event',

    // ARTIKEL-DETALJ
    'art.back':         '← Alla artiklar',
    'art.related.title':'Fler artiklar',
  }
};

/* ── Engine ─────────────────────────────────────────── */
function applyLang(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t[el.dataset.i18n];
    if (v !== undefined) el.textContent = v;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = t[el.dataset.i18nHtml];
    if (v !== undefined) el.innerHTML = v;
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = t[el.dataset.i18nPh];
    if (v !== undefined) el.placeholder = v;
  });

  document.documentElement.lang = lang;
  localStorage.setItem('mhw-lang', lang);

  // Update toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initI18n() {
  const saved = document.documentElement.lang || localStorage.getItem('mhw-lang') || 'sv';
  applyLang(saved);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
}
