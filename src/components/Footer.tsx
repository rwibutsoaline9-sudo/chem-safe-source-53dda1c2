import { FlaskConical, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-primary mb-4">
              <FlaskConical className="w-6 h-6" />
              <span>ChemSupply Pro</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Trusted B2B supplier of high-quality industrial chemicals. Serving businesses across manufacturing, agriculture, mining, and pharmaceuticals since 2003.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span>30 E 7th St, St Paul, MN 55101<br />Minneapolis–St. Paul Metro Area</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+16122931250" className="hover:text-primary transition-colors">+1 (612) 293-1250</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:support@drchems.com" className="hover:text-primary transition-colors">support@drchems.com</a>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Fertilizers</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Industrial Chemicals</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Organic Chemicals</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/safety" className="hover:text-primary transition-colors">Safety & Compliance</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact / Request Quote</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Regions Served</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/regions/europe" className="hover:text-primary transition-colors">🇪🇺 Europa (DE)</Link></li>
              <li><Link to="/regions/middle-east" className="hover:text-primary transition-colors">🌍 الشرق الأوسط (AR)</Link></li>
              <li><Link to="/regions/asia" className="hover:text-primary transition-colors">🌏 亚洲 (ZH)</Link></li>
              <li><Link to="/regions/africa" className="hover:text-primary transition-colors">🌍 Afrique (FR)</Link></li>
              <li><Link to="/regions/latin-america" className="hover:text-primary transition-colors">🌎 América Latina (ES)</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
            </ul>
            <h3 className="font-semibold mt-6 mb-3">Certifications</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>✓ ISO 9001:2015 Certified</li>
              <li>✓ GMP Compliant Facility</li>
              <li>✓ FDA Registered</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Disclaimer:</strong> ChemSupply Pro supplies exclusively to verified businesses. All orders require business verification. Always consult product SDS and follow local regulations. Restricted chemicals require proper licensing and documentation.
          </p>
          <p className="text-sm text-muted-foreground text-center mt-4">
            © {new Date().getFullYear()} ChemSupply Pro — 30 E 7th St, St Paul, MN 55101 — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
