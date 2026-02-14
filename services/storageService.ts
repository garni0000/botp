
import { LockedContent, Transaction, User, AuthSession, WithdrawalRequest } from '../types';

const SESSION_KEY = 'paylock_session_v1';

// Format utility
export const formatPrice = (amount: number, currency: string = 'USD') => {
  if (currency === 'XOF') return `${amount.toLocaleString()} CFA`;
  if (currency === 'EUR') return `€${amount.toFixed(2)}`;
  return `$${amount.toFixed(2)}`;
};

// API MoneyFusion via Backend: Initialiser le paiement
export const initiateMoneyFusionPayment = async (data: {
  price: number;
  title: string;
  phone: string;
  clientName: string;
  contentId: string;
}) => {
  try {
    const response = await fetch('/api/payment/initiate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalPrice: data.price,
        title: data.title,
        phone: data.phone,
        clientName: data.clientName,
        contentId: data.contentId,
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Erreur serveur");
    }
    return await response.json();
  } catch (error) {
    console.error("Payment API Error:", error);
    throw error;
  }
};

// API MoneyFusion via Backend: Vérifier l'état (Polling)
export const checkMoneyFusionStatus = async (token: string) => {
  try {
    const response = await fetch(`/api/payment/status/${token}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Erreur de vérification");
    }
    return await response.json();
  } catch (error) {
    console.error("Status Check Error:", error);
    throw error;
  }
};

// Authentication Management
export const signup = async (name: string, email: string, password: string): Promise<AuthSession> => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erreur lors de l'inscription");
  }
  
  const data = await response.json();
  const session: AuthSession = { user: data.user, token: data.token };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const login = async (email: string, password: string): Promise<AuthSession> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Email ou mot de passe invalide");
  }
  
  const data = await response.json();
  const session: AuthSession = { user: data.user, token: data.token };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentSession = (): AuthSession | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) return [];
  return await response.json();
};

// Content Management
export const saveContent = async (content: LockedContent): Promise<void> => {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: content.title,
      description: content.description,
      price: content.price,
      currency: content.currency,
      imageBase64: content.imageBase64,
      mimeType: content.mimeType,
      creatorId: content.creatorId,
    }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Erreur lors de la sauvegarde");
  }
  
  const data = await response.json();
  content.id = data.id;
};

export const getContentList = async (): Promise<LockedContent[]> => {
  const response = await fetch('/api/content');
  if (!response.ok) return [];
  return await response.json();
};

export const getContentById = async (id: string): Promise<LockedContent | undefined> => {
  const response = await fetch(`/api/content/${id}`);
  if (!response.ok) return undefined;
  return await response.json();
};

export const deleteContentGlobal = async (id: string): Promise<void> => {
  await fetch(`/api/content/${id}`, { method: 'DELETE' });
};

// Financial & Transaction Management
export const recordTransaction = async (contentId: string, amount: number, contentTitle: string, currency: string = 'USD'): Promise<void> => {
  await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId, amount, contentTitle, currency }),
  });
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch('/api/transactions');
  if (!response.ok) return [];
  return await response.json();
};

export const getBalance = async (): Promise<number> => {
  const transactions = await getTransactions();
  const withdrawals = await getWithdrawalRequests();
  const totalEarned = transactions.reduce((acc, tx) => acc + tx.netAmount, 0);
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed' || w.status === 'pending')
    .reduce((acc, w) => acc + w.amount, 0);
  return totalEarned - totalWithdrawn;
};

// Withdrawal Management
export const createWithdrawalRequest = async (data: { amount: number, currency: string, method: string, accountNumber: string, name: string }): Promise<void> => {
  const session = getCurrentSession();
  if (!session) return;

  await fetch('/api/withdrawals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: session.user.id,
      userName: data.name,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      accountNumber: data.accountNumber,
    }),
  });
};

export const getWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  const response = await fetch('/api/withdrawals');
  if (!response.ok) return [];
  return await response.json();
};

export const updateWithdrawalStatus = async (id: string, status: 'completed' | 'rejected'): Promise<void> => {
  await fetch(`/api/withdrawals/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};
