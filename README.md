<div align="center">

# 🌌 Ephemeris Atlas

**Scroll from the Sun to the edge of the Local Group — in real time, at real positions.**

An immersive 3D atlas of the solar system and our galactic neighbourhood. Travel
outward past every planet, then pull back to see the Milky Way and the galaxies
around it. Hover anything for real facts — including a **live distance from Earth**.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![three.js](https://img.shields.io/badge/three.js-r185-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## ✨ Why it's called *Ephemeris Atlas*

An **ephemeris** is a table of where celestial bodies actually are at a given
instant. That's the heart of this project: nothing here is a decorative loop of
spinning spheres — every body is placed where it really is, right now.

## 🔭 What's real

| | |
|---|---|
| 🪐 **Positions** | Every planet (and the Moon) is placed with [`astronomy-engine`](https://github.com/cosinekitty/astronomy), computing the true heliocentric position for the current simulated instant. No API key, fully client-side, accurate to arc-seconds. |
| 🌀 **Motion & spin** | Real relative orbital speeds and sidereal rotation periods — including Venus's and Uranus's retrograde spin and Uranus's 98° axial tilt. |
| 🖼️ **Textures** | Real planet / Sun / Moon maps from [Solar System Scope](https://www.solarsystemscope.com/textures) (CC BY 4.0), served locally from `public/textures/`. |
| 📊 **Facts** | Diameters, distances, orbital periods and moon counts straight from NASA planetary fact sheets. |

## 📏 Scale — an honest note

True size *and* true distance cannot share one frame (Neptune is 30 AU out;
planets would be invisible specks). So:

- **Distances are always real** — every body sits at its true relative AU.
- **Sizes** use two modes, toggled in the HUD:
  - **Enlarged** *(default)* — bodies keep their true size ratios to each other;
    the Sun is clamped so it doesn't swallow the inner planets.
  - **True size** — real radius-to-distance proportion, which reveals how
    staggeringly empty space really is.

Galaxy positions in the Local Group view are a stylised layout — their real
distances (millions of light-years) live in the hover cards.

## 🎮 Controls

| Input | What it does |
|---|---|
| **Scroll** | Fly the guided tour: Sun → planets → Local Group |
| **Hover** | Reveal a body's brief and live stats |
| **Right rail** | Jump straight to any stop |
| **Bottom-left** | Simulation speed (pause → 1 yr/s) and size scale |
| **Top-right** | Simulated UTC clock + "reset to now" |

## 🚀 Getting started

```bash
git clone https://github.com/neeelbhavsar/ephemeris-atlas.git
cd ephemeris-atlas
npm install
npm run dev      # dev server
```

```bash
npm run build    # type-check + production build
npm run preview  # serve the production build
npm run lint     # oxlint
```

## 🛠️ Stack

React 19 · TypeScript · Vite · **three.js / @react-three/fiber / drei** ·
**astronomy-engine** · zustand · framer-motion · Lenis · Tailwind CSS

## 📂 Project layout

```
src/
  data/          real solar-system + Local Group data
  lib/           ephemeris (astronomy-engine wrap) + scale helpers
  three/         R3F scene: Sun, Planet3D, AsteroidBelt, NeighborGalaxies,
                 CameraRig (scroll tour), SimClock, Scene
  components/    2D overlays: HUD, TourNav, HoverCard
  store.ts       zustand store (hover, speed, scale, clock, focus)
```

## 🙏 Credits

- [astronomy-engine](https://github.com/cosinekitty/astronomy) — ephemeris math
- [Solar System Scope](https://www.solarsystemscope.com/textures) — texture maps (CC BY 4.0)
- [NASA planetary fact sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) — body data

<div align="center">
<sub>Built with curiosity about very large distances.</sub>
</div>
