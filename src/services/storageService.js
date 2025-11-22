import supabase from '../lib/supabase.js';

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name (default: 'product-images')
 * @param {string} path - Optional custom path for the file
 * @returns {Promise<Object>} Upload result with public URL
 */
export const uploadImage = async (file, bucket = 'product-images', path = null) => {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl,
      fileName,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Supabase Storage
 * @param {FileList|Array} files - Array of image files
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImages = async (files, bucket = 'product-images') => {
  try {
    const uploadPromises = Array.from(files).map(file => uploadImage(file, bucket));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Delete an image from Supabase Storage
 * @param {string} path - The file path in storage
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<void>}
 */
export const deleteImage = async (path, bucket = 'product-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Delete multiple images from Supabase Storage
 * @param {Array} paths - Array of file paths
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<void>}
 */
export const deleteMultipleImages = async (paths, bucket = 'product-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw error;
  }
};

/**
 * Get public URL for a stored image
 * @param {string} path - The file path in storage
 * @param {string} bucket - The storage bucket name
 * @returns {string} Public URL
 */
export const getImageUrl = (path, bucket = 'product-images') => {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
};

/**
 * Save product image record to database
 * @param {string} productId - Product ID
 * @param {string} imageUrl - Image URL
 * @param {string} altText - Alt text for the image
 * @param {boolean} isPrimary - Whether this is the primary image
 * @param {number} displayOrder - Display order
 * @returns {Promise<Object>} Created image record
 */
export const saveProductImage = async (productId, imageUrl, altText = '', isPrimary = false, displayOrder = 0) => {
  try {
    // If setting as primary, unset other primary images for this product
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: imageUrl,
        alt_text: altText,
        is_primary: isPrimary,
        display_order: displayOrder
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving product image:', error);
    throw error;
  }
};

/**
 * Update product image record
 * @param {string} imageId - Image ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated image record
 */
export const updateProductImage = async (imageId, updates) => {
  try {
    // If setting as primary, unset other primary images for this product
    if (updates.is_primary) {
      // Get the product_id first
      const { data: imageData } = await supabase
        .from('product_images')
        .select('product_id')
        .eq('id', imageId)
        .single();

      if (imageData) {
        await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', imageData.product_id)
          .neq('id', imageId);
      }
    }

    const { data, error } = await supabase
      .from('product_images')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', imageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product image:', error);
    throw error;
  }
};

/**
 * Delete product image record and file
 * @param {string} imageId - Image ID
 * @returns {Promise<void>}
 */
export const deleteProductImage = async (imageId) => {
  try {
    // Get image data first
    const { data: imageData, error: fetchError } = await supabase
      .from('product_images')
      .select('url')
      .eq('id', imageId)
      .single();

    if (fetchError) throw fetchError;

    // Extract path from URL (assuming URL format: https://.../bucket/path)
    const urlParts = imageData.url.split('/');
    const bucket = urlParts[urlParts.length - 2];
    const path = urlParts.slice(-2).join('/'); // bucket/path

    // Delete from storage
    await deleteImage(path, bucket);

    // Delete from database
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
};

/**
 * Get all images for a product
 * @param {string} productId - Product ID
 * @returns {Promise<Array>} Product images
 */
export const getProductImages = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching product images:', error);
    throw error;
  }
};

/**
 * Reorder product images
 * @param {Array} imageOrder - Array of {id, display_order} objects
 * @returns {Promise<void>}
 */
export const reorderProductImages = async (imageOrder) => {
  try {
    const updatePromises = imageOrder.map(({ id, display_order }) =>
      supabase
        .from('product_images')
        .update({ display_order })
        .eq('id', id)
    );

    const results = await Promise.all(updatePromises);
    const errors = results.filter(result => result.error);

    if (errors.length > 0) {
      throw new Error('Failed to reorder some images');
    }
  } catch (error) {
    console.error('Error reordering product images:', error);
    throw error;
  }
};