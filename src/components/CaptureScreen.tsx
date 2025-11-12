import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { MINIAPP_COPY } from "../copy/costoComidaMiniApp";
import { createClient } from '../utils/supabase/client';
import { toast } from "sonner@2.0.3";

const COPY = MINIAPP_COPY.directa; // ⬅️ elige: directa | amigable | motivadora
const supabase = createClient();

interface CaptureScreenProps {
  onSubmit: (data: FormData) => void;
  onShowLogin?: () => void;
}

export interface FormData {
  name: string;
  contact: string;
  password: string;
  businessType: string;
  country: string;
}

export function CaptureScreen({ onSubmit, onShowLogin }: CaptureScreenProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact: "",
    password: "",
    businessType: "",
    country: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if all fields are filled
  const isFormValid = 
    formData.name.trim() !== "" && 
    formData.contact.trim() !== "" && 
    formData.password.trim() !== "" && 
    formData.businessType !== "" && 
    formData.country !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Import project info
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // 1. Crear usuario con email auto-confirmado via servidor
      const signupResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-af6f0d00/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email: formData.contact,
            password: formData.password,
            user_metadata: {
              name: formData.name,
              business_type: formData.businessType,
              country: formData.country
            }
          })
        }
      );

      const signupData = await signupResponse.json();

      if (!signupResponse.ok || signupData.error) {
        console.error('❌ Signup error:', signupData.error);
        
        // Mensajes de error más amigables
        if (signupData.error?.includes('already registered')) {
          toast.error('Este email ya está registrado', {
            description: 'Intenta iniciar sesión en su lugar'
          });
        } else {
          toast.error(signupData.error || 'Error al crear cuenta');
        }
        
        setIsSubmitting(false);
        return;
      }

      console.log('✅ User created with confirmed email:', signupData.user?.id);

      // 2. Hacer login automáticamente con las credenciales
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.contact,
        password: formData.password
      });

      if (signInError) {
        console.error('❌ Auto-login error:', signInError);
        toast.error('Cuenta creada pero error al iniciar sesión', {
          description: 'Intenta iniciar sesión manualmente'
        });
        setIsSubmitting(false);
        return;
      }

      if (!sessionData.session) {
        toast.error('Error al establecer sesión');
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Auto-login successful, session established');

      // 3. Llamar al callback con los datos
      // El callback en App.tsx se encargará de crear user_settings
      onSubmit(formData);
      
    } catch (error: any) {
      console.error('❌ Error during signup:', error);
      toast.error(error.message || 'Error al crear cuenta');
      setIsSubmitting(false);
    }
  };

  const businessTypes = [
    "Restaurante",
    "Café",
    "Dark Kitchen",
    "Food Truck",
    "Otro"
  ];

  return (
    <div className="flex flex-col min-h-[844px] bg-white px-5 py-8 pt-12">
      {/* Title */}
      <h1 className="mb-6 text-center text-[28px] leading-[36px] tracking-[-0.56px] font-semibold font-['Poppins'] text-[#1A1A1A] flex items-center justify-center gap-2">
        ¡Ya casi terminas!
        <img src="https://i.imgur.com/QklWSGh.png" alt="Rocket" className="w-9 h-9 inline-block" />
      </h1>

      {/* Subtitle */}
      <p className="mb-8 text-center text-[#4D6B59] text-[16px] leading-[24px] font-normal font-['Inter']">
        Completa tus datos y empieza a calcular el costo real de tus platos.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 mb-6">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
              Nombre
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
              className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-[48px] px-4 rounded-[16px] bg-white border border-[#CFE0D8] text-[#2F3A33] font-['Inter'] text-[16px] leading-[24px] placeholder:text-[#9FB3A8] focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9FB3A8] hover:text-[#4D6B59] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && formData.password.length < 6 && (
              <p className="text-[14px] leading-[20px] text-[#DC2626] font-['Inter'] font-normal mt-1">
                La contraseña debe tener al menos 6 caracteres
              </p>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-[#F5FAF7] rounded-[16px] p-4 border border-[#CFE0D8]">
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

          {/* Business Type */}
          <div>
            <Label htmlFor="businessType" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
              Tipo de Negocio
            </Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => setFormData({ ...formData, businessType: value })}
            >
              <SelectTrigger 
                className="w-full h-[48px] bg-white border border-[#CFE0D8] rounded-[16px] px-4 text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all data-[placeholder]:text-[#9FB3A8]"
              >
                <SelectValue placeholder="Selecciona tu tipo de negocio" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white rounded-[16px] border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)] overflow-hidden"
              >
                {businessTypes.map((type) => (
                  <SelectItem 
                    key={type} 
                    value={type}
                    className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country" className="text-[#2F3A33] mb-2 block text-[14px] leading-[20px] font-normal font-['Inter']">
              País
            </Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
            >
              <SelectTrigger 
                className="w-full h-[48px] bg-white border border-[#CFE0D8] rounded-[16px] px-4 text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal focus:outline-none focus:ring-2 focus:ring-[#7BB97A] focus:ring-opacity-25 focus:border-[#7BB97A] transition-all data-[placeholder]:text-[#9FB3A8]"
              >
                <SelectValue placeholder="Selecciona tu país" />
              </SelectTrigger>
              <SelectContent 
                className="bg-white rounded-[16px] border border-[#CFE0D8] shadow-[0_4px_12px_rgba(16,24,40,0.08)] overflow-hidden max-h-[300px]"
              >
                <SelectItem 
                  value="MX"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  México (MXN)
                </SelectItem>
                <SelectItem 
                  value="CO"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  Colombia (COP)
                </SelectItem>
                <SelectItem 
                  value="AR"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  Argentina (ARS)
                </SelectItem>
                <SelectItem 
                  value="CL"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  Chile (CLP)
                </SelectItem>
                <SelectItem 
                  value="PE"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  Perú (PEN)
                </SelectItem>
                <SelectItem 
                  value="ES"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  España (EUR)
                </SelectItem>
                <SelectItem 
                  value="US"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  Estados Unidos (USD)
                </SelectItem>
                <SelectItem 
                  value="OTHER_USD"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  Otro ($)
                </SelectItem>
                <SelectItem 
                  value="OTHER_EUR"
                  className="text-[#2F3A33] text-[16px] leading-[24px] font-['Inter'] font-normal px-4 py-3 cursor-pointer focus:bg-[#F5FAF7] focus:text-[#2F3A33] hover:bg-[#F5FAF7] data-[state=checked]:bg-[#F5FAF7]"
                >
                  Otro (Euro)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full h-[48px] px-6 rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white font-medium font-['Inter'] text-[16px] leading-[24px] shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)] transition-all duration-200 active:scale-[0.98] disabled:bg-[#F5FAF7] disabled:text-[#9FB3A8] disabled:cursor-not-allowed disabled:shadow-[0_1px_2px_rgba(16,24,40,0.06)]"
        >
          {isSubmitting ? 'Creando cuenta...' : COPY.capture.cta}
        </Button>

        {/* Login Link */}
        {onShowLogin && (
          <div className="mt-4 text-center">
            <p className="text-[14px] leading-[20px] text-[#9FB3A8] font-normal font-['Inter']">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={onShowLogin}
                className="text-[#7BB97A] font-medium font-['Inter'] hover:text-[#4e9643] transition-colors underline"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
