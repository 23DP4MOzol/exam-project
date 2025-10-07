import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Plus, Loader2, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface BalanceManagerProps {
  userId: string;
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

const BalanceManager: React.FC<BalanceManagerProps> = ({ userId, currentBalance, onBalanceUpdate }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit is €1.00",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_transactions')
        .insert({
          user_id: userId,
          amount: depositAmount,
          transaction_type: 'deposit',
          description: `Deposited €${depositAmount.toFixed(2)}`
        });

      if (error) throw error;

      toast({
        title: "Funds Added",
        description: `€${depositAmount.toFixed(2)} has been added to your balance`
      });

      setAmount('');
      onBalanceUpdate(currentBalance + depositAmount);
      loadTransactions();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        title: "Error",
        description: "Failed to add funds. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'deposit') return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === 'deposit') return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Balance
          </CardTitle>
          <CardDescription>
            Listing fee: 0.5% of product price (min €0.50) • Reserve fee: €0.20
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-6">
            €{currentBalance.toFixed(2)}
          </div>

          <form onSubmit={handleAddFunds} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Add Funds</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Minimum €1.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                    {transaction.amount > 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceManager;