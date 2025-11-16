# Directus Customer Role Permissions Setup

To ensure cart operations work only for authenticated users with the Customer role, configure the following permissions in your Directus admin panel.

## Steps to Configure Permissions

1. **Access Roles & Permissions**:
   - Log in to your Directus admin panel at `http://localhost:8055`
   - Navigate to **Settings > Roles & Permissions**
   - Select the **Customer** role (or create it if it doesn't exist)

2. **Configure `cart_items` Collection Permissions**:
   - In the **Collections** section, find and select `cart_items`
   - Set the following permissions:

### Create Permission
- **Action**: Create
- **Permissions**: Allow
- **Fields**: All fields (or specify: `user`, `product`, `quantity`)
- **Validation**: 
  - `user`: `$CURRENT_USER` (this ensures users can only create cart items for themselves)

### Read Permission
- **Action**: Read
- **Permissions**: Allow
- **Fields**: All fields
- **Filter**: 
  - `user`: `_eq: $CURRENT_USER` (users can only read their own cart items)

### Update Permission
- **Action**: Update
- **Permissions**: Allow
- **Fields**: All fields (or specify: `quantity`)
- **Filter**: 
  - `user`: `_eq: $CURRENT_USER` (users can only update their own cart items)

### Delete Permission
- **Action**: Delete
- **Permissions**: Allow
- **Filter**: 
  - `user`: `_eq: $CURRENT_USER` (users can only delete their own cart items)

## 2. Configure `directus_files` Collection Permissions

Product images are stored in the `directus_files` collection. To ensure images load properly for all users (including unauthenticated visitors), the Public role needs read access to the files.

### Public Role - Files Permissions
- **Action**: Read
- **Permissions**: Allow
- **Fields**: All fields (or specify: `id`, `filename_disk`, `filename_download`, `type`, `width`, `height`)
- **Filter**: No filter (allow access to all public files)

**Note**: This allows anyone to view product images, which is typically desired for an e-commerce site. If you have private files, you can add filters to restrict access.

## Important Notes

- **Public Role**: Ensure the **Public** role has **NO** permissions on the `cart_items` collection. This prevents unauthenticated users from accessing cart data.
- **Files Access**: The **Public** role **MUST** have read permissions on `directus_files` for product images to display.
- **Field-Level Permissions**: You can restrict fields if needed, but allowing all fields for cart operations is typically fine.
- **User Field**: The `user` field in `cart_items` should be a relational field linking to the `directus_users` collection.
- **Validation Rules**: Using `$CURRENT_USER` in filters ensures users can only manipulate their own cart data.

## Testing Permissions

After configuring permissions:
1. **Images**: Verify product images load on the homepage and product detail pages without authentication
2. **Cart Operations**: Try accessing cart operations without logging in - should receive 403 Forbidden with friendly message
3. **Authenticated Cart**: Log in as a Customer role user - cart operations should work
4. **Data Security**: Verify that users cannot access or modify other users' cart items

This setup ensures that:
- Product images are publicly accessible for a good user experience
- Cart functionality is properly secured and only available to authenticated users
- Users can only manipulate their own cart data