
import React, { useState } from 'react';
import { Loader2, CheckCircle, CreditCard, User, Hash, Wallet, X } from 'lucide-react';
import { createWithdrawalRequest, formatPrice } from '../services/storageService';

interface WithdrawalModalProps {
  balance: number;
  currency: string;
  onSuccess: () => void;
  onClose: () => void;
}

export interface WithdrawalData {
  name: string;
  accountNumber: string;
  method: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ balance, currency, onSuccess, onClose }) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [form, setForm] = useState<WithdrawalData>({
    name: '',
    accountNumber: '',
    method: 'bank_transfer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.accountNumber) return;

    setStatus('processing');
    
    try {
      await createWithdrawalRequest({
        amount: balance,
        currency: currency,
        method: form.method,
        accountNumber: form.accountNumber,
        name: form.name
      });
      
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error("Withdrawal error:", err);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none"></div>

        {status === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                <p className="text-slate-500 text-xs mt-0.5">Available: <span className="text-emerald-400 font-bold">{formatPrice(balance, currency)}</span></p>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name (Account Holder)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Account Number / Phone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Account / Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="+225 00000000 or IBAN"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Payment Method</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Wallet className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <select
                    value={form.method}
                    onChange={(e) => setForm(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white appearance-none focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                    <option value="mobile_money">Mobile Money (Orange/MTN)</option>
                    <option value="crypto">Cryptocurrency (USDT)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center"
              >
                Request Withdrawal
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">Withdrawals are processed within 24-48 hours</p>
          </form>
        )}

        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">Submitting Request</p>
              <p className="text-slate-500 text-sm">Recording withdrawal data...</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">Request Received!</h3>
              <p className="text-slate-400 mt-1 max-w-[200px] mx-auto text-sm">
                Your {formatPrice(balance, currency)} request is pending administrator approval.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalModal;
