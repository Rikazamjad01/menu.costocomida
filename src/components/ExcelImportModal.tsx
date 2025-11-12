import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

export default function ExcelImportModal({ isOpen, onClose, onImport }: ExcelImportModalProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    
    // Simular subida de archivo
    setTimeout(() => {
      setUploading(false);
      toast.success('Archivo importado exitosamente', {
        description: 'Los platos han sido agregados a tu menú'
      });
      onImport();
      setFile(null);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[380px]" style={{ borderRadius: '24px' }} aria-describedby="excel-import-description">
        <DialogHeader>
          <DialogTitle className="text-center text-[#1A1A1A]" style={{ fontFamily: 'var(--cc-font-heading)', fontSize: '20px', fontWeight: 600 }}>
            Importar desde Excel
          </DialogTitle>
          <DialogDescription id="excel-import-description" className="text-center mt-1 text-[#4D6B59]" style={{ fontFamily: 'var(--cc-font-body)', fontSize: '14px' }}>
            Sube un archivo Excel con tus platos e ingredientes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-[#A6D49F] rounded-[16px] p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file"
            />
            <label htmlFor="excel-file" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#F0F9EF] flex items-center justify-center">
                  {file ? (
                    <CheckCircle2 size={32} className="text-[#7BB97A]" />
                  ) : (
                    <FileSpreadsheet size={32} className="text-[#7BB97A]" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#2D2D2D] mb-1">
                    {file ? file.name : 'Selecciona un archivo'}
                  </p>
                  <p className="text-xs text-[#757575]">
                    Excel (.xlsx, .xls) o CSV
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-[12px] p-3">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Formato esperado:</strong> Columna 1: Nombre del plato, Columna 2: Precio, Columnas siguientes: Ingredientes
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-[12px] border-gray-300"
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1 rounded-[12px] bg-[#7BB97A] hover:bg-[#6BA96A] text-white"
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Upload size={16} className="mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-2" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
