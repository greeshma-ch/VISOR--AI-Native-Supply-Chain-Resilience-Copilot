
import React from 'react';
import { MOCK_SUPPLIERS } from '../constants';
import { RiskStatus, Supplier, Disruption, User } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  Target,
  Lock
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
  user: User;
  categoryFilter: string;
  statusFilter: RiskStatus | 'ALL';
  onStatusFilterChange: (status: RiskStatus | 'ALL') => void;
  onNavigateToRegistry: () => void;
  onNavigateToFeed: () => void;
  onNavigateToResource: (title: string) => void;
  disruptions: Disruption[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  user,
  categoryFilter, 
  statusFilter, 
  onStatusFilterChange,
  onNavigateToRegistry,
  onNavigateToFeed,
  onNavigateToResource,
  disruptions
}) => {
  const channelSuppliers = MOCK_SUPPLIERS.filter(s => {
    return categoryFilter === 'ALL' || s.category === categoryFilter;
  });

  const getCountByStatus = (status: RiskStatus) => channelSuppliers.filter(s => s.status === status).length;

  const stableCount = getCountByStatus(RiskStatus.STABLE);
  const cautionCount = getCountByStatus(RiskStatus.CAUTION);
  const riskyCount = getCountByStatus(RiskStatus.RISKY);
  const totalCount = channelSuppliers.length;

  const chartData = [
    { name: 'Stable', value: stableCount, color: '#059669', percentage: Math.round((stableCount/totalCount)*100) || 0, id: RiskStatus.STABLE },
    { name: 'Caution', value: cautionCount, color: '#D97706', percentage: Math.round((cautionCount/totalCount)*100) || 0, id: RiskStatus.CAUTION },
    { name: 'Risky', value: riskyCount, color: '#DC2626', percentage: Math.round((riskyCount/totalCount)*100) || 0, id: RiskStatus.RISKY },
  ].filter(d => d.value > 0).map(item => ({
    ...item,
    color: statusFilter === 'ALL' || statusFilter === item.id ? item.color : `${item.color}44`
  }));

  const stats = [
    { id: 'ALL', label: 'Network Total', value: totalCount, icon: Target, color: 'text-slate-600', bg: 'bg-slate-100', status: 'ALL' },
    { id: RiskStatus.RISKY, label: 'High Risk Nodes', value: riskyCount, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', status: RiskStatus.RISKY },
    { id: RiskStatus.CAUTION, label: 'Active Caution', value: cautionCount, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', status: RiskStatus.CAUTION },
    { id: RiskStatus.STABLE, label: 'Operational Sync', value: stableCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', status: RiskStatus.STABLE },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0f1c] p-3 border border-white/10 shadow-xl rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{payload[0].name}</p>
          <p className="text-sm font-bold text-white">{payload[0].value} Suppliers ({payload[0].payload.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const getSyncFrequency = () => {
    switch (user.plan) {
      case 'Basic': return '24h Cycle';
      case 'Intermediate': return '6h Cycle';
      case 'Business': return 'Real-time';
      default: return '24h Cycle';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">Executive Intelligence</h2>
          <p className="text-slate-500 mt-2 font-medium flex flex-wrap items-center gap-2 text-xs sm:text-sm uppercase tracking-widest">
            <Clock size={16} className="text-blue-500" /> {getSyncFrequency()} Sync • completed {new Date().toLocaleTimeString()} • <span className="text-slate-200 font-bold">{categoryFilter}</span> Channel
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-3 bg-white/5 border border-white/10 text-slate-300 font-black rounded-xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest">
            Export
          </button>
          <button className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
            Resync <TrendingUp size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <button 
            key={stat.id} 
            onClick={() => onStatusFilterChange(stat.status as any)}
            className={`text-left bg-[#0a0f1c] p-6 sm:p-8 rounded-[2rem] border transition-all group relative overflow-hidden h-full ${
              statusFilter === stat.status 
                ? 'border-blue-500 shadow-xl shadow-blue-500/10' 
                : 'border-white/5 shadow-sm hover:border-white/10'
            }`}
          >
            <div className={`inline-flex p-4 sm:p-5 rounded-2xl bg-white/5 ${stat.color} mb-6 transition-transform group-hover:scale-110 shadow-inner items-center justify-center`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tighter">{stat.value}</h3>
            {statusFilter === stat.status && (
              <div className="absolute top-4 right-6 text-[8px] font-black text-blue-400 uppercase tracking-widest">Active Filter</div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-10">
        <div className="xl:col-span-2 bg-[#080c18] p-6 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[500px] sm:min-h-[600px]">
          {user.plan === 'Basic' && (
            <div className="absolute top-6 right-6 z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <Lock size={12} className="text-slate-500" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Customization Locked</span>
              </div>
            </div>
          )}
          <div className="absolute top-6 sm:top-10 left-6 sm:left-10">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Network Resilience</h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1 uppercase tracking-widest">Node status distribution</p>
          </div>
          
          <div className="w-full h-[250px] sm:h-[350px] md:h-[400px] mt-12 sm:mt-16">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={6}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-6 sm:mt-8">
              <p className="text-4xl sm:text-6xl font-black text-white tracking-tighter">
                {statusFilter === 'ALL' ? totalCount : channelSuppliers.filter(s => s.status === statusFilter).length}
              </p>
              <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-1">
                {statusFilter === 'ALL' ? 'Active Nodes' : `${statusFilter} Nodes`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-10 mt-8 justify-center">
            {chartData.map((item, i) => (
              <button 
                key={i} 
                onClick={() => onStatusFilterChange(item.id as RiskStatus)}
                className={`flex items-center gap-3 transition-all ${statusFilter !== 'ALL' && statusFilter !== item.id ? 'opacity-30 scale-95' : 'scale-100'}`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color.length > 7 ? item.color.slice(0, 7) : item.color}} />
                <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-500">{item.percentage}%</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#080c18] p-6 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-sm overflow-hidden flex flex-col min-h-[500px] sm:min-h-[600px]">
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Risk Signals</h3>
            <button 
              onClick={onNavigateToFeed}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
            >
              <ArrowUpRight size={18} className="text-white group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
          <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {disruptions.filter(d => categoryFilter === 'ALL' || d.type === categoryFilter || d.type === 'Logistics' || d.type === 'Weather').map((d) => (
              <button 
                key={d.id} 
                onClick={() => onNavigateToResource(d.title)}
                className="w-full text-left p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                    d.severity === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {d.severity} Priority
                  </span>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{d.type}</span>
                </div>
                <h4 className="font-black text-white text-sm sm:text-base leading-tight mb-2 truncate group-hover:text-blue-400 transition-colors">{d.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{d.summary}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
