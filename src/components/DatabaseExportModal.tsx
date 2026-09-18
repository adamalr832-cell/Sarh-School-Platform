import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Copy,
  Check,
  FileCode,
  FileJson,
  Layers,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import {
  TeacherLoad,
  AbsenceRequest,
  StudentRecord,
  TeacherAwardLog,
  RedemptionRequest,
  TeacherHonor,
  StudentInfraction,
  AuditLogEntry,
} from '../types';
import { getPrecisionTimestamp } from '../utils/timestamp';

interface DatabaseExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: TeacherLoad[];
  absences: AbsenceRequest[];
  students: StudentRecord[];
  awardLogs: TeacherAwardLog[];
  redemptionRequests: RedemptionRequest[];
  teacherHonors: TeacherHonor[];
  infractions: StudentInfraction[];
  auditLogs: AuditLogEntry[];
  eduCoins: number;
}

export const DatabaseExportModal: React.FC<DatabaseExportModalProps> = ({
  isOpen,
  onClose,
  teachers,
  absences,
  students,
  awardLogs,
  redemptionRequests,
  teacherHonors,
  infractions,
  auditLogs,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'sql' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'json' | 'sql'>('overview');

  if (!isOpen) return null;

  // Build live dynamic database payload
  const currentDbPayload = {
    _metadata: {
      systemName: 'منصة صَرْح المدرسية الذكية',
      schoolName: 'مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12)',
      governorate: 'محافظة مسقط - سلطنة عُمان',
      authority: 'وزارة التربية والتعليم - سلطنة عُمان',
      academicYear: '2025/2026',
      timestampStandard: 'Precision Timestamping Standard [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]',
      exportedAt: getPrecisionTimestamp(),
      tablesCount: 8,
      recordsCount:
        teachers.length +
        absences.length +
        students.length +
        awardLogs.length +
        redemptionRequests.length +
        teacherHonors.length +
        infractions.length +
        auditLogs.length,
    },
    teachers,
    absence_requests: absences,
    students,
    award_logs: awardLogs,
    redemption_requests: redemptionRequests,
    teacher_honors: teacherHonors,
    student_infractions: infractions,
    audit_logs: auditLogs,
  };

  const jsonString = JSON.stringify(currentDbPayload, null, 2);

  // Trigger browser download for JSON
  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sarh_school_database.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger browser download for SQL
  const handleDownloadSql = () => {
    // We fetch the SQL file prepared in /public or generate one
    const link = document.createElement('a');
    link.href = '/sarh_school_database.sql';
    link.setAttribute('download', 'sarh_school_database.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopiedFormat('json');
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-indigo-950/90 p-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">تصدير قاعدة بيانات منصة صَرْح (Database File)</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  ملف جاهز للتحميل
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مدرسة موسى بن نصير للتعليم ما بعد الأساسي • معيار التأريخ بالثانية الموحد
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar / Download Buttons */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              نظرة عامة والجداول
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              معاينة JSON
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'sql'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              مخطط SQL
            </button>
          </div>

          {/* Download & Copy Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition-colors font-medium"
            >
              {copiedFormat === 'json' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>نسخ JSON</span>
                </>
              )}
            </button>

            <button
              id="download-db-json-btn"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-900/30 transition-all font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف JSON</span>
            </button>

            <button
              id="download-db-sql-btn"
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-900/30 transition-all font-semibold"
            >
              <FileCode className="w-4 h-4" />
              <span>تحميل ملف SQL</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-200 space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">عدد الجداول (Collections)</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">8 جداول رئيسية</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">شاملة التأريخ بالثانية</div>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">إجمالي السجلات الحالية</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">
                    {currentDbPayload._metadata.recordsCount} سجل
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">موثقة ومربوطة</div>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">سجلات الأمان (Audit Log)</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{auditLogs.length} عملية</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">غير قابلة للتعديل</div>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">صيغة الملفات المتوفرة</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">JSON + SQL</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">جاهزة للاستيراد المباشر</div>
                </div>
              </div>

              {/* Table breakdown */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>تفاصيل الجداول المحفوظة في الملف:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">1. الكادر التدريسي (teachers)</span>
                    <span className="text-emerald-400 font-mono">{teachers.length} معلماً</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">2. الغياب والاحتياط (absence_requests)</span>
                    <span className="text-emerald-400 font-mono">{absences.length} سجلات</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">3. سجلات الطلاب والحضور (students)</span>
                    <span className="text-emerald-400 font-mono">{students.length} طالباً</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">4. تكريم وإشادة المعلمين (teacher_honors)</span>
                    <span className="text-emerald-400 font-mono">{teacherHonors.length} أوسمة</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">5. المخالفات والملاحظات (student_infractions)</span>
                    <span className="text-emerald-400 font-mono">{infractions.length} ملاحظات</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">6. نقاط التميز الصفي (award_logs)</span>
                    <span className="text-emerald-400 font-mono">{awardLogs.length} عمليات</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">7. طلبات الاستبدال (redemption_requests)</span>
                    <span className="text-emerald-400 font-mono">{redemptionRequests.length} طلبات</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">8. سجل التتبع والأمان (audit_logs)</span>
                    <span className="text-emerald-400 font-mono">{auditLogs.length} توثيق بالثانية</span>
                  </div>
                </div>
              </div>

              {/* Direct Link Box */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>المسار العام المباشر للملف في الخادم:</span>
                  <code className="bg-slate-900 text-emerald-300 px-2 py-0.5 rounded font-mono text-[11px]">
                    /sarh_school_database.json
                  </code>
                </div>
                <a
                  href="/sarh_school_database.json"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium hover:underline"
                >
                  <span>فتح في تبويب جديد</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="relative">
              <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
                <span>تنسيق JSON مهيكل بالكامل وجاهز للاستيراد:</span>
                <span className="font-mono text-[11px] text-emerald-400">
                  {Math.round(jsonString.length / 1024)} KB
                </span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[420px] leading-relaxed text-left" dir="ltr">
                {jsonString}
              </pre>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>مخطط قواعد البيانات العلائقية (PostgreSQL / MySQL / SQLite):</span>
                <button
                  onClick={handleDownloadSql}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل ملف SQL كاملاً</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-[420px] leading-relaxed text-left" dir="ltr">
{`-- ==============================================================================
-- قاعدة بيانات منصة "صَرْح" المدرسية الذكية
-- مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12) - سلطنة عُمان
-- ==============================================================================

CREATE TABLE IF NOT EXISTS school_info (...);
CREATE TABLE IF NOT EXISTS teachers (id VARCHAR(50) PRIMARY KEY, name VARCHAR(150), ...);
CREATE TABLE IF NOT EXISTS absence_requests (...);
CREATE TABLE IF NOT EXISTS students (...);
CREATE TABLE IF NOT EXISTS teacher_honors (...);
CREATE TABLE IF NOT EXISTS student_infractions (...);
CREATE TABLE IF NOT EXISTS award_logs (...);
CREATE TABLE IF NOT EXISTS redemption_requests (...);
CREATE TABLE IF NOT EXISTS audit_logs (id VARCHAR(50) PRIMARY KEY, timestamp VARCHAR(100), ...);

-- تم تجهيز كافة أوامر الإنشاء CREATE TABLE والإدخال الكامل INSERT INTO
-- في ملف sarh_school_database.sql`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>يتضمن التصدير كافة التحديثات الحالية اللحظية للنظام.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
