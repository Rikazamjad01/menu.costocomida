import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';

const supabase = createClient();

// =====================================================
// HELPER: Get Current User ID
// =====================================================
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
    return user?.id || null;
  } catch (error) {
    console.error('❌ Error in getCurrentUserId:', error);
    return null;
  }
}

// =====================================================
// Hook para obtener configuración de usuario
// =====================================================
export function useUserSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No userId found - user not authenticated');
        setSettings(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('id, user_id, user_name, currency, country, business_type, tax_percentage, created_at, updated_at')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [useUserSettings] Error loading settings:', error);
        throw error;
      }
      
      console.log('📊 [useUserSettings] Loaded settings:', {
        user_name: data?.user_name,
        currency: data?.currency,
        tax_percentage: data?.tax_percentage,
        full_data: data
      });
      
      // 🐛 Extra logging for tax_percentage
      if (data) {
        console.log('🔍 [useUserSettings] TAX DEBUG:', {
          tax_percentage_value: data.tax_percentage,
          tax_percentage_type: typeof data.tax_percentage,
          is_null: data.tax_percentage === null,
          is_undefined: data.tax_percentage === undefined,
          is_zero: data.tax_percentage === 0
        });
      }
      
      setSettings(data);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, refetch: fetchSettings };
}

// =====================================================
// Hook para obtener platos con sus ingredientes
// =====================================================
export function useDishesWithIngredients() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDishes = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No userId found - user not authenticated');
        setDishes([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('dishes')
        .select(`
          *,
          dish_ingredients (
            id,
            quantity,
            unit,
            waste_percentage,
            inventory_item:inventory_item_id (
              id,
              name,
              price_per_unit,
              unit,
              emoji
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dishes:', error);
        throw error;
      }
      
      setDishes(data || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  return { dishes, loading, refetch: fetchDishes };
}

// =====================================================
// Hook para obtener categorías de menú
// =====================================================
export function useMenuCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No userId found - user not authenticated');
        setCategories([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refetch: fetchCategories };
}

// =====================================================
// Hook para obtener items de inventario
// =====================================================
export function useInventoryItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No userId found - user not authenticated');
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Map data to ensure consistent naming
      // Note: wastage_percentage does NOT exist in inventory_items table
      // Waste % is only stored in dish_ingredients.waste_percentage
      const mappedItems = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        price_per_unit: item.price_per_unit,
        category: item.category,
        emoji: item.emoji,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, refetch: fetchItems };
}

// =====================================================
// Hook para análisis de rentabilidad de platos
// =====================================================
export function useDishProfitabilityAnalysis() {
  const [profitabilityData, setProfitabilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfitability = async () => {
    setLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.warn('⚠️ No userId found - user not authenticated');
        setProfitabilityData([]);
        setLoading(false);
        return;
      }

      // Obtener platos con ingredientes y calcular costos
      const { data: dishes, error: dishesError } = await supabase
        .from('dishes')
        .select(`
          *,
          dish_ingredients (
            quantity,
            unit,
            waste_percentage,
            inventory_item:inventory_item_id (
              name,
              price_per_unit,
              unit
            )
          )
        `)
        .eq('user_id', userId);

      if (dishesError) throw dishesError;

      // Calcular rentabilidad para cada plato
      const profitability = (dishes || []).map((dish: any) => {
        // Calcular costo total del plato
        const cost = (dish.dish_ingredients || []).reduce((sum: number, ing: any) => {
          if (!ing.inventory_item) return sum;
          const quantity = parseFloat(ing.quantity) || 0;
          const pricePerUnit = parseFloat(ing.inventory_item.price_per_unit) || 0;
          const wastePercentage = parseFloat(ing.waste_percentage) || 0;
          // Note: wastage_percentage does NOT exist in inventory_items table
          // Only use waste_percentage from dish_ingredients
          
          // Calcular costo considerando merma
          const effectiveQuantity = quantity * (1 + wastePercentage / 100);
          
          return sum + (effectiveQuantity * pricePerUnit);
        }, 0);

        const price = parseFloat(dish.price) || 0;
        const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
        
        // Determinar estado basado en margen
        let status = 'loss';
        if (margin >= 60) status = 'star';
        else if (margin >= 40) status = 'adjust';

        return {
          id: dish.id,
          dish: dish.name,
          category: dish.category_id,
          price,
          cost,
          margin,
          sales: 0, // Por ahora, puede ser expandido con datos reales de ventas
          status
        };
      });

      setProfitabilityData(profitability);
    } catch (error) {
      console.error('Error calculating profitability:', error);
      setProfitabilityData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitability();
  }, []);

  return { profitabilityData, loading, refetch: fetchProfitability };
}
