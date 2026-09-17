import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Clock,
  Filter,
  User,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Filter and sort chronologically by timestamp (descending or ascending)
  const filteredLogs = auditLogs
    .filter((log) => {
      const matchesCat =
        selectedCategory === 'all' || log.category === selectedCategory;
      const matchesSearch =
        log.targetPerson.includes(searchTerm) ||
        log.operatorName.includes(searchTerm) ||
        log.operatorId.includes(searchTerm) ||
        log.details.includes(searchTerm) ||
        log.timestamp.includes(searchTerm);
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => b.timestampMs - a.timestampMs);

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 animate-fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">
                  سجل التتبع والأمان والتوثيق الزمني (Audit Log)
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  غير قابل للتعديل التاريخي
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تأريخ كافة العمليات بالثانية [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS] مع آيدي المشغل وتفاصيل الحالة قبل وبعد الإجراء.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، الآيدي، أو التاريخ..."
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'كافة العمليات' },
              { id: 'teacher_attendance', label: 'غياب المعلمين' },
              { id: 'substitution', label: 'الانتداب والاحتياط' },
              { id: 'teacher_honor', label: 'تكريم المعلمين' },
              { id: 'student_attendance', label: 'حضور الطلاب' },
              { id: 'student_infraction', label: 'مخالفات وملاحظات' },
              { id: 'student_honor', label: 'تكريم الطلاب' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-semibold">لا توجد سجلات مطابقة لمعايير البحث الحالية.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  {/* Left Column: Timestamp & Action */}
                  <div className="space-y-1.5 md:w-1/3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-900 text-emerald-300 border border-slate-700 inline-flex items-center gap-1.5 shadow-2xs">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {log.timestamp}
                      </span>
                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-800">
                        {log.actionType}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>المشغل: <strong className="text-slate-800">{log.operatorName}</strong></span>
                      <span>•</span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{log.operatorId}</span>
                    </div>
                  </div>

                  {/* Middle Column: Target Person & Details */}
                  <div className="space-y-1 md:w-1/3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-xs">
                        الشخص المرتبط: {log.targetPerson}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {log.details}
                    </p>
                  </div>

                  {/* Right Column: Before & After State */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 md:w-1/4 space-y-1 text-[11px]">
                    {log.previousState && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>الحالة السابقة:</span>
                        <span className="line-through text-slate-400">{log.previousState}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-bold text-emerald-800 pt-0.5 border-t border-slate-200/60">
                      <span>الحالة الجديدة:</span>
                      <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700">
                        {log.newState}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>إجمالي السجلات المؤرخة بالثانية: <strong>{filteredLogs.length}</strong> سجل</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors text-xs"
          >
            إغلاق السجل
          </button>
        </div>
      </div>
    </div>
  );
};
