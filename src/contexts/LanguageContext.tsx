import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'lv';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
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
    'nav.welcome': 'Welcome',

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
    'product.list': 'List Product',

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
    'cart.addProducts': 'Add some products to get started!',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.quantity': 'Quantity',
    'cart.remove': 'Remove',

    // Orders
    'orders.title': 'My Orders',
    'orders.empty': 'No orders yet',
    'orders.emptyDesc': 'Your order history will appear here',
    'orders.startShopping': 'Start Shopping',
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
    'auth.welcomeBack': 'Welcome Back',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.adminLogin': 'Admin login: admin@marketplace.com / password123',
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

    // Support Chat
    'support.title': 'Support Chat',
    'support.welcome': 'Hello! How can I help you today?',
    'support.online': 'Online',
    'support.userType.guest': 'Guest',
    'support.userType.user': 'User',
    'support.userType.admin': 'Admin',
    'support.typePlaceholder': 'Type your message...',
    'support.requestHuman': 'Request Human Help',
    'support.escalation': 'I understand you need additional assistance. Would you like me to connect you with a moderator or administrator?',
    'support.escalated': 'Your request has been escalated. A human representative will assist you shortly.',
    'support.faq.payment': 'For payment issues, please check that your payment method is valid and has sufficient funds. Contact your bank if the problem persists.',
    'support.faq.shipping': 'Shipping times vary by location. Standard delivery is 3-5 business days. You can track your order in the Orders section.',
    'support.faq.returns': 'Returns are accepted within 30 days of purchase. Items must be in original condition. Go to your Orders to initiate a return.',
    'support.faq.account': 'To update your account information, go to Settings. For password reset, use the "Forgot Password" link on the login page.',
    'support.faq.addProduct': 'To add a product, click "Sell" in the navigation menu. Fill in all required fields and upload clear photos for best results.',
    'support.default': 'I understand your question. For complex issues, you can request human assistance or check our FAQ section.',

    // Messages
    'messages.title': 'Messages',
    'messages.noMessages': 'No messages yet',
    'messages.noConversations': 'No conversations yet',
    'messages.selectConversation': 'Select a conversation to start messaging',
    'messages.typePlaceholder': 'Type your message...',

    // Admin
    'admin.chatManagement': 'Chat Management',
    'admin.supportTickets': 'Support Tickets',
    'admin.conversations': 'Conversations',
    'admin.noTickets': 'No support tickets',
    'admin.noConversations': 'No conversations',
    'admin.selectTicket': 'Select a ticket to view details',
    'admin.selectConversation': 'Select a conversation to view messages',
    'admin.markInProgress': 'Mark In Progress',
    'admin.markResolved': 'Mark Resolved',
    'admin.replyToTicket': 'Reply to ticket...',
    'admin.viewingConversation': 'Viewing Conversation',

    // Settings
    'settings.changeUsername': 'Change Username',
    'settings.changeEmail': 'Change Email',
    'settings.changePassword': 'Change Password',
    'settings.password': 'Password',
    'settings.notLoggedIn': 'Not logged in',

    // Common
    'common.close': 'Close',
    'common.buyer': 'Buyer',
    'common.seller': 'Seller',

    // Browse/Search Page
    'browse.title': 'Browse Products',
    'browse.subtitle': 'Find exactly what you\'re looking for',
    'browse.found': 'Found',
    'browse.products': 'products',
    'browse.noResults': 'No products found',
    'browse.tryDifferent': 'Try adjusting your search criteria',

    // Sell Page  
    'sell.title': 'List a Product',
    'sell.form.name': 'Product Name',
    'sell.form.price': 'Price ($)',
    'sell.form.category': 'Category',
    'sell.form.description': 'Description',
    'sell.form.location': 'Location',
    'sell.form.condition': 'Condition',
    'sell.form.imageUrl': 'Image URL',
    'sell.form.selectCategory': 'Select category',
    'sell.form.imagePlaceholder': 'https://example.com/image.jpg',

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
    'common.viewAll': 'View All Products',
    'common.featuredProducts': 'Featured Products',
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
    'nav.welcome': 'Laipni lūdzam',

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
    'product.list': 'Izlikt Produktu',

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
    'cart.addProducts': 'Pievienojiet produktus, lai sāktu!',
    'cart.total': 'Kopā',
    'cart.checkout': 'Noformēt',
    'cart.quantity': 'Daudzums',
    'cart.remove': 'Noņemt',

    // Orders
    'orders.title': 'Mani Pasūtījumi',
    'orders.empty': 'Pagaidām nav pasūtījumu',
    'orders.emptyDesc': 'Jūsu pasūtījumu vēsture būs šeit',
    'orders.startShopping': 'Sākt Iepirkties',
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
    'auth.welcomeBack': 'Laipni Lūdzam Atpakaļ',
    'auth.email': 'E-pasts',
    'auth.password': 'Parole',
    'auth.username': 'Lietotājvārds',
    'auth.adminLogin': 'Administratora pieteikšanās: admin@marketplace.com / password123',
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
    'settings.changeUsername': 'Mainīt lietotājvārdu',
    'settings.changeEmail': 'Mainīt e-pastu',
    'settings.changePassword': 'Mainīt paroli',
    'settings.password': 'Parole',
    'settings.notLoggedIn': 'Nav pieteicies',

    // Messages
    'messages.title': 'Ziņas',
    'messages.noMessages': 'Vēl nav ziņu',
    'messages.noConversations': 'Vēl nav sarunu',
    'messages.selectConversation': 'Izvēlieties sarunu, lai sāktu ziņojumus',
    'messages.typePlaceholder': 'Ierakstiet savu ziņu...',
    'message.addedToCart': 'ir pievienots jūsu grozam',
    'message.productAdded': 'Jūsu produkts ir veiksmīgi pievienots',

    // Admin
    'admin.chatManagement': 'Tērzēšanas pārvaldība',
    'admin.supportTickets': 'Atbalsta biļetes',
    'admin.conversations': 'Sarunas',
    'admin.noTickets': 'Nav atbalsta biļešu',
    'admin.noConversations': 'Nav sarunu',
    'admin.selectTicket': 'Izvēlieties biļeti, lai skatītu detaļas',
    'admin.selectConversation': 'Izvēlieties sarunu, lai skatītu ziņas',
    'admin.markInProgress': 'Atzīmēt kā procesā',
    'admin.markResolved': 'Atzīmēt kā atrisinātu',
    'admin.replyToTicket': 'Atbildēt uz biļeti...',
    'admin.viewingConversation': 'Skatās sarunu',

    // Common
    'common.close': 'Aizvērt',
    'common.buyer': 'Pircējs',
    'common.seller': 'Pārdevējs',
    'message.orderPlaced': 'ir veiksmīgi ievietots',
    'message.loginRequired': 'Lūdzu, ieejiet, lai turpinātu',
    'message.error': 'Kļūda',
    'message.success': 'Veiksmīgi',

    // Support Chat
    'support.title': 'Atbalsta Čats',
    'support.welcome': 'Sveiki! Kā es varu jums palīdzēt?',
    'support.online': 'Tiešsaistē',
    'support.userType.guest': 'Viesis',
    'support.userType.user': 'Lietotājs',
    'support.userType.admin': 'Administrators',
    'support.typePlaceholder': 'Rakstiet savu ziņojumu...',
    'support.requestHuman': 'Pieprasīt Cilvēka Palīdzību',
    'support.escalation': 'Es saprotu, ka jums nepieciešama papildu palīdzība. Vai vēlaties, lai es jūs savienoju ar moderatoru vai administratoru?',
    'support.escalated': 'Jūsu pieprasījums ir nodots tālāk. Cilvēks pārstāvis jums palīdzēs drīzumā.',
    'support.faq.payment': 'Maksājumu problēmu gadījumā, lūdzu pārbaudiet, vai jūsu maksājuma metode ir derīga un ir pietiekami līdzekļu. Sazinieties ar banku, ja problēma turpinās.',
    'support.faq.shipping': 'Piegādes laiki atšķiras atkarībā no atrašanās vietas. Standarta piegāde ir 3-5 darba dienas. Varat izsekot savu pasūtījumu sadaļā Pasūtījumi.',
    'support.faq.returns': 'Atgriešana tiek pieņemta 30 dienu laikā pēc pirkuma. Precēm jābūt oriģinālā stāvoklī. Dodieties uz Pasūtījumiem, lai sāktu atgriešanu.',
    'support.faq.account': 'Lai atjauninātu sava konta informāciju, dodieties uz Iestatījumiem. Paroles atiestatīšanai izmantojiet saiti "Aizmirstu paroli" pieteikšanās lapā.',
    'support.faq.addProduct': 'Lai pievienotu produktu, noklikšķiniet uz "Pārdot" navigācijas izvēlnē. Aizpildiet visus obligātos laukus un augšupielādējiet skaidras fotogrāfijas.',
    'support.default': 'Es saprotu jūsu jautājumu. Sarežģītu jautājumu gadījumā varat pieprasīt cilvēka palīdzību vai pārbaudīt mūsu FAQ sadaļu.',

    // Browse/Search Page
    'browse.title': 'Pārlūkot Produktus',
    'browse.subtitle': 'Atrodiet tieši to, ko meklējat',
    'browse.found': 'Atrasti',
    'browse.products': 'produkti',
    'browse.noResults': 'Produkti nav atrasti',
    'browse.tryDifferent': 'Mēģiniet pielāgot meklēšanas kritērijus',

    // Sell Page
    'sell.title': 'Izlikt Produktu',
    'sell.form.name': 'Produkta Nosaukums',
    'sell.form.price': 'Cena ($)',
    'sell.form.category': 'Kategorija',
    'sell.form.description': 'Apraksts',
    'sell.form.location': 'Atrašanās vieta',
    'sell.form.condition': 'Stāvoklis',
    'sell.form.imageUrl': 'Attēla URL',
    'sell.form.selectCategory': 'Izvēlieties kategoriju',
    'sell.form.imagePlaceholder': 'https://example.com/image.jpg',

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
    'common.viewAll': 'Skatīt Visus Produktus',
    'common.featuredProducts': 'Piedāvātie Produkti',
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

  // 🔥 FIXED: Direct flat key lookup
  const t = (key: string): string => {
    return translations[language][key] || key;
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
