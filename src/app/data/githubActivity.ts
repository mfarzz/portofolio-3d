import { profile } from './portfolio';

export type ContributionDay = { date: string; count: number; level: number };
export const githubUsername = new URL(profile.github).pathname.split('/').filter(Boolean)[0];
const endpoint = 'https://github-contributions-api.jogruber.de/v4/' + encodeURIComponent(githubUsername) + '?y=last';
const cacheKey = 'github-activity-v1-' + githubUsername;
let memory: { saved: number; days: ContributionDay[] } | undefined;
let pending: Promise<ContributionDay[]> | undefined;
let failure: unknown;
const timestamp = (day: ContributionDay) => new Date(day.date + 'T00:00:00Z').getTime();

function readDays(value: unknown): ContributionDay[] {
  if (!Array.isArray(value) || !value.length || value.length > 400) throw new Error('Invalid calendar');
  const days = value.map((day: ContributionDay) => {
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isFinite(timestamp(day)) || !Number.isInteger(day.count) || day.count < 0 || !Number.isInteger(day.level) || day.level < 0 || day.level > 4) throw new Error('Invalid day');
    return { date: day.date, count: day.count, level: day.level };
  }).sort((a, b) => a.date.localeCompare(b.date));
  for (let index = 1; index < days.length; index++) if (timestamp(days[index]) - timestamp(days[index - 1]) !== 86_400_000) throw new Error('Incomplete calendar');
  return days;
}

/** Intro and calendar share one request, validated memory data, and an hour-long session cache. */
export function loadGitHubActivity(retry = false): Promise<ContributionDay[]> {
  if (pending) return pending;
  if (!retry) {
    if (memory && Date.now() - memory.saved < 3_600_000) return Promise.resolve(memory.days);
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now() - cached.saved < 3_600_000) {
        memory = { saved: cached.saved, days: readDays(cached.days) }; return Promise.resolve(memory.days);
      }
    } catch { /* Storage is optional. */ }
    if (failure) return Promise.reject(failure);
  }
  failure = undefined;
  pending = (async () => {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error('Calendar unavailable');
    const data = await response.json();
    const days = readDays(data.contributions);
    memory = { saved: Date.now(), days };
    try { sessionStorage.setItem(cacheKey, JSON.stringify(memory)); } catch { /* Private browsing may disable storage. */ }
    return days;
  })().catch(error => { failure = error; throw error; }).finally(() => { pending = undefined; });
  return pending;
}
