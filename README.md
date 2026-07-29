# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## Rails cinematic studio surface

The current Rails application has a separate instrument-panel marketing layout for the homepage, About, and Contact. Blog, pricing, work/case-study, authentication, and portal templates remain on the existing visitor or admin layouts.

### Setup and builds

The Rails application still uses importmap for its established Hotwire and portal code. The cinematic marketing code is a small esbuild entry instead of import-mapping Three.js: bundling makes the large 3D dependency tree-shakeable and avoids fragile pin-by-pin `three/examples` loading.

```bash
bundle install
npm ci --prefix nextjs
bin/build-studio
bin/rails tailwindcss:build
bin/rails server
```

`bin/build-studio` creates two deferred ESM assets:

- `studio.js` contains Stimulus-mounted Lenis/GSAP orchestration.
- `studio_scene.js` contains Three.js and is requested only on the homepage after the capability gate passes.

The compiled files are committed under `app/assets/builds` so the existing Rails Docker image can precompile assets without installing Node. Run `bin/build-studio` after changing anything under `app/javascript/studio`.

### Tokens and typography

The canonical tokens live in `app/assets/stylesheets/_tokens.css`. `--brand: #02D8FB` and `--brand-deep: #011947` were extracted offline from `public/images/mwlogo-bg.png`; that source and extraction date are recorded in the file. Archivo Expanded, Inter Tight, and Martian Mono are copied from the installed `@fontsource-variable` packages into `public/fonts`, so the studio surface makes no Google Fonts request.

### Scroll and scene architecture

`app/javascript/studio/index.js` creates Lenis, connects it to the single GSAP ticker, and writes the one page-wide `ScrollTrigger` progress value into the module-scoped `scrollState` object. `app/javascript/studio/scene.js` reads and damps that value on the same ticker. No DOM state is updated per scroll event and no second `requestAnimationFrame` loop is created.

The preloader combines real `document.fonts` readiness with the Three.js `LoadingManager` progress for `public/brand/ampersand.svg`. It exits with one upward wipe when both are ready.

### Ampersand geometry

`public/brand/ampersand.svg` is a hand-authored `0 0 100 100` outline in one path element. Three.js loads that file with `SVGLoader`, creates shapes, extrudes them with a chamfered bevel, merges vertices, recomputes normals, then centers and normalizes the result.

To replace it:

1. Keep a `viewBox="0 0 100 100"` and one closed path element.
2. Preserve `fill-rule="evenodd"` when the replacement has counters.
3. Update `public/studio/ampersand-poster.svg` to match.
4. Run `bin/build-studio` and test both WebGL and fallback paths.

### Fallback and performance choices

The static poster is the default. The Three.js scene is skipped for reduced motion, missing WebGL2, `deviceMemory < 4`, or a coarse pointer on a small viewport. It uses a procedural 128/256 px cube environment, clamps DPR to 1–1.75, drops to DPR 1 and disables shadows after sustained low FPS, and stops rendering when the tab or fixed canvas is not visible. No HDRI, postprocessing, runtime font request, or remote 3D asset is used.

The page remains complete and convertible without JavaScript or WebGL: the full headline, services, case studies, proof, contact form, WhatsApp rail, and static ampersand are server-rendered.
