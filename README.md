
# Endovia Wealth Central

This is a **Next.js** application. Use this guide to install dependencies, build the project, and manage it in production with **PM2**.

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npx next build
```

### 3. Start the Application with PM2

```bash
pm2 start npm --name "maxspike-central" -- start
```

> This starts the Next.js server using PM2 under the process name `maxspike-central`.

### 4. Stop the Application

```bash
pm2 stop maxspike-central
```

### 5. Save PM2 Process List (for startup persistence)

```bash
pm2 save
```

This saves the current PM2 process list so it can be resurrected on server restart.

---

## 📂 Project Structure

Common folders you may find in this Next.js project:

* `pages/` – Your route-based React components.
* `components/` – Reusable UI components.
* `public/` – Static assets like images.
* `styles/` – Global and modular CSS.

---

## ✅ Prerequisites

* Node.js (v16+ recommended)
* npm
* [PM2](https://pm2.keymetrics.io/) globally installed:

```bash
npm install -g pm2
```

---

## 🔁 Optional: Auto-Startup on Server Reboot

To enable automatic restarts on system boot:

```bash
pm2 startup
```

Follow the on-screen instructions, then run:

```bash
pm2 save
```

---

##########
if editied :
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ pm2 stop endovia-central
[PM2] Applying action stopProcessId on app [endovia-central](ids: [ 0 ])
[PM2] [endovia-central](0) ✓
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ endovia-central    │ fork     │ 0    │ stopped   │ 0%       │ 0b       │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ pm2 delete endovia-central
[PM2] Applying action deleteProcessId on app [endovia-central](ids: [ 0 ])
[PM2] [endovia-central](0) ✓
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ pm2 delete maxspike-central
[PM2][ERROR] Process or Namespace maxspike-central not found
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ pm2 delete endovia-central
[PM2][ERROR] Process or Namespace endovia-central not found
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ pm2 start npm --name "endovia-wealth-central" -- start
[PM2] Starting /usr/bin/npm in fork_mode (1 instance)
[PM2] Done.
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ endovia-wealth-ce… │ fork     │ 0    │ online    │ 0%       │ 7.4mb    │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ pm2 save
[PM2] Saving current process list...
[PM2] Successfully saved in /home/algolinux/.pm2/dump.pm2
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ pm2 list
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ endovia-wealth-ce… │ fork     │ 0    │ online    │ 0%       │ 69.8mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
algolinux@algolinux:~/Documents/workspace/GitHub/MaxSpike_Centeral_Dashboard$ 