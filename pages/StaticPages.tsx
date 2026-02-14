
import React from 'react';
import { Check, Shield, Zap, Globe, Lock, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Features: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Features built for Creators</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to monetize your digital assets securely and effortlessly.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureBlock 
          icon={<Shield className="w-6 h-6 text-indigo-400" />}
          title="Bank-Level Security"
          desc="Your content is AES-256 encrypted and only decrypted client-side after a confirmed payment."
        />
        <FeatureBlock 
          icon={<Zap className="w-6 h-6 text-yellow-400" />}
          title="Instant Payouts"
          desc="Withdraw your earnings immediately to your connected bank account or crypto wallet."
        />
        <FeatureBlock 
          icon={<Globe className="w-6 h-6 text-blue-400" />}
          title="Global Payments"
          desc="Accept payments from over 135 countries. We handle the currency conversion for you."
        />
        <FeatureBlock 
          icon={<Lock className="w-6 h-6 text-emerald-400" />}
          title="Smart Blur Technology"
          desc="We automatically generate enticing blurred previews to maximize conversion rates."
        />
        <FeatureBlock 
          icon={<CreditCard className="w-6 h-6 text-purple-400" />}
          title="Low Fees"
          desc="Keep 90% of your revenue. We only make money when you make money."
        />
        <FeatureBlock 
          icon={<Check className="w-6 h-6 text-pink-400" />}
          title="No Code Required"
          desc="Just upload, set a price, and share the link. No integration or technical skills needed."
        />
      </div>
      
      <div className="mt-16 text-center">
         <Link to="/create" className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:scale-105 transition-transform">Get Started Free</Link>
      </div>
    </div>
  );
};

export const Pricing: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
        <p className="text-slate-400">Start for free. Upgrade as you grow.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        {/* Starter Plan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
          <div className="text-3xl font-bold text-white mb-6">$0<span className="text-sm font-normal text-slate-500">/mo</span></div>
          <p className="text-slate-400 text-sm mb-6">Perfect for testing the waters.</p>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 mr-2 text-emerald-500"/> Unlimited Uploads</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 mr-2 text-emerald-500"/> 10% Platform Fee</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 mr-2 text-emerald-500"/> Standard Support</li>
          </ul>
          
          <Link to="/create" className="block w-full py-3 bg-slate-800 text-center rounded-lg text-white font-medium hover:bg-slate-700 transition-colors">Start Free</Link>
        </div>

        {/* Pro Plan */}
        <div className="bg-gradient-to-b from-indigo-900/50 to-slate-900 border border-indigo-500/50 rounded-2xl p-8 flex flex-col relative shadow-2xl">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
          <h3 className="text-xl font-bold text-white mb-2">Pro Creator</h3>
          <div className="text-3xl font-bold text-white mb-6">$29<span className="text-sm font-normal text-slate-500">/mo</span></div>
          <p className="text-indigo-200 text-sm mb-6">For serious creators scaling up.</p>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-white text-sm"><Check className="w-4 h-4 mr-2 text-indigo-400"/> Everything in Starter</li>
            <li className="flex items-center text-white text-sm"><Check className="w-4 h-4 mr-2 text-indigo-400"/> Reduced 5% Fee</li>
            <li className="flex items-center text-white text-sm"><Check className="w-4 h-4 mr-2 text-indigo-400"/> Priority Support</li>
            <li className="flex items-center text-white text-sm"><Check className="w-4 h-4 mr-2 text-indigo-400"/> Custom Branding</li>
          </ul>
          
          <button className="block w-full py-3 bg-indigo-600 text-center rounded-lg text-white font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25">Upgrade Now</button>
        </div>

        {/* Enterprise */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
          <div className="text-3xl font-bold text-white mb-6">Custom</div>
          <p className="text-slate-400 text-sm mb-6">For high volume agencies.</p>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 mr-2 text-emerald-500"/> Volume Discounts</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 mr-2 text-emerald-500"/> API Access</li>
            <li className="flex items-center text-slate-300 text-sm"><Check className="w-4 h-4 mr-2 text-emerald-500"/> Dedicated Account Manager</li>
          </ul>
          
          <button className="block w-full py-3 bg-slate-800 text-center rounded-lg text-white font-medium hover:bg-slate-700 transition-colors">Contact Sales</button>
        </div>

      </div>
    </div>
  );
};

const FeatureBlock = ({icon, title, desc}: {icon: React.ReactNode, title: string, desc: string}) => (
  <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
    <div className="bg-slate-950 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-slate-800">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);
