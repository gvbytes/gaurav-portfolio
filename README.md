# gvbytes.com

My personal portfolio site. Built from scratch with plain HTML, CSS, and JavaScript — no frameworks, no build step.

## What's in here

- **3D animated background** using Three.js — floating geometric shapes that respond to the current theme
- **Interactive physics playground** — gravity, vacuum, black hole, and explode modes that let you fling the page content around
- **GitHub projects** pulled live from the API, so the site stays up to date whenever I create or delete a repo
- **TryHackMe & LeetCode progress** auto-updated every 12 hours via a GitHub Action
- **TrustHouse section** — a startup project I'm actively building
- **Dark / light theme** toggle with smooth transitions across the entire page
- Fully responsive down to 320px screens

## Tech

- Vanilla HTML / CSS / JS
- Three.js (loaded from CDN) for the background scene
- GitHub REST API for live project cards
- GitHub Actions + Python for TryHackMe and LeetCode data sync

## Live

**[gvbytes.com](https://gvbytes.com)**

## Security Research

### SRM Secure Browser (v1.0.22) Vulnerability Report
I did some security research on the SRMUG-Secure-Browser app used for online exams and found a few serious issues. I reported them to the SRM tech team via email, but never got any response.

Here's the quick breakdown of what I found:
* **Hardcoded AES Keys**: The app was decrypting Firebase database configurations and WebRTC ICE credentials in the renderer using hardcoded AES keys. Anyone could extract these and gain full read/write access to the database.
* **Proctoring Bypass**: The `postMessage` handler in `preload.js` had no origin check. Any site running inside an iframe or custom script could tell the browser to stop proctoring, shutting down webcam and screen sharing feeds without warnings.
* **Client-Side Grading**: Correct exam answers were stored in `localStorage` and graded client-side before the final submit. This made it trivial to dump the answer key or manipulate the exam score.

I have uploaded the full generated review report as proof: **[srm-secure-browser-report.html](srm-secure-browser-report.html)** (also hosted live at [gvbytes.com/srm-secure-browser-report.html](https://gvbytes.com/srm-secure-browser-report.html)).
