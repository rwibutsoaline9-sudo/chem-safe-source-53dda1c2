import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

const STORAGE_KEY = "promo-banner-dismissed-v1";

/**
 * Sitewide promotional banner: 30% off, dismissible per-session.
 */
export const PromoBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVisible(sessionStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Promotional offer"
      className="relative w-full bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground"
    >
      <div className="container mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden />
        <span className="text-center">
          <span className="font-bold tracking-wide">30% OFF</span>
          <span className="hidden sm:inline"> all bulk orders worldwide —</span>
          <span className="sm:hidden"> bulk orders —</span>{" "}
          <Link to="/products" className="underline underline-offset-2 font-semibold hover:opacity-90">
            Shop now
          </Link>
        </span>
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
