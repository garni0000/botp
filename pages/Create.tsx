
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, Film, Image as ImageIcon, Loader2, DollarSign, Lock, Coins } from 'lucide-react';
import { fileToBase64, generateId, saveContent, getCurrentSession, formatPrice } from '../services/storageService';
import { generateDescriptionFromMedia } from '../services/geminiService';
import { CreateContentForm, LockedContent } from '../types';

const Create: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = getCurrentSession();
  
  const [form, setForm] = useState<CreateContentForm>({
    title: '',
    description: '',
    price: '4.99',
    currency: 'USD',
    file: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, file }));
      setMimeType(file.type);
      const base64 = await fileToBase64(file);
      setPreview(base64);
    }
  };

  const handleAiGenerate = async () => {
    if (!preview || !mimeType) return;
    setIsAiLoading(true);
    try {
      const data = await generateDescriptionFromMedia(preview, mimeType);
      setForm(prev => ({
        ...prev,
        title: data.title,
        description: data.description
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file || !preview || !form.title || !session) return;

    setIsSubmitting(true);

    try {
      const newContent: LockedContent = {
        id: generateId(),
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        currency: form.currency,
        imageBase64: preview,
        mimeType: mimeType,
        createdAt: Date.now(),
        creatorId: session.user.id,
      };

      await saveContent(newContent);
      
      setTimeout(() => {
        navigate(`/view/${newContent.id}`);
      }, 800);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVideo = mimeType.startsWith('video/');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Create a New Lock</h1>
        <p className="text-slate-400">Upload your premium media, set a price, and get a shareable link.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Content (Image or Video)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative group border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center
                ${preview ? 'border-indigo-500 bg-slate-800/50' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              
              {preview ? (
                <div className="relative w-full aspect-video md:aspect-[2/1] rounded-lg overflow-hidden bg-slate-950">
                  {isVideo ? (
                    <video src={preview} className="w-full h-full object-contain" muted loop autoPlay playsInline />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-medium">Click to change media</p>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center">
                    {isVideo ? <Film className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                    {isVideo ? 'Video' : 'Image'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition-colors">
                    <Upload className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-lg font-medium text-white">Click to upload media</p>
                  <p className="text-sm text-slate-500 mt-1">High-quality Images or Videos</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <label className="block text-sm font-medium text-slate-300">Title</label>
                   {preview && !form.title && (
                     <button
                       type="button"
                       onClick={handleAiGenerate}
                       disabled={isAiLoading}
                       className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center"
                     >
                       {isAiLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                       AI Auto-Fill
                     </button>
                   )}
                 </div>
                 <input
                   type="text"
                   required
                   value={form.title}
                   onChange={(e) => setForm(prev => ({...prev, title: e.target.value}))}
                   placeholder="e.g. Secret Beach Drone Shot"
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                 />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-medium text-slate-300">Description</label>
                 <textarea
                   rows={4}
                   value={form.description}
                   onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))}
                   placeholder="Describe what the user will unlock..."
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                 />
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-slate-300">Price & Currency</label>
                 <div className="flex space-x-2">
                   <div className="relative flex-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Coins className="h-5 w-5 text-slate-500" />
                     </div>
                     <input
                       type="number"
                       required
                       min="0.50"
                       step="0.01"
                       value={form.price}
                       onChange={(e) => setForm(prev => ({...prev, price: e.target.value}))}
                       className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                     />
                   </div>
                   <select
                     value={form.currency}
                     onChange={(e) => setForm(prev => ({...prev, currency: e.target.value}))}
                     className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-bold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                   >
                     <option value="USD">USD ($)</option>
                     <option value="EUR">EUR (€)</option>
                     <option value="XOF">XOF (CFA)</option>
                   </select>
                 </div>
                 <p className="text-xs text-slate-500">
                   You receive: <span className="text-emerald-400 font-medium">{formatPrice(parseFloat(form.price || '0') * 0.9, form.currency)}</span> (10% platform fee)
                 </p>
               </div>

               <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-indigo-400" />
                    Blurred Preview
                  </h4>
                  <div className="relative h-24 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                    {preview ? (
                      <>
                        {isVideo ? (
                          <video src={preview} className="w-full h-full object-cover filter blur-[4px]" muted loop autoPlay playsInline />
                        ) : (
                          <img src={preview} className="w-full h-full object-cover filter blur-[4px]" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Lock className="w-6 h-6 text-white/80" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs text-center px-4">
                        Upload media to see preview
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={!preview || isSubmitting}
              className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all
                ${!preview 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 transform active:scale-[0.99]'}
              `}
            >
              {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : `Create ${form.currency} Lock`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Create;
