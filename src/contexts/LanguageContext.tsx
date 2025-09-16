import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'lv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header & Navigation
    'header.title': 'Professional Marketplace',
    'nav.home': 'Home',
    'nav.browse': 'Browse',
    'nav.sell': 'Sell',
    'nav.cart': 'Cart',
    'nav.orders': 'Orders',
    'nav.admin': 'Admin',
    'nav.settings': 'Settings',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'nav.language': 'Language',
    
    // Hero Section
    'hero.title': 'Professional Business Marketplace',
    'hero.subtitle': 'Discover premium products from trusted sellers in our professional marketplace',
    'hero.cta': 'Start Shopping',
    'hero.stats.products': 'Products',
    'hero.stats.sellers': 'Sellers',
    'hero.stats.orders': 'Orders',
    
    // Product Management
    'product.add': 'Add Product',
    'product.name': 'Product Name',
    'product.price': 'Price',
    'product.category': 'Category',
    'product.description': 'Description',
    'product.image': 'Image URL',
    'product.location': 'Location',
    'product.condition': 'Condition',
    'product.stock': 'Stock',
    'product.seller': 'Seller',
    'product.addToCart': 'Add to Cart',
    'product.condition.new': 'New',
    'product.condition.used': 'Used',
    'product.condition.excellent': 'Excellent',
    
    // Categories
    'category.all': 'All Categories',
    'category.Electronics': 'Electronics',
    'category.Furniture': 'Furniture',
    'category.Clothing': 'Clothing',
    'category.Home & Garden': 'Home & Garden',
    'category.Sports': 'Sports',
    'category.Automotive': 'Automotive',
    
    // Search & Filters
    'search.placeholder': 'Search products...',
    'filter.category': 'Category',
    'filter.price.min': 'Min Price',
    'filter.price.max': 'Max Price',
    'filter.sort': 'Sort by',
    'filter.sort.newest': 'Newest',
    'filter.sort.priceAsc': 'Price: Low to High',
    'filter.sort.priceDesc': 'Price: High to Low',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.quantity': 'Quantity',
    'cart.remove': 'Remove',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.empty': 'No orders found',
    'orders.status.pending': 'Pending',
    'orders.status.paid': 'Paid',
    'orders.status.shipped': 'Shipped',
    'orders.status.delivered': 'Delivered',
    'orders.orderNumber': 'Order #',
    'orders.date': 'Date',
    'orders.items': 'Items',
    
    // Authentication
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.switchToSignUp': 'Need an account? Sign up',
    'auth.switchToSignIn': 'Have an account? Sign in',
    
    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.users': 'Users',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.analytics': 'Analytics',
    'admin.totalUsers': 'Total Users',
    'admin.totalProducts': 'Total Products',
    'admin.totalOrders': 'Total Orders',
    'admin.revenue': 'Revenue',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.darkMode': 'Dark Mode',
    'settings.darkMode.desc': 'Toggle between light and dark themes',
    'settings.account': 'Account Information',
    'settings.admin': 'Administrator Settings',
    'settings.admin.desc': 'You have administrator privileges. You can manage all products, users, and orders.',
    'settings.version': 'Version 1.0.0',
    'settings.builtWith': 'Built with React, TypeScript, and Supabase',
    'settings.close': 'Close',
    
    // Messages
    'message.addedToCart': 'has been added to your cart',
    'message.productAdded': 'Your product has been listed successfully',
    'message.orderPlaced': 'has been placed successfully',
    'message.loginRequired': 'Please sign in to continue',
    'message.error': 'Error',
    'message.success': 'Success',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  lv: {
    // Header & Navigation
    'header.title': 'Profesionālā Tirgotava',
    'nav.home': 'Sākums',
    'nav.browse': 'Pārlūkot',
    'nav.sell': 'Pārdot',
    'nav.cart': 'Grozs',
    'nav.orders': 'Pasūtījumi',
    'nav.admin': 'Administrators',
    'nav.settings': 'Iestatījumi',
    'nav.login': 'Ieiet',
    'nav.logout': 'Iziet',
    'nav.language': 'Valoda',
    
    // Hero Section
    'hero.title': 'Profesionālā Biznesa Tirgotava',
    'hero.subtitle': 'Atklājiet premium produktus no uzticamiem pārdevējiem mūsu profesionālajā tirgotavā',
    'hero.cta': 'Sākt Iepirkties',
    'hero.stats.products': 'Produkti',
    'hero.stats.sellers': 'Pārdevēji',
    'hero.stats.orders': 'Pasūtījumi',
    
    // Product Management
    'product.add': 'Pievienot Produktu',
    'product.name': 'Produkta Nosaukums',
    'product.price': 'Cena',
    'product.category': 'Kategorija',
    'product.description': 'Apraksts',
    'product.image': 'Attēla URL',
    'product.location': 'Atrašanās vieta',
    'product.condition': 'Stāvoklis',
    'product.stock': 'Krājumi',
    'product.seller': 'Pārdevējs',
    'product.addToCart': 'Pievienot Grozam',
    'product.condition.new': 'Jauns',
    'product.condition.used': 'Lietots',
    'product.condition.excellent': 'Izcils',
    
    // Categories
    'category.all': 'Visas Kategorijas',
    'category.Electronics': 'Elektronika',
    'category.Furniture': 'Mēbeles',
    'category.Clothing': 'Apģērbs',
    'category.Home & Garden': 'Mājas un Dārzs',
    'category.Sports': 'Sports',
    'category.Automotive': 'Automašīnas',
    
    // Search & Filters
    'search.placeholder': 'Meklēt produktus...',
    'filter.category': 'Kategorija',
    'filter.price.min': 'Min Cena',
    'filter.price.max': 'Maks Cena',
    'filter.sort': 'Kārtot pēc',
    'filter.sort.newest': 'Jaunākie',
    'filter.sort.priceAsc': 'Cena: No mazās uz lielo',
    'filter.sort.priceDesc': 'Cena: No lielās uz mazo',
    
    // Cart
    'cart.title': 'Iepirkumu Grozs',
    'cart.empty': 'Jūsu grozs ir tukšs',
    'cart.total': 'Kopā',
    'cart.checkout': 'Noformēt',
    'cart.quantity': 'Daudzums',
    'cart.remove': 'Noņemt',
    
    // Orders
    'orders.title': 'Mani Pasūtījumi',
    'orders.empty': 'Pasūtījumi nav atrasti',
    'orders.status.pending': 'Gaida',
    'orders.status.paid': 'Apmaksāts',
    'orders.status.shipped': 'Nosūtīts',
    'orders.status.delivered': 'Piegādāts',
    'orders.orderNumber': 'Pasūtījums #',
    'orders.date': 'Datums',
    'orders.items': 'Preces',
    
    // Authentication
    'auth.signIn': 'Ieiet',
    'auth.signUp': 'Reģistrēties',
    'auth.email': 'E-pasts',
    'auth.password': 'Parole',
    'auth.username': 'Lietotājvārds',
    'auth.switchToSignUp': 'Vajag kontu? Reģistrējies',
    'auth.switchToSignIn': 'Ir konts? Ieej',
    
    // Admin
    'admin.title': 'Administratora Panelis',
    'admin.users': 'Lietotāji',
    'admin.products': 'Produkti',
    'admin.orders': 'Pasūtījumi',
    'admin.analytics': 'Analītika',
    'admin.totalUsers': 'Kopā Lietotāji',
    'admin.totalProducts': 'Kopā Produkti',
    'admin.totalOrders': 'Kopā Pasūtījumi',
    'admin.revenue': 'Ieņēmumi',
    
    // Settings
    'settings.title': 'Iestatījumi',
    'settings.appearance': 'Izskats',
    'settings.darkMode': 'Tumšais Režīms',
    'settings.darkMode.desc': 'Pārslēgties starp gaišo un tumšo tēmu',
    'settings.account': 'Konta Informācija',
    'settings.admin': 'Administratora Iestatījumi',
    'settings.admin.desc': 'Jums ir administratora privilēģijas. Varat pārvaldīt visus produktus, lietotājus un pasūtījumus.',
    'settings.version': 'Versija 1.0.0',
    'settings.builtWith': 'Izveidots ar React, TypeScript un Supabase',
    'settings.close': 'Aizvērt',
    
    // Messages
    'message.addedToCart': 'ir pievienots jūsu grozam',
    'message.productAdded': 'Jūsu produkts ir veiksmīgi pievienots',
    'message.orderPlaced': 'ir veiksmīgi ievietots',
    'message.loginRequired': 'Lūdzu, ieejiet, lai turpinātu',
    'message.error': 'Kļūda',
    'message.success': 'Veiksmīgi',
    
    // Common
    'common.loading': 'Ielādē...',
    'common.save': 'Saglabāt',
    'common.cancel': 'Atcelt',
    'common.delete': 'Dzēst',
    'common.edit': 'Rediģēt',
    'common.view': 'Skatīt',
    'common.back': 'Atpakaļ',
    'common.next': 'Nākamais',
    'common.previous': 'Iepriekšējais',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'lv')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};