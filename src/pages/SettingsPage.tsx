import { useEffect, useRef, useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash, Mic, MonitorDown, Keyboard } from 'lucide-react';
import { DEFAULT_SETTINGS, useSettings } from '../store/settings';
import { useProgress } from '../store/progress';
import { useTimer } from '../store/timer';
import { useRoutine } from '../store/routine';
import { MicInput } from '../audio/mic';
import { TONE_LABELS, type ToneId } from '../audio/amp';
import { CLICK_LABELS, type ClickSound } from '../audio/clicks';
import { engine } from '../audio/engine';
import { pluckNow } from '../audio/guitar';
import { Segmented, Slider, Switch, toast } from '../components/ui';
import './progress.css';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

let deferredInstall: InstallPromptEvent | null = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e as InstallPromptEvent;
});

export function SettingsPage() {
  const s = useSettings();
  const progress = useProgress();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [canInstall, setCanInstall] = useState(!!deferredInstall);

  useEffect(() => {
    MicInput.listInputs()
      .then(setDevices)
      .catch(() => {});
    const on = () => setCanInstall(true);
    window.addEventListener('beforeinstallprompt', on);
    return () => window.removeEventListener('beforeinstallprompt', on);
  }, []);

  const exportData = () => {
    const { sessions, riffs, lessons, custom, games } = useProgress.getState();
    const { set: _omit, ...settings } = useSettings.getState();
    void _omit;
    const blob = new Blob([JSON.stringify({ app: 'rifflab', version: 1, exportedAt: new Date().toISOString(), settings, progress: { sessions, riffs, lessons, custom, games } }, null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rifflab-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Yedek dosyası indirildi.');
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (data?.app !== 'rifflab' || !data.progress) throw new Error('format');
      if (!window.confirm('Mevcut ilerlemenin yerine yedekteki veriler yüklensin mi?')) return;
      progress.importData(data.progress);
      if (data.settings) s.set({ ...DEFAULT_SETTINGS, ...data.settings });
      toast('Yedek yüklendi.');
    } catch {
      toast('Bu dosya geçerli bir RiffLab yedeği değil.');
    }
  };

  const resetAll = () => {
    if (!window.confirm('Tüm pratik geçmişi, riff ilerlemesi, ders durumları ve kendi tabların silinecek. Emin misin?')) return;
    progress.reset();
    useTimer.getState().discard();
    useRoutine.getState().reset();
    toast('İlerleme sıfırlandı.');
  };

  const askMic = async () => {
    const m = new MicInput();
    try {
      await m.start();
      m.stop();
      setDevices(await MicInput.listInputs());
      toast('Mikrofon izni verildi.');
    } catch {
      toast('Mikrofon izni alınamadı.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <SettingsIcon size={14} /> Tercihler
          </div>
          <h1>Ayarlar</h1>
          <p className="subtitle">Tüm veriler yalnızca bu tarayıcıda saklanır. Cihaz değiştirirken yedek alıp diğer cihaza yükleyebilirsin.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-title">Genel</div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Adın</b>
              <span>Panelde selamlamak için.</span>
            </div>
            <div className="setting-control">
              <input className="input" value={s.name} maxLength={24} onChange={(e) => s.set({ name: e.target.value })} placeholder="Adın" />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Günlük hedef</b>
              <span>Panelde ve grafiklerde gösterilir.</span>
            </div>
            <div className="setting-control">
              <Segmented value={s.dailyGoal} onChange={(v) => s.set({ dailyGoal: v })} options={[10, 20, 30, 45, 60].map((m) => ({ value: m, label: `${m}` }))} />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Nota adları</b>
              <span>Harf sistemi (C D E) ya da solfej (Do Re Mi).</span>
            </div>
            <div className="setting-control">
              <Segmented
                value={s.naming}
                onChange={(v) => s.set({ naming: v })}
                options={[
                  { value: 'letter', label: 'C D E' },
                  { value: 'solfege', label: 'Do Re Mi' },
                ]}
              />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Solak klavye</b>
              <span>Klavye diyagramlarını ayna görüntüsü olarak çizer.</span>
            </div>
            <div className="setting-control">
              <Switch checked={s.leftHanded} onChange={(v) => s.set({ leftHanded: v })} />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Ritim gösterimi</b>
              <span>Tabların altında nota süreleri (sap ve kirişler).</span>
            </div>
            <div className="setting-control">
              <Switch checked={s.showRhythm} onChange={(v) => s.set({ showRhythm: v })} />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Tab boyutu</b>
              <span>Vuruş başına genişlik: {s.tabZoom} px</span>
            </div>
            <div className="setting-control">
              <Slider value={s.tabZoom} min={34} max={90} step={2} onChange={(v) => s.set({ tabZoom: v })} ariaLabel="Tab boyutu" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Ses</div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Ana ses</b>
              <span>%{Math.round(s.volume * 100)}</span>
            </div>
            <div className="setting-control">
              <Slider value={s.volume} min={0} max={1} step={0.01} onChange={(v) => s.set({ volume: v })} ariaLabel="Ana ses" />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Gitar tonu</b>
              <span>Amfi simülasyonu. Riffler kendi önerdikleri tonu seçebilir.</span>
            </div>
            <div className="setting-control">
              <Segmented value={s.tone} onChange={(v) => s.set({ tone: v })} options={(['clean', 'crunch', 'distortion'] as ToneId[]).map((t) => ({ value: t, label: TONE_LABELS[t] }))} />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Tonu dene</b>
              <span>Seçili tonla bir E5 power chord çalar.</span>
            </div>
            <div className="setting-control">
              <button
                className="btn"
                onClick={async () => {
                  await engine.resume();
                  [40, 47, 52].forEach((m, i) => pluckNow(m, { delay: i * 0.008, duration: 1.8 }));
                }}
              >
                Çal
              </button>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Metronom sesi</b>
            </div>
            <div className="setting-control">
              <select className="select" value={s.clickSound} onChange={(e) => s.set({ clickSound: e.target.value as ClickSound })}>
                {(Object.keys(CLICK_LABELS) as ClickSound[]).map((k) => (
                  <option key={k} value={k}>
                    {CLICK_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Referans La (A4)</b>
              <span>{s.a4} Hz — akort cihazı ve mikrofon takibi bu değeri kullanır.</span>
            </div>
            <div className="setting-control">
              <Slider value={s.a4} min={430} max={450} step={1} onChange={(v) => s.set({ a4: v })} ariaLabel="A4" />
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Ses girişi</b>
              <span>Gitarını ses kartıyla bağlıyorsan onu seç. Cihaz adlarını görmek için önce izin ver.</span>
            </div>
            <div className="setting-control">
              {devices.some((d) => d.label) ? (
                <select className="select" value={s.micDeviceId} onChange={(e) => s.set({ micDeviceId: e.target.value })}>
                  <option value="">Varsayılan</option>
                  {devices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Giriş ${i + 1}`}
                    </option>
                  ))}
                </select>
              ) : (
                <button className="btn" onClick={() => void askMic()}>
                  <Mic size={15} /> İzin ver
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Veri</div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Yedek al</b>
              <span>Ayarlar, pratik geçmişi, ilerleme ve kendi tabların tek bir JSON dosyasında.</span>
            </div>
            <div className="setting-control">
              <button className="btn" onClick={exportData}>
                <Download size={15} /> İndir
              </button>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>Yedeği yükle</b>
              <span>Daha önce aldığın yedeği geri yükler.</span>
            </div>
            <div className="setting-control">
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void importData(f);
                  e.target.value = '';
                }}
              />
              <button className="btn" onClick={() => fileRef.current?.click()}>
                <Upload size={15} /> Dosya seç
              </button>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-text">
              <b>İlerlemeyi sıfırla</b>
              <span>
                {progress.sessions.length} oturum, {Object.keys(progress.riffs).length} riff kaydı, {progress.custom.length} kendi tabın silinir.
              </span>
            </div>
            <div className="setting-control">
              <button className="btn danger" onClick={resetAll}>
                <Trash size={15} /> Sıfırla
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <Keyboard size={17} /> Kısayollar ve uygulama
          </div>
          <div className="shortcut-list mt-1">
            <span className="kbd">Boşluk</span>
            <span>Oynatıcı / metronom: çal-durdur</span>
            <span className="kbd">↑ ↓</span>
            <span>Tempo ±5 (Shift ile ±1; metronomda tersi)</span>
            <span className="kbd">L</span>
            <span>Döngüyü aç/kapat</span>
            <span className="kbd">M</span>
            <span>Oynatıcıda metronom</span>
            <span className="kbd">T</span>
            <span>Metronomda tap tempo</span>
            <span className="kbd">Shift + tık</span>
            <span>Tabda döngü aralığı seç</span>
          </div>
          <div className="divider" />
          <div className="setting-row">
            <div className="setting-text">
              <b>Masaüstü uygulaması olarak yükle</b>
              <span>Chrome/Edge'de RiffLab'i kendi penceresinde açılan bir uygulama olarak yükleyebilirsin; internet olmadan da çalışır.</span>
            </div>
            <div className="setting-control">
              <button
                className="btn"
                disabled={!canInstall}
                onClick={async () => {
                  if (!deferredInstall) return;
                  await deferredInstall.prompt();
                  deferredInstall = null;
                  setCanInstall(false);
                }}
                title={canInstall ? '' : 'Yükleme seçeneği tarayıcı menüsünde de bulunur (adres çubuğundaki yükle simgesi).'}
              >
                <MonitorDown size={15} /> Yükle
              </button>
            </div>
          </div>
          <p className="tiny muted" style={{ margin: 0 }}>
            RiffLab 1.0 · Ses sentezi: Karplus-Strong + amfi simülasyonu · Perde algılama: YIN algoritması
          </p>
        </div>
      </div>
    </div>
  );
}
