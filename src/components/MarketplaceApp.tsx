import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Star, ShoppingCart, Plus, Search, Filter, Trash2, User, LogIn, LogOut, Package, Heart, MapPin, Minus } from 'lucide-react';
import marketplaceHero from '@/assets/marketplace-hero.jpg';
import laptopImage from '@/assets/laptop.jpg';
import chairImage from '@/assets/chair.jpg';
import jacketImage from '@/assets/jacket.jpg';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  seller: string;
  location: string;
  rating: number;
  reviews: Review[];
  stock: number;
  condition: 'new' | 'used' | 'excellent';
  createdAt: string;
}

interface Review {
  id: number;
  userId: number;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  joinDate: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  date: string;
  shippingAddress: string;
}

const MarketplaceApp: React.FC = () => {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'sell' | 'cart' | 'orders' | 'login'>('home');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    location: '',
    condition: 'new' as 'new' | 'used' | 'excellent',
    stock: '1'
  });
  
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  // Initialize demo data
  useEffect(() => {
    const demoProducts: Product[] = [
      {
        id: 1,
        name: 'MacBook Pro 14"',
        price: 1299,
        category: 'Elektronika',
        description: 'M3 Pro čips, 18GB RAM, 512GB SSD. Ideāls stāvoklis, izmantots 6 mēnešus.',
        image: laptopImage,
        seller: 'TechGuru',
        location: 'Rīga',
        rating: 4.8,
        reviews: [],
        stock: 1,
        condition: 'excellent',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Vintage koka krēsls',
        price: 85,
        category: 'Mēbeles',
        description: 'Antīks koka krēsls no 1970. gadiem. Restaurēts ar mīkstu sēdekli.',
        image: chairImage,
        seller: 'VintageLovers',
        location: 'Liepāja',
        rating: 4.5,
        reviews: [],
        stock: 2,
        condition: 'used',
        createdAt: '2024-01-20'
      },
      {
        id: 3,
        name: 'Ziemas jaka North Face',
        price: 120,
        category: 'Apģērbs',
        description: 'Sieviešu ziemas jaka, izmērs M. Ļoti silta un ūdensizturīga.',
        image: jacketImage,
        seller: 'Fashionista',
        location: 'Daugavpils',
        rating: 4.9,
        reviews: [],
        stock: 1,
        condition: 'new',
        createdAt: '2024-01-25'
      }
    ];
    
    setProducts(demoProducts);
    setFilteredProducts(demoProducts);
    
    // Load saved data from localStorage
    const savedCart = localStorage.getItem('marketplace-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const savedUser = localStorage.getItem('marketplace-user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedOrders = localStorage.getItem('marketplace-orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save to localStorage whenever cart or user changes
  useEffect(() => {
    localStorage.setItem('marketplace-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('marketplace-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('marketplace-user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('marketplace-orders', JSON.stringify(orders));
  }, [orders]);

  // Filter products based on search criteria
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = (!priceRange.min || product.price >= Number(priceRange.min)) &&
                          (!priceRange.max || product.price <= Number(priceRange.max));
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  // Authentication functions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username && loginForm.password) {
      const user: User = {
        id: Date.now(),
        username: loginForm.username,
        email: `${loginForm.username}@example.com`,
        role: loginForm.username === 'admin' ? 'admin' : 'user',
        joinDate: new Date().toISOString()
      };
      setCurrentUser(user);
      setLoginForm({ username: '', password: '' });
      setCurrentView('home');
      toast({
        title: "Pieslēgšanās veiksmīga!",
        description: `Sveiks, ${user.username}!`
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.username && registerForm.email && registerForm.password) {
      const user: User = {
        id: Date.now(),
        username: registerForm.username,
        email: registerForm.email,
        role: 'user',
        joinDate: new Date().toISOString()
      };
      setCurrentUser(user);
      setRegisterForm({ username: '', email: '', password: '' });
      setCurrentView('home');
      toast({
        title: "Reģistrācija veiksmīga!",
        description: `Laipni lūdzam, ${user.username}!`
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    toast({
      title: "Jūs esat izgājuši",
      description: "Uz tikšanos!"
    });
  };

  // Product management
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        title: "Kļūda",
        description: "Jums jāpieslēdzas, lai pievienotu produktu",
        variant: "destructive"
      });
      return;
    }

    if (newProduct.name && newProduct.price && newProduct.category) {
      const product: Product = {
        id: Date.now(),
        name: newProduct.name,
        price: Number(newProduct.price),
        category: newProduct.category,
        description: newProduct.description,
        image: newProduct.image || laptopImage, // Default image
        seller: currentUser.username,
        location: newProduct.location || 'Rīga',
        rating: 0,
        reviews: [],
        stock: Number(newProduct.stock),
        condition: newProduct.condition,
        createdAt: new Date().toISOString()
      };
      
      setProducts(prev => [product, ...prev]);
      setNewProduct({
        name: '',
        price: '',
        category: '',
        description: '',
        image: '',
        location: '',
        condition: 'new',
        stock: '1'
      });
      setCurrentView('browse');
      toast({
        title: "Produkts pievienots!",
        description: `${product.name} ir pieejams pārdošanai`
      });
    }
  };

  // Cart management
  const addToCart = (product: Product) => {
    if (!currentUser) {
      toast({
        title: "Kļūda",
        description: "Jums jāpieslēdzas, lai pievienotu grozam",
        variant: "destructive"
      });
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    toast({
      title: "Pievienots grozam",
      description: `${product.name} ir pievienots jūsu grozam`
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast({
      title: "Noņemts no groza",
      description: "Produkts ir noņemts no groza"
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Grozs iztukšots",
      description: "Visi produkti ir noņemti no groza"
    });
  };

  // Order management
  const checkout = () => {
    if (!currentUser) {
      toast({
        title: "Kļūda",
        description: "Jums jāpieslēdzas, lai veiktu pasūtījumu",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Grozs tukšs",
        description: "Pievienojiet produktus grozam pirms apmaksas",
        variant: "destructive"
      });
      return;
    }

    const order: Order = {
      id: Date.now(),
      userId: currentUser.id,
      items: [...cart],
      total: cartTotal,
      status: 'pending',
      date: new Date().toISOString(),
      shippingAddress: 'Demo adrese, Rīga'
    };

    setOrders(prev => [order, ...prev]);
    setCart([]);
    setCurrentView('orders');
    
    toast({
      title: "Pasūtījums veikts!",
      description: `Pasūtījums #${order.id} ir reģistrēts`
    });
  };

  // Review system
  const addReview = (productId: number) => {
    if (!currentUser) {
      toast({
        title: "Kļūda",
        description: "Jums jāpieslēdzas, lai pievienotu atsauksmi",
        variant: "destructive"
      });
      return;
    }

    const review: Review = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString()
    };

    setProducts(prev =>
      prev.map(product => {
        if (product.id === productId) {
          const updatedReviews = [...product.reviews, review];
          const newRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
          return {
            ...product,
            reviews: updatedReviews,
            rating: Math.round(newRating * 10) / 10
          };
        }
        return product;
      })
    );

    setNewReview({ rating: 5, comment: '' });
    toast({
      title: "Atsauksme pievienota!",
      description: "Paldies par jūsu vērtējumu"
    });
  };

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Product categories
  const categories = ['Elektronika', 'Mēbeles', 'Apģērbs', 'Mājsaimniecība', 'Sports', 'Auto'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border-b border-border/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow bg-clip-text text-transparent animate-pulse">
                E-tirgus
              </h1>
              <nav className="hidden md:flex space-x-2">
                <Button
                  variant={currentView === 'home' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('home')}
                  className={`font-medium transition-all duration-300 hover:scale-105 ${
                    currentView === 'home' ? 'shadow-lg shadow-primary/25' : ''
                  }`}
                >
                  🏠 Sākums
                </Button>
                <Button
                  variant={currentView === 'browse' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('browse')}
                  className={`font-medium transition-all duration-300 hover:scale-105 ${
                    currentView === 'browse' ? 'shadow-lg shadow-primary/25' : ''
                  }`}
                >
                  🔍 Pārlūkot
                </Button>
                {currentUser && (
                  <Button
                    variant={currentView === 'sell' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('sell')}
                    className={`font-medium transition-all duration-300 hover:scale-105 ${
                      currentView === 'sell' ? 'shadow-lg shadow-primary/25' : ''
                    }`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    💰 Pārdot
                  </Button>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              {currentUser && (
                <>
                  <Button
                    variant={currentView === 'cart' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('cart')}
                    className="relative transition-all duration-300 hover:scale-110"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs bg-marketplace-accent animate-bounce">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant={currentView === 'orders' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('orders')}
                    className="transition-all duration-300 hover:scale-110"
                  >
                    <Package className="h-5 w-5" />
                    📦
                  </Button>
                </>
              )}
              
              {currentUser ? (
                <div className="flex items-center space-x-3 bg-card/50 rounded-full px-4 py-2 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-marketplace-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">Sveiks, {currentUser.username}!</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setCurrentView('login')}
                  className="bg-gradient-to-r from-primary to-marketplace-accent hover:from-primary-glow hover:to-marketplace-accent/80 text-white font-medium px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Pieslēgties
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl shadow-2xl">
              <div className="bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow p-12 md:p-20 text-center text-white relative">
                <img 
                  src={marketplaceHero} 
                  alt="Marketplace" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 animate-pulse"
                />
                <div className="relative z-10">
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                    🛒 Jūsu vietējais<br />
                    <span className="text-yellow-300 animate-bounce inline-block">E-tirgus</span> ✨
                  </h1>
                  <p className="text-xl md:text-3xl mb-8 opacity-90 animate-fade-in delay-300">
                    Pārdodiet un pērciet visu, ko vēlaties! 🎯
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in delay-500">
                    <Button
                      onClick={() => setCurrentView('browse')}
                      size="lg"
                      className="text-xl px-10 py-6 bg-white text-primary hover:bg-gray-100 font-bold rounded-full transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-white/25"
                    >
                      🔍 Sākt pārlūkošanu
                    </Button>
                    {currentUser && (
                      <Button
                        onClick={() => setCurrentView('sell')}
                        variant="outline"
                        size="lg"
                        className="text-xl px-10 py-6 bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 font-bold rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                      >
                        💰 Pārdot produktu
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 hover:border-primary/30">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-marketplace-accent rounded-full flex items-center justify-center animate-bounce">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-primary">🔍 Viegla meklēšana</h3>
                <p className="text-muted-foreground text-lg">
                  Atrodiet tieši to, ko meklējat ar mūsu jaudīgajiem filtriem un AI meklēšanu!
                </p>
              </Card>
              <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 hover:border-marketplace-accent/30">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-marketplace-accent to-marketplace-success rounded-full flex items-center justify-center animate-bounce delay-100">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-marketplace-accent">❤️ Drošs tirgus</h3>
                <p className="text-muted-foreground text-lg">
                  Vērtējumi un atsauksmes nodrošina uzticamu pirkšanas pieredzi visiem!
                </p>
              </Card>
              <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 hover:border-marketplace-success/30">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-marketplace-success to-marketplace-info rounded-full flex items-center justify-center animate-bounce delay-200">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-marketplace-success">📍 Vietējais tirgus</h3>
                <p className="text-muted-foreground text-lg">
                  Pērciet un pārdodiet savā apkaimē - atbalstiet vietējo ekonomiku!
                </p>
              </Card>
            </section>

            {/* Popular Products Preview */}
            <section>
              <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow bg-clip-text text-transparent">
                🔥 Populārākie produkti ⭐
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {products.slice(0, 3).map((product, index) => (
                  <Card key={product.id} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 hover:border-primary/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-marketplace-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-marketplace-accent to-marketplace-success text-white font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                        {product.category}
                      </Badge>
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                        #{index + 1}
                      </div>
                    </div>
                    <CardContent className="p-6 relative z-10">
                      <h3 className="font-bold mb-3 text-xl group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-marketplace-accent bg-clip-text text-transparent">€{product.price}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{product.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-12">
                <Button
                  onClick={() => setCurrentView('browse')}
                  size="lg"
                  className="text-xl px-12 py-6 bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow hover:from-primary-glow hover:via-marketplace-accent hover:to-primary text-white font-bold rounded-full transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-primary/25 animate-pulse"
                >
                  🛍️ Skatīt visus produktus ➡️
                </Button>
              </div>
            </section>
          </div>
        )}

        {currentView === 'browse' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow bg-clip-text text-transparent">
                🛍️ Pārlūkot produktus
              </h1>
              <p className="text-xl text-muted-foreground">Atrodiet visu, ko meklējat</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-gradient-to-r from-card to-card-hover rounded-3xl p-8 border-2 border-border/50 shadow-lg">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="🔍 Meklēt produktus..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl transition-all duration-300"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl">
                    <SelectValue placeholder="📁 Kategorija" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">📁 Visas kategorijas</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <Input
                    placeholder="💰 Min €"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                  <Input
                    placeholder="💰 Max €"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">🆕 Jaunākie</SelectItem>
                    <SelectItem value="price-asc">💰 Cena ↑</SelectItem>
                    <SelectItem value="price-desc">💰 Cena ↓</SelectItem>
                    <SelectItem value="rating">⭐ Vērtējums</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                Atrasti <span className="font-bold text-primary">{filteredProducts.length}</span> produkti
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 hover:border-primary/30">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-marketplace-accent to-marketplace-success text-white font-bold px-2 py-1 rounded-full shadow-lg">
                      {product.category}
                    </Badge>
                    {product.condition !== 'new' && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-marketplace-success to-marketplace-info text-white px-2 py-1 rounded-full shadow-lg">
                        {product.condition === 'excellent' ? '✨ Izcils' : '♻️ Lietots'}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-2 text-lg group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-marketplace-accent bg-clip-text text-transparent mb-2">€{product.price}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      {product.location}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews.length})
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 space-y-3">
                    <div className="flex gap-3 w-full">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:border-primary/30 font-medium"
                            onClick={() => setSelectedProduct(product)}
                          >
                            👀 Skatīt
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-card to-card-hover border-2 border-border/50">
                          {selectedProduct && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">{selectedProduct.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6">
                                <img
                                  src={selectedProduct.image}
                                  alt={selectedProduct.name}
                                  className="w-full h-80 object-cover rounded-xl shadow-lg"
                                />
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-4xl font-bold bg-gradient-to-r from-primary to-marketplace-accent bg-clip-text text-transparent">€{selectedProduct.price}</p>
                                    <Badge className="mt-3 bg-gradient-to-r from-marketplace-accent to-marketplace-success text-white font-bold px-3 py-1 rounded-full">
                                      {selectedProduct.category}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">👤 Pārdevējs</p>
                                    <p className="font-bold text-lg">{selectedProduct.seller}</p>
                                    <p className="text-sm text-muted-foreground flex items-center justify-end mt-1">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {selectedProduct.location}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-muted/50 rounded-xl p-4">
                                  <h4 className="font-semibold mb-2">📝 Apraksts</h4>
                                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                                </div>
                                
                                {/* Reviews Section */}
                                <div className="border-t pt-6">
                                  <h4 className="font-bold text-lg mb-4">⭐ Atsauksmes ({selectedProduct.reviews.length})</h4>
                                  
                                  {currentUser && (
                                    <div className="mb-6 p-6 bg-gradient-to-r from-muted/50 to-muted rounded-xl">
                                      <h5 className="font-semibold mb-4">📝 Pievienot atsauksmi</h5>
                                      <div className="flex items-center gap-3 mb-4">
                                        <span className="text-sm font-medium">Vērtējums:</span>
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map(rating => (
                                            <Star
                                              key={rating}
                                              className={`h-6 w-6 cursor-pointer transition-colors duration-200 ${
                                                rating <= newReview.rating
                                                  ? 'text-yellow-400 fill-current'
                                                  : 'text-gray-300 hover:text-yellow-200'
                                              }`}
                                              onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <Textarea
                                        placeholder="💬 Jūsu komentārs..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                        className="mb-4 min-h-[100px] border-2 border-border/50 focus:border-primary/50 rounded-xl"
                                      />
                                      <Button
                                        onClick={() => addReview(selectedProduct.id)}
                                        disabled={!newReview.comment.trim()}
                                        className="bg-gradient-to-r from-marketplace-accent to-marketplace-success text-white font-medium rounded-full px-6 py-2 transition-all duration-300 hover:scale-105"
                                      >
                                        ✨ Pievienot atsauksmi
                                      </Button>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-4">
                                    {selectedProduct.reviews.map(review => (
                                      <div key={review.id} className="border-b border-border/50 pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-primary to-marketplace-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                                              {review.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold">{review.username}</span>
                                          </div>
                                          <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                  i < review.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                }`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                        <p className="text-muted-foreground mb-2">{review.comment}</p>
                                        <p className="text-xs text-muted-foreground">
                                          📅 {new Date(review.date).toLocaleDateString('lv-LV')}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => addToCart(selectedProduct)}
                                  className="w-full bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow text-white font-bold py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
                                >
                                  🛒 Pievienot grozam
                                </Button>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        onClick={() => addToCart(product)}
                        className="flex-1 bg-gradient-to-r from-marketplace-accent to-marketplace-success text-white font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        🛒 Grozā
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-2xl font-bold mb-2">Nav atrasts neviens produkts</h3>
                <p className="text-muted-foreground mb-6">Mēģiniet mainīt meklēšanas kritērijus</p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange({ min: '', max: '' });
                  }}
                  className="bg-gradient-to-r from-primary to-marketplace-accent text-white font-medium rounded-full px-6 py-2"
                >
                  🔄 Notīrīt filtrus
                </Button>
              </div>
            )}
          </div>
        )}

        {currentView === 'sell' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow bg-clip-text text-transparent">
                💰 Pārdot produktu
              </h1>
              <p className="text-xl text-muted-foreground">Pievienojiet savu produktu pārdošanai</p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 shadow-lg">
              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-lg font-semibold">📝 Produkta nosaukums</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Piemēram: MacBook Pro 14 collas..."
                    required
                    className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-lg font-semibold">💰 Cena (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-lg font-semibold">📁 Kategorija</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl">
                        <SelectValue placeholder="Izvēlieties kategoriju" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-lg font-semibold">📄 Apraksts</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalizēts produkta apraksts..."
                    rows={4}
                    className="mt-2 border-2 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location" className="text-lg font-semibold">📍 Atrašanās vieta</Label>
                    <Input
                      id="location"
                      value={newProduct.location}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Rīga"
                      className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition" className="text-lg font-semibold">✨ Stāvoklis</Label>
                    <Select value={newProduct.condition} onValueChange={(value: 'new' | 'used' | 'excellent') => setNewProduct(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">🆕 Jauns</SelectItem>
                        <SelectItem value="excellent">✨ Izcils</SelectItem>
                        <SelectItem value="used">♻️ Lietots</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image" className="text-lg font-semibold">🖼️ Attēla URL (pēc izvēles)</Label>
                  <Input
                    id="image"
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
                >
                  ✨ Pievienot produktu
                </Button>
              </form>
            </Card>
          </div>
        )}

        {currentView === 'cart' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow bg-clip-text text-transparent">
                🛒 Jūsu grozs
              </h1>
              <p className="text-xl text-muted-foreground">
                {cart.length} produkti grozā
              </p>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-2xl font-bold mb-2">Jūsu grozs ir tukšs</h3>
                <p className="text-muted-foreground mb-6">Pievienojiet produktus, lai sāktu iepirkšanos</p>
                <Button
                  onClick={() => setCurrentView('browse')}
                  className="bg-gradient-to-r from-primary to-marketplace-accent text-white font-medium rounded-full px-8 py-3"
                >
                  🔍 Sākt iepirkšanos
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map(item => (
                  <Card key={item.product.id} className="p-6 bg-gradient-to-r from-card to-card-hover border-2 border-border/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-xl shadow-md"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{item.product.name}</h3>
                        <p className="text-2xl font-bold text-primary mb-2">€{item.product.price}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {item.product.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-10 h-10 rounded-full"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-xl font-bold w-12 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-10 h-10 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">€{(item.product.price * item.quantity).toFixed(2)}</p>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.product.id)}
                            className="mt-2 rounded-full"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="text-destructive border-destructive hover:bg-destructive/10 rounded-full"
                      >
                        🗑️ Iztukšot grozu
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold mb-2">
                        Kopā: <span className="text-primary">€{cartTotal.toFixed(2)}</span>
                      </p>
                      <Button
                        onClick={checkout}
                        className="bg-gradient-to-r from-marketplace-success to-marketplace-info text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                      >
                        💳 Apmaksāt pasūtījumu
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'orders' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow bg-clip-text text-transparent">
                📦 Jūsu pasūtījumi
              </h1>
              <p className="text-xl text-muted-foreground">
                {orders.length} pasūtījumi kopā
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-bold mb-2">Nav veiktu pasūtījumu</h3>
                <p className="text-muted-foreground mb-6">Sāciet iepirkšanos, lai redzētu pasūtījumus šeit</p>
                <Button
                  onClick={() => setCurrentView('browse')}
                  className="bg-gradient-to-r from-primary to-marketplace-accent text-white font-medium rounded-full px-8 py-3"
                >
                  🔍 Sākt iepirkšanos
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <Card key={order.id} className="p-6 bg-gradient-to-r from-card to-card-hover border-2 border-border/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Pasūtījums #{order.id}</h3>
                        <p className="text-muted-foreground">📅 {new Date(order.date).toLocaleDateString('lv-LV')}</p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={`px-3 py-1 rounded-full font-semibold ${
                            order.status === 'pending' ? 'bg-marketplace-warning text-white' :
                            order.status === 'paid' ? 'bg-marketplace-success text-white' :
                            order.status === 'shipped' ? 'bg-marketplace-info text-white' :
                            'bg-marketplace-accent text-white'
                          }`}
                        >
                          {order.status === 'pending' ? '⏳ Gaida apmaksu' :
                           order.status === 'paid' ? '✅ Apmaksāts' :
                           order.status === 'shipped' ? '🚚 Nosūtīts' :
                           '📦 Piegādāts'}
                        </Badge>
                        <p className="text-2xl font-bold text-primary mt-2">€{order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.product.name}</h4>
                            <p className="text-muted-foreground">Daudzums: {item.quantity}</p>
                          </div>
                          <p className="font-bold">€{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'login' && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow bg-clip-text text-transparent">
                🔐 Pieslēgšanās
              </h1>
              <p className="text-xl text-muted-foreground">Pievienojieties mūsu kopienai</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="font-semibold">🔓 Pieslēgties</TabsTrigger>
                <TabsTrigger value="register" className="font-semibold">📝 Reģistrēties</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="p-8 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 shadow-lg">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Label htmlFor="username" className="text-lg font-semibold">👤 Lietotājvārds</Label>
                      <Input
                        id="username"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Ievadiet lietotājvārdu"
                        required
                        className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-lg font-semibold">🔒 Parole</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Ievadiet paroli"
                        required
                        className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-14 text-xl font-bold bg-gradient-to-r from-primary via-marketplace-accent to-primary-glow text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/25"
                    >
                      🚀 Pieslēgties
                    </Button>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card className="p-8 bg-gradient-to-br from-card to-card-hover border-2 border-border/50 shadow-lg">
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                      <Label htmlFor="reg-username" className="text-lg font-semibold">👤 Lietotājvārds</Label>
                      <Input
                        id="reg-username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Izvēlieties lietotājvārdu"
                        required
                        className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email" className="text-lg font-semibold">📧 E-pasts</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jūsu.epasts@piemērs.lv"
                        required
                        className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password" className="text-lg font-semibold">🔒 Parole</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Izveidojiet drošu paroli"
                        required
                        className="mt-2 h-12 text-lg border-2 border-border/50 focus:border-primary/50 rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-14 text-xl font-bold bg-gradient-to-r from-marketplace-success via-marketplace-info to-marketplace-accent text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-marketplace-success/25"
                    >
                      ✨ Reģistrēties
                    </Button>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketplaceApp;