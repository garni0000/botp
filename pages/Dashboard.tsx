
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  ArrowUpRight, 
  Package, 
  Clock, 
  Download, 
  AlertCircle,
  Loader2,
  CheckCircle,
  Coins
} from 'lucide-react';
import { getBalance, getTransactions, getContentList, formatPrice } from '../services/storageService';
import { Transaction, LockedContent } from '../types';
import WithdrawalModal from '../components/WithdrawalModal';

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contents, setContents] = useState<LockedContent[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [bal, txs, items] = await Promise.all([getBalance(), getTransactions(), getContentList()]);
    setBalance(bal);
    setTransactions(txs);
    setContents(items.reverse());
  };

  const handleWithdrawSuccess = async () => {
    // For the demo, we assume the user withdraws in USD or their local currency equivalent
    setBalance(0);
    setIsWithdrawModalOpen(false);
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 3000);
    loadData(); // Refresh data
  };

  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.netAmount, 0);
  // Default currency for balance display - in production, this would be per currency
  const mainCurrency = contents.length > 0 ? contents[0].currency : 'USD';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your earnings and content.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link 
            to="/create" 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            Create New Lock
          </Link>
          <button className="px-4 py-2 bg-indigo-600/10 text-indigo-400 rounded-lg text-sm font-medium border border-indigo-500/20 cursor-default">
            Pro Plan Active
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-slate-400 font-medium mb-1 flex items-center">
            Estimated Balance
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">Live</span>
          </p>
          <h2 className="text-4xl font-bold text-white mb-6">{formatPrice(balance, mainCurrency)}</h2>
          
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={balance <= 0}
            className={`
              w-full py-2.5 rounded-lg font-medium flex items-center justify-center transition-all
              ${balance > 0 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
            `}
          >
            {withdrawSuccess ? (
              <><CheckCircle className="w-5 h-5 mr-2" /> Request Sent</>
            ) : (
              <><CreditCard className="w-4 h-4 mr-2" /> Withdraw Funds</>
            )}
          </button>
        </div>

        {/* Total Earnings */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 font-medium mb-1">Lifetime Revenue</p>
              <h2 className="text-3xl font-bold text-white">{formatPrice(totalRevenue, mainCurrency)}</h2>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div className="mt-6 flex items-center text-sm">
             <span className="text-emerald-400 flex items-center font-medium">
               <ArrowUpRight className="w-4 h-4 mr-1" />
               +12.5%
             </span>
             <span className="text-slate-500 ml-2">vs last month</span>
          </div>
        </div>

        {/* Total Sales Count */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 font-medium mb-1">Total Sales</p>
              <h2 className="text-3xl font-bold text-white">{transactions.length}</h2>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-6 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[70%]"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">70% to sales goal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{tx.contentTitle}</div>
                        <div className="text-xs text-slate-500 font-mono">ID: {tx.contentId.substring(0,8)}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{tx.buyerMasked}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-emerald-400 font-bold">+{formatPrice(tx.netAmount, tx.currency)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                <p>No sales yet. Share your links to start earning!</p>
              </div>
            )}
          </div>
        </div>

        {/* Your Content List (Mini) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white">Active Content</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-3 custom-scrollbar">
            {contents.length > 0 ? (
               contents.map(item => (
                 <div key={item.id} className="flex items-center p-3 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-indigo-500/30 transition-colors">
                    <img src={item.imageBase64} className="w-12 h-12 rounded object-cover opacity-70" alt="" />
                    <div className="ml-3 flex-1 min-w-0">
                       <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                       <div className="flex items-center mt-1">
                          <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                             {formatPrice(item.price, item.currency)}
                          </span>
                       </div>
                    </div>
                    <Link to={`/view/${item.id}`} className="p-2 text-slate-400 hover:text-white">
                       <ArrowUpRight className="w-4 h-4" />
                    </Link>
                 </div>
               ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No active locks.</p>
                <Link to="/create" className="text-indigo-400 text-sm mt-2 block hover:underline">Create one now</Link>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950/30">
            <Link to="/" className="text-sm text-center block text-slate-400 hover:text-white">View All Content</Link>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <WithdrawalModal 
          balance={balance}
          currency={mainCurrency}
          onClose={() => setIsWithdrawModalOpen(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
