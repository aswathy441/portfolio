# LuxBuild v3 – Next.js + Three.js (WebGL) + GSAP ScrollTrigger + Lenis
npm install && npm run dev  → http://localhost:3000
- 3D house: components/Scene.js (materials, stages, lights). Per-section camera keyframes: `K` in app/page.js
- Replace illustrated images in public/images with real photos (same filenames or edit paths in app/page.js)
- Content arrays are at the top of app/page.js; colours in app/globals.css (:root)


## Updated visual assets

This package includes locally stored architectural photography-style image assets in `public/images/*.jpg`. The original SVG assets are retained as fallbacks, and the page now references the JPG assets. The existing Three.js / React Three Fiber house scene, GSAP ScrollTrigger choreography, Lenis scrolling, sections, navigation, and form interaction remain in place.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a production check, run `npm run build`.
