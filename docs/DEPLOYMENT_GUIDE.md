# 🚀 QodeQuant Production Deployment Guide (Vercel + Render + Cloud MySQL + GoDaddy)

Yeh guide aapko step-by-step batayegi ki **QodeQuant** ko free cloud services par kaise live deploy karna hai aur GoDaddy domain kaise connect karna hai.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client[User Browser / Students / Teachers] -->|yourdomain.com| Vercel[Vercel Global CDN (Frontend React + Vite)]
    Vercel -->|API Requests / WebSockets| Render[Render.com (Node.js + Express Backend)]
    Render -->|SQL Queries| CloudDB[(Cloud MySQL: Aiven.io / TiDB / Railway)]
    GoDaddy[GoDaddy Domain DNS] -->|A Record & CNAME| Vercel
    GoDaddy -->|api CNAME| Render
```

---

## ⚡ Step 1: GitHub par Code Push Karein

Aapka local project already deployment-ready configure kar diya gaya hai (`VITE_API_URL`, `vercel.json`, `DATABASE_URL` support, production scripts).

Terminal me yeh commands run karein:
```bash
git add .
git commit -m "Configure fullstack deployment for Vercel and Render"
git push origin main
```

---

## 🗄️ Step 2: Free Cloud MySQL Database Setup (Aiven.io / Railway)

Kyuki aapka local MySQL sirf aapke computer par chalta hai, internet par chalane ke liye ek free cloud MySQL database chahiye.

### Option A: Aiven.io (Recommended - 100% Free Forever, 5GB Storage)
1. **[Aiven.io](https://aiven.io/)** par jayein aur **Sign Up / Log in with Google** karein.
2. **Create New Service** par click karein -> **MySQL** select karein.
3. Cloud Provider me **AWS** ya **Google Cloud** aur Region me **India (Mumbai)** ya koi bhi free region select karein.
4. Plan me **Free Tier** select karein.
5. Service name: `qodequant-db` -> **Create Service**.
6. Jab status **Running** ho jaye:
   - **Service URI** copy karein: `mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED`
   - Ya alag se `Host`, `Port`, `User`, `Password`, `Database` note kar lein.

*(Note: Backend me SSL automatically handle ho jayega).*

---

## 🖥️ Step 3: Backend Deploy Karein (Render.com)

1. **[Render.com](https://render.com/)** par jayein aur **Log in with GitHub** karein.
2. Click **New +** -> Select **Web Service**.
3. Apna GitHub repository `RANSH-ai/QodeQuant` select karein.
4. Settings fill karein:
   - **Name**: `qodequant-api` (ya koi bhi naam)
   - **Region**: Singapore / Frankfurt (India ke paas)
   - **Branch**: `main`
   - **Root Directory**: `backend`  *(⚠️ Important: ise `backend` rakhein)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. **Environment Variables** add karein:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Aapka Aiven/Cloud MySQL Service URI |
   | `DB_SSL` | `true` |
   | `PORT` | `10000` |
   | `JWT_SECRET` | Koi bhi strong secret string (e.g. `QodeQuantSuperSecureKey2026!`) |
   | `GMAIL_USER` | `pranavpriyadarshi000@gmail.com` (ya aapka Gmail) |
   | `GMAIL_APP_PASSWORD` | Aapka Gmail 16-character App Password |
   | `GOOGLE_CLIENT_ID` | Aapka Google Auth Client ID (optional) |
   | `NODE_ENV` | `production` |

6. Click **Create Web Service**.
7. 2-3 minute me backend build hokar live ho jayega!
8. Top par aapko backend URL milega, jaise:
   👉 `https://qodequant-api.onrender.com`
   *(Ise copy kar lein, yeh frontend me lagega).*

---

## 🌐 Step 4: Frontend Deploy Karein (Vercel.com)

1. **[Vercel.com](https://vercel.com/)** par jayein aur **Log in with GitHub** karein.
2. Click **Add New...** -> **Project**.
3. Apna GitHub repository `QodeQuant` select karein aur **Import** click karein.
4. Project Configuration:
   - **Root Directory**: Click *Edit* -> Select **`frontend`** directory -> Click *Continue*.
   - **Framework Preset**: `Vite` (automatically detected).
5. **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://qodequant-api.onrender.com` *(Step 3 me mila Render URL)*
6. Click **Deploy**.
7. 1 minute me aapka frontend live ho jayega aur aapko ek Vercel URL milega (e.g. `https://qodequant.vercel.app`).

---

## 🏷️ Step 5: GoDaddy Domain Connect Karein

Ab apna custom domain (jaise `qodequant.com`) connect karein:

### A. Vercel me Domain Add Karein:
1. Vercel Dashboard me apne project par jayein -> **Settings** -> **Domains**.
2. Apna domain enter karein: `yourdomain.com` aur click **Add**.
3. Vercel automatically dono domains add karega:
   - `yourdomain.com`
   - `www.yourdomain.com`
4. Vercel aapko exact DNS records dikhayega:
   - **A Record**:
     - Name / Host: `@`
     - Value: `76.76.21.21`
   - **CNAME Record**:
     - Name / Host: `www`
     - Value: `cname.vercel-dns.com`

### B. GoDaddy DNS Management me Update Karein:
1. **[GoDaddy.com](https://godaddy.com)** me login karein.
2. Top-right me profile icon -> **My Products** -> Apne domain ke samne **DNS** par click karein.
3. DNS Records me:
   - **A Record** add/edit karein:
     - **Type**: `A`
     - **Name**: `@`
     - **Value**: `76.76.21.21`
     - **TTL**: `1/2 Hour` ya `Default`
   - **CNAME Record** add/edit karein:
     - **Type**: `CNAME`
     - **Name**: `www`
     - **Value**: `cname.vercel-dns.com`
     - **TTL**: `1/2 Hour` ya `Default`
4. Click **Save**.

### C. (Optional) Custom Backend Domain (e.g. `api.yourdomain.com`):
Agar aap chahte hain ki backend bhi aapke domain par chale:
1. Render me `qodequant-api` Web Service -> **Settings** -> **Custom Domains** -> Add `api.yourdomain.com`.
2. GoDaddy me ek naya CNAME Record add karein:
   - **Type**: `CNAME`
   - **Name**: `api`
   - **Value**: Render dwara diya gaya hostname (e.g. `qodequant-api.onrender.com`)
3. Vercel me jakar `VITE_API_URL` ko change karke `https://api.yourdomain.com` kar dein aur **Redeploy** kar dein!

---

## 🔒 Step 6: Initial Super Admin Setup on Production

Deploy hone ke baad:
1. Website open karein: `https://yourdomain.com/admin/login`
2. Seeded accounts automatically cloud database me create ho jayenge:
   - **Super Admin**: `superadmin@qodequant.com` | Password: `SuperAdmin@2026`
   - **Personal Super Admin**: `swatikumarisuman2@gmail.com` | Password: `Admin@123`
   - **Content Admin**: `admin@qodequant.com` | Password: `Admin@2026`
3. Terminal me jakar login karein aur apna master password change karna chahein toh SuperAdmin dashboard se kar sakte hain.

---

## ✅ Deployment Checklist

- [x] Frontend SPA router rewrite config (`frontend/vercel.json`) added.
- [x] Central dynamic API base URL (`frontend/src/apiConfig.js`) configured.
- [x] All 14 frontend components updated to use `API_BASE_URL`.
- [x] Backend `package.json` `start` script added.
- [x] Backend database adapter updated with Cloud MySQL `DATABASE_URL` and SSL support.
- [x] Local `.gitignore` updated to prevent uploading build artifacts and temporary files.
- [x] Production build tested and verified (`npm run build` passed with zero errors).
