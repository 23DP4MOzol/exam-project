import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Package, Star, ShoppingCart, MessageCircle, Loader2, Lock } from 'lucide-react';

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
  is_reserved?: boolean;
  reserved_by?: string;
  reserve_fee?: number;
  seller?: {
    username: string;
  };
}

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | null;
  userBalance: number;
  onReserve: (productId: string) => void;
  onMessage: (sellerId: string, productId: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  product,
  isOpen,
  onClose,
  currentUserId,
  userBalance,
  onReserve,
  onMessage,
  onAddToCart
}) => {
  const [isReserving, setIsReserving] = useState(false);

  if (!product) return null;

  const handleReserve = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to reserve products",
        variant: "destructive"
      });
      return;
    }

    const RESERVE_FEE = 0.20;

    if (userBalance < RESERVE_FEE) {
      toast({
        title: "Insufficient balance",
        description: `You need at least €${RESERVE_FEE.toFixed(2)} to reserve this product`,
        variant: "destructive"
      });
      return;
    }

    setIsReserving(true);

    try {
      // Create transaction for reserve fee
      const { error: transactionError } = await supabase
        .from('user_transactions')
        .insert({
          user_id: currentUserId,
          amount: -RESERVE_FEE,
          transaction_type: 'reserve_fee',
          description: `Reserved ${product.name}`,
          reference_id: product.id
        });

      if (transactionError) throw transactionError;

      // Update product reservation status
      const { error: updateError } = await supabase
        .from('products')
        .update({
          is_reserved: true,
          reserved_by: currentUserId,
          reserved_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      toast({
        title: "Product Reserved",
        description: `${product.name} has been reserved for €${RESERVE_FEE.toFixed(2)}`
      });

      onReserve(product.id);
      onClose();
    } catch (error) {
      console.error('Error reserving product:', error);
      toast({
        title: "Error",
        description: "Failed to reserve product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReserving(false);
    }
  };

  const isOwnProduct = currentUserId === product.seller_id;
  const isReservedByOther = product.is_reserved && product.reserved_by !== currentUserId;
  const isReservedByUser = product.is_reserved && product.reserved_by === currentUserId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
          )}

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold">€{product.price.toFixed(2)}</div>
            <Badge variant={product.condition === 'new' ? 'default' : 'secondary'}>
              {product.condition}
            </Badge>
          </div>

          {(product.is_reserved) && (
            <Badge variant={isReservedByUser ? "default" : "secondary"} className="w-full justify-center py-2">
              <Lock className="h-4 w-4 mr-2" />
              {isReservedByUser ? 'Reserved by you' : 'Reserved by another user'}
            </Badge>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {product.location}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              {product.stock} in stock
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              Sold by: {product.seller?.username || 'Unknown'}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="border-t pt-4 space-y-3">
            {!isOwnProduct && (
              <>
                <Button
                  onClick={() => onAddToCart(product)}
                  className="w-full"
                  disabled={isReservedByOther}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>

                {!product.is_reserved && (
                  <Button
                    onClick={handleReserve}
                    variant="outline"
                    className="w-full"
                    disabled={isReserving}
                  >
                    {isReserving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Reserve for €0.20
                  </Button>
                )}

                <Button
                  onClick={() => {
                    onMessage(product.seller_id, product.id);
                    onClose();
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Seller
                </Button>
              </>
            )}

            {isOwnProduct && (
              <div className="text-center text-muted-foreground py-4">
                This is your product listing
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;