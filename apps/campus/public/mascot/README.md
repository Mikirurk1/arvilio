# Mascot asset

Drop the mascot model here as **`arvi.glb`** (this exact path: `public/mascot/arvi.glb`).

- Any valid `.glb` works for now — the renderer is asset-agnostic and you can replace
  it later with the same filename, no code changes.
- Until a file exists here, the tour shows the 2D SVG fallback automatically.
- Target: glTF/GLB + Draco, ≤ 1.5 MB, A-pose rigged. Optional named animation clips
  containing `idle` / `greet` / `point` / `celebrate` are auto-played per tour step;
  with no clips, a gentle procedural idle bob is used.

## SFX (Stage 3)

Short stubs in `public/mascot/sfx/*.wav` (`greet`, `point`, `click`, `celebrate`,
`encourage`, `wave`). Replace with designed audio anytime — same filenames.
Mute preference: `localStorage['arvi.sfxMuted']` (`1`/`0`); `prefers-reduced-motion`
defaults to muted. Tour card has Mute/Unmute. Missing files fail soft.

## Voice-over (Stage 6 seam)

Optional per-step `voiceSrc` on tour steps — see `voice/README.md`. No files
shipped in v1; `useArviVoice` plays lazily when URLs are added. Mute applies to
voice and SFX together.

See the Meshy.ai prompt + settings in `docs/handoff.md` (persona: "Arvi the Speaker-puff").
