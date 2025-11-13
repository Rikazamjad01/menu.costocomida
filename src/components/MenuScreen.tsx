import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, ChevronDown, Eye, EyeOff, Sparkles, Crown, TrendingUp, FolderPlus, X, Edit2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useDishesWithIngredients, useMenuCategories, useInventoryItems, useDishProfitabilityAnalysis, useUserSettings } from '../hooks/useSupabase';
import { createDish, updateDish, deleteDish, deleteMenuCategory, updateMenuCategory, updateUserSettings, findOrCreateInventoryItem, addMultipleDishIngredients, createMenuCategory, upsertDishIngredients } from '../lib/supabase-helpers';
import { createClient } from '../utils/supabase/client';
import { IngredientCombobox } from './IngredientCombobox';
import { IngredientFormItem } from './IngredientFormItem';
import { DishDetailSheet } from './DishDetailSheet';

// Safe logging utility to prevent circular JSON errors
function safeLog(label: string, obj: unknown) {
  try {
    // Avoid logging DOM events / elements / React fibers
    if (obj instanceof Event || (obj as any)?.target?.nodeType || (obj as any)?.nativeEvent) {
      console.log(label, '[skipped-dom-event]');
      return;
    }
    // For objects, create a shallow copy to avoid circular refs
    if (typeof obj === 'object' && obj !== null) {
      const safe: any = {};
      for (const key in obj as any) {
        try {
          const value = (obj as any)[key];
          if (typeof value !== 'function' && typeof value !== 'symbol') {
            safe[key] = value;
          }
        } catch {
          safe[key] = '[unreadable]';
        }
      }
      console.log(label, safe);
    } else {
      console.log(label, obj);
    }
  } catch {
    console.log(label, '[unserializable]');
  }
}

// Helper para auto-seleccionar valores "0" al hacer foco (mejora UX en campos numéricos)
function handleFocusSelectZero(e: React.FocusEvent<HTMLInputElement>) {
  const value = e.target.value;
  // Si el valor es "0" o está vacío, seleccionar todo para facilitar reemplazo
  if (value === '0' || value === '' || parseFloat(value) === 0) {
    e.target.select();
  }
}

interface Ingredient {
  // Identificación
  inventoryItemId?: string;           // ID del ingrediente en inventory_items (si existe)
  isExisting: boolean;                 // Si es ingrediente existente o nuevo
  isEditing: boolean;                  // Si está editando valores de ingrediente existente
  
  // Datos básicos
  name: string;                        // Nombre del ingrediente
  
  // Unidades y precios (compra)
  purchaseUnit: string;                // Unidad de compra (kg, lt, ml)
  pricePerPurchaseUnit: string;        // Precio por unidad de compra
  
  // Unidad en plato (puede ser diferente)
  dishUnit: string;                    // Unidad usada en el plato (gramos, ml, piezas)
  quantityInDish: string;              // Cantidad usada en el plato
  
  // Merma del ingrediente
  ingredientWastage: string;           // % de merma del ingrediente (0-100)
  
  // Legacy (mantener compatibilidad)
  quantity: string;
  unit: string;
  price: string;
  wastePercentage: string;
}

interface Dish {
  id: string;
  name: string;
  ingredients: Ingredient[];
  category: string;
  price?: number;
  cost?: number;
  margin?: number;
}

interface Category {
  id: string;
  label: string;
  emoji: string;
  hidden?: boolean;
}

interface MenuScreenProps {
  onLogout?: () => void;
}

export default function MenuScreen({ onLogout }: MenuScreenProps) {
  // Hooks de Supabase
  const { dishes: dishesFromSupabase, loading: dishesLoading, refetch: refetchDishes } = useDishesWithIngredients();
  const { categories: categoriesFromSupabase, loading: categoriesLoading, refetch: refetchCategories } = useMenuCategories();
  const { items: inventoryItemsFromSupabase, refetch: refetchInventory } = useInventoryItems();
  const { profitabilityData } = useDishProfitabilityAnalysis();
  const { settings: userSettings, loading: userLoading, refetch: refetchUserSettings } = useUserSettings();

  // State
  const [showAddDishDialog, setShowAddDishDialog] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Form state
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishWastage, setDishWastage] = useState('0'); // Merma del plato completo
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { 
      name: '', 
      quantity: '', 
      unit: 'kg', 
      price: '', 
      wastePercentage: '0',
      // Nuevos campos
      isExisting: false,
      isEditing: false,
      purchaseUnit: 'kg',
      pricePerPurchaseUnit: '',
      dishUnit: 'gr',
      quantityInDish: '',
      ingredientWastage: '0',
    }
  ]);
  
  // Account settings form
  const [accountName, setAccountName] = useState('');
  const [accountCurrency, setAccountCurrency] = useState('MXN');
  const [taxPercentage, setTaxPercentage] = useState('0');
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Dish detail view - using explicit ID instead of full object
  const [dishDetailOpen, setDishDetailOpen] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState<string | undefined>(undefined);
  const [selectedDishName, setSelectedDishName] = useState<string | undefined>(undefined);
  
  // Compute the full dish object for DishDetailSheet
  const selectedDishForDetail = selectedDishId ? (() => {
    const dish = dishesFromSupabase?.find((d: any) => d.id === selectedDishId);
    if (!dish) return null;
    
    return {
      id: dish.id,
      name: dish.name,
      price: dish.price || 0,
      preparation: dish.preparation || '',
      allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
      ingredients: (dish.dish_ingredients || []).map((ing: any) => ({
        name: ing.inventory_item?.name || '',
        quantity: ing.quantity?.toString() || '0',
        unit: ing.unit || '',
        price: ing.inventory_item?.price_per_unit?.toString() || '0',
        wastePercentage: ing.waste_percentage?.toString() || '0'
      }))
    };
  })() : null;
  
  // Open dish detail function
  function openDishDetail(d: { id: string; name?: string }) {
    console.log('[DishDetail] Opening dish detail', { id: d.id, name: d.name });
    setSelectedDishId(d.id);
    setSelectedDishName(d.name ?? 'Plato');
    setDishDetailOpen(true);
  }
  
  // Collapsible state
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  
  // Add category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('🍽️');
  const [newCategoryTargetType, setNewCategoryTargetType] = useState<'cost' | 'margin'>('cost');
  const [newCategoryTargetValue, setNewCategoryTargetValue] = useState('30');
  
  // Edit category state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);

  // Dish creation status
  const [dishCreateStatus, setDishCreateStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [lastErrorCode, setLastErrorCode] = useState<string>('');

  const inventoryIngredients = inventoryItemsFromSupabase || [];
  
  // Debug: Log inventory items when they change
  console.log('🔍 MenuScreen - inventoryIngredients:', inventoryIngredients);
  console.log('🔍 MenuScreen - inventoryIngredients count:', inventoryIngredients.length);

  const unitOptions = ['kg', 'lt', 'ml', 'gr', 'piezas', 'tazas'];

  const currencyOptions = [
    { value: 'MXN', label: 'Peso Mexicano (MXN)', symbol: '$' },
    { value: 'USD', label: 'Dólar (USD)', symbol: '$' },
    { value: 'COP', label: 'Peso Colombiano (COP)', symbol: '$' },
    { value: 'ARS', label: 'Peso Argentino (ARS)', symbol: '$' },
    { value: 'CLP', label: 'Peso Chileno (CLP)', symbol: '$' },
    { value: 'PEN', label: 'Sol Peruano (PEN)', symbol: 'S/' },
    { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  ];

  const getCurrencySymbol = (currency: string) => {
    return currencyOptions.find(c => c.value === currency)?.symbol || '$';
  };

  // =====================================================
  // CONVERSIÓN DE UNIDADES Y CÁLCULO DE COSTOS CON MERMA
  // =====================================================

  /**
   * Convierte unidades a una base común para cálculos
   * kg, gr → gr (gramos)
   * lt, ml → ml
   * piezas, tazas → no se convierten (1:1)
   */
  const convertToBaseUnit = (quantity: number, unit: string): number => {
    const unitLower = unit.toLowerCase();
    
    // Masa: kg → gr (gramos)
    if (unitLower === 'kg') return quantity * 1000;
    if (unitLower === 'gr') return quantity;
    
    // Volumen: lt → ml
    if (unitLower === 'lt' || unitLower === 'l') return quantity * 1000;
    if (unitLower === 'ml') return quantity;
    
    // Otros: 1:1
    return quantity;
  };

  /**
   * Obtiene factor de conversión entre dos unidades
   * Ejemplo: de 'kg' a 'gr' (gramos) = 1000
   */
  const getConversionFactor = (fromUnit: string, toUnit: string): number => {
    const fromBase = convertToBaseUnit(1, fromUnit);
    const toBase = convertToBaseUnit(1, toUnit);
    return fromBase / toBase;
  };

  /**
   * Calcula el costo de un ingrediente considerando:
   * 1. Conversión de unidades (compra en kg, uso en gr)
   * 2. Merma del ingrediente (compro 100gr, solo uso 90gr con 10% merma)
   * 
   * Ejemplo:
   * - Precio: $20/kg
   * - Merma: 10%
   * - Cantidad en plato: 500 gr
   * 
   * Cálculo:
   * 1. Precio por gramo sin merma: $20/1000gr = $0.02/gr
   * 2. Con 10% merma, de 100gr comprados solo uso 90gr
   * 3. Precio real por gramo usable: $20/(1000gr * 0.9) = $0.0222/gr
   * 4. Costo para 500gr: 500gr * $0.0222/gr = $11.11
   */
  const calculateIngredientCost = (
    pricePerUnit: number,
    purchaseUnit: string,
    quantityInDish: number,
    dishUnit: string,
    wastagePercent: number
  ): number => {
    // 1. Convertir cantidad del plato a unidad de compra
    const conversionFactor = getConversionFactor(dishUnit, purchaseUnit);
    const quantityInPurchaseUnit = quantityInDish * conversionFactor;
    
    // 2. Aplicar merma: si compro X pero solo uso (X * (1 - merma%))
    //    el costo real aumenta porque pago por X pero solo uso menos
    const usableRatio = 1 - (wastagePercent / 100);
    const effectivePricePerUnit = usableRatio > 0 ? pricePerUnit / usableRatio : pricePerUnit;
    
    // 3. Costo final
    return quantityInPurchaseUnit * effectivePricePerUnit;
  };

  /**
   * Calcula el costo total de todos los ingredientes
   */
  const calculateTotalIngredientsCost = (): number => {
    return ingredients.reduce((total, ing) => {
      const price = parseFloat(ing.pricePerPurchaseUnit) || 0;
      const quantity = parseFloat(ing.quantityInDish) || 0;
      const wastage = parseFloat(ing.ingredientWastage) || 0;
      
      if (price <= 0 || quantity <= 0) return total;
      
      const cost = calculateIngredientCost(
        price,
        ing.purchaseUnit,
        quantity,
        ing.dishUnit,
        wastage
      );
      
      return total + cost;
    }, 0);
  };

  /**
   * Calcula el costo final del plato incluyendo:
   * 1. Costo de todos los ingredientes (con sus mermas)
   * 2. Merma del plato completo (se aplica sobre el total)
   * 
   * Ejemplo:
   * - Costo ingredientes: $50
   * - Merma del plato: 5%
   * - Costo final: $50 * (1 + 0.05) = $52.50
   */
  const calculateFinalDishCost = (): number => {
    const ingredientsCost = calculateTotalIngredientsCost();
    const platWastage = parseFloat(dishWastage) || 0;
    
    // La merma del plato incrementa el costo
    const wastageMultiplier = 1 + (platWastage / 100);
    return ingredientsCost * wastageMultiplier;
  };

  // Load user settings
  useEffect(() => {
    if (userSettings) {
      console.log('📥 [LoadSettings] Loading user settings:', {
        user_name: userSettings.user_name,
        currency: userSettings.currency,
        tax_percentage: userSettings.tax_percentage,
        raw_tax: userSettings.tax_percentage
      });
      
      const taxValue = (userSettings.tax_percentage || 0).toString();
      
      setAccountName(userSettings.user_name || '');
      setAccountCurrency(userSettings.currency || 'MXN');
      setTaxPercentage(taxValue);
      
      console.log('✅ [LoadSettings] State updated to:', {
        accountName: userSettings.user_name || '',
        accountCurrency: userSettings.currency || 'MXN',
        taxPercentage: taxValue,
        taxPercentage_parsed: parseFloat(taxValue)
      });
      
      // 🐛 Extra debug for tax
      console.log('🔍 [LoadSettings] TAX DETAILED DEBUG:', {
        original_value: userSettings.tax_percentage,
        converted_to_string: taxValue,
        will_parse_to: parseFloat(taxValue),
        state_value_after_set: taxPercentage
      });
    }
  }, [userSettings]);

  // Transformar datos de Supabase
  const menuItems = (dishesFromSupabase || []).map((dish: any) => ({
    id: dish.id,
    name: dish.name,
    category: dish.category_id || '',
    price: dish.price || 0,
    cost: 0, // Se calculará
    margin: 0, // Se calculará
    ingredients: (dish.dish_ingredients || []).map((ing: any) => ({
      name: ing.inventory_item?.name || '',
      quantity: ing.quantity?.toString() || '0',
      unit: ing.unit || '',
      price: ing.inventory_item?.price_per_unit?.toString() || '0',
      wastePercentage: ing.waste_percentage?.toString() || '0'
    }))
  }));

  const categories = (categoriesFromSupabase || []).map((cat: any) => ({
    id: cat.id,
    label: cat.name,
    emoji: cat.emoji || '🍽️',
    hidden: cat.is_hidden || false
  }));

  // Set first category as selected
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  // Helper functions - defined before use
  const calculateDishCost = (ingredients: Ingredient[]): number => {
    return ingredients.reduce((total, ing) => {
      const quantity = parseFloat(ing.quantity) || 0;
      const price = parseFloat(ing.price) || 0;
      const waste = parseFloat(ing.wastePercentage) || 0;
      
      // Costo base
      const baseCost = quantity * price;
      
      // Agregar merma
      const wasteAmount = baseCost * (waste / 100);
      
      return total + baseCost + wasteAmount;
    }, 0);
  };

  const calculateNetPrice = (publicPrice: number, taxPercent: number): number => {
    const taxAmount = publicPrice * (taxPercent / 100);
    return publicPrice - taxAmount;
  };

  const calculateMargin = (publicPrice: number, cost: number, taxPercent: number = 0): number => {
    if (publicPrice <= 0) return 0;
    const netPrice = calculateNetPrice(publicPrice, taxPercent);
    return ((netPrice - cost) / netPrice) * 100;
  };

  // Calcular rentabilidad por categoría
  const getCategoryStats = () => {
    const stats: any = {};
    
    categories.forEach(cat => {
      const categoryDishes = menuItems.filter(d => d.category === cat.id);
      const totalDishes = categoryDishes.length;
      
      if (totalDishes === 0) {
        stats[cat.id] = { avgMargin: 0, avgCostPercent: 0, totalDishes: 0, totalRevenue: 0 };
        return;
      }

      const margins = categoryDishes.map(d => {
        const cost = calculateDishCost(d.ingredients);
        const price = d.price || 0;
        const taxPercent = parseFloat(taxPercentage) || 0;
        return calculateMargin(price, cost, taxPercent);
      });

      const avgMargin = margins.reduce((sum, m) => sum + m, 0) / totalDishes;
      const avgCostPercent = 100 - avgMargin;
      
      stats[cat.id] = {
        avgMargin: Math.round(avgMargin),
        avgCostPercent: Math.round(avgCostPercent),
        totalDishes,
        totalRevenue: categoryDishes.reduce((sum, d) => sum + (d.price || 0), 0)
      };
    });

    return stats;
  };

  const categoryStats = getCategoryStats();

  // Encontrar categoría más rentable
  const mostProfitableCategory = categories
    .filter(c => !c.hidden && categoryStats[c.id]?.totalDishes > 0)
    .sort((a, b) => (categoryStats[b.id]?.avgMargin || 0) - (categoryStats[a.id]?.avgMargin || 0))[0];

  /**
   * Obtiene el color de barra/badge basado en el margen
   * Escala gradual de verdes (sin juicios de valor)
   */
  const getMarginColor = (margin: number): string => {
    // Escala de colores neutros a verdes intensos
    if (margin >= 80) return '#4e9643';      // Verde oscuro intenso
    if (margin >= 60) return '#7BB97A';      // Verde principal
    if (margin >= 40) return '#8BC980';      // Verde medio-claro
    if (margin >= 20) return '#A6D49F';      // Verde muy claro
    return '#9FB3A8';                         // Gris-verde neutro
  };

  /**
   * Obtiene el color basado en el porcentaje de Costo MP
   * Costo MP más bajo = mejor (verde oscuro)
   */
  const getCostPercentageColor = (costPercent: number): string => {
    if (costPercent <= 20) return '#4e9643';      // Verde oscuro - excelente
    if (costPercent <= 30) return '#7BB97A';      // Verde principal - bueno
    if (costPercent <= 40) return '#8BC980';      // Verde medio - aceptable
    if (costPercent <= 50) return '#A6D49F';      // Verde claro - alto
    return '#9FB3A8';                              // Gris - muy alto
  };

  /**
   * Retorna el texto y estilo del badge de margen
   * Solo muestra el porcentaje, sin valoraciones
   */
  const getMarginBadge = (margin: number) => {
    const color = getMarginColor(margin);
    return { 
      text: `${margin.toFixed(0)}%`, 
      bg: `text-white`,
      bgColor: color
    };
  };

  /**
   * Abre el diálogo de agregar plato y refresca el inventario
   * para mostrar ingredientes recién creados
   */
  const handleOpenAddDishDialog = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowAddDishDialog(true);
    // Refrescar inventario para mostrar ingredientes recién creados
    refetchInventory();
  };

  /**
   * Maneja el cambio de contraseña del usuario
   */
  const handleChangePassword = async () => {
    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setIsChangingPassword(true);

    try {
      const supabase = createClient();

      // Obtener el email del usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user?.email) {
        console.error('Error al obtener usuario:', userError);
        toast.error('Error al verificar sesión');
        setIsChangingPassword(false);
        return;
      }

      // Verificar que la contraseña actual sea correcta
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        console.error('Error al verificar contraseña actual:', signInError);
        toast.error('La contraseña actual es incorrecta');
        setIsChangingPassword(false);
        return;
      }

      // Cambiar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Error al cambiar contraseña:', updateError);
        toast.error('Error al cambiar contraseña');
        setIsChangingPassword(false);
        return;
      }

      // Éxito
      toast.success('Contraseña actualizada exitosamente');
      
      // Limpiar campos y cerrar
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      
    } catch (error: any) {
      console.error('Error inesperado al cambiar contraseña:', error);
      toast.error('Error inesperado al cambiar contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { 
      name: '', 
      quantity: '', 
      unit: 'kg', 
      price: '', 
      wastePercentage: '0',
      // Nuevos campos
      isExisting: false,
      isEditing: false,
      purchaseUnit: 'kg',
      pricePerPurchaseUnit: '',
      dishUnit: 'gr',
      quantityInDish: '',
      ingredientWastage: '0',
    }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  /**
   * Cuando el usuario selecciona un ingrediente existente del combobox,
   * auto-rellenamos los datos: precio, unidad, merma
   */
  const handleSelectExistingIngredient = (index: number, item: any) => {
    console.log('🔍 handleSelectExistingIngredient - Selected item:', item);
    
    // Validar que el item tenga los campos necesarios
    if (!item || !item.id || !item.name) {
      console.error('❌ Item inválido:', item);
      toast.error('Error al seleccionar ingrediente');
      return;
    }
    
    const updated = [...ingredients];
    updated[index] = {
      ...updated[index],
      inventoryItemId: item.id,
      isExisting: true,
      isEditing: false,
      name: item.name,
      purchaseUnit: item.unit || 'kg',
      pricePerPurchaseUnit: (item.price_per_unit || 0).toString(),
      // Note: wastage_percentage does NOT exist in inventory_items table
      // Keep waste% as local UI state only (default to 0)
      ingredientWastage: '0',
      // Mantener valores de dishUnit y quantityInDish que ya tenía
      // Legacy fields (para compatibilidad)
      unit: item.unit || 'kg',
      price: (item.price_per_unit || 0).toString(),
      wastePercentage: '0',
    };
    setIngredients(updated);
    console.log('✅ Ingrediente actualizado:', updated[index]);
  };

  /**
   * Cuando el usuario quiere crear un nuevo ingrediente,
   * cambiamos el modo a "nuevo" y capturamos el nombre que escribió
   */
  const handleCreateNewIngredient = (index: number, name: string) => {
    const updated = [...ingredients];
    updated[index] = {
      name: name, // Capturar el nombre que el usuario escribió
      purchaseUnit: '',
      pricePerPurchaseUnit: '',
      dishUnit: '',
      quantityInDish: '',
      ingredientWastage: '0',
      inventoryItemId: undefined,
      isExisting: false,
      isEditing: true,
    };
    setIngredients(updated);
    
    // Mostrar un mensaje informativo
    if (name) {
      console.log(`✅ Creando nuevo ingrediente: "${name}"`);
    }
  };

  /**
   * Permite editar los valores de un ingrediente existente
   * (precio, unidad, merma pueden cambiar para este plato específico)
   */
  const handleToggleEditIngredient = (index: number) => {
    const updated = [...ingredients];
    updated[index].isEditing = !updated[index].isEditing;
    setIngredients(updated);
  };

  const handleSaveDish = async () => {
    console.log('🔍 handleSaveDish - Starting...', { ingredients });
    
    setDishCreateStatus('saving');
    setLastErrorCode('');
    
    // Validar usando los nuevos campos
    const validIngredients = ingredients.filter(ing => 
      ing.name && 
      ing.quantityInDish && 
      ing.pricePerPurchaseUnit &&
      ing.purchaseUnit &&
      ing.dishUnit
    );
    
    console.log('🔍 handleSaveDish - Valid ingredients:', validIngredients);
    
    if (!dishName || validIngredients.length === 0) {
      toast.error('Completa los campos requeridos', {
        description: 'Nombre del plato, ingredientes con cantidad y precio.',
      });
      setDishCreateStatus('idle');
      return;
    }

    if (!selectedCategory) {
      toast.error('Selecciona una categoría');
      setDishCreateStatus('idle');
      return;
    }

    const price = dishPrice ? parseFloat(dishPrice) : 0;
    
    if (price <= 0) {
      toast.error('Agrega un precio de venta válido');
      setDishCreateStatus('idle');
      return;
    }

    const cost = calculateFinalDishCost();
    const margin = calculateMargin(price, cost);

    try {
      let dish: any;
      const supabase = createClient();
      
      if (editingDish) {
        // UPDATE MODE
        safeLog('[DishEdit] Updating dish', { 
          dishId: editingDish.id, 
          dishName, 
          price, 
          category: selectedCategory 
        });
        
        dish = await updateDish(editingDish.id, {
          name: dishName,
          category_id: selectedCategory,
          price: price,
        });
        
        // Delete existing dish_ingredients
        await supabase
          .from('dish_ingredients')
          .delete()
          .eq('dish_id', editingDish.id);
        
        safeLog('[DishEdit] Dish updated, old ingredients deleted', { 
          dishId: dish.id,
          dishName: dish.name 
        });
      } else {
        // CREATE MODE
        console.log('[DishCreate] Step 1: Creating dish...', { dishName, price, category: selectedCategory });
        
        dish = await createDish({
          name: dishName,
          category_id: selectedCategory,
          price: price,
          description: ''
        });
        
        console.log('[DishCreate] Step 1 Complete: Dish created', { id: dish.id, name: dish.name });
      }
      
      // Step 2: Convert UI ingredients to UiIngredient format
      console.log('[DishCreate] Step 2: Converting ingredients...');
      
      const uiIngredients: Array<{
        name: string;
        qty: number;
        unit: string;
        unitPrice: number;
        inventory_item_id?: string | null;
        category: string;
        emoji: string;
      }> = validIngredients.map((ing) => {
        // Convertir cantidad del plato a unidad de compra para guardar
        const conversionFactor = getConversionFactor(ing.dishUnit, ing.purchaseUnit);
        const quantityInPurchaseUnit = parseFloat(ing.quantityInDish) * conversionFactor;
        
        console.log(`[DishCreate] Conversion: ${ing.quantityInDish} ${ing.dishUnit} → ${quantityInPurchaseUnit} ${ing.purchaseUnit} (factor: ${conversionFactor})`);
        
        return {
          name: ing.name,
          qty: quantityInPurchaseUnit,
          unit: ing.purchaseUnit,
          unitPrice: parseFloat(ing.pricePerPurchaseUnit) || 0,
          inventory_item_id: ing.inventoryItemId || null,
          category: 'Ingrediente',
          emoji: '🍴'
        };
      });
      
      console.log('[DishCreate] Step 2 Complete: Converted', uiIngredients.length, 'ingredients');
      
      // Step 3: Upsert dish ingredients using new helper
      console.log('[DishCreate] Step 3: Upserting dish ingredients...');
      
      const { data: { user } } = await supabase.auth.getUser();
      const upsertRes = await upsertDishIngredients(dish.id, uiIngredients, user?.id ?? null);
      
      console.log('[DishCreate] upsert result', upsertRes);
      
      if (!upsertRes.ok) {
        console.error('[DishCreate] Step 3 ERROR: Some ingredients failed', upsertRes.errors);
        toast.error('Ingredientes con problemas', {
          description: 'Algunos ingredientes no se guardaron. Revisa la consola.',
        });
        // Continue anyway to refresh data
      } else {
        console.log('[DishCreate] Step 3 Complete: Inserted', upsertRes.count, 'ingredients');
      }
      
      // Step 4: Refrescar datos para que los nuevos ingredientes aparezcan en el dropdown
      console.log('[DishCreate] Step 4: Refreshing data...');
      
      await Promise.all([
        refetchDishes(),
        refetchInventory()
      ]);
      setOpenCategories([selectedCategory]);
      
      console.log('[DishCreate] Step 4 Complete: Data refreshed');
      console.log('[DishCreate] SUCCESS: Dish saved with', upsertRes.ok ? upsertRes.count : 0, 'ingredients');
      
      // 🔄 Auto-actualizar tax_percentage en settings con el último valor usado en el plato
      const currentTaxInSettings = parseFloat(userSettings?.tax_percentage?.toString() || '0') || 0;
      const taxInDish = parseFloat(taxPercentage) || 0;
      
      // Actualizar solo si el valor cambió (evita llamadas redundantes)
      if (taxInDish >= 0 && taxInDish !== currentTaxInSettings) {
        console.log('🔄 [TaxSync] Updating tax_percentage in settings with last used value:', {
          from: currentTaxInSettings,
          to: taxInDish
        });
        
        try {
          await updateUserSettings({
            tax_percentage: taxInDish
          });
          await refetchUserSettings();
          console.log('✅ [TaxSync] Tax percentage synced successfully');
        } catch (error) {
          console.error('❌ [TaxSync] Error syncing tax percentage:', error);
          // No mostrar error al usuario, es una actualización silenciosa
        }
      }
      
      const successMessage = editingDish ? '¡Plato actualizado!' : '¡Plato guardado!';
      const descriptionMessage = upsertRes.ok 
        ? `${upsertRes.count} ingredientes • Costo: ${getCurrencySymbol(accountCurrency)}${cost.toFixed(2)} • Margen: ${margin.toFixed(0)}%`
        : 'Ingredientes guardados correctamente';
      
      toast.success(successMessage, {
        description: descriptionMessage,
      });
      
      setDishCreateStatus('idle');
      setLastErrorCode('');
      
      // Reset form
      setDishName('');
      setDishPrice('');
      setDishWastage('0');
      setEditingDish(null); // Clear editing mode
      setIngredients([{ 
        name: '', 
        quantity: '', 
        unit: 'kg', 
        price: '', 
        wastePercentage: '0',
        isExisting: false,
        isEditing: false,
        purchaseUnit: 'kg',
        pricePerPurchaseUnit: '',
        dishUnit: 'gr',
        quantityInDish: '',
        ingredientWastage: '0',
      }]);
      setShowAddDishDialog(false);
    } catch (error: any) {
      console.error('❌ ERROR saving dish:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        code: error.code,
        ...error
      });
      
      const errorCode = error.code || 'UNKNOWN';
      setDishCreateStatus('error');
      setLastErrorCode(errorCode);
      
      toast.error('Error al guardar plato', {
        description: `Code: ${errorCode} - ${error.message || 'Revisa la consola'}`
      });
    }
  };

  const handleDeleteDish = async () => {
    if (dishToDelete) {
      try {
        await deleteDish(dishToDelete.id);
        await refetchDishes();
        
        toast.success('Plato eliminado');
        setDishToDelete(null);
      } catch (error) {
        console.error('Error deleting dish:', error);
        toast.error('Error al eliminar plato');
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      const categoryItems = menuItems.filter(item => item.category === categoryToDelete.id);
      
      if (categoryItems.length > 0) {
        toast.error('No puedes eliminar una categoría con platos');
        return;
      }

      try {
        await deleteMenuCategory(categoryToDelete.id);
        await refetchCategories();
        
        toast.success('Categoría eliminada');
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Error al eliminar categoría');
      }
    }
  };

  const handleHideCategory = async (category: Category) => {
    try {
      await updateMenuCategory(category.id, { is_hidden: true });
      await refetchCategories();
      toast.success('Categoría ocultada');
    } catch (error) {
      console.error('Error hiding category:', error);
      toast.error('Error al ocultar categoría');
    }
  };

  const handleUnhideCategory = async (categoryId: string) => {
    try {
      await updateMenuCategory(categoryId, { is_hidden: false });
      await refetchCategories();
      toast.success('Categoría visible nuevamente');
    } catch (error) {
      console.error('Error unhiding category:', error);
      toast.error('Error al mostrar categoría');
    }
  };

  const handleSaveAccountSettings = async () => {
    try {
      const taxValue = parseFloat(taxPercentage) || 0;
      console.log('💾 [SaveSettings] Saving:', {
        user_name: accountName,
        currency: accountCurrency,
        tax_percentage: taxValue
      });
      
      await updateUserSettings({
        user_name: accountName,
        currency: accountCurrency,
        tax_percentage: taxValue
      });
      
      console.log('✅ [SaveSettings] Settings saved, refetching...');
      await refetchUserSettings();
      
      setShowAccountSettings(false);
      toast.success('Configuración actualizada');
    } catch (error) {
      console.error('❌ [SaveSettings] Error updating settings:', error);
      toast.error('Error al actualizar configuración');
    }
  };

  const handleCloseApp = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    try {
      // Cerrar sesión de Supabase
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        toast.error('Error al cerrar sesión');
        return;
      }
      
      // Cerrar settings dialog y confirmation
      setShowAccountSettings(false);
      setShowLogoutConfirm(false);
      
      toast.success('Sesión cerrada exitosamente');
      
      // Llamar a onLogout para volver a WelcomeScreen
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Ingresa un nombre para la categoría');
      return;
    }

    try {
      // Calcular valores de target basado en el tipo seleccionado
      const targetValue = parseFloat(newCategoryTargetValue) || 0;
      const targetCost = newCategoryTargetType === 'cost' ? targetValue : 100 - targetValue;
      const targetMargin = newCategoryTargetType === 'margin' ? targetValue : 100 - targetValue;

      await createMenuCategory({
        name: newCategoryName.trim(),
        emoji: newCategoryEmoji,
        target_cost_percentage: targetCost,
        target_margin_percentage: targetMargin
      });
      
      await refetchCategories();
      setShowAddCategoryDialog(false);
      setNewCategoryName('');
      setNewCategoryEmoji('🍽️');
      setNewCategoryTargetType('cost');
      setNewCategoryTargetValue('30');
      toast.success('¡Categoría creada!');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error al crear categoría');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) {
      toast.error('No hay categoría seleccionada');
      return;
    }

    if (!newCategoryName.trim()) {
      toast.error('Ingresa un nombre para la categoría');
      return;
    }

    try {
      // Calcular valores de target basado en el tipo seleccionado
      const targetValue = parseFloat(newCategoryTargetValue) || 0;
      const targetCost = newCategoryTargetType === 'cost' ? targetValue : 100 - targetValue;
      const targetMargin = newCategoryTargetType === 'margin' ? targetValue : 100 - targetValue;

      // Actualizar categoría (los platos mantienen su category_id intacto)
      await updateMenuCategory(editingCategory.id, {
        name: newCategoryName.trim(),
        emoji: newCategoryEmoji,
        target_cost_percentage: targetCost,
        target_margin_percentage: targetMargin
      });
      
      await refetchCategories();
      setShowEditCategoryDialog(false);
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryEmoji('🍽️');
      setNewCategoryTargetType('cost');
      setNewCategoryTargetValue('30');
      toast.success('¡Categoría actualizada!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar categoría');
    }
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => {
      if (prev.includes(categoryId)) {
        return [];
      }
      return [categoryId];
    });
  };

  // Loading state
  if (dishesLoading || categoriesLoading || userLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A6D49F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#4D6B59] font-['Inter'] text-[16px]">Cargando...</p>
        </div>
      </div>
    );
  }

  const userName = userSettings?.user_name || 'Usuario';

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Sticky Header - Solo Logo y Settings */}
      <div className="bg-white px-5 py-4 border-b border-[#CFE0D8] shadow-[0_1px_2px_rgba(16,24,40,0.06)] sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://i.imgur.com/FmXlRsk.png" 
              alt="CostoComida" 
              className="h-[58px] w-auto object-contain"
            />
          </div>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowAccountSettings(true)}
            className="p-2 hover:bg-[#F5FAF7] rounded-[16px] transition-colors"
          >
            <Settings size={24} className="text-[#4D6B59]" />
          </button>
        </div>
      </div>

      {/* Scrollable Content - Welcome, Dashboard, Chart */}
      <div className="px-5 py-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-[#1A1A1A] mb-1 font-['Poppins'] text-[28px] leading-[36px] tracking-[-0.56px] font-semibold">
            Bienvenido, {userName}
          </h1>
          <p className="text-[#4D6B59] font-['Inter'] text-[16px]">
            ¡Vamos a calcular tus costos!
          </p>
        </div>

        {/* Dashboard Stats - Categoría más rentable */}
        {mostProfitableCategory && categoryStats[mostProfitableCategory.id]?.totalDishes > 0 && (
          <Card className="bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] border-0 shadow-[0_4px_12px_rgba(16,24,40,0.08)] mb-4">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={18} className="text-white" />
                    <p className="text-[14px] text-white font-['Inter']">Categoría más rentable</p>
                  </div>
                  <p className="text-[22px] leading-[30px] text-white font-['Poppins'] font-semibold">
                    {mostProfitableCategory.emoji} {mostProfitableCategory.label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[36px] leading-[44px] text-white font-['Poppins'] font-bold">
                    {categoryStats[mostProfitableCategory.id]?.avgMargin}%
                  </p>
                  <p className="text-[14px] text-white/90 font-['Inter']">margen prom.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Rentabilidad por Categoría */}
        {(() => {
          const chartData = categories
            .filter(cat => !cat.hidden && categoryStats[cat.id]?.totalDishes > 0)
            .map(cat => {
              const avgMargin = categoryStats[cat.id]?.avgMargin || 0;
              // Usar escala gradual de verdes (sin umbrales fijos)
              const color = getMarginColor(avgMargin);
              return {
                name: cat.emoji,
                label: cat.label,
                margen: avgMargin,
                color: color
              };
            })
            .sort((a, b) => b.margen - a.margen);

          if (chartData.length === 0) return null;

          return (
            <Card className="bg-white border border-[#CFE0D8] shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={18} className="text-[#7BB97A]" />
                  <h3 className="text-[#1A1A1A] font-['Poppins'] text-[18px] leading-[26px] font-semibold">
                    Rentabilidad por Categoría
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CFE0D8" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#4D6B59', fontSize: 20, fontFamily: 'Inter' }}
                      axisLine={{ stroke: '#CFE0D8' }}
                    />
                    <YAxis 
                      tick={{ fill: '#4D6B59', fontSize: 12, fontFamily: 'Inter' }}
                      axisLine={{ stroke: '#CFE0D8' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: '1px solid #CFE0D8',
                        backgroundColor: 'white',
                        fontFamily: 'Inter',
                        boxShadow: '0 4px 12px rgba(16,24,40,0.08)'
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value}% margen`,
                        props.payload.label
                      ]}
                      labelFormatter={() => ''}
                    />
                    <Bar dataKey="margen" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Leyenda removida - Los colores son graduales sin umbrales fijos */}

              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Categories List */}
      <div className="px-5 space-y-4">
        {/* Add Category Button */}
        <Button
          onClick={() => setShowAddCategoryDialog(true)}
          variant="outline"
          className="w-full h-[56px] rounded-[16px] border-2 border-dashed border-[#A6D49F] text-[#7BB97A] hover:bg-[#F5FAF7] font-['Inter'] text-[16px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
        >
          <FolderPlus size={20} className="mr-2" />
          Agregar nueva categoría
        </Button>

        {categories.filter(cat => !cat.hidden).map((category) => {
          const categoryItems = menuItems.filter(item => item.category === category.id);
          const count = categoryItems.length;
          const isOpen = openCategories.includes(category.id);
          const stats = categoryStats[category.id] || { avgMargin: 0, totalDishes: 0 };
          
          return (
            <Collapsible
              key={category.id}
              open={isOpen}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <div className={`rounded-[16px] overflow-hidden transition-all duration-200 ${
                isOpen ? 'bg-white border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)]' : 'bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] border border-[#CFE0D8]'
              }`}>
                {/* Category Header */}
                <CollapsibleTrigger asChild>
                  <div className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F5FAF7] transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{category.emoji}</span>
                      <div>
                        <h3 className="text-[#1A1A1A] font-['Inter'] text-[16px] font-medium">{category.label}</h3>
                        <p className="text-[14px] text-[#9FB3A8] font-['Inter']">
                          {count} plato{count !== 1 ? 's' : ''}
                          {stats.avgCostPercent > 0 && ` • ${stats.avgCostPercent}% Costo MP`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Edit Category */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Pre-poblar el form con los datos actuales
                          setEditingCategory(category);
                          setNewCategoryName(category.label);
                          setNewCategoryEmoji(category.emoji);
                          
                          // Pre-poblar targets si existen
                          const cat = categoriesFromSupabase?.find((c: any) => c.id === category.id);
                          if (cat?.target_cost_percentage !== null && cat?.target_cost_percentage !== undefined) {
                            setNewCategoryTargetType('cost');
                            setNewCategoryTargetValue(cat.target_cost_percentage.toString());
                          } else if (cat?.target_margin_percentage !== null && cat?.target_margin_percentage !== undefined) {
                            setNewCategoryTargetType('margin');
                            setNewCategoryTargetValue(cat.target_margin_percentage.toString());
                          } else {
                            setNewCategoryTargetType('cost');
                            setNewCategoryTargetValue('30');
                          }
                          
                          setShowEditCategoryDialog(true);
                        }}
                        className="p-2 hover:bg-[#F5FAF7] rounded-[16px] transition-colors"
                      >
                        <Edit2 size={16} className="text-[#7BB97A]" />
                      </button>
                      
                      {/* Delete/Hide Category */}
                      {count === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryToDelete(category);
                          }}
                          className="p-2 hover:bg-red-50 rounded-[16px] transition-colors"
                        >
                          <Trash2 size={16} className="text-[#DC2626]" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHideCategory(category);
                          }}
                          className="p-2 hover:bg-[#F5FAF7] rounded-[16px] transition-colors"
                        >
                          <EyeOff size={16} className="text-[#9FB3A8]" />
                        </button>
                      )}
                      
                      <ChevronDown 
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#7BB97A]' : 'text-[#9FB3A8]'}`}
                        size={20}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Category Content */}
                <CollapsibleContent>
                  <div className="px-5 pb-5 border-t border-[#CFE0D8]">
                    {categoryItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-[16px] text-[#9FB3A8] mb-4 font-['Inter']">
                          No hay platos en esta categoría
                        </p>
                        <Button
                          onClick={() => handleOpenAddDishDialog(category.id)}
                          className="bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] hover:opacity-90 text-white rounded-[16px] h-[48px] font-['Inter'] font-medium shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
                        >
                          <Plus size={18} className="mr-2" />
                          Agregar plato
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 mt-4 mb-4">
                          {categoryItems.map((dish) => {
                            const cost = calculateDishCost(dish.ingredients);
                            const taxPercent = parseFloat(taxPercentage) || 0;
                            const margin = calculateMargin(dish.price || 0, cost, taxPercent);
                            
                            // Calculate cost percentage (complemento del margen)
                            const costPercentage = 100 - margin;
                            const costColor = getCostPercentageColor(costPercentage);

                            return (
                              <div
                                key={dish.id}
                                className="bg-[#F5FAF7] rounded-[16px] p-4 hover:shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-all cursor-pointer"
                                onClick={() => openDishDetail({ id: dish.id, name: dish.name })}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h4 className="text-[#1A1A1A] mb-2 font-['Inter'] text-[16px] font-medium">{dish.name}</h4>
                                    <div className="space-y-1">
                                      <div 
                                        className="text-[16px] font-['Inter'] font-semibold"
                                        style={{ color: costColor }}
                                      >
                                        Costo MP: {costPercentage.toFixed(0)}%
                                      </div>
                                      <div className="text-[14px] text-[#9FB3A8] font-['Inter']">
                                        Margen bruto: {margin.toFixed(0)}%
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right ml-3">
                                    <p className="text-[#1A1A1A] font-['Poppins'] text-[18px] font-semibold">
                                      {getCurrencySymbol(accountCurrency)}{(dish.price || 0).toFixed(2)}
                                    </p>
                                    <p className="text-[14px] text-[#9FB3A8] font-['Inter']">
                                      Costo: {getCurrencySymbol(accountCurrency)}{cost.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDishDetail({ id: dish.id, name: dish.name });
                                    }}
                                    className="text-[14px] text-[#7BB97A] hover:text-[#4e9643] transition-colors font-['Inter'] font-medium"
                                  >
                                    Ver detalles
                                  </button>
                                  <span className="text-[#CFE0D8]">•</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDishToDelete(dish);
                                    }}
                                    className="text-[14px] text-[#DC2626] hover:text-[#B91C1C] transition-colors font-['Inter']"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <Button
                          onClick={() => handleOpenAddDishDialog(category.id)}
                          variant="outline"
                          className="w-full border-2 border-dashed border-[#A6D49F] text-[#7BB97A] hover:bg-[#F5FAF7] rounded-[16px] h-[48px] font-['Inter'] font-medium"
                        >
                          <Plus size={18} className="mr-2" />
                          Agregar otro plato
                        </Button>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {/* Hidden Categories */}
        {categories.filter(cat => cat.hidden).length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#CFE0D8]">
            <h3 className="text-[16px] text-[#9FB3A8] mb-4 font-['Inter']">Categorías ocultas</h3>
            <div className="space-y-3">
              {categories.filter(cat => cat.hidden).map(category => (
                <div key={category.id} className="flex items-center justify-between p-4 rounded-[16px] bg-[#F5FAF7] border border-[#CFE0D8]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.emoji}</span>
                    <span className="text-[16px] text-[#2F3A33] font-['Inter']">{category.label}</span>
                  </div>
                  <Button
                    onClick={() => handleUnhideCategory(category.id)}
                    variant="ghost"
                    className="text-[#7BB97A] font-['Inter'] text-[14px]"
                  >
                    <Eye size={14} className="mr-1" />
                    Mostrar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Upgrade Teaser (Disabled) */}
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Crown size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[16px] text-purple-900 font-['Poppins'] font-semibold">
                    IA Premium - Próximamente
                  </h4>
                  <Badge className="bg-purple-100 text-purple-700 text-[12px] font-['Inter']">Pronto</Badge>
                </div>
                <p className="text-[14px] text-purple-800 leading-relaxed mb-3 font-['Inter']">
                  • Recomendaciones inteligentes de platos<br />
                  • Análisis de tendencias de costos<br />
                  • Optimización automática de menú<br />
                  • Alertas de rentabilidad
                </p>
                <Button
                  disabled
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-[16px] h-[48px] opacity-50 cursor-not-allowed font-['Inter'] font-medium"
                >
                  <Sparkles size={16} className="mr-2" />
                  Actualizar a Premium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Dish Dialog */}
      <Dialog open={showAddDishDialog} onOpenChange={setShowAddDishDialog}>
        <DialogContent 
          className="max-w-[420px] max-h-[90vh] overflow-y-auto rounded-[24px] bg-white border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)]"
          aria-describedby="add-dish-description"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-[#1A1A1A] font-['Poppins'] text-[22px] leading-[30px] tracking-[-0.44px] font-semibold">
              {editingDish ? 'Editar plato' : 'Crea tu plato'}
            </DialogTitle>
            <DialogDescription id="add-dish-description" className="text-center text-[#9FB3A8] text-[14px] font-['Inter']">
              {editingDish 
                ? 'Modifica los ingredientes y actualiza el costo' 
                : 'Agrega los ingredientes y calcula el costo automáticamente'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Dish Name */}
            <div>
              <Label htmlFor="dishName" className="text-[#4D6B59] mb-2 font-['Inter'] text-[14px] font-medium">
                Nombre del plato
              </Label>
              <Input
                id="dishName"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="Ej. Tacos al pastor"
                className="rounded-[16px] border-[#CFE0D8] focus:border-[#7BB97A] h-[48px] font-['Inter'] text-[16px]"
              />
            </div>

            {/* Ingredients */}
            <div>
              <Label className="text-[#4D6B59] mb-3 font-['Inter'] text-[14px] font-medium">Ingredientes</Label>
              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <IngredientFormItem
                    key={index}
                    ingredient={ingredient}
                    index={index}
                    inventoryItems={inventoryIngredients}
                    canRemove={ingredients.length > 1}
                    currencySymbol={getCurrencySymbol(accountCurrency)}
                    onRemove={() => removeIngredient(index)}
                    onUpdate={(field, value) => updateIngredient(index, field, value)}
                    onSelectExisting={(item) => handleSelectExistingIngredient(index, item)}
                    onCreateNew={(name) => handleCreateNewIngredient(index, name)}
                    onToggleEdit={() => handleToggleEditIngredient(index)}
                  />
                ))}
                
                <Button
                  type="button"
                  onClick={addIngredient}
                  variant="outline"
                  className="w-full rounded-[16px] border-2 border-dashed border-[#A6D49F] text-[#7BB97A] hover:bg-[#F5FAF7] h-[48px] font-['Inter'] font-medium"
                >
                  <Plus size={18} className="mr-2" />
                  Agregar ingrediente
                </Button>
              </div>
            </div>

            {/* Dish Wastage (merma del plato completo) */}
            <div>
              <Label htmlFor="dishWastage" className="text-[#4D6B59] mb-2 font-['Inter'] text-[14px] font-medium">
                % Merma del plato completo
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="dishWastage"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={dishWastage}
                  onChange={(e) => setDishWastage(e.target.value)}
                  onFocus={handleFocusSelectZero}
                  placeholder="0"
                  className="rounded-[16px] border-[#CFE0D8] focus:border-[#7BB97A] h-[48px] font-['Inter'] text-[16px]"
                />
                <span className="text-[14px] text-[#9FB3A8] font-['Inter'] whitespace-nowrap">
                  (se aplica sobre el costo total)
                </span>
              </div>
              <p className="text-[12px] text-[#9FB3A8] mt-1 font-['Inter']">
                La merma del plato aumenta el costo final. Ej: 5% sobre $100 = $105
              </p>
            </div>

            {/* Cost Summary */}
            {(() => {
              const ingredientsCost = calculateTotalIngredientsCost();
              const totalCost = calculateFinalDishCost();
              const price = parseFloat(dishPrice) || 0;
              const taxPercent = parseFloat(taxPercentage) || 0;
              const margin = calculateMargin(price, totalCost, taxPercent);
              const marginBadge = getMarginBadge(margin);
              const platWastage = parseFloat(dishWastage) || 0;

              return (
                <div className="bg-[#F5FAF7] border border-[#CFE0D8] rounded-[16px] p-5 space-y-3">
                  {/* Costo ingredientes */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#CFE0D8]">
                    <span className="text-[14px] text-[#4D6B59] font-['Inter']">Costo ingredientes</span>
                    <span className="text-[16px] text-[#2F3A33] font-['Inter'] font-medium">
                      {getCurrencySymbol(accountCurrency)}{ingredientsCost.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Merma del plato */}
                  {platWastage > 0 && (
                    <div className="flex items-center justify-between text-[#F59E0B]">
                      <span className="text-[14px] font-['Inter']">+ Merma del plato ({platWastage}%)</span>
                      <span className="text-[16px] font-['Inter'] font-medium">
                        {getCurrencySymbol(accountCurrency)}{(ingredientsCost * (platWastage / 100)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Costo total final */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#CFE0D8]">
                    <span className="text-[16px] text-[#1A1A1A] font-['Inter'] font-semibold">Costo total</span>
                    <span className="text-[22px] text-[#1A1A1A] font-['Poppins'] font-bold">
                      {getCurrencySymbol(accountCurrency)}{totalCost.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Costo MP % y Margen Neto */}
                  {price > 0 && (
                    <>
                      {/* Costo MP */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#CFE0D8]">
                        <span className="text-[16px] text-[#4D6B59] font-['Inter']">Costo MP</span>
                        <span 
                          className="text-[22px] font-['Poppins'] font-semibold"
                          style={{ color: getCostPercentageColor(100 - margin) }}
                        >
                          {(100 - margin).toFixed(1)}%
                        </span>
                      </div>
                      
                      {/* Margen Neto */}
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] text-[#9FB3A8] font-['Inter']">Margen neto</span>
                        <span className="text-[16px] text-[#9FB3A8] font-['Inter'] font-medium">
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* Pricing Section */}
            <div className="space-y-3">
              {/* Precio de venta al público */}
              <div>
                <Label htmlFor="dishPrice" className="text-[#4D6B59] mb-2 font-['Inter'] text-[14px] font-medium">
                  Precio de venta al público
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9FB3A8] font-['Inter'] text-[16px]">
                    {getCurrencySymbol(accountCurrency)}
                  </span>
                  <Input
                    id="dishPrice"
                    type="number"
                    step="0.01"
                    value={dishPrice}
                    onChange={(e) => setDishPrice(e.target.value)}
                    onFocus={handleFocusSelectZero}
                    placeholder="0.00"
                    className="rounded-[16px] border-[#CFE0D8] pl-10 h-[52px] font-['Inter'] text-[16px]"
                  />
                </div>
              </div>

              {/* Impuestos */}
              <div>
                <Label htmlFor="dishTaxPercentage" className="text-[#4D6B59] mb-2 font-['Inter'] text-[14px] font-medium">
                  Impuestos (%)
                </Label>
                <div className="relative">
                  <Input
                    id="dishTaxPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    onFocus={handleFocusSelectZero}
                    placeholder="0.00"
                    className="rounded-[16px] border-[#CFE0D8] h-[52px] font-['Inter'] text-[16px] pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9FB3A8] font-['Inter'] text-[16px]">
                    %
                  </span>
                </div>
              </div>

              {/* Precio de venta neto (calculado) */}
              {(() => {
                const publicPrice = parseFloat(dishPrice) || 0;
                const taxPercent = parseFloat(taxPercentage) || 0;
                const taxAmount = publicPrice * (taxPercent / 100);
                const netPrice = publicPrice - taxAmount;

                return publicPrice > 0 ? (
                  <div className="bg-[#2F3A33] rounded-[16px] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] text-white/70 font-['Inter'] font-medium">
                        PRECIO DE VENTA NETO
                      </span>
                      <span className="text-[24px] font-semibold font-['Poppins'] text-white">
                        {getCurrencySymbol(accountCurrency)}{netPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[12px] text-white/50 font-['Inter'] mt-1">
                      Este precio se usa para calcular la rentabilidad
                    </p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDishDialog(false);
                  setDishName('');
                  setDishPrice('');
                  setEditingDish(null); // Clear editing mode
                  setIngredients([{ 
                    name: '', 
                    quantity: '', 
                    unit: 'kg', 
                    price: '', 
                    wastePercentage: '0',
                    isExisting: false,
                    isEditing: false,
                    purchaseUnit: 'kg',
                    pricePerPurchaseUnit: '',
                    dishUnit: 'gr',
                    quantityInDish: '',
                    ingredientWastage: '0',
                  }]);
                }}
                className="flex-1 rounded-[16px] h-[48px] border border-[#CFE0D8] font-['Inter'] font-medium"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveDish}
                disabled={dishCreateStatus === 'saving'}
                className="flex-1 rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] hover:opacity-90 text-white h-[52px] font-['Inter'] font-medium shadow-[0_4px_12px_rgba(16,24,40,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dishCreateStatus === 'saving' 
                  ? (editingDish ? 'Actualizando…' : 'Guardando…')
                  : (editingDish ? 'Actualizar plato' : 'Guardar plato')}
              </Button>
            </div>
            
            {/* Status Line */}
            <p className="text-xs text-[#9FB3A8] text-center mt-2 font-['Inter']" data-testid="dish-status-line">
              {dishCreateStatus === 'idle' && (editingDish ? 'Listo para actualizar' : 'Listo para crear')}
              {dishCreateStatus === 'saving' && (editingDish ? 'Actualizando…' : 'Guardando…')}
              {dishCreateStatus === 'error' && lastErrorCode && `Error: ${lastErrorCode}`}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Settings Sheet */}
      <Sheet open={showAccountSettings} onOpenChange={setShowAccountSettings}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-[24px] bg-white border-t border-[#CFE0D8] shadow-[0_-4px_12px_rgba(16,24,40,0.08)] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#CFE0D8]">
              <SheetTitle className="text-[22px] leading-[30px] tracking-[-0.44px] font-semibold font-['Poppins'] text-[#1A1A1A]">
                Gestionar cuenta
              </SheetTitle>
              <SheetDescription className="text-[16px] leading-[24px] font-normal font-['Inter'] text-[#4D6B59] mt-1">
                Configura tu información y preferencias
              </SheetDescription>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                {/* User Info Section */}
                <div className="bg-white rounded-[16px] p-6 border border-[#CFE0D8] shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <h3 className="text-[18px] leading-[26px] tracking-[-0.36px] font-semibold font-['Poppins'] text-[#1A1A1A] mb-4">
                    Información personal
                  </h3>
                  
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="accountName" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
                      Nombre
                    </Label>
                    <Input
                      id="accountName"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Tu nombre"
                      className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all"
                    />
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white rounded-[16px] p-6 border border-[#CFE0D8] shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <h3 className="text-[18px] leading-[26px] tracking-[-0.36px] font-semibold font-['Poppins'] text-[#1A1A1A] mb-4">
                    Preferencias
                  </h3>
                  
                  {/* Currency */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="accountCurrency" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
                      Moneda
                    </Label>
                    <Select value={accountCurrency} onValueChange={setAccountCurrency}>
                      <SelectTrigger 
                        id="accountCurrency" 
                        className="h-[48px] rounded-[16px] border-[#CFE0D8] bg-white focus:border-[#7BB97A] focus:ring-2 focus:ring-[#7BB97A]/25 font-['Inter'] text-[16px] leading-[24px]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-[16px]">
                        {currencyOptions.map((curr) => (
                          <SelectItem 
                            key={curr.value} 
                            value={curr.value}
                            className="font-['Inter'] text-[16px] leading-[24px]"
                          >
                            {curr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tax Percentage */}
                  <div className="space-y-2">
                    <Label htmlFor="taxPercentage" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
                      Impuestos (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="taxPercentage"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(e.target.value)}
                        onFocus={handleFocusSelectZero}
                        placeholder="0.00"
                        className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9FB3A8] font-['Inter'] text-[16px] leading-[24px]">
                        %
                      </span>
                    </div>
                    <p className="text-[14px] leading-[20px] text-[#9FB3A8] font-['Inter'] font-normal mt-1">
                      Se aplicará automáticamente a todos los platos
                    </p>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-[#F5FAF7] rounded-[16px] p-6 border border-[#CFE0D8]">
                  <h3 className="text-[18px] leading-[26px] tracking-[-0.36px] font-semibold font-['Poppins'] text-[#1A1A1A] mb-4">
                    Seguridad
                  </h3>
                  
                  {/* Password Change */}
                  <div className="space-y-2">
                    <Label className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
                      Cambiar contraseña
                    </Label>
                    <Button
                      onClick={() => setShowPasswordChange(true)}
                      variant="outline"
                      className="w-full h-[48px] rounded-[16px] border border-[#CFE0D8] bg-white text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] font-medium hover:bg-[#F5FAF7] transition-all duration-200"
                    >
                      Cambiar contraseña
                    </Button>
                    <p className="text-[14px] leading-[20px] text-[#4D6B59] font-['Inter'] font-normal mt-1">
                      Actualiza tu contraseña de acceso
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-6 bg-white border-t border-[#CFE0D8] space-y-3">
              {/* Save Button */}
              <Button
                onClick={handleSaveAccountSettings}
                className="w-full h-[52px] rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] hover:opacity-90 text-white shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-all duration-200 font-['Inter'] text-[16px] leading-[24px] font-medium"
              >
                Guardar cambios
              </Button>

              {/* Logout Button */}
              <Button
                onClick={handleCloseApp}
                variant="outline"
                className="w-full h-[48px] rounded-[16px] border-2 border-[#DC2626]/20 text-[#DC2626] hover:bg-red-50 hover:border-[#DC2626]/30 font-['Inter'] text-[16px] leading-[24px] font-medium transition-all duration-200"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Dish Confirmation */}
      <AlertDialog open={!!dishToDelete} onOpenChange={() => setDishToDelete(null)}>
        <AlertDialogContent className="max-w-[380px] rounded-[24px] bg-white border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-['Poppins'] text-[20px] font-semibold">¿Eliminar plato?</AlertDialogTitle>
            <AlertDialogDescription className="font-['Inter'] text-[16px] text-[#4D6B59]">
              El plato "{dishToDelete?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[16px] h-[48px] font-['Inter'] font-medium">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDish}
              className="rounded-[16px] bg-[#DC2626] hover:bg-[#B91C1C] h-[48px] font-['Inter'] font-medium"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent className="max-w-[380px] rounded-[24px] bg-white border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-['Poppins'] text-[20px] font-semibold">¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription className="font-['Inter'] text-[16px] text-[#4D6B59]">
              La categoría "{categoryToDelete?.label}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[16px] h-[48px] font-['Inter'] font-medium">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="rounded-[16px] bg-[#DC2626] hover:bg-[#B91C1C] h-[48px] font-['Inter'] font-medium"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Confirmation */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-[380px] rounded-[24px] bg-white border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-['Poppins'] text-[20px] font-semibold">¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription className="font-['Inter'] text-[16px] text-[#4D6B59]">
              ¿Estás seguro que quieres cerrar sesión?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[16px] h-[48px] font-['Inter'] font-medium">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="rounded-[16px] bg-[#DC2626] hover:bg-[#B91C1C] h-[48px] font-['Inter'] font-medium"
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent className="max-w-[420px] max-h-[90vh] rounded-[24px] bg-white border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)] p-0 gap-0" aria-describedby="add-category-description">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-center text-[#1A1A1A] font-['Poppins'] text-[22px] leading-[30px] tracking-[-0.44px] font-semibold">
                Nueva categoría
              </DialogTitle>
              <DialogDescription id="add-category-description" className="text-center text-[#4D6B59] font-['Inter'] text-[16px]">
                Crea una categoría personalizada para organizar tu menú
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <ScrollArea className="max-h-[calc(90vh-200px)] px-6">
            <div className="space-y-5 pb-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-[#4D6B59] font-['Inter'] text-[14px] font-medium">
                Nombre de la categoría
              </Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej. Especialidades, Guarniciones..."
                className="h-[48px] rounded-[16px] border-[#CFE0D8] bg-white focus:border-[#7BB97A] focus:ring-2 focus:ring-[#7BB97A]/25 font-['Inter'] text-[16px]"
              />
            </div>

            {/* Emoji Picker */}
            <div className="space-y-2">
              <Label htmlFor="categoryEmoji" className="text-[#4D6B59] font-['Inter'] text-[14px] font-medium">
                Emoji
              </Label>
              <div className="flex gap-2 flex-wrap">
                {['🍽️', '🍕', '🍔', '🍟', '🌮', '🌯', '🥗', '🍜', '🍝', '🍱', '🥘', '🍛', '🍲', '🥙', '🧆', '🥪', '🍳', '🥞', '🧇', '👨‍🍳', '🍰', '🧁', '🍮', '🍨', '🍩', '🎂', '🍪', '🍷', '🍾', '🍺', '🍻', '☕', '🥤', '🧃', '🧋'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCategoryEmoji(emoji)}
                    className={`text-[28px] w-[52px] h-[52px] rounded-[16px] transition-all flex items-center justify-center ${
                      newCategoryEmoji === emoji 
                        ? 'bg-[#7BB97A] shadow-[0_4px_12px_rgba(16,24,40,0.08)] scale-110' 
                        : 'bg-white border border-[#CFE0D8] hover:bg-[#F5FAF7]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-[14px] text-[#9FB3A8] font-['Inter']">
                Selecciona un emoji que represente esta categoría
              </p>
            </div>

            {/* Objetivo de Rentabilidad */}
            <div className="space-y-2">
              <Label className="text-[#4D6B59] font-['Inter'] text-[14px] font-medium">
                Objetivo de Rentabilidad (Opcional)
              </Label>
              <p className="text-[12px] text-[#9FB3A8] font-['Inter']">
                Define el objetivo ideal para esta categoría. La suma debe ser 100%.
              </p>
              
              {/* Toggle: Costo vs Margen */}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setNewCategoryTargetType('cost')}
                  className={`flex-1 h-[48px] px-4 rounded-[16px] font-['Inter'] text-[14px] leading-tight font-medium transition-all flex items-center justify-center ${
                    newCategoryTargetType === 'cost'
                      ? 'bg-[#7BB97A] text-white shadow-[0_2px_8px_rgba(123,185,122,0.25)]'
                      : 'bg-white border border-[#CFE0D8] text-[#4D6B59] hover:bg-[#F5FAF7]'
                  }`}
                >
                  Costo MP %
                </button>
                <button
                  type="button"
                  onClick={() => setNewCategoryTargetType('margin')}
                  className={`flex-1 h-[48px] px-4 rounded-[16px] font-['Inter'] text-[14px] leading-tight font-medium transition-all flex items-center justify-center ${
                    newCategoryTargetType === 'margin'
                      ? 'bg-[#7BB97A] text-white shadow-[0_2px_8px_rgba(123,185,122,0.25)]'
                      : 'bg-white border border-[#CFE0D8] text-[#4D6B59] hover:bg-[#F5FAF7]'
                  }`}
                >
                  Margen Bruto %
                </button>
              </div>
              
              {/* Input de porcentaje */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={newCategoryTargetValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (val >= 0 && val <= 100) {
                      setNewCategoryTargetValue(e.target.value);
                    }
                  }}
                  className="h-[48px] rounded-[16px] border-[#CFE0D8] bg-white focus:border-[#7BB97A] focus:ring-2 focus:ring-[#7BB97A]/25 font-['Inter'] text-[16px]"
                  placeholder="30"
                />
                <span className="text-[#4D6B59] font-['Inter'] text-[16px] font-medium">%</span>
              </div>
              
              {/* Preview del otro valor (suma a 100%) */}
              <div className="bg-white rounded-[12px] border border-[#CFE0D8] p-3">
                <p className="text-[12px] text-[#9FB3A8] font-['Inter'] mb-1">
                  Distribución automática:
                </p>
                <div className="flex justify-between text-[14px] font-['Inter']">
                  <span className="text-[#4D6B59]">
                    Costo MP: <span className="font-semibold text-[#1A1A1A]">
                      {newCategoryTargetType === 'cost' 
                        ? newCategoryTargetValue 
                        : (100 - parseFloat(newCategoryTargetValue || '0')).toFixed(0)
                      }%
                    </span>
                  </span>
                  <span className="text-[#4D6B59]">
                    Margen Bruto: <span className="font-semibold text-[#7BB97A]">
                      {newCategoryTargetType === 'margin' 
                        ? newCategoryTargetValue 
                        : (100 - parseFloat(newCategoryTargetValue || '0')).toFixed(0)
                      }%
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-[#F5FAF7] rounded-[16px] p-4 border border-[#CFE0D8]">
              <p className="text-[14px] text-[#4D6B59] mb-2 font-['Inter'] font-medium">
                Vista previa:
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[32px]">{newCategoryEmoji}</span>
                <span className="text-[#1A1A1A] font-['Inter'] text-[16px] font-medium">
                  {newCategoryName || 'Nombre de categoría'}
                </span>
              </div>
            </div>

            </div>
          </ScrollArea>
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#CFE0D8] bg-white rounded-b-[24px]">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddCategoryDialog(false);
                setNewCategoryName('');
                setNewCategoryEmoji('🍽️');
                setNewCategoryTargetType('cost');
                setNewCategoryTargetValue('30');
              }}
              className="flex-1 h-[48px] rounded-[16px] border border-[#CFE0D8] text-[#2F3A33] hover:bg-[#F5FAF7] font-['Inter'] text-[16px] font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCategory}
              className="flex-1 h-[52px] rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] hover:opacity-90 text-white shadow-[0_4px_12px_rgba(16,24,40,0.08)] font-['Inter'] text-[16px] font-medium transition-all duration-200"
            >
              Crear categoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
        <DialogContent className="max-w-[420px] max-h-[90vh] rounded-[24px] bg-white border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)] p-0 gap-0" aria-describedby="edit-category-description">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-center text-[#1A1A1A] font-['Poppins'] text-[22px] leading-[30px] tracking-[-0.44px] font-semibold">
                Editar categoría
              </DialogTitle>
              <DialogDescription id="edit-category-description" className="text-center text-[#4D6B59] font-['Inter'] text-[16px]">
                Modifica el nombre, emoji y objetivos de rentabilidad
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <ScrollArea className="max-h-[calc(90vh-200px)] px-6">
            <div className="space-y-5 pb-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="editCategoryName" className="text-[#4D6B59] font-['Inter'] text-[14px] font-medium">
                Nombre de la categoría
              </Label>
              <Input
                id="editCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej. Especialidades, Guarniciones..."
                className="h-[48px] rounded-[16px] border-[#CFE0D8] bg-white focus:border-[#7BB97A] focus:ring-2 focus:ring-[#7BB97A]/25 font-['Inter'] text-[16px]"
              />
            </div>

            {/* Emoji Picker */}
            <div className="space-y-2">
              <Label htmlFor="editCategoryEmoji" className="text-[#4D6B59] font-['Inter'] text-[14px] font-medium">
                Emoji
              </Label>
              <div className="flex gap-2 flex-wrap">
                {['🍽️', '🍕', '🍔', '🍟', '🌮', '🌯', '🥗', '🍜', '🍝', '🍱', '🥘', '🍛', '🍲', '🥙', '🧆', '🥪', '🍳', '🥞', '🧇'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewCategoryEmoji(emoji)}
                    className={`text-[28px] w-[52px] h-[52px] rounded-[16px] transition-all flex items-center justify-center ${
                      newCategoryEmoji === emoji 
                        ? 'bg-[#7BB97A] shadow-[0_4px_12px_rgba(16,24,40,0.08)] scale-110' 
                        : 'bg-white border border-[#CFE0D8] hover:bg-[#F5FAF7]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-[14px] text-[#9FB3A8] font-['Inter']">
                Selecciona un emoji que represente esta categoría
              </p>
            </div>

            {/* Objetivo de Rentabilidad */}
            <div className="space-y-2">
              <Label className="text-[#4D6B59] font-['Inter'] text-[14px] font-medium">
                Objetivo de Rentabilidad (Opcional)
              </Label>
              <p className="text-[12px] text-[#9FB3A8] font-['Inter']">
                Define el objetivo ideal para esta categoría. La suma debe ser 100%.
              </p>
              
              {/* Toggle: Costo vs Margen */}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setNewCategoryTargetType('cost')}
                  className={`flex-1 h-[48px] px-4 rounded-[16px] font-['Inter'] text-[14px] leading-tight font-medium transition-all flex items-center justify-center ${
                    newCategoryTargetType === 'cost'
                      ? 'bg-[#7BB97A] text-white shadow-[0_2px_8px_rgba(123,185,122,0.25)]'
                      : 'bg-white border border-[#CFE0D8] text-[#4D6B59] hover:bg-[#F5FAF7]'
                  }`}
                >
                  Costo MP %
                </button>
                <button
                  type="button"
                  onClick={() => setNewCategoryTargetType('margin')}
                  className={`flex-1 h-[48px] px-4 rounded-[16px] font-['Inter'] text-[14px] leading-tight font-medium transition-all flex items-center justify-center ${
                    newCategoryTargetType === 'margin'
                      ? 'bg-[#7BB97A] text-white shadow-[0_2px_8px_rgba(123,185,122,0.25)]'
                      : 'bg-white border border-[#CFE0D8] text-[#4D6B59] hover:bg-[#F5FAF7]'
                  }`}
                >
                  Margen Bruto %
                </button>
              </div>
              
              {/* Input de porcentaje */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={newCategoryTargetValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (val >= 0 && val <= 100) {
                      setNewCategoryTargetValue(e.target.value);
                    }
                  }}
                  className="h-[48px] rounded-[16px] border-[#CFE0D8] bg-white focus:border-[#7BB97A] focus:ring-2 focus:ring-[#7BB97A]/25 font-['Inter'] text-[16px]"
                  placeholder="30"
                />
                <span className="text-[#4D6B59] font-['Inter'] text-[16px] font-medium">%</span>
              </div>
              
              {/* Preview del otro valor (suma a 100%) */}
              <div className="bg-white rounded-[12px] border border-[#CFE0D8] p-3">
                <p className="text-[12px] text-[#9FB3A8] font-['Inter'] mb-1">
                  Distribución automática:
                </p>
                <div className="flex justify-between text-[14px] font-['Inter']">
                  <span className="text-[#4D6B59]">
                    Costo MP: <span className="font-semibold text-[#1A1A1A]">
                      {newCategoryTargetType === 'cost' 
                        ? newCategoryTargetValue 
                        : (100 - parseFloat(newCategoryTargetValue || '0')).toFixed(0)
                      }%
                    </span>
                  </span>
                  <span className="text-[#4D6B59]">
                    Margen Bruto: <span className="font-semibold text-[#7BB97A]">
                      {newCategoryTargetType === 'margin' 
                        ? newCategoryTargetValue 
                        : (100 - parseFloat(newCategoryTargetValue || '0')).toFixed(0)
                      }%
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-[#F5FAF7] rounded-[16px] p-4 border border-[#CFE0D8]">
              <p className="text-[14px] text-[#4D6B59] mb-2 font-['Inter'] font-medium">
                Vista previa:
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[32px]">{newCategoryEmoji}</span>
                <span className="text-[#1A1A1A] font-['Inter'] text-[16px] font-medium">
                  {newCategoryName || 'Nombre de categoría'}
                </span>
              </div>
            </div>

            </div>
          </ScrollArea>
          
          {/* Action Buttons - Fixed at bottom */}
          <div className="flex gap-3 px-6 py-4 border-t border-[#CFE0D8] bg-white rounded-b-[24px]">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditCategoryDialog(false);
                setEditingCategory(null);
                setNewCategoryName('');
                setNewCategoryEmoji('🍽️');
                setNewCategoryTargetType('cost');
                setNewCategoryTargetValue('30');
              }}
              className="flex-1 h-[48px] rounded-[16px] border border-[#CFE0D8] text-[#2F3A33] hover:bg-[#F5FAF7] font-['Inter'] text-[16px] font-medium"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateCategory}
              className="flex-1 h-[52px] rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] hover:opacity-90 text-white shadow-[0_4px_12px_rgba(16,24,40,0.08)] font-['Inter'] text-[16px] font-medium transition-all duration-200"
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dish Detail Sheet */}
      <DishDetailSheet
        dish={selectedDishForDetail}
        open={dishDetailOpen}
        onClose={() => setDishDetailOpen(false)}
        onEdit={() => {
          if (!selectedDishId) return;
          
          safeLog('[DishEdit] Opening edit mode for dish', { id: selectedDishId });
          setDishDetailOpen(false);
          
          // Find the dish to edit
          const dishToEdit = dishesFromSupabase.find((d: any) => d.id === selectedDishId);
          if (dishToEdit) {
            safeLog('[DishEdit] Found dish to edit', { 
              id: dishToEdit.id, 
              name: dishToEdit.name,
              ingredientsCount: dishToEdit.dish_ingredients?.length || 0
            });
            
            // Set editing mode
            setEditingDish(dishToEdit);
            
            // Pre-fill form fields
            setDishName(dishToEdit.name || '');
            setDishPrice((dishToEdit.price || 0).toString());
            setSelectedCategory(dishToEdit.category_id || '');
            
            // Load ingredients from dish_ingredients
            const dishIngredients = (dishToEdit.dish_ingredients || []).map((di: any) => ({
              name: di.inventory_item?.name || '',
              inventoryItemId: di.inventory_item_id,
              isExisting: true,
              isEditing: false,
              purchaseUnit: di.unit || 'kg',
              pricePerPurchaseUnit: (di.inventory_item?.price_per_unit || 0).toString(),
              dishUnit: di.unit || 'kg',
              quantityInDish: (di.quantity || 0).toString(),
              ingredientWastage: (di.waste_percentage || 0).toString(),
              // Legacy fields
              quantity: (di.quantity || 0).toString(),
              unit: di.unit || 'kg',
              price: (di.inventory_item?.price_per_unit || 0).toString(),
              wastePercentage: (di.waste_percentage || 0).toString(),
            }));
            
            setIngredients(dishIngredients.length > 0 ? dishIngredients : [{
              name: '',
              quantity: '',
              unit: 'kg',
              price: '',
              wastePercentage: '0',
              isExisting: false,
              isEditing: false,
              purchaseUnit: 'kg',
              pricePerPurchaseUnit: '',
              dishUnit: 'gr',
              quantityInDish: '',
              ingredientWastage: '0',
            }]);
            
            // Open the add dish dialog
            setShowAddDishDialog(true);
            
            toast.success('Editando plato');
          } else {
            toast.error('No se encontró el plato');
          }
        }}
        onUpdate={() => {
          // Refetch dishes to get updated preparation and allergens
          refetchDishes();
        }}
        currencySymbol={getCurrencySymbol(accountCurrency)}
        taxPercentage={parseFloat(taxPercentage) || 0}
      />

      {/* Password Change Sheet */}
      <Sheet open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <SheetContent 
          side="bottom"
          className="h-[90vh] rounded-t-[24px] bg-white border-t border-[#CFE0D8] shadow-[0_-4px_12px_rgba(16,24,40,0.08)] p-0"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#CFE0D8]">
              <SheetTitle className="text-[22px] leading-[30px] tracking-[-0.44px] font-semibold font-['Poppins'] text-[#1A1A1A]">
                Cambiar contraseña
              </SheetTitle>
              <SheetDescription className="text-[16px] leading-[24px] font-normal font-['Inter'] text-[#4D6B59] mt-1">
                Actualiza tu contraseña de acceso a CostoComida
              </SheetDescription>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <Label htmlFor="currentPassword" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
                    Contraseña actual
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña actual"
                      className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB3A8] hover:text-[#4D6B59] transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <Label htmlFor="newPassword" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
                    Nueva contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB3A8] hover:text-[#4D6B59] transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {newPassword && newPassword.length < 6 && (
                    <p className="text-[14px] leading-[20px] text-[#DC2626] font-['Inter'] mt-1">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
                    Confirmar nueva contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB3A8] hover:text-[#4D6B59] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[14px] leading-[20px] text-[#DC2626] font-['Inter'] mt-1">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                {/* Security Tips */}
                <div className="bg-[#F5FAF7] rounded-[16px] p-4 border border-[#CFE0D8] mt-6">
                  <h4 className="text-[14px] leading-[20px] font-['Poppins'] text-[#1A1A1A] mb-2 font-semibold">
                    Consejos de seguridad
                  </h4>
                  <ul className="space-y-1.5 text-[14px] leading-[20px] text-[#4D6B59] font-['Inter'] font-normal">
                    <li className="flex items-start gap-2">
                      <span className="text-[#7BB97A] mt-0.5">✓</span>
                      <span>Usa al menos 6 caracteres</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7BB97A] mt-0.5">✓</span>
                      <span>Combina letras, números y símbolos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#7BB97A] mt-0.5">✓</span>
                      <span>No reutilices contraseñas de otras cuentas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-6 bg-white border-t border-[#CFE0D8] space-y-3">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full h-[52px] rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] hover:opacity-90 text-white shadow-[0_4px_12px_rgba(16,24,40,0.08)] transition-all duration-200 font-['Inter'] text-[16px] leading-[24px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordChange(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                disabled={isChangingPassword}
                className="w-full h-[48px] rounded-[16px] border border-[#CFE0D8] text-[#2F3A33] hover:bg-[#F5FAF7] font-['Inter'] text-[16px] leading-[24px] font-medium transition-all duration-200"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
