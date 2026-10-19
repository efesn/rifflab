export type ScaleId =
  | 'minorPent'
  | 'majorPent'
  | 'blues'
  | 'major'
  | 'minor'
  | 'harmonicMinor'
  | 'phrygian'
  | 'phrygianDom'
  | 'dorian'
  | 'mixolydian'
  | 'chromatic';

export interface Scale {
  id: ScaleId;
  name: string;
  intervals: number[];
  desc: string;
}

export const SCALES: Scale[] = [
  { id: 'minorPent', name: 'Minör pentatonik', intervals: [0, 3, 5, 7, 10], desc: 'Rock ve blues solosunun temel gamı. Beş nota, yanlış nota çalmak neredeyse imkânsız.' },
  { id: 'blues', name: 'Blues', intervals: [0, 3, 5, 6, 7, 10], desc: 'Minör pentatonik + "blue note" (b5). Hendrix, Clapton, SRV.' },
  { id: 'majorPent', name: 'Majör pentatonik', intervals: [0, 2, 4, 7, 9], desc: 'Neşeli, country ve klasik rock tınısı.' },
  { id: 'minor', name: 'Doğal minör (Eolyen)', intervals: [0, 2, 3, 5, 7, 8, 10], desc: 'Hüzünlü ve karanlık; metal ve rock\'ta en yaygın gam.' },
  { id: 'major', name: 'Majör (İyonyen)', intervals: [0, 2, 4, 5, 7, 9, 11], desc: 'Do majör gamı: do-re-mi-fa-sol-la-si. Batı müziğinin temeli.' },
  { id: 'harmonicMinor', name: 'Armonik minör', intervals: [0, 2, 3, 5, 7, 8, 11], desc: 'Neoklasik metal (Malmsteen) ve doğu esintili melodiler.' },
  { id: 'phrygian', name: 'Frigyen', intervals: [0, 1, 3, 5, 7, 8, 10], desc: 'b2 sayesinde çok karanlık. Rammstein ve thrash riff\'lerinde sık görülür.' },
  { id: 'phrygianDom', name: 'Frigyen dominant (Hicaz\'a yakın)', intervals: [0, 1, 4, 5, 7, 8, 10], desc: 'Türk müziğindeki Hicaz makamına çok yakın tını. Doğu ezgileri ve metal.' },
  { id: 'dorian', name: 'Doryen', intervals: [0, 2, 3, 5, 7, 9, 10], desc: 'Minör ama daha aydınlık (büyük 6\'lı). Santana, funk.' },
  { id: 'mixolydian', name: 'Miksolidyen', intervals: [0, 2, 4, 5, 7, 9, 10], desc: 'Majör ama küçük 7\'li: klasik rock, AC/DC.' },
  { id: 'chromatic', name: 'Kromatik', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], desc: 'On iki notanın hepsi — klavyedeki tüm notaları görmek için.' },
];

export function getScale(id: ScaleId): Scale {
  return SCALES.find((s) => s.id === id) ?? SCALES[0];
}
