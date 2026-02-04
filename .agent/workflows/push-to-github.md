---
description: how to push the project to GitHub repository
---

1. **Create a GitHub Repository**:
   - Log in to your GitHub account.
   - Click the **+** icon in the top right corner and select **New repository**.
   - Give it a name (e.g., `project-match`) and click **Create repository**.
   - Copy the repository URL (e.g., `https://github.com/your-username/project-match.git`).

2. **Initialize Git Locally**:
   - Open your terminal in the project root.
   - Run: `git init`

3. **Stage and Commit Files**:
   - Run: `git add .`
   - Run: `git commit -m "initial commit: project match portal with firebase integration"`

4. **Connect to GitHub**:
   - Run: `git branch -M main`
   - Run: `git remote add origin YOUR_REPOSITORY_URL` (replace with the URL you copied in step 1)

// turbo
5. **Push to GitHub**:
   - Run: `git push -u origin main`
