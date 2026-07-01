# Hamster art

Drop transparent PNGs here, one per emotion, named exactly:

- `idle.png`
- `happy.png`
- `laugh.png`
- `sad.png`
- `angry.png`
- `shock.png`

Tips:

- Use a transparent background and keep every image the same size and centering
  so switching between them doesn't jump.
- Any missing file automatically falls back to an emoji placeholder, so you can
  add art one emotion at a time.
- To add a new emotion, add its rule in `src/emotions.js` and its file path in
  `src/config.js` (`assets` map).
