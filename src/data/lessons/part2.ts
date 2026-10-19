import type { Lesson } from './types';

const EM = '6:0+5:2+4:2+3:0+2:0+1:0';
const C = '5:3+4:2+3:0+2:1+1:0';
const G = '6:3+5:2+4:0+3:0+2:0+1:3';
const D = '4:0+3:2+2:3+1:2';

export const LESSONS_PART2: Lesson[] = [
  {
    id: 'drop-akort',
    num: 8,
    title: 'Drop D ve Drop C',
    subtitle: 'Ağır sesin sırrı: düşük akort ve tek parmak power chord',
    level: 'Temel',
    minutes: 20,
    goals: ['Drop akortun mantığını anla', 'Tek parmak power chord kullan', 'Drop C ve tel kalınlığı hakkında bilgi edin'],
    techniques: ['drop-tuning', 'power-chord', 'chug'],
    blocks: [
      {
        type: 'md',
        text: `### Neden akortu düşürürüz?

Akort düştükçe ses **kalınlaşır ve karanlıklaşır**. "Drop" akortlarda en kalın tel diğerlerinden bir tam ses daha aşağıda olduğu için **alt üç tel aynı perdede basıldığında power chord** oluşur. Bu da hızlı akor değişimlerini ve açık telle chug yapmayı çok kolaylaştırır.

| Akort | 6 | 5 | 4 | 3 | 2 | 1 |
|---|---|---|---|---|---|---|
| Standart | E | A | D | G | B | E |
| **Drop D** | **D** | A | D | G | B | E |
| D Standart | D | G | C | F | A | D |
| **Drop C** | **C** | G | C | F | A | D |`,
      },
      { type: 'tones', tuning: 'dropD', caption: 'Drop D açık teller' },
      { type: 'chords', ids: ['D5drop', 'F5drop'], caption: 'Drop D\'de power chord: tek parmak yeter.' },
      { type: 'tab', title: 'Drop D: tek parmak', tab: 'q Q6:0 Q6:3 Q6:5 Q6:7 | e 6:0m 6:0m Q6:3> 6:0m 6:0m Q6:5> 6:0m Q6:7> |', tuning: 'dropD', bpm: 110, startBpm: 70, drums: 'four', tone: 'distortion' },
      {
        type: 'md',
        text: `### Drop C

Drop C'de bütün teller önce bir tam ses aşağı (D standart) indirilir, sonra 6. tel bir tam ses daha düşürülür: **C G C F A D**. Tek parmak power chord mantığı aynıdır; sadece her şey daha kalın ve daha karanlıktır.

Aşağıdaki örnekte kökten **yarım ses yukarı** (1. perde) gidip gelen hareketi duyacaksın. Bu "b2" aralığı Frigyen gamın karanlık karakteridir ve Alman endüstriyel metalinde çok sık kullanılır. Rammstein'ın Deutschland, Amerika, Keine Lust ve Benzin gibi şarkıları Drop C'dedir.`,
      },
      { type: 'tones', tuning: 'dropC', caption: 'Drop C açık teller' },
      { type: 'tab', title: 'Drop C: karanlık chug', tab: 'e 6:0m 6:0m 6:0m Q6:1> 6:0m 6:0m Q6:3> r | 6:0m 6:0m 6:0m Q6:1> 6:0m Q6:5> Q6:3> Q6:1> |', tuning: 'dropC', bpm: 100, startBpm: 70, drums: 'four', tone: 'distortion' },
      {
        type: 'tip',
        tone: 'warn',
        title: 'Tel kalınlığı önemli',
        text: 'Standart 09–42 ya da 10–46 tellerle Drop D sorunsuzdur. Drop C ve daha aşağısı için 11–56 veya 12–56 gibi kalın setler kullan; yoksa teller gevşek kalır, perdelere çarpar (fret buzz) ve akort kolayca kayar. Akortu kalıcı olarak değiştireceksen sap ayarını (truss rod) bir gitar teknisyenine yaptırmak iyi olur.',
      },
      { type: 'riffs', ids: ['drop-d-tek-parmak', 'downpicking-dayaniklilik'] },
    ],
    checklist: [
      'Gitarımı Drop D\'ye indirip tekrar standart akorta getirebiliyorum.',
      'Tek parmakla power chord basıp temiz çalabiliyorum.',
      'Drop C\'nin hangi notalardan oluştuğunu biliyorum.',
      'Düşük akortlarda neden kalın tel gerektiğini anladım.',
    ],
  },
  {
    id: 'rammstein-ritim',
    num: 9,
    title: 'Rammstein Tarzı Ritim Gitar',
    subtitle: 'Neue Deutsche Härte: makine gibi sıkı chug\'lar, vurgular ve sessizlik',
    level: 'Orta',
    minutes: 30,
    goals: ['Rammstein ritim gitarının karakteristik ögelerini tanı', 'Makine gibi sıkı (tight) çalmayı çalış', 'Davul makinesiyle kilitlenerek riff çal'],
    techniques: ['palm-mute', 'chug', 'downpicking', 'drop-tuning', 'syncopation'],
    blocks: [
      {
        type: 'md',
        text: `### Neue Deutsche Härte

Rammstein'ın öncülüğünü yaptığı tarz **Neue Deutsche Härte** (Yeni Alman Sertliği) olarak bilinir: endüstriyel müzik, metal ve elektronik ögelerin birleşimi. Gitar çalımı teknik gösterişten çok **güç, kesinlik ve tekrar** üzerine kuruludur — bu da onu yeni başlayan biri için harika bir okul yapar.

### Karakteristik ögeler

1. **Akort:** çoğunlukla Drop D ya da Drop C; bazı şarkılar (Du Hast, Links 2 3 4) standart akortta.
2. **Açık telde palm mute'lu chug'lar** — sekizlik ya da onaltılık, neredeyse hep aşağı vuruşla.
3. **Vurgulu power chord darbeleri** ve ardından gelen **ani sessizlik** (staccato).
4. **Davulla kilitlenme:** gitar, kick davulun ritmini birebir takip eder. Riff aslında bir davul kalıbı gibidir.
5. **Tekrar:** Aynı riff dakikalarca, hiç sapmadan çalınır. Önemli olan **dayanıklılık ve tutarlılık**.
6. **Karanlık aralıklar:** kökten yarım ses yukarı (b2) ya da küçük üçlü (b3) hareketleri.`,
      },
      {
        type: 'tab',
        title: 'Makine ritmi',
        tab: 's 6:0m> 6:0m 6:0m 6:0m e Q6:3> r s 6:0m> 6:0m 6:0m 6:0m e Q6:5> r | s 6:0m> 6:0m 6:0m 6:0m e Q6:3> r s 6:0m> 6:0m e Q6:1> Q6:0> r |',
        tuning: 'dropC',
        bpm: 110,
        startBpm: 70,
        drums: 'four',
        tone: 'distortion',
      },
      {
        type: 'md',
        text: `### Sıkı çalmak (tightness)

Rammstein'ın sesinin "makine gibi" olmasının nedeni iki gitarın, basın ve davulun **milisaniye hassasiyetinde birlikte** çalmasıdır. Sen de şunlara dikkat et:

- **Her notayı aynı güçte çal.** Chug'lar birbirinden farklı yükseklikte çıkmamalı.
- **Akorları zamanında kes.** Sus da bir notadır: akordan sonraki sessizlik tam vuruşunda başlamalı.
- **Davulla çal.** Oynatıcıda "Endüstriyel" davul kalıbını seç, kulaklık simgesiyle gitar sesini kapat ve riffi sadece davula karşı çal.
- **Yavaştan hızlıya.** Hız antrenörünü orijinal tempanın %60'ından başlat.`,
      },
      {
        type: 'tab',
        title: 'Senkop: 3 + 3 + 2 vurgu',
        tab: 'e 6:0m 6:0m Q6:3> 6:0m 6:0m Q6:3> 6:0m 6:0m | Q6:5> 6:0m 6:0m Q6:3> r Q6:1> r r |',
        tuning: 'dropC',
        bpm: 100,
        startBpm: 70,
        drums: 'four',
        tone: 'distortion',
        note: 'Vurgular vuruşların arasına düşer; içinden "1-2-3, 1-2-3, 1-2" diye say.',
      },
      {
        type: 'tab',
        title: 'Oktav melodisi + chug',
        tab: 'e 6:0m 6:0m 4:3+2:6 6:0m 6:0m 4:5+2:8 6:0m 4:3+2:6 | 6:0m 6:0m 4:1+2:4 6:0m 6:0m 4:3+2:6 q r |',
        tuning: 'dropC',
        bpm: 100,
        startBpm: 65,
        drums: 'four',
        tone: 'distortion',
        note: 'Oktav şekli: 4. ve 2. tel. Aradaki 3. teli işaret parmağının alt kısmıyla sustur.',
      },
      {
        type: 'tip',
        tone: 'metal',
        title: 'İki gitarın kalınlığı',
        text: 'Rammstein kayıtlarında iki gitarist genellikle aynı riffi birlikte çalar ve gitarlar sağ-sol kanallara yayılır. Tek başına çalarken o kalınlığı yakalamak için distorsiyonu sonuna kadar açmak yerine palm mute\'u ve aşağı vuruşu sıkı tutmak çok daha etkilidir. Fazla gain sesi bulanıklaştırır.',
      },
      { type: 'riffs', ids: ['du-hast', 'sonne', 'links-234', 'feuer-frei'], caption: 'Şimdi Rammstein riff\'lerine geç' },
    ],
    checklist: [
      'Onaltılık chug\'ları aşağı vuruşla 90 BPM\'de eşit çalabiliyorum.',
      'Akorları tam vuruşunda kesebiliyorum (staccato).',
      'Gitar sesini kapatıp sadece davul eşliğinde riff çalabiliyorum.',
      'En az bir Rammstein riffini baştan sona çalabiliyorum.',
    ],
  },
  {
    id: 'acik-akorlar',
    num: 10,
    title: 'Açık Akorlar ve Tıngırdatma',
    subtitle: 'Em, Am, C, G, D, E, A ve ritmi bozmadan akor değiştirme',
    level: 'Temel',
    minutes: 30,
    goals: ['Temel açık akorları öğren', 'Akor geçişlerini ritmi bozmadan yap', 'Temel tıngırdatma kalıbını çal'],
    techniques: ['open-chord'],
    blocks: [
      {
        type: 'md',
        text: `### Açık akorlar

Açık akorlar, içinde açık (basılmayan) tel bulunan ve genelde ilk üç perdede çalınan akorlardır. Power chord'lar ağır riffler için harikadır; ama şarkılara eşlik etmek, balad çalmak ve armoniyi anlamak için açık akorlar şarttır.`,
      },
      { type: 'chords', ids: ['Em', 'Am', 'C', 'G', 'D', 'E', 'A'], caption: 'Akor şemasına tıklayarak sesini dinle. Noktalardaki sayılar parmak numarasıdır.' },
      {
        type: 'md',
        text: `### Akor değiştirmenin sırları

- **Şekli havada kur:** Parmaklarını tek tek değil, şeklin tamamını aynı anda yerleştirmeye çalış.
- **Ortak parmaklar:** C → Am geçişinde 1. ve 2. parmak yerinde kalır, sadece 3. parmak hareket eder.
- **Rehber parmak:** Bazı geçişlerde bir parmağı telden kaldırmadan kaydırabilirsin.
- **Ritmi bozma:** Geçiş zamanı geldiğinde akor hazır olmasa bile pena hareketine devam et.`,
      },
      { type: 'tab', title: 'Em → C → G → D', tab: `q "Em" ${EM} ${EM} ${EM} ${EM} | "C" ${C} ${C} ${C} ${C} | "G" ${G} ${G} ${G} ${G} | "D" ${D} ${D} ${D} ${D} |`, bpm: 80, startBpm: 60, drums: 'rock', tone: 'clean' },
      {
        type: 'md',
        text: `### Tıngırdatma kalıbı

En yaygın kalıplardan biri: **Aşağı – Aşağı Yukarı – Yukarı Aşağı Yukarı**. Sağ el sürekli sekizlik hareketi yapar; bazı vuruşlarda tele dokunmadan havada geçer.

\`\`\`
Sayış:  1   ve  2   ve  3   ve  4   ve
Yön:    A       A   Y       Y   A   Y
\`\`\``,
      },
      {
        type: 'tab',
        title: 'Kalıp: A – AY – YAY',
        tab: `q "Em" ${EM} e ${EM} q ${EM} e ${EM} ${EM} ${EM} | q "C" ${C} e ${C} q ${C} e ${C} ${C} ${C} | q "G" ${G} e ${G} q ${G} e ${G} ${G} ${G} | q "D" ${D} e ${D} q ${D} e ${D} ${D} ${D} |`,
        bpm: 80,
        startBpm: 60,
        drums: 'rock',
        tone: 'clean',
      },
      {
        type: 'tip',
        tone: 'tip',
        title: '"Bir dakika geçiş" oyunu',
        text: 'Bir dakikalık süre tut ve iki akor arasında (ör. C ↔ G) kaç kez temiz geçiş yapabildiğini say. Her gün sayıyı not et: birkaç haftada iki katına çıktığını göreceksin.',
      },
      { type: 'link', to: '/akorlar', label: 'Akor kütüphanesi', desc: 'Açık, yedili, sus, power ve barre akorlar — dinleme ve parmak numaralarıyla' },
      { type: 'riffs', ids: ['acik-akor-gecis', 'arpej-em'] },
    ],
    checklist: [
      'Em, Am, C, G, D, E ve A akorlarını temiz çalabiliyorum (her tel duyuluyor).',
      'Em–C–G–D geçişini 60 BPM\'de ritmi bozmadan yapabiliyorum.',
      'A – AY – YAY tıngırdatma kalıbını çalabiliyorum.',
    ],
  },
  {
    id: 'pentatonik',
    num: 11,
    title: 'Minör Pentatonik ve İlk Solo',
    subtitle: 'Rock solosunun alfabesi ve doğaçlamaya ilk adım',
    level: 'Orta',
    minutes: 30,
    goals: ['Minör pentatonik gamın 1. kutusunu öğren', 'Kök notaları klavyede bul', 'İlk lick\'lerini çal ve doğaçlamaya başla'],
    techniques: ['alternate', 'single-note'],
    blocks: [
      {
        type: 'md',
        text: `### Neden pentatonik?

Minör pentatonik beş notalı bir gamdır; rock, blues ve metal sololarının büyük çoğunluğunda karşına çıkar. Sadece beş nota olduğu için kulağa "yanlış" gelen nota neredeyse yoktur. Doğaçlamaya başlamak için mükemmeldir.

**A minör pentatonik:** A – C – D – E – G (La – Do – Re – Mi – Sol)`,
      },
      { type: 'scale', root: 9, scale: 'minorPent', from: 5, to: 8, caption: 'A minör pentatonik, 1. kutu (5.–8. perde). Turuncu noktalar kök (A).' },
      {
        type: 'md',
        text: `### Parmaklama

İşaret parmağı **5. perdeye** "kilitlenir". Her telde iki nota var: 5. perdedekiler işaret, 7. perdedekiler yüzük, 8. perdedekiler serçe parmakla basılır.

| Tel | Perdeler |
|---|---|
| 6 | 5 – 8 |
| 5 | 5 – 7 |
| 4 | 5 – 7 |
| 3 | 5 – 7 |
| 2 | 5 – 8 |
| 1 | 5 – 8 |`,
      },
      { type: 'tab', title: 'Gamı çık ve in', tab: 'e 6:5 6:8 5:5 5:7 4:5 4:7 3:5 3:7 | 2:5 2:8 1:5 1:8 1:8 1:5 2:8 2:5 | 3:7 3:5 4:7 4:5 5:7 5:5 6:8 6:5 |', bpm: 100, startBpm: 60, tone: 'crunch' },
      { type: 'tab', title: 'İlk lick\'ler', tab: 'e 1:8 1:5 2:8 2:5 q 3:7 3:5 | e 2:5 2:8 2:5 3:7 h 3:5 | e 4:7 4:5 3:7 3:5 q 4:7 r | w 4:7~ |', bpm: 90, startBpm: 60, drums: 'rock', tone: 'crunch' },
      {
        type: 'md',
        text: `### Doğaçlamaya ilk adım

1. Oynatıcıda **Rock** davulunu aç ve kulaklık simgesiyle gitar sesini kapat.
2. Gamdaki notalarla **kısa cümleler** çal: 3–4 nota, sonra sus.
3. Cümlelerini **kök notada (A)** bitir: kulak "eve döndüğünü" hisseder.
4. Aynı cümleyi tekrar et, sonra küçük bir değişiklik yap. Doğaçlama = tekrar + değişim.`,
      },
      {
        type: 'tip',
        tone: 'tip',
        title: 'Kalıbı taşı',
        text: 'Gamlar sayfasında gamı istediğin kök notaya taşıyabilirsin. Kalıp aynı kalır, sadece başladığın perde değişir: E minör pentatonik için kalıbı 12. perdeye ya da açık pozisyona taşı.',
      },
      { type: 'link', to: '/gamlar', label: 'Gamlar & Klavye', desc: '11 gam, tüm kök notalar, pozisyon filtresi' },
      { type: 'riffs', ids: ['pentatonik-am'] },
    ],
    checklist: [
      'A minör pentatonik 1. kutuyu ezbere çıkıp inebiliyorum.',
      'Kutudaki kök notaları (A) gösterebiliyorum.',
      'Davul eşliğinde kendi kısa cümlelerimi çalıp kök notada bitirebiliyorum.',
    ],
  },
  {
    id: 'lead-teknikleri',
    num: 12,
    title: 'Lead Teknikleri',
    subtitle: 'Hammer-on, pull-off, slide, bending ve vibrato',
    level: 'Orta',
    minutes: 30,
    goals: ['Hammer-on ve pull-off ile penasız nota çıkar', 'Slide ile notalar arasında kay', 'Bending\'i doğru perdeye ulaştır', 'Kontrollü vibrato yap'],
    techniques: ['legato', 'slide', 'bend', 'vibrato'],
    blocks: [
      {
        type: 'md',
        text: `### Legato: hammer-on ve pull-off

**Hammer-on (H):** İlk notayı penayla çal, sonra başka bir parmağı tele çekiç gibi hızla vur. İkinci nota penasız çıkar.

**Pull-off (P):** İki parmak basılıyken üstteki parmağı teli hafifçe **aşağı doğru çekerek** kaldır; alttaki nota ses verir. Sadece kaldırırsan ses çok zayıf çıkar.`,
      },
      { type: 'tab', title: 'Hammer-on ve pull-off', tab: 'q 3:5 3:7h 3:7 3:5p | e 3:5 3:7h 3:5 3:7h 3:7 3:5p 3:7 3:5p | e3 3:5 3:7h 3:5p 3:5 3:7h 3:5p 3:5 3:7h 3:5p 3:5 3:7h 3:5p | h 3:5 r |', bpm: 90, startBpm: 60, tone: 'crunch' },
      {
        type: 'md',
        text: `### Slide

Notayı çal ve parmağının baskısını **koruyarak** hedef perdeye kaydır. Baskıyı bırakırsan ses kesilir; çok bastırırsan kayma takılır. Hedefe ulaşınca dur — perdeyi geçme.`,
      },
      { type: 'tab', title: 'Slide', tab: 'q 3:5 h 3:7/ q r | q 3:7 h 3:5/ q r | e 2:5 2:7/ 2:8 2:10/ q 2:10~ r |', bpm: 80, startBpm: 60, tone: 'crunch' },
      {
        type: 'md',
        text: `### Bending ve vibrato

**Bending:** Teli perdeye paralel olarak iterek sesi yükseltmek. "Tam" bükme bir tam ses (iki perde), "½" bükme yarım ses demektir. 3. telde bükerken **üç parmağı birlikte** kullan ve hareketi bilekten ver, parmakla zorlama.

Önce hedef notayı çal (iki perde yukarısı), sonra bükerek aynı sese ulaşmaya çalış. Akortsuz bir bükme, yanlış nota çalmak kadar kötü duyulur.

**Vibrato:** Notayı küçük ve düzenli bükmelerle titretmek. Blues'ta geniş ve yavaş, metalde hızlı ve dar olur. Vibrato, gitaristin "sesi" ve imzasıdır.`,
      },
      { type: 'tab', title: 'Hedef + bükme + vibrato', tab: 'q 3:9 h 3:7b2 q r | 3:9 h 3:7b2~ q r | e 2:8 1:5 2:8 1:5 q 3:7b2 3:5 | w 4:7~ |', bpm: 80, startBpm: 60, tone: 'crunch' },
      {
        type: 'tip',
        tone: 'warn',
        title: 'Bükmeden sonra sustur',
        text: 'Bükülmüş teli bırakırken kontrolsüz bir "iniş" sesi çıkar. Bırakmadan önce sağ elinin avucuyla ya da sol elin diğer parmaklarıyla teli sustur.',
      },
      { type: 'riffs', ids: ['legato', 'bend-vibrato', 'pentatonik-am'] },
    ],
    checklist: [
      'Hammer-on ve pull-off ile ikinci notayı en az ilk nota kadar duyulur çıkarabiliyorum.',
      'Slide yaparken ses kesilmeden hedef perdede durabiliyorum.',
      'Tam bükmeyi hedef notayla aynı perdeye getirebiliyorum.',
      'Uzun notalara kontrollü vibrato ekleyebiliyorum.',
    ],
  },
  {
    id: 'klavye-notalari',
    num: 13,
    title: 'Klavyedeki Notalar',
    subtitle: 'Müzikal alfabe, oktav şekilleri ve 6.–5. tel notaları',
    level: 'Temel',
    minutes: 20,
    goals: ['On iki notayı ve aralarındaki yarım sesleri bil', '6. ve 5. teldeki doğal notaları ezberle', 'Oktav şekilleriyle notaları başka tellerde bul'],
    techniques: ['octave'],
    blocks: [
      {
        type: 'md',
        text: `### Müzikal alfabe

Batı müziğinde 12 nota vardır: **C C♯ D D♯ E F F♯ G G♯ A A♯ B** (Do Do♯ Re Re♯ Mi Fa Fa♯ Sol Sol♯ La La♯ Si). Gitarda her perde bir sonraki notaya geçer (yarım ses). İki nota çiftinin **arasında diyez yoktur:** **E–F** ve **B–C** (Mi–Fa ve Si–Do). 12. perdede her şey baştan başlar: açık telin bir oktav üstü.`,
      },
      {
        type: 'fretboard',
        frets: 12,
        caption: '6. ve 5. teldeki doğal notalar — power chord köklerini bulmak için bunları ezberle.',
        marks: [
          { string: 6, fret: 0, label: 'E', kind: 'root' },
          { string: 6, fret: 1, label: 'F' },
          { string: 6, fret: 3, label: 'G' },
          { string: 6, fret: 5, label: 'A' },
          { string: 6, fret: 7, label: 'B' },
          { string: 6, fret: 8, label: 'C' },
          { string: 6, fret: 10, label: 'D' },
          { string: 6, fret: 12, label: 'E', kind: 'root' },
          { string: 5, fret: 0, label: 'A', kind: 'root' },
          { string: 5, fret: 2, label: 'B' },
          { string: 5, fret: 3, label: 'C' },
          { string: 5, fret: 5, label: 'D' },
          { string: 5, fret: 7, label: 'E' },
          { string: 5, fret: 8, label: 'F' },
          { string: 5, fret: 10, label: 'G' },
          { string: 5, fret: 12, label: 'A', kind: 'root' },
        ],
      },
      {
        type: 'md',
        text: `### Oktav şekilleri

Bir notanın bir oktav üstünü bulmanın en kolay yolları:

- **6. ya da 5. telden:** iki tel inceye, **iki perde** ileri (ör. 6. tel 3. perde G → 4. tel 5. perde G).
- **4. ya da 3. telden:** iki tel inceye, **üç perde** ileri (aradaki B teli yüzünden).

Oktavlar (bir notayı iki oktavıyla birlikte çalmak) Rammstein ve pek çok rock grubunun melodik riff'lerinde çok kullanılır. Aradaki teli işaret parmağının alt kısmıyla susturmayı unutma.`,
      },
      { type: 'tab', title: 'Oktav melodisi', tab: 'e 6:3+4:5 6:3+4:5 6:5+4:7 6:5+4:7 6:6+4:8 6:6+4:8 6:5+4:7 6:5+4:7 | 6:3+4:5 6:3+4:5 6:1+4:3 6:1+4:3 h 6:0+4:2 |', bpm: 90, startBpm: 60, drums: 'rock', tone: 'crunch' },
      { type: 'link', to: '/oyunlar', label: 'Klavye oyununu oyna', desc: 'Notayı bul: süreye karşı yarış, istersen gitarınla çalarak' },
      { type: 'link', to: '/gamlar', label: 'Klavyede tüm notaları göster', desc: 'Gamlar sayfasında "Kromatik" seç ve tüm notaları gör' },
    ],
    checklist: [
      'E–F ve B–C arasında diyez olmadığını biliyorum.',
      '6. teldeki doğal notaları (E F G A B C D) yerlerinden gösterebiliyorum.',
      '5. teldeki doğal notaları gösterebiliyorum.',
      'Oktav şekliyle bir notayı başka bir telde bulabiliyorum.',
    ],
  },
  {
    id: 'pratik-ve-ton',
    num: 14,
    title: 'Doğru Pratik, Ekipman ve Ton',
    subtitle: 'Verimli çalışma alışkanlıkları, tel/pena seçimi ve Rammstein tonu',
    level: 'Temel',
    minutes: 15,
    goals: ['Verimli bir günlük pratik rutini kur', 'Kendini kaydedip dinlemeyi alışkanlık edin', 'Ekipman ve ton ayarlarının temellerini öğren'],
    blocks: [
      {
        type: 'md',
        text: `### Verimli pratik

- **Az ama her gün:** Günde 20–30 dakika, haftada bir kez 3 saatten çok daha etkilidir. Kas hafızası uyku sırasında pekişir.
- **Yapılandır:** Isınma → teknik → riff/şarkı → serbest çalma. [Günlük Antrenman](/antrenman) sayfası bunu senin için zamanlar.
- **Yavaş ve temiz:** Hatayla çalınan her tekrar, hatayı da öğretir. Temiz çalamıyorsan tempo çok yüksektir.
- **Zor kısmı ayır:** Bir riffin sadece zor iki ölçüsünü döngüye al (oynatıcıda Shift + tık).
- **Kendini kaydet:** Telefonla kaydedip dinlediğinde, çalarken duymadığın ritim kaymalarını fark edersin.
- **Dinlen:** Elde ağrı başlarsa bırak. Sakatlık, haftalarca geri götürür.`,
      },
      {
        type: 'md',
        text: `### Ekipman

| Konu | Öneri |
|---|---|
| **Teller** | Standart akort: 10–46. Drop C ve altı: 11–56 ya da 12–56. Teller matlaşınca ya da akort tutmamaya başlayınca değiştir (düzenli çalışıyorsan 1–2 ayda bir). |
| **Pena** | Riff ve metal için 0.88–1.14 mm sert penalar daha tok ses verir. Akor tıngırdatmak için ince penalar daha rahattır. |
| **Manyetik** | Ağır riffler için köprü humbucker'ı ideal. Tek bobinli manyetiklerde distorsiyonla uğultu artar. |
| **Kulaklık / amfi simülasyonu** | Küçük bir USB ses kartı ve amfi simülasyonu yazılımı, gece de rahatça çalışmanı sağlar ve mikrofonlu akort/takip özelliklerini çok daha doğru yapar. |`,
      },
      {
        type: 'md',
        text: `### Rammstein tarzı ton için başlangıç ayarları

| Düğme | Değer (0–10) | Neden? |
|---|---|---|
| Gain | 6–7 | Yüksek ama çamurlaşmayan distorsiyon. Fazla gain chug'ları bulanıklaştırır. |
| Bass | 6 | Kalın ama gevşek olmayan alt frekans. |
| Middle | 5–6 | Mid'leri tamamen kısma: riff mix içinde kaybolur. |
| Treble | 6 | Pena atağının netliği. |
| Presence | 5 | Parlaklık ince ayarı. |

Bir **noise gate** (gürültü kapısı), chug'lar arasındaki susları tertemiz yapar — Rammstein'ın "kesik" sesinin önemli bir parçasıdır.`,
      },
      {
        type: 'tip',
        tone: 'metal',
        title: 'Uygulamadaki ton',
        text: 'RiffLab\'in oynatıcısı Karplus-Strong tel sentezi ve amfi simülasyonu kullanır: Temiz, Crunch ve Distorsiyon tonları arasında oynatıcıdaki ayarlar menüsünden geçiş yapabilirsin.',
      },
      { type: 'link', to: '/antrenman', label: 'Günlük antrenmanı başlat', desc: '15, 30 ya da 45 dakikalık zamanlanmış program' },
    ],
    checklist: ['Bu hafta en az 5 gün pratik yapacağım.', 'Kendimi en az bir kez kaydedip dinledim.', 'Amfimi/simülasyonumu riffler için ayarladım.'],
  },
];
