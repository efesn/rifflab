# RiffLab — Elektro Gitar Stüdyosu

Elektro gitara yeni başlayanlar için hazırlanmış, tarayıcıda (ve masaüstü uygulaması olarak) çalışan bir öğrenme stüdyosu. Akort cihazı, metronom, oynatılabilir tablar, 14 derslik müfredat, riff kütüphanesi (Rammstein dahil), günlük antrenman programı, kulak/klavye oyunları ve ilerleme takibi tek yerde.

## Çalıştırma

Gereksinim: [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç. Mikrofon özellikleri (akort cihazı, mikrofonla takip, nota avı) `localhost` üzerinde çalışır; tarayıcı izin isteyecektir.

### Masaüstü uygulaması olarak

```bash
npm run build
npm run preview
```

`http://localhost:4173` adresini Chrome ya da Edge'de aç → adres çubuğundaki **Yükle** simgesi (veya Ayarlar → "Masaüstü uygulaması olarak yükle"). RiffLab kendi penceresinde açılır ve service worker sayesinde internet olmadan da çalışır.

### Testler

```bash
npm test          # notasyon / ASCII tab ayrıştırıcıları ve perde algılama
npm run typecheck
```

## Özellikler

| Bölüm | Neler var? |
|---|---|
| **Panel** | Günlük hedef halkası, seri (streak), son 14 gün grafiği, sıradaki ders, günün riffi, günün ipucu |
| **Günlük Antrenman** | 15 / 30 / 45 dk'lık zamanlanmış programlar: akort → ısınma → teknik → akor/gam → riff → serbest. Süre dolunca zil çalar ve sonraki bloğa geçer; riffler ilerlemene göre seçilir |
| **Dersler** | Gitarı tanımaktan Rammstein tarzı ritim gitara 14 ders: açıklamalar, oynatılabilir egzersizler, akor şemaları, klavye diyagramları, kontrol listeleri |
| **Riffler & Tablar** | Rammstein, klasik riffler ve teknik egzersizler. Her tab oynatılabilir |
| **Tab oynatıcı** | Karplus-Strong tel sentezi + amfi simülasyonu (temiz / crunch / distorsiyon), palm mute, bend, slide, hammer-on; tempo %25–150, döngü ve ölçü aralığı seçme, sayım, metronom, 7 davul kalıbı, "sen çal" modu (gitar sesi kapalı), hız antrenörü, klavyede anlık nota gösterimi |
| **Mikrofonla takip** | Doğru notayı çaldıkça imleç ilerler (YIN perde algılama + vuruş tespiti), isabet oranı |
| **Akort cihazı** | İbre, strobe ve sapma grafiği; 8 akort düzeni (Standart, Drop D, Drop C, E♭, D/C standart, Drop C♯, Drop B), tel kilitleme, referans tonlar, A4 kalibrasyonu, ses kartı seçimi |
| **Metronom** | Hassas zamanlama (AudioContext saati), vurgu düzenleme, 2/4–12/8, bölünmeler, tap tempo, hız antrenörü, sessiz ölçü antrenmanı |
| **Akorlar** | 33 akor şeması (açık, yedili, sus, power, barre) — dinle, arpej, klavyede gör, geçiş alıştırması |
| **Gamlar & Klavye** | 11 gam (pentatonik, blues, Frigyen, Hicaz'a yakın Frigyen dominant…), tüm kökler, pozisyon filtresi, nota/aralık etiketleri |
| **Oyunlar** | Nota Avı (60 sn, istersen gitarınla çalarak), Aralık Kulağı, Akor Kulağı |
| **Tab Stüdyosu** | İnternetten kopyaladığın ASCII tabları yapıştır (PM satırı, h/p/b/~ okunur, ritim tahmini) ya da RiffLab notasyonuyla yaz; canlı önizleme, kütüphaneye kaydet |
| **İlerleme** | 14/30/90 günlük grafik, riff başına en iyi temiz tempo, süre dağılımı, oturum geçmişi, oyun rekorları |
| **Ayarlar** | Nota adları (C D E / Do Re Mi), solak klavye, ton, A4, ses girişi, yedek al / yükle |

Tüm veriler tarayıcının yerel deposunda (localStorage) tutulur; sunucu yoktur.

## Rammstein riffleri hakkında

Rammstein bölümünde 12 şarkı var (Du Hast, Sonne, Engel, Links 2 3 4, Ich Will, Feuer Frei!, Mein Herz Brennt, Deutschland, Amerika, Rammstein, Keine Lust, Benzin). Akort, tempo, ton ve akor ilerlemeleri kaynaklardaki ortak bilgiye dayanır (tab sitelerindeki kullanıcı transkripsiyonları, BPM/ton veritabanları; bazı şarkılarda kaynaklar akort konusunda ayrışıyor, açıklamada belirtildi). Ritim ve parmaklama ise riffin karakterini öğretmek için **sadeleştirilmiştir**; kayıttaki notalarla birebir aynı değildir. Orijinal kaydı dinleyerek kulaktan karşılaştır. Birebir bir tab bulursan **Tab Stüdyosu**'na yapıştırıp aynı oynatıcı özellikleriyle (yavaşlatma, döngü, davul, mikrofonla takip) çalışabilirsin.

## RiffLab notasyonu (kısa başvuru)

```
e 6:0m 6:0m 6:0m 6:0m Q6:5> r Q6:7> r |     # sekizlik chug + vurgulu power chord
q 3:5 3:7h 3:5p r | h 3:7b2~ _ |              # hammer-on, pull-off, bend + vibrato, bağ
(s 6:0m)x8 e P5:3 P5:5 r r |                  # tekrar grubu
```

| Yazım | Anlamı |
|---|---|
| `w h q e s t` | Süre: birlik … otuzikilik (`q.` noktalı, `e3` üçleme); değiştirilene kadar geçerli |
| `6:0`, `3:7`, `5:x` | tel:perde (1 = ince mi, 6 = kalın mi), `x` ölü nota |
| `6:0+5:2+4:2` | akor |
| `P6:3`, `Q5:5` | power chord (P: kök+beşli, Q: +oktav) — akort düzenine göre hesaplanır |
| `m > ! h p / b b1 ~ *` | palm mute, vurgu, çınlasın, hammer-on, pull-off, slide, bend, yarım bend, vibrato, armonik |
| `r` `_` `\|` | es, bağ, ölçü çizgisi |
| `( … )x4`, `"Em"`, `# …` | tekrar, etiket, yorum |

## Teknik

React 19 + TypeScript + Vite. Ses: Web Audio API (Karplus-Strong sentezi, WaveShaper tabanlı amfi + kabin, konvolüsyon reverb, sentez davul), Web Worker zamanlayıcı ile ileriye dönük planlama. Perde algılama: YIN. Durum: Zustand (localStorage'a kalıcı).

```
src/
  audio/      ses motoru: engine, amp, guitar (KS), drums, clicks, metronome, pitch (YIN), mic
  tab/        notasyon ve ASCII ayrıştırıcılar, oynatma dizisi, oynatıcı, SVG tab çizici
  components/ oynatıcı paneli, klavye, akor şeması, ortak arayüz
  data/       riffler, dersler, akorlar, gamlar, akortlar, antrenman şablonları
  pages/      sayfalar
  store/      ayarlar, ilerleme, sayaç, antrenman
```
