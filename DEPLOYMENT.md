# Smart Habesha Streamer - Deployment Guide

This guide covers how to deploy the backend to Render.com and run the frontend on your device.

## Backend Deployment (Render.com)

1. **Commit your code to GitHub**
   - Push the `backend` folder to a GitHub repository.

2. **Create a Web Service on Render**
   - Go to [dashboard.render.com](https://dashboard.render.com/).
   - Click "New +" -> "Web Service".
   - Connect your GitHub repository.
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

3. **Get your URL**
   - Render will give you a URL like `https://smart-habesha-backend.onrender.com`.

## Frontend Configuration

1. **Update Config**
   - Open `frontend/config.js`.
   - Replace the `API_BASE_URL` with your Render URL.
     ```javascript
     const API_BASE_URL = 'https://smart-habesha-backend.onrender.com';
     ```

2. **Run the App**
   - In terminal: `cd frontend`
   - Run `npx expo start`
   - Scan the QR code with your phone (Expo Go app) or press `a` for Android Emulator.

## Usage

1. Open the app.
2. Enter a URL of a page containing a video player (e.g., from the target site).
3. The app will play the video and list other episodes if found.
