# Supabase Storage Setup for Product Images

This guide explains how to configure Supabase Storage for product image uploads in your React shopping site.

## Prerequisites

- A Supabase project set up and configured
- Environment variables configured in your `.env` file:
  ```
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

## Step 1: Create Storage Bucket

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create bucket**
5. Enter bucket details:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Enable (checked) - This allows public access to images
6. Click **Create bucket**

## Step 2: Configure Bucket Policies

After creating the bucket, you need to set up policies to control access:

1. In the Storage section, click on your `product-images` bucket
2. Go to **Policies** tab
3. Click **Create policy**
4. Create the following policies:

### Policy 1: Allow Public Read Access
- **Name**: `Public read access`
- **Type**: `SELECT`
- **Allowed operations**: `SELECT`
- **Policy definition**:
  ```sql
  -- Allow anyone to view images
  bucket_id = 'product-images'
  ```
- **Target roles**: `anon`, `authenticated`

### Policy 2: Allow Authenticated Users to Upload
- **Name**: `Authenticated users can upload`
- **Type**: `INSERT`
- **Allowed operations**: `INSERT`
- **Policy definition**:
  ```sql
  -- Allow authenticated users to upload images
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  ```
- **Target roles**: `authenticated`

### Policy 3: Allow Admins to Manage All Files
- **Name**: `Admins can manage all files`
- **Type**: `ALL`
- **Allowed operations**: `ALL`
- **Policy definition**:
  ```sql
  -- Allow admins to manage all files
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
  ```
- **Target roles**: `authenticated`

## Step 3: Verify Configuration

1. Try uploading a test image through your admin interface
2. Check that the image displays correctly in product listings
3. Verify that public URLs are accessible

## Bucket Structure

Images will be stored with the following structure:
```
product-images/
  products/
    1640995200000-abc123def.jpg
    1640995300000-def456ghi.png
    ...
```

## Security Considerations

- The bucket is configured as public for image access
- Upload operations require authentication
- Admin users have full control over all files
- File size is limited to 5MB in the application code
- Only image files are allowed for upload

## Troubleshooting

### Images not loading
- Check that the bucket is set to public
- Verify the public read policy is active
- Ensure the image URL is correctly formatted

### Upload fails
- Check user authentication status
- Verify bucket policies allow uploads for authenticated users
- Check file size and type restrictions
- Review browser console for error messages

### Permission denied
- Ensure the user is logged in
- Check that the user has admin role for management operations
- Verify bucket policies are correctly configured

## Next Steps

After configuring storage:
1. The `storageService.js` handles all upload operations
2. Update your admin forms to include image upload functionality
3. Ensure product displays use the Supabase storage URLs
4. Test the complete image upload and display workflow