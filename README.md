# DEFUSE 💣

A daily logic puzzle. A bomb has 4 wires, each with a tag. The bomb tells you how many tags are lying — work out which wire is safe and cut it. One cut, two minutes, no second chances.

Play: https://tomh6.github.io/defuse

- Same bomb for everyone each day (generated from the date); every bomb has exactly one correct answer
- English / Hebrew (same daily bomb in both)
- Daily leaderboard + private friend groups (join by link)
- WhatsApp challenge links with head-to-head results
- Optional sound and vibration
- Installable (PWA), works offline

Plain HTML/JS, no build step. Hosted on GitHub Pages. Leaderboard uses the Trivia Deck Firebase Realtime Database under `/defuse` — rules in `database.rules.json` (paste the whole file into Firebase → Realtime Database → Rules).
