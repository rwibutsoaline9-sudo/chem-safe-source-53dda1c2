import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { X, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "promo-banner-dismissed-v1";
export const PROMO_CODE = "SAVE30";
export const PROMO_PERCENT = 30;
export const PROMO_STORAGE_KEY = "applied-promo-code";

/**
 * Sitewide promotional banner: 30% off, dismissible per-session.
 * Exposes a copyable promo code that auto-applies on the quote form.
 */
export const PromoBanner = () => {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVisible(sessionStorage.getItem(STORAGE_KEY) !== "1");
    // Auto-apply the promo so the quote form picks it up.
    sessionStorage.setItem(PROMO_STORAGE_KEY, PROMO_CODE);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      sessionStorage.setItem(PROMO_STORAGE_KEY, PROMO_CODE);
      setCopied(true);
      toast.success(`Promo code ${PROMO_CODE} copied — auto-applied at checkout`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy code");
    }
  };

  return (
    <div
      role="region"
      aria-label="Promotional offer"
      className="relative w-full bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground"
    >
      <div className="container mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium pr-8">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden />
        <span className="text-center">
          <span className="font-bold tracking-wide">{PROMO_PERCENT}% OFF</span>
          <span className="hidden sm:inline"> bulk orders worldwide</span> — use code
        </span>
        <button
          type="button"
          onClick={copyCode}
          aria-label={`Copy promo code ${PROMO_CODE}`}
          className="inline-flex items-center gap-1 rounded border border-primary-foreground/40 bg-primary-foreground/10 px-2 py-0.5 font-mono font-bold tracking-wider hover:bg-primary-foreground/20 transition"
        >
          {PROMO_CODE}
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
        <Link to="/contact" className="hidden sm:inline underline underline-offset-2 font-semibold hover:opacity-90">
          Request quote
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss promotional banner"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-primary-foreground/10 transition"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
