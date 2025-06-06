# Vercel Deployment Guide for Ledgrio Frontend

## 🚀 Quick Fix for 404 Errors - UPDATED

The 404 errors you're experiencing when refreshing pages should now be **FIXED** with the latest configuration update (commit `4623d66`).

### ⚠️ IMPORTANT: Redeploy Required

After the latest commit, you need to **redeploy your Vercel project** to apply the updated `vercel.json` configuration.

The updated configuration files include:

### ✅ Files Added:

1. **`vercel.json`** - Main Vercel configuration
2. **`public/_redirects`** - Fallback for other platforms
3. **`.vercelignore`** - Optimizes deployment
4. **`.env.production`** - Production environment variables

## 📋 Deployment Steps

### 1. **Environment Variables Setup**

In your Vercel dashboard, add these environment variables:

```bash
# Required - Replace with your actual backend URL
VITE_API_BASE_URL=https://your-backend-api.vercel.app/api/v1

# App Configuration
VITE_APP_NAME=Ledgrio School Management
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Payment Configuration (Optional)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_production_paystack_key

# Cloudinary Configuration (Optional)
VITE_CLOUDINARY_CLOUD_NAME=your_production_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_production_cloudinary_upload_preset
```

### 2. **Vercel Project Settings**

```bash
# Build Command
npm run build

# Output Directory
dist

# Install Command
npm install

# Development Command
npm run dev
```

### 3. **Deploy to Vercel**

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ledgrio-frontend
# - Directory? ./
```

#### Option B: GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set the root directory to `frontend`
4. Configure environment variables
5. Deploy

## 🔧 Configuration Details

### **vercel.json Explanation**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel to serve `index.html` for all routes, allowing React Router to handle client-side routing.

### **Security Headers**

The configuration includes security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 🐛 Troubleshooting

### **Still Getting 404 Errors?**

1. **Check Build Logs**: Ensure the build completes successfully
2. **Verify Environment Variables**: Make sure `VITE_API_BASE_URL` is set correctly
3. **Clear Cache**: Try a fresh deployment
4. **Check Network Tab**: Verify API calls are going to the correct URL

### **API Connection Issues?**

1. **CORS Configuration**: Ensure your backend allows requests from your Vercel domain
2. **HTTPS**: Make sure your backend API supports HTTPS
3. **Environment Variables**: Double-check the API URL format

### **Build Failures?**

1. **Node Version**: Ensure you're using Node.js 18+
2. **Dependencies**: Run `npm install` locally to check for issues
3. **TypeScript Errors**: Fix any TypeScript compilation errors

## 📱 Testing After Deployment

1. **Navigate to different routes** and refresh the page
2. **Test authentication** flow
3. **Verify API connections** work
4. **Check responsive design** on mobile devices
5. **Test dark mode** functionality

## 🔄 Redeployment

After making changes:

```bash
# Automatic redeployment (if connected to Git)
git add .
git commit -m "fix: update configuration"
git push origin main

# Manual redeployment
vercel --prod
```

## 📊 Performance Optimization

The Vite configuration includes:

- **Code splitting** for better loading performance
- **Chunk optimization** to reduce bundle size
- **Minification** for production builds
- **Source maps** disabled in production

## 🎯 Expected Results

After deployment:

- ✅ **No more 404 errors** on page refresh
- ✅ **Fast loading times** with optimized bundles
- ✅ **Proper routing** for all application pages
- ✅ **Security headers** for enhanced protection
- ✅ **Mobile-responsive** design
- ✅ **Dark mode** functionality

## 🆘 Need Help?

If you're still experiencing issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure your backend API is accessible
4. Test the build locally with `npm run build && npm run preview`

The configuration provided should resolve the 404 refresh issues completely! 🎉
