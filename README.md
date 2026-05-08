# @alphasense-org/handoff-context

A floating annotation layer for React prototypes. Drop pins on any UI element, add notes, and share them with your team via git.

---

## How it works

- A small chip floats in the top-right corner of the prototype
- **Enable context** shows all pins placed on the page
- The **edit icon** enters edit mode — hover over any element to highlight it, click to drop a pin and open an annotation popover
- Pins are anchored to their target element and only appear when that element is in the DOM (so menu pins only show when the menu is open, page-specific pins only show on that page, etc.)
- Annotations are saved to `public/handoff-annotations.json` in the consuming project — commit and push to share with teammates

---

## Before you install — access requirements

This package is hosted in the GitLab Package Registry. **You must have access to this project to install it.** If the install fails with an auth error, work through the following:

### Step 1 — Verify you have project access

Go to `https://gitlab.com/alphasense-org/sandbox/handoff-context-builder` and confirm you can view the repository. If you see a 404 or are asked to log in, you do not have access.

**To get access:** ask a Maintainer or Owner of the `alphasense-org` GitLab group to add you to the `handoff-context-builder` project with at least **Reporter** role. They can do this at:

> GitLab → handoff-context-builder → Manage → Members → Invite members

### Step 2 — Verify your SSH key is registered with GitLab

The package installs via SSH. Run:

```bash
ssh -T git@gitlab.com
```

You should see: `Welcome to GitLab, @your-username!`

If you see a permission denied error, your SSH key is not registered. Add it at:

> GitLab → Profile (top right) → Preferences → SSH Keys → Add new key

Your public key is at `~/.ssh/id_ed25519.pub` or `~/.ssh/id_rsa.pub`. Paste the contents into GitLab.

### Step 3 — Verify pnpm is installed

```bash
pnpm --version
```

If not installed: `npm install -g pnpm`

---

## Installation

Once access is confirmed, add the package to your project:

```bash
pnpm add @alphasense-org/handoff-context
```

---

## Setup

### 1. Add the Vite plugin

```ts
// vite.config.ts
import { handoffPlugin } from '@alphasense-org/handoff-context/vite'

export default defineConfig({
  plugins: [
    handoffPlugin(), // add this alongside your existing plugins
  ],
})
```

The plugin creates `public/handoff-annotations.json` on first run and serves a local API endpoint for saving annotations during development. It does nothing in production builds.

### 2. Add the component

Mount it once at the root of your app — it renders outside your normal layout via `position: fixed`.

```tsx
import { HandoffContextBar } from '@alphasense-org/handoff-context'
import '@alphasense-org/handoff-context/style.css'

// Inside your root layout JSX:
<HandoffContextBar />
```

### 3. Add the env flag

Control visibility via a `.env` file committed to your project:

```bash
# .env
VITE_HANDOFF=true
```

Update your component to respect it:

```tsx
{import.meta.env.VITE_HANDOFF === 'true' && <HandoffContextBar />}
```

Set to `false` and push to hide the annotation layer for everyone. Set to `true` and push to show it.

### 4. Commit the annotations file

The first time you start the dev server, `public/handoff-annotations.json` will be created automatically. Add it to your repo so teammates receive your annotations:

```bash
git add public/handoff-annotations.json
git commit -m "Add handoff annotations file"
```

---

## Usage

| Action | Result |
|---|---|
| Click **Enable context** | Shows all existing pins |
| Click **Disable context** | Hides all pins |
| Click the **edit icon** | Enters edit mode — cursor becomes a crosshair |
| Hover an element in edit mode | Element is highlighted |
| Click an element in edit mode | Drops a pin and opens the annotation popover |
| Type in the popover | Note is saved automatically |
| Click **×** in popover | Closes popover, pin stays visible |
| Click a pin | Reopens its popover |
| Click outside a popover | Closes it |
| Click **Delete** in popover | Removes the pin permanently |

---

## Sharing annotations

Annotations are just a JSON file. To share with teammates:

```bash
git add public/handoff-annotations.json
git commit -m "Add context annotations"
git push
```

Teammates get them on next `git pull`.

---

## Publishing updates (maintainers only)

To publish a new version to the package registry you need **Maintainer or Owner** access to this project plus a deploy token with `write_package_registry` scope.

```bash
# Bump the version in package.json first, then:
GL_PUBLISH_TOKEN=<your-deploy-token> npm run publish:gitlab
```

Deploy tokens can be created at:

> GitLab → handoff-context-builder → Settings → Repository → Deploy tokens
