/**
 * Country-level landing-page metadata for programmatic SEO.
 * One indexable page per country at /ship-to/:slug.
 *
 * Copy is in English (the company's primary export language) but every
 * page is uniquely tailored: port of entry, currency, regulator, customs
 * regime, lead time, and FAQ are all country-specific so the pages do
 * not look templated to search engines or buyers.
 */

export interface CountryContent {
  slug: string;
  name: string;
  flag: string;
  region: "north-america" | "europe" | "middle-east" | "asia" | "africa" | "latin-america" | "oceania";
  currency: string;
  port: string;            // primary port / hub of entry
  regulator: string;       // local chemical regulator / customs body
  framework: string;       // governing regulation (e.g. REACH, TSCA)
  leadTime: string;        // realistic delivery window
  incoterms: string;       // recommended incoterms
  language: string;        // local business language (for SDS line)
  notes?: string;          // extra positioning line shown in hero
}

const EU = (
  slug: string,
  name: string,
  flag: string,
  port: string,
  language: string,
  leadTime = "5–10 business days from EU stock",
): CountryContent => ({
  slug,
  name,
  flag,
  region: "europe",
  currency: "EUR",
  port,
  regulator: "ECHA (European Chemicals Agency) + national customs",
  framework: "REACH (EC 1907/2006) and CLP (EC 1272/2008)",
  leadTime,
  incoterms: "DAP, DDP, FCA, CIF",
  language,
});

export const COUNTRIES: CountryContent[] = [
  // North America
  {
    slug: "usa",
    name: "United States",
    flag: "🇺🇸",
    region: "north-america",
    currency: "USD",
    port: "Houston, Los Angeles, Newark, Savannah",
    regulator: "EPA + US Customs and Border Protection (CBP)",
    framework: "TSCA (Toxic Substances Control Act) and OSHA HazCom 2012",
    leadTime: "3–7 business days domestic, 10–18 days inbound",
    incoterms: "FOB, CIF, DAP, DDP",
    language: "English",
    notes: "Verified US business identity. Domestic warehousing for fast OSHA-compliant fulfillment.",
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "🇨🇦",
    region: "north-america",
    currency: "CAD",
    port: "Vancouver, Montreal, Toronto, Halifax",
    regulator: "Health Canada + Canada Border Services Agency (CBSA)",
    framework: "CEPA 1999, WHMIS 2015 (GHS-aligned), Transport of Dangerous Goods Act",
    leadTime: "5–10 business days from US warehouse",
    incoterms: "DAP, DDP, FOB",
    language: "English & French",
  },
  // Oceania
  {
    slug: "australia",
    name: "Australia",
    flag: "🇦🇺",
    region: "oceania",
    currency: "AUD",
    port: "Sydney, Melbourne, Brisbane, Fremantle",
    regulator: "AICIS (Australian Industrial Chemicals Introduction Scheme)",
    framework: "AICIS, Safe Work Australia GHS 7, ADG Code",
    leadTime: "14–24 days sea / 5–8 days air",
    incoterms: "CIF, DAP, DDP",
    language: "English",
  },
  // Middle East
  {
    slug: "saudi-arabia",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    region: "middle-east",
    currency: "SAR",
    port: "Jeddah Islamic Port, King Abdulaziz Port (Dammam)",
    regulator: "SASO + SABER conformity platform",
    framework: "SASO technical regulations, GSO 2423 (GHS)",
    leadTime: "10–18 business days",
    incoterms: "CIF, CFR, DAP",
    language: "Arabic & English",
    notes: "SABER certificate of conformity included for every regulated shipment.",
  },
  {
    slug: "bahrain",
    name: "Bahrain",
    flag: "🇧🇭",
    region: "middle-east",
    currency: "BHD",
    port: "Khalifa Bin Salman Port",
    regulator: "Supreme Council for Environment + Bahrain Customs",
    framework: "GSO 2423 (GHS), GCC Conformity",
    leadTime: "10–16 business days via Jebel Ali transhipment",
    incoterms: "CIF, DAP",
    language: "Arabic & English",
  },
  // Latin America
  {
    slug: "brazil",
    name: "Brazil",
    flag: "🇧🇷",
    region: "latin-america",
    currency: "BRL",
    port: "Santos, Paranaguá, Itajaí, Rio de Janeiro",
    regulator: "ANVISA, IBAMA, Receita Federal (RFB)",
    framework: "ABNT NBR 14725 (GHS), DI/LI import licensing",
    leadTime: "21–35 days sea including customs clearance",
    incoterms: "CIF, CFR, DAP",
    language: "Portuguese",
    notes: "DI/LI documentation prepared in Portuguese, including IBAMA registration where required.",
  },
  // Europe — requested countries first
  EU("germany", "Germany", "🇩🇪", "Hamburg, Bremerhaven", "German"),
  EU("netherlands", "Netherlands", "🇳🇱", "Rotterdam, Amsterdam", "Dutch"),
  EU("belgium", "Belgium", "🇧🇪", "Antwerp, Zeebrugge", "Dutch, French"),
  EU("spain", "Spain", "🇪🇸", "Valencia, Algeciras, Barcelona", "Spanish"),
  EU("luxembourg", "Luxembourg", "🇱🇺", "Antwerp / Mertert inland", "French, German"),
  // Rest of EU + EFTA + UK
  EU("austria", "Austria", "🇦🇹", "Hamburg → rail to Vienna", "German"),
  EU("bulgaria", "Bulgaria", "🇧🇬", "Varna, Burgas", "Bulgarian"),
  EU("croatia", "Croatia", "🇭🇷", "Rijeka", "Croatian"),
  EU("cyprus", "Cyprus", "🇨🇾", "Limassol", "Greek, English"),
  EU("czech-republic", "Czech Republic", "🇨🇿", "Hamburg → rail to Prague", "Czech"),
  EU("denmark", "Denmark", "🇩🇰", "Aarhus, Copenhagen", "Danish"),
  EU("estonia", "Estonia", "🇪🇪", "Tallinn (Muuga)", "Estonian"),
  EU("finland", "Finland", "🇫🇮", "Helsinki, Hamina-Kotka", "Finnish"),
  EU("france", "France", "🇫🇷", "Le Havre, Marseille-Fos", "French"),
  EU("greece", "Greece", "🇬🇷", "Piraeus, Thessaloniki", "Greek"),
  EU("hungary", "Hungary", "🇭🇺", "Koper → rail to Budapest", "Hungarian"),
  EU("ireland", "Ireland", "🇮🇪", "Dublin, Cork", "English"),
  EU("italy", "Italy", "🇮🇹", "Genoa, La Spezia, Trieste", "Italian"),
  EU("latvia", "Latvia", "🇱🇻", "Riga", "Latvian"),
  EU("lithuania", "Lithuania", "🇱🇹", "Klaipėda", "Lithuanian"),
  EU("malta", "Malta", "🇲🇹", "Marsaxlokk Freeport", "English, Maltese"),
  EU("poland", "Poland", "🇵🇱", "Gdańsk, Gdynia", "Polish"),
  EU("portugal", "Portugal", "🇵🇹", "Lisbon, Sines, Leixões", "Portuguese"),
  EU("romania", "Romania", "🇷🇴", "Constanța", "Romanian"),
  EU("slovakia", "Slovakia", "🇸🇰", "Koper → rail to Bratislava", "Slovak"),
  EU("slovenia", "Slovenia", "🇸🇮", "Koper", "Slovenian"),
  EU("sweden", "Sweden", "🇸🇪", "Gothenburg", "Swedish"),
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    region: "europe",
    currency: "GBP",
    port: "Felixstowe, Southampton, London Gateway",
    regulator: "HSE (Health and Safety Executive) + HMRC",
    framework: "UK REACH, GB CLP, CDG (transport of dangerous goods)",
    leadTime: "7–14 business days",
    incoterms: "DAP, DDP, CIF",
    language: "English",
  },
  {
    slug: "norway",
    name: "Norway",
    flag: "🇳🇴",
    region: "europe",
    currency: "NOK",
    port: "Oslo, Bergen, Stavanger",
    regulator: "Norwegian Environment Agency (Miljødirektoratet)",
    framework: "REACH (EEA adoption), CLP, ADR",
    leadTime: "8–14 business days",
    incoterms: "DAP, DDP, CIF",
    language: "Norwegian",
  },
  {
    slug: "switzerland",
    name: "Switzerland",
    flag: "🇨🇭",
    region: "europe",
    currency: "CHF",
    port: "Basel (Rhine) / Rotterdam transhipment",
    regulator: "FOEN + Swissmedic",
    framework: "ChemO (Ordinance on Protection against Dangerous Substances), aligned with REACH/CLP",
    leadTime: "8–14 business days",
    incoterms: "DAP, DDP",
    language: "German, French, Italian",
  },
];

export const COUNTRY_MAP: Record<string, CountryContent> = Object.fromEntries(
  COUNTRIES.map((c) => [c.slug, c]),
);

export const COUNTRIES_BY_REGION: Record<string, CountryContent[]> = COUNTRIES.reduce(
  (acc, c) => {
    (acc[c.region] ||= []).push(c);
    return acc;
  },
  {} as Record<string, CountryContent[]>,
);

export const REGION_LABEL: Record<CountryContent["region"], string> = {
  "north-america": "North America",
  europe: "Europe",
  "middle-east": "Middle East",
  asia: "Asia",
  africa: "Africa",
  "latin-america": "Latin America",
  oceania: "Oceania",
};
