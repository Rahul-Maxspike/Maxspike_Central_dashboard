
# MaxSpike Central

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

