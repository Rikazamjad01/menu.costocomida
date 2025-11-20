import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';

// Safe logging utility
function safeLog(label: string, obj?: unknown) {
  try {
    const isDomEvt = !!((obj as any)?.nativeEvent || (obj as any)?.target?.nodeType);
    if (isDomEvt) return console.log(label, '[dom-event]');
    if (typeof obj === 'object' && obj) return console.log(label, { ...(obj as any) });
    return console.log(label, obj);
  } catch { console.log(label, '[unserializable]'); }
}

interface DishIngredient {
  name: string;
  qty: number;
  unit: string;
  unitCost: number;
  lineCost: number;
}

interface DishDetails {
  id: string;
  name: string;
  price: number;
  taxPercent: number;
  ingredients: DishIngredient[];
  totals: {
    ingredientCost: number;
    netPrice: number;
    margin: number;
    costPct: number;
  };
}

export function useDishDetails(dishId: string | null | undefined) {
  const [state, setState] = useState<{ loading: boolean; error?: any; details?: DishDetails }>({ loading: true });

  useEffect(() => {
    if (!dishId) {
      setState({ loading: false });
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    (async () => {
      // Step 0: basic dish fields
      const dishRes = await supabase
        .from('dishes')
        .select('id, name, category, price, tax_percent')
        .eq('id', dishId)
        .single();

      if (dishRes.error) {
        console.error('[DishDetails] dish load ERROR', dishRes.error);
        if (!cancelled) setState({ loading: false, error: dishRes.error });
        return;
      }

      // Step A: dish_ingredients rows (no relationship usage)
      const diRes = await supabase
        .from('dish_ingredients')
        .select('inventory_item_id, quantity, unit')
        .eq('dish_id', dishId);

      if (diRes.error) {
        console.error('[DishDetails] di load ERROR', diRes.error);
        if (!cancelled) setState({ loading: false, error: diRes.error });
        return;
      }

      // Parse quantity as numbers (may arrive as text from database)
      const rows = (diRes.data ?? []).map(r => ({
        inventory_item_id: r.inventory_item_id,
        qty: Number(r.quantity) || 0,
        unit: r.unit ?? '—'
      }));
      
      const ids = rows.map(r => r.inventory_item_id).filter(Boolean);
      let idSet: string[] = Array.from(new Set(ids));

      // Step B: inventory items by id IN (...)
      let iiMap = new Map<string, { name: string; price_per_unit: number }>();
      if (idSet.length) {
        const iiRes = await supabase
          .from('inventory_items')
          .select('id, name, price_per_unit')
          .in('id', idSet);

        if (iiRes.error) {
          console.error('[DishDetails] ii load ERROR', iiRes.error);
        } else {
          (iiRes.data ?? []).forEach((it: any) => {
            // Parse price_per_unit as number (may arrive as text)
            iiMap.set(it.id, { 
              name: it.name, 
              price_per_unit: Number(it.price_per_unit) || 0 
            });
          });
        }
      }

      // Join on the client
      const ingredients = rows.map(r => {
        const ii = iiMap.get(r.inventory_item_id) ?? { name: '—', price_per_unit: 0 };
        const unitCost = Number(ii.price_per_unit) || 0;
        const lineCost = r.qty * unitCost;
        return {
          name: ii.name,
          qty: r.qty,
          unit: r.unit,
          unitCost,
          lineCost
        };
      });

      const price = Number(dishRes.data.price) || 0;
      const taxPercent = Number(dishRes.data.tax_percent) || 0;
      const ingredientCost = ingredients.reduce((s, it) => s + it.lineCost, 0);
      const netPrice = price; // taxes shown separately
      const margin = netPrice - ingredientCost;
      const costPct = netPrice > 0 ? (ingredientCost / netPrice) * 100 : 0;

      const details: DishDetails = {
        id: dishRes.data.id,
        name: dishRes.data.name,
        price: netPrice,
        taxPercent,
        ingredients,
        totals: { ingredientCost, netPrice, margin, costPct }
      };

      if (!cancelled) setState({ loading: false, details });
      console.log('[DishDetails] two-step OK', { dishId, items: ingredients.length, ingredientCost, costPct });
    })();

    return () => { cancelled = true; };
  }, [dishId]);

  return state;
}
