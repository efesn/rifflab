import { useEffect, useState, type ComponentType, type ReactElement } from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  GraduationCap,
  Flame,
  Grid3x3,
  Route,
  Gauge,
  Metronome,
  FileMusic,
  Gamepad2,
  ChartColumn,
  Settings as SettingsIcon,
  Menu,
  Volume2,
  VolumeX,
  Guitar,
} from 'lucide-react';
import { Link, matchPath, usePath } from './router';
import { PracticeTimer } from './components/PracticeTimer';
import { Slider, ToastHost } from './components/ui';
import { useSettings } from './store/settings';
import { Dashboard } from './pages/Dashboard';
import { TunerPage } from './pages/TunerPage';
import { MetronomePage } from './pages/MetronomePage';
import { LibraryPage } from './pages/LibraryPage';
import { RiffPage } from './pages/RiffPage';
import { LessonsPage } from './pages/LessonsPage';
import { LessonPage } from './pages/LessonPage';
import { ChordsPage } from './pages/ChordsPage';
import { ScalesPage } from './pages/ScalesPage';
import { RoutinePage } from './pages/RoutinePage';
import { StudioPage } from './pages/StudioPage';
import { GamesPage } from './pages/GamesPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import type { TuningId } from './data/tunings';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Başla',
    items: [
      { to: '/', label: 'Panel', icon: LayoutDashboard },
      { to: '/antrenman', label: 'Günlük Antrenman', icon: Dumbbell },
    ],
  },
  {
    group: 'Öğren',
    items: [
      { to: '/dersler', label: 'Dersler', icon: GraduationCap },
      { to: '/riffler', label: 'Riffler & Tablar', icon: Flame },
      { to: '/akorlar', label: 'Akorlar', icon: Grid3x3 },
      { to: '/gamlar', label: 'Gamlar & Klavye', icon: Route },
    ],
  },
  {
    group: 'Araçlar',
    items: [
      { to: '/akort', label: 'Akort Cihazı', icon: Gauge },
      { to: '/metronom', label: 'Metronom', icon: Metronome },
      { to: '/studyo', label: 'Tab Stüdyosu', icon: FileMusic },
      { to: '/oyunlar', label: 'Kulak & Klavye Oyunları', icon: Gamepad2 },
    ],
  },
  {
    group: 'Sen',
    items: [
      { to: '/ilerleme', label: 'İlerleme', icon: ChartColumn },
      { to: '/ayarlar', label: 'Ayarlar', icon: SettingsIcon },
    ],
  },
];

const ROUTES: { pattern: string; title: string; render: (p: Record<string, string>) => ReactElement }[] = [
  { pattern: '/', title: 'Panel', render: () => <Dashboard /> },
  { pattern: '/antrenman', title: 'Günlük Antrenman', render: () => <RoutinePage /> },
  { pattern: '/dersler', title: 'Dersler', render: () => <LessonsPage /> },
  { pattern: '/dersler/:id', title: 'Ders', render: (p) => <LessonPage id={p.id} /> },
  { pattern: '/riffler', title: 'Riffler & Tablar', render: () => <LibraryPage /> },
  { pattern: '/riffler/:id', title: 'Riff', render: (p) => <RiffPage id={p.id} /> },
  { pattern: '/akorlar', title: 'Akorlar', render: () => <ChordsPage /> },
  { pattern: '/gamlar', title: 'Gamlar & Klavye', render: () => <ScalesPage /> },
  { pattern: '/akort', title: 'Akort Cihazı', render: () => <TunerPage /> },
  { pattern: '/akort/:tuning', title: 'Akort Cihazı', render: (p) => <TunerPage initialTuning={p.tuning as TuningId} /> },
  { pattern: '/metronom', title: 'Metronom', render: () => <MetronomePage /> },
  { pattern: '/studyo', title: 'Tab Stüdyosu', render: () => <StudioPage /> },
  { pattern: '/studyo/:id', title: 'Tab Stüdyosu', render: (p) => <StudioPage editId={p.id} /> },
  { pattern: '/oyunlar', title: 'Oyunlar', render: () => <GamesPage /> },
  { pattern: '/ilerleme', title: 'İlerleme', render: () => <ProgressPage /> },
  { pattern: '/ayarlar', title: 'Ayarlar', render: () => <SettingsPage /> },
];

function isActive(to: string, path: string) {
  return to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`);
}

function VolumeControl() {
  const volume = useSettings((s) => s.volume);
  const set = useSettings((s) => s.set);
  return (
    <div className="volume-ctl" title="Ana ses seviyesi">
      <button className="btn ghost icon sm" onClick={() => set({ volume: volume > 0 ? 0 : 0.8 })} aria-label="Sesi aç/kapat">
        {volume > 0 ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </button>
      <Slider value={volume} min={0} max={1} step={0.01} onChange={(v) => set({ volume: v })} ariaLabel="Ses seviyesi" />
    </div>
  );
}

export default function App() {
  const path = usePath();
  const [menuOpen, setMenuOpen] = useState(false);

  let page: ReactElement = <NotFound />;
  let title = 'Bulunamadı';
  for (const r of ROUTES) {
    const params = matchPath(r.pattern, path);
    if (params) {
      page = r.render(params);
      title = r.title;
      break;
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    document.title = `${title} · RiffLab`;
  }, [title]);

  return (
    <div className="app">
      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <Link to="/" className="brand">
          <div className="brand-mark">
            <Guitar size={20} />
          </div>
          <div>
            <div className="brand-name">
              RIFF<span>LAB</span>
            </div>
            <div className="brand-sub">Elektro gitar stüdyosu</div>
          </div>
        </Link>
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="nav-group">{g.group}</div>
            {g.items.map((it) => (
              <Link key={it.to} to={it.to} className={`nav-link${isActive(it.to, path) ? ' active' : ''}`}>
                <it.icon size={18} />
                {it.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="sidebar-footer">Kulaklıkla çalışmak en iyisi. Mikrofon özellikleri yalnızca bu cihazda işlenir.</div>
      </aside>
      <div className={`backdrop${menuOpen ? ' show' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="btn ghost icon menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menüyü aç">
            <Menu size={20} />
          </button>
          <div className="topbar-title">{title}</div>
          <div className="topbar-spacer" />
          <PracticeTimer />
          <VolumeControl />
        </header>
        <main className="content" key={path}>
          {page}
        </main>
      </div>
      <ToastHost />
    </div>
  );
}

function NotFound() {
  return (
    <div className="empty">
      <h2>Sayfa bulunamadı</h2>
      <p>
        <Link to="/" className="accent">
          Panele dön
        </Link>
      </p>
    </div>
  );
}
