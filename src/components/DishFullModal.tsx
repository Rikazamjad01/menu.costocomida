import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface DishFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: any;
  onSave?: (dishId: string, updates: any) => Promise<void>;
  onDelete?: (dishId: string) => Promise<void>;
}

export default function DishFullModal({ isOpen, onClose, dish, onSave, onDelete }: DishFullModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(dish?.price?.toString() || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!dish) return null;

  const margin = dish.margin || 0;
  const getMarginColor = () => {
    if (margin >= 65) return 'text-[#4e9643]';      // Verde: ≥65%
    if (margin >= 50) return 'text-[#F59E0B]';      // Amber: 50-64%
    return 'text-[#DC2626]';                        // Rojo: <50%
  };

  const getMarginBadge = () => {
    if (margin >= 65) return { text: 'Saludable', bg: 'bg-green-50 text-green-700 border-green-300' };
    if (margin >= 50) return { text: 'Ajustar', bg: 'bg-yellow-50 text-yellow-700 border-yellow-300' };
    return { text: 'Riesgo', bg: 'bg-red-50 text-red-700 border-red-300' };
  };

  const marginBadge = getMarginBadge();

  const handleSave = async () => {
    if (!onSave) return;

    const newPrice = parseFloat(editedPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Precio inválido');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(dish.id, { price: newPrice });
      setIsEditing(false);
      toast.success('Precio actualizado correctamente');
    } catch (error) {
      console.error('Error saving dish:', error);
      toast.error('Error al actualizar precio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(dish.id);
      setShowDeleteDialog(false);
      onClose();
      toast.success('Plato eliminado correctamente');
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Error al eliminar plato');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[380px] max-h-[90vh] overflow-y-auto" style={{ borderRadius: '24px' }} aria-describedby="dish-details-description">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <DialogTitle className="text-[#1A1A1A]" style={{ fontFamily: 'var(--cc-font-heading)', fontSize: '20px', fontWeight: 600 }}>
                  {dish.dish}
                </DialogTitle>
                <DialogDescription id="dish-details-description" className="sr-only">
                  Detalles y edición del plato {dish.dish}
                </DialogDescription>
                <p className="text-sm text-[#757575] mt-1">{dish.category}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Price Section */}
            <div className="bg-[#F5FAF7] rounded-[16px] p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Label className="text-sm text-[#4D6B59]">Precio de venta</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[#757575]">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(e.target.value)}
                        className="w-24 h-9 rounded-[8px]"
                      />
                    </div>
                  ) : (
                    <p className="text-2xl text-[#1A1A1A] mt-1" style={{ fontWeight: 600 }}>
                      ${dish.price?.toFixed(2) || '0.00'}
                    </p>
                  )}
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditedPrice(dish.price?.toString() || '0');
                    }}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit2 size={16} className="text-[#7BB97A]" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="h-8 px-3"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="h-8 px-3 bg-[#7BB97A] hover:bg-[#6BA96A]"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-[#757575]">Costo</Label>
                  <p className="text-lg text-[#2D2D2D]" style={{ fontWeight: 500 }}>
                    ${dish.cost?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-[#757575]">Margen</Label>
                  <p className={`text-lg ${getMarginColor()}`} style={{ fontWeight: 600 }}>
                    {margin.toFixed(1)}%
                  </p>
                </div>
              </div>

              <Badge variant="outline" className={`mt-3 ${marginBadge.bg} border`}>
                {marginBadge.text}
              </Badge>
            </div>

            {/* Ingredients Section */}
            {dish.ingredients && dish.ingredients.length > 0 && (
              <div>
                <Label className="text-sm text-[#2D2D2D] mb-3 block">Ingredientes</Label>
                <div className="space-y-2">
                  {dish.ingredients.map((ing: any, index: number) => {
                    const priceChange = ing.previous_price 
                      ? ((ing.current_price - ing.previous_price) / ing.previous_price) * 100
                      : 0;
                    const hasPriceChange = Math.abs(priceChange) > 0.1;

                    return (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-[12px] p-3"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm text-[#2D2D2D]">{ing.ingredient_name}</p>
                          <p className="text-sm text-[#7BB97A]">
                            ${((ing.quantity || 0) * (ing.current_price || 0)).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-[#757575]">
                            {ing.quantity} {ing.unit}
                          </p>
                          {hasPriceChange && (
                            <div className="flex items-center gap-1">
                              {priceChange > 0 ? (
                                <TrendingUp size={12} className="text-orange-600" />
                              ) : (
                                <TrendingDown size={12} className="text-green-600" />
                              )}
                              <span className={`text-xs ${priceChange > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sales Info */}
            {dish.sales > 0 && (
              <div className="bg-blue-50 rounded-[12px] p-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-900">Ventas del mes</p>
                    <p className="text-sm text-blue-900" style={{ fontWeight: 600 }}>
                      {dish.sales} unidades
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Button */}
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full rounded-[12px] border-red-300 text-red-600 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 size={16} className="mr-2" />
              Eliminar plato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[340px]" style={{ borderRadius: '24px' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1A1A1A]">
              ¿Eliminar plato?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#4D6B59]">
              Esta acción no se puede deshacer. El plato "{dish.dish}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[12px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-[12px] bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
