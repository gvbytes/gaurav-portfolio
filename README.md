# gvbytes.com

Personal cybersecurity & developer portfolio site of **Gaurav Verma**. Built from scratch with vanilla HTML5, CSS3, JavaScript, and Three.js — no heavy frameworks or bloated build steps.

## Highlights & Features

- **3D Voxel Sky-Isle Diorama**: Built with Three.js — a floating 16-bit voxel island featuring procedural pine trees, mountain peaks, and orbiting moon & cloud rigs with real-time mouse parallax and responsive camera scaling.
- **Authentic DOM Text Physics Engine**: Real-time interactive physics powered by a custom physics engine (Gravity, Vacuum, Black Hole Vortex, and Kinetic Explode) with a complete DOM snapshot-and-restore system ensuring 100% fidelity on reset.
- **Dynamic GitHub Public Repositories**: Automatically fetches and renders public non-forked security and programming projects live from the GitHub REST API, categorized with language pills and live star metrics.
- **Live Hacker Kali Terminal**: Interactive Linux terminal with dynamic `ls ~/projects | wc -l` counter reflecting public repository count in real-time.
- **Learning & CTF Progress Tracker**: Automated GitHub Action syncing TryHackMe and LeetCode profile metrics every hour.
- **Verified Credentials**: Certified LLM Security Professional (CLLMSP) from Red Team Leaders.
- **Responsive & Mobile-Optimized**: Designed for desktop and mobile devices down to 320px screens, featuring a compact mobile navigation drawer and streamlined single-row physics controls.

## Tech Stack

- **Frontend**: Vanilla HTML5, Modern CSS3 (Custom Variables, Grid, Flexbox, CRT Scanlines, Glassmorphism), Vanilla ES6+ JavaScript
- **3D Graphics**: Three.js (WebGL)
- **APIs & Automation**: GitHub REST API, GitHub Actions, Python 3 data sync scripts
- **Typography**: VT323, DotGothic16, Space Grotesk, JetBrains Mono

## Live Website

**[gvbytes.com](https://gvbytes.com)**

---

## Security Research

### SRM Secure Browser (v1.0.22) Vulnerability Report
Security research and vulnerability audit conducted on the SRMUG-Secure-Browser application used for remote proctored online examinations:

- **Hardcoded AES Keys**: The application decrypted Firebase database configurations and WebRTC ICE credentials in the renderer process using hardcoded symmetric AES keys, allowing unauthorized full read/write access to the central database.
- **Proctoring Bypass**: The `postMessage` handler in `preload.js` lacked strict origin validation. Any site running inside an iframe or custom script could command the browser to terminate proctoring processes, disabling webcam and screen monitoring feeds silently without alert.
- **Client-Side Grading**: Correct exam answers were cached in `localStorage` and graded on the client side before final submission, making it trivial to extract the full answer key or manipulate submission scores.

Full generated security review report: **[srm-secure-browser-report.html](srm-secure-browser-report.html)** (also hosted live at [gvbytes.com/srm-secure-browser-report.html](https://gvbytes.com/srm-secure-browser-report.html)).
