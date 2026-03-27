# Getting Started — Complete Beginner's Guide

This guide helps you set up and understand the Jinee Chen portfolio website project from scratch — even if you have never worked with Node.js, TypeScript, or React before.

---

## What This Project Is

This is a **personal portfolio website** for photographer and videographer Jinee Chen. It lets her showcase photography galleries, video projects, and social media content.

Technically it is a **static website** — meaning the final product is a folder of plain HTML/CSS/JS files that can run on any web server without needing a database or server-side runtime. The build process (converting source code into those files) happens locally on your machine and the results are uploaded to the live server via FTP.

---

## Understanding the Technology (Zero Knowledge Edition)

### TypeScript / JavaScript
JavaScript is the programming language of the web — it runs directly in browsers. TypeScript is "JavaScript with types," meaning it catches typos and mistakes before you even run the code. Files ending in `.ts` or `.tsx` are TypeScript files.

### React
React is a JavaScript library for building user interfaces. Instead of writing raw HTML, you write **components** — reusable pieces of UI. For example, `Header.tsx` is one component that is reused on every page. Files ending in `.tsx` contain React components (JSX — HTML-like syntax inside TypeScript).

### Next.js
Next.js is a framework built on top of React. It adds things like file-based routing (the folder `src/app/about/page.tsx` automatically becomes the `/about` URL), optimised images, and the ability to export everything as static HTML files.

### Tailwind CSS
Tailwind CSS is a styling system. Instead of writing a separate `.css` file, you apply short utility classes directly in your HTML/JSX: `class="text-center font-bold"`. However, in this project most custom styles are in `src/app/globals.css` using plain CSS — Tailwind is used mainly for the base reset.

### npm (Node Package Manager)
npm is a tool for installing and running JavaScript packages. You run commands like `npm install` (sets up the project) and `npm run dev` (starts the local preview). All npm commands are run in your terminal / command line.

### Node.js
Node.js is a runtime that lets JavaScript run on your computer (outside the browser). npm requires Node.js. You do not need to understand Node.js deeply — you just need it installed.

---

## Prerequisites — What to Install First

Work through this list in order. Each step includes how to check if it is already installed.

### 1. Git
Used to download and track changes to the project code.

**Check:** `git --version`

**Install:** https://git-scm.com/downloads — click your operating system

### 2. Node.js (version 20 or higher)
The JavaScript runtime. This also installs npm automatically.

**Check:** `node -v` (should say v20.x.x or higher)

**Install:**
- Go to https://nodejs.org/
- Download the **LTS** version (the one labeled "Recommended for most users")
- Run the installer — accept all defaults

### 3. A Code Editor
Visual Studio Code (VS Code) is recommended because it shows TypeScript errors inline.

**Install:** https://code.visualstudio.com/

**Useful VS Code extensions (search by name in the Extensions panel):**
- **ESLint** — highlights code style issues
- **Prettier** — auto-formats code on save
- **Tailwind CSS IntelliSense** — autocompletes CSS class names

### 4. (Optional) PHP 7.4+
Only needed if you want to test the contact form or download system locally. The portfolio gallery and all visual parts work fine without PHP.

**Check:** `php -v`

**Install (macOS):** `brew install php` (requires Homebrew from https://brew.sh)

**Install (Windows):** Download from https://windows.php.net/download

---

## First-Time Setup

Open your terminal (on macOS: `Terminal` app; on Windows: `Command Prompt` or `PowerShell`).

### Step 1 — Download the project

```bash
git clone <repository-url>
cd Jinee-website-nodejs
```

Replace `<repository-url>` with the actual URL of this repository (ask the project owner).

### Step 2 — Install dependencies

```bash
npm install
```

This downloads all the JavaScript libraries the project needs (React, Next.js, etc.) into a `node_modules/` folder. It takes 1–3 minutes on first run. You only need to do this once (or after pulling big changes).

### Step 3 — Start the development server

```bash
npm run dev
```

Open your browser and go to **http://localhost:3000** — you should see the website.

The development server **hot-reloads**: when you save a file, the browser updates automatically without needing to refresh.

Press `Ctrl + C` in the terminal to stop the server.

---

## Project Layout — What Lives Where

```
src/
├── app/                   ← Pages (URL structure mirrors folder structure)
│   ├── page.tsx           ← Homepage: /
│   ├── portfolio/
│   │   ├── page.tsx       ← Portfolio overview: /portfolio/
│   │   ├── photography/[slug]/page.tsx   ← Individual photo project page
│   │   ├── video/[slug]/page.tsx         ← Individual video project page
│   │   └── social-media/[slug]/page.tsx
│   └── globals.css        ← ALL custom CSS lives here
│
├── components/            ← Reusable React building blocks
│   ├── layout/            ← Header, Footer, Navigation
│   ├── sections/          ← Homepage sections (About, Gallery, etc.)
│   ├── gallery/           ← Photo gallery, lightbox, slideshow
│   ├── forms/             ← Contact form
│   └── video/             ← YouTube embed player
│
├── content/               ← DATA: JSON files describing each portfolio project
│   └── portfolio/
│       ├── photography.json   ← All photography projects
│       ├── video.json         ← All video projects
│       └── social-media.json  ← All social media projects
│
├── hooks/                 ← Small reusable logic pieces (e.g. detecting swipe)
├── lib/                   ← Helper functions and constants
└── types/                 ← TypeScript type definitions (describe data shapes)

public/
└── assets/                ← All images (WebP format, auto-generated by pipeline)
```

---

## How Content Is Managed

### Adding a New Photography Project

You do not write code — you edit a JSON file and add images.

1. **Add images** to `Jinee_website/assets-raw/photography/my-new-project/`
2. **Generate WebP** versions: `npm run build:images`
3. **Edit** `src/content/portfolio/photography.json` — add a new entry:

```json
{
  "type": "photography",
  "slug": "my-new-project",
  "title": "Client Name | Event Title",
  "description": "Short description (120–160 characters).",
  "heading": "📷 Client Name | Location",
  "ogImage": "https://jineechen.com/assets/photography/my-new-project/first-image-800.webp",
  "enableDownload": false,
  "imageCount": 30,
  "portfolioCard": {
    "cardTitle": "My New Project",
    "thumbnail": "/assets/photography/my-new-project/first-image-800.webp",
    "order": 10
  }
}
```

4. **Run** `npm run dev` to preview it at `/portfolio/photography/my-new-project/`

See [ADDING-PROJECTS.md](ADDING-PROJECTS.md) for the full guide.

### Editing Page Text or Layout

Most text in components is hardcoded in the TSX files:
- Homepage about text → `src/components/sections/AboutSection.tsx`
- Contact details → `src/components/sections/ContactSection.tsx`
- Footer text → `src/components/layout/Footer.tsx`

Open the file, find the text, change it, save — the browser reloads automatically.

### Editing Styles (CSS)

All custom styles are in **`src/app/globals.css`**. Find the section you want with `Cmd+F` (macOS) or `Ctrl+F` (Windows). The file is organised by section with commented headings like:

```css
/* ══ PROJECT CARDS ══ */
```

---

## Development Workflow — Day-to-Day

```bash
# Start the preview server
npm run dev

# Make your changes, the browser auto-refreshes

# Check for code problems
npm run lint          # style/logic issues
npm run type-check    # TypeScript type errors

# Run tests (optional but good practice)
npm run test

# When done and ready to deploy — build the static files
npm run build         # creates the out/ folder
# Then upload out/ to the server via FTP
```

---

## Understanding TypeScript Errors

If you see a red underline in VS Code or an error in the terminal, TypeScript is telling you about a type mismatch. Common cases:

| Error message | What it means | Quick fix |
|---|---|---|
| `Property 'x' does not exist on type '...'` | You used a field that doesn't exist in the type | Check spelling, or add the field to the type in `src/types/` |
| `Type 'string' is not assignable to type 'number'` | You passed text where a number was expected | Pass the right kind of value |
| `Cannot find module '@/...'` | Import path is wrong | Check the file path |

You can run `npm run type-check` at any time to see all TypeScript errors without starting the server.

---

## Running Tests

The project has two types of tests:

**Unit tests** (fast, ~2 seconds) — check individual React components:
```bash
npm run test
```

**End-to-end tests** (slower, ~30 seconds) — open a real browser and click through pages:
```bash
npm run test:e2e
```

Tests run automatically before every `git commit` (via Husky). If they fail, the commit is blocked. Fix the error shown, then commit again.

---

## Troubleshooting

### "npm: command not found"
→ Node.js is not installed. Go to Prerequisites step 2.

### "Cannot find module" error after `npm run dev`
→ Run `npm install` again to restore missing packages.

### Port 3000 already in use
→ Another process is using port 3000. Either stop that process or run: `npm run dev -- -p 3001` to use port 3001 instead.

### Images not showing
→ WebP images may not have been generated. Run `npm run build:images` first.

### ESLint blocks the commit
→ Run `npm run lint` to see the errors, fix them, then commit again.

### TypeScript errors in VS Code but `npm run dev` works
→ VS Code may be using a different TypeScript version. Press `Cmd+Shift+P` (macOS) → "TypeScript: Select TypeScript Version" → "Use Workspace Version".

---

## Glossary

| Term | Plain English meaning |
|------|-----------------------|
| **Component** | A reusable piece of UI (a button, a card, a header) |
| **Props** | Settings/data passed into a component (like function arguments) |
| **State** | Data a component tracks and can update (e.g. "is the modal open?") |
| **Hook** | A small function that adds state or behaviour to a component (starts with `use`) |
| **Static export** | Building the site into plain HTML files — no server needed to host it |
| **JSON** | A text format for storing structured data — uses `{ "key": "value" }` syntax |
| **Slug** | The URL-friendly version of a name, e.g. `"birthday-party"` from `"Birthday Party"` |
| **WebP** | A modern image format (smaller file size than JPEG/PNG, same quality) |
| **SSR / CSR** | Server-Side Rendering / Client-Side Rendering — how/where the HTML is assembled; this site uses static export so all rendering happens at build time |
