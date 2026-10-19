import { useEffect, useMemo, useState } from 'react';
import { FileMusic, Plus, Save, Trash, ClipboardPaste, BookOpen, Code } from 'lucide-react';
import { navigate, Link } from '../router';
import { TUNINGS, TUNING_LIST, type TuningId } from '../data/tunings';
import { DRUM_PATTERNS, type DrumPatternId } from '../audio/drums';
import { TONE_LABELS, type ToneId } from '../audio/amp';
import type { Riff, RiffSection } from '../data/riffs/types';
import { parseRiff } from '../data/riffs';
import { useProgress } from '../store/progress';
import { TabPlayerPanel } from '../components/TabPlayerPanel';
import { Callout, Segmented, toast } from '../components/ui';
import { uid } from '../lib/format';
import type { TimeSig } from '../tab/types';
import './studio.css';

const ASCII_EXAMPLE = `Örnek: chug + power chord (Drop D)
   PM------    PM-------
e|-------------------------------|
B|-------------------------------|
G|-------------------------------|
D|---------5-------------7-------|
A|---------5-------------7-------|
D|-0-0-0-0-5---0-0-0-0-0-7-------|`;

const DSL_EXAMPLE = `# Sekizlik chug'lar ve vurgulu power chord'lar (Drop D)
e 6:0m 6:0m 6:0m 6:0m Q6:5> r Q6:7> r |
  6:0m 6:0m Q6:3> 6:0m 6:0m Q6:5> 6:0m r |
q Q6:0! _ e 6:0m 6:0m Q6:3> r |`;

const SIGS: TimeSig[] = [
  [4, 4],
  [3, 4],
  [2, 4],
  [6, 8],
  [12, 8],
  [5, 4],
  [7, 8],
];

function emptyRiff(): Riff {
  return {
    id: `my-${uid()}`,
    title: '',
    artist: '',
    category: 'custom',
    difficulty: 2,
    tuning: 'standard',
    bpm: 100,
    timeSig: [4, 4],
    techniques: [],
    summary: '',
    description: '',
    tips: [],
    sections: [{ name: 'Riff', tab: '' }],
    drums: 'rock',
    tone: 'distortion',
    source: 'ascii',
    ascii: { timing: 'spacing', unit: 0.5 },
  };
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return v;
}

export function StudioPage({ editId }: { editId?: string }) {
  const custom = useProgress((s) => s.custom);
  const saveCustom = useProgress((s) => s.saveCustom);
  const deleteCustom = useProgress((s) => s.deleteCustom);
  const existing = editId ? custom.find((r) => r.id === editId) : undefined;
  const [riff, setRiff] = useState<Riff>(() => (existing ? structuredClone(existing) : emptyRiff()));
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (existing) setRiff(structuredClone(existing));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const debounced = useDebounced(riff, 350);
  const parsed = useMemo(() => {
    try {
      return parseRiff({ ...debounced, id: `preview-${debounced.id}` });
    } catch {
      return { sections: [], warnings: ['Ayrıştırılamadı.'] };
    }
  }, [debounced]);
  const hasNotes = parsed.sections.some((s) => s.tab.measures.length > 0);

  const update = (p: Partial<Riff>) => setRiff((r) => ({ ...r, ...p }));
  const updateSection = (i: number, p: Partial<RiffSection>) => setRiff((r) => ({ ...r, sections: r.sections.map((s, k) => (k === i ? { ...s, ...p } : s)) }));

  const save = () => {
    if (!riff.title.trim()) {
      toast('Önce bir başlık gir.');
      return;
    }
    if (!hasNotes) {
      toast('Tab boş görünüyor.');
      return;
    }
    const out: Riff = {
      ...riff,
      title: riff.title.trim(),
      artist: riff.artist.trim() || 'Bilinmiyor',
      summary: riff.summary || `${riff.source === 'ascii' ? 'İçe aktarılan' : 'RiffLab notasyonuyla yazılan'} tab · ${TUNINGS[riff.tuning].name}`,
      description: riff.description || 'Kendi eklediğin tab. Oynatıcıda tempoyu düşürüp döngüye alarak çalışabilirsin.',
      createdAt: riff.createdAt ?? new Date().toISOString(),
    };
    saveCustom(out);
    toast('Tab kaydedildi.');
    navigate(`/riffler/${out.id}`);
  };

  const remove = () => {
    if (!existing) return;
    if (!window.confirm(`"${existing.title}" silinsin mi?`)) return;
    deleteCustom(existing.id);
    toast('Tab silindi.');
    navigate('/riffler');
  };

  const pasteFromClipboard = async (i: number) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) updateSection(i, { tab: text });
    } catch {
      toast('Panoya erişilemedi; metni kutuya yapıştır (Ctrl+V).');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <FileMusic size={14} /> Tab stüdyosu
          </div>
          <h1>{existing ? 'Tabı Düzenle' : 'Tab Ekle'}</h1>
          <p className="subtitle">İnternette bulduğun bir ASCII tabı yapıştır ya da RiffLab notasyonuyla kendi riffini yaz. Önizleme anında güncellenir; kaydettiğinde kütüphanene eklenir ve tüm oynatıcı özellikleriyle çalışabilirsin.</p>
        </div>
        <div className="row">
          {existing && (
            <button className="btn danger" onClick={remove}>
              <Trash size={16} /> Sil
            </button>
          )}
          <button className="btn primary" onClick={save}>
            <Save size={16} /> Kaydet
          </button>
        </div>
      </div>

      <div className="studio-layout">
        <div className="card stack">
          <div className="field">
            <label>Biçim</label>
            <Segmented
              value={riff.source ?? 'dsl'}
              onChange={(v) => update({ source: v })}
              options={[
                { value: 'ascii', label: 'ASCII tab (internetten)' },
                { value: 'dsl', label: 'RiffLab notasyonu' },
              ]}
            />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label>Başlık</label>
              <input className="input" value={riff.title} onChange={(e) => update({ title: e.target.value })} placeholder="Ör. Benim riffim" />
            </div>
            <div className="field">
              <label>Sanatçı</label>
              <input className="input" value={riff.artist} onChange={(e) => update({ artist: e.target.value })} placeholder="Ör. Rammstein" />
            </div>
          </div>
          <div className="grid grid-3">
            <div className="field">
              <label>Akort</label>
              <select className="select" value={riff.tuning} onChange={(e) => update({ tuning: e.target.value as TuningId })}>
                {TUNING_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Tempo (BPM)</label>
              <input className="input" type="number" min={30} max={300} value={riff.bpm} onChange={(e) => update({ bpm: Math.max(30, Math.min(300, +e.target.value || 100)) })} />
            </div>
            <div className="field">
              <label>Ölçü</label>
              <select
                className="select"
                value={riff.timeSig.join('/')}
                onChange={(e) => {
                  const [a, b] = e.target.value.split('/').map(Number);
                  update({ timeSig: [a, b] });
                }}
              >
                {SIGS.map((s) => (
                  <option key={s.join('/')} value={s.join('/')}>
                    {s.join('/')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {riff.source === 'ascii' && (
            <div className="grid grid-2">
              <div className="field">
                <label>Ritim tahmini</label>
                <Segmented
                  value={riff.ascii?.timing ?? 'spacing'}
                  onChange={(v) => update({ ascii: { unit: riff.ascii?.unit ?? 0.5, timing: v } })}
                  options={[
                    { value: 'spacing', label: 'Boşluklardan' },
                    { value: 'even', label: 'Eşit aralık' },
                  ]}
                />
              </div>
              <div className="field">
                <label>Temel nota</label>
                <Segmented
                  value={riff.ascii?.unit ?? 0.5}
                  onChange={(v) => update({ ascii: { timing: riff.ascii?.timing ?? 'spacing', unit: v } })}
                  options={[
                    { value: 1, label: 'Dörtlük' },
                    { value: 0.5, label: 'Sekizlik' },
                    { value: 0.25, label: 'Onaltılık' },
                  ]}
                />
              </div>
            </div>
          )}
          <div className="grid grid-3">
            <div className="field">
              <label>Davul</label>
              <select className="select" value={riff.drums ?? 'none'} onChange={(e) => update({ drums: e.target.value as DrumPatternId })}>
                {DRUM_PATTERNS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Ton</label>
              <select className="select" value={riff.tone ?? 'distortion'} onChange={(e) => update({ tone: e.target.value as ToneId })}>
                {(['clean', 'crunch', 'distortion'] as ToneId[]).map((t) => (
                  <option key={t} value={t}>
                    {TONE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Zorluk</label>
              <select className="select" value={riff.difficulty} onChange={(e) => update({ difficulty: +e.target.value as Riff['difficulty'] })}>
                {[1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {riff.sections.map((s, i) => (
            <div key={i} className="studio-section">
              <div className="row">
                <input className="input section-name" value={s.name} onChange={(e) => updateSection(i, { name: e.target.value })} aria-label="Bölüm adı" />
                <label className="small muted row nowrap">
                  Tekrar
                  <input className="input mini" type="number" min={1} max={16} value={s.repeat ?? 1} onChange={(e) => updateSection(i, { repeat: Math.max(1, +e.target.value || 1) })} />
                </label>
                <span className="spacer" />
                <button className="btn sm" onClick={() => void pasteFromClipboard(i)} title="Panodan yapıştır">
                  <ClipboardPaste size={14} /> Yapıştır
                </button>
                {riff.sections.length > 1 && (
                  <button className="btn sm icon danger" onClick={() => setRiff((r) => ({ ...r, sections: r.sections.filter((_, k) => k !== i) }))} aria-label="Bölümü sil">
                    <Trash size={14} />
                  </button>
                )}
              </div>
              <textarea
                className="textarea"
                rows={riff.source === 'ascii' ? 9 : 6}
                spellCheck={false}
                value={s.tab}
                placeholder={riff.source === 'ascii' ? 'e|-----0---|\nB|-----1---|\nG|---0-----|\nD|---------|\nA|-3-------|\nE|---------|' : 'e 6:0m 6:0m P6:3> r ...'}
                onChange={(e) => updateSection(i, { tab: e.target.value })}
              />
            </div>
          ))}
          <div className="row">
            <button className="btn sm" onClick={() => setRiff((r) => ({ ...r, sections: [...r.sections, { name: `Bölüm ${r.sections.length + 1}`, tab: '' }] }))}>
              <Plus size={14} /> Bölüm ekle
            </button>
            <button
              className="btn sm"
              onClick={() =>
                setRiff((r) => ({
                  ...r,
                  source: 'ascii',
                  tuning: 'dropD',
                  bpm: 110,
                  title: r.title || 'Örnek ASCII riff',
                  sections: [{ name: 'Riff', tab: ASCII_EXAMPLE }],
                }))
              }
            >
              Örnek ASCII
            </button>
            <button
              className="btn sm"
              onClick={() =>
                setRiff((r) => ({
                  ...r,
                  source: 'dsl',
                  tuning: 'dropD',
                  bpm: 110,
                  title: r.title || 'Örnek notasyon riffi',
                  sections: [{ name: 'Riff', tab: DSL_EXAMPLE }],
                }))
              }
            >
              Örnek notasyon
            </button>
            <span className="spacer" />
            <button className={`btn sm${showHelp ? ' on' : ''}`} onClick={() => setShowHelp((v) => !v)}>
              {riff.source === 'ascii' ? <BookOpen size={14} /> : <Code size={14} />} Yardım
            </button>
          </div>

          {showHelp && (riff.source === 'ascii' ? <AsciiHelp /> : <DslHelp />)}
        </div>

        <div className="stack">
          {parsed.warnings.length > 0 && (
            <Callout tone="warn" title={`${parsed.warnings.length} uyarı`}>
              <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
                {parsed.warnings.slice(0, 8).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Callout>
          )}
          {hasNotes ? (
            <TabPlayerPanel sections={parsed.sections} tuning={TUNINGS[debounced.tuning].notes} timeSig={debounced.timeSig} bpm={debounced.bpm} drums={debounced.drums} compact />
          ) : (
            <div className="empty">
              <FileMusic size={34} />
              <p>Önizleme burada görünecek. Soldaki kutuya bir tab yapıştır ya da "Örnek" düğmelerinden birini dene.</p>
            </div>
          )}
          {custom.length > 0 && (
            <div className="card">
              <div className="card-title">Kayıtlı tabların</div>
              <div className="stack mt-1">
                {custom.map((c) => (
                  <div key={c.id} className="row">
                    <Link to={`/riffler/${c.id}`} className="accent">
                      {c.title}
                    </Link>
                    <span className="muted small">{c.artist}</span>
                    <span className="spacer" />
                    <Link to={`/studyo/${c.id}`} className="btn sm">
                      Düzenle
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AsciiHelp() {
  return (
    <div className="help-box prose small">
      <p>
        <b>ASCII tab</b>: her tel ayrı satırda, en üstte ince mi teli (e). Satır başındaki nota adları (<code>e|</code>, <code>B|</code> …) isteğe bağlı. Birden fazla blok art arda yapıştırılabilir.
      </p>
      <ul>
        <li>
          Teknikler: <code>5h7</code> hammer-on, <code>7p5</code> pull-off, <code>5/7</code> slide, <code>7b9</code> bend, <code>7~</code> vibrato, <code>x</code> ölü nota, <code>&lt;12&gt;</code> armonik.
        </li>
        <li>
          Blokların hemen üstündeki <code>PM----</code> satırı palm mute olarak okunur.
        </li>
        <li>ASCII tablarda ritim yazmaz: "Boşluklardan" seçeneği notalar arasındaki tire sayısından süre tahmin eder; sonuç tuhafsa "Eşit aralık" ile dene ve tempoyu ayarla.</li>
        <li>Tabın hangi akortta olduğunu kontrol et (çoğu sitede başlıkta yazar) ve aynı akortu seç.</li>
      </ul>
    </div>
  );
}

function DslHelp() {
  return (
    <div className="help-box prose small">
      <p>
        <b>RiffLab notasyonu</b> ritmi de içeren kısa bir yazım biçimidir. Boşlukla ayrılmış ifadeler soldan sağa okunur.
      </p>
      <table>
        <tbody>
          <tr>
            <td>
              <code>w h q e s t</code>
            </td>
            <td>Süre: birlik, ikilik, dörtlük, sekizlik, onaltılık, otuzikilik. Değiştirilene kadar geçerli. <code>q.</code> noktalı, <code>e3</code> üçleme.</td>
          </tr>
          <tr>
            <td>
              <code>6:0</code> <code>3:7</code>
            </td>
            <td>Tel:perde (1 = ince mi, 6 = kalın mi). <code>5:x</code> ölü nota.</td>
          </tr>
          <tr>
            <td>
              <code>6:0+5:2+4:2</code>
            </td>
            <td>Aynı anda çalınan notalar (akor).</td>
          </tr>
          <tr>
            <td>
              <code>P6:3</code> <code>Q5:5</code>
            </td>
            <td>Power chord: P = kök + beşli, Q = + oktav. Akorta göre otomatik hesaplanır.</td>
          </tr>
          <tr>
            <td>
              <code>m &gt; ! h p / b b1 ~ *</code>
            </td>
            <td>Ekler: palm mute, vurgu, çınlasın, hammer-on, pull-off, slide, bend (tam/yarım), vibrato, armonik. Ör. <code>6:0m&gt;</code>, <code>3:7b2~</code></td>
          </tr>
          <tr>
            <td>
              <code>r</code> <code>_</code> <code>|</code>
            </td>
            <td>Es (sus), bağ (önceki sesi uzat), ölçü çizgisi.</td>
          </tr>
          <tr>
            <td>
              <code>( ... )x4</code>
            </td>
            <td>Tekrar grubu. Ör. <code>(e 6:0m)x8</code></td>
          </tr>
          <tr>
            <td>
              <code>"Em"</code> <code># not</code>
            </td>
            <td>Sonraki olayın üstüne etiket; # ile satır sonuna kadar yorum.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
