# Contributing

## Language rule

This repository is English-only, with one narrow exception for video copy.

### English is required for

- Source code and code comments
- Documentation, notes, research write-ups, and checklists
- File and folder names
- Branch names, pull request titles and descriptions, and issues
- Commit messages

Write commit messages in English, in the imperative mood, for example:

```text
Add the language checker for copy locations
Fix the fiber journey storyboard timing
```

### The one exception: video copy

A video's own copy may be written in the language the video is published
in, including Chinese. Copy means only what the audience reads or hears:

- Narration scripts
- On-screen text and titles
- Captions and subtitles
- Publishing titles and descriptions

Copy files must live in one of these locations, and nowhere else:

- `scripts/`
- `episodes/<episode>/copy/`

Research notes, fact cards, storyboards, and production logs are not
copy. They stay in English even when they describe a Chinese-language
video. If a note needs to reference a line of copy, link to the copy file
instead of pasting the line into the note.

### Check before you commit

```bash
python3 tools/check_language.py
```

The checker scans the repository and fails if Chinese characters appear
outside the copy locations above. Do not bypass it; move the text into a
copy file, or translate it.
