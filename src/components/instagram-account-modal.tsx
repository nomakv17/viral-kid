"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Copy, Check, ExternalLink } from "lucide-react";

interface InstagramAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

interface InstagramCredentialsState {
  appId: string;
  appSecret: string;
  instagramUsername?: string;
  facebookPageName?: string;
  isConnected: boolean;
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
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const defaultShadow =
    "0 0px 0px rgba(0,0,0,0), inset 0 1px 2px rgba(0,0,0,0.2), inset 0 0px 0px rgba(255,255,255,0)";
  const hoverShadow =
    "0 2px 8px rgba(0,0,0,0.3), inset 0 0px 0px rgba(0,0,0,0), inset 0 1px 0 rgba(255,255,255,0.1)";

  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium ${className}`}
      style={{
        color: disabled
          ? "rgba(255,255,255,0.3)"
          : isHovered
            ? "rgba(255,255,255,1)"
            : isPrimary
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.5)",
        backgroundColor: disabled
          ? "rgba(255,255,255,0.02)"
          : isPressed
            ? "rgba(255,255,255,0.05)"
            : isHovered
              ? "rgba(255,255,255,0.15)"
              : isPrimary
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.05)",
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

function CredentialInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "password";
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold tracking-wide text-white/90"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-4 py-3 text-white/90 outline-none backdrop-blur-xl"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,255,255,0.1)",
          transition: "border-color 0.3s ease, background 0.3s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.3)";
          e.target.style.background = "rgba(255,255,255,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
          e.target.style.background = "rgba(255,255,255,0.05)";
        }}
      />
    </div>
  );
}

export function InstagramAccountModal({
  isOpen,
  onClose,
  accountId,
}: InstagramAccountModalProps) {
  const [credentials, setCredentials] = useState<InstagramCredentialsState>({
    appId: "",
    appSecret: "",
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("");

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCallbackUrl(`${window.location.origin}/api/instagram/callback`);
    }
  }, []);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
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

  useEffect(() => {
    if (isOpen && accountId) {
      setIsLoading(true);
      fetch(`/api/instagram/credentials?accountId=${accountId}`)
        .then((res) => {
          if (!res.ok) throw new Error("API error");
          return res.json();
        })
        .then((data) => {
          if (!data.error) {
            setCredentials({
              appId: data.appId || "",
              appSecret: data.appSecret || "",
              instagramUsername: data.instagramUsername,
              facebookPageName: data.facebookPageName,
              isConnected: !!data.isConnected,
            });
          }
        })
        .catch(() => {
          // Database not available - use defaults
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, accountId]);

  const handleSave = async () => {
    if (!accountId) return;

    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/instagram/credentials?accountId=${accountId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appId: credentials.appId,
            appSecret: credentials.appSecret,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save credentials");
      }

      onClose();
    } catch (err) {
      console.error("Failed to save credentials:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnect = async () => {
    if (!accountId) return;

    setIsConnecting(true);
    try {
      const res = await fetch(`/api/instagram/auth?accountId=${accountId}`);
      const data = await res.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error("Failed to get auth URL");
      }
    } catch (err) {
      console.error("Failed to initiate OAuth:", err);
      setIsConnecting(false);
    }
  };

  const handleCopyCallback = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const updateCredential = (key: "appId" | "appSecret") => {
    return (value: string) => {
      setCredentials((prev) => ({ ...prev, [key]: value }));
    };
  };

  if (!shouldRender) return null;

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
        className="relative z-10 w-full max-w-2xl rounded-2xl border backdrop-blur-xl"
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
        <div
          className="flex items-center justify-between border-b border-white/10 px-6 py-4"
          style={{
            background:
              "linear-gradient(to bottom, rgba(30,30,30,0.98) 0%, rgba(25,25,25,0.98) 100%)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <h2 className="text-sm font-semibold tracking-wide text-white/90">
            Instagram Account
          </h2>
          <IconButton
            icon={<X className="h-4 w-4" />}
            onClick={onClose}
            label="Close"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading overlay with fade */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
            style={{
              opacity: isLoading ? 1 : 0,
              transition: "opacity 0.2s ease-out",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>

          {/* Content with fade */}
          <div
            style={{
              opacity: isLoading ? 0.3 : 1,
              transition: "opacity 0.2s ease-out",
            }}
          >
            <>
              {/* Connection Status */}
              {credentials.isConnected && (
                <div
                  className="mb-6 rounded-lg border px-4 py-3"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    borderColor: "rgba(34,197,94,0.3)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-white/90">
                      Connected as @{credentials.instagramUsername}
                      {credentials.facebookPageName &&
                        ` (via ${credentials.facebookPageName})`}
                    </span>
                  </div>
                </div>
              )}

              {/* Requirements Info */}
              <div
                className="mb-6 rounded-lg border px-4 py-3"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  borderColor: "rgba(251,191,36,0.3)",
                }}
              >
                <p className="text-sm text-white/80">
                  <strong>Requirements:</strong> Instagram Business or Creator
                  account linked to a Facebook Page. Personal accounts are not
                  supported by the Instagram API.
                </p>
              </div>

              {/* Meta App Credentials */}
              <div className="mb-6">
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-white/90">
                  Meta App Credentials
                </h3>
                <p className="mb-4 text-xs text-white/50">
                  Create a Meta App at developers.facebook.com and add
                  &quot;Facebook Login for Business&quot; product.
                </p>

                {/* Callback URL */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold tracking-wide text-white/70">
                    OAuth Redirect URI
                  </label>
                  <p className="mb-2 text-xs text-white/50">
                    Add this to your Facebook Login settings under Valid OAuth
                    Redirect URIs
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 overflow-hidden rounded-lg border px-4 py-3"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <code className="block truncate text-sm text-white/70">
                        {callbackUrl}
                      </code>
                    </div>
                    <IconButton
                      icon={
                        copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )
                      }
                      onClick={handleCopyCallback}
                      label="Copy redirect URI"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CredentialInput
                    id="appId"
                    label="App ID"
                    value={credentials.appId}
                    onChange={updateCredential("appId")}
                    placeholder="Enter Meta App ID..."
                  />

                  <CredentialInput
                    id="appSecret"
                    label="App Secret"
                    value={credentials.appSecret}
                    onChange={updateCredential("appSecret")}
                    placeholder="Enter App Secret..."
                    type="password"
                  />
                </div>

                <a
                  href="https://developers.facebook.com/apps/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300"
                  style={{ transition: "color 0.3s ease" }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Meta Developer Portal
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-white/10 pt-6">
                <ModalButton
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </ModalButton>
                <ModalButton
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="primary"
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Credentials"
                  )}
                </ModalButton>
                <ModalButton
                  onClick={handleConnect}
                  disabled={
                    isConnecting || !credentials.appId || !credentials.appSecret
                  }
                  variant="primary"
                  className="flex-1"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : credentials.isConnected ? (
                    "Reconnect"
                  ) : (
                    "Connect Account"
                  )}
                </ModalButton>
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
