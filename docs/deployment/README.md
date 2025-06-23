# Deployment Documentation

This directory contains deployment guides and production setup instructions.

## Files

### 🚀 Platform-Specific Deployment
- **VERCEL_DEPLOYMENT_GUIDE.md** - Complete Vercel deployment setup for frontend

## Quick Links

- [Main Documentation](../README.md)
- [Frontend Documentation](../frontend/)
- [API Documentation](../api/)

## Deployment Overview

The Smart School Management System can be deployed on various platforms:

### Frontend Deployment
- **Vercel** (Recommended) - Optimized for React/Vite applications
- **Netlify** - Alternative static hosting
- **AWS S3 + CloudFront** - Enterprise-grade hosting

### Backend Deployment
- **Railway** - Simple Node.js deployment
- **Heroku** - Traditional PaaS hosting
- **AWS EC2** - Full server control
- **Digital Ocean** - VPS hosting

### Database Hosting
- **MongoDB Atlas** (Recommended) - Managed MongoDB service
- **AWS DocumentDB** - MongoDB-compatible service
- **Self-hosted MongoDB** - Custom server setup

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API endpoints verified
- [ ] Build process successful
- [ ] Tests passing

### Production Setup
- [ ] SSL certificates installed
- [ ] Domain configuration complete
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Error logging enabled

### Post-Deployment
- [ ] Health checks passing
- [ ] User acceptance testing
- [ ] Performance monitoring
- [ ] Security audit complete

## Environment Configuration

### Frontend Environment Variables
```
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_APP_NAME=Ledgrio School Management
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_key
```

### Backend Environment Variables
```
MONGO_URI=mongodb://your-database-url
JWT_SECRET=your-jwt-secret
NODE_ENV=production
PORT=3000
```

## Getting Started

1. Review [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for frontend deployment
2. Set up your database (MongoDB Atlas recommended)
3. Configure environment variables
4. Deploy backend to your chosen platform
5. Update frontend API URLs
6. Deploy frontend to Vercel
