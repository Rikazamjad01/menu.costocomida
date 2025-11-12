import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { createClient } from "../utils/supabase/client";
import { PasswordResetDialog } from "./PasswordResetDialog";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any) => void;
}

export function LoginDialog({ isOpen, onClose, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Completa todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // 1. Login con Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (signInError) {
        console.error('❌ Login error:', signInError);
        
        if (signInError.message.includes('Invalid login credentials')) {
          toast.error("Credenciales incorrectas", {
            description: "Verifica tu email y contraseña"
          });
        } else if (signInError.message.includes('Email not confirmed')) {
          toast.error("Email no confirmado", {
            description: "Por favor confirma tu email"
          });
        } else {
          toast.error("Error al iniciar sesión", {
            description: signInError.message
          });
        }
        
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      console.log('✅ Login successful:', authData.user.id);
      
      // 2. Obtener datos de user_settings
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', authData.user.id)
        .limit(1)
        .single();
      
      if (settingsError) {
        console.error('⚠️ Settings not found:', settingsError);
      }
      
      // 3. Usuario y contraseña correctos
      const userData = {
        name: settings?.user_name || authData.user.user_metadata?.name || 'Usuario',
        email: authData.user.email,
        currency: settings?.currency || 'USD'
      };
      
      toast.success(`¡Bienvenido de nuevo, ${userData.name}!`);
      onLoginSuccess(userData);
      
      // Reset form
      setEmail("");
      setPassword("");
      
    } catch (error: any) {
      console.error("❌ Error logging in:", error);
      toast.error("Error al iniciar sesión", {
        description: "Intenta nuevamente más tarde"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[360px]" 
        style={{ borderRadius: '24px' }}
        aria-describedby="login-description"
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
            style={{ fontFamily: 'Roboto Serif, serif', fontSize: '22px', fontWeight: 600 }}
          >
            Iniciar sesión
          </DialogTitle>
          <DialogDescription 
            id="login-description"
            className="text-center text-[#4D6B59]" 
            style={{ fontFamily: 'Public Sans, sans-serif', fontSize: '14px' }}
          >
            Accede a tu cuenta de CostoComida
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4 py-2">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[#2F3A33] mb-2 block">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="pl-10 rounded-[12px] border-[#CFE0D8] focus:border-[#7BB97A] h-12"
                style={{ fontFamily: 'Public Sans, sans-serif', fontSize: '15px' }}
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-[#2F3A33] mb-2 block">
              Contraseña
            </Label>
            <div className="relative">
              <Lock 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10 rounded-[12px] border-[#CFE0D8] focus:border-[#7BB97A] h-12"
                style={{ fontFamily: 'Public Sans, sans-serif', fontSize: '15px' }}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="text-[#7BB97A] hover:text-[#6BA96A] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: '20px', fontWeight: 500 }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-[12px] bg-[#7BB97A] hover:bg-[#6BA96A] text-white h-12 transition-all duration-200 shadow-[0_4px_16px_rgba(123,185,122,0.25)]"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '15px', fontWeight: 500 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                o
              </span>
            </div>
          </div>

          {/* Create Account Button */}
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="w-full rounded-[12px] border-[#CFE0D8] text-[#7BB97A] hover:bg-[#F0F9EF] h-12"
            style={{ fontFamily: 'Public Sans, sans-serif', fontSize: '15px', fontWeight: 500 }}
          >
            Crear cuenta nueva
          </Button>
        </form>

        {/* Password Reset Dialog */}
        <PasswordResetDialog 
          isOpen={showPasswordReset}
          onClose={() => setShowPasswordReset(false)}
        />
      </DialogContent>
    </Dialog>
  );
}