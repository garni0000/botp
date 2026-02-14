
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  BarChart, 
  ShieldAlert, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter,
  ArrowUpRight,
  Database,
  History,
  CheckCircle2,
  XCircle,
  Wallet,
  Check,
  X,
  Clock,
  Globe,
  Download,
  Upload
} from 'lucide-react';
import { 
  getAllUsers, 
  getContentList, 
  getTransactions, 
  deleteContentGlobal,
  getCurrentSession,
  getWithdrawalRequests,
  updateWithdrawalStatus,
  formatPrice
} from '../services/storageService';
import { User, LockedContent, Transaction, WithdrawalRequest } from '../types';
import { Navigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const session = getCurrentSession();
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'transactions' | 'withdrawals'>('content');
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<LockedContent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect Admin route manually just in case
  if (!session || session.user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [u, c, t, w] = await Promise.all([getAllUsers(), getContentList(), getTransactions(), getWithdrawalRequests()]);
    setUsers(u);
    setContent(c.reverse());
    setTransactions(t.reverse());
    setWithdrawals(w);
  };

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content? This action is permanent.')) {
      await deleteContentGlobal(id);
      loadData();
    }
  };

  const handleWithdrawalUpdate = async (id: string, status: 'completed' | 'rejected') => {
    await updateWithdrawalStatus(id, status);
    loadData();
  };

  // Stats calculation (Displaying in USD as base for simplicity)
  const totalVolume = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const platformRevenue = transactions.reduce((acc, tx) => acc + (tx.amount - tx.netAmount), 0);
  
  const filteredContent = content.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWithdrawals = withdrawals.filter(w => 
    w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Admin Control Center</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Platform Overview</h1>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search platform..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={<Users className="w-6 h-6 text-blue-400" />}
          label="Total Users"
          value={users.length.toString()}
          trend="+4% this week"
        />
        <StatCard 
          icon={<Layers className="w-6 h-6 text-purple-400" />}
          label="Total Locks"
          value={content.length.toString()}
          trend="8 newly created"
        />
        <StatCard 
          icon={<BarChart className="w-6 h-6 text-emerald-400" />}
          label="Platform Revenue"
          value={formatPrice(platformRevenue, 'USD')}
          trend="Estimated in USD"
        />
        <StatCard 
          icon={<Globe className="w-6 h-6 text-indigo-400" />}
          label="Total Volume"
          value={formatPrice(totalVolume, 'USD')}
          trend="Gross processed"
        />
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex border-b border-slate-800 bg-slate-950/50 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <TabButton 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')}
            icon={<Layers className="w-4 h-4" />}
            label="Content"
            count={content.length}
          />
          <TabButton 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
            icon={<Users className="w-4 h-4" />}
            label="Users"
            count={users.length}
          />
          <TabButton 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
            icon={<History className="w-4 h-4" />}
            label="Payments"
            count={transactions.length}
          />
          <TabButton 
            active={activeTab === 'withdrawals'} 
            onClick={() => setActiveTab('withdrawals')}
            icon={<Wallet className="w-4 h-4" />}
            label="Withdrawals"
            count={withdrawals.filter(w => w.status === 'pending').length}
          />
        </div>

        <div className="p-0 min-h-[400px]">
          {activeTab === 'content' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Media</th>
                    <th className="px-6 py-4">Title & Description</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Creator</th>
                    <th className="px-6 py-4">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredContent.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <img src={item.imageBase64} className="w-12 h-12 rounded-lg object-cover border border-slate-800 group-hover:border-slate-600 transition-colors" alt="" />
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-white font-medium truncate">{item.title}</div>
                        <div className="text-slate-500 text-xs truncate">{item.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-400 font-bold">{formatPrice(item.price, item.currency)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {users.find(u => u.id === item.creatorId)?.name || item.creatorId}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a 
                            href={`#/view/${item.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => handleDeleteContent(item.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Avatar</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Locks Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{u.name}</td>
                      <td className="px-6 py-4 text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {content.filter(c => c.creatorId === u.id).length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Tx ID</th>
                    <th className="px-6 py-4">Content</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Fee (Profit)</th>
                    <th className="px-6 py-4">Buyer</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.id}</td>
                      <td className="px-6 py-4 text-white font-medium">{tx.contentTitle}</td>
                      <td className="px-6 py-4 text-slate-300 font-bold">{formatPrice(tx.amount, tx.currency)}</td>
                      <td className="px-6 py-4">
                        <span className="text-indigo-400 font-bold">+{formatPrice(tx.amount - tx.netAmount, tx.currency)}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{tx.buyerMasked}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Creator</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredWithdrawals.length > 0 ? filteredWithdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{w.userName}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">{formatPrice(w.amount, w.currency)}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 capitalize">
                          {w.method.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm font-mono">{w.accountNumber}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(w.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {w.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleWithdrawalUpdate(w.id, 'completed')}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-500 transition-colors flex items-center text-xs font-bold"
                            >
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </button>
                            <button 
                              onClick={() => handleWithdrawalUpdate(w.id, 'rejected')}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors flex items-center text-xs font-bold"
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase ${w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {w.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {w.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        No withdrawal requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-slate-600 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{trend}</span>
    </div>
    <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
    <h3 className="text-3xl font-bold text-white">{value}</h3>
  </div>
);

const TabButton = ({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count: number }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-6 py-4 text-sm font-bold transition-all relative
      ${active ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}
    `}
  >
    {icon}
    <span>{label}</span>
    {count > 0 && (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>{count}</span>
    )}
    {active && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></div>}
  </button>
);

export default Admin;
