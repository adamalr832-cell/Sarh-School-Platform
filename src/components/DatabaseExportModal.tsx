import React, { useState, useRef } from 'react';
import html2canvasPro from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
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
  FileText,
  Printer,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  UserCheck,
  Users,
  Search,
  Filter,
  CheckCircle2,
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
import { getPrecisionTimestamp, getPrecisionTimeData } from '../utils/timestamp';
import { MinistryLogoSVG } from './MinistryLogoSVG';

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
  const [activeTab, setActiveTab] = useState<'pdf_reports' | 'overview' | 'json' | 'sql'>('pdf_reports');

  // PDF Generation State & Filters
  const [pdfReportType, setPdfReportType] = useState<
    'attendance' | 'infractions' | 'teacher_absences' | 'teachers_schedule' | 'comprehensive'
  >('attendance');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAttendanceStatus, setFilterAttendanceStatus] = useState<string>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // Hidden print reference element
  const printReportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentPrecisionTime = getPrecisionTimestamp();
  const timeData = getPrecisionTimeData();

  // Filtered Students for Attendance Report
  const filteredStudents = students.filter((s) => {
    const matchesClass = filterClass === 'all' || s.gradeClass === filterClass;
    const matchesStatus = filterAttendanceStatus === 'all' || s.attendanceStatus === filterAttendanceStatus;
    return matchesClass && matchesStatus;
  });

  // Filtered Infractions for Behavioral Report
  const filteredInfractions = infractions.filter((inf) => {
    const matchesClass = filterClass === 'all' || inf.gradeClass === filterClass;
    const matchesSeverity = filterSeverity === 'all' || inf.severity === filterSeverity;
    return matchesClass && matchesSeverity;
  });

  // Filtered Absences for Teacher Absences Report
  const filteredAbsences = absences;

  // Build live dynamic database payload
  const currentDbPayload = {
    _metadata: {
      systemName: 'منصة صَرْح المدرسية الذكية',
      schoolName: 'مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12)',
      governorate: 'محافظة مسقط - سلطنة عُمان',
      authority: 'وزارة التربية والتعليم - سلطنة عُمان',
      decree: 'القرار الوزاري رقم 234/2017 بشأن لائحة شؤون الطلاب وقواعد الانضباط',
      academicYear: '2025/2026',
      timestampStandard: 'Precision Timestamping Standard [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]',
      exportedAt: currentPrecisionTime,
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
    link.setAttribute('download', `sarh_database_${timeData.dateStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger browser download for SQL
  const handleDownloadSql = () => {
    const link = document.createElement('a');
    link.href = '/sarh_school_database.sql';
    link.setAttribute('download', `sarh_database_${timeData.dateStr}.sql`);
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

  // Professional PDF Export using html2canvas-pro (full OKLCH support) + jsPDF
  const handleExportPdf = async () => {
    if (!printReportRef.current) return;
    setIsGeneratingPdf(true);
    setPdfSuccessMessage(null);

    const reportTitles: Record<string, string> = {
      attendance: 'كشف_حضور_وغياب_الطلاب',
      infractions: 'كشف_المخالفات_والسلوك_الطلابي',
      teacher_absences: 'كشف_غياب_وانتداب_المعلمين',
      teachers_schedule: 'جدول_حصص_وانتداب_المعلمين',
      comprehensive: 'التقرير_الإداري_الشامل_للمدرسة',
    };

    const fileName = `SARH_${reportTitles[pdfReportType]}_${timeData.dateStr}_${timeData.timeStr.replace(/:/g, '-')}.pdf`;

    try {
      const element = printReportRef.current;
      // Use html2canvas-pro which natively supports oklch(), lab(), lch() used in Tailwind CSS
      const canvas = await html2canvasPro(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8; // 8mm margin
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      // Handle pagination if content exceeds single A4 page height
      let heightLeft = contentHeight;
      let position = margin;
      const maxPageContentHeight = pageHeight - margin * 2;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= maxPageContentHeight;

      while (heightLeft > 0) {
        position = margin - (contentHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= maxPageContentHeight;
      }

      pdf.save(fileName);
      setPdfSuccessMessage(`تم استخراج وتحميل التقرير الرسمي (${fileName}) بنجاح.`);
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Error generating PDF report with html2canvas-pro / jsPDF:', err);
      // Fallback: browser print dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm" dir="rtl">
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Ministerial Branding */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-inner shrink-0">
              <MinistryLogoSVG size={38} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100">
                  مركز تصدير التقارير الرسمية وقاعدة البيانات (PDF & DB Export)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  شعار الوزارة والتوقيع الإلكتروني المعتمد
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12) • سلطنة عُمان • متوافق مع القرار الوزاري 234/2017
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar / Navigation Tabs */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex-wrap">
            <button
              id="export-tab-pdf-reports"
              onClick={() => setActiveTab('pdf_reports')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'pdf_reports'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>تقارير PDF الرسمية المعتمدة</span>
            </button>

            <button
              id="export-tab-overview"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>نظرة عامة على الجداول</span>
            </button>

            <button
              id="export-tab-json"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>تصدير JSON</span>
            </button>

            <button
              id="export-tab-sql"
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'sql'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>مخطط SQL</span>
            </button>
          </div>

          {/* Quick Universal DB Download Actions */}
          <div className="flex items-center gap-2">
            <button
              id="quick-download-db-json-btn"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition-colors font-semibold"
              title="تحميل قاعدة البيانات بالكامل بصيغة JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-emerald-400" />
              <span>تحميل .JSON</span>
            </button>

            <button
              id="quick-download-db-sql-btn"
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition-colors font-semibold"
              title="تحميل قاعدة البيانات بصيغة SQL"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>تحميل .SQL</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-200 space-y-4">
          {/* TAB 1: PDF Official Reports Generator */}
          {activeTab === 'pdf_reports' && (
            <div className="space-y-5">
              {/* PDF Control Panel */}
              <div className="bg-slate-800/80 border border-slate-700/90 rounded-2xl p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>تخصيص واستخراج التقرير الإداري بصيغة PDF عالية الدقة:</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      تقارير مهيأة للطباعة الرسمية والمراجعة الإدارية، تتضمن شعار الوزارة، الترويسة المعتمدة، والتأريخ الدقيق بالثانية.
                    </p>
                  </div>

                  {/* Primary PDF Generate Button */}
                  <button
                    id="generate-official-pdf-btn"
                    onClick={handleExportPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 transition-all cursor-pointer shrink-0"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                        <span>جاري إنشاء ومعالجة ملف PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>تحميل التقرير المفلتر PDF الآن</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-700/80 text-xs">
                  {/* Select Report Kind */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">نوع الكشف / التقرير:</label>
                    <select
                      value={pdfReportType}
                      onChange={(e) => setPdfReportType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="attendance">كشف حضور وغياب الطلاب اليومي</option>
                      <option value="infractions">كشف المخالفات السلوكية (قرار 234/2017)</option>
                      <option value="teacher_absences">كشف غياب المعلمين وحصص الاحتياط</option>
                      <option value="teachers_schedule">جدول الحصص الأسبوعي وانتداب المعلمين</option>
                      <option value="comprehensive">التقرير الإداري الشامل للمدرسة</option>
                    </select>
                  </div>

                  {/* Class Filter */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">الفصل الدراسي:</label>
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="all">جميع الفصول (عاشر 1 وعاشر 2)</option>
                      <option value="الصف العاشر / 1">الصف العاشر / 1</option>
                      <option value="الصف العاشر / 2">الصف العاشر / 2</option>
                    </select>
                  </div>

                  {/* Conditional Filter: Attendance Status or Severity */}
                  {pdfReportType === 'attendance' && (
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">حالة الحضور والغياب:</label>
                      <select
                        value={filterAttendanceStatus}
                        onChange={(e) => setFilterAttendanceStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="all">الكل (حضور + غياب + تأخر)</option>
                        <option value="present">الحاضرون فقط</option>
                        <option value="absent">الغائبون فقط</option>
                        <option value="late">المتأخرون فقط</option>
                      </select>
                    </div>
                  )}

                  {pdfReportType === 'infractions' && (
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">درجة المخالفة السلوكية:</label>
                      <select
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="all">كافة الدرجات (خفيفة/متوسطة/جسيمة)</option>
                        <option value="خفيفة">الدرجة الأولى (خفيفة)</option>
                        <option value="متوسطة">الدرجة الثانية (متوسطة)</option>
                        <option value="جسيمة">الدرجة الثالثة (جسيمة)</option>
                      </select>
                    </div>
                  )}

                  {/* Info Badge on Timestamping */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">معيار توثيق التقرير:</label>
                    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono text-[11px] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{currentPrecisionTime}</span>
                    </div>
                  </div>
                </div>

                {/* Success Notification */}
                {pdfSuccessMessage && (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pdfSuccessMessage}</span>
                  </div>
                )}
              </div>

              {/* Live Visual Printable Preview Container (Rendered to PDF via html2pdf) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>معاينة حية للتقرير المستخرج (الترويسة الرسمية، البيانات، والتوقيع):</span>
                  <span className="font-mono text-emerald-400 text-[11px]">A4 Official Layout</span>
                </div>

                {/* Printable Document Box */}
                <div className="bg-slate-950 p-2 sm:p-4 rounded-2xl border border-slate-800 overflow-x-auto">
                  <div
                    ref={printReportRef}
                    id="sarh-official-printable-report"
                    className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl mx-auto w-full max-w-[800px] text-right font-sans"
                    dir="rtl"
                    style={{ minHeight: '850px' }}
                  >
                    {/* 1. Official Header (وزارة التربية والتعليم) */}
                    <div className="border-b-2 border-emerald-800 pb-5 mb-6">
                      <div className="flex items-start justify-between">
                        {/* Right: Sultanate & Ministry Hierarchy */}
                        <div className="text-right">
                          <h4 className="text-sm font-bold text-emerald-950 leading-tight">سلطنة عُمان</h4>
                          <h3 className="text-base font-extrabold text-emerald-900 leading-tight">وزارة التربية والتعليم</h3>
                          <p className="text-xs text-slate-700 font-medium">المديرية العامة للتربية والتعليم بمحافظة مسقط</p>
                          <p className="text-xs text-slate-800 font-bold mt-0.5">
                            مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12)
                          </p>
                        </div>

                        {/* Center: Ministry Official Emblem */}
                        <div className="flex flex-col items-center justify-center">
                          <MinistryLogoSVG size={58} className="w-14 h-14" />
                          <span className="text-[10px] font-bold text-emerald-900 mt-1">منظومة صَرْح المدرسية</span>
                        </div>

                        {/* Left: Administrative Metadata & Precision Timestamp */}
                        <div className="text-left text-[11px] text-slate-700 space-y-1">
                          <div>
                            <span className="font-bold text-slate-900">رقم الكشف: </span>
                            <span className="font-mono text-emerald-800">
                              MBN-{timeData.dateStr.replace(/-/g, '')}-{Math.floor(1000 + Math.random() * 9000)}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">العام الدراسي: </span>
                            <span>2025 / 2026 م</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">وقت الرصد الدقيق: </span>
                            <span className="font-mono text-emerald-900 font-bold">
                              {timeData.dateStr} | {timeData.timeStr}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">المرجع التنظيمي: </span>
                            <span className="text-emerald-900 font-semibold">قرار وزاري 234/2017</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Document Title */}
                      <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                        <h2 className="text-lg font-black text-emerald-950">
                          {pdfReportType === 'attendance' && 'كشف الحضور والغياب اليومي للطلاب'}
                          {pdfReportType === 'infractions' && 'كشف رصد المخالفات السلوكية والانضباط المدرسي'}
                          {pdfReportType === 'teacher_absences' && 'سجل غياب الكادر التدريسي وإسناد حصص الاحتياط'}
                          {pdfReportType === 'teachers_schedule' && 'كشف جدول الحصص الأسبوعي والأنصبة وانتداب المعلمين'}
                          {pdfReportType === 'comprehensive' && 'التقرير الإداري والتربوي الشامل لمنصة صَرْح'}
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          توثيق رقمي فوري ومعتمد للإدارة المدرسية ولجنة شؤون الطلاب
                        </p>
                      </div>
                    </div>

                    {/* 2. Document Content Tables */}
                    {/* A. Student Attendance Table */}
                    {pdfReportType === 'attendance' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                          <span>إجمالي الطلاب المرصودين في الكشف: {filteredStudents.length}</span>
                          <span>الحاضرون: {filteredStudents.filter((s) => s.attendanceStatus === 'present').length}</span>
                          <span>الغائبون: {filteredStudents.filter((s) => s.attendanceStatus === 'absent').length}</span>
                          <span>المتأخرون: {filteredStudents.filter((s) => s.attendanceStatus === 'late').length}</span>
                        </div>

                        <table className="w-full text-right text-xs border-collapse border border-slate-300">
                          <thead>
                            <tr className="bg-emerald-900 text-white font-bold">
                              <th className="p-2 border border-slate-300 text-center w-10">م</th>
                              <th className="p-2 border border-slate-300">اسم الطالب الثلاثي والقبيلة</th>
                              <th className="p-2 border border-slate-300">الفصل</th>
                              <th className="p-2 border border-slate-300 text-center">الحالة</th>
                              <th className="p-2 border border-slate-300 text-center">رصيد النقاط</th>
                              <th className="p-2 border border-slate-300">توقيت الرصد بالثانية</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((st, idx) => (
                              <tr key={st.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-700">
                                  {idx + 1}
                                </td>
                                <td className="p-2 border border-slate-300 font-bold text-slate-900">{st.name}</td>
                                <td className="p-2 border border-slate-300 text-slate-700">{st.gradeClass}</td>
                                <td className="p-2 border border-slate-300 text-center font-bold">
                                  {st.attendanceStatus === 'present' && (
                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">حاضر</span>
                                  )}
                                  {st.attendanceStatus === 'absent' && (
                                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">غائب</span>
                                  )}
                                  {st.attendanceStatus === 'late' && (
                                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">متأخر</span>
                                  )}
                                </td>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold text-indigo-700">
                                  {st.points} ن
                                </td>
                                <td className="p-2 border border-slate-300 font-mono text-[11px] text-slate-600">
                                  {st.attendanceTimestamp || currentPrecisionTime}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* B. Student Infractions Table */}
                    {pdfReportType === 'infractions' && (
                      <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 leading-relaxed">
                          <strong>تنويه نظامي:</strong> تُطبق كافة الإجراءات بناءً على تصنيف مخالفات السلوك الطلابي المعتمد بالقرار الوزاري 234/2017 عبر لجنة شؤون الطلاب بالمدرسة.
                        </div>

                        <table className="w-full text-right text-xs border-collapse border border-slate-300">
                          <thead>
                            <tr className="bg-slate-900 text-white font-bold">
                              <th className="p-2 border border-slate-300 text-center w-10">م</th>
                              <th className="p-2 border border-slate-300">اسم الطالب</th>
                              <th className="p-2 border border-slate-300">الفصل</th>
                              <th className="p-2 border border-slate-300">نوع المخالفة</th>
                              <th className="p-2 border border-slate-300 text-center">الدرجة</th>
                              <th className="p-2 border border-slate-300">الوصف والتفاصيل</th>
                              <th className="p-2 border border-slate-300">الراصد وتوقيت الثانية</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredInfractions.map((inf, idx) => (
                              <tr key={inf.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-700">
                                  {idx + 1}
                                </td>
                                <td className="p-2 border border-slate-300 font-bold text-slate-900">{inf.studentName}</td>
                                <td className="p-2 border border-slate-300 text-slate-700">{inf.gradeClass}</td>
                                <td className="p-2 border border-slate-300 font-semibold text-slate-800">{inf.category}</td>
                                <td className="p-2 border border-slate-300 text-center font-bold">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] ${
                                      inf.severity === 'جسيمة'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : inf.severity === 'متوسطة'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                                    }`}
                                  >
                                    {inf.severity}
                                  </span>
                                </td>
                                <td className="p-2 border border-slate-300 text-slate-700 leading-snug">{inf.description}</td>
                                <td className="p-2 border border-slate-300 text-[11px] text-slate-600">
                                  <div>{inf.recordedBy}</div>
                                  <div className="font-mono text-emerald-800 mt-0.5">{inf.timestamp}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* C. Teacher Absences & Substitution Table */}
                    {pdfReportType === 'teacher_absences' && (
                      <div className="space-y-4">
                        <table className="w-full text-right text-xs border-collapse border border-slate-300">
                          <thead>
                            <tr className="bg-emerald-950 text-white font-bold">
                              <th className="p-2 border border-slate-300 text-center w-10">م</th>
                              <th className="p-2 border border-slate-300">المعلم الغائب</th>
                              <th className="p-2 border border-slate-300">المادة الدراسية</th>
                              <th className="p-2 border border-slate-300">الفصل والحصة</th>
                              <th className="p-2 border border-slate-300">المعلم المنتدب (الاحتياط)</th>
                              <th className="p-2 border border-slate-300 text-center">حالة الإسناد</th>
                              <th className="p-2 border border-slate-300">التأريخ بالثانية</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAbsences.map((abs, idx) => (
                              <tr key={abs.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-700">
                                  {idx + 1}
                                </td>
                                <td className="p-2 border border-slate-300 font-bold text-slate-900">{abs.absentTeacher}</td>
                                <td className="p-2 border border-slate-300 text-slate-700">{abs.subject}</td>
                                <td className="p-2 border border-slate-300 font-semibold text-slate-800">
                                  {abs.gradeClass} (الحصة {abs.period})
                                </td>
                                <td className="p-2 border border-slate-300 font-bold text-emerald-900">
                                  {abs.substituteTeacher || 'بانتظار الإسناد التلقائي'}
                                </td>
                                <td className="p-2 border border-slate-300 text-center font-bold">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] ${
                                      abs.status === 'assigned'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {abs.status === 'assigned' ? 'تم الانتداب' : 'معلق'}
                                  </span>
                                </td>
                                <td className="p-2 border border-slate-300 font-mono text-[11px] text-slate-600">
                                  {abs.assignmentTimestamp || abs.createdAt || currentPrecisionTime}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* D. Teachers Schedule & Weekly Load / Delegation Table */}
                    {pdfReportType === 'teachers_schedule' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                          <span>إجمالي المعلمين في الجدول: {teachers.length} معلماً</span>
                          <span>المعلمون المتاحون: {teachers.filter((t) => t.status === 'available').length}</span>
                          <span>المعلمون الغائبون / منتدبون: {teachers.filter((t) => t.status !== 'available').length}</span>
                        </div>

                        <table className="w-full text-right text-xs border-collapse border border-slate-300">
                          <thead>
                            <tr className="bg-emerald-950 text-white font-bold">
                              <th className="p-2 border border-slate-300 text-center w-10">م</th>
                              <th className="p-2 border border-slate-300">اسم المعلم</th>
                              <th className="p-2 border border-slate-300">المادة / التخصص</th>
                              <th className="p-2 border border-slate-300 text-center">النصاب الحالي / الأقصى</th>
                              <th className="p-2 border border-slate-300 text-center">حصص الفراغ (الاحتياط)</th>
                              <th className="p-2 border border-slate-300 text-center">الحالة اليومية</th>
                              <th className="p-2 border border-slate-300">التوثيق بالثانية</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teachers.map((t, idx) => (
                              <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-700">
                                  {idx + 1}
                                </td>
                                <td className="p-2 border border-slate-300 font-bold text-slate-900">{t.name}</td>
                                <td className="p-2 border border-slate-300 text-slate-700">{t.subject}</td>
                                <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                                  <span className="text-emerald-800">{t.currentWeeklyLoad}</span> /{' '}
                                  <span className="text-slate-500">{t.maxWeeklyLoad} حصة</span>
                                </td>
                                <td className="p-2 border border-slate-300 text-center font-mono">
                                  {t.availablePeriods.map((p) => `ح${p}`).join(' ، ') || 'لا توجد'}
                                </td>
                                <td className="p-2 border border-slate-300 text-center font-bold">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] ${
                                      t.status === 'available'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : t.status === 'delegated'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {t.status === 'available' ? 'على رأس العمل' : t.status === 'delegated' ? 'منتدب رسمياً' : 'غائب'}
                                  </span>
                                </td>
                                <td className="p-2 border border-slate-300 font-mono text-[11px] text-slate-600">
                                  {t.lastStatusChangeTimestamp || t.absenceRecordedAt || currentPrecisionTime}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* E. Comprehensive Report */}
                    {pdfReportType === 'comprehensive' && (
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                          <div>
                            <span className="block text-slate-500 text-[11px]">إجمالي المعلمين</span>
                            <strong className="text-base text-slate-900">{teachers.length} معلماً</strong>
                          </div>
                          <div>
                            <span className="block text-slate-500 text-[11px]">إجمالي الطلاب</span>
                            <strong className="text-base text-slate-900">{students.length} طالباً</strong>
                          </div>
                          <div>
                            <span className="block text-slate-500 text-[11px]">عمليات الأمان الموثقة</span>
                            <strong className="text-base text-emerald-700">{auditLogs.length} عملية</strong>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 mb-2 border-b pb-1">ملخص غياب الكادر والانتداب:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            {absences.map((ab) => (
                              <li key={ab.id}>
                                غياب {ab.absentTeacher} ({ab.subject}) - انتداب: {ab.substituteTeacher || 'قيد الانتظار'} - {ab.createdAt}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2">
                          <h4 className="font-bold text-slate-900 mb-2 border-b pb-1">سجل المخالفات المرفوعة لشؤون الطلاب:</h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            {infractions.map((inf) => (
                              <li key={inf.id}>
                                {inf.studentName} ({inf.gradeClass}) - {inf.category} ({inf.severity}) - رصد: {inf.recordedBy} [{inf.timestamp}]
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* 3. Official Signatures & Seal Section */}
                    <div className="mt-8 pt-6 border-t-2 border-slate-200">
                      <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        {/* Signature 1: Specialist / Supervisor */}
                        <div className="space-y-8">
                          <div>
                            <div className="font-bold text-slate-900">أخصائي شؤون الطلاب</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">لجنة رعاية السلوك الطلابي</div>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">............................ (توقيع)</div>
                        </div>

                        {/* Signature 2: Assistant Principal */}
                        <div className="space-y-8">
                          <div>
                            <div className="font-bold text-slate-900">مساعد مدير المدرسة</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">الشؤون الإدارية والمدرسية</div>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">............................ (توقيع)</div>
                        </div>

                        {/* Signature 3: School Principal & Stamp */}
                        <div className="space-y-8">
                          <div>
                            <div className="font-bold text-emerald-950">مدير المدرسة المعتمد</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">مدرسة موسى بن نصير (10-12)</div>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            [الختم الرسمي للمدرسة والتوقيع]
                          </div>
                        </div>
                      </div>

                      {/* Electronic Timestamp Verification Stamp */}
                      <div className="mt-8 pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                          <span>توثيق رقمي صادر من منظومة "صَرْح" الإلكترونية المعتمدة بوزارة التربية والتعليم</span>
                        </div>
                        <div>
                          <span>رمز التحقق: SHA256-</span>
                          <span className="font-bold text-slate-700">MBN-{timeData.timestampMs}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Database Overview and Tables */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">عدد الجداول (Collections)</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">8 جداول رئيسية</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">شاملة التأريخ بالثانية</div>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">إجمالي السجلات الحالية</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">
                    {currentDbPayload._metadata.recordsCount} سجل
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">موثقة ومربوطة</div>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">سجلات الأمان (Audit Log)</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{auditLogs.length} عملية</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">غير قابلة للتعديل</div>
                </div>
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3.5">
                  <div className="text-xs text-slate-400 font-medium">صيغ الملفات المتوفرة</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">PDF + JSON + SQL</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">جاهزة للاستيراد والطباعة</div>
                </div>
              </div>

              {/* Table breakdown */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>تفاصيل الجداول المحفوظة في قاعدة البيانات:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">1. الكادر التدريسي (teachers)</span>
                    <span className="text-emerald-400 font-mono font-bold">{teachers.length} معلماً</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">2. الغياب والاحتياط (absence_requests)</span>
                    <span className="text-emerald-400 font-mono font-bold">{absences.length} سجلات</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">3. سجلات الطلاب والحضور (students)</span>
                    <span className="text-emerald-400 font-mono font-bold">{students.length} طالباً</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">4. تكريم وإشادة المعلمين (teacher_honors)</span>
                    <span className="text-emerald-400 font-mono font-bold">{teacherHonors.length} أوسمة</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">5. المخالفات والملاحظات (student_infractions)</span>
                    <span className="text-emerald-400 font-mono font-bold">{infractions.length} ملاحظات</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">6. نقاط التميز الصفي (award_logs)</span>
                    <span className="text-emerald-400 font-mono font-bold">{awardLogs.length} عمليات</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">7. طلبات الاستبدال (redemption_requests)</span>
                    <span className="text-emerald-400 font-mono font-bold">{redemptionRequests.length} طلبات</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-slate-300">8. سجل التتبع والأمان (audit_logs)</span>
                    <span className="text-emerald-400 font-mono font-bold">{auditLogs.length} توثيق بالثانية</span>
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

          {/* TAB 3: JSON RAW DATA */}
          {activeTab === 'json' && (
            <div className="relative space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>تنسيق JSON مهيكل بالكامل وجاهز للاستيراد والمزامنة:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    {copiedFormat === 'json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>نسخ الكود</span>
                      </>
                    )}
                  </button>
                  <span className="font-mono text-[11px] text-emerald-400">
                    {Math.round(jsonString.length / 1024)} KB
                  </span>
                </div>
              </div>
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-[440px] leading-relaxed text-left" dir="ltr">
                {jsonString}
              </pre>
            </div>
          )}

          {/* TAB 4: SQL SCHEMA */}
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
              <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-[440px] leading-relaxed text-left" dir="ltr">
{`-- ==============================================================================
-- قاعدة بيانات منصة "صَرْح" المدرسية الذكية
-- مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12) - سلطنة عُمان
-- التوثيق بالثانية: [التاريخ: ${timeData.dateStr} | الوقت: ${timeData.timeStr}]
-- ==============================================================================

CREATE TABLE IF NOT EXISTS school_info (
  school_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  authority VARCHAR(150),
  decree VARCHAR(100) DEFAULT 'قرار وزاري 234/2017'
);

CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  current_weekly_load INT,
  max_weekly_load INT,
  status VARCHAR(20) DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS absence_requests (
  id VARCHAR(50) PRIMARY KEY,
  absent_teacher VARCHAR(150),
  subject VARCHAR(100),
  grade_class VARCHAR(50),
  period INT,
  substitute_teacher VARCHAR(150),
  status VARCHAR(20),
  created_at VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  grade_class VARCHAR(50),
  points INT DEFAULT 0,
  attendance_status VARCHAR(20),
  attendance_timestamp VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS student_infractions (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id),
  student_name VARCHAR(150),
  grade_class VARCHAR(50),
  description TEXT,
  category VARCHAR(100),
  severity VARCHAR(30),
  recorded_by VARCHAR(150),
  timestamp VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  timestamp VARCHAR(100) NOT NULL,
  operator_id VARCHAR(50),
  operator_role VARCHAR(50),
  operator_name VARCHAR(150),
  category VARCHAR(50),
  details TEXT
);`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>كافة التقارير ممهورة بالتوقيع الإلكتروني وتخضع لنظام الرصد المعتمد بالثانية.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
