# Simple Deployment Guide - Vercel + Railway

## What You Need
- GitHub account
- Vercel account (free) - https://vercel.com
- Railway account (free) - https://railway.app

---

## Step 1: Push Your Code to GitHub

1. **Create a GitHub repository:**
   - Go to github.com and create a new repository
   - Name it `tunegie` (or whatever you want)

2. **Push your code:**
   ```powershell
   cd C:\laragon\www\Tunegie
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tunegie.git
   git push -u origin main
   ```

---

## Step 2: Deploy Backend + Database to Railway

1. **Go to railway.app and sign up/login**

2. **Create a new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `tunegie` repository
   - Select the `backend` folder as root directory

3. **Add MySQL Database:**
   - Click "+ New"
   - Select "Database" → "Add MySQL"
   - Railway will auto-create the database

4. **Set Environment Variables:**
   - Click on your backend service
   - Go to "Variables" tab
   - Railway auto-sets MySQL variables
   - Add manually:
     - `JWT_SECRET` = `your-random-secret-key-123`
     - `FRONTEND_URL` = (leave blank for now, we'll update this)

5. **Generate Domain:**
   - Click "Settings" tab
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://tunegie-backend.up.railway.app`)
   - **Save this URL!**

6. **Update FRONTEND_URL:**
   - Go back to "Variables"
   - Set `FRONTEND_URL` to your future Vercel URL (we'll update after Step 3)

---

## Step 3: Deploy Frontend to Vercel

1. **Go to vercel.com and sign up/login**

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Select your `tunegie` repository
   - Click "Import"

3. **Configure the project:**
   - **Root Directory:** Select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     - `REACT_APP_TIDAL_CLIENT_ID` = `laOGzXDNPscgPTMY`
     - `REACT_APP_TIDAL_CLIENT_SECRET` = `S3zJyzoU7P2nz73sWxQChVCYmZVTwsI4F7qKyhEVHfg=`
     - `NODE_ENV` = `production`

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your Vercel URL (e.g., `https://tunegie.vercel.app`)

6. **Update vercel.json:**
   - Edit `frontend/vercel.json`
   - Replace `"dest": "https://your-backend-url.railway.app/$1"`
   - With your actual Railway backend URL
   - Commit and push:
     ```powershell
     git add frontend/vercel.json
     git commit -m "Update backend URL"
     git push
     ```
   - Vercel will auto-redeploy

---

## Step 4: Update Backend FRONTEND_URL

1. **Go back to Railway**
2. **Click on your backend service**
3. **Go to "Variables" tab**
4. **Update `FRONTEND_URL`** with your Vercel URL
5. **Redeploy** (Railway will auto-redeploy)

---

## Step 5: Initialize Database

1. **Download your database schema:**
   - Make sure `database/schemas/setup_database.sql` is in your repo

2. **Railway MySQL Connection:**
   - In Railway, click on your MySQL database
   - Click "Connect" tab
   - Copy the connection string or individual credentials

3. **Connect with MySQL client:**
   ```bash
   mysql -h <host> -P <port> -u root -p
   ```
   - Paste password when prompted

4. **Run the schema:**
   ```sql
   CREATE DATABASE IF NOT EXISTS tunegie_db;
   USE tunegie_db;
   SOURCE path/to/setup_database.sql;
   ```

   **OR upload via Railway:**
   - Click on MySQL database
   - Go to "Data" tab
   - Click "Query"
   - Paste your SQL schema and execute

---

## Step 6: Test Your Deployment

1. **Open your Vercel URL** (e.g., `https://tunegie.vercel.app`)
2. **Try registering** a new user
3. **Play a game** to test the full stack

---

## Troubleshooting

### Frontend can't reach backend
- Check `vercel.json` has correct Railway URL
- Check Railway backend is running
- Check CORS settings in `backend/php/config/config.php`

### Database connection fails
- Verify environment variables in Railway
- Check MySQL database is running
- Ensure schema was uploaded correctly

### View Logs
- **Railway:** Click service → "Deployments" → Click deployment → "View Logs"
- **Vercel:** Project → "Deployments" → Click deployment → "Logs"

---

## Updating Your App

### Frontend Changes:
```powershell
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys!

### Backend Changes:
```powershell
git add .
git commit -m "Update backend"
git push
```
Railway auto-deploys!

---

## Cost
- **Railway Free Tier:** $5 credit/month (enough for small apps)
- **Vercel Free Tier:** Unlimited for personal projects
- **Total:** FREE for hobby projects! 🎉

---

## Custom Domain (Optional)

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Railway:
1. Go to Service → Settings → Domains
2. Add custom domain
3. Update DNS records

---

## Need Help?
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
