import supabase from '../lib/supabase';
import type { User, SignupCredentials } from '../types/auth';

export class AdminService {
  /**
   * Create a new admin user (only callable by existing admins)
   */
  static async createAdminUser(
    credentials: SignupCredentials & { role: 'admin' }
  ): Promise<User> {
    try {
      // Check if current user is admin (this would be done in the component that calls this)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      // Get current user profile to check admin status
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // Create new admin user using Supabase Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: credentials.email,
        password: credentials.password,
        email_confirm: true,
        user_metadata: {
          full_name: credentials.full_name,
        },
      });

      if (authError) throw authError;

      // Create user profile with admin role
      const { data: userData, error: profileCreateError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: credentials.email,
          full_name: credentials.full_name,
          phone: credentials.phone || null,
          role: 'admin',
          is_active: true,
        })
        .select()
        .single();

      if (profileCreateError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileCreateError;
      }

      return userData;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  /**
   * Update user role to admin (for upgrading existing users)
   */
  static async promoteToAdmin(userId: string): Promise<User> {
    try {
      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('users')
        .update({ role: 'admin', updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  /**
   * Demote admin to customer
   */
  static async demoteToCustomer(userId: string): Promise<User> {
    try {
      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // Prevent self-demotion
      if (user.id === userId) {
        throw new Error('Cannot demote yourself');
      }

      const { data, error } = await supabase
        .from('users')
        .update({ role: 'customer', updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error demoting admin to customer:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      const { data: currentUserProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || currentUserProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }

      // Prevent deactivating yourself
      if (user.id === userId && !isActive) {
        throw new Error('Cannot deactivate your own account');
      }

      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_active: isActive, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }
}