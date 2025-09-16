# Professional Marketplace - Database Structure & Security Documentation

## Overview
This document outlines the complete database structure, security policies, user privileges, and administrative controls for the Professional Marketplace application.

## Database Architecture

### Technology Stack
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (for product images)
- **Row Level Security**: Enabled on all tables

## Tables Structure

### 1. Users Table (`users`)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores user account information and roles
**Relationships**: Referenced by products, orders, reviews
**Indexes**: 
- Primary key on `id`
- Unique index on `email`
- Unique index on `username`
- Index on `role` for admin queries

### 2. Products Table (`products`)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  category TEXT NOT NULL,
  image_url TEXT,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location TEXT,
  condition TEXT CHECK (condition IN ('new', 'used', 'excellent')) DEFAULT 'new',
  stock INTEGER DEFAULT 1 CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Product catalog and inventory management
**Relationships**: 
- Belongs to users (seller_id)
- Referenced by order_items and reviews
**Indexes**:
- Primary key on `id`
- Index on `seller_id`
- Index on `category`
- Index on `created_at` for sorting
- Composite index on `(category, price)` for filtering

### 3. Orders Table (`orders`)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL CHECK (total > 0),
  status TEXT CHECK (status IN ('pending', 'paid', 'shipped', 'delivered')) DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Order management and tracking
**Relationships**: 
- Belongs to users (user_id)
- Has many order_items
**Indexes**:
- Primary key on `id`
- Index on `user_id`
- Index on `status`
- Index on `created_at`

### 4. Order Items Table (`order_items`)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Individual items within orders
**Relationships**: 
- Belongs to orders (order_id)
- References products (product_id)
**Indexes**:
- Primary key on `id`
- Index on `order_id`
- Index on `product_id`

### 5. Reviews Table (`reviews`)
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Product reviews and ratings
**Relationships**: 
- Belongs to products (product_id)
- Belongs to users (user_id)
**Constraints**: One review per user per product
**Indexes**:
- Primary key on `id`
- Unique index on `(product_id, user_id)`
- Index on `product_id`

## Row Level Security (RLS) Policies

### Users Table Policies
```sql
-- Users can view all profiles but only update their own
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (auth.uid() = id);
```

### Products Table Policies
```sql
-- Anyone can view products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);

-- Only authenticated users can insert products
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id);

-- Users can only update their own products, admins can update all
CREATE POLICY "Users can update own products" ON products FOR UPDATE 
USING (auth.uid() = seller_id OR EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Users can only delete their own products, admins can delete all
CREATE POLICY "Users can delete own products" ON products FOR DELETE 
USING (auth.uid() = seller_id OR EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));
```

### Orders Table Policies
```sql
-- Users can only view their own orders, admins can view all
CREATE POLICY "Users can view own orders" ON orders FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));

-- Only authenticated users can create orders
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Only admins can update orders
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
```

### Order Items Table Policies
```sql
-- Users can view order items for their orders, admins can view all
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM orders WHERE id = order_id AND 
  (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ))
));

-- Only authenticated users can create order items
CREATE POLICY "Authenticated users can create order items" ON order_items FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
));
```

### Reviews Table Policies
```sql
-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);

-- Only authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can only update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own reviews, admins can delete all
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
));
```

## User Roles & Privileges

### Regular Users (`role: 'user'`)
**Can:**
- View all products and their details
- Search and filter products
- Add products to cart
- Create and manage their own orders
- View their order history
- Add products for sale
- Edit/delete their own products
- Write reviews for products
- Edit/delete their own reviews
- View their own profile
- Update their own profile information

**Cannot:**
- Access admin dashboard
- View other users' personal information
- Modify other users' products
- Change order statuses
- Delete other users' reviews
- Access system analytics

### Administrators (`role: 'admin'`)
**Can do everything regular users can, plus:**
- Access admin dashboard
- View all users and their information
- View system-wide analytics
- Manage all products (edit/delete any product)
- Manage all orders (view/update status)
- View all order details
- Delete any reviews
- Change user roles
- Access detailed system metrics
- Monitor platform activity

**Special Admin Privileges:**
- Bypass most RLS restrictions
- Full CRUD operations on all tables
- Access to system health metrics
- User management capabilities

### Visitors (Not authenticated)
**Can:**
- View all products
- Search and filter products
- View product details
- View reviews

**Cannot:**
- Add items to cart
- Place orders
- Create products
- Write reviews
- Access any user-specific features

## Security Implementation

### Authentication Security
```sql
-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Data Validation
- Email format validation through Supabase Auth
- Price validation (must be positive)
- Stock validation (must be non-negative)
- Rating validation (1-5 scale)
- Enum constraints on status fields
- Required field validation

### Performance Optimizations
- Strategic indexing on frequently queried columns
- Composite indexes for complex filters
- Connection pooling via Supabase
- Query optimization for dashboard analytics

## Admin Dashboard Analytics

### Key Metrics Tracked
1. **User Metrics**
   - Total registered users
   - New user registrations (daily/weekly/monthly)
   - User activity levels
   - Geographic distribution

2. **Product Metrics**
   - Total products listed
   - Products by category
   - Average product price
   - Most viewed products
   - Inventory levels

3. **Order Metrics**
   - Total orders placed
   - Order status distribution
   - Revenue tracking
   - Average order value
   - Order completion rates

4. **System Health**
   - Database performance
   - API response times
   - Error rates
   - Storage usage

## Backup & Recovery

### Automated Backups
- Daily full database backups via Supabase
- Point-in-time recovery available
- Backup retention: 30 days
- Cross-region replication for disaster recovery

### Manual Backup Procedures
```sql
-- Export user data
SELECT * FROM users ORDER BY created_at;

-- Export product catalog
SELECT * FROM products ORDER BY created_at;

-- Export order history
SELECT o.*, oi.* FROM orders o 
LEFT JOIN order_items oi ON o.id = oi.order_id 
ORDER BY o.created_at;
```

## Monitoring & Alerts

### System Monitoring
- Real-time error tracking
- Performance monitoring
- Database health checks
- Security event logging

### Alert Thresholds
- High error rates (>5% of requests)
- Slow query performance (>2 seconds)
- Failed authentication attempts (>10 per minute)
- Unusual data access patterns

## Compliance & Privacy

### Data Protection
- Personal data encryption at rest
- Secure data transmission (TLS 1.3)
- Data anonymization for analytics
- GDPR compliance features

### Privacy Controls
- User data export functionality
- Account deletion with data purging
- Consent management
- Data retention policies

## Development Guidelines

### Database Schema Changes
1. Always use migrations for schema changes
2. Test migrations on staging environment
3. Backup before applying production migrations
4. Document all schema changes

### Security Best Practices
1. Never store sensitive data in plain text
2. Use parameterized queries to prevent SQL injection
3. Regularly audit RLS policies
4. Monitor for privilege escalation attempts
5. Keep dependencies updated

## Support & Maintenance

### Regular Maintenance Tasks
- Weekly security audit
- Monthly performance review
- Quarterly backup testing
- Annual security assessment

### Emergency Procedures
- Database corruption recovery
- Security breach response
- Service outage management
- Data loss recovery protocols

---

**Document Version**: 1.0.0  
**Last Updated**: 2024-01-30  
**Next Review**: 2024-04-30