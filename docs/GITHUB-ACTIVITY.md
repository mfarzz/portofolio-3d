# GitHub daily activity

The About section includes a contribution calendar for the username derived from `profile.github` (currently `mfarzz`). It is implemented in `src/components/sections/GitHubActivity.tsx` and styled in `src/styles/github-activity.css`, without adding dependencies.

Data source: [GitHub Contributions API v4](https://github.com/grubersjoe/github-contributions-api), endpoint `https://github-contributions-api.jogruber.de/v4/mfarzz?y=last`. This is a third-party service that reads the public GitHub contribution calendar, not a direct authenticated GitHub API integration. No token is embedded in the frontend. Upstream responses are cached for one hour; the browser also uses a one-hour session cache. The graph is not a live commit feed, and contributions are not synonymous with commits.

The root intro preloads this request through the shared `src/app/data/githubActivity.ts` service. When the calendar approaches the viewport it consumes that prepared result without another request. Direct section links fetch it as needed. Requests have a 12-second timeout. Dates, counts, levels and contiguous day ordering are validated before rendering or reading the cache. Totals are calculated from the returned days. Days align Sunday through Saturday using UTC dates to avoid local timezone shifts. Leading and trailing blanks are not rendered as zero-contribution days.

The calendar uses lime intensity levels. Desktop pointer hover, keyboard focus, and touch selection display the date and daily count. Keyboard arrow keys navigate days/weeks; Home/End reach the first/last day. There is one tab stop within the day grid. Mobile scrolls horizontally to show the full year and initially shows recent months. No 3D is introduced.

If the service is unavailable, the component displays a retry action and retains the GitHub profile link. It does not show synthetic data or a misleading zero total.

Verified locally:

- Real CORS request succeeded with 367 days and 721 contributions at implementation time.
- Desktop heatmap total matched the sum of all returned day counts.
- Mobile 390 px had no page overflow; the calendar scrolled independently and no sculpture was mounted.
- Selecting 16 November 2026 showed 15 contributions; ArrowLeft moved to 9 November 2026 and showed 31 contributions, matching the fetched data.
- A simulated request failure showed the fallback with no day cells. Restoring the request and using Retry loaded the real calendar again.
- TypeScript and production build passed; normal browsing produced no console errors or warnings.
