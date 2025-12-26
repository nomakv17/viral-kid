"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

function ModalButton({
  children,
  onClick,
  disabled,
  variant = "secondary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const defaultShadow =
    "0 0px 0px rgba(0,0,0,0), inset 0 1px 2px rgba(0,0,0,0.2), inset 0 0px 0px rgba(255,255,255,0)";
  const hoverShadow =
    "0 2px 8px rgba(0,0,0,0.3), inset 0 0px 0px rgba(0,0,0,0), inset 0 1px 0 rgba(255,255,255,0.1)";

  const isDanger = variant === "danger";
  const isPrimary = variant === "primary";

  const getColor = () => {
    if (disabled) return "rgba(255,255,255,0.3)";
    if (isHovered)
      return isDanger ? "rgba(255,255,255,1)" : "rgba(255,255,255,1)";
    if (isDanger) return "rgba(255,255,255,0.9)";
    if (isPrimary) return "rgba(255,255,255,0.9)";
    return "rgba(255,255,255,0.5)";
  };

  const getBgColor = () => {
    if (disabled) return "rgba(255,255,255,0.02)";
    if (isPressed)
      return isDanger ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.05)";
    if (isHovered)
      return isDanger ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.15)";
    if (isDanger) return "rgba(239,68,68,0.3)";
    if (isPrimary) return "rgba(255,255,255,0.1)";
    return "rgba(255,255,255,0.05)";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium ${className}`}
      style={{
        color: getColor(),
        backgroundColor: getBgColor(),
        boxShadow: isHovered && !disabled ? hoverShadow : defaultShadow,
        transform: isPressed && !disabled ? "scale(0.98)" : "scale(1)",
        transition:
          "color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {children}
    </button>
  );
}

function IconButton({
  icon,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const defaultShadow =
    "0 0px 0px rgba(0,0,0,0), inset 0 1px 2px rgba(0,0,0,0.2), inset 0 0px 0px rgba(255,255,255,0)";
  const hoverShadow =
    "0 2px 8px rgba(0,0,0,0.3), inset 0 0px 0px rgba(0,0,0,0), inset 0 1px 0 rgba(255,255,255,0.1)";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-lg p-2"
      style={{
        color: isHovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.5)",
        backgroundColor: isPressed
          ? "rgba(255,255,255,0.05)"
          : isHovered
            ? "rgba(255,255,255,0.1)"
            : "rgba(255,255,255,0)",
        boxShadow: isHovered ? hoverShadow : defaultShadow,
        transform: isPressed ? "scale(0.95)" : "scale(1)",
        transition:
          "color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease, transform 0.15s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Animation pattern used across all modals
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return;
    }
    setIsVisible(false);
    const timer = setTimeout(() => {
      setShouldRender(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!shouldRender) return null;

  const iconColor = variant === "danger" ? "text-red-500" : "text-yellow-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.2s ease-out",
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border backdrop-blur-xl"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          borderColor: "rgba(255,255,255,0.1)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)",
          transform: isVisible
            ? "scale(1) translateY(0)"
            : "scale(0.95) translateY(10px)",
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-semibold tracking-wide text-white/90">
            {title}
          </h2>
          <IconButton
            icon={<X className="h-4 w-4" />}
            onClick={onClose}
            label="Close"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 flex items-start gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconColor}`}
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="text-sm leading-relaxed text-white/70">{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <ModalButton onClick={onClose} variant="secondary">
              {cancelLabel}
            </ModalButton>
            <ModalButton onClick={handleConfirm} variant="danger">
              {confirmLabel}
            </ModalButton>
          </div>
        </div>
      </div>
    </div>
  );
}
