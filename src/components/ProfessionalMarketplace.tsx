import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import Settings from './Settings';
import { 
  Star, 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  User, 
  LogIn, 
  LogOut, 
  Package, 
  MapPin, 
  Minus, 
  Settings as SettingsIcon,
  Shield,
  Store,
  TrendingUp,
  Users,
  DollarSign,
  Globe
} from 'lucide-react';
import laptopImage from '@/assets/laptop.jpg';
import chairImage from '@/assets/chair.jpg';
import jacketImage from '@/assets/jacket.jpg';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  seller_id: string;
  location: string;
  condition: 'new' | 'used' | 'excellent';
  stock: number;
  created_at: string;
  updated_at: string;
  seller?: {
    username: string;
  };
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  shipping_address: string;
  created_at: string;
  order_items?: {
    product: Product;
    quantity: number;
    price: number;
  }[];
}

const ProfessionalMarketplace: React.FC = () => {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const { t } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'browse' | 'sell' | 'cart' | 'orders' | 'login' | 'settings' | 'admin'>('home');
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
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
    image_url: '',
    location: '',
    condition: 'new' as 'new' | 'used' | 'excellent',
    stock: '1'
  });
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });

  const categories = ['Electronics', 'Furniture', 'Clothing', 'Home & Garden', 'Sports', 'Automotive'];

  // Theme toggle
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Load data on mount
  useEffect(() => {
    loadProducts();
    if (user) {
      loadOrders();
      if (profile?.role === 'admin') {
        loadUsers();
      }
    }
  }, [user, profile]);

  // Filter products
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
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
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  // Data loading functions
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:users(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to demo data if database is not set up
      setProducts([
        {
          id: '1',
          name: 'Professional Laptop',
          price: 899,
          category: 'Electronics',
          description: 'High-performance laptop for business and creative work.',
          image_url: laptopImage,
          seller_id: 'demo',
          location: 'New York',
          condition: 'excellent',
          stock: 1,
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
          seller: { username: 'TechStore' }
        },
        {
          id: '2',
          name: 'Executive Office Chair',
          price: 299,
          category: 'Furniture',
          description: 'Ergonomic office chair with premium materials.',
          image_url: chairImage,
          seller_id: 'demo',
          location: 'Chicago',
          condition: 'new',
          stock: 3,
          created_at: '2024-01-20',
          updated_at: '2024-01-20',
          seller: { username: 'OfficeSupply' }
        },
        {
          id: '3',
          name: 'Professional Blazer',
          price: 149,
          category: 'Clothing',
          description: 'Premium business blazer for professional settings.',
          image_url: jacketImage,
          seller_id: 'demo',
          location: 'Los Angeles',
          condition: 'new',
          stock: 2,
          created_at: '2024-01-25',
          updated_at: '2024-01-25',
          seller: { username: 'Fashion Pro' }
        }
      ]);
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Authentication handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(loginForm.email, loginForm.password);
    setLoginForm({ email: '', password: '' });
    setCurrentView('home');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(registerForm.email, registerForm.password, registerForm.username);
    setRegisterForm({ username: '', email: '', password: '' });
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView('home');
    setCart([]);
  };

  // Product management
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to add products",
        variant: "destructive"
      });
      return;
    }
  
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
  
    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);
  
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }
  
    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid stock number",
        variant: "destructive"
      });
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          price,
          category: newProduct.category,
          description: newProduct.description,
          image_url: newProduct.image_url || '', // ensure it's a string
          seller_id: user.id,
          location: newProduct.location || 'Online',
          condition: newProduct.condition,
          stock
        })
        .select()
        .single();
  
      if (error) throw error;
  
      toast({
        title: "Product Added",
        description: "Your product has been listed successfully"
      });
  
      setNewProduct({
        name: '',
        price: '',
        category: '',
        description: '',
        image_url: '',
        location: '',
        condition: 'new',
        stock: '1'
      });
  
      loadProducts();
      setCurrentView('browse');
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
    }
  };
  

  // Cart management
  const addToCart = (product: Product) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to add items to cart",
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
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
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

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const checkout = async () => {
    if (!user || cart.length === 0) return;

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: cartTotal,
          status: 'pending',
          shipping_address: 'Default Address'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed",
        description: `Order #${order.id.slice(-8)} has been placed successfully`
      });

      setCart([]);
      loadOrders();
      setCurrentView('orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-primary">{t('header.title')}</h1>
              <nav className="hidden md:flex space-x-1">
                <Button
                  variant={currentView === 'home' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('home')}
                  className="font-medium"
                >
                  {t('nav.home')}
                </Button>
                <Button
                  variant={currentView === 'browse' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('browse')}
                  className="font-medium"
                >
                  {t('nav.browse')}
                </Button>
                {user && (
                  <Button
                    variant={currentView === 'sell' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('sell')}
                    className="font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('nav.sell')}
                  </Button>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              {user && (
                <>
                  <Button
                    variant={currentView === 'cart' ? 'default' : 'ghost'}
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
                    variant={currentView === 'orders' ? 'default' : 'ghost'}
                    onClick={() => setCurrentView('orders')}
                  >
                    <Package className="h-5 w-5" />
                  </Button>
                  {profile?.role === 'admin' && (
                    <Button
                      variant={currentView === 'admin' ? 'default' : 'ghost'}
                      onClick={() => setCurrentView('admin')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {t('nav.admin')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView('settings')}
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-foreground">Welcome, {profile?.username}</span>
                  </div>
                  <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setCurrentView('login')}
                  className="font-medium"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('nav.login')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'settings' && (
          <Settings
            isDarkMode={isDarkMode}
            onThemeToggle={toggleTheme}
            currentUser={profile}
            onClose={() => setCurrentView('home')}
          />
        )}

        {currentView === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-6">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
                  {t('hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  {t('hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                    onClick={() => setCurrentView('browse')}
                    size="lg"
                    className="text-lg px-8 py-6"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {t('hero.cta')}
                  </Button>
                  {user && (
                    <Button
                      onClick={() => setCurrentView('sell')}
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-6"
                    >
                      <Store className="h-5 w-5 mr-2" />
                      {t('nav.sell')}
                    </Button>
                  )}
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <div className="w-12 h-12 mx-auto bg-business-blue rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Growing Market</h3>
                <p className="text-muted-foreground">
                  Join thousands of active buyers and sellers in our expanding marketplace.
                </p>
              </Card>
              <Card className="text-center p-6">
                <div className="w-12 h-12 mx-auto bg-business-green rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                <p className="text-muted-foreground">
                  All transactions are protected with enterprise-grade security measures.
                </p>
              </Card>
              <Card className="text-center p-6">
                <div className="w-12 h-12 mx-auto bg-business-orange rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Users</h3>
                <p className="text-muted-foreground">
                  Connect with verified professionals and trusted business partners.
                </p>
              </Card>
            </section>

            {/* Featured Products */}
            <section>
              <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {products.slice(0, 3).map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 left-3">
                        {product.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-2xl font-bold text-primary mb-2">${product.price}</p>
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
                  variant="outline"
                >
                  View All Products
                </Button>
              </div>
            </section>
          </div>
        )}

        {currentView === 'browse' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Browse Products</h1>
              <p className="text-muted-foreground">Find exactly what you're looking for</p>
            </div>

            {/* Search and Filters */}
            <Card className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min $"
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  />
                  <Input
                    placeholder="Max $"
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Results */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Found <span className="font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 left-3">
                      {product.category}
                    </Badge>
                    {product.condition !== 'new' && (
                      <Badge className="absolute top-3 right-3" variant="secondary">
                        {product.condition === 'excellent' ? 'Excellent' : 'Used'}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">${product.price}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      {product.location}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => addToCart(product)}
                      className="w-full"
                      disabled={!user}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'sell' && user && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">List a Product</h1>
            <Card className="p-6">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newProduct.location}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={newProduct.condition} onValueChange={(value: 'new' | 'used' | 'excellent') => setNewProduct(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('product.add')}
                </Button>
              </form>
            </Card>
          </div>
        )}

        {currentView === 'cart' && user && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
            {cart.length === 0 ? (
              <Card className="p-8 text-center">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">Start shopping to add items to your cart</p>
                <Button onClick={() => setCurrentView('browse')}>
                  Browse Products
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {cart.map(item => (
                  <Card key={item.product.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-muted-foreground">${item.product.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
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
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-semibold">Total: ${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button onClick={checkout} className="w-full" size="lg">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        {currentView === 'orders' && user && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            {orders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Your order history will appear here</p>
                <Button onClick={() => setCurrentView('browse')}>
                  Start Shopping
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-lg font-semibold">
                      Total: ${order.total.toFixed(2)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'admin' && profile?.role === 'admin' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-business-blue rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-business-green rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-business-orange rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-business-gray rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">$0</p>
                  </div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="products" className="space-y-4">
              <TabsList>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="text-lg font-bold">${product.price}</p>
                          </div>
                          <Badge>{product.condition}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map(user => (
                        <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {user.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{user.username}</h4>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">No orders to display</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentView === 'login' && (
          <div className="max-w-md mx-auto">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-center">Welcome Back</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Sign In
                      </Button>
                    </form>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Admin login: admin@marketplace.com / password123
                    </p>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfessionalMarketplace;
