# Firebase Setup Instructions

To connect your blog to a real Firebase database, follow these steps:

1.  **Create a Firebase Project**:
    *   Go to [console.firebase.google.com](https://console.firebase.google.com/) and create a new project.

2.  **Enable Firestore**:
    *   In the Firebase console, go to **Build > Firestore Database**.
    *   Click **Create Database**.
    *   Start in **Test mode** (for development) or **Production mode** (remember to set rules later).

3.  **Get Configuration**:
    *   Go to **Project Settings** (gear icon).
    *   Scroll down to **Your apps** and add a **Web** app.
    *   Copy the `firebaseConfig` object properties.

4.  **Update Environment Variables**:
    *   Rename `.env.example` to `.env.local` in your project root.
    *   Fill in the values from your Firebase config:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
        NEXT_PUBLIC_FIREBASE_APP_ID=...
        ```

5.  **Restart Development Server**:
    *   Run `npm run dev` again to load the new environment variables.

6.  **Add Data**:
    *   Go to Firestore in the console.
    *   Create a collection named `posts`.
    *   Add documents with the following fields:
        *   `title` (string)
        *   `slug` (string)
        *   `excerpt` (string)
        *   `content` (string, HTML supported)
        *   `coverImage` (string, URL)
        *   `tags` (array of strings)
        *   `createdAt` (number, use Timestamp or Date.now())

The app will automatically switch from Mock data to Live data once it detects posts in Firestore!
7.  **Enable Firebase Storage CORS**:
    *   Firebase Storage requires a CORS policy to allow uploads from your local development environment.
    *   See the [Firebase Storage CORS Guide](file:///Users/afnizanfaizal/.gemini/antigravity/brain/680b8839-bc8e-4c2e-9092-2fd7b7f613af/FIREBASE_STORAGE_CORS.md) for detailed instructions.
