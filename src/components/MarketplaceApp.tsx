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
import { Star, ShoppingCart, Plus, Search, Filter, Trash2, User, LogIn, LogOut, Package, Heart, MapPin } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState('');
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
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gradient">E-tirgus</h1>
              <nav className="hidden md:flex space-x-6">
                <Button
                  variant={currentView === 'home' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('home')}
                  className="font-medium"
                >
                  Sākums
                </Button>
                <Button
                  variant={currentView === 'browse' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('browse')}
                  className="font-medium"
                >
                  Pārlūkot
                </Button>
                {currentUser && (
                  <Button
                    variant={currentView === 'sell' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('sell')}
                    className="font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Pārdot
                  </Button>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView('cart')}
                    className="relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView('orders')}
                  >
                    <Package className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Sveiks, {currentUser.username}!</span>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setCurrentView('login')}
                  className="btn-marketplace"
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
            <section className="relative overflow-hidden rounded-3xl">
              <div className="hero-gradient p-12 md:p-20 text-center text-white">
                <img 
                  src={marketplaceHero} 
                  alt="Marketplace" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="relative z-10">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Jūsu vietējais<br />
                    <span className="text-marketplace-accent">E-tirgus</span>
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    Pārdodiet un pērciet visu, ko vēlaties
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => setCurrentView('browse')}
                      size="lg"
                      className="btn-marketplace text-lg px-8 py-4"
                    >
                      Sākt pārlūkošanu
                    </Button>
                    {currentUser && (
                      <Button
                        onClick={() => setCurrentView('sell')}
                        variant="outline"
                        size="lg"
                        className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
                      >
                        Pārdot produktu
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <div className="mb-4">
                  <Search className="h-12 w-12 mx-auto text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Viegla meklēšana</h3>
                <p className="text-muted-foreground">
                  Atrodiet tieši to, ko meklējat ar mūsu jaudīgajiem filtriem
                </p>
              </Card>
              <Card className="text-center p-6">
                <div className="mb-4">
                  <Heart className="h-12 w-12 mx-auto text-marketplace-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Drošs tirgus</h3>
                <p className="text-muted-foreground">
                  Vērtējumi un atsauksmes nodrošina uzticamu pirkšanas pieredzi
                </p>
              </Card>
              <Card className="text-center p-6">
                <div className="mb-4">
                  <MapPin className="h-12 w-12 mx-auto text-marketplace-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Vietējais tirgus</h3>
                <p className="text-muted-foreground">
                  Pērciet un pārdodiet savā apkaimē
                </p>
              </Card>
            </section>

            {/* Popular Products Preview */}
            <section>
              <h2 className="text-3xl font-bold mb-8 text-center">Populārākie produkti</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {products.slice(0, 3).map(product => (
                  <Card key={product.id} className="card-product">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className="absolute top-3 left-3 marketplace-badge">
                        {product.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-lg">{product.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">€{product.price}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {product.location}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button
                  onClick={() => setCurrentView('browse')}
                  size="lg"
                  className="btn-primary"
                >
                  Skatīt visus produktus
                </Button>
              </div>
            </section>
          </div>
        )}

        {currentView === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Meklēt produktus..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-field"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="input-field">
                    <SelectValue placeholder="Kategorija" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Visas kategorijas</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min €"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="input-field"
                  />
                  <Input
                    placeholder="Max €"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="input-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Jaunākie</SelectItem>
                    <SelectItem value="price-asc">Cena ↑</SelectItem>
                    <SelectItem value="price-desc">Cena ↓</SelectItem>
                    <SelectItem value="rating">Vērtējums</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="card-product">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 marketplace-badge">
                      {product.category}
                    </Badge>
                    {product.condition !== 'new' && (
                      <Badge className="absolute top-3 right-3 success-badge">
                        {product.condition === 'excellent' ? 'Izcils' : 'Lietots'}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">€{product.price}</p>
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
                  <CardFooter className="p-4 pt-0 space-y-2">
                    <div className="flex gap-2 w-full">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setSelectedProduct(product)}
                          >
                            Skatīt
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          {selectedProduct && (
                            <>
                              <DialogHeader>
                                <DialogTitle>{selectedProduct.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <img
                                  src={selectedProduct.image}
                                  alt={selectedProduct.name}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-3xl font-bold text-primary">€{selectedProduct.price}</p>
                                    <Badge className="mt-2 marketplace-badge">
                                      {selectedProduct.category}
                                    </Badge>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Pārdevējs</p>
                                    <p className="font-semibold">{selectedProduct.seller}</p>
                                    <p className="text-sm text-muted-foreground flex items-center justify-end">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {selectedProduct.location}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-muted-foreground">{selectedProduct.description}</p>
                                
                                {/* Reviews Section */}
                                <div className="border-t pt-4">
                                  <h4 className="font-semibold mb-4">Atsauksmes ({selectedProduct.reviews.length})</h4>
                                  
                                  {currentUser && (
                                    <div className="mb-4 p-4 bg-muted rounded-lg">
                                      <h5 className="font-medium mb-2">Pievienot atsauksmi</h5>
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm">Vērtējums:</span>
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map(rating => (
                                            <Star
                                              key={rating}
                                              className={`h-5 w-5 cursor-pointer ${
                                                rating <= newReview.rating
                                                  ? 'text-yellow-400 fill-current'
                                                  : 'text-gray-300'
                                              }`}
                                              onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <Textarea
                                        placeholder="Jūsu komentārs..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                                        className="mb-2"
                                      />
                                      <Button
                                        onClick={() => addReview(selectedProduct.id)}
                                        disabled={!newReview.comment.trim()}
                                        size="sm"
                                      >
                                        Pievienot atsauksmi
                                      </Button>
                                    </div>
                                  )}
                                  
                                  <div className="space-y-3">
                                    {selectedProduct.reviews.map(review => (
                                      <div key={review.id} className="border-b pb-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium">{review.username}</span>
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
                                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {new Date(review.date).toLocaleDateString()}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <Button
                                  onClick={() => addToCart(selectedProduct)}
                                  className="w-full btn-marketplace"
                                  disabled={selectedProduct.seller === currentUser?.username}
                                >
                                  {selectedProduct.seller === currentUser?.username
                                    ? 'Jūsu produkts'
                                    : 'Pievienot grozam'
                                  }
                                </Button>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        onClick={() => addToCart(product)}
                        className="btn-primary flex-1"
                        disabled={product.seller === currentUser?.username}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Grozā
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Nav atrasti produkti ar šiem kritērijiem</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'sell' && currentUser && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <CardHeader>
                <h2 className="text-2xl font-bold">Pievienot jaunu produktu</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Produkta nosaukums *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="input-field"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Cena (€) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Kategorija *</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue placeholder="Izvēlieties" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition">Stāvoklis</Label>
                      <Select
                        value={newProduct.condition}
                        onValueChange={(value: 'new' | 'used' | 'excellent') => 
                          setNewProduct(prev => ({ ...prev, condition: value }))
                        }
                      >
                        <SelectTrigger className="input-field">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Jauns</SelectItem>
                          <SelectItem value="excellent">Izcils</SelectItem>
                          <SelectItem value="used">Lietots</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Atrašanās vieta</Label>
                      <Input
                        id="location"
                        value={newProduct.location}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Rīga"
                        className="input-field"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Apraksts</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Attēla URL</Label>
                    <Input
                      id="image"
                      type="url"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="input-field"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full btn-marketplace">
                    Pievienot produktu
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'cart' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Jūsu grozs</h2>
            
            {cart.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Jūsu grozs ir tukšs</h3>
                <p className="text-muted-foreground mb-6">Pievienojiet produktus, lai sāktu iepirkties</p>
                <Button onClick={() => setCurrentView('browse')} className="btn-primary">
                  Sākt iepirkties
                </Button>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map(item => (
                    <Card key={item.product.id} className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.product.seller}</p>
                          <p className="font-bold text-primary">€{item.product.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="px-3 py-1 border rounded">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div>
                  <Card className="p-6 sticky top-24">
                    <h3 className="text-xl font-semibold mb-4">Kopsavilkums</h3>
                    <div className="space-y-2 mb-4">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span>{item.product.name} x{item.quantity}</span>
                          <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Kopā:</span>
                        <span>€{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-3 mt-6">
                      <Button onClick={checkout} className="w-full btn-marketplace">
                        Apmaksāt
                      </Button>
                      <Button onClick={clearCart} variant="outline" className="w-full">
                        Iztukšot grozu
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'orders' && currentUser && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Jūsu pasūtījumi</h2>
            
            {orders.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nav pasūtījumu</h3>
                <p className="text-muted-foreground mb-6">Jūs vēl neesat veikuši nevienu pasūtījumu</p>
                <Button onClick={() => setCurrentView('browse')} className="btn-primary">
                  Sākt iepirkties
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <Card key={order.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Pasūtījums #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={
                        order.status === 'delivered' ? 'success-badge' :
                        order.status === 'shipped' ? 'marketplace-badge' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {order.status === 'pending' ? 'Apstrādē' :
                         order.status === 'paid' ? 'Apmaksāts' :
                         order.status === 'shipped' ? 'Nosūtīts' : 'Piegādāts'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items.map(item => (
                        <div key={item.product.id} className="flex items-center gap-4">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Daudzums: {item.quantity} × €{item.product.price}
                            </p>
                          </div>
                          <p className="font-semibold">
                            €{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Kopā:</span>
                        <span className="text-xl font-bold text-primary">€{order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'login' && !currentUser && (
          <div className="max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Pieslēgties</TabsTrigger>
                <TabsTrigger value="register">Reģistrēties</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card className="p-6">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-center">Pieslēgties</h2>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-username">Lietotājvārds</Label>
                        <Input
                          id="login-username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                          className="input-field"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Parole</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                          className="input-field"
                        />
                      </div>
                      <Button type="submit" className="w-full btn-marketplace">
                        Pieslēgties
                      </Button>
                    </form>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Demo versija: Jebkurš lietotājvārds un parole darbosies.
                        Lietojiet "admin" kā lietotājvārdu admin tiesībām.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card className="p-6">
                  <CardHeader>
                    <h2 className="text-2xl font-bold text-center">Reģistrēties</h2>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-username">Lietotājvārds</Label>
                        <Input
                          id="register-username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                          className="input-field"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-email">E-pasts</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="input-field"
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-password">Parole</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                          className="input-field"
                        />
                      </div>
                      <Button type="submit" className="w-full btn-marketplace">
                        Reģistrēties
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-background-secondary border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gradient">E-tirgus</h3>
              <p className="text-muted-foreground">
                Jūsu vietējais marketplace - pārdodiet un pērciet visu, ko vēlaties.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kategorijas</h4>
              <ul className="space-y-2 text-muted-foreground">
                {categories.slice(0, 4).map(cat => (
                  <li key={cat}>
                    <a href="#" className="hover:text-primary transition-colors">{cat}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Palīdzība</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Kā pārdot?</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Kā pirkt?</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Atbalsts</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakti</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>info@e-tirgus.lv</li>
                <li>+371 20 123 456</li>
                <li>Rīga, Latvija</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 E-tirgus. Visi darbīniekuautējas aizsargāti. Demo versija.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketplaceApp;