/**
 * Localized regional landing-page copy.
 * Each region has its own slug, language, direction, and translated content.
 * Hreflang alternates are computed from this list.
 */

export type RegionId = "europe" | "middle-east" | "asia" | "africa" | "latin-america";

export interface RegionContent {
  id: RegionId;
  slug: string;             // URL slug under /regions/
  lang: string;             // BCP-47 (de, ar, zh-CN, fr, es)
  hreflang: string;         // hreflang attribute (de-DE, ar, zh-CN, fr, es-419)
  dir: "ltr" | "rtl";
  name: string;             // English region name (admin/sitemap)
  localizedName: string;    // Region name in local language
  flag: string;             // Emoji flag
  currency: string;
  hub: string;              // Primary logistics hub
  // SEO
  seoTitle: string;         // <60 chars
  seoDescription: string;   // <160 chars
  // Hero
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  // Sections
  complianceTitle: string;
  complianceIntro: string;
  complianceItems: { title: string; body: string }[];
  safetyTitle: string;
  safetyIntro: string;
  safetyItems: { title: string; body: string }[];
  shippingTitle: string;
  shippingItems: { title: string; body: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  closingTitle: string;
  closingBody: string;
}

export const REGIONS: Record<RegionId, RegionContent> = {
  europe: {
    id: "europe",
    slug: "europe",
    lang: "de",
    hreflang: "de-DE",
    dir: "ltr",
    name: "Europe",
    localizedName: "Europa",
    flag: "🇪🇺",
    currency: "EUR",
    hub: "Rotterdam · Hamburg · Antwerpen",
    seoTitle: "Industriechemikalien für Europa — ChemSupply Pro",
    seoDescription: "REACH- und CLP-konforme Industriechemikalien für die EU. Lieferung über Rotterdam, Hamburg, Antwerpen. Bulk-Angebote und SDB in 24 h.",
    heroEyebrow: "🇪🇺 Europa",
    heroTitle: "Industriechemikalien für Europa — REACH-konform, in 24 Stunden angeboten",
    heroSubtitle: "Wir beliefern Hersteller, Pharma- und Agrarunternehmen in der gesamten EU mit CLP-gekennzeichneten Industriechemikalien. Versand über die wichtigsten EU-Häfen, Sicherheitsdatenblätter (SDB) auf Deutsch, Englisch und Französisch.",
    ctaPrimary: "Angebot anfordern",
    ctaSecondary: "Katalog ansehen",
    complianceTitle: "Compliance: REACH, CLP & ADR",
    complianceIntro: "Jede Lieferung in die EU erfüllt vollständig die geltenden Chemikalien­vorschriften.",
    complianceItems: [
      { title: "REACH-Registrierung", body: "Alle gelieferten Stoffe sind unter REACH (EG Nr. 1907/2006) registriert oder vorregistriert. Registrierungs­nummer auf Anfrage erhältlich." },
      { title: "CLP-Kennzeichnung", body: "GHS-/CLP-konforme Etiketten (EG Nr. 1272/2008) in 24 EU-Amtssprachen. Piktogramme, H-/P-Sätze und Signalwort gemäß letzter ATP." },
      { title: "ADR-Transport", body: "Gefahrgüter werden gemäß ADR (Straße), RID (Schiene) und IMDG (See) verpackt, klassifiziert und deklariert. Beförderungspapiere in der Landessprache des Empfängers." },
    ],
    safetyTitle: "Sicherheit & Sicherheitsdatenblätter",
    safetyIntro: "Sicherheitsdatenblätter (SDB) nach Anhang II der REACH-Verordnung — kostenlos für geprüfte Geschäftskunden.",
    safetyItems: [
      { title: "16-Abschnitt-SDB", body: "Vollständige Sicherheitsdatenblätter in 16 Abschnitten, lokalisiert nach Bestimmungsland (DE, FR, ES, IT, NL, PL u. a.)." },
      { title: "Expositionsszenarien", body: "Für registrierte Stoffe stellen wir auf Anfrage Expositionsszenarien gemäß Artikel 31 REACH zur Verfügung." },
      { title: "Notrufnummer 24/7", body: "Mehrsprachige Notfallhotline für Vorfälle während Transport oder Lagerung — verfügbar 24 Stunden, 7 Tage die Woche." },
    ],
    shippingTitle: "Versand & Logistik in der EU",
    shippingItems: [
      { title: "Häfen & Hubs", body: "Rotterdam, Hamburg, Antwerpen, Le Havre, Genua. Direkter Zollabwicklungs-Service für DDP- und DAP-Lieferungen." },
      { title: "Incoterms 2020", body: "EXW, FOB, CIF, DAP, DDP — frei wählbar je nach Vereinbarung." },
      { title: "Lieferzeit", body: "Lagerware in 5–10 Werktagen ab Versand, Sonderbestellungen 3–6 Wochen." },
    ],
    faqTitle: "Häufig gestellte Fragen — EU",
    faq: [
      { q: "Sind alle Ihre Produkte REACH-registriert?", a: "Ja. Alle in die EU exportierten Stoffe sind entweder vollständig registriert oder fallen unter eine Ausnahme. Registrierungsnummern werden auf Anfrage bereitgestellt." },
      { q: "Liefern Sie Sicherheitsdatenblätter auf Deutsch?", a: "Ja. SDB werden in allen 24 EU-Amtssprachen geliefert, standardmäßig in der Sprache des Bestimmungslandes." },
      { q: "Wie läuft die Zollabwicklung ab?", a: "Bei DDP-Lieferungen übernehmen wir die komplette Zollabwicklung, Einfuhrumsatzsteuer und EORI-Anmeldung. Bei FOB/CIF kümmert sich der Käufer um die Einfuhr." },
    ],
    closingTitle: "Bereit für Ihre nächste Bestellung in Europa?",
    closingBody: "Fordern Sie ein unverbindliches Angebot an — Antwort innerhalb von 24 Geschäftsstunden, mit COA und SDB.",
  },

  "middle-east": {
    id: "middle-east",
    slug: "middle-east",
    lang: "ar",
    hreflang: "ar",
    dir: "rtl",
    name: "Middle East",
    localizedName: "الشرق الأوسط",
    flag: "🌍",
    currency: "USD / AED / SAR",
    hub: "Jebel Ali · Dammam · Sohar",
    seoTitle: "مواد كيميائية صناعية للشرق الأوسط — ChemSupply Pro",
    seoDescription: "توريد مواد كيميائية صناعية متوافقة مع GSO و SASO إلى دول الخليج. شحن عبر جبل علي والدمام وصحار. عروض أسعار خلال 24 ساعة.",
    heroEyebrow: "🌍 الشرق الأوسط",
    heroTitle: "موردك الموثوق للمواد الكيميائية الصناعية في الشرق الأوسط",
    heroSubtitle: "نخدم المصانع وشركات النفط والغاز والزراعة والأدوية في دول مجلس التعاون الخليجي والشام. شحن عبر موانئ جبل علي والدمام وصحار، مع توثيق متوافق مع GSO و SASO.",
    ctaPrimary: "اطلب عرض سعر",
    ctaSecondary: "تصفح المنتجات",
    complianceTitle: "الامتثال: GSO، SASO، ECHA",
    complianceIntro: "كل شحنة إلى منطقة الخليج تستوفي اللوائح المحلية لاستيراد المواد الكيميائية.",
    complianceItems: [
      { title: "معايير GSO", body: "ملصقات وتغليف مطابقة لمواصفات هيئة التقييس الخليجية (GSO 2423 لـ GHS) بالعربية والإنجليزية." },
      { title: "شهادات SASO و ECAS", body: "وثائق متطلبات SABER (السعودية)، ECAS (الإمارات)، GCC Conformity متاحة عند الطلب." },
      { title: "النقل البري والبحري", body: "تصنيف وتعبئة البضائع الخطرة وفق ADR و IMDG. وثائق نقل بالعربية والإنجليزية." },
    ],
    safetyTitle: "السلامة وصحائف بيانات السلامة",
    safetyIntro: "نوفر صحائف بيانات السلامة (SDS) المتوافقة مع GHS مجاناً لجميع العملاء التجاريين المعتمدين.",
    safetyItems: [
      { title: "SDS باللغة العربية", body: "صحائف بيانات السلامة من 16 قسماً، باللغتين العربية والإنجليزية، متوافقة مع GHS Rev. 9." },
      { title: "شهادة التحليل (COA)", body: "تُرفق مع كل دفعة، موقّعة من مدير الجودة وتتضمن الفحوصات الفيزيائية والكيميائية الكاملة." },
      { title: "دعم الطوارئ", body: "خط دعم طوارئ على مدار الساعة باللغة العربية والإنجليزية لحوادث النقل والتخزين." },
    ],
    shippingTitle: "الشحن واللوجستيات في الخليج",
    shippingItems: [
      { title: "الموانئ الرئيسية", body: "جبل علي (الإمارات)، الدمام (السعودية)، صحار (عُمان)، الشويخ (الكويت)، حمد (قطر)." },
      { title: "Incoterms 2020", body: "FOB, CIF, CFR, DAP, DDP — قابلة للتفاوض حسب الطلب." },
      { title: "مدة التسليم", body: "5–12 يوم عمل للمنتجات المتوفرة، 4–6 أسابيع للطلبات الخاصة." },
    ],
    faqTitle: "الأسئلة الشائعة — الشرق الأوسط",
    faq: [
      { q: "هل توفرون مستندات SABER للشحنات السعودية؟", a: "نعم. نوفر شهادات المطابقة والتسجيل في منصة SABER لكل المنتجات المعتمدة، بالتنسيق مع جهات الاختبار المعتمدة." },
      { q: "هل يمكنكم الشحن إلى موانئ الخليج عبر جبل علي؟", a: "نعم. جبل علي هو نقطة الترانزيت الرئيسية لدينا في المنطقة، مع إمكانية إعادة التصدير إلى السعودية وعُمان والكويت وقطر." },
      { q: "ما هي طرق الدفع المقبولة؟", a: "نقبل التحويل البنكي الدولي (T/T)، الاعتماد المستندي (L/C at sight)، وبطاقات الشركات عبر Stripe للطلبات الأصغر." },
    ],
    closingTitle: "جاهز لطلبك التالي في الخليج؟",
    closingBody: "احصل على عرض سعر مفصّل خلال 24 ساعة عمل، مع شهادة التحليل وصحيفة بيانات السلامة.",
  },

  asia: {
    id: "asia",
    slug: "asia",
    lang: "zh-CN",
    hreflang: "zh-CN",
    dir: "ltr",
    name: "Asia",
    localizedName: "亚洲",
    flag: "🌏",
    currency: "USD / CNY / INR",
    hub: "Shanghai · Singapore · Mumbai",
    seoTitle: "亚洲工业化学品供应商 — ChemSupply Pro",
    seoDescription: "面向亚洲市场的工业化学品大宗供应,符合 MEE、CCC、MSDS 标准。上海、新加坡、孟买港口直达,24 小时报价。",
    heroEyebrow: "🌏 亚洲",
    heroTitle: "面向亚洲市场的工业化学品大宗供应",
    heroSubtitle: "为中国、印度、东南亚和东亚的制造、制药、农业和电子行业供应高品质工业化学品。通过上海、新加坡、孟买等主要港口快速发货,提供符合当地法规的完整文件。",
    ctaPrimary: "申请报价",
    ctaSecondary: "查看产品目录",
    complianceTitle: "合规:MEE、CCC、IS、MSDS",
    complianceIntro: "我们的每一批发往亚洲的产品都符合目的国的化学品监管要求。",
    complianceItems: [
      { title: "中国 MEE / IECSC", body: "新化学物质环境管理登记,符合《化学物质环境信息统计调查制度》,在 IECSC 名录内或已完成新化学物质申报。" },
      { title: "印度 BIS / IS 标准", body: "符合 BIS 强制注册要求,提供 IS 标准检测报告,适用于印度市场的工业级产品。" },
      { title: "东南亚法规", body: "符合泰国 HSA、马来西亚 EHSNR、印尼 SIRS 等当地化学品申报要求,提供完整的产品技术文件。" },
    ],
    safetyTitle: "安全和 MSDS 文件",
    safetyIntro: "我们为所有通过认证的企业客户免费提供符合 GHS 的 MSDS 文件。",
    safetyItems: [
      { title: "中文 MSDS", body: "16 部分完整 MSDS,提供简体中文、英文及目的国语言版本,符合 GB/T 16483 标准。" },
      { title: "COA 分析证书", body: "每批次附带分析证书,涵盖含量、外观、水分、重金属等关键指标,由质量经理签发。" },
      { title: "24/7 紧急响应", body: "提供 24 小时多语种紧急响应热线,处理运输和储存过程中的事故。" },
    ],
    shippingTitle: "亚洲航运与物流",
    shippingItems: [
      { title: "主要港口", body: "上海、宁波、新加坡、巴生港、孟买、钦奈、海防、雅加达 — 全面覆盖亚洲主要贸易港口。" },
      { title: "Incoterms 2020", body: "支持 FOB、CIF、CFR、DAP、DDP 等多种贸易条款。" },
      { title: "交货周期", body: "现货产品 7–14 个工作日发货,定制订单 4–8 周。" },
    ],
    faqTitle: "常见问题 — 亚洲",
    faq: [
      { q: "你们能向中国海关提供 MSDS 和 COA 吗?", a: "可以。每批货物都附带中文/英文 MSDS 和 COA,符合中国海关清关要求,并可根据需要提供原产地证书。" },
      { q: "印度市场需要 BIS 认证吗?", a: "部分受管制的化学品需要 BIS 注册。我们会在报价阶段确认产品的监管状态,并协助提供所需文件。" },
      { q: "支持哪些付款方式?", a: "我们接受国际电汇 (T/T)、信用证 (L/C at sight) 和小额订单的企业信用卡支付(通过 Stripe)。" },
    ],
    closingTitle: "准备好您在亚洲的下一笔订单了吗?",
    closingBody: "在 24 个工作小时内获得详细报价,包含 COA 和 MSDS。",
  },

  africa: {
    id: "africa",
    slug: "africa",
    lang: "fr",
    hreflang: "fr",
    dir: "ltr",
    name: "Africa",
    localizedName: "Afrique",
    flag: "🌍",
    currency: "USD / EUR / XOF",
    hub: "Casablanca · Lagos · Durban",
    seoTitle: "Produits chimiques industriels pour l'Afrique — ChemSupply Pro",
    seoDescription: "Fourniture en gros de produits chimiques industriels pour l'Afrique. Conforme COMESA et SON. Expédition via Casablanca, Lagos, Durban. Devis sous 24 h.",
    heroEyebrow: "🌍 Afrique",
    heroTitle: "Produits chimiques industriels pour l'Afrique — conformes COMESA & SON",
    heroSubtitle: "Nous approvisionnons les industries minières, agricoles, pharmaceutiques et manufacturières d'Afrique du Nord, de l'Ouest, de l'Est et du Sud. Documentation complète en français et en anglais.",
    ctaPrimary: "Demander un devis",
    ctaSecondary: "Voir le catalogue",
    complianceTitle: "Conformité : SON, COMESA, SADC",
    complianceIntro: "Chaque expédition vers l'Afrique respecte les exigences réglementaires du pays de destination.",
    complianceItems: [
      { title: "SONCAP & PVoC", body: "Programmes de vérification de conformité (Nigeria SONCAP, Kenya PVoC, Tanzanie PVoC) gérés via Intertek, SGS ou Bureau Veritas." },
      { title: "Normes COMESA / SADC", body: "Étiquetage GHS conforme aux normes harmonisées de la COMESA et de la SADC, en français, anglais et portugais selon la destination." },
      { title: "Transport ADR / IMDG", body: "Classification, emballage et déclaration des matières dangereuses selon ADR (route) et IMDG (maritime). Documents de transport bilingues." },
    ],
    safetyTitle: "Sécurité et FDS",
    safetyIntro: "Fiches de Données de Sécurité (FDS) conformes au SGH, fournies gratuitement aux clients professionnels vérifiés.",
    safetyItems: [
      { title: "FDS en français", body: "Fiches de Données de Sécurité en 16 sections, en français, anglais, portugais et arabe selon le pays de destination." },
      { title: "Certificat d'analyse (COA)", body: "Joint à chaque lot, signé par notre responsable qualité, avec tous les tests physico-chimiques pertinents." },
      { title: "Assistance d'urgence 24/7", body: "Hotline d'urgence multilingue (FR/EN/PT) pour les incidents de transport et de stockage, disponible 24 heures sur 24." },
    ],
    shippingTitle: "Expédition et logistique en Afrique",
    shippingItems: [
      { title: "Ports principaux", body: "Casablanca, Tanger Med, Dakar, Abidjan, Lagos (Apapa/Tin Can), Tema, Mombasa, Dar es Salaam, Durban, Le Cap." },
      { title: "Incoterms 2020", body: "EXW, FOB, CIF, CFR, DAP, DDP — selon vos besoins logistiques." },
      { title: "Délais de livraison", body: "Produits en stock : 14–28 jours selon la destination. Commandes spéciales : 6–10 semaines." },
    ],
    faqTitle: "Questions fréquentes — Afrique",
    faq: [
      { q: "Gérez-vous le processus SONCAP pour le Nigeria ?", a: "Oui. Nous coordonnons l'inspection PVoC avec Intertek ou SGS au port de départ et fournissons le certificat SONCAP avant expédition." },
      { q: "Pouvez-vous livrer dans les pays enclavés (Mali, Burkina, Tchad) ?", a: "Oui. Nous organisons le transit via les ports d'Abidjan, Dakar ou Tema, avec transport routier ou ferroviaire jusqu'à destination." },
      { q: "Quels moyens de paiement acceptez-vous ?", a: "Virement bancaire international (T/T), lettre de crédit (L/C à vue), et cartes corporate via Stripe pour les commandes inférieures à 10 000 USD." },
    ],
    closingTitle: "Prêt pour votre prochaine commande en Afrique ?",
    closingBody: "Recevez un devis détaillé sous 24 heures ouvrées, accompagné du COA et de la FDS.",
  },

  "latin-america": {
    id: "latin-america",
    slug: "latin-america",
    lang: "es",
    hreflang: "es-419",
    dir: "ltr",
    name: "Latin America",
    localizedName: "América Latina",
    flag: "🌎",
    currency: "USD / MXN / BRL",
    hub: "Veracruz · Santos · Callao",
    seoTitle: "Productos químicos industriales para Latinoamérica — ChemSupply Pro",
    seoDescription: "Suministro a granel de químicos industriales para Latinoamérica. Cumple NOM, ANVISA y SAG. Envíos vía Veracruz, Santos, Callao. Cotización en 24 h.",
    heroEyebrow: "🌎 América Latina",
    heroTitle: "Químicos industriales para América Latina — conformes NOM, ANVISA y Mercosur",
    heroSubtitle: "Abastecemos a las industrias de manufactura, minería, agricultura y farmacéutica en México, Brasil, los países andinos y el Cono Sur. Documentación completa en español y portugués.",
    ctaPrimary: "Solicitar cotización",
    ctaSecondary: "Ver catálogo",
    complianceTitle: "Cumplimiento: NOM, ANVISA, SAG, Mercosur",
    complianceIntro: "Cada envío a Latinoamérica cumple con las regulaciones químicas y de aduanas del país de destino.",
    complianceItems: [
      { title: "NOM-018 (México)", body: "Etiquetado conforme a NOM-018-STPS (SGA), hojas de datos de seguridad (HDS) en español mexicano y registro en el padrón de importadores cuando aplica." },
      { title: "ANVISA & IBAMA (Brasil)", body: "Apoyo a la importación con DI/LI, etiquetado en portugués, registros ANVISA para productos farmacéuticos e IBAMA para químicos controlados." },
      { title: "Mercosur & CAN", body: "Cumplimiento del Reglamento Técnico Mercosur (etiquetado GHS) y de la Comunidad Andina (Colombia, Perú, Ecuador, Bolivia)." },
    ],
    safetyTitle: "Seguridad y Hojas de Datos de Seguridad",
    safetyIntro: "Hojas de Datos de Seguridad (HDS / FISPQ) conformes al SGA, gratuitas para clientes empresariales verificados.",
    safetyItems: [
      { title: "HDS en español y portugués", body: "Hojas de seguridad de 16 secciones en español neutro, español mexicano y portugués brasileño (FISPQ según ABNT NBR 14725)." },
      { title: "Certificado de Análisis (COA)", body: "Acompaña cada lote, firmado por el gerente de calidad, con todos los ensayos físico-químicos relevantes." },
      { title: "Emergencias 24/7", body: "Línea de emergencia multilingüe (ES/PT/EN) para incidentes durante transporte o almacenamiento, disponible 24 horas." },
    ],
    shippingTitle: "Envío y logística en Latinoamérica",
    shippingItems: [
      { title: "Puertos principales", body: "Veracruz, Manzanillo, Santos, Itajaí, Buenos Aires, Valparaíso, San Antonio, Callao, Guayaquil, Cartagena, Buenaventura." },
      { title: "Incoterms 2020", body: "EXW, FOB, CIF, CFR, DAP, DDP — adaptables a sus necesidades logísticas." },
      { title: "Tiempos de entrega", body: "Productos en stock: 12–25 días según destino. Pedidos especiales: 5–8 semanas." },
    ],
    faqTitle: "Preguntas frecuentes — Latinoamérica",
    faq: [
      { q: "¿Manejan la documentación para importar a México?", a: "Sí. Coordinamos con su agente aduanal, proporcionamos pedimento simplificado, factura comercial, COA, HDS en español y certificado de origen TLCAN/T-MEC cuando aplica." },
      { q: "¿Cumplen con FISPQ para Brasil?", a: "Sí. Proporcionamos FISPQ conforme a ABNT NBR 14725 en portugués, junto con la documentación para ANVISA o IBAMA según el producto." },
      { q: "¿Qué métodos de pago aceptan?", a: "Transferencia bancaria internacional (T/T), carta de crédito (L/C a la vista) y tarjetas corporativas vía Stripe para pedidos menores a 10,000 USD." },
    ],
    closingTitle: "¿Listo para su próximo pedido en Latinoamérica?",
    closingBody: "Reciba una cotización detallada en menos de 24 horas hábiles, con COA y HDS incluidos.",
  },
};

export const REGION_LIST = Object.values(REGIONS);
