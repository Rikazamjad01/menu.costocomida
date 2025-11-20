import { useState } from "react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
// import chefImage from "figma:asset/1da38d58bc3bb8951579de482f01de77cf178a27.png";
import { LogIn } from "lucide-react";
import PWAInstallButton from "./ui/PWAInstallButton";

interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({ onStart, onLogin }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col min-h-[844px] bg-white justify-between">
      <PWAInstallButton />
      {/* Header with Login Button */}
      <div className="px-5 pt-4 flex justify-end">
        <button
          onClick={onLogin}
          className="flex items-center gap-2 px-4 py-2 text-[#7BB97A] hover:bg-[#F5FAF7] rounded-[16px] transition-all duration-200"
        >
          <LogIn size={18} />
          <span className="text-[14px] leading-[20px] font-medium font-['Inter']">
            Iniciar sesión
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8 flex flex-col">
        <div className="flex-1 flex flex-col justify-start pt-4">
          {/* Chef Image in Circle */}
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
            className="mb-6 flex justify-center"
          >
            <div className="relative w-[216px] h-[216px]">
              {/* Decorative rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-[#a6d49f] opacity-30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-8px] rounded-full border-2 border-dotted border-[#4e9643] opacity-20"
              />
              
              {/* Image container */}
              <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#a6d49f] to-[#4e9643] p-1 shadow-[0_8px_24px_rgba(78,150,67,0.25)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <img
                    src={"/logo.png"}
                    alt="Stressed chef with calculator"
                    className="w-full h-full object-cover text-center"
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          <h1 className="mb-5 text-[28px] leading-[36px] tracking-[-0.56px] font-semibold font-['Poppins'] text-[#1A1A1A] text-center">
            ¿Tu restaurante realmente gana dinero o solo 'vende mucho'?
          </h1>
          
          <p className="text-[#4D6B59] text-[16px] leading-[24px] font-normal font-['Inter'] text-center px-2">
            Descubre en solo 3 pasos cuanto te cuesta cada cada plato
          </p>
          
          <div className="mt-6">
            {/* Row 1 */}
            <div className="flex items-center gap-4 py-3.5">
              <img src="https://i.imgur.com/9Vtlo0l.png" alt="Chef" className="w-8 h-8 flex-shrink-0 object-contain" />
              <div className="flex-1">
                <p className="text-[#1A1A1A] text-[16px] leading-[24px] font-medium font-['Inter'] mb-0.5">
                  Sube tus platos
                </p>
                <p className="text-[#9FB3A8] text-[14px] leading-[20px] font-normal font-['Inter']">
                  Carga tus recetas o menú.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#CFE0D8]" />

            {/* Row 2 */}
            <div className="flex items-center gap-4 py-3.5">
              <img src="https://i.imgur.com/ozeuBQO.png" alt="Carrot" className="w-8 h-8 flex-shrink-0 object-contain" />
              <div className="flex-1">
                <p className="text-[#1A1A1A] text-[16px] leading-[24px] font-medium font-['Inter'] mb-0.5">
                  Agrega tus ingredientes
                </p>
                <p className="text-[#9FB3A8] text-[14px] leading-[20px] font-normal font-['Inter']">
                  Añade tus insumos y precios.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#CFE0D8]" />

            {/* Row 3 */}
            <div className="flex items-center gap-4 py-3.5">
              <img src="https://i.imgur.com/iIeYTTe.png" alt="Money" className="w-8 h-8 flex-shrink-0 object-contain" />
              <div className="flex-1">
                <p className="text-[#1A1A1A] text-[16px] leading-[24px] font-medium font-['Inter'] mb-0.5">
                  Descubre tus costos
                </p>
                <p className="text-[#9FB3A8] text-[14px] leading-[20px] font-normal font-['Inter']">
                  Ve tu rentabilidad en segundos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={onStart}
          className="w-full h-[48px] px-6 rounded-[16px] bg-gradient-to-r from-[#A6D49F] to-[#7BB97A] text-white font-medium font-['Inter'] text-[16px] leading-[24px] shadow-[0_4px_12px_rgba(16,24,40,0.08)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.12)] transition-all duration-200 active:scale-[0.98]"
        >
          Empieza ahora
        </Button>
      </div>
    </div>
  );
}
