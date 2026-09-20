import React, { useState } from 'react';
import {
  Database,
  Table,
  Search,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  FileCode,
  FileJson,
  CheckCircle2,
  ShieldCheck,
  Server,
  Layers,
  ArrowUpDown,
  Filter,
  Eye,
  KeyRound,
  FileSpreadsheet,
  FileText,
  X,
  ArrowRight,
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

interface DatabaseDashboardViewProps {
  teachers: TeacherLoad[];
  absences: AbsenceRequest[];
  students: StudentRecord[];
  awardLogs: TeacherAwardLog[];
  redemptionRequests: RedemptionRequest[];
  teacherHonors: TeacherHonor[];
  infractions: StudentInfraction[];
  auditLogs: AuditLogEntry[];
  eduCoins: number;
  onOpenExportModal: () => void;
  onClose?: () => void;
  onUpdateTeacherStatus?: (id: string, status: 'available' | 'busy' | 'absent') => void;
  onAddStudent?: (student: Partial<StudentRecord>) => void;
}

type DatabaseTableName =
  | 'teachers'
  | 'students'
  | 'absence_requests'
  | 'teacher_honors'
  | 'student_infractions'
  | 'award_logs'
  | 'redemption_requests'
  | 'audit_logs';

export const DatabaseDashboardView: React.FC<DatabaseDashboardViewProps> = ({
  teachers,
  absences,
  students,
  awardLogs,
  redemptionRequests,
  teacherHonors,
  infractions,
  auditLogs,
  onOpenExportModal,
  onClose,
}) => {
  const [selectedTable, setSelectedTable] = useState<DatabaseTableName>('teachers');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCopiedJson, setIsCopiedJson] = useState(false);

  // Table definitions with metadata
  const tablesMeta: {
    id: DatabaseTableName;
    name: string;
    arTitle: string;
    count: number;
    description: string;
    schemaColumns: string[];
  } = [
    {
      id: 'teachers' as DatabaseTableName,
      name: 'teachers',
      arTitle: 'الكادر التدريسي والأنصبة',
      count: teachers.length,
      description: 'سجلات المعلمين، التخصصات، الأنصبة الأسبوعية وحصص الفراغ والغياب',
      schemaColumns: ['id', 'name', 'subject', 'currentWeeklyLoad', 'maxWeeklyLoad', 'status', 'availablePeriods'],
    },
    {
      id: 'students' as DatabaseTableName,
      name: 'students',
      arTitle: 'سجلات الطلاب والحضور',
      count: students.length,
      description: 'بيانات الطلاب، الفصول الدراسية، نقاط التميز وحالة الحضور والغياب بالثانية',
      schemaColumns: ['id', 'name', 'gradeClass', 'points', 'attendanceStatus', 'attendanceTimestamp', 'seatNumber'],
    },
    {
      id: 'absence_requests' as DatabaseTableName,
      name: 'absence_requests',
      arTitle: 'طلبات الغياب والاحتياط',
      count: absences.length,
      description: 'سجلات غياب المعلمين وإسناد حصص الاحتياط الموثقة بالثانية',
      schemaColumns: ['id', 'absentTeacher', 'subject', 'gradeClass', 'period', 'substituteTeacher', 'status', 'createdAt'],
    },
    {
      id: 'teacher_honors' as DatabaseTableName,
      name: 'teacher_honors',
      arTitle: 'أوسمة وتكريم المعلمين',
      count: teacherHonors.length,
      description: 'أوسمة الإجادة وشهادات التقدير المعتمدة من الإدارة المدرسية',
      schemaColumns: ['id', 'teacherName', 'honorType', 'occasion', 'recordedBy', 'timestamp'],
    },
    {
      id: 'student_infractions' as DatabaseTableName,
      name: 'student_infractions',
      arTitle: 'المخالفات والملاحظات السلوكية',
      count: infractions.length,
      description: 'الملاحظات المرصودة للطلاب والموثقة بالثانية وفق لائحة شؤون الطلاب',
      schemaColumns: ['id', 'studentName', 'gradeClass', 'category', 'severity', 'description', 'recordedBy', 'timestamp'],
    },
    {
      id: 'award_logs' as DatabaseTableName,
      name: 'award_logs',
      arTitle: 'سجل نقاط التميز الصفي',
      count: awardLogs.length,
      description: 'نقاط التميز والأوسمة الممنوحة من قبل المعلمين للطلاب',
      schemaColumns: ['id', 'studentName', 'points', 'awardType', 'reason', 'teacherName', 'timestamp'],
    },
    {
      id: 'redemption_requests' as DatabaseTableName,
      name: 'redemption_requests',
      arTitle: 'طلبات استبدال النقاط',
      count: redemptionRequests.length,
      description: 'طلبات استبدال نقاط الطلاب بدرجات تقويم أو تكريم بإشراف المعلمين',
      schemaColumns: ['id', 'studentName', 'gradeClass', 'type', 'pointsCost', 'status', 'createdAt'],
    },
    {
      id: 'audit_logs' as DatabaseTableName,
      name: 'audit_logs',
      arTitle: 'سجل الأمان والتتبع (Audit Log)',
      count: auditLogs.length,
      description: 'سجل الأمان اللحظي غير القابل للتعديل لكافة العمليات بالثانية',
      schemaColumns: ['id', 'operatorName', 'operatorRole', 'actionType', 'targetPerson', 'category', 'timestamp'],
    },
  ].find((t) => t.id === selectedTable)!;

  // Filter current table records
  const getTableData = () => {
    switch (selectedTable) {
      case 'teachers':
        return teachers.filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'students':
        return students.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.gradeClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'absence_requests':
        return absences.filter(
          (a) =>
            a.absentTeacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.substituteTeacher && a.substituteTeacher.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      case 'teacher_honors':
        return teacherHonors.filter(
          (h) =>
            h.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.honorType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.occasion.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'student_infractions':
        return infractions.filter(
          (inf) =>
            inf.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inf.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inf.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'award_logs':
        return awardLogs.filter(
          (aw) =>
            aw.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            aw.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
            aw.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'redemption_requests':
        return redemptionRequests.filter(
          (r) =>
            r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.gradeClass.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'audit_logs':
        return auditLogs.filter(
          (log) =>
            log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.targetPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.operatorName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return [];
    }
  };

  const currentRecords = getTableData();
  const totalRecordsCount =
    teachers.length +
    absences.length +
    students.length +
    awardLogs.length +
    redemptionRequests.length +
    teacherHonors.length +
    infractions.length +
    auditLogs.length;

  // Direct JSON export of selected table
  const handleExportCurrentTableJson = () => {
    const dataStr = JSON.stringify(currentRecords, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedTable}_table.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct CSV export of selected table
  const handleExportCurrentTableCsv = () => {
    if (currentRecords.length === 0) return;
    const headers = Object.keys(currentRecords[0]);
    const csvRows = [
      headers.join(','),
      ...currentRecords.map((row: any) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName];
            const escaped = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
            return `"${escaped.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];
    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedTable}_table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  نظام إدارة قاعدة بيانات صَرْح (Sarh School Database)
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full border border-indigo-500/40 font-mono">
                  v2.4.0 • Active
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  محرك البيانات اللحظي
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12) • استعراض مباشر لكافة الجداول، العلاقات، وسجلات التوثيق بالثانية مع تصدير بصيغ JSON و SQL و CSV.
              </p>
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            {onClose && (
              <button
                id="db-view-close-btn"
                onClick={onClose}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="الرجوع إلى البوابة الرئيسية"
              >
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>العودة للبوابة</span>
              </button>
            )}
            <button
              id="db-view-open-export-btn"
              onClick={onOpenExportModal}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>تصدير تقارير PDF / قاعدة البيانات</span>
            </button>
            <a
              href="/sarh_school_database.sql"
              download="sarh_school_database.sql"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>تحميل .SQL</span>
            </a>
            <a
              href="/sarh_school_database.json"
              download="sarh_school_database.json"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              <FileJson className="w-4 h-4 text-emerald-400" />
              <span>تحميل .JSON</span>
            </a>
          </div>
        </div>

        {/* Database Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
            <div className="text-slate-400 font-medium">عدد الجداول (Tables)</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">8 جداول متكاملة</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">معيار التوثيق بالثانية</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
            <div className="text-slate-400 font-medium">إجمالي السجلات الحالية</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{totalRecordsCount} سجل حي</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">تحديث تلقائي وفوري</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
            <div className="text-slate-400 font-medium">سجلات الأمان غير القابلة للتعديل</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{auditLogs.length} عملية أمان</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Immutable Audit Trails</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
            <div className="text-slate-400 font-medium">حالة المزامنة والربط</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>متصل ومحمي</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">SHA-256 Verified</div>
          </div>
        </div>
      </div>

      {/* Main Tables Navigation & Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Tables Selector List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center justify-between">
            <span>جداول قاعدة البيانات (Tables)</span>
            <span className="text-indigo-400 font-mono text-[11px]">8 جداول</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1 shadow-sm">
            {[
              { id: 'teachers', name: 'الكادر التدريسي', en: 'teachers', count: teachers.length, color: 'text-emerald-400' },
              { id: 'students', name: 'الطلاب والحضور', en: 'students', count: students.length, color: 'text-blue-400' },
              { id: 'absence_requests', name: 'الغياب والاحتياط', en: 'absence_requests', count: absences.length, color: 'text-amber-400' },
              { id: 'teacher_honors', name: 'أوسمة المعلمين', en: 'teacher_honors', count: teacherHonors.length, color: 'text-purple-400' },
              { id: 'student_infractions', name: 'المخالفات السلوكية', en: 'student_infractions', count: infractions.length, color: 'text-rose-400' },
              { id: 'award_logs', name: 'نقاط التميز الصفي', en: 'award_logs', count: awardLogs.length, color: 'text-teal-400' },
              { id: 'redemption_requests', name: 'طلبات الاستبدال', en: 'redemption_requests', count: redemptionRequests.length, color: 'text-cyan-400' },
              { id: 'audit_logs', name: 'سجل التتبع (Audit)', en: 'audit_logs', count: auditLogs.length, color: 'text-yellow-400' },
            ].map((t) => {
              const isSelected = selectedTable === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTable(t.id as DatabaseTableName);
                    setSearchQuery('');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all text-right ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/50 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Table className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <div>
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{t.en}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Database Info Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>مواصفات محرك البيانات</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              تدعم المنصة صيغ JSON و PostgreSQL و MySQL مع دعم التشفير والتوثيق الزمني الإلزامي.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] flex justify-between items-center text-slate-500">
              <span>المعيار الزمني:</span>
              <span className="font-mono text-emerald-400">YYYY-MM-DD | HH:MM:SS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Active Table Data Grid */}
        <div className="lg:col-span-3 space-y-4">
          {/* Table Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`بحث في جدول ${tablesMeta.arTitle} (${tablesMeta.name})...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Export specific table buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenExportModal}
                className="flex items-center gap-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-700/60 transition-colors shadow-sm"
                title="تصدير كشف رسمي PDF ببيانات هذا الجدول"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>كشف PDF</span>
              </button>
              <button
                onClick={handleExportCurrentTableJson}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors"
                title="تصدير هذا الجدول بصيغة JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصدير JSON</span>
              </button>
              <button
                onClick={handleExportCurrentTableCsv}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors"
                title="تصدير هذا الجدول كملف إكسل CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصدير CSV</span>
              </button>
            </div>
          </div>

          {/* Table Data View */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Table Header Description */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    جدول: <span className="text-indigo-400 font-mono">{tablesMeta.name}</span> ({tablesMeta.arTitle})
                  </h3>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                    {currentRecords.length} سجلات
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{tablesMeta.description}</p>
              </div>

              <div className="text-xs text-slate-500 font-mono hidden sm:block">
                Primary Key: <strong className="text-indigo-400">id</strong>
              </div>
            </div>

            {/* Dynamic Records Renderer */}
            <div className="overflow-x-auto max-h-[550px]">
              {currentRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  لا توجد سجلات تطابق معايير البحث الحالية في هذا الجدول.
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-12 text-center">#</th>
                      {Object.keys(currentRecords[0]).map((col) => (
                        <th key={col} className="p-3 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {currentRecords.map((row: any, idx: number) => (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        {Object.keys(row).map((key) => {
                          const val = row[key];
                          const isTimestamp =
                            typeof val === 'string' && val.includes('[التاريخ:');
                          const isStatus = key === 'status' || key === 'attendanceStatus';
                          const isId = key === 'id' || key.toLowerCase().includes('id');

                          return (
                            <td key={key} className="p-3 whitespace-nowrap text-slate-300">
                              {isTimestamp ? (
                                <span className="bg-emerald-950/80 text-emerald-300 font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-800/60">
                                  {val}
                                </span>
                              ) : isStatus ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    val === 'available' || val === 'present' || val === 'assigned' || val === 'approved'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : val === 'absent' || val === 'rejected'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {val}
                                </span>
                              ) : isId ? (
                                <span className="font-mono text-indigo-300 text-[11px] font-medium bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                  {String(val)}
                                </span>
                              ) : typeof val === 'object' && val !== null ? (
                                <span className="font-mono text-slate-400 text-[10px]">
                                  {JSON.stringify(val)}
                                </span>
                              ) : (
                                <span>{String(val ?? '—')}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>عرض {currentRecords.length} من أصل {tablesMeta.count} سجل</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenExportModal}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير كافة الجداول دفعة واحدة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
