# Prakash Palsaniya

My personal portfolio with projects, skills, education, and contact details.

[prakash-palsaniya.vercel.app](https://prakash-palsaniya.vercel.app/)

Built with React and Vite. Includes responsive layouts, a light theme, an animated arc reactor, project details, and a downloadable resume.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

On Vercel, use `npm run build` as the build command and `dist` as the output directory.

Personal information and projects are in `src/data.js`. SEO settings are in `seo.config.js`. The production domain is `https://prakash-palsaniya.vercel.app/`; set `VITE_SITE_URL` to the same URL in Vercel if you use that environment variable.

## Microsoft Clarity

Production builds load Microsoft Clarity using the existing project ID `zae8rwrfj9`.
No environment variable is required for this project. Local `npm run dev` visits
are excluded from tracking.

To use another Clarity project, set `VITE_CLARITY_PROJECT_ID` in Vercel and redeploy.
An empty value disables tracking. After deployment, visit the live site and check
the matching project in the [Clarity dashboard](https://clarity.microsoft.com/).
Dashboard data can take time to appear, and browser tracking blockers can prevent
a visit from being recorded.
