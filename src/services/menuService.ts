import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { MenuItem } from '../types/cafe';
import { INITIAL_MENU_ITEMS } from '../data/mockMenu';

export const menuService = {
  async getMenu(): Promise<MenuItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            description,
            base_price,
            image_url,
            is_available,
            categories ( name ),
            product_option_groups (
              id,
              name,
              selection_type,
              is_required,
              product_option_items (
                id,
                name,
                price_delta,
                is_default
              )
            )
          `)
          .eq('is_available', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Supabase getMenu error:', error);
          throw error;
        }

        if (products && products.length > 0) {
          return products.map((p: any) => {
            const sizesGroup = p.product_option_groups?.find((g: any) => g.name.toLowerCase() === 'size');
            const milksGroup = p.product_option_groups?.find((g: any) => g.name.toLowerCase() === 'milk');
            const sweetGroup = p.product_option_groups?.find((g: any) => g.name.toLowerCase() === 'sweetness');
            const addonGroup = p.product_option_groups?.find((g: any) => g.name.toLowerCase() === 'add-ons');

            const extraShot = addonGroup?.product_option_items?.find((i: any) => i.name.toLowerCase().includes('shot'));

            return {
              id: p.id,
              name: p.name,
              category: p.categories?.name || 'Coffee',
              price: parseFloat(p.base_price),
              description: p.description || '',
              image: p.image_url || '/figma-assets/iced-latte.jpg',
              isAvailable: p.is_available,
              options: {
                sizes: sizesGroup?.product_option_items?.map((item: any) => ({
                  name: item.name,
                  price: parseFloat(item.price_delta),
                })),
                milks: milksGroup?.product_option_items?.map((item: any) => ({
                  name: item.name,
                  price: parseFloat(item.price_delta),
                })),
                sweetness: sweetGroup?.product_option_items?.map((item: any) => item.name),
                extraShotPrice: extraShot ? parseFloat(extraShot.price_delta) : 30,
              },
            };
          });
        }
      } catch (err) {
        console.warn('Failed to load menu from Supabase, using catalog fallback:', err);
      }
    }

    return INITIAL_MENU_ITEMS;
  },

  async getAllProducts(): Promise<MenuItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            description,
            base_price,
            image_url,
            is_available,
            categories ( name )
          `)
          .order('display_order', { ascending: true });

        if (!error && products && products.length > 0) {
          return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.categories?.name || 'Coffee',
            price: parseFloat(p.base_price),
            description: p.description || '',
            image: p.image_url || '/figma-assets/iced-latte.jpg',
            isAvailable: p.is_available,
          }));
        }
      } catch (err) {
        console.warn('Failed to load all products from Supabase:', err);
      }
    }
    return INITIAL_MENU_ITEMS;
  },

  async toggleProductAvailability(productId: string, isAvailable: boolean): Promise<boolean> {
    if (isSupabaseConfigured && supabase && /^[0-9a-f-]{36}$/i.test(productId)) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
          .eq('id', productId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Failed to toggle product availability in Supabase:', err);
      }
    }

    const item = INITIAL_MENU_ITEMS.find(m => m.id === productId);
    if (item) {
      item.isAvailable = isAvailable;
      return true;
    }
    return false;
  },

  async getProductById(id: string): Promise<MenuItem | null> {
    const menu = await this.getMenu();
    return menu.find(m => m.id === id || m.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()) || null;
  }
};
