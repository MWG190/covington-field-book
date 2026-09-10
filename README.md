# Covington Field Book

Living briefing, voter file, walk lists, and turf cutter for the Inman campaign in Covington, Louisiana.

**Live site:** https://mwg190.github.io/covington-field-book/

| | |
|---|---|
| Briefing | `/` |
| Door lists | `/walk` |
| Turf cutter | `/turf` |
| Full voter file | `/voters` |

Marks (Voting Inman / Not Voting Inman / Yard sign) stay in the browser (`localStorage`). They are not uploaded.

## Local

```bash
npm install
npm run dev
```

Opens at http://localhost:8080

## Publish

Push to `main`. GitHub Actions builds a static export and deploys GitHub Pages.
