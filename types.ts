
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LockedContent {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageBase64: string; // Used for all media data in this demo
  mimeType: string;
  createdAt: number;
  creatorId: string;
  isUnlocked?: boolean;
}

export interface CreateContentForm {
  title: string;
  description: string;
  price: string;
  currency: string;
  file: File | null;
}

export interface Transaction {
  id: string;
  contentId: string;
  contentTitle: string;
  amount: number;
  netAmount: number; // After fees
  currency: string;
  timestamp: number;
  buyerMasked: string; // e.g. **** 4242
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  method: string;
  accountNumber: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: number;
}

export enum ViewState {
  LOADING,
  LOCKED,
  PROCESSING_PAYMENT,
  UNLOCKED,
  NOT_FOUND
}
