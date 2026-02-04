# User Guide: Personal Web Blog

This is a premium, high-performance personal blog built with **Next.js 14**, **TypeScript**, and **Firebase (Firestore)**, styled with modern **Vanilla CSS**.

## Features
-   **Modern UI**: Glassmorphism, glows, and smooth transitions.
-   **Dark Mode**: Native dark theme optimized for developers.
-   **Datbase**: Integrated with Firebase Firestore.
-   **Hybrid Data**: Falls back to mock data if Firebase is not connected.
-   **SEO Ready**: Semantic HTML and performance optimizations.

## Getting Started

### 1. Installation
Install the dependencies:
```bash
npm install
```

### 2. Development
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

### 3. Firebase Configuration
To use real data instead of mock data:
1.  Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/).
2.  Enable **Firestore Database** in Test Mode.
3.  Go to Project Settings -> General -> Your apps -> Web app -> Create new.
4.  Copy the config keys.
5.  Rename `.env.example` to `.env.local` and paste your keys.
6.  Restart the dev server.

### 4. Managing Content
You can add posts directly in the Firestore Console (Collection: `posts`).
**Required Fields:**
-   `title` (string)
-   `slug` (string) - *Must be unique*
-   `content` (string) - *HTML supported*
-   `excerpt` (string)
-   `coverImage` (string) - *URL to image*
-   `createdAt` (number) - *Timestamp*

## Project Structure
-   `src/app`: Pages and Layouts (Next.js App Router).
-   `src/components`: Reusable UI components (Navbar, Footer, Hero, PostCard).
-   `src/lib`: Firebase and utility functions.
-   `public`: Static assets (images).

## Building for Production
```bash
npm run build
npm start
```
