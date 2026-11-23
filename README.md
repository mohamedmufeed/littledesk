# LittleDesk 🎨✂️📐
### Personal 3D Comic-Style Chrome New Tab Experience

> A creative, interactive, colorful, 3D scrapbook and comic-inspired workspace that replaces the default Google Chrome New Tab page. Pinned paper notes, handwritten reminders, physical checklists, website launchpads, live search, 3D origami elements, and local-first cloud sync.

---

## 🌟 Visual & Product Highlights

- **Physical Scrapbook Wall**: Physical depth with torn paper edges, curled corners, realistic cast shadows, translucent masking tape strips, and metallic pushpins (red, yellow, blue).
- **Comic & Handmade Aesthetics**: Halftone dot overlays, graphic sound bubbles (*POW!*, *SPARK!*), polaroid photos, coffee cup stains, and HB pencil illustrations.
- **Dynamic 3D Canvas**: Real-time Three.js 3D origami paper plane and sticky note that gently responds to cursor parallax without lag.
- **Tactile Web Audio**: Pure synthesized sound effects for paper rustles, crisp comic button clicks, and checkmark scribbles using the Web Audio API.
- **Interactive To-Do Checklist**: Paper legal notepad with hand-drawn SVG animated checkmarks, priority tags (*Urgent*, *High*, *Med*, *Low*), category filters (*Today*, *Personal*, *Development*, *Ideas*, *Later*), progress indicator, and celebration confetti.
- **Freeform Paper Notes**: Multi-colored notes (*Yellow, Cream, White, Pink, Blue, Green, Purple*), free drag-and-drop placement with persistent coordinates `(x, y)` and rotation angles, rich formatting modal, and autosave.
- **Search & Launchpad**: Prominent search bar supporting Google, Bing, and DuckDuckGo with live autocomplete suggestions, recent search history, keyboard shortcut (`/`), and custom Polaroid/stamp shortcut tiles.
- **Multi-Device Cloud Sync**: Local-first offline resilience via `chrome.storage.local` with background push/pull sync to a TypeScript Express + MongoDB API featuring JWT auth with refresh token rotation.
- **5 Workspace Themes**: *Comic Studio Desk*, *Vintage Pinboard*, *Pastel Grid Paper*, *Architect Blueprint*, and *Kraft Cardboard*.

---

## 🏗️ Monorepo Architecture

```
LittleDesk/
├── apps/
│   ├── extension/          # Manifest V3 Chrome Extension (Vite + React 19 + Tailwind + GSAP + Three.js)
│   │   ├── public/         # manifest.json, extension icons (16, 48, 128)
│   │   ├── src/
│   │   │   ├── background/ # Manifest V3 service worker (alarms, sync listeners)
│   │   │   ├── components/ # Header, SearchBar, ShortcutsGrid, TaskChecklist, PaperNoteCard, etc.
│   │   │   ├── services/   # Local-first storage wrapper, Search provider API, Cloud API client
│   │   │   ├── utils/      # Web Audio sound synthesizer
│   │   │   ├── App.tsx     # Central workspace orchestrator
│   │   │   └── main.tsx
│   │   └── dist/           # Production unpacked Chrome extension ready to load
│   └── api/                # Cloud Sync Backend (Node.js + Express + TypeScript + Mongoose)
│       ├── src/
│       │   ├── config/     # Environment configuration and MongoDB Atlas connection
│       │   ├── controllers/# Auth, Notes, Tasks, Bookmarks, Settings, and Sync controllers
│       │   ├── middleware/ # JWT Bearer auth, Rate limiting, Helmet security
│       │   ├── models/     # User, Note, Task, Bookmark, UserSettings Mongoose models
│       │   ├── routes/     # REST API routes
│       │   └── server.ts   # Express server instance
│       └── test-e2e.js     # End-to-end API test suite
├── packages/
│   └── shared/             # Shared TypeScript types, Zod validation schemas, and default mock data
├── PROGRESS.md             # Project roadmap and milestone tracker
└── package.json            # Monorepo scripts (pnpm workspaces)
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (or npm)
- **Google Chrome** (or Chromium-based browser)

### 1. Install Dependencies & Build
From the repository root:
```bash
# Install dependencies across all packages
pnpm install

# Build the shared library, extension, and API
pnpm build
```

---

## 🧩 Installing the Extension in Google Chrome

1. Open **Google Chrome**.
2. In the URL address bar, navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click the **"Load unpacked"** button in the top-left corner.
5. In the file picker, select the `dist` folder located at:
   ```
   /Users/mufeed/Desktop/My-Projects/LittleDesk/apps/extension/dist
   ```
6. Open a **New Tab** (`Cmd + T` on macOS or `Ctrl + T` on Windows/Linux).
7. 🎉 You will immediately see the **LittleDesk** comic scrapbook experience!

---

## 🔌 Running the Cloud Sync Backend (Optional)

LittleDesk works **100% offline out-of-the-box** using local-first storage. If you want multi-device cloud synchronization across your computers:

1. Navigate to the API app directory:
   ```bash
   cd apps/api
   ```
2. (Optional) Configure environment variables in `.env`:
   ```env
   PORT=5001
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/littledesk   # Or leave blank for in-memory mode
   JWT_ACCESS_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```
   *Note: If no `MONGO_URI` is provided, the API automatically runs with an in-memory fallback store so you can test cloud sync without needing an active MongoDB database!*

3. Start the backend:
   ```bash
   pnpm dev
   # Server will start on http://localhost:5001
   ```

4. Run the API test suite to verify all endpoints:
   ```bash
   pnpm test
   ```

5. In the LittleDesk New Tab page, click **Settings (⚙️)** → **Cloud Sync** tab → **Create Account** to register and start syncing your notes and tasks.

---

## 🎨 Feature Walkthrough

### 1. Header & Greeting
- Automatic time-of-day greeting: *"Good morning, Mufeed!"*, *"Good afternoon"*, or *"Good evening"*.
- Live comic ticking clock with seconds counter and calendar date badge.
- Live weather badge (toggleable in Settings).
- Real-time cloud sync status indicator pill (*Synced*, *Syncing*, *Offline*, *Sync Failed*).
- Quick **+ New Note** action button.

### 2. Search Launchpad
- Press `/` from anywhere on the page to instantly focus the search bar.
- Switch search providers dynamically between **Google**, **Bing**, and **DuckDuckGo**.
- Autocomplete search suggestions with ArrowUp/ArrowDown navigation and Escape dismissal.
- Recent search chips stored locally with one-click re-search or clear.
- Directly open URLs or search queries on Enter.

### 3. Website Shortcuts (Launchpad)
- Pinned Polaroid and stamp tiles with masking tape headers for daily sites (*Google, YouTube, GitHub, ChatGPT, Gmail, Google Drive, Stack Overflow, Vercel, LinkedIn*).
- Hover to edit or delete shortcuts.
- Add new custom shortcuts with custom titles, URLs, categories, and badge background colors.

### 4. Interactive To-Do Checklist
- Physical legal notepad sheet pinned with a realistic red pushpin.
- Category filters: **Today**, **Personal**, **Development**, **Ideas**, **Later**, and **All**.
- Interactive hand-drawn SVG checkmarks that animate on completion with strikethrough.
- Priority badges (*Urgent!*, *High*, *Med*, *Low*) that cycle on click.
- Remaining tasks counter (*"3 tasks remaining"*).
- Confetti explosion upon completing all tasks for the day!

### 5. Freeform Paper Notes Wall
- Real freeform dragging across your desk with persistent coordinates and rotation angles.
- 7 authentic paper colors: *Yellow, Cream, White, Pink, Blue, Green, Purple*.
- Tape headers and pushpin accents.
- Click to open the rich note editor: Bold, Italic, Bullet Lists, Checklist items, Pin styles, and Paper sizes.
- Real-time auto-save indicator (*"Saved to desk ✓"*).

### 6. Settings & Personalization
- **Theme Selection**: Switch between *Comic Studio Desk*, *Vintage Pinboard*, *Pastel Grid Paper*, *Architect Blueprint*, and *Kraft Cardboard*.
- **Typography**: Choose between *Comic Neue & Bangers*, *Caveat Handwritten*, or *Inter Clean Sans*.
- **Motion & Audio**: Toggle synthesized audio feedback, adjust parallax sensitivity, or enable *Reduced Motion* mode.
- **Cloud Account**: Register, login, check sync status, or trigger manual sync.
- **Reset to Defaults**: Safely reset your workspace back to original sample data anytime.

---

## 🛡️ Security & Privacy
- **Manifest V3 Compliant**: Uses narrow permissions (`storage`, `alarms`), zero remote scripts, and CSP compatibility.
- **Secure Password Hashing**: Bcrypt with 10 salt rounds.
- **Token Security**: 15-minute JWT access tokens and 7-day refresh token rotation.
- **Local-First Privacy**: Your browsing data, searches, and notes never leave your device unless you explicitly connect to a cloud account. No analytics or tracking scripts.

---

## 📜 License
MIT © 2026 Mufeed. Built for personal, creative, and joyful daily browsing.
