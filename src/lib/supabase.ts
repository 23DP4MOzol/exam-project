import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xjtrtnxnrhbzxqyoowch.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          username?: string
          role?: 'admin' | 'user'
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: string
          image_url: string
          seller_id: string
          location: string
          condition: 'new' | 'used' | 'excellent'
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: string
          image_url?: string
          seller_id: string
          location: string
          condition?: 'new' | 'used' | 'excellent'
          stock?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string
          price?: number
          category?: string
          image_url?: string
          location?: string
          condition?: 'new' | 'used' | 'excellent'
          stock?: number
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          status: 'pending' | 'paid' | 'shipped' | 'delivered'
          shipping_address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total: number
          status?: 'pending' | 'paid' | 'shipped' | 'delivered'
          shipping_address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          total?: number
          status?: 'pending' | 'paid' | 'shipped' | 'delivered'
          shipping_address?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          quantity?: number
          price?: number
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          rating?: number
          comment?: string
        }
      }
    }
  }
}
