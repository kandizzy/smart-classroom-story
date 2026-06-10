# Build Your Own Project Documentation Site (with Claude)

*A guide for the Tony team — Ramon & Shuyang — and any team that wants to document
their smart object properly. You'll end up with your own site, your own repo, your
own design. Plan on 2–3 working sessions.*

The class story site ([smart-classroom-story](https://kandizzy.github.io/smart-classroom-story))
tells the story of the whole room. Your site tells the story of **one project, told
by the people who built it** — including the parts that didn't work. The battery
that died mid-demo, the color channels that came out swapped, the version that
never made it to class: that's not embarrassing filler, that's the documentation.
A project page that only shows the final demo is a brochure. Yours should be a
build log with a thesis.

One rule up front: **do not copy the class site's design.** You're making a
stripped-down site with its own voice. The structure below is scaffolding, not a
template to imitate.

---

## Phase 0 — Gather before you prompt (no Claude yet)

Claude is good at structure and code, and bad at knowing what happened to *you*.
Everything true about Tony has to come from you, so collect it first.

Make a folder on your computer (call it `tony-docs`) with two things inside:

```
tony-docs/
  content/     ← everything raw goes here
  NOTES.md     ← you'll write this next
```

**1. Dump your raw material into `content/`.** Videos, photos, sketches, the
interaction-flow drawing, your narrative story doc, screenshots of code, Discord
screenshots — all of it, unedited. Don't sort it yet.

**2. Write `NOTES.md` by hand.** This is the most important 45 minutes of the whole
project, and Claude can't do it for you. Answer these in plain sentences — rough is
fine, it's source material, not final copy:

- **What is Tony, in two sentences?** As if telling a friend who wasn't in the class.
- **What does Tony actually do?** Walk through one real interaction, start to finish.
- **What went wrong, in order?** Every struggle gets 2–4 sentences: what you expected,
  what happened, what you tried, what finally worked (or didn't). Battery life is one
  entry. The swapped color channels is another. List them all — aim for at least five.
- **What would you tell someone building Tony 2.0?**
- **For each video and photo in `content/`:** one line saying what it shows and when
  it was taken. ("IMG_2041 — battery pack taped to Tony's back, week 3, after the
  second brownout.")

**3. Decide your three words.** Before Claude touches design, agree as a team on
three adjectives for how the site should *feel* (e.g. "honest, technical, warm" or
"playful, rough, zine-like"). Optionally find one website or printed thing whose look
you both like. Write these at the bottom of NOTES.md. This is what stops you from
getting Generic AI Website.

---

## Phase 1 — Set up the project

You'll work in [Claude Code](https://claude.com/claude-code) (the terminal app or VS
Code extension) because it can read your files, write the site, and manage git. The
claude.ai website can't see your folder, so it's only useful for brainstorming copy.

1. Install Claude Code and open a terminal in your `tony-docs` folder.
2. Run `claude` and ask it to set up the repo for you — it knows how:

> Initialize a git repo here. We're building a single-page documentation site for a
> school project: plain HTML, CSS, and vanilla JS only — no frameworks, no build
> step. Add a .gitignore that ignores the content/ folder (raw uncompressed media —
> processed copies will go in an assets/ folder later) and OS cruft like .DS_Store.

3. Then have it write the project brief that will keep every future session on track:

> Read NOTES.md, then create a CLAUDE.md for this project with these rules:
> - This site documents Tony, a classroom agent built by Ramon Naula and Shuyang
>   Tian at SVA MFA Interaction Design, spring 2026.
> - Single page, plain HTML/CSS/JS, no frameworks, no build step. It will be
>   published on GitHub Pages.
> - Every fact on the site must come from NOTES.md or from us in conversation.
>   Never invent quotes, dates, or technical details. If something is missing, ask.
> - The struggles are a first-class section, not a footnote.
> - Design must follow the three words at the bottom of NOTES.md. Keep it stripped
>   down: one or two fonts, one accent color, lots of whitespace. Nothing that
>   looks like a generic template.
> Show me the CLAUDE.md before saving it.

Read what it writes. Fix anything wrong. This file is your contract with Claude —
every new session starts from it, so errors here compound.

---

## Phase 2 — Structure first, with placeholder text

Don't ask for "a beautiful site about Tony" in one prompt. You'll get something
generic and you won't know how to fix it. Build in passes, and check each pass
before the next.

First pass — skeleton only:

> Read NOTES.md. Propose an outline for the site as a list of sections, in order,
> with one sentence on what each section contains. Don't write any code yet.

Argue with the outline. A solid shape for a project like Tony:

1. **Opening** — name, one-line description, the single best photo or a short clip
2. **What Tony does** — the real interaction, walked through
3. **How it works** — the interaction-flow drawing earns its place here; brief and
   honest about the tech (YOLO, Discord, servos, whatever's true)
4. **The build log** — the struggles, in chronological order. This is the longest
   section. Battery life gets its own entry with the photos to prove it.
5. **What we'd do differently** — Tony 2.0
6. **Credits** — who did what, the class, the semester

When you're happy:

> Build the page with this outline. Real section headings, but placeholder
> paragraphs and gray boxes where images and videos will go, each labeled with
> which file from content/ goes there. Minimal styling — just readable. I want to
> approve the structure before we write copy or design anything.

Open `index.html` in a browser. Reorder, cut, add. Structure is cheap to change
now and expensive later.

---

## Phase 3 — Real words

Now the copy, section by section — not all at once:

> Draft the "build log" section using only what's in NOTES.md. Write in first
> person plural ("we"), past tense, plain language. Keep our voice — if our notes
> are blunt, stay blunt. Flag anything where you need more detail from us instead
> of guessing.

Then **edit it yourselves, out loud, together.** Read every sentence and ask "did
that actually happen, and would I say it that way?" Claude drafts; you are the
authors. Anything that sounds like a press release, rewrite or have Claude rewrite
with your correction. Repeat per section.

---

## Phase 4 — Media

Raw phone videos are huge; GitHub blocks files over 100MB and the page will crawl
long before that. Claude Code can run the conversion tools for you:

> Look at the videos in content/. For each one, compress it to a web-friendly MP4
> (1080p max, reasonable bitrate) into a new assets/ folder using ffmpeg — install
> it via homebrew if it's missing. Resize photos to 1600px max width. Then replace
> the placeholder boxes with the real media: videos with poster images and
> controls, never autoplay with sound. Add a real caption under every single one —
> ask me for captions you can't get from NOTES.md.

Tips:

- A 10-second clip of the battery dying beats a 3-minute clip containing it. Ask
  Claude to trim: "cut battery-demo.mov to just 0:42–0:55."
- A short looping muted clip (or GIF) is great for the opening; full demos can be
  click-to-play.
- Every image gets descriptive alt text. Ask Claude to check this at the end.

---

## Phase 5 — Design (yours, not Claude's defaults)

Only now, with real content in place, do the design pass:

> Design pass. The three words in NOTES.md are [your three words]. Reference:
> [your reference, if you have one]. Propose 2–3 directions as rough descriptions
> — type choices, palette, how images sit on the page — before changing any code.

Pick one, then iterate in small, specific steps: "make the build-log entries feel
like dated journal entries," "too polished — rougher," "the accent color
everywhere is too much, use it only on links." If you can't say what's wrong,
screenshot a site you like and show Claude.

Stripped-down guardrails worth keeping: black or near-black text on a light
background (or the inverse), one accent color, system fonts or at most one Google
font, no parallax, no animation that doesn't serve the content. Before calling it
done: "Make the page work on a phone, and check the contrast and alt text."

---

## Phase 6 — Publish

> Commit everything with a sensible message and help me publish this repo to
> GitHub Pages under my GitHub account.

Claude will walk you through creating the repo and enabling Pages (Settings →
Pages → deploy from `main`). Your site lands at
`https://<your-username>.github.io/tony-docs/`. From then on: make changes, commit,
push — the site updates in a minute or two.

Last step: send the link to Carrie so it can be linked from the class story site.

---

## How to work with Claude (the part that actually matters)

- **One pass at a time.** Structure → copy → media → design. Never "redo the whole
  site."
- **Look at the result after every change.** Keep the browser open next to the
  terminal; refresh constantly.
- **Be specific when it's wrong.** "Make it better" gets you nothing. "The video is
  too wide on my phone" gets it fixed.
- **Never let Claude invent facts.** If a date, quote, or technical detail shows up
  that you didn't provide, delete it and say so. The CLAUDE.md rule helps, but
  you're the fact-checker.
- **Commit when something works.** "Commit this" after every good state means you
  can always get back to it.
- **You are the editor.** The site should read like Ramon and Shuyang wrote it,
  because — by the end — you did.
