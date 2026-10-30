# Turning AI Recipe Finder into an Android app (beginner guide)

## What is where
- `www/index.html`  : the website (this is what the app shows)
- `server.js`       : the backend (runs on Vercel, NOT inside the app)
- `android/`        : the Android Studio project Capacitor generated
- `capacitor.config.ts` : app name and id

The app is a window showing your website. When you press "Generate", it calls your
Vercel backend over the internet, exactly like the website does.

## One-time setup on your computer
1. Install Node.js (LTS, version 22 or newer): https://nodejs.org
2. Install Android Studio: https://developer.android.com/studio
   Open it once and let it download the SDK when asked.
3. In VS Code: File > Open Folder > choose this project folder.
4. Open the VS Code terminal (Terminal > New Terminal) and run:
   `npm install`

## Step 1: tell the app where your backend lives
1. Open `www/index.html`, search for `BACKEND_URL`.
2. Replace `https://YOUR-PROJECT.vercel.app` with your real Vercel address.
3. Make sure the latest `server.js` (it contains the CORS block) is deployed to Vercel.
   Without CORS the app cannot reach the backend.

## Step 2: copy your website into the app
Every time you change `www/index.html`, run in the terminal:
`npx cap sync android`

## Step 3: run it
1. `npx cap open android`  (opens Android Studio)
2. Wait for the bottom bar "Gradle sync" to finish (first time takes several minutes).
3. Choose a device at the top:
   - Emulator: Tools > Device Manager > Create Device (e.g. Pixel 7), or
   - Your phone: Settings > About phone > tap "Build number" 7 times, then
     Developer options > turn on USB debugging, plug in the cable, tap "Allow".
4. Press the green Run button.

## Step 4: make an installable file
Android Studio > Build > Build Bundle(s) / APK(s) > Build APK(s).
The APK appears in `android/app/build/outputs/apk/debug/`. Send it to a phone to install.
(For Google Play you need a signed release bundle; ask Claude when you get there.)

## If something goes wrong
- App opens but Generate / chat fails: BACKEND_URL is wrong, or the new server.js
  with CORS is not deployed yet.
- Camera scan does nothing: allow the Camera permission in the phone's app settings.
- "SDK location not found": in Android Studio open File > Project Structure, or just
  open the `android` folder via `npx cap open android` and let it configure itself.
