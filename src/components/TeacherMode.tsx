import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  UserCheck,
  Coins,
  Sparkles,
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Users,
  Check,
  History,
  Inbox,
  Send,
  AlertCircle,
  FileCheck,
  AlertTriangle,
  Plus,
  FileText,
  Vote,
} from 'lucide-react';
import { StudentRecord, TeacherAwardLog, RedemptionRequest, StudentInfraction } from '../types';
import { ClassElectionsView } from './ClassElectionsView';

interface TeacherModeProps {
  isTeacherAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  onOpenExportModal?: () => void;
  students: StudentRecord[];
  awardLogs: TeacherAwardLog[];
  infractions: StudentInfraction[];
  redemptionRequests: RedemptionRequest[];
  onUpdateStudentAttendance: (studentId: string, status: 'present' | 'absent' | 'late', period: number) => void;
  onMarkAllPresent: (gradeClass: string, period: number) => void;
  onAwardPoints: (studentId: string, points: number, reason: string) => void;
  onAddInfraction: (studentId: string, category: string, description: string, severity: 'خفيفة' | 'متوسطة' | 'جسيمة') => void;
  onApproveGradesRequest: (requestId: string, gradesAmount: number) => void;
  onApproveHonorRequest: (requestId: string) => void;
  onGenerateAiResponse: (prompt: string) => void;
  isLoadingAi: boolean;
}

export const TeacherMode: React.FC<TeacherModeProps> = ({
  isTeacherAuthenticated = false,
  onOpenAuthModal,
  onOpenExportModal,
  students,
  awardLogs,
  infractions,
  redemptionRequests,
  onUpdateStudentAttendance,
  onMarkAllPresent,
  onAwardPoints,
  onAddInfraction,
  onApproveGradesRequest,
  onApproveHonorRequest,
  onGenerateAiResponse,
  isLoadingAi,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'coins' | 'infractions' | 'requests' | 'elections'>('attendance');

  // Attendance Controls State
  const [selectedClass, setSelectedClass] = useState<string>('الصف العاشر / 1');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [attendanceSavedToast, setAttendanceSavedToast] = useState<boolean>(false);

  // Award Points State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedReason, setSelectedReason] = useState<string>('مشاركة صفية وتفاعل متميز أثناء الشرح');
  const [customReason, setCustomReason] = useState<string>('');
  const [pointsAmount, setPointsAmount] = useState<number>(20);
  const [awardSuccessMessage, setAwardSuccessMessage] = useState<string | null>(null);

  // Infraction Modal State
  const [isInfractionModalOpen, setIsInfractionModalOpen] = useState(false);
  const [infrStudentId, setInfrStudentId] = useState(students[0]?.id || '');
  const [infrCategory, setInfrCategory] = useState('تأخر عن الحصة');
  const [infrDescription, setInfrDescription] = useState('تأخر عن دخول الحصة لمدة 10 دقائق بعد انتهاء الطابور');
  const [infrSeverity, setInfrSeverity] = useState<'خفيفة' | 'متوسطة' | 'جسيمة'>('خفيفة');

  // Grade Input for each pending request
  const [gradeInputs, setGradeInputs] = useState<Record<string, number>>({});

  // Filter students by selected class
  const classStudents = students.filter((s) => s.gradeClass === selectedClass);
  const presentCount = classStudents.filter((s) => s.attendanceStatus === 'present').length;
  const absentCount = classStudents.filter((s) => s.attendanceStatus === 'absent').length;
  const lateCount = classStudents.filter((s) => s.attendanceStatus === 'late').length;
  const attendanceRate = classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 100;

  // Pending requests count
  const pendingRequestsCount = redemptionRequests.filter((r) => r.status === 'pending').length;

  const handleSaveAttendance = () => {
    setAttendanceSavedToast(true);
    setTimeout(() => {
      setAttendanceSavedToast(false);
    }, 4000);
  };

  const handleAwardCoins = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? customReason.trim() : selectedReason;
    if (!selectedStudentId || !finalReason) return;

    onAwardPoints(selectedStudentId, Number(pointsAmount), finalReason);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#14B8A6', '#F59E0B', '#10B981'],
    });

    const targetStudent = students.find((s) => s.id === selectedStudentId);
    setAwardSuccessMessage(`تم منح وتوثيق +${pointsAmount} نقطة بالثانية للطالب ${targetStudent?.name || ''}!`);
    setCustomReason('');

    setTimeout(() => {
      setAwardSuccessMessage(null);
    }, 4000);
  };

  const handleCreateInfraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infrStudentId || !infrDescription) return;
    onAddInfraction(infrStudentId, infrCategory, infrDescription, infrSeverity);
    setIsInfractionModalOpen(false);
  };

  const handleGradeInputChange = (requestId: string, value: number) => {
    setGradeInputs((prev) => ({
      ...prev,
      [requestId]: Math.max(1, value),
    }));
  };

  const handleApproveGrades = (requestId: string) => {
    const amount = gradeInputs[requestId] || 1;
    onApproveGradesRequest(requestId, amount);

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#10B981'],
    });
  };

  const handleApproveHonor = (requestId: string) => {
    onApproveHonorRequest(requestId);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#6366F1'],
    });
  };

  // Locked Gateway state if Teacher is not authenticated
  if (!isTeacherAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg" dir="rtl">
        <div className="w-16 h-16 bg-[#135D43]/10 text-[#135D43] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#135D43]/20 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">بوابة الهيئة التدريسية مقفلة</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          هذه البوابة مخصصة للمعلمين وتتطلب إدخال رمز الدخول السري المعتمد للمعلم (الرمز الافتراضي: 2020) لتسجيل الحضور بالثانية، ومنح النقاط، رصد الملاحظات، واعتماد طلبات الاستبدال.
        </p>
        {onOpenAuthModal && (
          <button
            id="teacher-unlock-gateway-btn"
            onClick={onOpenAuthModal}
            className="w-full py-3 px-4 rounded-xl bg-[#C48B69] hover:bg-[#b07857] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>إدخال رمز المعلم (2020) وتوثيق البوابة</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-[#1B2A4A] via-[#14233f] to-[#0d172a] rounded-3xl p-6 text-white shadow-md border border-[#135D43]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#135D43]/30 border border-[#C48B69]/50 flex items-center justify-center text-[#C48B69] shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold">بوابة الهيئة التدريسية (Teacher Portal)</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#135D43]/30 text-[#C48B69] border border-[#C48B69]/40 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-[#C48B69]" />
                [TEACHER_AUTH_VALIDATED]
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1B2A4A] text-slate-200 border border-[#C48B69]/30 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-[#C48B69]" />
                معيار التوثيق الزمني بالثانية
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              مدرسة موسى بن نصير للتعليم ما بعد الأساسي • رصد حضور الطلاب بالثانية، منح النقاط حصرياً، والمخالفات السلوكية واعتماد الاستبدال
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-[#132038] p-1.5 rounded-xl border border-[#1B2A4A] self-start md:self-auto flex-wrap gap-1">
          <button
            id="teacher-tab-attendance"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'attendance'
                ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>غياب وحضور الحصص</span>
          </button>

          <button
            id="teacher-tab-coins"
            onClick={() => setActiveTab('coins')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'coins'
                ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>تكريم الطلاب ومنح النقاط</span>
          </button>

          <button
            id="teacher-tab-infractions"
            onClick={() => setActiveTab('infractions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'infractions'
                ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>المخالفات والملاحظات ({infractions.length})</span>
          </button>

          <button
            id="teacher-tab-requests"
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'requests'
                ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>طلبات الاستبدال</span>
            {pendingRequestsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C48B69] text-white text-[10px] font-black flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            id="teacher-tab-elections"
            onClick={() => setActiveTab('elections')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeTab === 'elections'
                ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Vote className="w-3.5 h-3.5 text-[#C48B69]" />
            <span>انتخابات مجالس الصفوف</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black shadow-xs">
              جديد
            </span>
          </button>
        </div>
      </div>

      {/* SUCCESS TOASTS */}
      {attendanceSavedToast && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span className="text-xs sm:text-sm font-bold">
              تم حفظ كشف الحضور والغياب لـ {selectedClass} (الحصة {selectedPeriod}) مؤرخاً بالثانية في النظام!
            </span>
          </div>
          <button
            onClick={() => setAttendanceSavedToast(false)}
            className="text-xs px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white"
          >
            حسناً
          </button>
        </div>
      )}

      {awardSuccessMessage && (
        <div className="p-4 rounded-2xl bg-teal-600 text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-xs sm:text-sm font-bold">{awardSuccessMessage}</span>
          </div>
          <button
            onClick={() => setAwardSuccessMessage(null)}
            className="text-xs px-2.5 py-1 rounded bg-white/20 hover:bg-white/30 text-white"
          >
            حسناً
          </button>
        </div>
      )}

      {/* 1. غياب وتأخر الطالب: (تاريخ اليوم + وقت تسجيل الحضور/الغياب بالثانية + رقم الحصة) */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">الصف والشعبة:</label>
                  <select
                    id="attendance-class-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="الصف العاشر / 1">الصف العاشر / 1</option>
                    <option value="الصف العاشر / 2">الصف العاشر / 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم الحصة الدراسية:</label>
                  <select
                    id="attendance-period-select"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <option key={p} value={p}>
                        الحصة {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onOpenExportModal && (
                  <button
                    id="teacher-download-attendance-pdf-btn"
                    onClick={onOpenExportModal}
                    className="px-3.5 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#14233f] text-[#C48B69] border border-[#C48B69]/40 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    title="تحميل كشف حضور وغياب الطلاب بصيغة PDF الرسمية"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C48B69]" />
                    <span>تحميل كشف الحضور PDF</span>
                  </button>
                )}

                <button
                  id="mark-all-present-btn"
                  onClick={() => onMarkAllPresent(selectedClass, selectedPeriod)}
                  className="px-3.5 py-2 rounded-xl bg-[#135D43]/15 hover:bg-[#135D43]/25 text-[#135D43] text-xs font-bold border border-[#135D43]/30 transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#135D43]" />
                  <span>تسجيل الجميع كحاضر بالثانية</span>
                </button>

                <button
                  id="save-attendance-btn"
                  onClick={handleSaveAttendance}
                  className="px-4 py-2 rounded-xl bg-[#C48B69] hover:bg-[#b07857] text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>حفظ واعتماد الكشف</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="bg-[#F9F8F6] p-3 rounded-xl border border-slate-200 text-center">
                <div className="text-xs text-slate-500 font-medium">إجمالي الطلاب</div>
                <div className="text-xl font-bold text-[#1B2A4A] mt-0.5">{classStudents.length}</div>
              </div>
              <div className="bg-[#135D43]/10 p-3 rounded-xl border border-[#135D43]/20 text-center">
                <div className="text-xs text-[#135D43] font-medium">الحضور الفعلي</div>
                <div className="text-xl font-bold text-[#135D43] mt-0.5">{presentCount}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                <div className="text-xs text-red-700 font-medium">الغياب</div>
                <div className="text-xl font-bold text-red-700 mt-0.5">{absentCount}</div>
              </div>
              <div className="bg-[#C48B69]/15 p-3 rounded-xl border border-[#C48B69]/30 text-center">
                <div className="text-xs text-[#9a6444] font-medium">التأخر الصفي</div>
                <div className="text-xl font-bold text-[#9a6444] mt-0.5">{lateCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-[#F9F8F6] border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#135D43]" />
                <span>كشف الحضور والغياب (تاريخ اليوم + وقت التسجيل بالثانية + رقم الحصة)</span>
              </h3>
              <span className="text-[11px] font-mono text-[#1B2A4A] bg-white px-2.5 py-0.5 rounded border border-[#C48B69]/30">
                الحصة الحالية: {selectedPeriod}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {classStudents.map((student, idx) => (
                <div
                  key={student.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#F9F8F6] text-[#1B2A4A] border border-slate-200 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                      {student.seatNumber || idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1B2A4A]">{student.name}</span>
                        {/* Timestamp + Period Badge */}
                        {student.attendanceTimestamp && (
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F9F8F6] text-slate-700 border border-slate-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#135D43]" />
                            {student.attendanceTimestamp} (الحصة {student.attendancePeriod || selectedPeriod})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>الرصيد: <strong className="text-[#C48B69] font-bold">{student.points} نقطة</strong></span>
                        <span>•</span>
                        <span>الحالة: <strong className={student.attendanceStatus === 'present' ? 'text-[#135D43]' : student.attendanceStatus === 'absent' ? 'text-red-700' : 'text-[#C48B69]'}>
                          {student.attendanceStatus === 'present' ? 'حاضر' : student.attendanceStatus === 'absent' ? 'غائب' : 'متأخر'}
                        </strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      onClick={() => onUpdateStudentAttendance(student.id, 'present', selectedPeriod)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        student.attendanceStatus === 'present'
                          ? 'bg-[#135D43] text-white shadow-sm ring-2 ring-[#135D43]/30'
                          : 'bg-[#F9F8F6] text-slate-600 hover:bg-[#135D43]/10 hover:text-[#135D43]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>حاضر</span>
                    </button>

                    <button
                      onClick={() => onUpdateStudentAttendance(student.id, 'absent', selectedPeriod)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        student.attendanceStatus === 'absent'
                          ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-300'
                          : 'bg-[#F9F8F6] text-slate-600 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>غائب</span>
                    </button>

                    <button
                      onClick={() => onUpdateStudentAttendance(student.id, 'late', selectedPeriod)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        student.attendanceStatus === 'late'
                          ? 'bg-[#C48B69] text-white shadow-sm ring-2 ring-[#C48B69]/30'
                          : 'bg-[#F9F8F6] text-slate-600 hover:bg-[#C48B69]/10 hover:text-[#9a6444]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>متأخر</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-slate-300">
                  إرسال كشف الحضور والغياب المؤرخ بالثانية إلى نواة صَرْح
                </span>
              </div>
              <button
                onClick={() =>
                  onGenerateAiResponse(
                    `[TEACHER_AUTH_VALIDATED] قم بصياغة ملخص رسمي لحضور وغياب وتأخر طلاب ${selectedClass} للحصة ${selectedPeriod}: عدد الحضور ${presentCount}، الغياب ${absentCount}، المتأخرون ${lateCount} بمدرسة موسى بن نصير للتعليم ما بعد الأساسي مرتبة بالثانية [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS].`
                  )
                }
                disabled={isLoadingAi}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors shadow shrink-0"
              >
                {isLoadingAi ? 'جارِ التحليل...' : 'توليد تقرير الحضور المؤرخ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. تكريم الطلاب: (تاريخ التكريم + وقت منح وسام/نقطة التميّز بالثانية + سبب التكريم) */}
      {activeTab === 'coins' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>تكريم الطلاب: منح أوسمة ونقاط التميّز (مؤرخ بالثانية)</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                المعلم هو الجهة الوحيدة المخولة بمنح النقاط؛ يُسجل تاريخ التكريم ووقت المنح بالثانية مع سبب التكريم بدقة.
              </p>
            </div>

            <form onSubmit={handleAwardCoins} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الطالب المستحق للتكريم:</label>
                <select
                  id="award-student-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.gradeClass}) - رصيده الحالي: {st.points} نقطة
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب التكريم والتميّز:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {[
                    'مشاركة صفية وتفاعل متميز أثناء الشرح',
                    'إنجاز الواجب والأنشطة الاستقصائية في الموعد',
                    'الانضباط والهدوء والسلوك الإيجابي داخل الصف',
                    'تفوق في حل المسائل والتطبيق العملي',
                    'مساعدة الزملاء وروح التعاون البناء',
                  ].map((reason) => (
                    <button
                      type="button"
                      key={reason}
                      onClick={() => {
                        setSelectedReason(reason);
                        setCustomReason('');
                      }}
                      className={`p-2.5 rounded-xl text-right text-xs font-medium border transition-all ${
                        selectedReason === reason && !customReason
                          ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold ring-1 ring-teal-400'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="أو اكتب سبباً مخصصاً للتكريم هنا..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عدد النقاط الممنوحة:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[10, 15, 20, 25, 50].map((pts) => (
                    <button
                      type="button"
                      key={pts}
                      onClick={() => setPointsAmount(pts)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        pointsAmount === pts
                          ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                          : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>+{pts} نقطة</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="submit-award-points-btn"
                className="w-full py-3 px-4 rounded-xl bg-[#C48B69] hover:bg-[#b07857] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>اعتماد التكريم ومنح النقاط مؤرخة بالثانية</span>
              </button>
            </form>
          </div>

          {/* Recent Awards Log with Precision Timestamps */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <History className="w-4 h-4 text-[#135D43]" />
                <span>سجل تكريم الطلاب المؤرخ</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{awardLogs.length} تكريم</span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {awardLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.studentName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#C48B69]/20 text-[#9a6444] font-bold font-mono text-[11px] flex items-center gap-1">
                      <Coins className="w-3 h-3 text-[#C48B69]" />
                      +{log.points}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.reason}</p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <span className="font-medium text-slate-600">{log.teacherName}</span>
                    <span className="font-mono bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-700">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. المخالفات والملاحظات: (تاريخ رصد المخالفة + وقت التسجيل بالثانية + اسم الشخص الذي قام بالرصد) */}
      {activeTab === 'infractions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1B2A4A] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C48B69]" />
                <span>سجل المخالفات والملاحظات (تاريخ رصد المخالفة + وقت التسجيل بالثانية + الراصد)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                توثيق فوري ومحكم لأي ملاحظات سلوكية أو تأخر مدرسي بالثانية وفق لائحة شؤون الطلاب بوزارة التعليم.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {onOpenExportModal && (
                <button
                  id="teacher-download-infractions-pdf-btn"
                  onClick={onOpenExportModal}
                  className="px-3.5 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#14233f] text-[#C48B69] border border-[#C48B69]/40 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  title="تحميل كشف المخالفات السلوكية الطلابي PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C48B69]" />
                  <span>تحميل كشف المخالفات PDF</span>
                </button>
              )}

              <button
                onClick={() => setIsInfractionModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#C48B69] hover:bg-[#b07857] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>رصد مخالفة / ملاحظة جديدة</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {infractions.map((infr) => (
              <div key={infr.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{infr.studentName}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
                      {infr.gradeClass}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      infr.severity === 'جسيمة' ? 'bg-red-100 text-red-800' : infr.severity === 'متوسطة' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      درجة: {infr.severity}
                    </span>
                  </div>
                  <div className="text-amber-800 font-semibold text-[11px]">
                    التصنيف: {infr.category}
                  </div>
                </div>

                <div className="md:w-1/3 text-slate-700 text-xs leading-relaxed">
                  {infr.description}
                </div>

                <div className="md:w-1/4 flex flex-col items-start md:items-end gap-1">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-emerald-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {infr.timestamp}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    الراصد: <strong className="text-slate-700">{infr.recordedBy}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. قائمة طلبات الاستبدال المعلقة (درجات / تكريم) */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-teal-600" />
                  <span>قائمة طلبات الاستبدال المرفوعة من الطلاب (درجات / تكريم)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تحديد كمية الدرجات المستحقة يدوياً أو اعتماد التكريم مع توثيق وقت الاعتماد بالثانية.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold">
                  {pendingRequestsCount} طلبات بانتظار الاعتماد
                </span>
              </div>
            </div>

            {redemptionRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                لا توجد أي طلبات استبدال مرفوعة حالياً.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {redemptionRequests.map((req) => {
                  const isPending = req.status === 'pending';
                  const isGrades = req.type === 'grades';
                  const isHonor = req.type === 'honor';
                  const currentGradeInput = gradeInputs[req.id] || 1;

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-xl my-2 border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isPending
                          ? isGrades
                            ? 'bg-blue-50/40 border-blue-200'
                            : 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-90'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{req.studentName}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                            {req.gradeClass}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              isGrades
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {isGrades ? <GraduationCap className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                            {isGrades ? 'طلب درجات' : 'طلب تكريم'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            وقت الرفع: {req.createdAt}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          {isGrades
                            ? `استبدل الطالب (${req.pointsCost} نقطة) للمطالبة بدرجات تفوق.`
                            : `استبدل الطالب (${req.pointsCost} نقطة) لطلب تكريم رسمي.`}
                        </p>
                      </div>

                      {/* Teacher Actions */}
                      <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                        {isPending ? (
                          <>
                            {isGrades && (
                              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-blue-200 shadow-sm">
                                <label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                                  الدرجات المستحقة:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={currentGradeInput}
                                  onChange={(e) => handleGradeInputChange(req.id, Number(e.target.value))}
                                  className="w-16 px-2 py-1 text-center font-bold text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-xs text-slate-500 font-bold">درجة</span>
                                <button
                                  id={`approve-grades-btn-${req.id}`}
                                  onClick={() => handleApproveGrades(req.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#135D43] hover:bg-[#0e4834] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>اعتماد الدرجات</span>
                                </button>
                              </div>
                            )}

                            {isHonor && (
                              <button
                                id={`approve-honor-btn-${req.id}`}
                                onClick={() => handleApproveHonor(req.id)}
                                className="px-4 py-2 rounded-xl bg-[#C48B69] hover:bg-[#b07857] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                              >
                                <Award className="w-4 h-4 text-white" />
                                <span>قبول واعتماد التكريم</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="px-3.5 py-1.5 rounded-xl bg-[#135D43]/15 text-[#135D43] text-xs font-bold flex items-center gap-1.5 border border-[#135D43]/30">
                            <CheckCircle2 className="w-4 h-4 text-[#135D43]" />
                            <span>
                              {isGrades
                                ? `تم الاعتماد (+${req.awardedGrades} درجات) بواسطة ${req.teacherName}`
                                : `تم اعتماد التكريم بواسطة ${req.teacherName}`}
                            </span>
                            {req.teacherActionAt && (
                              <span className="font-mono text-[10px] text-[#135D43] mr-1">
                                [{req.teacherActionAt}]
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. انتخابات مجالس الصفوف (رئيس الصف، نائب رئيس الصف، أمين سر الصف) */}
      {activeTab === 'elections' && (
        <ClassElectionsView
          students={students}
          teacherName="أ. سعيد بن راشد الحارثي (رائد الفصل)"
          isTeacherAuthenticated={isTeacherAuthenticated}
          onOpenAuthModal={onOpenAuthModal}
        />
      )}

      {/* Modal: رصد مخالفة أو ملاحظة سلوكية */}
      {isInfractionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C48B69]" />
                <span>رصد مخالفة أو ملاحظة سلوكية (مؤرخة بالثانية)</span>
              </h3>
              <button
                onClick={() => setIsInfractionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInfraction} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الطالب:</label>
                <select
                  value={infrStudentId}
                  onChange={(e) => setInfrStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.gradeClass})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف:</label>
                  <select
                    value={infrCategory}
                    onChange={(e) => setInfrCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                  >
                    <option value="تأخر عن الحصة">تأخر عن الحصة</option>
                    <option value="عدم إحضار أدوات التعلم">عدم إحضار أدوات التعلم</option>
                    <option value="سلوك صفي غير لائق">سلوك صفي غير لائق</option>
                    <option value="عدم أداء الواجب">عدم أداء الواجب</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">درجة الخطورة:</label>
                  <select
                    value={infrSeverity}
                    onChange={(e) => setInfrSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
                  >
                    <option value="خفيفة">خفيفة</option>
                    <option value="متوسطة">متوسطة</option>
                    <option value="جسيمة">جسيمة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تفاصيل الملاحظة / الإجراء المتخذ:</label>
                <textarea
                  value={infrDescription}
                  onChange={(e) => setInfrDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="اكتب تفاصيل المخالفة..."
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInfractionModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C48B69] hover:bg-[#b07857] text-white font-bold shadow-md transition-all"
                >
                  توثيق المخالفة بالثانية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
