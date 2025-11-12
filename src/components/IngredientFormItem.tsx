import { Edit2, Trash2, Check, X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { IngredientCombobox } from './IngredientCombobox';

interface Ingredient {
  inventoryItemId?: string;
  isExisting: boolean;
  isEditing: boolean;
  name: string;
  purchaseUnit: string;
  pricePerPurchaseUnit: string;
  dishUnit: string;
  quantityInDish: string;
  ingredientWastage: string;
  quantity: string;
  unit: string;
  price: string;
  wastePercentage: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  price_per_unit: number;
  wastage_percentage?: number;
}

interface IngredientFormItemProps {
  ingredient: Ingredient;
  index: number;
  inventoryItems: InventoryItem[];
  canRemove: boolean;
  currencySymbol: string;
  onRemove: () => void;
  onUpdate: (field: keyof Ingredient, value: string) => void;
  onSelectExisting: (item: InventoryItem) => void;
  onCreateNew: (name: string) => void;
  onToggleEdit: () => void;
}

const unitOptions = ['kg', 'lt', 'ml', 'gr', 'piezas', 'tazas', 'unidades'];

// Helper para auto-seleccionar valores "0" al hacer foco
const handleFocusSelectZero = (e: React.FocusEvent<HTMLInputElement>) => {
  const value = e.target.value;
  // Si el valor es "0" o está vacío, seleccionar todo para facilitar reemplazo
  if (value === '0' || value === '' || parseFloat(value) === 0) {
    e.target.select();
  }
};

export function IngredientFormItem({
  ingredient,
  index,
  inventoryItems,
  canRemove,
  currencySymbol,
  onRemove,
  onUpdate,
  onSelectExisting,
  onCreateNew,
  onToggleEdit
}: IngredientFormItemProps) {
  
  // Calcular costo del ingrediente con merma
  const calculateIngredientCost = (): number => {
    const price = parseFloat(ingredient.pricePerPurchaseUnit) || 0;
    const quantity = parseFloat(ingredient.quantityInDish) || 0;
    const wastage = parseFloat(ingredient.ingredientWastage) || 0;
    
    if (price <= 0 || quantity <= 0) return 0;
    
    // Conversión simple (si compra en kg y usa en gramos, dividir por 1000)
    const conversionFactor = getConversionFactor(ingredient.dishUnit, ingredient.purchaseUnit);
    const quantityInPurchaseUnit = quantity * conversionFactor;
    
    // Aplicar merma: si tengo 10% merma, solo uso 90%, entonces costo real aumenta
    const usableRatio = 1 - (wastage / 100);
    const effectivePrice = usableRatio > 0 ? price / usableRatio : price;
    
    return quantityInPurchaseUnit * effectivePrice;
  };

  const getConversionFactor = (from: string, to: string): number => {
    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();
    
    // Convertir dishUnit (from) a purchaseUnit (to)
    // Si uso 100gr en plato y compro por kg, necesito 100/1000 = 0.1 kg
    // Si uso 50ml en plato y compro por lt, necesito 50/1000 = 0.05 lt
    
    // gr -> kg (dividir por 1000)
    if (fromLower === 'gr' && toLower === 'kg') return 1/1000;
    // kg -> gr (multiplicar por 1000)
    if (fromLower === 'kg' && toLower === 'gr') return 1000;
    
    // ml -> lt (dividir por 1000)
    if (fromLower === 'ml' && (toLower === 'lt' || toLower === 'l')) return 1/1000;
    // lt -> ml (multiplicar por 1000)
    if ((fromLower === 'lt' || fromLower === 'l') && toLower === 'ml') return 1000;
    
    // Mismo tipo o no reconocido
    return 1;
  };

  const cost = calculateIngredientCost();
  const isReadOnly = ingredient.isExisting && !ingredient.isEditing;

  return (
    <div className="space-y-3 p-4 bg-[#F5FAF7] rounded-[16px] border border-[#CFE0D8]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-[#4D6B59] font-['Inter'] font-medium">
            Ingrediente {index + 1}
          </span>
          {ingredient.isExisting && (
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#7BB97A] text-white font-['Inter']">
              Guardado
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {ingredient.isExisting && (
            <button
              onClick={onToggleEdit}
              className="text-[#7BB97A] hover:text-[#4e9643] p-1.5 rounded-[8px] hover:bg-white transition-colors"
              title={ingredient.isEditing ? "Dejar de editar" : "Editar valores"}
            >
              {ingredient.isEditing ? <X size={16} /> : <Edit2 size={16} />}
            </button>
          )}
          {canRemove && (
            <button
              onClick={onRemove}
              className="text-[#DC2626] hover:text-[#B91C1C] p-1.5 rounded-[8px] hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Ingredient Name - Combobox */}
      <div>
        <IngredientCombobox
          inventoryItems={inventoryItems}
          value={ingredient.name}
          onSelect={onSelectExisting}
          onCreateNew={onCreateNew}
          placeholder="Buscar ingrediente..."
        />
        {!ingredient.isExisting && ingredient.name && (
          <p className="text-[12px] text-[#9FB3A8] mt-1 font-['Inter']">
            Nuevo ingrediente - se guardará para uso futuro
          </p>
        )}
      </div>
      
      {/* Purchase Unit and Price (auto-filled if existing, editable) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`purchase-unit-${index}`} className="text-[14px] text-[#4D6B59] mb-1 font-['Inter']">
            Unidad de compra
          </Label>
          {isReadOnly ? (
            <div className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] flex items-center text-[16px] text-[#2F3A33] font-['Inter']">
              {ingredient.purchaseUnit}
            </div>
          ) : (
            <Select
              value={ingredient.purchaseUnit}
              onValueChange={(value) => onUpdate('purchaseUnit', value)}
            >
              <SelectTrigger id={`purchase-unit-${index}`} className="rounded-[16px] text-[16px] border-[#CFE0D8] h-[48px] font-['Inter']">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit} className="font-['Inter']">
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div>
          <Label htmlFor={`price-${index}`} className="text-[14px] text-[#4D6B59] mb-1 font-['Inter']">
            Precio/{ingredient.purchaseUnit}
          </Label>
          <Input
            id={`price-${index}`}
            type="number"
            step="0.01"
            value={ingredient.pricePerPurchaseUnit}
            onChange={(e) => onUpdate('pricePerPurchaseUnit', e.target.value)}
            onFocus={handleFocusSelectZero}
            placeholder="0.00"
            readOnly={isReadOnly}
            className={`rounded-[16px] text-[16px] border-[#CFE0D8] h-[48px] font-['Inter'] ${isReadOnly ? 'bg-white' : ''}`}
          />
        </div>
      </div>

      {/* Dish Unit and Quantity (what user actually uses in the dish) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`dish-unit-${index}`} className="text-[14px] text-[#4D6B59] mb-1 font-['Inter']">
            Unidad en plato
          </Label>
          <Select
            value={ingredient.dishUnit}
            onValueChange={(value) => onUpdate('dishUnit', value)}
          >
            <SelectTrigger id={`dish-unit-${index}`} className="rounded-[16px] text-[16px] border-[#CFE0D8] h-[48px] font-['Inter']">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((unit) => (
                <SelectItem key={unit} value={unit} className="font-['Inter']">
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor={`quantity-${index}`} className="text-[14px] text-[#4D6B59] mb-1 font-['Inter']">
            Cantidad
          </Label>
          <Input
            id={`quantity-${index}`}
            type="number"
            step="0.01"
            value={ingredient.quantityInDish}
            onChange={(e) => onUpdate('quantityInDish', e.target.value)}
            onFocus={handleFocusSelectZero}
            placeholder="0"
            className="rounded-[16px] text-[16px] border-[#CFE0D8] h-[48px] font-['Inter']"
          />
        </div>
      </div>

      {/* Ingredient Wastage - SIEMPRE EDITABLE (no depende del inventario) */}
      <div>
        <Label htmlFor={`wastage-${index}`} className="text-[14px] text-[#4D6B59] mb-1 font-['Inter']">
          % Merma del ingrediente
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id={`wastage-${index}`}
            type="number"
            step="1"
            min="0"
            max="100"
            value={ingredient.ingredientWastage}
            onChange={(e) => onUpdate('ingredientWastage', e.target.value)}
            onFocus={handleFocusSelectZero}
            placeholder="0"
            className="rounded-[16px] text-[16px] border-[#CFE0D8] h-[48px] font-['Inter']"
          />
          <span className="text-[14px] text-[#9FB3A8] font-['Inter'] whitespace-nowrap">
            (ej. 10% = de 100g solo uso 90g)
          </span>
        </div>
      </div>

      {/* Cost Preview */}
      {cost > 0 && (
        <div className="text-[14px] text-[#4D6B59] bg-white px-4 py-2.5 rounded-[12px] border border-[#CFE0D8] font-['Inter'] flex items-center justify-between">
          <span className="font-medium">Costo de este ingrediente:</span>
          <span className="text-[16px] text-[#1A1A1A] font-semibold">
            {currencySymbol}{cost.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
