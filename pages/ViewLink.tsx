
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Lock, Download, Check, ExternalLink, AlertTriangle, Copy, Film, Image as ImageIcon } from 'lucide-react';
import { getContentById, recordTransaction, formatPrice } from '../services/storageService';
import { LockedContent, ViewState } from '../types';
import PaymentModal from '../components/PaymentModal';

const ViewLink: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<LockedContent | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.LOADING);
  const [showPayment, setShowPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getContentById(id).then(data => {
      if (data) {
        setContent(data);
        setViewState(ViewState.LOCKED);
      } else {
        setViewState(ViewState.NOT_FOUND);
      }
    });
  }, [id]);

  const handleUnlock = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    if (content) {
       await recordTransaction(content.id, content.price, content.title, content.currency);
    }
    setShowPayment(false);
    setViewState(ViewState.UNLOCKED);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (viewState === ViewState.LOADING) return <div className="h-[80vh] flex items-center justify-center text-slate-500">Chargement...</div>;
  
  if (viewState === ViewState.NOT_FOUND) return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-500/10 p-4 rounded-full mb-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Contenu non trouvé</h1>
      <p className="text-slate-400 max-w-md mb-8">Ce lien pourrait être invalide ou supprimé.</p>
      <Link to="/" className="px-6 py-3 bg-slate-800 rounded-lg text-white font-medium hover:bg-slate-700">Accueil</Link>
    </div>
  );

  const isVideo = content?.mimeType?.startsWith('video/');
  const isUnlocked = viewState === ViewState.UNLOCKED;

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center relative overflow-hidden">
      <div className="fixed inset-0 z-0">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-4xl z-10 relative">
        <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                 {content?.creatorId.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-sm">
                 <p className="text-slate-300 font-medium">@{content?.creatorId}</p>
                 <p className="text-slate-500">Partagé via PayLock</p>
              </div>
            </div>
            
            <button 
              onClick={copyLink}
              className="text-slate-400 hover:text-white transition-colors flex items-center text-xs sm:text-sm bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? 'Lien copié' : 'Partager'}
            </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2">
            
            <div className="relative bg-black min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden group">
              {content?.imageBase64 && (
                isVideo ? (
                  <video 
                    src={content.imageBase64} 
                    className={`
                      absolute inset-0 w-full h-full object-cover transition-all duration-1000
                      ${!isUnlocked ? 'filter blur-[40px] scale-110 opacity-60' : 'filter blur-0 scale-100 opacity-100'}
                    `}
                    muted={!isUnlocked}
                    loop={!isUnlocked}
                    autoPlay={!isUnlocked}
                    playsInline
                    controls={isUnlocked}
                  />
                ) : (
                  <img 
                    src={content.imageBase64} 
                    alt="Locked Content"
                    className={`
                      absolute inset-0 w-full h-full object-cover transition-all duration-1000
                      ${!isUnlocked ? 'filter blur-[40px] scale-110 opacity-60' : 'filter blur-0 scale-100 opacity-100'}
                    `}
                  />
                )
              )}

              {viewState === ViewState.LOCKED && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center bg-black/20">
                  <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-full mb-6 border border-slate-700 shadow-xl">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Contenu verrouillé</h3>
                  <p className="text-slate-300 text-sm max-w-xs mb-8">
                    Pour débloquer cette {isVideo ? 'vidéo' : 'image'} premium, veuillez effectuer le paiement sécurisé.
                  </p>
                  <button 
                    onClick={handleUnlock}
                    className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Débloquer pour {formatPrice(content?.price || 0, content?.currency)}
                      <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                  <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-widest">Paiement Mobile Money via MoneyFusion</p>
                </div>
              )}

              {isUnlocked && (
                <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="inline-flex items-center px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-lg text-sm font-medium border border-white/10">
                    <Check className="w-4 h-4 mr-2 text-emerald-400" />
                    Débloqué
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-wider mb-6 w-fit">
                {isVideo ? <Film className="w-3 h-3 mr-1.5" /> : <ImageIcon className="w-3 h-3 mr-1.5" />}
                {isVideo ? 'VIDEO PREMIUM' : 'IMAGE PREMIUM'}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {content?.title}
              </h1>
              
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                {content?.description}
              </p>

              <div className="mt-auto pt-8 border-t border-slate-800">
                <div className="flex items-center justify-between text-sm">
                   <span className="text-slate-500">Type de fichier</span>
                   <span className="text-slate-300 font-medium">{isVideo ? 'MP4 / MOV' : 'Image Haute-Res'}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                   <span className="text-slate-500">Protection</span>
                   <span className="text-emerald-400 font-medium flex items-center">
                     <Check className="w-3 h-3 mr-1" /> Vérifié Sûr
                   </span>
                </div>
                
                {isUnlocked && (
                   <div className="mt-8 space-y-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-emerald-400 font-bold text-sm">Déblocage réussi</h4>
                          <p className="text-emerald-500/70 text-xs mt-1">Vous avez maintenant accès au fichier original.</p>
                        </div>
                      </div>
                      
                      <a 
                        href={content?.imageBase64} 
                        download={`paylock_${content?.id}.${isVideo ? 'mp4' : 'png'}`}
                        className="flex items-center justify-center w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all border border-slate-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger le fichier original
                      </a>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPayment && content && (
        <PaymentModal 
          price={content.price} 
          currency={content.currency}
          contentTitle={content.title}
          contentId={content.id}
          onSuccess={handlePaymentSuccess} 
          onClose={() => setShowPayment(false)} 
        />
      )}
    </div>
  );
};

const CheckCircleIcon = ({className}:{className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
)

export default ViewLink;
