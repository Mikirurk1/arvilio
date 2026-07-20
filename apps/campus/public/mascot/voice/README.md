# Voice-over assets

Optional per-step narration for the product tour, Help (`?`), and first-words guide.

## Preferred: Payload CMS

1. Admin → **Campus → Tour audio** — upload MP3 (or OGG/WAV).
2. **Campus → Tours** → track → step → locale tab → **Voice** — attach the file.
3. Campus fetches tour with `depth=1`, resolves absolute URL, merges onto `TourStep.voiceSrc`, plays via `useArviVoice`.

### Track ids

| `trackId` | Purpose |
|-----------|---------|
| `student` / `teacher` / `admin` / `adminPlatform` | Level A + chapter steps |
| `helpStudent` / `helpTeacher` / `helpAdmin` | Header `?` Help encyclopedia |
| `firstWords` | Empty-deck first-words guide |

Sync seed from code: `node --import tsx scripts/sync-campus-tour-seed.ts` then `npm run seed:campus-ui -w @app/cms` (preserves attached voice).

Migrate schema (once): `npm run migrate:tour-audio -w @app/cms`

## Fallback: static files

```
public/mascot/voice/{locale}/{stepId}.mp3
```

Example: `public/mascot/voice/en/stu-welcome.mp3` or `…/help-stu-dash-hero.mp3` → hardcode `voiceSrc` on the track step in code.

## Runtime

- Mute on the tour card applies to SFX and voice (`localStorage['arvi.sfxMuted']`).
- Missing files fail soft.
