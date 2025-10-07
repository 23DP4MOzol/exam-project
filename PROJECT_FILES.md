# Project File Structure & Documentation

## 🔧 Core Application Files

### Main Entry Points
- **`src/main.tsx`** - Application entry point, renders React app
- **`src/App.tsx`** - Root application component wrapper
- **`src/pages/Index.tsx`** - Home page, renders ProfessionalMarketplace component

### Main Components
- **`src/components/ProfessionalMarketplace.tsx`** - Main marketplace interface with product listings, search, filters, and navigation
- **`src/components/MarketplaceApp.tsx`** - Alternative marketplace view (can be removed if not used)
- **`src/components/AuthPage.tsx`** - Login/registration page with auto-refresh after authentication
- **`src/components/MessagesPage.tsx`** - Secure peer-to-peer messaging between buyers and sellers with privacy notice
- **`src/components/ProductDetailDialog.tsx`** - Product detail modal with reserve/purchase functionality
- **`src/components/BalanceManager.tsx`** - User balance management with quick-add buttons (€5, €10, €20, €50)
- **`src/components/Settings.tsx`** - User settings and profile management
- **`src/components/AISupport.tsx`** - AI-powered support chat interface
- **`src/components/DraggableAISupport.tsx`** - Draggable AI chat widget
- **`src/components/SupportChat.tsx`** - Support ticket system with escalation
- **`src/components/AdminChatManagement.tsx`** - Admin panel for managing support chats
- **`src/components/AdminAIChatManagement.tsx`** - Admin management for AI chat sessions

### Hooks
- **`src/hooks/useAuth.ts`** - Authentication hook managing user sessions
- **`src/hooks/use-toast.ts`** - Toast notification system
- **`src/hooks/use-mobile.tsx`** - Mobile device detection

### Contexts
- **`src/contexts/LanguageContext.tsx`** - Multi-language support (English/Latvian)

## 🎨 UI Components (shadcn/ui)
Located in `src/components/ui/` - Pre-built, customizable UI components:
- Form elements: `button.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx`
- Layout: `card.tsx`, `dialog.tsx`, `sheet.tsx`, `tabs.tsx`, `separator.tsx`
- Feedback: `toast.tsx`, `alert.tsx`, `badge.tsx`, `progress.tsx`
- Navigation: `navigation-menu.tsx`, `breadcrumb.tsx`, `pagination.tsx`
- Data display: `table.tsx`, `avatar.tsx`, `calendar.tsx`, `chart.tsx`
- And many more reusable components

## 🔌 Backend Integration

### Supabase Configuration
- **`src/integrations/supabase/client.ts`** - Supabase client initialization
- **`src/lib/supabase.ts`** - Supabase helper functions
- **`supabase/config.toml`** - Supabase project configuration

### Edge Functions (Serverless Backend)
- **`supabase/functions/ai-chat/index.ts`** - AI chatbot backend using OpenAI API
- **`supabase/functions/marketplace-ai/index.ts`** - Marketplace-specific AI assistant with multi-language support

### Database
- **`sql/setup_database.sql`** - Database schema and initial setup
- **`docs/DATABASE_STRUCTURE.md`** - Database documentation

## ⚙️ Configuration Files

### Build & Development
- **`vite.config.ts`** - Vite bundler configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration with custom design tokens
- **`tsconfig.json`** - TypeScript configuration
- **`eslint.config.js`** - ESLint code quality rules
- **`components.json`** - shadcn/ui components configuration

### Styling
- **`src/index.css`** - Global styles, CSS variables, and design system tokens
- **`src/App.css`** - Additional app-specific styles

### Assets
- **`src/assets/`** - Images and static assets
  - `marketplace-hero.jpg` - Hero banner
  - `chair.jpg`, `jacket.jpg`, `laptop.jpg` - Sample product images

### Public Files
- **`public/robots.txt`** - SEO crawler rules
- **`index.html`** - Main HTML template

## 📦 Dependencies
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Supabase** - Backend (auth, database, edge functions)
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **Lucide React** - Icon library

## 🔒 Security Features
- **Row Level Security (RLS)** - Database access control via Supabase policies
- **JWT Authentication** - Secure user sessions
- **End-to-End Messaging** - Private buyer-seller communication with no platform monitoring
- **Dynamic Fee System**:
  - Listing fee: 0.5% of product price (minimum €0.50)
  - Reserve fee: Fixed €0.20

## 🇱🇻 Latvia Compliance
The messaging system complies with Latvian consumer protection laws by:
- Providing direct peer-to-peer communication
- Not storing or monitoring private messages
- Making users responsible for their own transactions
- Clearly stating platform owner has no involvement in transactions

## 🗑️ Files That Can Be Removed
If simplified/unused:
- `src/components/MarketplaceApp.tsx` - If using ProfessionalMarketplace only
- `src/pages/NotFound.tsx` - If not implementing 404 pages
- Any unused `src/components/ui/` components you're not using

## 🚀 How It Works
1. User logs in via `AuthPage.tsx`
2. Main interface loads via `ProfessionalMarketplace.tsx`
3. Users can browse products, add balance via `BalanceManager.tsx`
4. Products are listed with 0.5% fee, reserved with €0.20 fee
5. Buyers and sellers communicate via `MessagesPage.tsx` (private & secure)
6. AI support available via `AISupport.tsx` components
7. All data persists in Supabase PostgreSQL database
8. Edge functions handle backend logic and AI integrations

---

**Note**: This is a React-based single-page application (SPA). It cannot be converted to plain HTML files as requested, as it relies on React's component system, state management, and client-side routing.
