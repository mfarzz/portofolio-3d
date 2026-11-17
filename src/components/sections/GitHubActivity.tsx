import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { profile } from '../../app/data/portfolio';
import { githubUsername as username, loadGitHubActivity, type ContributionDay as Day } from '../../app/data/githubActivity';

const dateFormat = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const monthFormat = new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'UTC' });
const asDate = (day: Day) => new Date(day.date + 'T00:00:00Z');
const describe = (day: Day) => day.count.toLocaleString('id-ID') + ' kontribusi · ' + dateFormat.format(asDate(day));

export function GitHubActivity() {
  const root = useRef<HTMLElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let stopped = false;
    let started = false;
    const show = (value: Day[]) => {
      if (stopped) return;
      setDays(value);
      let latestActive = 0;
      value.forEach((day, index) => { if (day.count > 0) latestActive = index; });
      setSelected(latestActive);
      setState('ready');
    };
    const load = async () => {
      if (started) return;
      started = true;
      setState('loading');
      try {
        const value = await loadGitHubActivity(attempt > 0);
        show(value);
      } catch { if (!stopped) setState('error'); }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); void load(); }
    }, { rootMargin: '300px' });
    if (root.current) observer.observe(root.current);
    return () => { stopped = true; observer.disconnect(); };
  }, [attempt]);

  useEffect(() => { if (state === 'ready' && scroll.current) scroll.current.scrollLeft = scroll.current.scrollWidth; }, [state]);

  const calendar = useMemo(() => {
    if (!days.length) return { cells: [] as Array<Day | null>, months: [] as Array<{ label: string; column: number }>, weeks: 0 };
    const offset = asDate(days[0]).getUTCDay();
    const cells: Array<Day | null> = [...Array<null>(offset).fill(null), ...days];
    const weeks = Math.ceil(cells.length / 7);
    while (cells.length < weeks * 7) cells.push(null);
    const months: Array<{ label: string; column: number }> = [];
    let previous = '';
    for (let week = 0; week < weeks; week++) {
      const first = cells.slice(week * 7, week * 7 + 7).find(Boolean);
      if (!first) continue;
      const month = first.date.slice(0, 7);
      if (month !== previous) { months.push({ label: monthFormat.format(asDate(first)), column: week + 1 }); previous = month; }
    }
    return { cells, months, weeks };
  }, [days]);

  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const moves: Record<string, number> = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 };
    let next = index;
    if (event.key in moves) next += moves[event.key];
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = days.length - 1;
    else return;
    event.preventDefault();
    next = Math.max(0, Math.min(days.length - 1, next));
    setSelected(next);
    buttons.current[next]?.focus({ preventScroll: true });
    buttons.current[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  };
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const offset = days.length ? asDate(days[0]).getUTCDay() : 0;

  return <section ref={root} id="github-activity" className="github-activity" aria-labelledby="github-activity-title" data-state={state}>
    <div className="github-activity-heading"><div><p>GITHUB / DAILY ACTIVITY</p><h3 id="github-activity-title">BUILDING, DAILY<span>.</span></h3></div><a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label={'Lihat profil GitHub ' + username}>@{username}<ArrowUpRight size={18} aria-hidden="true" /></a></div>
    <div className="github-calendar-body" aria-busy={state === 'loading'}>
      {state === 'loading' && <p className="github-calendar-message" role="status">Memuat aktivitas GitHub…</p>}
      {state === 'error' && <div className="github-calendar-message" role="status"><p>Aktivitas belum dapat dimuat.</p><button onClick={() => setAttempt(value => value + 1)}>Coba lagi ↗</button></div>}
      {state === 'ready' && <>
        <p className="github-calendar-total"><strong>{total.toLocaleString('id-ID')}</strong> kontribusi dalam 12 bulan terakhir</p>
        <div ref={scroll} className="github-calendar-scroll" role="region" aria-label="Kalender kontribusi harian GitHub; geser untuk melihat bulan lainnya">
          <div className="github-calendar-layout" style={{ '--weeks': calendar.weeks } as CSSProperties}>
            <div className="github-calendar-months" aria-hidden="true">{calendar.months.map((month, index) => <span key={index} style={{ gridColumn: month.column }}>{month.label}</span>)}</div>
            <div className="github-calendar-weekdays" aria-hidden="true"><span>Sen</span><span>Rab</span><span>Jum</span></div>
            <div className="github-calendar-grid" role="group" aria-label="Pilih hari; gunakan tombol panah untuk berpindah tanggal">
              {calendar.cells.map((day, cell) => day ? <button key={day.date} ref={element => { buttons.current[cell - offset] = element; }} className="github-day" data-level={day.level} data-date={day.date} data-count={day.count} aria-label={describe(day)} title={describe(day)} aria-pressed={selected === cell - offset} tabIndex={selected === cell - offset ? 0 : -1} onFocus={() => setSelected(cell - offset)} onPointerEnter={() => setSelected(cell - offset)} onClick={() => setSelected(cell - offset)} onKeyDown={event => navigate(event, cell - offset)} /> : <span key={'blank-' + cell} className="github-day-empty" aria-hidden="true" />)}
            </div>
          </div>
        </div>
        <div className="github-calendar-footer"><p aria-live="polite" aria-atomic="true">{days[selected] ? describe(days[selected]) : ''}</p><div className="github-calendar-legend" aria-label="Intensitas kontribusi dari sedikit hingga banyak"><span>Sedikit</span>{[0, 1, 2, 3, 4].map(level => <i key={level} data-level={level} aria-hidden="true" />)}<span>Banyak</span></div></div>
      </>}
    </div>
  </section>;
}
