'use client';

import { useState, useEffect } from 'react';
import { useNavigation } from '@/store/navigation';
import { detectionsList, type DetectionListItem } from '@/lib/api';

export default function HistoryPage() {
  const { navigate, setSelectedRequestId } = useNavigation();
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [verdictFilter, setVerdictFilter] = useState('');
  const [rows, setRows] = useState<DetectionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    detectionsList({ verdict: verdictFilter || undefined, page: currentPage, limit })
      .then((r) => { setRows(r.items); setTotal(r.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [verdictFilter, currentPage]);

  const filtered = confidenceFilter > 0
    ? rows.filter((r) => r.confidence >= confidenceFilter)
    : rows;

  const handleRowClick = (id: string) => {
    setSelectedRequestId(id);
    navigate('detail');
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'FAKE':
        return (
          <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded border border-red-100 flex items-center gap-1 w-fit">
            <span className="w-1 h-1 bg-red-600 rounded-full" /> FAKE
          </span>
        );
      case 'REAL':
        return (
          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded border border-emerald-100 flex items-center gap-1 w-fit">
            <span className="w-1 h-1 bg-emerald-600 rounded-full" /> REAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded border border-amber-100 flex items-center gap-1 w-fit">
            <span className="w-1 h-1 bg-amber-600 rounded-full" /> UNCERTAIN
          </span>
        );
    }
  };

  const getBarColor = (verdict: string) => {
    switch (verdict) {
      case 'FAKE': return 'bg-[#ba1a1a]';
      case 'REAL': return 'bg-emerald-600';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Filter Bar */}
      <section className="glass-panel rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4 border border-white">
        <div className="flex flex-wrap items-center gap-4">
          {/* Verdict Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Verdict</label>
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-[#0050cb] focus:border-[#0050cb]">
              <option>Tất cả kết quả</option>
              <option>REAL</option>
              <option>FAKE</option>
              <option>UNCERTAIN</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Thời gian</label>
            <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-[#0050cb] focus:border-[#0050cb]">
              <option>7 ngày qua</option>
              <option>24 giờ qua</option>
              <option>30 ngày qua</option>
              <option>Tùy chỉnh...</option>
            </select>
          </div>

          {/* Confidence Slider */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Độ tin cậy (%)</label>
              <span className="text-[10px] font-bold text-[#0050cb] italic">&gt; {confidenceFilter}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0050cb] mt-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all" title="Làm mới">
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">download</span> Xuất CSV
          </button>
        </div>
      </section>

      {/* Data Table */}
      <section className="glass-panel rounded-2xl shadow-sm border border-white overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết luận</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ tin cậy</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">API Key</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ trễ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-400">Đang tải...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-400">Chưa có dữ liệu</td></tr>
              )}
              {filtered.map((row) => (
                <tr
                  key={row.request_id}
                  className="data-table-row"
                  onClick={() => handleRowClick(row.request_id)}
                >
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{row.request_id.slice(0, 8)}…</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">{new Date(row.created_at).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4">{getVerdictBadge(row.verdict)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{row.confidence.toFixed(1)}%</span>
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${getBarColor(row.verdict)}`} style={{ width: `${row.confidence}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{row.model_version}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{row.processing_time_ms}ms</td>
                  <td className="px-6 py-4 text-right">
                    <span className="material-symbols-outlined text-slate-300 hover:text-[#0050cb] transition-colors">chevron_right</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trang {currentPage} / 7 (127 bản ghi)</span>
          <div className="flex gap-2">
            <button className="p-1 text-slate-400 hover:text-[#0050cb] transition-colors" disabled={currentPage === 1}>
              <span className="material-symbols-outlined">first_page</span>
            </button>
            <button className="p-1 text-slate-400 hover:text-[#0050cb] transition-colors" disabled={currentPage === 1}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex gap-1">
              {[1, 2, 3, 7].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-6 h-6 rounded text-[10px] font-bold transition-all ${
                    currentPage === page
                      ? 'bg-[#0050cb] text-white'
                      : 'hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="p-1 text-slate-600 hover:text-[#0050cb] transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button className="p-1 text-slate-600 hover:text-[#0050cb] transition-colors">
              <span className="material-symbols-outlined">last_page</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
