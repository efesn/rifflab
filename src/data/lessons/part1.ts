import type { Lesson } from './types';

export const LESSONS_PART1: Lesson[] = [
  {
    id: 'gitarini-tani',
    num: 1,
    title: 'Gitarını Tanı',
    subtitle: 'Parçalar, duruş, pena tutuşu ve ilk sesler',
    level: 'Başlangıç',
    minutes: 15,
    goals: ['Elektro gitarın parçalarını ve ne işe yaradıklarını bil', 'Rahat bir duruş ve doğru tutuş edin', 'Penayı doğru tutup ilk sesleri çıkar', 'Tel ve perde numaralandırmasını anla'],
    blocks: [
      {
        type: 'md',
        text: `### Elektro gitarın parçaları

| Parça | Ne işe yarar? |
|---|---|
| **Gövde** | Manyetikler, köprü ve düğmeler burada. Elektro gitarda gövde dolu olduğu için akustik gibi yüksek ses vermez. |
| **Sap** | Sol elinle notalara bastığın uzun bölüm. |
| **Perdeler (fret)** | Sap üzerindeki metal çubuklar. Her perde sesi **yarım ses** yükseltir. |
| **Eşik (nut)** | Sapın başındaki küçük parça; tellerin "0. perdesi". |
| **Burgular** | Telleri gerer ya da gevşetir: akort burada yapılır. |
| **Manyetikler** | Tel titreşimini elektrik sinyaline çevirir. Köprüye yakın olan daha parlak ve agresif, sapa yakın olan daha yumuşak ve kalın ses verir. |
| **Seçici anahtar** | Hangi manyetiğin çalışacağını seçer. Riff için genelde **köprü** manyetiği kullanılır. |
| **Volume / Tone** | Çıkış seviyesi ve parlaklık. |
| **Köprü** | Tellerin gövdeye bağlandığı yer. Palm mute burada yapılır. |`,
      },
      {
        type: 'md',
        text: `### Teller ve perdeler nasıl numaralanır?

Teller **inceden kalına** numaralanır: **1. tel** en ince (yere en yakın) mi teli, **6. tel** en kalın (yüzüne en yakın) mi telidir. Standart akortta teller kalından inceye: **E – A – D – G – B – E** (Mi – La – Re – Sol – Si – Mi).

> Akılda tutmak için: **E**ski **A**rabalar **D**ağda **G**ezip **B**ozulur **E**rkenden.

Perdeler eşikten gövdeye doğru 1, 2, 3… diye sayılır. **0 = açık tel**, yani hiçbir perdeye basmadan çalmak.`,
      },
      { type: 'tones', tuning: 'standard', caption: 'Açık telleri dinle (kalından inceye). Kendi gitarınla karşılaştır.' },
      {
        type: 'md',
        text: `### Duruş ve tutuş

- Sandalyenin ucuna otur; sırtın dik ama gergin olmasın.
- Gitarın gövdesi sağ bacağının üstünde dursun (solaksan sol), sap hafifçe yukarı baksın.
- Sol el başparmağı sapın **arkasında**, kabaca orta parmağın hizasında olsun. Avucunla sapı sıkma.
- Sol el parmakları notalara **uçlarıyla** ve perde telinin hemen arkasına basar. Tırnaklarını kısa tut.
- Ayakta çalarken askıyı, gitar otururkenki yüksekliğine yakın olacak şekilde ayarla.`,
      },
      {
        type: 'md',
        text: `### Pena tutuşu

Penayı **başparmak ile işaret parmağının yan tarafı** arasında tut. Penanın sadece 2–3 mm'lik ucu dışarıda kalsın. Hareket büyük ölçüde **bilekten** gelir; kolunu sallama, bileğin gevşek olsun.

Başlangıç için **orta kalınlıkta (0.73–0.88 mm)** bir pena iyidir. Metal ritim için daha kalın penalar (1.0 mm ve üstü) daha tok ve kontrollü ses verir.`,
      },
      {
        type: 'tip',
        tone: 'warn',
        title: 'Parmak ağrısı',
        text: 'İlk 2–3 hafta parmak uçlarında hafif sızı normaldir; nasır oluştukça geçer. Ama keskin ağrı, bilek ya da kol ağrısı hissedersen dur ve dinlen. Kısa ve sık çalışmak (ör. günde 2 × 15 dk), haftada bir kez 2 saat çalışmaktan çok daha verimlidir.',
      },
      {
        type: 'md',
        text: `### Amfiyle ilk ses

- Kabloyu takmadan önce amfinin sesini kıs.
- **Gain** düğmesi sesin ne kadar distorsiyonlu ("kirli") olacağını belirler. Öğrenirken **düşük gain** ile başla: distorsiyon hataları gizler.
- Bass, middle ve treble düğmelerini saat 12 yönüne alarak başla, sonra kulağına göre ayarla.
- Kulaklıkla çalışırken sesi düşük tut. Kulakların en değerli enstrümanın.`,
      },
      {
        type: 'tab',
        title: 'İlk sesler: açık teller',
        tab: 'q 6:0 5:0 4:0 3:0 | 2:0 1:0 h r | q 1:0 2:0 3:0 4:0 | 5:0 6:0 h r |',
        bpm: 70,
        tone: 'clean',
        note: 'Her teli tek tek çal; sadece istediğin telin ses verdiğinden emin ol.',
      },
    ],
    checklist: [
      'Tel ve perde numaralarını biliyorum (1. tel = ince mi teli).',
      'Gitarı rahat bir duruşla tutuyorum; omzum ve bileğim gergin değil.',
      'Penayı doğru tutup her açık teli tek tek temiz çalabiliyorum.',
      'Amfide gain ve ton düğmelerinin ne yaptığını denedim.',
    ],
  },
  {
    id: 'akort',
    num: 2,
    title: 'Akort',
    subtitle: 'Gitarını doğru sese getir: akort cihazı, kulakla akort ve Drop D',
    level: 'Başlangıç',
    minutes: 12,
    goals: ['Standart akortu (E A D G B E) öğren', 'Uygulamadaki akort cihazını kullan', 'Notaya aşağıdan yaklaşarak akort et', 'Drop D akortu tanı'],
    techniques: ['drop-tuning'],
    blocks: [
      {
        type: 'md',
        text: `### Neden her gün akort?

Teller sıcaklık, nem ve çalma ile sürekli gevşer. Akortsuz bir gitarla doğru notaya bassan bile kulağa yanlış gelir; daha kötüsü, kulağın yanlış sesleri "doğru" diye öğrenir. **Her çalışmaya akortla başla** — sadece 30 saniye sürer.`,
      },
      {
        type: 'md',
        text: `### Akort cihazı nasıl kullanılır?

1. [Akort Cihazı](/akort) sayfasını aç ve mikrofon izni ver. (Bir ses kartın varsa gitarı doğrudan bağlamak en temiz sonucu verir; yoksa amfinin yakınındaki dizüstü mikrofonu da iş görür.)
2. Bir teli çal ve çınlamasına izin ver.
3. Ekranda en yakın nota ve **cent** cinsinden sapma görünür. İbre soldaysa ses **pes** (düşük), sağdaysa **tiz** (yüksek).
4. Burguyu yavaşça çevir. İbre ortaya gelip yeşile döndüğünde tel akortludur.
5. Diğer tellere geç ve sonunda hepsini bir kez daha kontrol et; bir teli germek diğerlerini hafifçe etkileyebilir.`,
      },
      {
        type: 'tip',
        tone: 'tip',
        title: 'Altın kural',
        text: 'Notaya her zaman aşağıdan yaklaş. Ses fazla tizse önce hedefin biraz altına indir, sonra yukarı doğru akort et. Böylece tel burguda gevşemez ve akort daha uzun süre kalır.',
      },
      {
        type: 'md',
        text: `### Kulakla akort: 5. perde yöntemi

Akort cihazın yoksa 6. teli doğru kabul et ve şu eşleşmeleri kullan:

- 6. tel **5. perde** = 5. tel açık
- 5. tel **5. perde** = 4. tel açık
- 4. tel **5. perde** = 3. tel açık
- 3. tel **4. perde** = 2. tel açık *(tek istisna!)*
- 2. tel **5. perde** = 1. tel açık

İki ses birbirine yakın ama aynı değilse "vuvvuv" diye bir dalgalanma duyarsın. Sesler eşitlendiğinde dalgalanma durur.`,
      },
      { type: 'tab', title: '5. perde yöntemi — dinle ve karşılaştır', tab: 'h 6:5 5:0 | 5:5 4:0 | 4:5 3:0 | 3:4 2:0 | 2:5 1:0 |', bpm: 80, tone: 'clean' },
      {
        type: 'md',
        text: `### Drop D: ilk alternatif akort

Drop D'de sadece **6. tel bir tam ses (iki perde) düşürülür**: E → D. Diğer teller aynı kalır. Böylece alttaki üç tel tek parmakla basıldığında power chord olur. Rammstein, Foo Fighters, System of a Down ve Slipknot bu akortu çok kullanır.

Akort cihazında **Drop D** düzenini seç ve 6. teli D'ye indir. Kontrol: 6. teli açık, sonra 4. teli açık çal. İkisi aynı nota (D), aralarında bir oktav var.`,
      },
      { type: 'tones', tuning: 'dropD', caption: 'Drop D açık teller' },
      {
        type: 'tip',
        tone: 'metal',
        title: 'Rammstein ve Drop C',
        text: 'Rammstein şarkılarının bir kısmı standart akortta (Du Hast, Links 2 3 4), bir kısmı Drop D\'de (Sonne, Ich Will, Feuer Frei!), bir kısmı ise daha da düşük Drop C\'de (C G C F A D — Deutschland, Amerika, Benzin) çalınır. Drop C için kalın teller (ör. 11–56) gerekir; ince tellerle sesler gevşek ve çatırtılı çıkar. Drop C\'yi 8. derste ele alacağız.',
      },
      { type: 'link', to: '/akort', label: 'Akort cihazını aç', desc: 'Mikrofonla anlık perde algılama, 8 akort düzeni, referans tonlar' },
    ],
    checklist: [
      'Standart akortun notalarını ezbere biliyorum: E A D G B E.',
      'Akort cihazıyla altı teli de akort edebiliyorum.',
      'Notaya aşağıdan yaklaşarak akort ediyorum.',
      '6. teli Drop D\'ye indirip tekrar standart akorta getirebiliyorum.',
    ],
  },
  {
    id: 'tab-okuma',
    num: 3,
    title: 'Tab Okuma',
    subtitle: 'Altı çizgi, perde numaraları, ritim ve teknik işaretleri',
    level: 'Başlangıç',
    minutes: 15,
    goals: ['Tab çizgilerinin hangi telleri gösterdiğini bil', 'Tek notaları ve akorları okuyabil', 'Ritim gösterimini anla', 'Teknik işaretlerini tanı'],
    blocks: [
      {
        type: 'md',
        text: `### Tab nedir?

Tab (tablatür), gitar için en pratik yazı sistemidir: nota bilmeden **hangi tele, hangi perdede** basacağını gösterir.

- **Altı yatay çizgi = altı tel.** En **üstteki çizgi en ince tel** (1. tel, e), en alttaki en kalın tel (6. tel, E). Gitarı kucağına alıp aşağı baktığında gördüğün dizilişin tersidir — kafa karıştırırsa aklında tut: *üst çizgi = ince tel*.
- **Çizgi üzerindeki sayı = perde numarası.** 0 açık tel, 3 üçüncü perde.
- **Soldan sağa okunur.** Aynı hizada (alt alta) duran sayılar **aynı anda** çalınır: bu bir akordur.
- Dikey çizgiler **ölçü** çizgileridir.`,
      },
      { type: 'tab', title: 'Tek tek notalar', tab: 'q 6:0 6:3 5:0 5:2 | 4:0 4:2 h 4:3 |', bpm: 70, tone: 'clean', note: 'Çal\'a bas: imleç ilerlerken alttaki klavyede hangi noktaya basıldığını izle.' },
      { type: 'tab', title: 'Akorlar: alt alta sayılar', tab: 'h 6:0+5:2+4:2 6:3+5:5+4:5 | 5:0+4:2+3:2 5:3+4:5+3:5 |', bpm: 70, tone: 'distortion' },
      {
        type: 'md',
        text: `### Ritim nasıl gösterilir?

İnternetteki çoğu ASCII tabda ritim yoktur; RiffLab'deki tabların altında ise **ritim çizgileri** bulunur:

| Gösterim | Süre | Sayış (4/4) |
|---|---|---|
| Boş yuvarlak | Birlik — 4 vuruş | 1-2-3-4 |
| Sap + boş yuvarlak | İkilik — 2 vuruş | 1-2 |
| Tek sap | Dörtlük — 1 vuruş | 1 |
| Sap + 1 kiriş | Sekizlik — ½ vuruş | 1-ve |
| Sap + 2 kiriş | Onaltılık — ¼ vuruş | 1-e-ve-a |
| Nokta | Süreyi yarısı kadar uzatır | |
| "3" işareti | Üçleme: bir vuruşa üç nota | 1-ve-a |`,
      },
      {
        type: 'md',
        text: `### Teknik işaretleri

| İşaret | Anlamı |
|---|---|
| **P.M. - - -** | Palm mute: avuçla susturarak çal |
| **x** | Ölü nota: tel susturulmuş, sadece "çık" sesi |
| **H** | Hammer-on: penasız, parmakla vurarak |
| **P** | Pull-off: parmağı çekerek |
| **/** | Slide: parmağı kaydırarak |
| **↑ tam / ½** | Bending: teli itip sesi yükselt |
| **~~~** | Vibrato |
| **>** | Vurgu: daha sert çal |
| **(5)** | Bağ: yeniden çalma, notayı uzat |
| **L.R.** | Let ring: notalar birbirinin üstünde çınlasın |`,
      },
      { type: 'tab', title: 'Hepsi bir arada', tab: 'e P6:0m P6:0m P6:0m P6:0m q P6:3> P6:5> | e 3:5 3:7h 3:5p 3:7 q 3:7b2 3:5~ |', bpm: 80, tone: 'distortion' },
      {
        type: 'tip',
        tone: 'tip',
        title: 'Oynatıcı ipuçları',
        text: 'Bir ölçüye tıklarsan çalma oradan başlar. Shift + tık (ya da "Aralık seç" düğmesi) ile birkaç ölçüyü döngüye alabilirsin. Boşluk tuşu çal/durdur, ↑/↓ tempoyu değiştirir, L döngüyü, M metronomu açıp kapatır.',
      },
    ],
    checklist: [
      'Tab\'daki en üst çizginin ince mi teli olduğunu biliyorum.',
      'Alt alta yazılmış sayıların akor olduğunu biliyorum.',
      'Dörtlük, sekizlik ve onaltılığı ritim çizgilerinden ayırt edebiliyorum.',
      'P.M., H, P, x ve > işaretlerinin anlamını biliyorum.',
    ],
  },
  {
    id: 'ilk-notalar',
    num: 4,
    title: 'İlk Notalar ve Alternatif Pena',
    subtitle: 'Bir perdeye bir parmak, aşağı-yukarı pena ve metronomla çalışma',
    level: 'Başlangıç',
    minutes: 20,
    goals: ['"Bir perdeye bir parmak" kuralını uygula', 'Alternatif penayı öğren', 'Metronomla yavaş ve temiz çalışmayı alışkanlık edin'],
    techniques: ['alternate', 'single-note', 'melody'],
    blocks: [
      {
        type: 'md',
        text: `### Bir perdeye bir parmak

Sol elin dört parmağı ardışık dört perdeye atanır: **işaret 1., orta 2., yüzük 3., serçe 4. perde.** Bu pozisyon mantığı, elini kaydırmadan çok sayıda notaya ulaşmanı sağlar.

Basarken:
- Parmak **ucuyla**, perde telinin **hemen arkasına** bas.
- Gereğinden fazla bastırma: ses temiz çıktığı anda yeterlidir.
- Kullanmadığın parmaklar telin hemen üstünde beklesin.`,
      },
      {
        type: 'md',
        text: `### Alternatif pena

Penayı **aşağı (⊓)** ve **yukarı (V)** hareketlerle sırayla kullanmaya alternatif pena denir. Hızlı tek nota pasajlarının anahtarıdır. Kural basit: **aşağı-yukarı-aşağı-yukarı**. Nota değişse de, tel değişse de sıra bozulmaz.`,
      },
      { type: 'tab', title: 'Tek telde alternatif pena', tab: 'e 1:0 1:0 1:0 1:0 1:1 1:1 1:1 1:1 | 1:3 1:3 1:3 1:3 1:1 1:1 1:1 1:1 | 2:0 2:0 2:1 2:1 2:3 2:3 2:1 2:1 | h 2:0 r |', bpm: 90, startBpm: 60, tone: 'clean' },
      {
        type: 'tab',
        title: 'Kromatik 1-2-3-4',
        tab: 'e 6:1 6:2 6:3 6:4 5:1 5:2 5:3 5:4 | 4:1 4:2 4:3 4:4 3:1 3:2 3:3 3:4 | 2:1 2:2 2:3 2:4 1:1 1:2 1:3 1:4 |',
        bpm: 100,
        startBpm: 60,
        tone: 'clean',
        note: 'Her perdeye ayrı parmak: 1. perde işaret, 4. perde serçe.',
      },
      {
        type: 'tip',
        tone: 'tip',
        title: 'Metronomun altın kuralı',
        text: 'Hatasız çalabildiğin en yüksek tempoyu bul ve 10 BPM aşağısında çalış. Üç kez arka arkaya temiz çaldığında 5 BPM artır. Yavaş çalmak, hızlanmanın en hızlı yoludur.',
      },
      { type: 'link', to: '/metronom', label: 'Metronomu aç', desc: 'Hız antrenörü ve sessiz ölçü modu ile' },
      { type: 'riffs', ids: ['kromatik-isinma', 'nese-ye-ovgu', 'korobeiniki'], caption: 'Bu dersten sonra çalabileceklerin' },
    ],
    checklist: [
      'Bir perdeye bir parmak kuralıyla kromatik egzersizi çalabiliyorum.',
      'Alternatif penayı tel değiştirirken bile bozmadan uyguluyorum.',
      'Kromatik egzersizi 60 BPM\'de hatasız çalabiliyorum.',
      'Neşeye Övgü melodisini baştan sona çalabiliyorum.',
    ],
  },
  {
    id: 'ritim-temelleri',
    num: 5,
    title: 'Ritim Temelleri',
    subtitle: 'Vuruş, ölçü, dörtlük-sekizlik-onaltılık ve suslar',
    level: 'Başlangıç',
    minutes: 20,
    goals: ['4/4 ölçüyü ve vuruşu anla', 'Dörtlük, sekizlik ve onaltılıkları sayarak çal', 'Susları çalmanın bir parçası olarak hisset'],
    techniques: ['downpicking', 'palm-mute'],
    blocks: [
      {
        type: 'md',
        text: `### Vuruş, ölçü ve tempo

- **Vuruş:** Müziğin nabzı; ayağınla tempo tuttuğun her an.
- **Tempo (BPM):** Dakikadaki vuruş sayısı. 60 BPM = saniyede bir vuruş.
- **Ölçü:** Vuruşların gruplanması. Rock ve metalin neredeyse tamamı **4/4**: her ölçüde dört vuruş.

### Bölünmeler

- **Dörtlük:** her vuruşa bir nota — "**1** – **2** – **3** – **4**"
- **Sekizlik:** her vuruşa iki nota — "**1** ve **2** ve **3** ve **4** ve"
- **Onaltılık:** her vuruşa dört nota — "**1** e ve a **2** e ve a …"

Sesli saymak başta garip gelir ama ritim duygusunu en hızlı geliştiren alışkanlıktır.`,
      },
      {
        type: 'tab',
        title: 'Dörtlük → sekizlik → onaltılık',
        tab: 'q (6:0m)x4 | e (6:0m)x8 | s (6:0m)x16 | w P6:0 |',
        bpm: 80,
        drums: 'rock',
        tone: 'distortion',
        note: 'Tempo değişmiyor; sadece vuruş başına düşen nota sayısı artıyor.',
      },
      { type: 'tab', title: 'Suslar da ritmin parçası', tab: 'q 6:0m r 6:0m r | e 6:0m 6:0m r 6:0m q r 6:0m | e 6:0m r 6:0m r 6:0m r P6:3> r | h P6:5 r |', bpm: 90, drums: 'rock', tone: 'distortion' },
      {
        type: 'md',
        text: `### Aşağı vuruş mu, alternatif mi?

Ritim gitarda iki temel yaklaşım vardır:

- **Aşağı vuruş (downpicking):** Her notayı aşağı doğru çalmak. Daha tok, agresif ve eşit bir ses verir. **Rammstein ve Metallica'nın ritim sesi büyük ölçüde budur.** Sekizliklerde ~180 BPM'e kadar mümkündür ama dayanıklılık ister.
- **Alternatif pena:** Onaltılıklar ve çok hızlı sekizlikler için gerekir.

Başlangıçta sekizlikleri aşağı vuruşla, onaltılıkları alternatif penayla çalış.`,
      },
      {
        type: 'tip',
        tone: 'metal',
        title: 'Sağ el bir sarkaçtır',
        text: 'Sağ elini bir saat sarkacı gibi düşün: tele vurmasan bile vuruşla birlikte aşağı-yukarı hareket etmeye devam etsin. Böylece suslardan sonra ritmi kaçırmazsın.',
      },
      { type: 'riffs', ids: ['seven-nation-army', 'smoke-on-the-water'] },
    ],
    checklist: [
      '4/4\'te sesli sayarak dörtlük, sekizlik ve onaltılık çalabiliyorum.',
      'Susları atlamadan, ritim bozulmadan çalabiliyorum.',
      'Seven Nation Army riffini davul eşliğinde çalabiliyorum.',
    ],
  },
  {
    id: 'power-chord',
    num: 6,
    title: 'Power Chord',
    subtitle: 'Rock ve metalin yapı taşı: kök + beşli',
    level: 'Temel',
    minutes: 25,
    goals: ['Power chord\'un yapısını anla', '6. ve 5. telde kök notalı şekilleri çal', 'Kullanılmayan telleri sustur', 'Akorlar arasında temiz geçiş yap'],
    techniques: ['power-chord', 'muting'],
    blocks: [
      {
        type: 'md',
        text: `### Power chord nedir?

Power chord ("beşli akor") sadece iki farklı notadan oluşur: **kök** ve **tam beşli**. Majör ya da minör değildir; bu yüzden hem karanlık hem aydınlık şarkılara uyar. Distorsiyonla çok net ve güçlü ses verir. Adını kök notasından alır: kök G ise **G5**.

**Şekil (6. telde kök):** İşaret parmağı 6. telde kök perdede, **yüzük parmağı 5. telde iki perde ileride**. Üç notalı versiyonda serçe parmak da 4. telde, yüzük parmağın yanına basar (oktav).`,
      },
      { type: 'chords', ids: ['E5', 'F5', 'G5', 'A5', 'C5', 'D5'], caption: 'Bir şekle tıklayarak sesini dinle.' },
      {
        type: 'tip',
        tone: 'tip',
        title: 'Susturma her şeydir',
        text: 'Pena istemediğin tellere de çarpar. 5. telde kökten çalarken işaret parmağının ucu 6. teli hafifçe tutarak susturur; parmağının alt kısmı da ince telleri hafifçe değerek susturur. Distorsiyonla çalarken bu fark çok net duyulur.',
      },
      {
        type: 'md',
        text: `### Kökü bulmak

Power chord'un adı kök notasından gelir. 6. ve 5. teldeki notaları bilirsen her power chord'u bulabilirsin:

| Perde | 0 | 1 | 3 | 5 | 7 | 8 | 10 | 12 |
|---|---|---|---|---|---|---|---|---|
| **6. tel** | E | F | G | A | B | C | D | E |
| **5. tel** | A | A♯ | C | D | E | F | G | A |`,
      },
      { type: 'tab', title: 'G5 – C5 – D5 – A5', tab: 'q (P6:3)x4 | (P5:3)x4 | (P5:5)x4 | (P6:5)x4 |', bpm: 100, startBpm: 70, drums: 'rock', tone: 'distortion' },
      { type: 'tab', title: '6. telde kayan power chord\'lar', tab: 'e P6:0 P6:0 P6:3 P6:3 P6:5 P6:5 P6:7 P6:7 | P6:8 P6:8 P6:7 P6:7 q P6:5 P6:3 |', bpm: 110, startBpm: 70, drums: 'rock', tone: 'distortion' },
      { type: 'riffs', ids: ['power-chord-gecis', 'iron-man', 'smells-like-teen-spirit'] },
    ],
    checklist: [
      '6. ve 5. telde kök notalı power chord şekillerini biliyorum.',
      'Power chord çalarken kullanmadığım telleri susturabiliyorum.',
      'G5–C5–D5–A5 geçişini ritmi bozmadan yapabiliyorum.',
      '6. ve 5. teldeki notalara bakarak power chord\'un adını bulabiliyorum.',
    ],
  },
  {
    id: 'palm-mute',
    num: 7,
    title: 'Palm Mute ve Chug',
    subtitle: 'Metalin tok, perküsif sesi ve staccato vurgular',
    level: 'Temel',
    minutes: 25,
    goals: ['Avuç susturmanın doğru konumunu bul', 'Susturulmuş ve açık notalar arasında geçiş yap', 'Chug ritimlerini metronomla çal'],
    techniques: ['palm-mute', 'chug', 'downpicking'],
    blocks: [
      {
        type: 'md',
        text: `### Palm mute nedir?

Pena tutan elin **avucunun dış kenarı** (serçe parmaktan bileğe uzanan kısım), tellerin köprüden çıktığı yere hafifçe yaslanır. Telin titreşimi kısmen bastırılır ve **kısa, tok, perküsif** bir ses çıkar: metalcilerin "chug" dediği ses.

- Avuç **köprünün tam üstünde** ya da birkaç milimetre önünde olmalı.
- Çok öne (sapa doğru) koyarsan nota boğulur, perdesi belirsizleşir.
- Çok geride kalırsan susturma olmaz, tel açık çınlar.
- Baskı hafif olmalı: avucun teli **dinlendirir**, ezmez.`,
      },
      { type: 'tab', title: 'Avuç konumunu bul', tab: 'q 6:0 6:0m 6:0 6:0m | e 6:0m 6:0m 6:0m 6:0m q 6:0 6:0 |', bpm: 70, tone: 'distortion', note: 'Açık ve susturulmuş ses arasındaki farkı dinle.' },
      { type: 'tab', title: 'Chug + vurgulu akor', tab: 'e 6:0m 6:0m 6:0m 6:0m P6:3> r P6:5> r | 6:0m 6:0m 6:0m 6:0m P6:5> P6:3> P6:0> r |', bpm: 110, startBpm: 70, drums: 'rock', tone: 'distortion' },
      {
        type: 'md',
        text: `### Vurgu ve dinamik

Riffleri ilginç yapan **kontrast**tır: susturulmuş chug'ların arasında birden açılan bir akor kulakta patlama etkisi yaratır. Açık akoru çaldıktan sonra sol elinin baskısını gevşeterek ya da avucunu geri koyarak sesi **kes**. Buna **staccato** denir ve Rammstein'ın makine gibi keskin ritminin sırrıdır.`,
      },
      { type: 'tab', title: 'Staccato: kısa kes', tab: 'e P6:3> r P6:3> r q (6:0m)x2 | e P6:5> r P6:5> r P6:3> r P6:0> r |', bpm: 100, startBpm: 70, drums: 'four', tone: 'distortion' },
      {
        type: 'tip',
        tone: 'metal',
        title: 'Temiz tonda test et',
        text: 'Palm mute\'unu test etmenin en iyi yolu temiz tonda çalmaktır. Temiz tonda bile tok ve perdesi duyulan bir ses alıyorsan, distorsiyonda mükemmel olacaktır.',
      },
      { type: 'riffs', ids: ['palm-mute-temelleri', 'galop', 'dag-kralinin-sarayinda'] },
    ],
    checklist: [
      'Palm mute için avucumun doğru yerini buldum: ses tok ama perdesi duyuluyor.',
      'Susturulmuş chug ile açık akor arasında geçiş yapabiliyorum.',
      'Akorları staccato (kısa) kesebiliyorum.',
      'Sekizlik chug\'ları 100 BPM\'de eşit çalabiliyorum.',
    ],
  },
];
