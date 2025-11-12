import { Button } from "./ui/button";
import { motion } from "motion/react";
import { MINIAPP_COPY } from "../copy/costoComidaMiniApp";

const COPY = MINIAPP_COPY.directa; // ⬅️ elige: directa | amigable | motivadora

interface ConfirmationModalProps {
  name: string;
  onClose: () => void;
}

export function ConfirmationModal({ name, onClose }: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-5">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#fcfdfb] rounded-2xl p-8 shadow-2xl"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-[#A6D49F]/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>

        {/* Title */}
        <h2 
          className="mb-6 text-center font-['Roboto_Serif',serif] text-[26px] text-[#1d281b] tracking-[-0.4px] leading-[1.3]"
          style={{ fontVariationSettings: "'GRAD' 0, 'wdth' 100", fontWeight: 600 }}
        >
          {COPY.confirm.title(name)}
        </h2>

        {/* Subtitle */}
        <p className="mb-8 text-center text-[#1d281b] text-[17px] font-['Public_Sans',sans-serif] leading-relaxed">
          {COPY.confirm.subtitle}
        </p>

        {/* Close Button */}
        <Button
          onClick={onClose}
          className="w-full h-[52px] bg-[#A6D49F] hover:bg-[#7BB97A] text-white rounded-[48px] transition-all duration-200 font-['Plus_Jakarta_Sans',sans-serif] text-[16px] shadow-[0_4px_16px_rgba(166,212,159,0.3)] hover:shadow-[0_6px_20px_rgba(123,185,122,0.4)] active:scale-[0.98]"
        >
          {COPY.confirm.cta}
        </Button>
      </motion.div>
    </div>
  );
}
