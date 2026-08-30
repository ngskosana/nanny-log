# Nanny Log Application

A lightweight, mobile-friendly web application for logging a toddler's daily schedule and activities in real-time. Built with React, Vite, Tailwind CSS, and Firebase Firestore.

## Features
- **Offline Sync**: Logs events even without Wi-Fi; automatically syncs when reconnected.
- **Summary Dashboard**: At-a-glance view of sleep, nappies, and meals.
- **Sleep & Nap Tracker**: Automatic nap calculation with target alerts.
- **Feeding & Nappy Log**: Quick-tap inputs designed for one-handed mobile use.
- **Daily Notes**: Shared communication between parents and nanny.

---

## 1. Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

---

## 2. Firebase Project Setup

To enable the backend data storage and real-time sync, you need a Firebase project.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Firestore Database** and click **Create Database**.
   - Choose a location close to you.
   - Start in **Test Mode** (we will update the security rules later).
3. Navigate to **Project Settings** (gear icon) > **General**.
4. Scroll down to "Your apps" and click the **Web** (`</>`) icon to register a new web app.
5. Copy the `firebaseConfig` object provided.
6. Open `src/firebase.js` in this repository and replace the placeholder `firebaseConfig` with your actual credentials.

### Firestore Security Rules

To secure your data while allowing offline capabilities, go to **Firestore Database** > **Rules** and paste the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allows anyone to read/write. 
    // FOR PRODUCTION: Implement Firebase Authentication and restrict to specific User IDs!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
*Note: Since this app currently does not use Firebase Authentication, the rules are open. If you expose this on the public internet, it is highly recommended to add Firebase Auth and restrict access.*

---

## 3. GitHub Pages Deployment

To host this static site for free on GitHub Pages:

1. **Configure Vite Base Path**
   If you are deploying to `https://<USERNAME>.github.io/<REPO>/`, open `vite.config.js` and add the `base` property:
   ```javascript
   export default defineConfig({
     plugins: [react(), tailwindcss()],
     base: '/nanny-log/', // Replace with your repository name!
   })
   ```

2. **Update Package.json**
   Add the following package to handle deployment easily:
   ```bash
   npm install -D gh-pages
   ```
   Add a deploy script to your `package.json` scripts:
   ```json
   "scripts": {
     // ... other scripts
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**
   Run the following command to build and deploy your application:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**
   Go to your GitHub repository **Settings** > **Pages**.
   Under **Build and deployment**, ensure the source is set to `Deploy from a branch` and select the `gh-pages` branch. Your site will be live shortly!
