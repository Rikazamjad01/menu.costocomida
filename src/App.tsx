import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { CaptureScreen, FormData } from "./components/CaptureScreen";
import MenuScreen from "./components/MenuScreen";
import { LoginDialog } from "./components/LoginDialog";
import { ResetPasswordScreen } from "./components/ResetPasswordScreen";
import { Toaster } from "./components/ui/sonner";
import { createUserSettings, getUserSettings } from "./lib/supabase-helpers";
import { createClient } from './utils/supabase/client';

const supabase = createClient();

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [userName, setUserName] = useState("");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  // Check if this is a password reset flow
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      console.log('🔑 Password recovery flow detected');
      setIsPasswordReset(true);
      setIsCheckingSession(false);
    }
  }, []);

  // Deshabilitar scroll wheel en inputs numéricos (evita cambios accidentales)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault();
      }
    };

    // Agregar listener con capture para interceptar antes que el input
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Check if user already has a session
  useEffect(() => {
    // Skip session check if this is a password reset flow
    if (isPasswordReset) {
      return;
    }

    const checkExistingSession = async () => {
      try {
        // 1. Check auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          setIsCheckingSession(false);
          return;
        }

        if (session && session.user) {
          console.log('✅ Active session found:', session.user.id);
          
          // 2. Get user settings
          try {
            const settings = await getUserSettings();
            if (settings && settings.user_name) {
              setUserName(settings.user_name);
              setCurrentStep(2);
            } else {
              // Session exists but no settings - unusual case
              setUserName(session.user.user_metadata?.name || 'Usuario');
              setCurrentStep(2);
            }
          } catch (settingsError) {
            console.error('⚠️ Error fetching settings:', settingsError);
            // Continue to menu anyway with basic info
            setUserName(session.user.user_metadata?.name || 'Usuario');
            setCurrentStep(2);
          }
        } else {
          console.log('ℹ️ No active session - showing welcome');
        }
      } catch (error) {
        console.error("❌ Error checking session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [isPasswordReset]);

  const handleNext = () => {
    setDirection(1);
    setCurrentStep((prev) => prev + 1);
  };

  const handleShowLogin = () => {
    setShowLoginDialog(true);
  };

  const handleLoginSuccess = async (userData: any) => {
    setUserName(userData.name);
    setDirection(1);
    setCurrentStep(2);
    setShowLoginDialog(false); // Cerrar el dialog después del login exitoso
  };

  const handleFormSubmit = async (data: FormData) => {
    setUserName(data.name);
    
    // El signup ya se hizo en CaptureScreen
    // Aquí solo guardamos user_settings
    try {
      await createUserSettings({
        user_name: data.name,
        user_email: data.contact,
        currency: data.country === 'MX' ? 'MXN' : data.country === 'CO' ? 'COP' : 'USD',
        country: data.country,
        business_type: data.businessType
      });
      
      console.log('✅ User settings created');
    } catch (error) {
      console.error('❌ Error saving user settings:', error);
      // Continuar de todas formas - la cuenta ya se creó
    }
    
    // Ir directamente a la pantalla de menú
    setDirection(1);
    setCurrentStep(2);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ User logged out');
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
    
    // Reset state
    setUserName("");
    setDirection(-1);
    setCurrentStep(0);
  };

  const handleResetPasswordSuccess = () => {
    // Volver al inicio después de restablecer la contraseña
    setIsPasswordReset(false);
    setDirection(1);
    setCurrentStep(0);
    
    // Limpiar el hash de la URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 390 : -390,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -390 : 390,
      opacity: 0
    })
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="relative w-[390px] h-[844px] mx-auto bg-[#fcfdfb] overflow-hidden font-['Public_Sans',sans-serif] flex items-center justify-center">
        <div className="text-center">
          <img 
            src="https://i.imgur.com/QklWSGh.png" 
            alt="CostoComida" 
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
          <p className="text-[#7BB97A] text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show password reset screen if needed
  if (isPasswordReset) {
    return (
      <div className="relative w-[390px] min-h-[844px] mx-auto bg-white font-['Inter',sans-serif]">
        <ResetPasswordScreen onSuccess={handleResetPasswordSuccess} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="relative w-[390px] min-h-[844px] mx-auto bg-[#fcfdfb] font-['Public_Sans',sans-serif]">
      {/* Screens */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full min-h-full"
        >
          {currentStep === 0 && (
            <WelcomeScreen 
              onStart={handleNext}
              onLogin={handleShowLogin}
            />
          )}

          {currentStep === 1 && (
            <CaptureScreen 
              onSubmit={handleFormSubmit}
              onShowLogin={handleShowLogin}
            />
          )}

          {currentStep === 2 && (
            <MenuScreen onLogout={handleLogout} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Login Dialog */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}