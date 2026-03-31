import { MessageCircle } from "lucide-react";

export const WhatsAppButton = () => {
  const phoneNumber = "16122931250";
  const message = encodeURIComponent(
    "Hello ChemSupply Pro, I'm interested in your chemical products. Could you help me with a quote?"
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="hidden sm:inline text-sm font-medium">Chat with us</span>
    </a>
  );
};
