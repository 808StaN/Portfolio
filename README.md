# Alex Kowalski — Developer Portfolio

A premium developer portfolio built with React, TypeScript, Tailwind CSS, and a custom WebGL shader for the hero gradient background.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── WebGLBackground.tsx   # Core WebGL shader — liquid gradient
│   ├── Nav.tsx               # Fixed navigation with scroll-hide
│   ├── Hero.tsx              # Hero section with WebGL bg
│   ├── Projects.tsx          # Projects grid
│   ├── About.tsx             # About / bio section
│   ├── Stack.tsx             # Skills & tech stack
│   ├── Contact.tsx           # Contact + socials
│   ├── Footer.tsx            # Footer
│   └── Cursor.tsx            # Custom cursor (desktop)
├── data/
│   └── projects.ts           # Project content — edit here
├── App.tsx                   # Root component
├── index.css                 # Global styles & CSS variables
└── main.tsx                  # Entry point
```

---

## ✏️ How to Edit Content

### Personal Info
Update name, email, and social links in:
- `src/components/Nav.tsx` — logo name
- `src/components/Contact.tsx` — email, social handles
- `src/components/Footer.tsx` — name, email
- `index.html` — page title and meta description

### Projects
Edit `src/data/projects.ts`:
```ts
{
  id: 'my-project',
  title: 'My Project',
  description: 'Short description (shown on card)',
  longDescription: 'Detailed description',
  tags: ['React', 'TypeScript'],
  year: '2024',
  status: 'live', // 'live' | 'case-study' | 'experimental'
  link: 'https://...',
  accent: '#4f8ef7',  // Card accent color
  index: '01',
}
```

### Bio / About
Edit the text directly in `src/components/About.tsx` — look for the `<p>` tags in the bio section.

### Skills
Edit `src/components/Stack.tsx` — the `categories` array at the top of the file.

---

## 🎨 How to Tweak the Gradient Colors

Open `src/components/WebGLBackground.tsx` and find the `palette()` function in the GLSL shader (around line 70):

```glsl
vec3 black     = vec3(0.020, 0.020, 0.030);  // deep background
vec3 navy      = vec3(0.030, 0.050, 0.180);  // dark navy
vec3 deepBlue  = vec3(0.040, 0.100, 0.380);  // mid blue
vec3 elecBlue  = vec3(0.100, 0.280, 0.780);  // electric blue highlight
vec3 purple    = vec3(0.260, 0.100, 0.540);  // purple mid-tone
vec3 orange    = vec3(0.780, 0.300, 0.040);  // warm orange
vec3 amber     = vec3(0.860, 0.460, 0.020);  // amber accent
```

Colors are in **linear RGB** (0.0–1.0 range). To convert from hex:
- `#ff5500` → `vec3(1.0, 0.33, 0.0)`

**Warm palette (current):** Deep black → Navy → Electric Blue → Purple → Orange/Amber  
**Cool alternative:** Remove orange/amber, replace with cyan: `vec3(0.0, 0.8, 0.9)`  
**Monochrome:** Use only grays and one accent hue

---

## ⏱️ How to Adjust Animation Speed

In `WebGLBackground.tsx`, find these lines in the GLSL `main()` function:

```glsl
// Auto-rotation speed
float angle = u_time * 0.09;   // ← SLOWER = less, FASTER = more (e.g. 0.05 to 0.15)

// FBM layer speeds
vec3 q = vec3(rotP * 1.2, u_time * 0.065);   // primary flow speed
float f2 = fbm(vec3(..., u_time * 0.045 ...)); // secondary layer
float f3 = fbm(vec3(..., u_time * 0.035 ...)); // tertiary layer
```

**Slow, meditative:** multiply all `u_time` factors by 0.5  
**Energetic:** multiply all by 2.0  
**Recommended range:** 0.03 – 0.12 for each layer

---

## 🖱️ How to Control Mouse Interaction Intensity

In the GLSL `main()` function:

```glsl
// Mouse field-of-influence radius
float mouseInfluence = exp(-mouseDist * mouseDist * 2.2) * u_mouse_ease;
//                                                   ^^^ increase = tighter focus, decrease = wider spread

// Mouse warp strength
vec2 warp = (mouseP - p) * mouseInfluence * 0.45;
//                                          ^^^^ increase = stronger distortion (try 0.3 – 0.8)

// Mouse glow intensity
color = mix(color, glowColor * 0.9, mouseInfluence * 0.28);
//                                                    ^^^^ glow brightness (0.1 – 0.5)
```

In `WebGLBackground.tsx` React code, adjust the **smoothing speed**:
```ts
const ease = 0.055;  // ← Mouse lag (0.02 = very laggy, 0.15 = snappy)
```

---

## 📱 Mobile Behavior

On mobile (no cursor), the gradient auto-animates smoothly with no mouse input. The `u_mouse_ease` uniform fades to 0 when the cursor leaves the window, giving a graceful transition.

For reduced-motion preference (`prefers-reduced-motion: reduce`), CSS animations are disabled automatically via the global stylesheet.

---

## ⚡ Performance Notes

- WebGL renders at `min(devicePixelRatio, 2)` — prevents excessive GPU load on Retina displays
- FBM uses 3–5 octaves (tunable in the shader `fbm()` call)
- `requestAnimationFrame` with resize observer for efficient rendering
- All animations use `will-change: transform` where appropriate
- Framer Motion's `useReducedMotion` disables entrance animations for accessibility

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| 3D/Shader | Custom WebGL / GLSL |
| Fonts | Syne (display) + Inter (body) |
