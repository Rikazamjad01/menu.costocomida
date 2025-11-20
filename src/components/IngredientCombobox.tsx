import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { cn } from './ui/utils';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  price_per_unit: number;
  wastage_percentage?: number;
}

interface IngredientComboboxProps {
  inventoryItems: InventoryItem[];
  value: string;
  onSelect: (ingredient: InventoryItem | null) => void;
  onCreateNew: (name: string) => void;
  placeholder?: string;
}

export function IngredientCombobox({
  inventoryItems,
  value,
  onSelect,
  onCreateNew,
  placeholder = "Buscar ingrediente..."
}: IngredientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Debug: Log inventory items to check structure
  console.log('🔍 IngredientCombobox - inventoryItems:', inventoryItems);
  console.log('🔍 IngredientCombobox - current value:', value);

  const selectedItem = inventoryItems.find(
    (item) => item.name.toLowerCase() === value.toLowerCase()
  );

  // Mostrar el valor actual aunque no esté en la lista (ingrediente nuevo)
  const displayValue = value || placeholder;
  const hasValue = value && value.trim().length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          className="w-full flex items-center justify-between h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] hover:border-[#7BB97A] focus:border-[#7BB97A] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 text-[16px] font-['Inter'] text-[#2F3A33] hover:bg-[#F5FAF7] transition-all cursor-pointer"
        >
          <span className={cn(
            "text-left",
            !hasValue && "text-[#9FB3A8]"
          )}>
            {displayValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[16px] border-[#CFE0D8]">
        <Command className="rounded-[16px]">
          <CommandInput 
            placeholder="Buscar o escribir nuevo..." 
            className="h-[48px] font-['Inter'] text-[16px]"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty className="py-6 text-center">
            <div className="space-y-3">
              <p className="text-[14px] text-[#4D6B59] font-['Inter']">
                No se encontró "{searchValue}"
              </p>
              <button
                onClick={() => {
                  // Crear nuevo ingrediente con el nombre que escribió el usuario
                  onCreateNew(searchValue);
                  setSearchValue('');
                  setOpen(false);
                }}
                className="h-[40px] px-4 rounded-[12px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white font-medium font-['Inter'] text-[14px] hover:shadow-md transition-all inline-flex items-center justify-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear "{searchValue}"
              </button>
            </div>
          </CommandEmpty>
          <CommandGroup>
            {inventoryItems.map((item) => (
              <CommandItem
                key={item.id}
                value={item.name}
                onSelect={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                className="font-['Inter'] cursor-pointer hover:bg-[#F5FAF7]"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedItem?.id === item.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#1A1A1A]">{item.name}</span>
                    {item.price_per_unit != null && item.price_per_unit !== undefined && item.unit && (
                      <span className="text-[14px] text-[#4D6B59] ml-2">
                        ${Number(item.price_per_unit).toFixed(2)}/{item.unit}
                      </span>
                    )}
                  </div>
                  {item.wastage_percentage != null && item.wastage_percentage > 0 && (
                    <span className="text-[12px] text-[#9FB3A8]">
                      Merma: {Number(item.wastage_percentage).toFixed(0)}%
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
            
            {/* Botón para agregar nuevo siempre visible al final */}
            <CommandItem
              onSelect={() => {
                onCreateNew(searchValue || '');
                setSearchValue('');
                setOpen(false);
              }}
              className="border-t border-[#CFE0D8] mt-2 pt-2 cursor-pointer hover:bg-[#F5FAF7] font-['Inter']"
            >
              <Plus className="mr-2 h-4 w-4 text-[#7BB97A]" />
              <span className="font-medium text-[#7BB97A]">
                {searchValue ? `Crear "${searchValue}"` : 'Agregar nuevo ingrediente'}
              </span>
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
