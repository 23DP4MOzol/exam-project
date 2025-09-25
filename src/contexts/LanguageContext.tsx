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
    'support.title': 'AI Assistant',
    'support.welcome': 'Hello! How can I help you today?',
    'support.online': 'Online',
    'support.userType.guest': 'Guest',
    'support.userType.user': 'User',
    'support.userType.admin': 'Admin',
    'support.typePlaceholder': 'Type your message...',
    'support.requestHuman': 'Request Human Help',
    'support.escalation': 'I understand you need assistance. I can help with common questions about payments, shipping, returns, and account management. If you need more specific help, I can connect you with our support team.',
    'support.escalated': 'Your request has been escalated to our support team. They will contact you soon.',
    'support.faq.payment': 'We accept credit cards, PayPal, and bank transfers. Payment is processed securely through our payment gateway. Your order will be confirmed once payment is received.',
    'support.faq.shipping': 'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping is available for orders over $50. Tracking information will be provided once your order ships.',
    'support.faq.returns': 'You can return items within 30 days of purchase. Items must be in original condition. Please contact support to initiate a return. Refunds will be processed within 5-7 business days.',
    'support.faq.account': 'You can update your account information in the Settings page. Go to your profile to change your username, email, or password. If you need help, please contact our support team.',
    'support.faq.addProduct': 'To add a product, go to the \'Sell\' section in the navigation menu. Fill in all required fields including name, price, category, and description. You can also add images and set stock quantity.',
    'support.default': 'I\'m here to help! I can assist with questions about payments, shipping, returns, account management, and how to use our marketplace. What would you like to know?',
    'support.loading': 'Thinking...',
    'support.error': 'Sorry, I encountered an error. Please try again.',
    'support.escalateButton': 'Contact Human Support',
    'support.adminTakeover': 'Admin has joined the chat',
    'support.chatDeleted': 'Chat has been deleted',
    'support.newSession': 'New Chat Session',

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
    'support.title': 'AI Asistents',
    'support.welcome': 'Sveiki! Kā es varu jums palīdzēt?',
    'support.online': 'Tiešsaistē',
    'support.userType.guest': 'Viesis',
    'support.userType.user': 'Lietotājs',
    'support.userType.admin': 'Administrators',
    'support.typePlaceholder': 'Rakstiet savu ziņojumu...',
    'support.requestHuman': 'Pieprasīt Cilvēka Palīdzību',
    'support.escalation': 'Es saprotu, ka jums nepieciešama palīdzība. Es varu palīdzēt ar biežāk uzdotajiem jautājumiem par maksājumiem, piegādi, atgriešanu un konta pārvaldību. Ja nepieciešama specifiskāka palīdzība, es varu jūs savienot ar mūsu atbalsta komandu.',
    'support.escalated': 'Jūsu pieprasījums ir nodots mūsu atbalsta komandai. Viņi ar jums sazināsies drīzumā.',
    'support.faq.payment': 'Mēs pieņemam kredītkartes, PayPal un bankas pārskaitījumus. Maksājumi tiek apstrādāti droši caur mūsu maksājumu vārteju. Jūsu pasūtījums tiks apstiprināts pēc maksājuma saņemšanas.',
    'support.faq.shipping': 'Mēs piedāvājam standarta piegādi (5-7 darba dienas) un ātrās piegādes (2-3 darba dienas). Bezmaksas piegāde pieejama pasūtījumiem virs 50 €. Izsekošanas informācija tiks sniegta pēc pasūtījuma nosūtīšanas.',
    'support.faq.returns': 'Jūs varat atgriezt preces 30 dienu laikā pēc pirkuma. Precēm jābūt oriģinālā stāvoklī. Lūdzu, sazinieties ar atbalsta komandu, lai uzsāktu atgriešanu. Atmaksa tiks apstrādāta 5-7 darba dienu laikā.',
    'support.faq.account': 'Jūs varat atjaunināt sava konta informāciju iestatījumu lapā. Dodieties uz savu profilu, lai mainītu lietotājvārdu, e-pastu vai paroli. Ja nepieciešama palīdzība, lūdzu, sazinieties ar mūsu atbalsta komandu.',
    'support.faq.addProduct': 'Lai pievienotu produktu, dodieties uz \'Pārdot\' sadaļu navigācijas izvēlnē. Aizpildiet visus nepieciešamos laukus, ieskaitot nosaukumu, cenu, kategoriju un aprakstu. Jūs varat arī pievienot attēlus un iestatīt krājuma daudzumu.',
    'support.default': 'Es esmu šeit, lai palīdzētu! Es varu palīdzēt ar jautājumiem par maksājumiem, piegādi, atgriešanu, konta pārvaldību un tirgus vietas lietošanu. Ko jūs vēlētos zināt?',
    'support.loading': 'Domāju...',
    'support.error': 'Atvainojiet, es saskāros ar kļūdu. Lūdzu, mēģiniet vēlreiz.',
    'support.escalateButton': 'Sazināties ar cilvēku atbalstu',
    'support.adminTakeover': 'Administrators ir pievienojies sarunai',
    'support.chatDeleted': 'Saruna ir dzēsta',
    'support.newSession': 'Jauna saruna',

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
