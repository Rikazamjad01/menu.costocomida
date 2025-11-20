import { useState, useEffect } from 'react';
import { Edit2, X, ChefHat, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { updateDish } from '../lib/supabase-helpers';
import { toast } from 'sonner@2.0.3';

interface DishDetailSheetProps {
  dish: {
    id: string;
    name: string;
    price: number;
    preparation?: string;
    allergens?: string[];
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
      price: string;
      wastePercentage: string;
    }>;
  } | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onUpdate?: () => void;
  currencySymbol: string;
  taxPercentage: number;
}

// Helper function to handle onOpenChange
function handleOpenChange(open: boolean, onClose: () => void) {
  if (!open) {
    onClose();
  }
}

// Lista de alérgenos comunes
const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten', emoji: '🌾' },
  { id: 'pescado', label: 'Pescado', emoji: '🐟' },
  { id: 'lacteos', label: 'Lácteos', emoji: '🥛' },
  { id: 'huevo', label: 'Huevo', emoji: '🥚' },
  { id: 'frutos-secos', label: 'Frutos Secos', emoji: '🥜' },
  { id: 'soja', label: 'Soja', emoji: '🫘' },
  { id: 'mariscos', label: 'Mariscos', emoji: '🦐' },
  { id: 'sulfitos', label: 'Sulfitos', emoji: '🍷' },
];

export function DishDetailSheet({
  dish,
  open,
  onClose,
  onEdit,
  onUpdate,
  currencySymbol,
  taxPercentage
}: DishDetailSheetProps) {
  // Estado local para preparación y alérgenos
  const [preparation, setPreparation] = useState(dish?.preparation || '');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(dish?.allergens || []);
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar con el dish cuando cambie
  useEffect(() => {
    if (dish) {
      setPreparation(dish.preparation || '');
      setSelectedAllergens(dish.allergens || []);
    }
  }, [dish?.id, dish?.preparation, dish?.allergens]);

  // Si no hay dish, no mostrar el sheet
  if (!dish) return null;

  // Toggle allergen selection
  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId);
      } else {
        return [...prev, allergenId];
      }
    });
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!dish.id) return;
    
    setIsSaving(true);
    try {
      await updateDish(dish.id, {
        preparation: preparation.trim() || undefined,
        allergens: selectedAllergens.length > 0 ? selectedAllergens : []
      });
      
      toast.success('Información guardada correctamente');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving dish info:', error);
      toast.error('Error al guardar la información');
    } finally {
      setIsSaving(false);
    }
  };

  // Verificar si hay cambios
  const hasChanges = 
    preparation !== (dish.preparation || '') || 
    JSON.stringify(selectedAllergens.sort()) !== JSON.stringify((dish.allergens || []).sort());

  // 🐛 Debug: Log taxPercentage
  console.log('🔍 [DishDetailSheet] Tax Debug:', {
    taxPercentage,
    type: typeof taxPercentage,
    isZero: taxPercentage === 0,
    dishName: dish.name
  });

  // Calcular costo de cada ingrediente
  const ingredientsWithCost = dish.ingredients.map(ing => {
    const quantity = parseFloat(ing.quantity) || 0;
    const price = parseFloat(ing.price) || 0;
    const waste = parseFloat(ing.wastePercentage) || 0;
    
    const baseCost = quantity * price;
    const wasteAmount = baseCost * (waste / 100);
    const totalCost = baseCost + wasteAmount;
    
    return {
      ...ing,
      baseCost,
      wasteAmount,
      cost: totalCost
    };
  });

  // Calcular totales
  const totalCost = ingredientsWithCost.reduce((sum, ing) => sum + ing.cost, 0);
  const salePrice = dish.price || 0;
  const taxAmount = salePrice * (taxPercentage / 100);
  const netSalePrice = salePrice - taxAmount;
  const netProfit = netSalePrice - totalCost;
  const costPercentage = netSalePrice > 0 ? (totalCost / netSalePrice) * 100 : 0;
  const profitPercentage = 100 - costPercentage;

  // Datos para el gráfico de pie
  const chartData = [
    { name: 'Beneficio Neto', value: profitPercentage, color: '#7BB97A' },
    { name: 'Costo Total', value: costPercentage, color: '#F59E0B' }
  ];

  // Custom label para el pie chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.value.toFixed(1)}%`;
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => handleOpenChange(isOpen, onClose)}>
      <SheetContent 
        side="bottom"
        className="h-[90vh] rounded-t-[24px] bg-white border-0 p-0 gap-0"
      >
        {/* Accessibility elements - required by Radix UI */}
        <SheetTitle className="sr-only">
          Detalles del plato: {dish.name}
        </SheetTitle>
        <SheetDescription className="sr-only">
          Información completa del plato incluyendo precios, costos, márgenes de beneficio y lista detallada de ingredientes con sus cantidades y costos.
        </SheetDescription>
        
        <div className="h-full flex flex-col">
          {/* Header - Dark background with dish name */}
          <div className="pl-5 pr-14 py-4 bg-[#2F3A33] flex items-center justify-between shrink-0">
            <h2 className="text-[22px] leading-[30px] tracking-[-0.44px] font-semibold font-['Poppins'] text-white flex-1 pr-4" aria-hidden="true">
              {dish.name}
            </h2>
            <Button
              onClick={onEdit}
              className="h-[40px] px-4 rounded-[12px] bg-white text-[#2F3A33] font-medium font-['Inter'] text-[14px] hover:bg-[#F5FAF7] border-0 shadow-none shrink-0"
            >
              <Edit2 size={16} className="mr-1.5" />
              Editar
            </Button>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5 pb-20">
              {/* MAIN METRICS - Costo Total y Beneficio Neto */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-[16px] border-2 border-[#F59E0B] p-5">
                  <div className="text-[12px] leading-[16px] text-[#F59E0B] font-['Inter'] font-semibold mb-2 uppercase tracking-wide">
                    💰 Costo Total
                  </div>
                  <div className="text-[32px] leading-[40px] tracking-[-0.64px] font-bold font-['Poppins'] text-[#1A1A1A]">
                    {currencySymbol}{totalCost.toFixed(2)}
                  </div>
                  <div className="text-[14px] leading-[20px] text-[#F59E0B] font-['Inter'] font-medium mt-2">
                    {costPercentage.toFixed(1)}% del precio neto
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-[#A6D49F] to-[#7BB97A] rounded-[16px] p-5 shadow-[0_4px_12px_rgba(123,185,122,0.25)]">
                  <div className="text-[12px] leading-[16px] text-white/90 font-['Inter'] font-semibold mb-2 uppercase tracking-wide">
                    📈 Margen Bruto
                  </div>
                  <div className="text-[32px] leading-[40px] tracking-[-0.64px] font-bold font-['Poppins'] text-white">
                    {currencySymbol}{netProfit.toFixed(2)}
                  </div>
                  <div className="text-[14px] leading-[20px] text-white font-['Inter'] font-medium mt-2">
                    {profitPercentage.toFixed(1)}% margen
                  </div>
                </div>
              </div>

              {/* Compact Pricing Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#2F3A33] rounded-[16px] p-4">
                  <div className="text-[10px] leading-[14px] text-white/60 font-['Inter'] font-medium mb-1 uppercase tracking-wide">
                    Precio Público
                  </div>
                  <div className="text-[20px] leading-[28px] tracking-[-0.4px] font-semibold font-['Poppins'] text-white">
                    {currencySymbol}{salePrice.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-[#2F3A33] rounded-[16px] p-4">
                  <div className="text-[10px] leading-[14px] text-white/60 font-['Inter'] font-medium mb-1 uppercase tracking-wide">
                    Impuestos ({(taxPercentage || 0).toFixed(1)}%)
                  </div>
                  <div className="text-[20px] leading-[28px] tracking-[-0.4px] font-semibold font-['Poppins'] text-white">
                    {currencySymbol}{taxAmount.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] rounded-[16px] p-4">
                  <div className="text-[10px] leading-[14px] text-white/80 font-['Inter'] font-medium mb-1 uppercase tracking-wide">
                    Precio Neto
                  </div>
                  <div className="text-[20px] leading-[28px] tracking-[-0.4px] font-semibold font-['Poppins'] text-white">
                    {currencySymbol}{netSalePrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Visual Ingredients Breakdown */}
              <div className="bg-white rounded-[16px] border border-[#CFE0D8] overflow-hidden">
                <div className="bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] px-4 py-3">
                  <h3 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-white">
                    Desglose de Ingredientes
                  </h3>
                  <p className="text-[12px] leading-[16px] text-white/80 font-['Inter'] mt-0.5">
                    {ingredientsWithCost.length} ingredientes • {currencySymbol}{totalCost.toFixed(2)} total
                  </p>
                </div>
                
                <div className="p-4 space-y-3">
                  {ingredientsWithCost.map((ing, index) => {
                    const percentage = totalCost > 0 ? (ing.cost / totalCost) * 100 : 0;
                    const barColor = percentage >= 30 ? '#DC2626' : percentage >= 15 ? '#F59E0B' : '#7BB97A';
                    
                    // Convertir cantidades pequeñas a unidades más legibles
                    const getReadableQuantity = (quantity: string, unit: string): { value: string; unit: string } => {
                      const qty = parseFloat(quantity);
                      const unitLower = unit.toLowerCase();
                      
                      // kg -> gr si cantidad < 1
                      if (unitLower === 'kg' && qty < 1 && qty > 0) {
                        return {
                          value: (qty * 1000).toFixed(0),
                          unit: 'gr'
                        };
                      }
                      
                      // lt -> ml si cantidad < 1
                      if ((unitLower === 'lt' || unitLower === 'l') && qty < 1 && qty > 0) {
                        return {
                          value: (qty * 1000).toFixed(0),
                          unit: 'ml'
                        };
                      }
                      
                      // Para cantidades >= 1 o unidades ya pequeñas, mostrar con decimales si es necesario
                      if (qty < 1 && qty > 0) {
                        return { value: qty.toFixed(2), unit };
                      }
                      
                      return { value: qty.toFixed(0), unit };
                    };
                    
                    // Obtener precio por unidad legible
                    const getPricePerUnit = (price: string, unit: string): { value: string; unit: string } => {
                      const priceNum = parseFloat(price);
                      const unitLower = unit.toLowerCase();
                      
                      // Si el precio es por kg/lt pero vamos a mostrar gr/ml, mantener el precio en la unidad original
                      // para que tenga sentido (ej: $4000/lt es más claro que $4/ml)
                      return { value: priceNum.toFixed(2), unit };
                    };
                    
                    const readableQty = getReadableQuantity(ing.quantity, ing.unit);
                    const priceInfo = getPricePerUnit(ing.price, ing.unit);
                    
                    return (
                      <div key={index} className="bg-[#F5FAF7] rounded-[12px] p-3">
                        {/* Ingredient Header */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="text-[14px] leading-[20px] font-medium font-['Inter'] text-[#1A1A1A]">
                              {ing.name}
                            </h4>
                            <p className="text-[12px] leading-[16px] text-[#4D6B59] font-['Inter'] mt-0.5">
                              {readableQty.value} {readableQty.unit} × {currencySymbol}{priceInfo.value}/{priceInfo.unit}
                              {parseFloat(ing.wastePercentage || '0') > 0 && (
                                <span className="text-[#F59E0B] ml-1">
                                  • {parseFloat(ing.wastePercentage).toFixed(0)}% merma
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-[18px] leading-[26px] font-semibold font-['Poppins'] text-[#1A1A1A]">
                              {currencySymbol}{ing.cost.toFixed(2)}
                            </div>
                            <div className="text-[12px] leading-[16px] text-[#4D6B59] font-['Inter']">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Visual Cost Bar */}
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.max(percentage, 2)}%`,
                              backgroundColor: barColor
                            }}
                          />
                        </div>
                        
                        {/* Cost Breakdown Detail */}
                        {parseFloat(ing.wastePercentage || '0') > 0 && (
                          <div className="mt-2 pt-2 border-t border-[#CFE0D8] flex justify-between text-[11px] leading-[16px] font-['Inter'] text-[#9FB3A8]">
                            <span>Costo base: {currencySymbol}{ing.baseCost.toFixed(2)}</span>
                            <span>+ Merma: {currencySymbol}{ing.wasteAmount.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pie Chart - Compact */}
              <div className="bg-white rounded-[16px] border border-[#CFE0D8] p-4">
                <h4 className="text-[14px] leading-[20px] font-semibold font-['Inter'] text-[#1A1A1A] mb-2">
                  Distribución de Rentabilidad
                </h4>
                <div className="w-full" style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="42%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={95}
                        innerRadius={0}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => `${value.toFixed(1)}%`}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #CFE0D8',
                          backgroundColor: 'white',
                          fontFamily: 'Inter',
                          fontSize: '14px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 12px rgba(16,24,40,0.08)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        wrapperStyle={{
                          fontFamily: 'Inter',
                          fontSize: '13px',
                          color: '#4D6B59',
                          paddingTop: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Preparación del Plato */}
              <div className="bg-white rounded-[16px] border border-[#CFE0D8] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat size={18} className="text-[#7BB97A]" />
                  <h4 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    Preparación del Plato
                  </h4>
                </div>
                <Textarea
                  value={preparation}
                  onChange={(e) => setPreparation(e.target.value)}
                  placeholder="Describe cómo se prepara este plato paso a paso..."
                  className="
                    min-h-[120px]
                    resize-none
                    rounded-[12px]
                    bg-[#F5FAF7]
                    border
                    border-[#CFE0D8]
                    text-[#2F3A33]
                    font-['Inter']
                    text-[14px]
                    leading-[20px]
                    placeholder:text-[#9FB3A8]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#7BB97A]
                    focus:ring-opacity-25
                    focus:border-[#7BB97A]
                    transition-all
                    p-3
                  "
                />
              </div>

              {/* Alérgenos */}
              <div className="bg-white rounded-[16px] border border-[#CFE0D8] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-[#F59E0B]" />
                  <h4 className="text-[16px] leading-[24px] font-semibold font-['Inter'] text-[#1A1A1A]">
                    Alérgenos
                  </h4>
                </div>
                <p className="text-[12px] leading-[16px] font-['Inter'] text-[#9FB3A8] mb-3">
                  Selecciona los alérgenos presentes en este plato
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map((allergen) => {
                    const isSelected = selectedAllergens.includes(allergen.id);
                    return (
                      <button
                        key={allergen.id}
                        onClick={() => toggleAllergen(allergen.id)}
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-2
                          rounded-full
                          font-['Inter']
                          text-[14px]
                          leading-[20px]
                          font-medium
                          transition-all
                          duration-200
                          border-2
                          ${isSelected 
                            ? 'bg-[#F59E0B] border-[#F59E0B] text-white shadow-[0_2px_8px_rgba(245,158,11,0.25)]' 
                            : 'bg-white border-[#CFE0D8] text-[#4D6B59] hover:border-[#F59E0B] hover:bg-[#FFFBF5]'
                          }
                        `}
                      >
                        <span>{allergen.emoji}</span>
                        <span>{allergen.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón Guardar - Solo mostrar si hay cambios */}
              {hasChanges && (
                <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="
                      w-full
                      h-[48px]
                      rounded-[16px]
                      bg-gradient-to-r from-[#A6D49F] to-[#7BB97A]
                      text-white
                      font-medium
                      font-['Inter']
                      text-[16px]
                      leading-[24px]
                      shadow-[0_4px_12px_rgba(123,185,122,0.25)]
                      hover:shadow-[0_6px_16px_rgba(123,185,122,0.35)]
                      transition-all
                      duration-200
                      disabled:opacity-50
                      disabled:cursor-not-allowed
                    "
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              )}

            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
