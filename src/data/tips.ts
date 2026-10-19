export const TIPS: string[] = [
  'Her çalışmaya akortla başla — akortsuz gitar, kulağına yanlış sesleri öğretir.',
  'Temiz çalamadığın bir tempo, senin için henüz çok hızlıdır. 10 BPM düşür.',
  'Günde 20 dakika, haftada bir kez 3 saatten çok daha etkilidir.',
  'Zorlandığın iki ölçüyü döngüye al; bütün şarkıyı baştan çalmak zaman kaybıdır.',
  'Kendini telefonla kaydet ve dinle: çalarken duymadığın ritim kaymalarını fark edeceksin.',
  'Palm mute\'unu temiz tonda test et. Temiz tonda tok çıkıyorsa distorsiyonda harika çıkar.',
  'Fazla gain sesi çamurlaştırır. Rammstein tonu sandığından daha az distorsiyon kullanır.',
  'Sol el baskısı: ses temiz çıktığı anda yeterlidir, fazlası seni yorar ve yavaşlatır.',
  'Kullanmadığın parmakları tellerin yakınında tut; uçan parmaklar hız kaybettirir.',
  'Sus da bir notadır. Akordu tam vaktinde kesmek, onu çalmak kadar önemlidir.',
  'Metronomla çalışırken tık sesi kaybolursa (notan tıkın üstüne oturursa) mükemmel zamanlamadasın.',
  'Parmak uçlarındaki sızı birkaç haftada geçer; keskin ağrıda ise hemen dur.',
  'Drop D\'ye geçmek 10 saniye sürer ve ağır riffleri çok kolaylaştırır.',
  'Riff çalarken ayağınla tempo tut — vücudun ritmi içselleştirir.',
  'Bir şarkıyı öğrenirken önce orijinal kaydı dikkatle dinle; kulağın en iyi öğretmendir.',
  'Aşağı vuruş dayanıklılığı için bileğini gevşek tut ve hareketi küçült.',
  'Yeni teller birkaç gün sık sık gevşer; ilk günlerde daha sık akort et.',
  'Kulaklıkla çalışırken sesi düşük tut — işitme kaybı geri dönmez.',
  'Akor değiştirirken ritmi durdurma; sağ el hareket etmeye devam etsin.',
  'Yavaş çalmak sıkıcı gelebilir ama hızlanmanın en kısa yolu budur.',
  'Mikrofonla takip modunda isabet oranın %90\'ın üstündeyse tempoyu artırma zamanı.',
  'Gamları ezberlerken her kalıbı kök notada başlatıp bitir.',
];

export function tipOfTheDay(): string {
  const d = new Date();
  const day = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return TIPS[day % TIPS.length];
}
