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
// User Settings
// =====================================================

export async function getUserSettings() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createUserSettings(userData: {
  user_name: string;
  user_email?: string;
  currency?: string;
  country?: string;
  business_type?: string;
  tax_percentage?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_settings')
    .insert([{
      ...userData,
      user_id: userId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserSettings(updates: Partial<{
  user_name: string;
  user_email: string;
  currency: string;
  country: string;
  business_type: string;
  tax_percentage: number;
}>) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  console.log('💾 [updateUserSettings] Updating with:', updates);

  // Get existing settings first
  const existing = await getUserSettings();
  
  if (!existing) {
    console.log('⚠️ [updateUserSettings] No existing settings, creating new');
    // Create new if doesn't exist
    return createUserSettings({
      user_name: updates.user_name || 'Usuario',
      ...updates
    });
  }

  console.log('✅ [updateUserSettings] Existing settings found, updating');

  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ [updateUserSettings] Error:', error);
    throw error;
  }
  
  console.log('✅ [updateUserSettings] Updated successfully:', data);
  return data;
}

// =====================================================
// Platos (Dishes)
// =====================================================

export async function createDish(dishData: {
  name: string;
  category_id: string;
  price?: number | null;
  description?: string;
  preparation?: string;
  allergens?: string[];
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  console.log('[DishCreate] payload', { ...dishData, user_id: userId });

  const { data, error, status } = await supabase
    .from('dishes')
    .insert([{
      ...dishData,
      user_id: userId
    }])
    .select()
    .single();

  if (error) {
    console.error('[DishCreate] ERROR', {
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      status
    });
    throw error;
  }

  console.log('[DishCreate] OK', data);
  return data;
}

export async function updateDish(dishId: string, updates: Partial<{
  name: string;
  category_id: string;
  price: number | null;
  description: string;
  preparation: string;
  allergens: string[];
}>) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('dishes')
    .update(updates)
    .eq('id', dishId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDish(dishId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  // Primero eliminar ingredientes del plato
  await supabase
    .from('dish_ingredients')
    .delete()
    .eq('dish_id', dishId)
    .eq('user_id', userId);

  // Luego eliminar el plato
  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', dishId)
    .eq('user_id', userId);

  if (error) throw error;
}

// =====================================================
// Categorías de Menú
// =====================================================

export async function createMenuCategory(categoryData: {
  name: string;
  emoji: string;
  target_cost_percentage?: number;
  target_margin_percentage?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('menu_categories')
    .insert([{
      ...categoryData,
      user_id: userId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuCategory(categoryId: string, updates: Partial<{
  name: string;
  emoji: string;
  is_hidden: boolean;
  target_cost_percentage: number;
  target_margin_percentage: number;
}>) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('menu_categories')
    .update(updates)
    .eq('id', categoryId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMenuCategory(categoryId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('menu_categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId);

  if (error) throw error;
}

// =====================================================
// Ingredientes de Platos
// =====================================================

// Type definition for UI ingredients
export type UiIngredient = {
  name: string;
  qty: number;
  unit: string;
  unitPrice?: number;
  inventory_item_id?: string | null;
  category?: string | null;
  emoji?: string | null;
};

/**
 * Ensures an inventory item exists, creating it if necessary.
 * Prefers existing inventory_item_id, then looks up by name+unit, finally creates.
 * Does NOT persist wastage_percentage to inventory_items (column doesn't exist).
 */
export async function ensureInventoryItem(
  ing: UiIngredient,
  user_id?: string | null
): Promise<{ ok: true; id: string } | { ok: false; error: any }> {
  const userId = user_id || await getCurrentUserId();
  if (!userId) return { ok: false, error: new Error('User not authenticated') };

  // Prefer existing id
  if (ing.inventory_item_id) {
    console.log('[ensureInventoryItem] using existing ID', ing.inventory_item_id);
    return { ok: true, id: ing.inventory_item_id };
  }

  // Try lookup by name+unit
  const { data: found, error: findErr } = await supabase
    .from('inventory_items')
    .select('id')
    .eq('user_id', userId)
    .eq('name', ing.name)
    .eq('unit', ing.unit)
    .limit(1)
    .maybeSingle();

  if (!findErr && found?.id) {
    console.log('[ensureInventoryItem] found by name+unit', found.id);
    return { ok: true, id: found.id };
  }

  // Create minimal inventory item (no wastage_percentage)
  const payload = {
    name: ing.name,
    unit: ing.unit,
    price_per_unit: Number.isFinite(ing.unitPrice) ? ing.unitPrice : 0,
    category: ing.category ?? 'Ingrediente',
    emoji: ing.emoji ?? null,
    user_id: userId
  };

  console.log('[ensureInventoryItem] creating new item', payload);

  const { data: created, error: createErr } = await supabase
    .from('inventory_items')
    .insert([payload])
    .select('id')
    .single();

  if (createErr) {
    console.error('[ensureInventoryItem] ERROR', {
      code: (createErr as any).code,
      message: createErr.message,
      details: (createErr as any).details,
      hint: (createErr as any).hint
    });
    return { ok: false, error: createErr };
  }

  console.log('[ensureInventoryItem] created', created.id);
  return { ok: true, id: created.id as string };
}

/**
 * Upserts dish ingredients by ensuring each inventory item exists, then bulk inserting.
 * Returns success or list of errors.
 */
export async function upsertDishIngredients(
  dishId: string,
  uiIngredients: UiIngredient[],
  user_id?: string | null
): Promise<{ ok: true; count: number } | { ok: false; errors: any[] }> {
  const userId = user_id || await getCurrentUserId();
  if (!userId) return { ok: false, errors: [new Error('User not authenticated')] };

  const rows: Array<{ dish_id: string; inventory_item_id: string; quantity: number; unit: string; user_id: string }> = [];
  const errors: any[] = [];

  console.log('[upsertDishIngredients] processing', uiIngredients.length, 'ingredients');

  for (const ing of uiIngredients) {
    const got = await ensureInventoryItem(ing, userId);
    if (!got.ok) {
      console.error('[upsertDishIngredients] ensureInventoryItem failed', { ing: ing.name, error: got.error });
      errors.push({ step: 'ensureInventoryItem', ing, error: got.error });
      continue;
    }
    rows.push({
      dish_id: dishId,
      inventory_item_id: got.id,
      quantity: Number(ing.qty) || 0,
      unit: ing.unit || '',
      user_id: userId
    });
  }

  if (rows.length === 0) {
    if (errors.length) {
      console.error('[upsertDishIngredients] no valid ingredients, errors:', errors);
      return { ok: false, errors };
    }
    console.log('[upsertDishIngredients] no ingredients to insert');
    return { ok: true, count: 0 };
  }

  console.log('[upsertDishIngredients] inserting', rows.length, 'rows');
  console.log('[DishIngredient] bulk rows', JSON.stringify(rows, null, 2));

  const { data: inserted, error: bulkErr, status } = await supabase
    .from('dish_ingredients')
    .insert(rows)
    .select('dish_id, inventory_item_id, quantity, unit');

  if (bulkErr) {
    console.error('[DishIngredient] bulk insert ERROR', { 
      status, 
      code: (bulkErr as any).code, 
      message: bulkErr.message, 
      details: (bulkErr as any).details, 
      hint: (bulkErr as any).hint 
    });
    return { ok: false, errors: [...errors, { bulkErr, status }] };
  }

  console.log('[DishIngredient] bulk insert OK', inserted?.length ?? 0, inserted);
  return errors.length ? { ok: false, errors } : { ok: true, count: rows.length };
}

export async function addDishIngredient(ingredientData: {
  dish_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  waste_percentage?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('dish_ingredients')
    .insert([{
      ...ingredientData,
      user_id: userId
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addMultipleDishIngredients(ingredients: Array<{
  dish_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  waste_percentage?: number;
}>) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const ingredientsWithUserId = ingredients.map(ing => ({
    ...ing,
    user_id: userId
  }));

  console.log('[DishIngredientInsert] payload', ingredientsWithUserId);

  const { data, error, status } = await supabase
    .from('dish_ingredients')
    .insert(ingredientsWithUserId)
    .select();

  if (error) {
    console.error('[DishIngredientInsert] ERROR', {
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      status
    });
    throw error;
  }

  console.log('[DishIngredientInsert] OK', data);
  return data;
}

export async function deleteDishIngredient(ingredientId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('dish_ingredients')
    .delete()
    .eq('id', ingredientId)
    .eq('user_id', userId);

  if (error) throw error;
}

// =====================================================
// Inventario
// =====================================================

export async function createInventoryItem(itemData: {
  name: string;
  unit: string;
  price: number;
  wastage_percentage?: number; // Accepted but NOT persisted to inventory_items
  category?: string;
  emoji?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  // Build safe payload - explicitly omit wastage_percentage (column doesn't exist in DB)
  // Waste% stays only in local UI state for recipe calculations
  const payload = {
    name: itemData.name,
    unit: itemData.unit,
    price_per_unit: itemData.price,
    category: itemData.category ?? null,
    emoji: itemData.emoji ?? null,
    user_id: userId
    // wastage_percentage intentionally omitted - not in inventory_items table
  };

  console.log('[InventoryItemCreate] safe payload (no wastage_percentage)', payload);

  const { data, error, status } = await supabase
    .from('inventory_items')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[InventoryItemCreate] ERROR', {
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      status
    });
    throw error;
  }

  console.log('[InventoryItemCreate] OK', data);
  return data;
}

// Encuentra un ingrediente existente por nombre y unidad, o lo crea si no existe
export async function findOrCreateInventoryItem(itemData: {
  name: string;
  unit: string;
  price: number;
  wastage_percentage?: number;
  category?: string;
  emoji?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  console.log('[InventoryItemFind] searching for', itemData.name);

  // Buscar ingrediente existente por nombre (case insensitive) del usuario actual
  const { data: existing, error: searchError, status: searchStatus } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', itemData.name)
    .limit(1)
    .single();

  if (searchError && searchError.code !== 'PGRST116') {
    console.error('[InventoryItemFind] ERROR', {
      code: (searchError as any).code,
      message: searchError.message,
      details: (searchError as any).details,
      hint: (searchError as any).hint,
      status: searchStatus
    });
  }

  if (existing && !searchError) {
    console.log('[InventoryItemFind] found existing', existing.id);
    // Si existe, actualizar el precio y unidad si son diferentes
    // Note: wastage_percentage is NOT updated (column doesn't exist in inventory_items)
    const needsUpdate = 
      existing.price_per_unit !== itemData.price || 
      existing.unit !== itemData.unit;
    
    if (needsUpdate) {
      console.log('[InventoryItemFind] updating existing', existing.id);
      return await updateInventoryItem(existing.id, {
        price: itemData.price,
        unit: itemData.unit
        // wastage_percentage intentionally omitted
      });
    }
    return existing;
  }

  // Si no existe, crearlo
  console.log('[InventoryItemFind] creating new');
  return await createInventoryItem(itemData);
}

export async function updateInventoryItem(itemId: string, updates: Partial<{
  name: string;
  unit: string;
  price: number;
  wastage_percentage: number; // Accepted but NOT persisted to inventory_items
  category: string;
  emoji: string;
}>) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  // Build safe payload - map 'price' to 'price_per_unit', omit 'wastage_percentage'
  const mappedUpdates: any = { ...updates };
  
  if (updates.price !== undefined) {
    mappedUpdates.price_per_unit = updates.price;
    delete mappedUpdates.price;
  }
  
  // Explicitly remove wastage_percentage (column doesn't exist in inventory_items)
  delete mappedUpdates.wastage_percentage;

  console.log('[InventoryItemUpdate] safe payload (no wastage_percentage)', mappedUpdates);

  const { data, error, status } = await supabase
    .from('inventory_items')
    .update(mappedUpdates)
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[InventoryItemUpdate] ERROR', {
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      status
    });
    throw error;
  }

  console.log('[InventoryItemUpdate] OK', data);
  return data;
}

export async function deleteInventoryItem(itemId: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) throw error;
}
