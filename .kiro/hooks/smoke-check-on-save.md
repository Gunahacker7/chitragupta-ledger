# Agent Hook — smoke-check-on-save

**Type:** Kiro agent hook definition (file-save trigger)
**Status:** Definition committed with the project. Kiro executes agent hooks
from the IDE's hook runner; this file is the canonical, human-readable
definition of the hook, mirrored in `smoke-check-on-save.hook.json` in the
same folder so it can be imported/enabled in Kiro IDE.

## What it does

Whenever `app.js`, `index.html` or `styles.css` is saved, the hook runs a
three-part smoke check and reports failures in the chat/output panel instead
of letting a broken build sit unnoticed:

1. **JS syntax** — `node --check app.js` (skipped with a note if node is
   absent).
2. **Asset reachability** — if a static server is running on port 8077,
   `curl` the page and both assets and require HTTP 200; otherwise start
   `python3 -m http.server 8077` for the check and stop it after.
3. **Spec hygiene** — grep the three app files for the literal strings
   `http://` / `https://` and fail if any external URL appears other than
   the single allowed Google Fonts stylesheet link in `index.html`
   (enforces the zero-external-assets rule in
   `.kiro/steering/design-system.md`).

## Trigger

- Event: `fileEdited` (on save)
- File patterns: `app.js`, `index.html`, `styles.css`

## Action (agent prompt executed by the hook)

> Run the Chitragupta Ledger smoke check: (1) `node --check app.js`;
> (2) ensure `index.html`, `styles.css`, `app.js` each return HTTP 200 from
> a local static server rooted at the project folder; (3) confirm no
> external URLs exist in the app files besides the Google Fonts link.
> Report PASS/FAIL per step with the failing command output. Do not edit
> any file as part of this hook.

## Machine-readable mirror

`smoke-check-on-save.hook.json`:

```json
{
  "name": "smoke-check-on-save",
  "version": "1.0.0",
  "description": "On save of the app files, syntax-check app.js, verify the static server returns 200 for /, styles.css and app.js, and enforce the zero-external-assets rule.",
  "trigger": {
    "type": "fileEdited",
    "filePatterns": ["app.js", "index.html", "styles.css"]
  },
  "action": {
    "type": "agentPrompt",
    "prompt": "Run the Chitragupta Ledger smoke check: (1) node --check app.js; (2) ensure index.html, styles.css, app.js each return HTTP 200 from a local static server rooted at the project folder; (3) confirm no external URLs exist in the app files besides the Google Fonts link in index.html. Report PASS/FAIL per step with failing output. Do not edit any file."
  },
  "enabled": true
}
```
