
// Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: Date;
  totalSpent: number;
  avatarUrl?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  status: 'successful' | 'pending' | 'failed';
  date: Date;
  method: 'credit' | 'bank' | 'paypal';
  description: string;
}

// Mock Data
export const customers: Customer[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '(555) 123-4567',
    status: 'active',
    joinedDate: new Date('2023-01-15'),
    totalSpent: 2549.99
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '(555) 987-6543',
    status: 'active',
    joinedDate: new Date('2023-02-28'),
    totalSpent: 1845.50
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    status: 'inactive',
    joinedDate: new Date('2022-11-10'),
    totalSpent: 432.25
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    phone: '(555) 789-0123',
    status: 'active',
    joinedDate: new Date('2023-03-05'),
    totalSpent: 3621.75
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james.w@example.com',
    phone: '(555) 234-5678',
    status: 'pending',
    joinedDate: new Date('2023-04-20'),
    totalSpent: 699.99
  },
  {
    id: '6',
    name: 'Olivia Martinez',
    email: 'olivia.m@example.com',
    phone: '(555) 321-0987',
    status: 'active',
    joinedDate: new Date('2022-12-12'),
    totalSpent: 1245.00
  },
  {
    id: '7',
    name: 'William Taylor',
    email: 'william.t@example.com',
    phone: '(555) 654-3210',
    status: 'inactive',
    joinedDate: new Date('2022-10-05'),
    totalSpent: 875.50
  },
  {
    id: '8',
    name: 'Sophia Anderson',
    email: 'sophia.a@example.com',
    phone: '(555) 876-5432',
    status: 'active',
    joinedDate: new Date('2023-01-30'),
    totalSpent: 2110.25
  }
];

export const payments: Payment[] = [
  {
    id: 'p1',
    customerId: '1',
    amount: 499.99,
    status: 'successful',
    date: new Date('2023-04-15'),
    method: 'credit',
    description: 'Monthly subscription'
  },
  {
    id: 'p2',
    customerId: '1',
    amount: 2050.00,
    status: 'successful',
    date: new Date('2023-03-22'),
    method: 'bank',
    description: 'Annual plan'
  },
  {
    id: 'p3',
    customerId: '2',
    amount: 1845.50,
    status: 'successful',
    date: new Date('2023-04-02'),
    method: 'paypal',
    description: 'Premium package'
  },
  {
    id: 'p4',
    customerId: '3',
    amount: 432.25,
    status: 'successful',
    date: new Date('2023-02-18'),
    method: 'credit',
    description: 'Basic plan'
  },
  {
    id: 'p5',
    customerId: '4',
    amount: 1299.99,
    status: 'successful',
    date: new Date('2023-04-10'),
    method: 'credit',
    description: 'Professional package'
  },
  {
    id: 'p6',
    customerId: '4',
    amount: 2321.76,
    status: 'successful',
    date: new Date('2023-03-15'),
    method: 'bank',
    description: 'Enterprise solution'
  },
  {
    id: 'p7',
    customerId: '5',
    amount: 699.99,
    status: 'pending',
    date: new Date('2023-04-22'),
    method: 'paypal',
    description: 'Standard plan'
  },
  {
    id: 'p8',
    customerId: '6',
    amount: 1245.00,
    status: 'successful',
    date: new Date('2023-03-28'),
    method: 'credit',
    description: 'Advanced package'
  },
  {
    id: 'p9',
    customerId: '7',
    amount: 875.50,
    status: 'failed',
    date: new Date('2023-04-05'),
    method: 'credit',
    description: 'Premium subscription'
  },
  {
    id: 'p10',
    customerId: '8',
    amount: 2110.25,
    status: 'successful',
    date: new Date('2023-04-12'),
    method: 'bank',
    description: 'Complete bundle'
  }
];

// Helper functions
export function getCustomerById(id: string): Customer | undefined {
  return customers.find(customer => customer.id === id);
}

export function getPaymentsByCustomerId(customerId: string): Payment[] {
  return payments.filter(payment => payment.customerId === customerId);
}

export function getRecentPayments(count: number = 5): Payment[] {
  return [...payments]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, count);
}

export function getTotalRevenue(): number {
  return payments
    .filter(payment => payment.status === 'successful')
    .reduce((total, payment) => total + payment.amount, 0);
}

export function getActiveCustomersCount(): number {
  return customers.filter(customer => customer.status === 'active').length;
}

export function getPendingPaymentsCount(): number {
  return payments.filter(payment => payment.status === 'pending').length;
}
