import React from 'react';
import ThemeToggle from '../components/ThemeToggle';
import {useTheme} from '../theme/useTheme';

export default function Dashboard () {
  const {theme} = useTheme ();
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
    >

      <header
        className={`sticky top-0 z-10 backdrop-blur border-b ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'}`}
      >
        <div className="w-full px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
            >
              AI
            </div>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight">
              IELTS Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full max-w-sm">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search…"
                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isDark ? 'bg-white/5 border border-white/10 placeholder-white/40 focus:ring-white/20' : 'bg-black/5 border border-black/10 placeholder-black/40 focus:ring-black/20'}`}
              />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {/* Content */}
      <main className="w-full px-4 md:px-6 py-6 md:py-10">
        {/* Overview row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard label="Overall Band (est.)" value="6.5" theme={theme} />
          <StatCard label="Completed Tests" value="12" theme={theme} />
          <StatCard label="Weekly Streak" value="4 days" theme={theme} />
          <StatCard label="Accuracy" value="82%" theme={theme} />
        </section>

        {/* Skills + Upcoming */}
        <section className="mt-6 md:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Panel title="Skill Progress" theme={theme}>
              <div className="space-y-4">
                <ProgressRow label="Listening" value={72} theme={theme} />
                <ProgressRow label="Reading" value={64} theme={theme} />
                <ProgressRow label="Writing" value={58} theme={theme} />
                <ProgressRow label="Speaking" value={70} theme={theme} />
              </div>
            </Panel>

            <Panel title="AI Insights" theme={theme}>
              <ul
                className={`space-y-3 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}
              >
                <li className="flex items-start gap-3">
                  <Dot theme={theme} />
                  Focus on Writing Task 2: your coherence is strong, but lexical range dips in body paragraph 2.
                </li>
                <li className="flex items-start gap-3">
                  <Dot theme={theme} />
                  Listening: you miss numbers/dates in multi‑choice—practice note‑taking with timestamps.
                </li>
                <li className="flex items-start gap-3">
                  <Dot theme={theme} />
                  Reading: improve skimming speed; try 10‑minute timed passages daily.
                </li>
              </ul>
            </Panel>
          </div>

          <div className="space-y-4 md:space-y-6">
            <Panel title="Upcoming" theme={theme}>
              <ul
                className={`${theme === 'dark' ? 'divide-white/5' : 'divide-black/5'} divide-y`}
              >
                <UpcomingItem
                  title="Full Mock Test"
                  time="Aug 18, 10:00"
                  note="Auto‑proctored"
                  theme={theme}
                />
                <UpcomingItem
                  title="Speaking Practice"
                  time="Aug 19, 18:30"
                  note="Cue cards set B"
                  theme={theme}
                />
                <UpcomingItem
                  title="Review Session"
                  time="Aug 21, 09:00"
                  note="Reading mistakes"
                  theme={theme}
                />
              </ul>
            </Panel>

            <Panel title="Quick Actions" theme={theme}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MonoButton theme={theme}>Start Full Test</MonoButton>
                <MonoButton theme={theme} variant="ghost">
                  Review Mistakes
                </MonoButton>
                <MonoButton theme={theme}>Listening Drill</MonoButton>
                <MonoButton theme={theme} variant="ghost">
                  Get AI Tips
                </MonoButton>
              </div>
            </Panel>

          </div>
        </section>
      </main>
    </div>
  );
}

function Panel({title, children, theme}) {
  return (
    <div
      className={`rounded-2xl border p-4 md:p-6 shadow-sm ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.03]'}`}
    >
      <div className="mb-4 md:mb-5 flex items-center justify-between">
        <h2 className="text-base md:text-lg font-medium tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function StatCard({label, value, theme}) {
  return (
    <div
      className={`rounded-2xl border p-4 md:p-6 ${theme === 'dark' ? 'border-white/10 bg-white/[0.03]' : 'border-black/10 bg-black/[0.03]'}`}
    >
      <div
        className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}
      >
        {label}
      </div>
      <div className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function ProgressRow({label, value, theme}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className={theme === 'dark' ? 'text-white/80' : 'text-black/80'}>
          {label}
        </span>
        <span className={theme === 'dark' ? 'text-white/60' : 'text-black/60'}>
          {value}%
        </span>
      </div>
      <div
        className={`h-2.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`}
      >
        <div
          className={`h-full rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
          style={{width: `${value}%`}}
        />
      </div>
    </div>
  );
}

function UpcomingItem({title, time, note, theme}) {
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div
            className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}
          >
            {note}
          </div>
        </div>
        <div
          className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}
        >
          {time}
        </div>
      </div>
    </li>
  );
}

function MonoButton({children, variant = 'solid', theme}) {
  const base = 'w-full rounded-xl px-4 py-2 text-sm transition border';
  const solid = theme === 'dark'
    ? 'bg-white text-black border-white hover:bg-white/90'
    : 'bg-black text-white border-black hover:bg-black/90';
  const ghost = theme === 'dark'
    ? 'bg-transparent text-white border-white/20 hover:border-white/40 hover:bg-white/5'
    : 'bg-transparent text-black border-black/20 hover:border-black/40 hover:bg-black/5';
  const cls = `${base} ${variant === 'ghost' ? ghost : solid}`;
  return <button className={cls}>{children}</button>;
}

function Dot({theme}) {
  return (
    <span
      className={`mt-1 h-2 w-2 rounded-full inline-block ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}
    />
  );
}
