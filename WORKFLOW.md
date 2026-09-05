# Workflow: GitHub + Claude chat

This project is synced through a **single GitHub repository**. `node_modules` is
never committed or transferred — each machine rebuilds it from
`package.json` + `package-lock.json`.

## One-time setup (your machine)

```bash
# inside the extracted project folder
git init
git add .
git commit -m "Initial commit"

# create an empty repo on github.com first (no README/gitignore), then:
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main

# install dependencies (rebuilds node_modules locally)
npm install
```

## Day-to-day

You edit on your machine:

```bash
npm run dev            # webpack dev server, live reload
# ...make changes...
git add -A
git commit -m "describe the change"
git push
```

## Handing work to Claude

Instead of describing changes in prose, give Claude the diff or the files:

- **Small change:** paste the relevant file(s), or the output of
  `git diff` / `git diff main~1`.
- **Whole picture:** paste a commit URL, or the file tree + the files in
  question. (Claude in this chat cannot pull from GitHub directly, so the
  hand-off is copy/paste — but it is real code, not a description.)

Claude returns edited files. Apply them, then:

```bash
git add -A
git commit -m "apply Claude's changes"
git push
```

## Rules that keep it clean

- **Never commit `node_modules/`, `dist/`, or `*.zip`** — already handled by
  `.gitignore`.
- **Commit `package-lock.json`** — it pins exact dependency versions so both
  machines resolve identically.
- **Commit small and often** — each commit is a clean unit Claude can read as a
  diff.
- After pulling changes that touched `package.json`, run `npm install` again.

## Build / test

```bash
npm run dev      # dev server
npm run build    # production build to dist/
npm run lint     # eslint
npm test         # build + jest
```
