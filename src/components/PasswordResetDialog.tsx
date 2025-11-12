import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { createClient } from "../utils/supabase/client";

interface PasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetDialog({ isOpen, onClose }: PasswordResetDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Ingresa un correo válido");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Enviar email de restablecimiento
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('❌ Password reset error:', error);
        toast.error("Error al enviar el correo", {
          description: error.message
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Password reset email sent to:', email);
      setEmailSent(true);
      
    } catch (error: any) {
      console.error("❌ Error sending reset email:", error);
      toast.error("Error al enviar el correo", {
        description: "Intenta nuevamente más tarde"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-[360px]" 
        style={{ borderRadius: '24px' }}
        aria-describedby="reset-description"
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <img 
              src="https://i.imgur.com/QklWSGh.png" 
              alt="CostoComida" 
              className="w-12 h-12"
            />
          </div>
          <DialogTitle 
            className="text-center text-[#1A1A1A]" 
            style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', lineHeight: '30px', letterSpacing: '-0.44px', fontWeight: 600 }}
          >
            {emailSent ? "Revisa tu correo" : "Restablecer contraseña"}
          </DialogTitle>
          <DialogDescription 
            id="reset-description"
            className="text-center text-[#4D6B59]" 
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px' }}
          >
            {emailSent 
              ? "Te enviamos un enlace para restablecer tu contraseña" 
              : "Ingresa tu correo y te enviaremos un enlace"}
          </DialogDescription>
        </DialogHeader>
        
        {emailSent ? (
          <div className="py-4 space-y-6">
            {/* Success State */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#F0F9EF] flex items-center justify-center">
                <CheckCircle2 size={32} className="text-[#4e9643]" />
              </div>
              <div className="text-center space-y-2">
                <p 
                  className="text-[#2F3A33]"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px' }}
                >
                  Enviamos un correo a:
                </p>
                <p 
                  className="font-medium text-[#1A1A1A]"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}
                >
                  {email}
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="bg-[#F5FAF7] rounded-[16px] p-4">
              <p 
                className="text-[#4D6B59] text-center"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px' }}
              >
                Haz clic en el enlace del correo para crear una nueva contraseña. El enlace expira en 1 hora.
              </p>
            </div>

            {/* Back Button */}
            <Button
              type="button"
              onClick={handleClose}
              className="w-full rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white h-12 transition-all duration-200 shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)]"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}
            >
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4 py-2">
            {/* Email */}
            <div>
              <Label htmlFor="reset-email" className="text-[#2F3A33] mb-2 block">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 rounded-[16px] border-[#CFE0D8] focus:border-[#7BB97A] h-12"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white h-12 transition-all duration-200 shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)]"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace"
              )}
            </Button>

            {/* Back to Login */}
            <Button
              type="button"
              onClick={handleClose}
              variant="ghost"
              className="w-full rounded-[16px] text-[#4D6B59] hover:bg-[#F5FAF7] h-12"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}
            >
              <ArrowLeft size={18} className="mr-2" />
              Volver a inicio de sesión
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
