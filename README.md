# Personal Blog Platform

A modern, full-featured blog platform built with Next.js 16, Firebase, and TypeScript. Features a powerful admin dashboard, real-time analytics, and a beautiful reading experience.

## ✨ Features

### 🎨 Frontend
- **Modern Design**: Clean, responsive UI with dark mode
- **Blog Posts**: Rich text editor with image support
- **Projects Showcase**: Dedicated section for portfolio projects
- **Share Functionality**: One-click URL copying for easy sharing
- **Analytics Tracking**: Real-time visitor and post view tracking

### 🛠️ Admin Dashboard
- **Post Management**: Create, edit, and delete blog posts
- **Rich Text Editor**: Quill-based editor with formatting options
- **Category & Tag Management**: Organize content efficiently
- **Analytics Dashboard**: View visitor stats, top posts, and geographic data
- **Media Management**: Upload and manage images
- **1MB Content Protection**: Automatic size validation to prevent Firestore limits

### 📊 Analytics
- **Visitor Tracking**: Daily visitor statistics with charts
- **Top Posts**: See which content performs best
- **Geographic Data**: Track visitors by country
- **View Counts**: Individual post view tracking

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Styling**: CSS Modules
- **Charts**: Recharts
- **Editor**: React Quill

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Set up Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Set up security rules (see `FIREBASE_SETUP.md`)

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[Firebase Setup](FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[User Guide](USER_GUIDE.md)** - How to use the admin dashboard

## 🎯 Key Features Explained

### Smart Category Logic
- Selecting "Projects" automatically disables other categories
- Ensures clean separation between blog posts and portfolio projects

### Content Size Protection
- Real-time payload size monitoring
- Automatic warnings when approaching Firestore's 1MB limit
- Blocks submission of oversized content
- Prevents large Base64 images from being pasted

### Share Button
- One-click URL copying to clipboard
- Visual feedback with "Copied!" confirmation
- Works across all modern browsers

## 🔒 Security

- Environment variables are never committed to git
- Firebase security rules enforce authentication
- Admin routes are protected
- Input validation on all forms

## 📦 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use this project for your own blog.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Charts by [Recharts](https://recharts.org/)
- Editor by [React Quill](https://github.com/zenoamaro/react-quill)

---

Made with ❤️ using Next.js and Firebase
