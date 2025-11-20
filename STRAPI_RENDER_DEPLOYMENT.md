# Strapi Backend Deployment to Render

## ✅ What Was Configured

### 1. Database Configuration
- ✅ Updated `backend/config/database.js` to support PostgreSQL in production
- ✅ Falls back to SQLite for development
- ✅ Supports DATABASE_URL environment variable

### 2. Render Configuration
- ✅ Created `render.yaml` for automated deployment
- ✅ Configured web service with proper build and start commands
- ✅ Added persistent disk for file uploads
- ✅ Generated secure environment variables (JWT secrets, app keys)

### 3. Environment Variables
- ✅ Created `backend/.env.example` with all required variables
- ✅ Includes database, security, and SSL settings

## 🔧 Environment Variables Required in Render

You **must** configure these environment variables in Render's service settings:

### Required:
- **`DATABASE_URL`**: Your PostgreSQL database connection string
  - Format: `postgresql://username:password@host:port/database`
  - Create a PostgreSQL database in Render and copy the connection string

### Auto-Generated (don't set manually):
- `JWT_SECRET`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `APP_KEYS`

### Optional:
- `DATABASE_SSL`: Set to `true` if using SSL (default: false)
- SSL-related variables if needed

## 📋 Deployment Steps

### 1. Create PostgreSQL Database on Render
1. Go to [render.com](https://render.com)
2. Click "New" → "PostgreSQL"
3. Choose a name (e.g., `strapi-db`)
4. Select region and plan
5. Click "Create Database"
6. Copy the `External Database URL` (this is your DATABASE_URL)

### 2. Deploy Strapi Backend
1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare Strapi for Render deployment"
   git push origin main
   ```

2. **Connect Repository to Render**:
   - In Render dashboard, click "New" → "Web Service"
   - Connect your GitHub repository
   - Choose the branch (main)

3. **Configure Service**:
   - **Name**: `strapi-backend` (or your choice)
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm run start`
   - **Instance Type**: Choose based on your needs (Starter is fine for development)

4. **Set Environment Variables**:
   - In the service settings, add environment variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - The other secrets will be auto-generated

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically

### 3. Initial Strapi Setup
After deployment:
1. Visit your Render service URL
2. Complete the Strapi admin setup wizard
3. Create your admin user
4. Configure content types as needed

## ⚠️ Important Notes

### Database Migration
- When switching from SQLite (dev) to PostgreSQL (prod), you may need to migrate data
- Strapi will create tables automatically on first run
- For existing data, consider using Strapi's data transfer feature

### File Uploads
- The render.yaml includes a persistent disk for uploads
- Files will be stored at `/opt/render/project/src/backend/.tmp`

### CORS Configuration
- After deployment, update your Strapi CORS settings to allow requests from your frontend domain
- In Strapi admin: Settings → Global Settings → Security

### Health Check
- Render will use `/_health` for health checks
- Ensure this endpoint is accessible

## 🎯 Next Steps

1. **Test the deployment**:
   - Check Render logs for any errors
   - Visit the admin panel and ensure it loads

2. **Configure Content Types**:
   - Set up your products, orders, cart, etc. in Strapi admin

3. **Update Frontend**:
   - Set `VITE_STRAPI_URL` in your Vercel deployment to the Render service URL
   - Example: `https://strapi-backend.onrender.com`

4. **Test API Connectivity**:
   - Ensure your frontend can communicate with the deployed Strapi

## 📝 Files Modified/Created

- `backend/config/database.js` - Updated for PostgreSQL support
- `render.yaml` - Created Render deployment configuration
- `backend/.env.example` - Created environment variables template

## ✨ Strapi Backend is Ready for Render Deployment!

Your Strapi backend is now configured for production deployment on Render. Just create the database, set the environment variables, and deploy!