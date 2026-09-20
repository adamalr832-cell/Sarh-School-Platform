import React, { useState } from 'react';
import {
  Building2,
  CalendarCheck,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Lock,
  KeyRound,
  UserCheck,
  UserX,
  Send,
  Plus,
  ArrowRightLeft,
  FileSpreadsheet,
  Check,
  Award,
  History,
  FileBadge,
  Search,
  Database,
  FileText,
  Download,
  Scale,
} from 'lucide-react';
import {
  TeacherLoad,
  AbsenceRequest,
  TeacherHonor,
  AuditLogEntry,
  StudentInfraction,
  StudentRecord,
  AdministrativeSanction,
} from '../types';
import { StudentAffairsReview } from './StudentAffairsReview';

interface AdminModeProps {
  isAdminAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  onOpenDatabase?: () => void;
  onOpenExportModal?: () => void;
  teachers: TeacherLoad[];
  absences: AbsenceRequest[];
  teacherHonors: TeacherHonor[];
  auditLogs: AuditLogEntry[];
  infractions?: StudentInfraction[];
  students?: StudentRecord[];
  onEnforceAdministrativeAction?: (
    infractionId: string,
    action: AdministrativeSanction,
    actionNotes: string,
    reviewerName: string,
    deductPoints?: number
  ) => void;
  onDismissInfractionReferral?: (infractionId: string, reason: string, reviewerName: string) => void;
  onUpdateTeacherStatus: (teacherId: string, status: 'available' | 'absent' | 'delegated') => void;
  onAddAbsence: (absence: Omit<AbsenceRequest, 'id' | 'status'>) => void;
  onAssignSubstitute: (absenceId: string, substituteName: string) => void;
  onAutoDistributeSubstitutes: () => void;
  onAddTeacherHonor: (teacherId: string, honorType: 'نقطة تميّز' | 'شهادة تميّز' | 'وسام الإجادة التربوية', occasion: string) => void;
  onGenerateAiReport: (prompt: string) => void;
  isLoadingAi: boolean;
}

export const AdminMode: React.FC<AdminModeProps> = ({
  isAdminAuthenticated = false,
  onOpenAuthModal,
  onOpenDatabase,
  onOpenExportModal,
  teachers,
  absences,
  teacherHonors,
  auditLogs,
  infractions = [],
  students = [],
  onEnforceAdministrativeAction,
  onDismissInfractionReferral,
  onUpdateTeacherStatus,
  onAddAbsence,
  onAssignSubstitute,
  onAutoDistributeSubstitutes,
  onAddTeacherHonor,
  onGenerateAiReport,
  isLoadingAi,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'substitutes' | 'honors' | 'student_affairs' | 'audit'>('attendance');

  // Absence / Delegation Form Modal state
  const [isAddAbsenceModalOpen, setIsAddAbsenceModalOpen] = useState(false);
  const [selectedTeacherName, setSelectedTeacherName] = useState(teachers[0]?.name || '');
  const [absenceReason, setAbsenceReason] = useState('إجازة عارضة طارئة');
  const [affectedClass, setAffectedClass] = useState('الصف العاشر / 1');
  const [affectedPeriod, setAffectedPeriod] = useState(1);
  const [isDelegation, setIsDelegation] = useState(false);

  // Teacher Honor Form Modal state
  const [isHonorModalOpen, setIsHonorModalOpen] = useState(false);
  const [honorTeacherId, setHonorTeacherId] = useState(teachers[0]?.id || '');
  const [honorType, setHonorType] = useState<'نقطة تميّز' | 'شهادة تميّز' | 'وسام الإجادة التربوية'>('وسام الإجادة التربوية');
  const [honorOccasion, setHonorOccasion] = useState('مبادرة تعليمية متميزة في تدريس سلاسل كامبريدج');

  // Audit Search
  const [auditSearch, setAuditSearch] = useState('');

  // Statistics
  const totalTeachers = teachers.length;
  const absentTeachers = teachers.filter((t) => t.status === 'absent').length;
  const delegatedTeachers = teachers.filter((t) => t.status === 'delegated').length;
  const presentTeachers = teachers.filter((t) => t.status === 'available' || t.status === 'busy').length;

  const totalAbsencePeriods = absences.length;
  const assignedPeriods = absences.filter((a) => a.status === 'assigned').length;
  const pendingPeriods = totalAbsencePeriods - assignedPeriods;

  const handleCreateAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    const teacherObj = teachers.find((t) => t.name === selectedTeacherName);
    const subject = teacherObj ? teacherObj.subject : 'مادة عامة';

    if (teacherObj) {
      onUpdateTeacherStatus(teacherObj.id, isDelegation ? 'delegated' : 'absent');
    }

    onAddAbsence({
      absentTeacher: selectedTeacherName,
      subject,
      gradeClass: affectedClass,
      period: Number(affectedPeriod),
      notes: isDelegation ? `قرار انتداب رسمي: ${absenceReason}` : absenceReason,
    });

    setIsAddAbsenceModalOpen(false);
  };

  const handleCreateHonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!honorTeacherId || !honorOccasion) return;
    onAddTeacherHonor(honorTeacherId, honorType, honorOccasion);
    setIsHonorModalOpen(false);
    setHonorOccasion('');
  };

  // Locked Gateway State
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg" dir="rtl">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">بوابة الإدارة المدرسية مقفلة</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          هذه البوابة مخصصة للإدارة المدرسية وتتطلب إدخال رمز الدخول السري المعتمد للإدارة (الرمز الافتراضي: 1010) لتسجيل غياب المعلمين، إدارة الانتداب، التكريم، وتتبع سجل الأمان.
        </p>
        {onOpenAuthModal && (
          <button
            id="admin-unlock-gateway-btn"
            onClick={onOpenAuthModal}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>إدخال رمز الإدارة (1010) وفتح البوابة</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">بوابة الهيئة الإدارية (Admin Portal)</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                [ADMIN_AUTH_VALIDATED]
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-blue-400" />
                تأريخ دقيق بالثانية
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              مدرسة موسى بن نصير للتعليم ما بعد الأساسي • نظام توثيقي دقيق لغياب المعلمين، الانتداب، التكريم، وسجل التتبع والأمان.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 self-start md:self-auto flex-wrap gap-1">
          <button
            id="admin-tab-attendance"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'attendance'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>غياب وحضور المعلمين</span>
          </button>

          <button
            id="admin-tab-substitutes"
            onClick={() => setActiveTab('substitutes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'substitutes'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>الانتداب والاحتياط</span>
          </button>

          <button
            id="admin-tab-honors"
            onClick={() => setActiveTab('honors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'honors'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>تكريم المعلمين ({teacherHonors.length})</span>
          </button>

          <button
            id="admin-tab-student-affairs"
            onClick={() => setActiveTab('student_affairs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'student_affairs'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-200 hover:text-white hover:bg-amber-950/40'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-300" />
            <span>لجنة شؤون الطلاب (قرار 234)</span>
            {infractions.filter((i) => !i.status || i.status === 'pending_review').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {infractions.filter((i) => !i.status || i.status === 'pending_review').length}
              </span>
            )}
          </button>

          <button
            id="admin-tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل الأمان (Audit Log)</span>
          </button>

          {onOpenDatabase && (
            <button
              id="admin-tab-database"
              onClick={onOpenDatabase}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-indigo-300 hover:text-white hover:bg-indigo-900/40 border border-indigo-500/30"
              title="فتح لوحة قاعدة البيانات الشاملة"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>قاعدة البيانات المدرسية</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. سجلات الكادر التدريسي: غياب/تأخر المعلم */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">إجمالي الهيئة التدريسية</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalTeachers} معلمين</div>
              <div className="text-[11px] text-slate-400 mt-1">كادر المدرسة المعتمد</div>
            </div>

            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 shadow-sm">
              <div className="text-xs text-emerald-800 font-medium">الحضور اليومي</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{presentTeachers} معلماً</div>
              <div className="text-[11px] text-emerald-600 mt-1">على رأس عملهم اليوم</div>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-200 p-4 shadow-sm">
              <div className="text-xs text-red-800 font-medium">الغياب والتأخر</div>
              <div className="text-2xl font-black text-red-700 mt-1">{absentTeachers} معلمين</div>
              <div className="text-[11px] text-red-600 mt-1">مؤرخ بالثانية في النظام</div>
            </div>

            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 shadow-sm">
              <div className="text-xs text-blue-800 font-medium">المعلمون المنتدبون</div>
              <div className="text-2xl font-black text-blue-700 mt-1">{delegatedTeachers} معلمين</div>
              <div className="text-[11px] text-blue-600 mt-1">مهام وانتداب رسمي</div>
            </div>
          </div>

          {/* Teacher Attendance Roster */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>سجل رصد حضور وغياب وتأخر المعلمين (تأريخ دقيق بالثانية)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  وفق معيار التوثيق: يُقيد تاريخ اليوم ووقت الرصد بالثانية تلقائياً بصيغة [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS].
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {onOpenExportModal && (
                  <button
                    id="admin-download-teachers-pdf-btn"
                    onClick={onOpenExportModal}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-700/50 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    title="تحميل كشف غياب المعلمين والانتداب بصيغة PDF رسمية"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تحميل كشف الغياب PDF</span>
                  </button>
                )}

                <button
                  id="open-record-absence-btn"
                  onClick={() => setIsAddAbsenceModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل غياب أو تأخر جديد بالثانية</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {teachers.map((teacher) => {
                const isAbsent = teacher.status === 'absent';
                const isDelegated = teacher.status === 'delegated';
                const isAvailable = teacher.status === 'available' || teacher.status === 'busy';

                return (
                  <div
                    key={teacher.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isAbsent
                            ? 'bg-red-100 text-red-700'
                            : isDelegated
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isAbsent ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">{teacher.name}</span>
                          {/* Timestamp badge */}
                          {teacher.absenceRecordedAt && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                              رصد الغياب: {teacher.absenceRecordedAt}
                            </span>
                          )}
                          {teacher.lastStatusChangeTimestamp && !teacher.absenceRecordedAt && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              آخر تحديث: {teacher.lastStatusChangeTimestamp}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>المادة: <strong className="text-slate-700">{teacher.subject}</strong></span>
                          <span>•</span>
                          <span>النصاب: <strong className="font-mono text-emerald-700">{teacher.currentWeeklyLoad} / {teacher.maxWeeklyLoad} حصة</strong></span>
                          {teacher.notes && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 font-medium">{teacher.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Attendance State Selector */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        onClick={() => onUpdateTeacherStatus(teacher.id, 'available')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isAvailable
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>حاضر</span>
                      </button>

                      <button
                        onClick={() => onUpdateTeacherStatus(teacher.id, 'absent')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isAbsent
                            ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                        }`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>غائب</span>
                      </button>

                      <button
                        onClick={() => onUpdateTeacherStatus(teacher.id, 'delegated')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isDelegated
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-50'
                        }`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>انتداب</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Assistant Quick Trigger */}
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  إرسال كشف حضور وغياب المعلمين المؤرخ بالثانية إلى نواة صَرْح
                </span>
              </div>
              <button
                onClick={() =>
                  onGenerateAiReport(
                    `[ADMIN_AUTH_VALIDATED] قم بإعداد تقرير حضور وغياب وتأخر الهيئة التدريسية المعتمد لليوم لمدرسة موسى بن نصير للتعليم ما بعد الأساسي، مع عرض البيانات مرتبة زمنياً بالثانية [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]: عدد الحاضرين ${presentTeachers}، الغائبين ${absentTeachers}، والمنتدبين ${delegatedTeachers}.`
                  )
                }
                disabled={isLoadingAi}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow shrink-0"
              >
                {isLoadingAi ? 'جارِ التحليل...' : 'توليد تقرير الغياب الرسمي المؤرخ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. سجلات الكادر التدريسي: الانتداب والاحتياط */}
      {activeTab === 'substitutes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>الانتداب والاحتياط (تاريخ التكليف + وقت إسناد الحصة بالثانية)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  يوثق اسم المعلم المُكَلَّف والمعلم الغائب مع وقت الإسناد الدقيق بالثانية [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onOpenExportModal && (
                  <button
                    id="admin-download-substitutes-pdf-btn"
                    onClick={onOpenExportModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-700/50 text-xs font-bold shadow-sm transition-all"
                    title="تحميل جدول غياب وانتداب المعلمين PDF"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تحميل جدول الانتداب PDF</span>
                  </button>
                )}
                <button
                  id="auto-distribute-substitutes-btn"
                  onClick={onAutoDistributeSubstitutes}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                  <span>توزيع عادل ذكي للحصص</span>
                </button>
              </div>
            </div>

            {/* Status Summary Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-medium">إجمالي الحصص المطلوب تغطيتها:</span>
                <span className="font-bold text-slate-900 mr-2 text-sm">{totalAbsencePeriods} حصص</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 font-medium">حصص تمت تغطيتها:</span>
                <span className="font-bold text-emerald-800 mr-2 text-sm">{assignedPeriods} حصص</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-800 font-medium">حصص بانتظار التكليف:</span>
                <span className="font-bold text-amber-900 mr-2 text-sm">{pendingPeriods} حصص</span>
              </div>
            </div>
          </div>

          {/* Substitute Classes Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                قائمة حصص الاحتياط والانتداب وتوقيت إسنادها بالثانية
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                [المعيار الزمني الموحد بالثانية]
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">الحصة</th>
                    <th className="p-3.5">الصف</th>
                    <th className="p-3.5">المعلم الغائب</th>
                    <th className="p-3.5">المعلم المُكَلَّف (الاحتياط)</th>
                    <th className="p-3.5">وقت إسناد الحصة بالثانية</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">إجراء التكليف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absences.map((req) => {
                    const isAssigned = req.status === 'assigned';
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-mono">
                            {req.period}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">{req.gradeClass}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{req.absentTeacher}</td>
                        <td className="p-3.5">
                          {isAssigned ? (
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{req.substituteTeacher}</span>
                            </div>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-bold">
                              بانتظار التكليف
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          {req.assignmentTimestamp ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-800 border border-slate-200">
                              {req.assignmentTimestamp}
                            </span>
                          ) : (
                            <span className="text-slate-400">قيد الانتظار</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isAssigned
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isAssigned ? 'مُسنَد ومُعتمد' : 'معلق'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <select
                            value={req.substituteTeacher || ''}
                            onChange={(e) => onAssignSubstitute(req.id, e.target.value)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">-- تكليف معلم بديل --</option>
                            {teachers
                              .filter((t) => t.name !== req.absentTeacher && t.status !== 'absent')
                              .map((avail) => (
                                <option key={avail.id} value={avail.name}>
                                  {avail.name} ({avail.currentWeeklyLoad} حصة)
                                </option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* AI Assistant Quick Trigger */}
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">
                  صياغة جدول تغطية الاحتياط الرسمي مرتباً بالثانية
                </span>
              </div>
              <button
                id="generate-substitute-report-ai-btn"
                onClick={() =>
                  onGenerateAiReport(
                    '[ADMIN_AUTH_VALIDATED] قم بإعداد جدول توزيع حصص الاحتياط والانتداب الرسمي المعتمد لليوم لمدرسة موسى بن نصير للتعليم ما بعد الأساسي، مع عرض اسم المعلم المكلف والمعلم الغائب ووقت إسناد الحصة بالثانية بصيغة [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS].'
                  )
                }
                disabled={isLoadingAi}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow shrink-0"
              >
                {isLoadingAi ? 'جارِ التحليل...' : 'توليد تقرير الاحتياط المؤرخ بالثانية'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. سجلات الكادر التدريسي: تكريم المعلمين */}
      {activeTab === 'honors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>تكريم المعلمين (تاريخ التكريم + وقت تسجيل نقطة/شهادة التميّز بالثانية + المناسبة)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق أوسمة ونقاط وشهادات التميّز الممنوحة للهيئة التدريسية بدقة متناهية بالثانية.
              </p>
            </div>

            <button
              onClick={() => setIsHonorModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل تكريم جديد بالثانية</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherHonors.map((honor) => (
              <div
                key={honor.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                      <FileBadge className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{honor.teacherName}</h4>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {honor.honorType}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-900 text-emerald-300 border border-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {honor.timestamp}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-500 font-bold block mb-1">المناسبة وسياق التكريم:</span>
                  <p className="text-slate-800 leading-relaxed">{honor.occasion}</p>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>الجهة المانحة: <strong className="text-slate-600">{honor.recordedBy}</strong></span>
                  <span className="font-mono text-emerald-600">موثق بالثانية</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. لجنة شؤون الطلاب والمخالفات السلوكية (القرار الوزاري 234/2017) */}
      {activeTab === 'student_affairs' && (
        <StudentAffairsReview
          infractions={infractions}
          students={students}
          onEnforceAction={onEnforceAdministrativeAction || (() => {})}
          onDismissReferral={onDismissInfractionReferral || (() => {})}
        />
      )}

      {/* 5. سجل التتبع والأمان (Audit Log) */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>سجل التتبع والأمان (Audit Log) - المعيار الزمني الموحد</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  سجل غير قابل للتعديل: تاريخ ووقت الإجراء بالثانية + هُوية المستخدم + التفاصيل قبل وبعد التعديل.
                </p>
              </div>

              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="ابحث في سجل الأمان بالاسم أو الآيدي..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {auditLogs
                .filter((l) => l.targetPerson.includes(auditSearch) || l.operatorName.includes(auditSearch) || l.details.includes(auditSearch))
                .map((log) => (
                  <div key={log.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1 md:w-1/3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-900 text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          {log.timestamp}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {log.actionType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        المشغل: <strong className="text-slate-800">{log.operatorName}</strong> ({log.operatorId})
                      </div>
                    </div>

                    <div className="md:w-1/3 space-y-0.5">
                      <div className="font-bold text-slate-900">المرتبط بالحدث: {log.targetPerson}</div>
                      <p className="text-[11px] text-slate-600">{log.details}</p>
                    </div>

                    <div className="md:w-1/4 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] space-y-0.5">
                      {log.previousState && (
                        <div className="text-slate-400 line-through">السابق: {log.previousState}</div>
                      )}
                      <div className="text-emerald-700 font-bold">الجديد: {log.newState}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: تسجيل غياب أو انتداب جديد */}
      {isAddAbsenceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>تسجيل غياب أو انتداب رسمي جديد (مؤرخ بالثانية)</span>
              </h3>
              <button
                onClick={() => setIsAddAbsenceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAbsence} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المعلم:</label>
                <select
                  value={selectedTeacherName}
                  onChange={(e) => setSelectedTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} - {t.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="is-delegation-check"
                  checked={isDelegation}
                  onChange={(e) => setIsDelegation(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="is-delegation-check" className="font-bold text-slate-800 cursor-pointer">
                  هذا التغيب ناتج عن انتداب أو مهمة عمل رسمية خارج المدرسة
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف / الشعبة:</label>
                  <input
                    type="text"
                    value={affectedClass}
                    onChange={(e) => setAffectedClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="مثال: الصف العاشر / 1"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحصة المتأثرة:</label>
                  <select
                    value={affectedPeriod}
                    onChange={(e) => setAffectedPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <option key={p} value={p}>
                        الحصة {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب الغياب / تفاصيل المهمة:</label>
                <input
                  type="text"
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="مثال: إجازة عارضة، مهمة إشراف خارجي..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAbsenceModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition-all"
                >
                  تسجيل وفتح الاحتياط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: تكريم معلم جديد */}
      {isHonorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>تسجيل تكريم معلم (مؤرخ بالثانية)</span>
              </h3>
              <button
                onClick={() => setIsHonorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHonor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المعلم المُكَرَّم:</label>
                <select
                  value={honorTeacherId}
                  onChange={(e) => setHonorTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع التكريم:</label>
                <select
                  value={honorType}
                  onChange={(e) => setHonorType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                >
                  <option value="وسام الإجادة التربوية">وسام الإجادة التربوية</option>
                  <option value="شهادة تميّز">شهادة تميّز معتمدة</option>
                  <option value="نقطة تميّز">نقطة تميّز إدارية</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المناسبة وسبب التكريم:</label>
                <textarea
                  value={honorOccasion}
                  onChange={(e) => setHonorOccasion(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="اكتب تفاصيل الإنجاز أو المناسبة التربوية..."
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHonorModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition-all"
                >
                  اعتماد التكريم بالثانية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
