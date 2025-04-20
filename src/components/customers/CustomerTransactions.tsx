
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomerTransactionsProps {
  customerId: string;
}

export function CustomerTransactions({ customerId }: CustomerTransactionsProps) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['customerTransactions', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          transno,
          salesdate,
          salesdetail (
            quantity,
            product (
              description,
              prodcode,
              pricehist (
                unitprice
              )
            )
          )
        `)
        .eq('custno', customerId);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return <div className="py-4">Loading transactions...</div>;
  }

  if (!transactions?.length) {
    return <div className="py-4 text-muted-foreground">No transactions found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.transno}>
                <TableCell className="font-medium">{transaction.transno}</TableCell>
                <TableCell>
                  {transaction.salesdate 
                    ? new Date(transaction.salesdate).toLocaleDateString() 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {transaction.salesdetail?.map((detail: any) => (
                    <div key={detail.product?.prodcode} className="text-sm">
                      {detail.quantity}x {detail.product?.description || 'Unknown Product'}
                    </div>
                  ))}
                </TableCell>
                <TableCell className="text-right">
                  ${transaction.salesdetail?.reduce((total: number, detail: any) => {
                    const price = detail.product?.pricehist?.[0]?.unitprice || 0;
                    return total + (price * (detail.quantity || 0));
                  }, 0).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
