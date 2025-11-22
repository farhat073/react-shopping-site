import { clearCart as clearCartService } from '../services/cartService.js';

export const clearUserCart = async (userId: string): Promise<boolean> => {
  return await clearCartService(userId);
};