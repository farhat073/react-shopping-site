# Deployment Configuration - No Longer Required

This file contained Strapi backend deployment instructions, which are no longer needed as the application now uses **Supabase** as the backend.

## Migration from Strapi to Supabase

The application has been migrated from Strapi to Supabase for the following benefits:

- ✅ **Simplified Architecture**: No separate backend deployment needed
- ✅ **Built-in Authentication**: Supabase Auth handles user management
- ✅ **Real-time Features**: Live updates and subscriptions
- ✅ **File Storage**: Built-in storage for product images
- ✅ **Database**: PostgreSQL database with RESTful APIs
- ✅ **CORS**: Automatic CORS handling
- ✅ **Deployment**: Simpler deployment process

## Updated Environment Variables

Use these Supabase environment variables instead:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://your-site.vercel.app
```

## Deploy with Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up your database schema using `supabase/schema.sql`
3. Configure RLS (Row Level Security) policies
4. Update your environment variables with Supabase credentials
5. Deploy to Vercel

For detailed setup instructions, refer to `DEPLOYMENT_SUMMARY.md`.