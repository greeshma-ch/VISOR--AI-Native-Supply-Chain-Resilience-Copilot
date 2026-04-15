
import React, { useState, useEffect } from 'react';
import { MOCK_SUPPLIERS } from '../constants';
import { Disruption, RiskStatus, Supplier } from '../types';
import { Activity, Zap, ShieldAlert, Target, Globe, ChevronDown, ChevronUp, Map as MapIcon, Layers, CloudRain, CloudLightning, Wind, Sun, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MapViewProps {
  suppliers: Supplier[];
  categoryFilter: string;
  statusFilter: RiskStatus | 'ALL';
  onSelectSupplier: (s: Supplier) => void;
  hqLocation?: [number, number];
  disruptions?: Disruption[];
}

const MapView: React.FC<MapViewProps> = ({ suppliers, categoryFilter, statusFilter, onSelectSupplier, hqLocation = [37.7749, -122.4194], disruptions = [] }) => {
  const [hovered, setHovered] = useState<Supplier | null>(null);
  const [hoveredAlert, setHoveredAlert] = useState<Disruption | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'SATELLITE' | 'WEATHER'>('SATELLITE');

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const weatherAlerts = disruptions.filter(d => d.type === 'Weather');

  const getCoordinates = (lat: number, lng: number) => {
    // Mercator-ish projection for mock SVG space
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  const hqPos = getCoordinates(hqLocation[0], hqLocation[1]);

  const chartData = [
    { name: 'Stable', value: Math.round((suppliers.filter(s => s.status === RiskStatus.STABLE).length / suppliers.length) * 100), color: '#10b981' },
    { name: 'Caution', value: Math.round((suppliers.filter(s => s.status === RiskStatus.CAUTION).length / suppliers.length) * 100), color: '#f59e0b' },
    { name: 'Risky', value: Math.round((suppliers.filter(s => s.status === RiskStatus.RISKY).length / suppliers.length) * 100), color: '#f43f5e' },
  ];

  const getWeatherIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('thunderstorm')) return <CloudLightning className="w-3 h-3 text-amber-400" />;
    if (t.includes('rain')) return <CloudRain className="w-3 h-3 text-blue-400" />;
    if (t.includes('wind')) return <Wind className="w-3 h-3 text-slate-300" />;
    return <Sun className="w-3 h-3 text-amber-200" />;
  };

  return (
    <div className="flex flex-col xl:flex-row h-full animate-in fade-in duration-700 bg-[#070b14] overflow-hidden">
      {/* Map Canvas / Google Maps Simulation */}
      <div className="h-[40%] sm:h-[50%] xl:h-full xl:flex-1 relative overflow-hidden bg-[#070b14] min-h-[200px] sm:min-h-[300px] xl:min-h-0 shrink-0">
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Initializing Global Grid...</p>
             </div>
          </div>
        ) : (
          <>
            {/* Real-time Satellite Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', 
                   backgroundSize: '40px 40px',
                 }} />
            
            {/* Subtle Map Glow */}
            <div className="absolute inset-0 bg-radial-at-c from-blue-600/5 to-transparent pointer-events-none" />
 
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full preserve-3d">
              {/* Connection Lines from HQ to Suppliers */}
              {filteredSuppliers.map(s => {
                const pos = getCoordinates(s.coordinates[0], s.coordinates[1]);
                const isRisky = s.status === RiskStatus.RISKY;
                return (
                    <path 
                      key={`line-${s.id}`}
                      d={`M ${hqPos.x} ${hqPos.y} Q ${(hqPos.x + pos.x) / 2} ${(hqPos.y + pos.y) / 2 - 5} ${pos.x} ${pos.y}`}
                      fill="none"
                      stroke={isRisky ? '#f43f5e' : '#2563eb'} 
                      strokeWidth="0.15" 
                      strokeDasharray={isRisky ? "0.2,0.2" : "0.5,0.5"}
                      className={`${isRisky ? 'animate-pulse opacity-60' : 'opacity-30'}`}
                    />
                );
              })}

              {/* HQ Marker */}
              <g className="hq-marker">
                <circle cx={hqPos.x} cy={hqPos.y} r="3" fill="#2563eb" className="animate-ping opacity-20" />
                <circle cx={hqPos.x} cy={hqPos.y} r="1.8" fill="#2563eb" className="shadow-[0_0_20px_#2563eb]" />
                <circle cx={hqPos.x} cy={hqPos.y} r="0.6" fill="white" />
                <text x={hqPos.x} y={hqPos.y - 4} textAnchor="middle" fill="#2563eb" className="text-[2px] font-black uppercase tracking-[0.3em]">Enterprise HQ</text>
              </g>

              {/* Weather Layer */}
              {activeLayer === 'WEATHER' && weatherAlerts.map(alert => {
                // Find the first impacted supplier to place the alert icon
                const firstSupplier = suppliers.find(s => alert.impactedSuppliers.includes(s.id));
                if (!firstSupplier) return null;
                const pos = getCoordinates(firstSupplier.coordinates[0], firstSupplier.coordinates[1]);
                const isHighSeverity = alert.severity === 'High';
                
                return (
                  <g key={alert.id} className="animate-in fade-in duration-500">
                    <circle 
                      cx={pos.x} cy={pos.y} r={isHighSeverity ? 6 : 4} 
                      fill={isHighSeverity ? 'rgba(245,158,11,0.1)' : 'rgba(37,99,235,0.1)'} 
                      className="animate-pulse"
                    />
                    <foreignObject x={pos.x - 2} y={pos.y - 2} width="4" height="4">
                      <div 
                        className="w-full h-full flex items-center justify-center cursor-help"
                        onMouseEnter={() => setHoveredAlert(alert)}
                        onMouseLeave={() => setHoveredAlert(null)}
                      >
                        {alert.weatherIcon ? (
                          <img 
                            src={`https://openweathermap.org/img/wn/${alert.weatherIcon}@2x.png`} 
                            alt={alert.title}
                            className="w-full h-full drop-shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          alert.title.toLowerCase().includes('thunderstorm') ? <CloudLightning className="w-full h-full text-amber-400 drop-shadow-lg" /> : <CloudRain className="w-full h-full text-blue-400 drop-shadow-lg" />
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}

              {/* Supplier Markers */}
              {filteredSuppliers.map(s => {
                const pos = getCoordinates(s.coordinates[0], s.coordinates[1]);
                const color = s.status === RiskStatus.RISKY ? '#f43f5e' : s.status === RiskStatus.CAUTION ? '#f59e0b' : '#10b981';
                const isHovered = hovered?.id === s.id;
                
                return (
                  <g 
                    key={s.id} 
                    className="cursor-pointer group"
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelectSupplier(s)}
                  >
                    {s.status === RiskStatus.RISKY && (
                      <circle 
                        cx={pos.x} cy={pos.y} r="3" 
                        fill="none"
                        stroke={color}
                        strokeWidth="0.1"
                        className="animate-ping opacity-40"
                      />
                    )}
                    <circle 
                      cx={pos.x} cy={pos.y} r={isHovered ? 2.5 : 1.8} 
                      fill={`${color}22`} 
                      className="transition-all duration-300"
                    />
                    <circle 
                      cx={pos.x} cy={pos.y} r={isHovered ? 1 : 0.8} 
                      fill={color} 
                      className="transition-all duration-300 shadow-[0_0_10px_currentColor]"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Overlays */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col items-start gap-2 z-20">
              <div className="bg-[#070b14]/80 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-2xl transition-all hover:bg-[#070b14]">
                <h4 className="text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Region</h4>
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-600/20 rounded-md">
                    <Globe className="text-blue-400 w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-white tracking-tight">{categoryFilter === 'ALL' ? 'Global Grid' : categoryFilter}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setActiveLayer('SATELLITE')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 backdrop-blur-xl border border-white/10 rounded-lg transition-all ${activeLayer === 'SATELLITE' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-[#070b14]/80 text-slate-400 hover:text-white'}`}
                >
                  <Layers className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Satellite</span>
                </button>
                <button 
                  onClick={() => setActiveLayer('WEATHER')}
                  className={`flex items-center gap-1.5 px-2 py-1.5 backdrop-blur-xl border border-white/10 rounded-lg transition-all ${activeLayer === 'WEATHER' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-[#070b14]/80 text-slate-400 hover:text-white'}`}
                >
                  <CloudRain className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Weather</span>
                </button>
              </div>
            </div>

            {/* Weather Alert Tooltip */}
            {hoveredAlert && (
              <div 
                className="absolute z-[60] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                style={{ 
                  left: `${getCoordinates(suppliers.find(s => hoveredAlert.impactedSuppliers.includes(s.id))?.coordinates[0] || 0, suppliers.find(s => hoveredAlert.impactedSuppliers.includes(s.id))?.coordinates[1] || 0).x}%`, 
                  top: `${getCoordinates(suppliers.find(s => hoveredAlert.impactedSuppliers.includes(s.id))?.coordinates[0] || 0, suppliers.find(s => hoveredAlert.impactedSuppliers.includes(s.id))?.coordinates[1] || 0).y - 12}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-amber-950/90 border border-amber-500/30 rounded-2xl shadow-2xl px-5 py-4 min-w-[280px] backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{hoveredAlert.title}</span>
                      <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">{hoveredAlert.severity} Severity</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{hoveredAlert.summary}</p>
                </div>
                <div className="w-3 h-3 bg-amber-950/90 border-r border-b border-amber-500/30 rotate-45 mx-auto -mt-1.5" />
              </div>
            )}

            {hovered && (
              <div 
                className="absolute z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                style={{ 
                  left: `${getCoordinates(hovered.coordinates[0], hovered.coordinates[1]).x}%`, 
                  top: `${getCoordinates(hovered.coordinates[0], hovered.coordinates[1]).y - 10}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-[#070b14] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-4 py-3 flex items-center gap-4 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center font-black text-blue-400 text-sm">
                    {hovered.name.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-bold text-white whitespace-nowrap">{hovered.name}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{hovered.location}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${hovered.status === RiskStatus.RISKY ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]' : hovered.status === RiskStatus.CAUTION ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${hovered.status === RiskStatus.RISKY ? 'text-rose-500' : hovered.status === RiskStatus.CAUTION ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {hovered.status}
                    </span>
                  </div>
                </div>
                {/* Tooltip Arrow */}
                <div className="w-3 h-3 bg-[#070b14] border-r border-b border-white/10 rotate-45 mx-auto -mt-1.5 shadow-xl" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Responsive Telemetry Panel */}
      <div className={`${isPanelCollapsed ? 'xl:w-16' : 'xl:w-96'} w-full bg-[#070b14]/60 backdrop-blur-2xl border-t xl:border-t-0 xl:border-l border-white/10 flex flex-col transition-all duration-500 ease-in-out shadow-2xl flex-1 xl:flex-none xl:h-full overflow-hidden relative`}>
        <div className={`flex ${isPanelCollapsed ? 'xl:flex-col xl:justify-center' : 'justify-between'} items-center p-4 sm:p-6 border-b border-white/10 bg-white/5`}>
          <div className={`flex items-center gap-3 transition-all duration-300 ${isPanelCollapsed ? 'xl:hidden' : 'opacity-100'}`}>
            <Target size={24} className="text-blue-400" />
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Telemetry</h3>
          </div>
          <button 
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white ${isPanelCollapsed ? 'xl:mx-auto' : ''}`}
            title={isPanelCollapsed ? "Expand Panel" : "Collapse Panel"}
          >
            {isPanelCollapsed ? <ChevronUp className="xl:rotate-90" /> : <ChevronDown className="xl:-rotate-90" />}
          </button>
        </div>

        <div className={`p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1 overflow-y-auto custom-scrollbar transition-all duration-300 ${isPanelCollapsed ? 'xl:hidden pointer-events-none' : 'opacity-100'}`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Integrity</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Feed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner group hover:bg-white/10 transition-colors cursor-default">
              <span className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Active Alerts</span>
              <span className="text-xl sm:text-2xl font-black text-rose-500">{disruptions.length}</span>
            </div>
            <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner group hover:bg-white/10 transition-colors cursor-default">
              <span className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Weather Impact</span>
              <span className="text-xl sm:text-2xl font-black text-amber-500">{weatherAlerts.length}</span>
            </div>
          </div>

          <div className="relative h-48 sm:h-56 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={chartData}
                   innerRadius="70%"
                   outerRadius="95%"
                   paddingAngle={8}
                   dataKey="value"
                   stroke="none"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
               <span className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{filteredSuppliers.length}</span>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</span>
             </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
             {chartData.map((item) => (
               <div key={item.name} className="flex justify-between items-center px-4 group cursor-default">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{item.name}</span>
                 </div>
                 <span className="text-[10px] font-black text-white">{item.value}%</span>
               </div>
             ))}
          </div>

          <div className="pt-6 sm:pt-8 border-t border-white/5">
             <div className="flex justify-between items-center mb-4 sm:mb-6">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Logs</h4>
               <button className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:underline">View All</button>
             </div>
             <div className="space-y-4 sm:space-y-5">
               {weatherAlerts.length > 0 ? (
                 weatherAlerts.slice(0, 3).map((alert, i) => (
                   <div key={alert.id} className="flex gap-4 group cursor-pointer">
                     <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${alert.severity === 'High' ? 'text-rose-400' : 'text-amber-400'} flex-shrink-0 group-hover:bg-white/10 transition-all`}>
                       {getWeatherIcon(alert.title)}
                     </div>
                     <div className="overflow-hidden flex-1">
                       <p className="text-xs sm:text-sm font-bold text-slate-300 leading-tight truncate group-hover:text-white transition-colors">{alert.title}</p>
                       <p className="text-[9px] text-slate-500 mt-1 uppercase font-black tracking-widest">{alert.location}</p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-4">
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No active weather disruptions</p>
                 </div>
               )}
             </div>
          </div>
        </div>
        
        {/* Collapsed State Icons */}
        {isPanelCollapsed && (
          <div className="hidden xl:flex flex-col items-center gap-8 pt-10">
            <Target size={20} className="text-blue-400" />
            <Activity size={20} className="text-slate-500" />
            <ShieldAlert size={20} className="text-rose-500" />
            <Zap size={20} className="text-amber-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
