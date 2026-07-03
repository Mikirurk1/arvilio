# Mascot asset

Drop the mascot model here as **`arvi.glb`** (this exact path: `public/mascot/arvi.glb`).

- Any valid `.glb` works for now — the renderer is asset-agnostic and you can replace
  it later with the same filename, no code changes.
- Until a file exists here, the tour shows the 2D SVG fallback automatically.
- Target: glTF/GLB + Draco, ≤ 1.5 MB, A-pose rigged. Optional named animation clips
  containing `idle` / `greet` / `point` / `celebrate` are auto-played per tour step;
  with no clips, a gentle procedural idle bob is used.

See the Meshy.ai prompt + settings in `docs/handoff.md` (persona: "Arvi the Speaker-puff").
