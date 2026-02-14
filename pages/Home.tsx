
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getContentList } from '../services/storageService';
import { LockedContent } from '../types';
import { ArrowRight, Lock, DollarSign, Image as ImageIcon, Film } from 'lucide-react';

const Home: React.FC = () => {
  const [userContent, setUserContent] = useState<LockedContent[]>([]);

  useEffect(() => {
    getContentList().then(data => setUserContent(data.reverse()));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Media</span> into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Revenue</span>.
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Upload any photo or video, set a price, and get a secure link. Content stays blurred until your customer pays. No coding required.
        </p>
        <Link 
          to="/create"
          className="inline-flex items-center px-8 py-4 bg-white text-slate-900 font-bold rounded-full text-lg shadow-xl shadow-white/10 hover:scale-105 transition-transform"
        >
          Start Selling Now
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>

      {userContent.length > 0 && (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Active Locks</h2>
              <span className="text-sm text-slate-500">{userContent.length} items</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userContent.map((item) => {
                const isVideo = item.mimeType?.startsWith('video/');
                return (
                  <Link to={`/view/${item.id}`} key={item.id} className="block group">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                      <div className="relative h-48 bg-slate-950 overflow-hidden">
                        {isVideo ? (
                          <video src={item.imageBase64} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" muted />
                        ) : (
                          <img src={item.imageBase64} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                          {isVideo ? <Film className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                          {isVideo ? 'Video' : 'Image'}
                        </div>
                        <div className="absolute top-2 left-2 bg-emerald-500/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center text-xs font-bold text-white">
                          <DollarSign className="w-3 h-3 mr-0.5" />
                          {item.price.toFixed(2)}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <div className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium text-sm shadow-lg">View Link</div>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">{item.title}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2">{item.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-600 pt-4 border-t border-slate-800/50">
                          <span>ID: {item.id}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
           </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 mt-12">
         <FeatureCard 
           icon={<Film className="w-6 h-6 text-indigo-400" />}
           title="Universal Media"
           desc="Support for 4K photos and HD videos. We handle the heavy lifting of processing previews."
         />
         <FeatureCard 
           icon={<Lock className="w-6 h-6 text-purple-400" />}
           title="Secure Link"
           desc="Content is AES encrypted and blurred in real-time. Only revealed after confirmed payment."
         />
         <FeatureCard 
           icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
           title="Get Paid Fast"
           desc="Global payouts to 130+ countries. Withdraw your earnings at any time from your dashboard."
         />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default Home;
