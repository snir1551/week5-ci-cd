# Production Deployment Configuration

## Frontend Configuration

The frontend is now configured to automatically use the correct API URL based on the environment:

- **Development**: Uses `http://localhost:5000/api`
- **Production**: Uses the environment variable `REACT_APP_API_URL` or falls back to a default production URL

## Setting up Production

### 1. Deploy Backend to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following configuration:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
4. Note the deployed URL (e.g., `https://your-app-name.onrender.com`)

### 2. Update Frontend Configuration

Update the production URL in `/frontend/src/config/config.ts`:

```typescript
production: {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://YOUR_ACTUAL_RENDER_URL.onrender.com/api'
}
```

Replace `YOUR_ACTUAL_RENDER_URL` with your actual Render deployment URL.

### 3. Deploy Frontend to Vercel

The CI/CD pipeline will automatically deploy to Vercel when you push to main.

### 4. Alternative: Use Environment Variables (Recommended)

Instead of hardcoding the URL, you can set up environment variables:

1. **For Render**: Set `PORT` environment variable if needed
2. **For Vercel**: Add `REACT_APP_API_URL` as an environment variable in your Vercel project settings
3. **For GitHub Actions**: Add `BACKEND_URL` as a repository secret (optional)

## Testing the Setup

1. Deploy your backend to Render
2. Update the frontend configuration with the Render URL
3. Push to main branch to trigger the CI/CD pipeline
4. Verify that the frontend can communicate with the backend

## Environment Files

- `.env`: Development configuration
- `.env.production`: Production configuration (optional, can be overridden by Vercel environment variables)
