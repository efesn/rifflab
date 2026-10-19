import type { Riff } from './types';

// Rammstein riff çalışmaları.
// Akort, tempo, ton ve akor ilerlemeleri kaynaklardaki ortak bilgiye dayanır (bkz. her riffin açıklaması);
// ritim ve parmak düzenleri ise riffin karakterini öğretmek için SADELEŞTİRİLMİŞTİR — kayıttaki notalarla
// birebir aynı değildir. Drop akortlarda "6:0" açık tel chug, "Q6:n" tek parmak power chord'dur.

export const RAMMSTEIN: Riff[] = [
  {
    id: 'du-hast',
    title: 'Du Hast',
    artist: 'Rammstein',
    album: 'Sehnsucht',
    year: 1997,
    category: 'rammstein',
    difficulty: 2,
    tuning: 'standard',
    bpm: 125,
    startBpm: 80,
    timeSig: [4, 4],
    techniques: ['power-chord', 'muting', 'slide', 'syncopation', 'palm-mute', 'downpicking'],
    summary: 'Grubun en bilinen şarkısı: A5–G5–E5 akorlarıyla kısa, boğulmuş vuruşlar ve kick davula kilitli ritim.',
    description: `**Mi minör, ~125 BPM.** Kaynakların çoğu standart akort gösterir (bazı tablar Drop D önerir).

Şarkının kimliği **A5 – G5 – E5** akorlarıyla yapılan **kısa, boğulmuş (choke) vuruşlar**dır: akoru vur ve hemen sustur. Akorlar arasında **kayma (slide)** var ve gitar kick davulunu birebir takip eder. Kıtada ise synth'in altında **E5 pedal** chug'ları duyulur.

1. **Ana riff:** A5 iki kez, G5'e kayarak geç, E5 ile bitir. Her vuruştan sonra sol elin baskısını gevşeterek sesi kes — sus da riffin parçası.
2. **Kıta:** Açık 6. telde palm mute chug'lar ve kısa E5 vurguları.
3. **Nakarat:** Aynı akorlar, bu kez çınlamaya bırakılır.`,
    tips: [
      'Akorları "boğmak" için sol elini telden kaldırma, sadece baskıyı gevşet.',
      'G5\'e kayarken üç parmak da tele baskıyı korusun; kaydırmanın sesi duyulmalı.',
      '"Endüstriyel" davul her vuruşta kick çalar: vurgularını kick\'e kilitle.',
      'Orijinal kaydı dinleyip vurguların yerini kulağınla karşılaştır; bu düzenleme sadeleştirilmiştir.',
    ],
    sections: [
      { name: 'Ana riff: A5 – G5 – E5', tab: 'e Q6:5> r Q6:5> r Q6:3/> r Q6:0> r | Q6:5> r Q6:5> r Q6:3/> r q Q6:0! |', repeat: 2 },
      { name: 'Kıta: E5 pedal', tab: 'e (6:0m)x6 P6:0> r | (6:0m)x4 P6:0> r P6:0> r |', repeat: 2 },
      { name: 'Nakarat', tab: 'h Q6:5! Q6:3! | w Q6:0! |', repeat: 2 },
    ],
    drums: 'four',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'sonne',
    title: 'Sonne',
    artist: 'Rammstein',
    album: 'Mutter',
    year: 2001,
    category: 'rammstein',
    difficulty: 2,
    tuning: 'dropD',
    bpm: 75,
    startBpm: 60,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'downpicking', 'chug', 'power-chord', 'drop-tuning'],
    summary: 'Yavaş ve ezici: açık D telinde palm mute pedal, D5–A♭5–G5 darbeleri ve çınlayan nakarat.',
    description: `**Drop D, ~75 BPM** (bazı kaynaklar iki katı, 150 sayar). Kıta D merkezli, nakarat Si minör.

- **Ana riff:** Açık D telinde **aşağı vuruşlu palm mute pedal**, araya **D5 – A♭5 – G5** darbeleri. A♭5, D'nin hemen yanında "yanlış" gibi duran karanlık bir renk (triton!) verir.
- **Nakarat:** **Bm – Em – D – C** akorları çınlamaya bırakılır. Burada power chord olarak, 5. telde kökle çalıyoruz; akor adları üstte yazıyor.

Yavaş tempo kolay demek değildir: her vuruşun tam zamanında ve aynı güçte gelmesi gerekir.`,
    tips: [
      'Akort: D A D G B E. Akort cihazında "Drop D" düzenini aç.',
      'Onaltılık chug\'ların hepsini aşağı vuruşla çalmayı dene; yavaş tempo buna izin verir.',
      'Nakaratta akorları değiştirirken sol eli teli bırakmadan kaydır; çınlama kesilmesin.',
    ],
    sections: [
      { name: 'Ana riff: D5 – A♭5 – G5', tab: 's (6:0m)x8 e Q6:6> r Q6:5> r | s (6:0m)x8 q Q6:0! r |', repeat: 2 },
      { name: 'Nakarat: Bm – Em – D – C', tab: 'h "Bm" Q5:2! "Em" Q5:7! | "D" Q5:5! "C" Q5:3! |', repeat: 2 },
    ],
    drums: 'halftime',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'engel',
    title: 'Engel',
    artist: 'Rammstein',
    album: 'Sehnsucht',
    year: 1997,
    category: 'rammstein',
    difficulty: 3,
    tuning: 'dropD',
    bpm: 96,
    startBpm: 65,
    timeSig: [4, 4],
    techniques: ['legato', 'palm-mute', 'single-note', 'power-chord', 'drop-tuning'],
    summary: 'Islıklı girişiyle ünlü: D telinde tek nota hat, hammer-on/pull-off süslemeleri ve F5 vurguları.',
    description: `**Drop D, ~96 BPM, Re minör (Doryen renkli).**

Riff, kalın D telinde **tek notalı bir hat** üzerine kuruludur; arada **F5** vurguları ve hızlı **hammer-on / pull-off** süslemeleri ("flick") vardır. Nakarat **Dm – G/D** arasında gidip gelir (bazı tablar D5–C5–G5 okur).

- Süslemelerde penayla sadece ilk notayı çal; ikinci ve üçüncü nota sol elden gelsin.
- Palm mute'u süslemelerde biraz gevşet, yoksa legato notalar duyulmaz.
- **G/D** akoru: alttaki açık D teli + G power chord'u (5. ve 4. tel 5. perde).`,
    tips: ['Önce süslemesiz çal (6:0 6:3 6:0 yerine düz chug), sonra legato ekle.', 'Hammer-on için parmağı perdeye yakın ve hızlı indir.', 'Nakaratta tüm akorlar çınlasın — palm mute yok.'],
    sections: [
      { name: 'Ana riff: tek nota + F5', tab: 'e 6:0m 6:0m s 6:0 6:3h e 6:0p 6:0m 6:0m Q6:3> r | 6:0m 6:0m s 6:0 6:5h e 6:3p Q6:3> r Q6:5> r |', repeat: 2 },
      { name: 'Nakarat: Dm – G/D', tab: 'h "Dm" Q6:0! "G/D" 6:0+5:5+4:5! | "Dm" Q6:0! "G/D" 6:0+5:5+4:5! |', repeat: 2 },
    ],
    drums: 'rock',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'links-234',
    title: 'Links 2 3 4',
    artist: 'Rammstein',
    album: 'Mutter',
    year: 2001,
    category: 'rammstein',
    difficulty: 2,
    tuning: 'standard',
    bpm: 130,
    startBpm: 85,
    timeSig: [4, 4],
    techniques: ['power-chord', 'muting', 'downpicking', 'gallop', 'syncopation'],
    summary: 'Asker adımı gibi: E5–G5–A5–B♭5 akorlarıyla kısa, kesik marş vuruşları.',
    description: `**Standart akort, ~130 BPM, Mi minör, marş hissi.**

Riffin, kıtanın ve nakaratın hepsi aynı dört akoru kullanır: **E5 – G5 – A5 – B♭5**. Zorluk notalarda değil, **disiplinde**: akorlar kısa ve keskin (staccato), zaman askerî bir kesinlikte.

- **Marş riffi:** E5 vuruşları ve G5 / A5 / B♭5 darbeleri. B♭5, A5'ten sadece yarım ses yukarıda — karanlık gerilim buradan gelir.
- **Galop + akorlar:** Sekizlik + iki onaltılık (galop) chug'lar ve ardından akor darbeleri. Pena yönü: **Aşağı – Aşağı Yukarı**.

Oynatıcıda **Marş** davul kalıbı açık gelir; trampetle tek vücut olana kadar yavaş çalış.`,
    tips: ['Akordan sonra hemen sustur: her vuruş bir "adım" gibi kısa olmalı.', 'Galopu önce tek notada "ta-ta-ka" diye sesli sayarak çalış.', 'Standart akortta power chord: işaret 6. tel, yüzük ve serçe 5. ve 4. telde iki perde ileride.'],
    sections: [
      { name: 'Marş riffi: E5 – G5 – A5 – B♭5', tab: 'e Q6:0> r Q6:0> Q6:0> Q6:3> r Q6:5> r | Q6:0> r Q6:0> Q6:0> Q6:6> r Q6:5> r |', repeat: 2 },
      { name: 'Galop + akorlar', tab: '(e 6:0m s 6:0m 6:0m)x2 e Q6:3> r Q6:5> Q6:6> | (e 6:0m s 6:0m 6:0m)x2 e Q6:5> r Q6:3> r |', repeat: 2 },
    ],
    drums: 'march',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'ich-will',
    title: 'Ich Will',
    artist: 'Rammstein',
    album: 'Mutter',
    year: 2001,
    category: 'rammstein',
    difficulty: 2,
    tuning: 'dropD',
    bpm: 128,
    startBpm: 85,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'chug', 'syncopation', 'power-chord', 'drop-tuning'],
    summary: 'Açık D telinde chug\'lar ve D5–G5–F5 vurguları; nakaratta çınlayan akorlar.',
    description: `**Drop D, ~128 BPM, Re minör.**

- **Kıta:** Açık D telinde palm mute chug'lar ve **D5 – G5 – F5 – D5** vurguları. Vurgular vuruşların arasına düştüğü için (senkop) içinden sekizlikleri saymak çok önemli.
- **Nakarat:** Palm mute kalkar ve akorlar çınlar: **D5 – B♭5 – G5 – A5**, ardından **D5 – B♭5 – C5 – A5**.

Drop D'de bütün akorlar tek parmakla basılır; sol elin hızlı ve isabetli kaymasını çalıştırmak için ideal.`,
    tips: ['Metronomu sekizlik bölünmede çalıştırıp vurguların hangi "ve"ye düştüğünü say.', 'Nakarattaki akor sırasını önce yavaş, sadece sol el kaydırmasıyla ezberle.', 'Chug\'lardan akora geçerken avucunu kaldır, akordan sonra geri koy.'],
    sections: [
      { name: 'Kıta: D chug + D5–G5–F5', tab: 'e 6:0m 6:0m Q6:0> 6:0m 6:0m Q6:5> 6:0m 6:0m | Q6:3> 6:0m 6:0m Q6:0> r 6:0m 6:0m r |', repeat: 2 },
      { name: 'Nakarat: D5–B♭5–G5–A5 / D5–B♭5–C5–A5', tab: 'q Q6:0! Q6:8! Q6:5! Q6:7! | Q6:0! Q6:8! Q6:10! Q6:7! |', repeat: 2 },
    ],
    drums: 'four',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'feuer-frei',
    title: 'Feuer Frei!',
    artist: 'Rammstein',
    album: 'Mutter',
    year: 2001,
    category: 'rammstein',
    difficulty: 4,
    tuning: 'dropD',
    bpm: 95,
    startBpm: 65,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'chug', 'alternate', 'stamina', 'power-chord', 'drop-tuning'],
    summary: 'Durmak bilmeyen palm mute chug\'lar ve G5–A♭5–B♭5–B5 kromatik tırmanışı.',
    description: `**Drop D, Sol minör.** Kayıt çok hızlıdır (~190 BPM'lik sekizlik hissi); burada okunması kolay olsun diye **yarım tempoda (95 BPM) onaltılıklarla** yazdık — çalınan şey aynı.

- **Kromatik tırmanış:** Chug'ların arasına **G5 – A♭5 – B♭5 – B5** yükselen akorlar, sonra aynı yoldan iniş.
- **Nakarat sonu:** **D5 – C5 – B♭5** ile kapanış.

Makine gibi sıkı chug bu şarkının kalbidir. Bu hızda onaltılıklar için **alternatif pena** kullan, akor vurgularını aşağı vuruşla çal. Hız antrenörüyle 65 BPM'den başla.`,
    tips: ['Hızlandıkça pena hareketini küçült; kol değil bilek çalışsın.', 'Kolun yanmaya başlarsa dur ve dinlen — gerginlik hızın düşmanıdır.', 'Kromatik akorlar yan yana perdelerde: elini tek parmak kaydırır gibi düşün.'],
    sections: [
      { name: 'Kromatik tırmanış', tab: 's (6:0m)x4 e Q6:5> Q6:6> s (6:0m)x4 e Q6:8> Q6:9> | s (6:0m)x4 e Q6:9> Q6:8> s (6:0m)x4 e Q6:6> Q6:5> |', repeat: 2 },
      { name: 'Nakarat sonu: D5 – C5 – B♭5', tab: 's (6:0m)x8 q Q6:0> Q6:10> | h Q6:8! s (6:0m)x8 |', repeat: 2 },
    ],
    drums: 'metal',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'mein-herz-brennt',
    title: 'Mein Herz Brennt',
    artist: 'Rammstein',
    album: 'Mutter',
    year: 2001,
    category: 'rammstein',
    difficulty: 1,
    tuning: 'dropC',
    bpm: 83,
    startBpm: 65,
    timeSig: [4, 4],
    techniques: ['power-chord', 'slide', 'palm-mute', 'drop-tuning'],
    summary: 'Ağır ve dramatik: C5–F5–G♭5 akorları ve yarım ses kaymalar.',
    description: `**Drop C (bazı tabçılar kayıt için Drop D der), ~83 BPM.** Giriş Re minör, şarkının geri kalanı Do minördedir.

- **Ana riff:** **C5 – F5 – G♭5**. F5 ile G♭5 arasındaki **yarım ses kayma** riffe ezici, ağır bir his verir.
- **Nakarat:** **Cm – Fm – A♭ – Gm – Cm**. Power chord olarak çalıyoruz; akor adları üstte.

İlk Rammstein riffin için ideal: yavaş, az nota, ama tam zamanında ve dolu çalınmalı.`,
    tips: ['Akort: C G C F A D (Drop C). Kalın tel seti (11–56 gibi) önerilir.', 'Kayarken baskıyı koru ki ses kesilmesin; hedef perdede tam dur.', 'Uzun akorlarda sol elinle perdeye eşit baskı uygula ki sonuna kadar çınlasın.'],
    sections: [
      { name: 'Ana riff: C5 – F5 – G♭5', tab: 'q Q6:0> e 6:0m 6:0m q Q6:5> Q6:6/ | q Q6:5/> e 6:0m 6:0m h Q6:0! |', repeat: 2 },
      { name: 'Nakarat: Cm – Fm – A♭ – Gm – Cm', tab: 'h "Cm" Q6:0! "Fm" Q6:5! | "A♭" Q6:8! "Gm" Q6:7! | w "Cm" Q6:0! |' },
    ],
    drums: 'halftime',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'deutschland',
    title: 'Deutschland',
    artist: 'Rammstein',
    album: 'Rammstein (adsız albüm)',
    year: 2019,
    category: 'rammstein',
    difficulty: 3,
    tuning: 'dropC',
    bpm: 120,
    startBpm: 80,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'chug', 'octave', 'power-chord', 'drop-tuning'],
    summary: 'D5–E♭5 yarım ses sürtünmesi, ağır chug\'lar ve synth melodisini takip eden oktavlar.',
    description: `**Drop C, ~120 BPM, Re minör / Re Frigyen.**

- **Kıta:** **D5 – E♭5 – C5**. Re ile Mi♭ arasındaki **yarım ses sürtünmesi** Frigyen tınısının ta kendisi. Drop C'de D, 6. telin **2. perdesi**dir — chug'lar açık telde değil, 2. perdede!
- **Oktavlar:** Şarkının ilerleyen bölümünde gitar synth melodisini takip eder. 4. ve 2. telde oktav şekli: 2. teldeki nota **üç perde ileride**; aradaki 3. teli işaret parmağıyla sustur.
- **Nakarat:** **D5 – G5 – A5 – Cm – Gm/D**.`,
    tips: ['2. perdede palm mute yaparken sol el parmağı teli fazla sıkmasın; tok ses için hafif bırak.', 'Oktavlarda pena iki teli de vursun ama arada susturulan tel duyulmasın.', 'Synth girişini hayal ederek oktav bölümünü temiz tonla da dene.'],
    sections: [
      { name: 'Kıta: D5 – E♭5 – C5', tab: 'e 6:2m 6:2m 6:2m Q6:3> 6:2m 6:2m Q6:0> r | 6:2m 6:2m 6:2m Q6:3> 6:2m Q6:3> Q6:2> r |', repeat: 2 },
      { name: 'Synth\'i takip eden oktavlar', tab: 'e 6:2m 6:2m 4:2+2:5 6:2m 6:2m 4:3+2:6 6:2m 4:5+2:8 | 6:2m 6:2m 4:3+2:6 6:2m 6:2m 4:2+2:5 q r |', repeat: 2 },
      { name: 'Nakarat: D5 – G5 – A5 – Cm – Gm/D', tab: 'h "D5" Q6:2! "G5" Q6:7! | "A5" Q6:9! "Cm" Q6:0! | w "Gm/D" 6:2+5:0+4:2! |' },
    ],
    drums: 'four',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'amerika',
    title: 'Amerika',
    artist: 'Rammstein',
    album: 'Reise, Reise',
    year: 2004,
    category: 'rammstein',
    difficulty: 2,
    tuning: 'dropC',
    bpm: 125,
    startBpm: 85,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'power-chord', 'arpeggio', 'drop-tuning'],
    summary: 'Palm mute\'lu kıta, marş gibi geniş nakarat ve temiz tonda arpej katmanı.',
    description: `**Drop C, ~125 BPM, Do minör.** Bu şarkının akorları için kaynaklar tam uyuşmuyor; buradaki ilerleme kullanıcı akor tablolarının ortak noktasıdır.

- **Kıta:** Re ve Mi♭ etrafında palm mute chug'lar.
- **Nakarat:** **Cm – E♭ – B♭ – Gm**, geniş ve çınlayan.
- **Arpej katmanı:** Kayıtta distorsiyonlu gitarların yanında temiz bir arpej de duyulur. Akor notalarını tek tek çal ve çınlamaya bırak — temiz tonda dene.`,
    tips: ['Arpej bölümünde oynatıcının ayarlarından tonu "Temiz"e al.', 'Kıtadaki chug\'lar 2. perdede (Drop C\'de Re): sol el hafif bassın.', 'Nakaratta B♭5 için 10. perdeye uzanırken elini önceden kaydır.'],
    sections: [
      { name: 'Kıta: D / E♭ palm mute', tab: 'e 6:2m 6:2m 6:2m 6:2m Q6:3> r 6:2m 6:2m | 6:2m 6:2m 6:2m 6:2m Q6:3> r Q6:2> r |', repeat: 2 },
      { name: 'Nakarat: Cm – E♭ – B♭ – Gm', tab: 'h "Cm" Q6:0! "E♭" Q6:3! | "B♭" Q6:10! "Gm" Q6:7! |', repeat: 2 },
      { name: 'Temiz arpej (Cm – E♭)', tab: 'e "Cm" 4:0! 3:2! 2:3! 1:1! 2:3! 3:2! 4:0! 3:2! | "E♭" 4:3! 3:2! 2:1! 1:1! 2:1! 3:2! 4:3! 3:2! |', repeat: 2 },
    ],
    drums: 'four',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'rammstein-song',
    title: 'Rammstein',
    artist: 'Rammstein',
    album: 'Herzeleid',
    year: 1995,
    category: 'rammstein',
    difficulty: 1,
    tuning: 'standard',
    bpm: 57,
    startBpm: 50,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'chug', 'power-chord'],
    summary: 'Grubun adını taşıyan şarkı: çok yavaş, ağır E5–F5 yarım ses "öğütmesi".',
    description: `**Standart akort, çok yavaş (~57 BPM; iki katı hızda da sayılır), Mi minör / Frigyen.**

Riffin tamamı **E5 ile F5** arasındaki **yarım ses** üzerine kuruludur — Frigyen gamın karanlık "b2" aralığı. Palm mute'lu onaltılık chug'lar yavaş tempoda ağır bir öğütme hissi verir. Köprüde **G5 – E5** gelir.

Çok yavaş tempo, palm mute konumunu ve chug'ların eşitliğini kontrol etmek için mükemmel bir egzersiz. Kayıtta üstte wah pedallı solo gitarlar da vardır.`,
    tips: ['Standart akortta E5: açık 6. tel + 5. ve 4. tel 2. perde. F5: 1. perdede aynı şekil.', 'Onaltılıkların hepsi aşağı vuruş; tempo buna rahatça izin verir.', 'F5\'e her geçişte avucu kaldır ki akor tam çınlasın.'],
    sections: [
      { name: 'Ağır riff: E5 – F5', tab: 's (6:0m)x4 q Q6:1> s (6:0m)x4 q Q6:0> | s (6:0m)x4 q Q6:1> h Q6:0! |', repeat: 2 },
      { name: 'Köprü: G5 – E5', tab: 'h Q6:3! Q6:0! | Q6:3! Q6:0! |' },
    ],
    drums: 'halftime',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'keine-lust',
    title: 'Keine Lust',
    artist: 'Rammstein',
    album: 'Reise, Reise',
    year: 2004,
    category: 'rammstein',
    difficulty: 2,
    tuning: 'dropC',
    bpm: 138,
    startBpm: 90,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'chug', 'syncopation', 'power-chord', 'drop-tuning'],
    summary: 'Alçak C pedalında susturulmuş chug\'lar ve üst üste yığılan nakarat akorları.',
    description: `**Drop C, ~138 BPM, Do minör.**

- **Kıta:** Alçak C (açık 6. tel) **pedalında** susturulmuş chug'lar ve aralarda kısa suslar — groove buradan gelir.
- **Nakarat:** **Cm – Gm – Fm – A♭**, power chord olarak **C5 – G5 – F5 – A♭5**. Kıtadaki sıkı susturmanın ardından açılan geniş akorlar büyük bir kontrast yaratır.`,
    tips: ['Kıtadaki susları da "çal": sağ el hareketini durdurmadan tele dokunmadan geç.', 'Nakarata girerken palm mute\'u tamamen kaldır.', 'G5 (7. perde) ile A♭5 (8. perde) arasındaki tek perdelik kaymaya dikkat.'],
    sections: [
      { name: 'Kıta: alçak C pedal', tab: 'e 6:0m 6:0m r 6:0m 6:0m r 6:0m 6:0m | 6:0m 6:0m r 6:0m 6:0m Q6:3> r Q6:0> |', repeat: 2 },
      { name: 'Nakarat: C5 – G5 – F5 – A♭5', tab: 'h "Cm" Q6:0! "Gm" Q6:7! | "Fm" Q6:5! "A♭" Q6:8! |', repeat: 2 },
    ],
    drums: 'four',
    tone: 'distortion',
    approx: true,
  },
  {
    id: 'benzin',
    title: 'Benzin',
    artist: 'Rammstein',
    album: 'Rosenrot',
    year: 2005,
    category: 'rammstein',
    difficulty: 3,
    tuning: 'dropC',
    bpm: 142,
    startBpm: 90,
    timeSig: [4, 4],
    techniques: ['palm-mute', 'chug', 'single-note', 'slide', 'drop-tuning'],
    summary: 'Hızlı ve itici: açık C5 chug\'ları, tek nota dolgular ve kromatik nakarat.',
    description: `**Drop C, ~142 BPM, Do minör.**

- **Ana riff:** Açık C telinde chug'lar ve aralarda **tek notalı dolgular**. Dolgularda palm mute'u kaldır ki notalar net duyulsun.
- **Nakarat:** **C5 – E♭5 – D♭5** etrafında kromatik hareketler.

Kayıtta pinch harmonic'ler ve kaymalar da kullanılır; burada kaymaları ekledik. Pinch harmonic için: penayı tutarken başparmağının kenarı teli pena vurduktan hemen sonra hafifçe sıyırsın — ciyaklayan bir üst ses çıkar.`,
    tips: ['İkinci ölçüdeki dolguda 3. perdeden 5. perdeye kayarak çık, sonra 3–1–0 diye in.', 'Chug ile dolgu arasında sağ el temposu hiç değişmesin.', 'Önce %60 tempoda, sadece ilk ölçüyü döngüye al.'],
    sections: [
      { name: 'Ana riff: C5 chug + dolgular', tab: 'e 6:0m 6:0m 6:0m 6:0m 6:3 6:1 6:0 r | 6:0m 6:0m 6:0m 6:3 6:5/ 6:3 6:1 6:0 |', repeat: 2 },
      { name: 'Nakarat: C5 – E♭5 – D♭5', tab: 'q Q6:0! Q6:3! Q6:1! Q6:0! | e Q6:0> r Q6:3> r Q6:1> r Q6:0> r |', repeat: 2 },
    ],
    drums: 'four',
    tone: 'distortion',
    approx: true,
  },
];
