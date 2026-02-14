
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, Smartphone, User, Lock, ExternalLink, X, AlertCircle } from 'lucide-react';
import { formatPrice, initiateMoneyFusionPayment, checkMoneyFusionStatus } from '../services/storageService';

interface PaymentModalProps {
  price: number;
  currency: string;
  onSuccess: () => void;
  onClose: () => void;
  contentTitle?: string;
  contentId?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ price, currency, onSuccess, onClose, contentTitle = "Premium Content", contentId = "" }) => {
  const [status, setStatus] = useState<'idle' | 'initiating' | 'pending_user' | 'success' | 'error'>('idle');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, []);

  const startStatusPolling = (token: string) => {
    if (pollingRef.current) window.clearInterval(pollingRef.current);
    
    pollingRef.current = window.setInterval(async () => {
      try {
        const result = await checkMoneyFusionStatus(token);
        // Selon la doc : result.statut est vrai et result.data.statut est "paid"
        if (result.statut && result.data && result.data.statut === 'paid') {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          setStatus('success');
          setTimeout(() => {
            onSuccess();
          }, 1500);
        } else if (result.data && (result.data.statut === 'failure' || result.data.statut === 'no paid' || result.data.statut === 'cancelled')) {
           // On continue de poll sauf si c'est un échec définitif
           if (result.data.statut === 'failure' || result.data.statut === 'cancelled') {
              setErrorMsg("Le paiement a été annulé ou a échoué.");
              setStatus('idle');
              if (pollingRef.current) window.clearInterval(pollingRef.current);
           }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 4000); // Un peu plus rapide pour une meilleure UX
  };

  const handleMoneyFusionPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }

    setStatus('initiating');
    setErrorMsg('');

    try {
      const result = await initiateMoneyFusionPayment({
        price,
        title: contentTitle,
        phone,
        clientName,
        contentId
      });

      if (result.statut && result.url) {
        setPaymentToken(result.token);
        setStatus('pending_user');
        
        // Ouvrir l'URL de paiement dans un nouvel onglet
        window.open(result.url, '_blank');
        
        // Lancer la vérification automatique
        startStatusPolling(result.token);
      } else {
        throw new Error(result.message || "Erreur d'initialisation du paiement.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Impossible de contacter le service MoneyFusion.");
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {status === 'idle' && (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                <Smartphone className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Mobile Money</h3>
              <p className="text-slate-400 text-sm mt-1">Wave, Orange, MTN, Moov</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Prix total</span>
              <span className="text-2xl font-black text-white">{formatPrice(price, currency)}</span>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center space-x-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleMoneyFusionPay} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Votre Nom</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: Kouassi Koffi"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Numéro Mobile Money</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Smartphone className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0102030405"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>Payer avec Mobile Money</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-center space-x-2 pt-2">
              <Lock className="w-3 h-3 text-slate-600" />
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Sécurisé par MoneyFusion</span>
            </div>
          </div>
        )}

        {status === 'initiating' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <Smartphone className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-xl">Préparation...</p>
              <p className="text-slate-500 text-sm mt-1">Lien de paiement sécurisé en cours...</p>
            </div>
          </div>
        )}

        {status === 'pending_user' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
            <div className="text-center px-4">
              <p className="text-white font-bold text-xl">Validation en cours</p>
              <p className="text-slate-400 text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">
                Veuillez finaliser le paiement sur la fenêtre MoneyFusion qui vient de s'ouvrir.
              </p>
              <div className="mt-8 p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-[11px] text-slate-500 italic">
                Cette fenêtre se fermera automatiquement dès confirmation.
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border-4 border-emerald-500/20">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-white">Payé !</h3>
              <p className="text-slate-400 mt-2">Accès débloqué avec succès.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
