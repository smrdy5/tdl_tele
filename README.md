# Capstone Project Portal - AI Invoice Generation for M.Y.H Business and Tax Consultant

Full-stack Team Task Management Web Application with **Telegram Push Notifications** and **Google Sheets Database Integration**.

---

## 🌟 Key Features

- **Team Task Management**: Assign tasks, update status (`todo`, `in_progress`, `completed`), set priorities, track due dates, and log work hours.
- **Telegram Bot Push Alerts**: Real-time push notifications sent via Telegram Bot API on task assignment, status updates, and custom alerts.
- **Google Drive & Google Sheets Database**: Dual-mode database supporting live sync with Google Sheets (via Google Apps Script API) and local JSON fallback.
- **Secure Authentication**: Server-side password hashing (PBKDF2 SHA-512 with 16-byte random salts), timing-safe verification, and session management.
- **Clean UI**: Modern dark sidebar navigation, project stats cards, interactive task tables, and full responsive layout.

---

## 🚀 Live Deployment Guide

### Backend Server Deployment (Render)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### Frontend Client Deployment (Vercel)
- **Framework**: `Vite`
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 📁 Repository Structure

```
tdl_tele/
├── client/              # React + Vite + Tailwind CSS Frontend
├── server/              # Express API Server + Telegram & Google Sheets drivers
├── google_apps_script.gs # Google Apps Script template for Google Sheets DB
├── render.yaml          # Render Blueprint configuration
├── README.md            # Project Documentation
└── package.json         # Root package configuration
```
