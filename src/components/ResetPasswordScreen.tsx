import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { createClient } from "../utils/supabase/client";

interface ResetPasswordScreenProps {
  onSuccess: () => void;
}

export function ResetPasswordScreen({ onSuccess }: ResetPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Verificar si hay un token de recuperación válido
    const checkRecoveryToken = async () => {
      const supabase = createClient();
      
      try {
        // Verificar si hay una sesión de recuperación
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.error('❌ No recovery session found:', error);
          setIsValidLink(false);
          toast.error("Enlace inválido o expirado", {
            description: "Solicita un nuevo enlace de restablecimiento"
          });
        } else {
          console.log('✅ Valid recovery session found');
          setIsValidLink(true);
        }
      } catch (error) {
        console.error('❌ Error checking recovery token:', error);
        setIsValidLink(false);
      } finally {
        setIsCheckingLink(false);
      }
    };

    checkRecoveryToken();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!newPassword || !confirmPassword) {
      toast.error("Completa todos los campos");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Actualizar la contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('❌ Password update error:', error);
        toast.error("Error al actualizar la contraseña", {
          description: error.message
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Password updated successfully');
      toast.success("Contraseña actualizada", {
        description: "Ya puedes iniciar sesión con tu nueva contraseña"
      });

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error("❌ Error resetting password:", error);
      toast.error("Error al actualizar la contraseña", {
        description: "Intenta nuevamente más tarde"
      });
      setIsLoading(false);
    }
  };

  // Loading state while checking link
  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-[420px] w-full">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 size={48} className="text-[#7BB97A] animate-spin" />
            <p 
              className="text-[#4D6B59]"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px' }}
            >
              Verificando enlace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-[420px] w-full">
          <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_12px_rgba(16,24,40,0.08)] border border-[#CFE0D8]">
            <div className="flex flex-col items-center space-y-6">
              {/* Error Icon */}
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>

              {/* Content */}
              <div className="text-center space-y-2">
                <h1 
                  className="text-[#1A1A1A]"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', lineHeight: '30px', letterSpacing: '-0.44px', fontWeight: 600 }}
                >
                  Enlace inválido
                </h1>
                <p 
                  className="text-[#4D6B59]"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px' }}
                >
                  Este enlace ha expirado o no es válido. Solicita uno nuevo para restablecer tu contraseña.
                </p>
              </div>

              {/* Button */}
              <Button
                onClick={onSuccess}
                className="w-full rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white h-12 transition-all duration-200 shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)]"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}
              >
                Volver a inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Valid link - show password reset form
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-[420px] w-full">
        <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_12px_rgba(16,24,40,0.08)] border border-[#CFE0D8]">
          {/* Header */}
          <div className="flex flex-col items-center mb-8 space-y-4">
            <img 
              src="https://i.imgur.com/QklWSGh.png" 
              alt="CostoComida" 
              className="w-16 h-16"
            />
            <div className="text-center space-y-2">
              <h1 
                className="text-[#1A1A1A]"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '22px', lineHeight: '30px', letterSpacing: '-0.44px', fontWeight: 600 }}
              >
                Nueva contraseña
              </h1>
              <p 
                className="text-[#4D6B59]"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px' }}
              >
                Ingresa tu nueva contraseña
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* New Password */}
            <div>
              <Label htmlFor="new-password" className="text-[#2F3A33] mb-2 block">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Lock 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 rounded-[16px] border-[#CFE0D8] focus:border-[#7BB97A] h-12"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px' }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirm-password" className="text-[#2F3A33] mb-2 block">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-10 rounded-[16px] border-[#CFE0D8] focus:border-[#7BB97A] h-12"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-[#F5FAF7] rounded-[16px] p-4">
              <p 
                className="text-[#4D6B59]"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px' }}
              >
                ✓ Mínimo 6 caracteres
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white h-12 transition-all duration-200 shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)]"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px', fontWeight: 500 }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
