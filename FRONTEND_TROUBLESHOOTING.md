# FRONTEND BURSAR DASHBOARD TROUBLESHOOTING GUIDE

## 🚨 ERROR: "Session expired. Please login again" / "Request failed with status code 401"

### Root Causes & Solutions:

### 1. **JWT Token Not Being Sent**

**Check:** Open browser DevTools → Network tab → Look at fee management requests

**Expected Request Headers:**

```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Fix in Frontend:**

```javascript
// Make sure your API calls include the token
const token =
  localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

const response = await fetch('/api/v1/fee/all', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
```

### 2. **Wrong API Endpoints**

**Check:** Your frontend should call:

- ✅ `http://localhost:3000/api/v1/fee/all`
- ❌ NOT `http://localhost:3000/fee/all`
- ❌ NOT `http://localhost:3000/api/fee/all`

**Fix:** Update your API base URL:

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1'
```

### 3. **Token Expiration**

**Check:** Tokens expire after a certain time
**Fix:** Implement token refresh or re-login logic:

```javascript
// Check if token is expired before making requests
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp < Date.now() / 1000
  } catch {
    return true
  }
}

// Use before API calls
if (isTokenExpired(token)) {
  // Redirect to login or refresh token
  window.location.href = '/login'
}
```

### 4. **CORS Issues**

**Check:** Backend server.js should have:

```javascript
app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'], // Your frontend URL
    credentials: true,
  })
)
```

## 🚨 ERROR: "Resource not found"

### Possible Causes:

### 1. **No Data in Database**

Run this to create test data:

```bash
cd api && node tests/create-fee-as-bursar.js
```

### 2. **Wrong API Routes**

**Check these endpoints work in Postman/curl:**

```bash
# Login first
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bursar@smart-s.com","password":"password123"}'

# Use the token from login response
curl -X GET http://localhost:3000/api/v1/fee/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 QUICK FIXES TO TRY:

### 1. **Clear Browser Storage**

```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
// Then login again
```

### 2. **Check Network Tab**

1. Open DevTools → Network
2. Try to access fee management
3. Look for failed requests (red status codes)
4. Click on failed request to see details

### 3. **Verify Backend is Running**

```bash
# Should return login response
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bursar@smart-s.com","password":"password123"}'
```

### 4. **Test with Valid Credentials**

**Bursar Login:**

- Email: `bursar@smart-s.com`
- Password: `password123`

## 🧪 WORKING BACKEND TEST

The backend IS working. Here's proof:

```bash
cd api && node tests/debug-school-issue.js
```

This should show:

- ✅ Bursar logged in
- ✅ Schools found: 1
- ✅ Success with fee creation

## 📝 FRONTEND CHECKLIST

- [ ] JWT token is stored after login
- [ ] Authorization header is sent with requests
- [ ] API URLs include `/api/v1` prefix
- [ ] CORS is configured correctly
- [ ] Token expiration is handled
- [ ] Error responses are logged to console

## 🆘 IF STILL NOT WORKING

1. **Check browser console for JavaScript errors**
2. **Verify the frontend code is calling the right endpoints**
3. **Test the backend endpoints directly with curl/Postman**
4. **Check if there are multiple servers running on different ports**

The backend API is confirmed working - the issue is in the frontend communication!
