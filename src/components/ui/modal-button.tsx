"use client";

import { motion } from "framer-motion";
import { buttonHoverState, dangerButtonHoverState } from "@/lib/animations";

interface ModalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export function ModalButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
  className = "",
}: ModalButtonProps) {
  const isDanger = variant === "danger";
  const isPrimary = variant === "primary";

  const getColor = () => {
    if (disabled) return "var(--text-muted)";
    if (isDanger || isPrimary) return "var(--text-primary)";
    return "var(--text-secondary)";
  };

  const getBackgroundColor = () => {
    if (disabled) return "var(--bg-disabled)";
    if (isDanger) return "rgba(239,68,68,0.3)";
    if (isPrimary) return "var(--bg-button)";
    return "var(--bg-input)";
  };

  const getHoverState = () => {
    if (disabled) return {};
    if (isDanger) return dangerButtonHoverState;
    return buttonHoverState;
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium ${className}`}
      style={{
        color: getColor(),
        backgroundColor: getBackgroundColor(),
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      whileHover={getHoverState()}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.button>
  );
}
