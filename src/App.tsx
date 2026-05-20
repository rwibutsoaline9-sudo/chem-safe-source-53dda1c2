import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import Safety from "./pages/Safety";
import ShippingPolicy from "./pages/ShippingPolicy";
import TermsOfService from "./pages/TermsOfService";
import Checkout from "./pages/Checkout";
import RegionLanding from "./pages/RegionLanding";
import { SiteChat } from "./components/SiteChat";
import { PromoBanner } from "./components/PromoBanner";
import BulkImport from "./pages/admin/BulkImport";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import Settings from "./pages/admin/Settings";
import StripeSettings from "./pages/admin/StripeSettings";
import Payments from "./pages/admin/Payments";
import AdminMessages from "./pages/admin/Messages";
import AdminLiveChat from "./pages/admin/LiveChat";

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <PromoBanner />
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <SiteChat />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes with header/footer */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/safety" element={<PublicLayout><Safety /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* Legal/Policy pages */}
            <Route path="/terms" element={<PublicLayout><TermsOfService /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
            <Route path="/shipping" element={<PublicLayout><ShippingPolicy /></PublicLayout>} />

            {/* Regional landing pages (localized SEO) */}
            <Route path="/regions/:regionSlug" element={<PublicLayout><RegionLanding /></PublicLayout>} />

            {/* Checkout */}
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />

            {/* Auth route (no header/footer) */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes (protected, no header/footer - has its own layout) */}
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/bulk-import" element={<ProtectedRoute><BulkImport /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin/stripe-settings" element={<ProtectedRoute><StripeSettings /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
            
            {/* 404 */}
            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
