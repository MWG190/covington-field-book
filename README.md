# Covington Field Book

Living briefing, voter file, walk lists, and turf cutter for the Inman campaign in Covington, Louisiana.

**Live site:** https://mwg190.github.io/covington-field-book/

Turn Pages on once (GitHub blocks this from the API):

1. Open [repo Settings → Pages](https://github.com/MWG190/covington-field-book/settings/pages)
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` / `/` (root)
4. Save

Then wait ~30 seconds. Walk and turf use hash URLs: `/#/walk` and `/#/turf`.

| | |
|---|---|
| Briefing | `/` |
| Door lists | `/#/walk` |
| Turf cutter | `/#/turf` |
| Full voter file | `/#/voters` |

Marks (Voting Inman / Not Voting Inman / Yard sign) stay in the browser (`localStorage`). They are not uploaded.

## Local

```bash
npm install
npm run dev
```

Opens at http://localhost:8080
