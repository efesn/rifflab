import { useCallback, useEffect, useRef, useState } from 'react';
import { Gamepad2, Play, RotateCcw, Volume2, Mic, MicOff, Trophy, Ear, Target, Timer } from 'lucide-react';
import { Fretboard, type FretMark } from '../components/Fretboard';
import { Segmented, Switch, toast } from '../components/ui';
import { useSettings } from '../store/settings';
import { useProgress } from '../store/progress';
import { TUNINGS } from '../data/tunings';
import { pluckNow, strumNow } from '../audio/guitar';
import { engine } from '../audio/engine';
import { MicInput, OnsetDetector } from '../audio/mic';
import { createTicker } from '../audio/ticker';
import { freqToMidi, mod12, pcName, INTERVAL_NAMES } from '../lib/music';
import './games.css';

type GameId = 'note-hunt' | 'intervals' | 'chords';

export function GamesPage() {
  const [game, setGame] = useState<GameId>('note-hunt');
  const games = useProgress((s) => s.games);
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Gamepad2 size={14} /> Oyunlar
          </div>
          <h1>Kulak & Klavye</h1>
          <p className="subtitle">Klavyedeki notaları ezberle ve kulağını eğit. Kısa, eğlenceli turlar — her gün bir tur oyna, rekorunu kır.</p>
        </div>
      </div>
      <div className="game-tabs">
        {(
          [
            { id: 'note-hunt', icon: Target, title: 'Nota Avı', desc: 'Klavyede notayı bul' },
            { id: 'intervals', icon: Ear, title: 'Aralık Kulağı', desc: 'İki nota arası mesafe' },
            { id: 'chords', icon: Volume2, title: 'Akor Kulağı', desc: 'Majör, minör, power…' },
          ] as const
        ).map((g) => (
          <button key={g.id} className={`game-tab${game === g.id ? ' active' : ''}`} onClick={() => setGame(g.id)}>
            <g.icon size={22} />
            <div>
              <div className="game-tab-title">{g.title}</div>
              <div className="small muted">{g.desc}</div>
            </div>
            {games[g.id]?.best ? (
              <span className="tag accent">
                <Trophy size={12} /> {games[g.id].best}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {game === 'note-hunt' && <NoteHunt />}
      {game === 'intervals' && <IntervalGame />}
      {game === 'chords' && <ChordGame />}
    </div>
  );
}

/* ---------------- Nota Avı ---------------- */

const huntMic = new MicInput();

function NoteHunt() {
  const naming = useSettings((s) => s.naming);
  const leftHanded = useSettings((s) => s.leftHanded);
  const deviceId = useSettings((s) => s.micDeviceId);
  const recordGame = useProgress((s) => s.recordGame);
  const best = useProgress((s) => s.games['note-hunt']?.best ?? 0);
  const tuning = TUNINGS.standard.notes;
  const [scope, setScope] = useState<'low' | 'all' | 'one'>('low');
  const [oneString, setOneString] = useState(6);
  const [maxFret, setMaxFret] = useState(12);
  const [naturalsOnly, setNaturalsOnly] = useState(true);
  const [useMic, setUseMic] = useState(false);
  const [state, setState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [target, setTarget] = useState<{ pc: number; string: number | null }>({ pc: 4, string: 6 });
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [marks, setMarks] = useState<FretMark[]>([]);
  const endAt = useRef(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  const strings = scope === 'low' ? [6, 5] : scope === 'one' ? [oneString] : [1, 2, 3, 4, 5, 6];
  const NATURAL = [0, 2, 4, 5, 7, 9, 11];

  const newTarget = useCallback(() => {
    const pool = naturalsOnly ? NATURAL : Array.from({ length: 12 }, (_, i) => i);
    let pc = pool[Math.floor(Math.random() * pool.length)];
    if (pc === targetRef.current.pc) pc = pool[(pool.indexOf(pc) + 1) % pool.length];
    const s = scope === 'all' ? null : strings[Math.floor(Math.random() * strings.length)];
    setTarget({ pc, string: s });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalsOnly, scope, oneString]);

  const start = async () => {
    await engine.resume();
    setScore(0);
    setMisses(0);
    setMarks([]);
    setTimeLeft(60);
    endAt.current = Date.now() + 60000;
    newTarget();
    runningRef.current = true;
    setState('playing');
    if (useMic) {
      try {
        await huntMic.start(deviceId || undefined);
      } catch {
        toast('Mikrofon başlatılamadı; tıklayarak oynayabilirsin.');
        setUseMic(false);
      }
    }
  };

  const scoreRef = useRef(0);
  scoreRef.current = score;
  const runningRef = useRef(false);
  const finish = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    setState('over');
    huntMic.stop();
    recordGame('note-hunt', scoreRef.current);
  }, [recordGame]);

  useEffect(() => {
    if (state !== 'playing') return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) finish();
    }, 200);
    return () => window.clearInterval(id);
  }, [state, finish]);

  useEffect(() => () => huntMic.stop(), []);

  const answer = useCallback(
    (pc: number, s: number | null, fret: number | null) => {
      const t = targetRef.current;
      const okString = t.string === null || s === null || s === t.string;
      if (mod12(pc) === t.pc && okString) {
        setScore((x) => x + 1);
        if (s !== null && fret !== null) setMarks([{ string: s, fret, kind: 'correct', label: pcName(pc, naming) }]);
        newTarget();
      } else {
        setMisses((x) => x + 1);
        const correct: FretMark[] = [];
        const ss = t.string ? [t.string] : strings;
        ss.forEach((st) => {
          for (let f = 0; f <= maxFret; f++) if (mod12(tuning[6 - st] + f) === t.pc) correct.push({ string: st, fret: f, kind: 'target', label: pcName(t.pc, naming) });
        });
        if (s !== null && fret !== null) correct.push({ string: s, fret, kind: 'wrong', label: pcName(pc, naming) });
        setMarks(correct);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [naming, newTarget, maxFret, scope, oneString],
  );

  // Mikrofon modu
  useEffect(() => {
    if (state !== 'playing' || !useMic) return;
    const det = new OnsetDetector(1.8, 0.15);
    let armed = -1;
    const loop = () => {
      const t = performance.now() / 1000;
      const f = huntMic.read();
      if (det.feed(t, f.recent, huntMic.gate)) armed = t;
      if (armed > 0 && f.pitch && f.pitch.clarity > 0.8 && t - armed > 0.05) {
        answer(Math.round(freqToMidi(f.pitch.freq)), null, null);
        armed = -1;
      } else if (armed > 0 && t - armed > 0.5) armed = -1;
    };
    const ticker = createTicker(16, loop);
    return () => ticker.stop();
  }, [state, useMic, answer]);

  const onFret = (s: number, f: number) => {
    const midi = tuning[6 - s] + f;
    pluckNow(midi, { duration: 0.8, art: 'normal' });
    if (state !== 'playing' || f > maxFret) return;
    answer(midi, s, f);
  };

  return (
    <div className="card stack">
      {state !== 'playing' && (
        <div className="grid grid-2">
          <div className="field">
            <label>Teller</label>
            <Segmented
              value={scope}
              onChange={setScope}
              options={[
                { value: 'low', label: '6. ve 5. tel' },
                { value: 'one', label: 'Tek tel' },
                { value: 'all', label: 'Tüm teller' },
              ]}
            />
            {scope === 'one' && (
              <Segmented value={oneString} onChange={setOneString} options={[6, 5, 4, 3, 2, 1].map((s) => ({ value: s, label: `${s}. tel` }))} />
            )}
          </div>
          <div className="field">
            <label>Perde aralığı</label>
            <Segmented
              value={maxFret}
              onChange={setMaxFret}
              options={[
                { value: 5, label: '0–5' },
                { value: 12, label: '0–12' },
              ]}
            />
            <Switch checked={naturalsOnly} onChange={setNaturalsOnly} label="Sadece doğal notalar (diyezsiz)" />
            <Switch checked={useMic} onChange={setUseMic} label="Gitarımla çalarak cevap ver (mikrofon)" />
          </div>
        </div>
      )}

      <div className="hunt-head">
        {state === 'playing' ? (
          <>
            <div className="hunt-prompt">
              <span className="muted small">Bul:</span>
              <span className="hunt-note">{pcName(target.pc, naming)}</span>
              <span className="text-2">{target.string ? `${target.string}. telde` : 'herhangi bir telde'}</span>
              {useMic && (
                <span className="tag info">
                  <Mic size={12} /> gitarınla çal
                </span>
              )}
            </div>
            <div className="hunt-stats">
              <span className="hunt-score">{score}</span>
              <span className="muted small">doğru · {misses} hata</span>
              <span className={`hunt-time mono${timeLeft <= 10 ? ' ending' : ''}`}>
                <Timer size={16} /> {timeLeft}
              </span>
            </div>
          </>
        ) : (
          <div className="hunt-prompt">
            {state === 'over' ? (
              <>
                <Trophy size={28} className="accent" />
                <span className="hunt-note">{score}</span>
                <span className="text-2">doğru · {misses} hata · rekor {Math.max(best, score)}</span>
              </>
            ) : (
              <span className="text-2">60 saniyede kaç notayı bulabilirsin? Rekorun: {best}</span>
            )}
          </div>
        )}
        <div className="row">
          {state === 'playing' ? (
            <>
              {useMic && (
                <button className="btn" onClick={() => setUseMic(false)}>
                  <MicOff size={16} /> Mikrofonu kapat
                </button>
              )}
              <button className="btn" onClick={finish}>
                Bitir
              </button>
            </>
          ) : (
            <button className="btn primary" onClick={() => void start()}>
              {state === 'over' ? <RotateCcw size={16} /> : <Play size={16} />} {state === 'over' ? 'Tekrar oyna' : 'Başla'}
            </button>
          )}
        </div>
      </div>

      <Fretboard tuning={tuning} frets={maxFret === 5 ? 7 : 12} marks={marks} naming={naming} leftHanded={leftHanded} onFretClick={onFret} />
      <p className="small muted">İpucu: 6. ve 5. teldeki notaları ezberlemek, power chord köklerini anında bulmanı sağlar. 12. perdeden sonra notalar tekrar eder.</p>
    </div>
  );
}

/* ---------------- Aralık Kulağı ---------------- */

const EASY = [3, 4, 5, 7, 12];
const HARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function useQuiz(total: number, gameId: string) {
  const recordGame = useProgress((s) => s.recordGame);
  const [q, setQ] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [done, setDone] = useState(false);
  const next = (ok: boolean, text: string) => {
    setFeedback({ ok, text });
    const c = correct + (ok ? 1 : 0);
    setCorrect(c);
    if (q + 1 >= total) {
      setDone(true);
      recordGame(gameId, c);
    } else setQ(q + 1);
  };
  const reset = () => {
    setQ(0);
    setCorrect(0);
    setFeedback(null);
    setDone(false);
  };
  return { q, correct, feedback, done, next, reset };
}

function IntervalGame() {
  const [level, setLevel] = useState<'easy' | 'hard'>('easy');
  const [mode, setMode] = useState<'up' | 'harm'>('up');
  const quiz = useQuiz(10, 'intervals');
  const best = useProgress((s) => s.games.intervals?.best ?? 0);
  const [question, setQuestion] = useState<{ root: number; iv: number } | null>(null);
  const pool = level === 'easy' ? EASY : HARD;

  const play = async (qq = question) => {
    if (!qq) return;
    await engine.resume();
    if (mode === 'up') {
      pluckNow(qq.root, { duration: 0.9 });
      pluckNow(qq.root + qq.iv, { delay: 0.75, duration: 1.2 });
    } else strumNow([qq.root, qq.root + qq.iv], { spread: 0.01, duration: 1.6 });
  };

  const newQuestion = async () => {
    const qq = { root: 45 + Math.floor(Math.random() * 12), iv: pool[Math.floor(Math.random() * pool.length)] };
    setQuestion(qq);
    await play(qq);
  };

  const start = async () => {
    quiz.reset();
    await newQuestion();
  };

  const choose = async (iv: number) => {
    if (!question) return;
    const ok = iv === question.iv;
    quiz.next(ok, ok ? `Doğru: ${INTERVAL_NAMES[question.iv].name}` : `Yanlış — doğrusu ${INTERVAL_NAMES[question.iv].name}`);
    if (quiz.q + 1 < 10) window.setTimeout(() => void newQuestion(), 900);
  };

  return (
    <div className="card stack">
      <div className="row">
        <Segmented
          value={level}
          onChange={(v) => {
            setLevel(v);
            quiz.reset();
            setQuestion(null);
          }}
          options={[
            { value: 'easy', label: 'Kolay (5 aralık)' },
            { value: 'hard', label: 'Zor (12 aralık)' },
          ]}
        />
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'up', label: 'Sırayla' },
            { value: 'harm', label: 'Birlikte' },
          ]}
        />
        <span className="spacer" />
        <span className="small muted">Rekor: {best}/10</span>
      </div>
      {!question || quiz.done ? (
        <div className="quiz-start">
          {quiz.done && (
            <div className="quiz-result">
              <Trophy size={30} className="accent" /> {quiz.correct}/10 doğru
            </div>
          )}
          <p className="text-2">İki nota duyacaksın. Aralarındaki mesafeyi (aralığı) seç. Tam beşli = power chord'un sesi!</p>
          <button className="btn primary" onClick={() => void start()}>
            <Play size={16} /> {quiz.done ? 'Tekrar' : 'Başla'}
          </button>
        </div>
      ) : (
        <>
          <div className="row">
            <span className="tag">Soru {quiz.q + 1}/10</span>
            <span className="tag ok">{quiz.correct} doğru</span>
            <button className="btn sm" onClick={() => void play()}>
              <Volume2 size={14} /> Tekrar dinle
            </button>
          </div>
          <div className="quiz-options">
            {pool.map((iv) => (
              <button key={iv} className="btn" onClick={() => void choose(iv)}>
                <b>{INTERVAL_NAMES[iv].short}</b> {INTERVAL_NAMES[iv].name}
              </button>
            ))}
          </div>
        </>
      )}
      {quiz.feedback && <div className={`quiz-feedback ${quiz.feedback.ok ? 'ok' : 'bad'}`}>{quiz.feedback.text}</div>}
    </div>
  );
}

/* ---------------- Akor Kulağı ---------------- */

const QUALITIES = [
  { id: 'maj', name: 'Majör', desc: 'mutlu, aydınlık', iv: [0, 4, 7, 12] },
  { id: 'min', name: 'Minör', desc: 'hüzünlü, karanlık', iv: [0, 3, 7, 12] },
  { id: 'pow', name: 'Power (5)', desc: 'nötr, güçlü', iv: [0, 7, 12] },
  { id: 'dom7', name: 'Dominant 7', desc: 'bluesy, gerilimli', iv: [0, 4, 7, 10] },
] as const;

function ChordGame() {
  const quiz = useQuiz(10, 'chords');
  const best = useProgress((s) => s.games.chords?.best ?? 0);
  const [question, setQuestion] = useState<{ root: number; q: number } | null>(null);

  const play = async (qq = question) => {
    if (!qq) return;
    await engine.resume();
    strumNow(QUALITIES[qq.q].iv.map((i) => qq.root + i), { spread: 0.03, duration: 2 });
  };
  const newQuestion = async () => {
    const qq = { root: 40 + Math.floor(Math.random() * 10), q: Math.floor(Math.random() * QUALITIES.length) };
    setQuestion(qq);
    await play(qq);
  };
  const choose = (i: number) => {
    if (!question) return;
    const ok = i === question.q;
    quiz.next(ok, ok ? `Doğru: ${QUALITIES[question.q].name}` : `Yanlış — doğrusu ${QUALITIES[question.q].name}`);
    if (quiz.q + 1 < 10) window.setTimeout(() => void newQuestion(), 900);
  };

  return (
    <div className="card stack">
      <div className="row">
        <span className="text-2">Akorun türünü tahmin et.</span>
        <span className="spacer" />
        <span className="small muted">Rekor: {best}/10</span>
      </div>
      {!question || quiz.done ? (
        <div className="quiz-start">
          {quiz.done && (
            <div className="quiz-result">
              <Trophy size={30} className="accent" /> {quiz.correct}/10 doğru
            </div>
          )}
          <div className="quiz-options">
            {QUALITIES.map((q) => (
              <button
                key={q.id}
                className="btn"
                onClick={async () => {
                  await engine.resume();
                  strumNow(q.iv.map((i) => 45 + i), { spread: 0.03 });
                }}
              >
                <Volume2 size={14} /> {q.name} <span className="muted small">({q.desc})</span>
              </button>
            ))}
          </div>
          <p className="small muted">Önce dört türü dinleyerek tanış, sonra başla.</p>
          <button
            className="btn primary"
            onClick={() => {
              quiz.reset();
              void newQuestion();
            }}
          >
            <Play size={16} /> {quiz.done ? 'Tekrar' : 'Başla'}
          </button>
        </div>
      ) : (
        <>
          <div className="row">
            <span className="tag">Soru {quiz.q + 1}/10</span>
            <span className="tag ok">{quiz.correct} doğru</span>
            <button className="btn sm" onClick={() => void play()}>
              <Volume2 size={14} /> Tekrar dinle
            </button>
          </div>
          <div className="quiz-options">
            {QUALITIES.map((q, i) => (
              <button key={q.id} className="btn" onClick={() => choose(i)}>
                <b>{q.name}</b> <span className="muted small">{q.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {quiz.feedback && <div className={`quiz-feedback ${quiz.feedback.ok ? 'ok' : 'bad'}`}>{quiz.feedback.text}</div>}
    </div>
  );
}
