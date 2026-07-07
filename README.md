# @alphasense-org/handoff-context

A floating annotation layer for React prototypes. Drop pins on any UI element, add notes, and share them with your team via git.

Works instantly in any React app with **zero backend** — pins persist to `localStorage` out of the box. Add the optional Vite plugin to upgrade to a git-shared annotations file so your whole team sees the same pins.

---

## Install

Use **the same package manager your project already uses** — installing with `npm` in a `pnpm`/`yarn` project (or vice versa) will fail with resolver errors like `Cannot read properties of null (reading 'matches')`.

```bash
# pnpm
pnpm add github:iamtrevormurphy/Project-annotation

# npm
npm install github:iamtrevormurphy/Project-annotation

# yarn
yarn add iamtrevormurphy/Project-annotation
```

Pin to a released version (recommended for teams) by appending the tag:

```bash
pnpm add github:iamtrevormurphy/Project-annotation#v0.2.0
```

No registry, no auth, no `.npmrc` — installs straight from the public GitHub repo.

---

## Use (zero-config)

Three steps, no backend required.

### 1. Mount the component at your app root

It renders outside your normal layout via `position: fixed`, so mount it once as a sibling of your app — not wrapping it.

```tsx
import { HandoffContextBar } from '@alphasense-org/handoff-context'
import '@alphasense-org/handoff-context/style.css'

export default function App() {
  return (
    <>
      <YourApp />
      <HandoffContextBar />
    </>
  )
}
```

### 2. (Optional) Gate it behind an env flag

To turn the layer on and off for everyone via a committed flag:

```tsx
{import.meta.env.VITE_HANDOFF === 'true' && <HandoffContextBar />}
```

```bash
# .env
VITE_HANDOFF=true
```

That's it. Pins now persist to `localStorage` in each person's browser. To share pins across your team, add the optional Vite plugin below.

---

## How it works

- A small menu floats in the top-right corner of the prototype
- **Toggle context** shows/hides all pins placed on the page
- The **+ (add)** button enters edit mode — hover over any element to highlight it, click to drop a pin and open an annotation popover
- The **list** button opens a panel of all annotations on the page — click one to jump to it
- Pins are anchored to their target element and only appear when that element is in the DOM (so menu pins only show when the menu is open, page-specific pins only show on that page, etc.)

---

## Usage

| Action | Result |
|---|---|
| Click **Toggle context** | Shows / hides all existing pins |
| Click the **+ (add)** button | Enters edit mode — cursor becomes a crosshair |
| Hover an element in edit mode | Element is highlighted |
| Click an element in edit mode | Drops a pin and opens the annotation popover |
| Click the **list** button | Opens/closes the annotations panel |
| Click a row in the panel | Jumps to that pin and opens its popover |
| Type in the popover | Note is saved automatically |
| Click **×** in popover | Closes popover, pin stays visible |
| Click a pin | Reopens its popover |
| Click outside a popover | Closes it |
| Click **Delete** in popover | Removes the pin permanently |

---

## Optional: shared annotations via git

By default, pins live in each person's `localStorage`. To share one set of annotations with your team, add the Vite plugin. It persists pins to `public/handoff-annotations.json` in your project, which you commit and push.

### 1. Add the plugin

```ts
// vite.config.ts
import { handoffPlugin } from '@alphasense-org/handoff-context/vite'

export default defineConfig({
  plugins: [
    handoffPlugin(), // add alongside your existing plugins
  ],
})
```

The plugin creates `public/handoff-annotations.json` on first run and serves a local dev-server endpoint for reading/writing it. It does nothing in production builds.

### 2. Restart the dev server

`<HandoffContextBar />` auto-detects the plugin's endpoint and switches persistence from `localStorage` to the shared file — no code change needed (the default `storage="auto"` mode handles this).

### 3. Commit the annotations file

```bash
git add public/handoff-annotations.json
git commit -m "Add context annotations"
git push
```

Teammates get them on next `git pull`.

---

## Props

`<HandoffContextBar />` accepts optional props to control persistence:

| Prop | Type | Default | Description |
|---|---|---|---|
| `storage` | `'auto' \| 'local' \| 'file'` | `'auto'` | `auto` uses the plugin's file endpoint when present, else `localStorage`. Force a mode with `local` or `file`. |
| `endpoint` | `string` | `/handoff-annotations` | Dev-server endpoint served by the Vite plugin. |
| `storageKey` | `string` | `handoff-context:pins` | `localStorage` key used in local mode. |

The component is SSR-safe (Next.js etc.) — all `window`/`localStorage` access is guarded.

---

## Maintaining & releasing (maintainers only)

The built `dist/` is committed to the repo so git installs work with no build step on the consumer's machine. **This means any change to `src/` must be rebuilt and the new `dist/` committed**, or installs will serve stale code.

```bash
# after editing src/
npm run build          # regenerates dist/
git add src dist
git commit -m "..."
git tag v0.2.1         # bump per semver
git push && git push --tags
```

Consumers pin to a tag with `npm install github:iamtrevormurphy/Project-annotation#v0.2.1`.
