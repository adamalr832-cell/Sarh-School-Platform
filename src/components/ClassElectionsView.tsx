import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Vote,
  Crown,
  Award,
  FileText,
  UserPlus,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Users,
  ShieldCheck,
  Printer,
  ChevronDown,
  Sparkles,
  CloudCheck,
  Clock,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import {
  StudentRecord,
  ClassElection,
  ElectionRoleData,
  ElectionCandidate,
  ElectionRoleKey,
} from '../types';
import { saveElectionToFirestore, fetchClassElections } from '../lib/electionsFirebase';
import { SarhLogo } from './SarhLogo';
import { MousaSchoolLogoSVG } from './MousaSchoolLogoSVG';

interface ClassElectionsViewProps {
  students: StudentRecord[];
  teacherName?: string;
  isTeacherAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  onClose?: () => void;
}

const AVAILABLE_CLASSES = [
  'الصف العاشر / 1',
  'الصف العاشر / 2',
  'الصف العاشر / 3',
  'الصف الحادي عشر / 1',
  'الصف الحادي عشر / 2',
  'الصف الثاني عشر / 1',
  'الصف الثاني عشر / 2',
];

interface RoleTemplate {
  key: ElectionRoleKey;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badgeColor: string;
  borderColor: string;
  bgLight: string;
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    key: 'president',
    title: 'رئيس الصف',
    subtitle: 'القيادة العامة للفصل، تمثيل الطلاب، ومتابعة الانضباط والتنسيق مع الإدارة والمعلمين',
    icon: <Crown className="w-5 h-5 text-amber-500" />,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50/40',
  },
  {
    key: 'vicePresident',
    title: 'نائب رئيس الصف',
    subtitle: 'معاونة رئيس الصف والقيام بمهامه في حال غيابه، ومتابعة الأنشطة الصفية',
    icon: <Award className="w-5 h-5 text-emerald-600" />,
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    borderColor: 'border-emerald-300',
    bgLight: 'bg-emerald-50/40',
  },
  {
    key: 'secretary',
    title: 'أمين سر الصف',
    subtitle: 'توثيق سجلات الحضور والأنشطة، تنظيم جداول المناوبات، وكتابة محاضر اجتماعات الفصل',
    icon: <FileText className="w-5 h-5 text-sky-600" />,
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    borderColor: 'border-sky-300',
    bgLight: 'bg-sky-50/40',
  },
];

export const ClassElectionsView: React.FC<ClassElectionsViewProps> = ({
  students,
  teacherName = 'أ. سعيد بن راشد الحارثي (رائد الفصل)',
  isTeacherAuthenticated = true,
  onOpenAuthModal,
  onClose,
}) => {
  // 1. Class Selection & Classroom Configuration
  const [selectedClass, setSelectedClass] = useState<string>(AVAILABLE_CLASSES[0]);
  const [totalStudents, setTotalStudents] = useState<number>(30);

  // Candidates & Votes State for each position
  const [rolesData, setRolesData] = useState<{
    president: ElectionRoleData;
    vicePresident: ElectionRoleData;
    secretary: ElectionRoleData;
  }>({
    president: {
      roleKey: 'president',
      roleTitle: 'رئيس الصف',
      roleDescription: 'القيادة العامة للفصل وتمثيل الطلاب',
      candidates: [
        { id: 'c-1', name: 'محمد بن حمد البوسعيدي', votes: 14 },
        { id: 'c-2', name: 'أحمد بن سلطان الهاشمي', votes: 11 },
        { id: 'c-3', name: 'سالم بن ناصر المعمري', votes: 4 },
      ],
      totalVotes: 29,
      winnerId: 'c-1',
      winnerName: 'محمد بن حمد البوسعيدي',
      isTie: false,
    },
    vicePresident: {
      roleKey: 'vicePresident',
      roleTitle: 'نائب رئيس الصف',
      roleDescription: 'معاونة رئيس الصف والقيام بمهامه عند غيابه',
      candidates: [
        { id: 'c-4', name: 'خالد بن يوسف البلوشي', votes: 16 },
        { id: 'c-5', name: 'عبدالله بن سالم الجابري', votes: 13 },
      ],
      totalVotes: 29,
      winnerId: 'c-4',
      winnerName: 'خالد بن يوسف البلوشي',
      isTie: false,
    },
    secretary: {
      roleKey: 'secretary',
      roleTitle: 'أمين سر الصف',
      roleDescription: 'توثيق سجلات الحضور وتنظيم جداول الفصل',
      candidates: [
        { id: 'c-6', name: 'عمر بن عبدالعزيز الشكيلي', votes: 18 },
        { id: 'c-7', name: 'هيثم بن طارق الحكماني', votes: 11 },
      ],
      totalVotes: 29,
      winnerId: 'c-6',
      winnerName: 'عمر بن عبدالعزيز الشكيلي',
      isTie: false,
    },
  });

  // New Candidate Inputs per role
  const [newCandidateInputs, setNewCandidateInputs] = useState<Record<ElectionRoleKey, string>>({
    president: '',
    vicePresident: '',
    secretary: '',
  });

  // Selected Student from roster per role
  const [selectedStudentPicker, setSelectedStudentPicker] = useState<Record<ElectionRoleKey, string>>({
    president: '',
    vicePresident: '',
    secretary: '',
  });

  // Save & Cloud State
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; message: string; isError?: boolean }>({
    show: false,
    message: '',
  });
  const [savedElectionsList, setSavedElectionsList] = useState<ClassElection[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'certificate'>('editor');

  // Filter students belonging to the currently selected class
  const classStudents = students.filter((s) => s.gradeClass === selectedClass);

  // Update total students automatically when class changes if roster exists
  useEffect(() => {
    if (classStudents.length > 0) {
      setTotalStudents(classStudents.length);
    }
  }, [selectedClass, classStudents.length]);

  // Load existing elections from Firestore on mount
  useEffect(() => {
    loadFirestoreElections();
  }, []);

  const loadFirestoreElections = async () => {
    try {
      const records = await fetchClassElections();
      setSavedElectionsList(records);
    } catch (err) {
      console.error('Failed to load elections:', err);
    }
  };

  // Recalculate winners, ties, and total votes whenever candidates or votes change
  const calculateRoleResults = (candidates: ElectionCandidate[]): {
    totalVotes: number;
    winnerId: string | null;
    winnerName: string | null;
    isTie: boolean;
  } => {
    const totalVotes = candidates.reduce((sum, c) => sum + (Number(c.votes) || 0), 0);
    if (candidates.length === 0) {
      return { totalVotes: 0, winnerId: null, winnerName: null, isTie: false };
    }

    let maxVotes = -1;
    let winners: ElectionCandidate[] = [];

    for (const c of candidates) {
      const v = Number(c.votes) || 0;
      if (v > maxVotes) {
        maxVotes = v;
        winners = [c];
      } else if (v === maxVotes && maxVotes > 0) {
        winners.push(c);
      }
    }

    if (maxVotes <= 0) {
      return { totalVotes, winnerId: null, winnerName: null, isTie: false };
    }

    const isTie = winners.length > 1;
    const winner = winners[0];

    return {
      totalVotes,
      winnerId: isTie ? null : winner.id,
      winnerName: isTie ? `تعادل بين (${winners.map((w) => w.name).join(' و ')})` : winner.name,
      isTie,
    };
  };

  // Handler: Update candidate votes manually via Number Input
  const handleVoteChange = (roleKey: ElectionRoleKey, candidateId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value, 10) || 0);

    setRolesData((prev) => {
      const role = prev[roleKey];
      const updatedCandidates = role.candidates.map((c) =>
        c.id === candidateId ? { ...c, votes: numValue } : c
      );
      const { totalVotes, winnerId, winnerName, isTie } = calculateRoleResults(updatedCandidates);

      return {
        ...prev,
        [roleKey]: {
          ...role,
          candidates: updatedCandidates,
          totalVotes,
          winnerId,
          winnerName,
          isTie,
        },
      };
    });
  };

  // Increment / Decrement vote buttons
  const handleVoteStep = (roleKey: ElectionRoleKey, candidateId: string, delta: number) => {
    setRolesData((prev) => {
      const role = prev[roleKey];
      const updatedCandidates = role.candidates.map((c) => {
        if (c.id === candidateId) {
          const newVotes = Math.max(0, (c.votes || 0) + delta);
          return { ...c, votes: newVotes };
        }
        return c;
      });
      const { totalVotes, winnerId, winnerName, isTie } = calculateRoleResults(updatedCandidates);

      return {
        ...prev,
        [roleKey]: {
          ...role,
          candidates: updatedCandidates,
          totalVotes,
          winnerId,
          winnerName,
          isTie,
        },
      };
    });
  };

  // Add a Candidate to a Role
  const handleAddCandidate = (roleKey: ElectionRoleKey, candidateName: string) => {
    const trimmed = candidateName.trim();
    if (!trimmed) return;

    setRolesData((prev) => {
      const role = prev[roleKey];
      // Prevent duplicates in same role
      if (role.candidates.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }

      const newCandidate: ElectionCandidate = {
        id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        votes: 0,
      };

      const updatedCandidates = [...role.candidates, newCandidate];
      const { totalVotes, winnerId, winnerName, isTie } = calculateRoleResults(updatedCandidates);

      return {
        ...prev,
        [roleKey]: {
          ...role,
          candidates: updatedCandidates,
          totalVotes,
          winnerId,
          winnerName,
          isTie,
        },
      };
    });

    // Reset inputs
    setNewCandidateInputs((prev) => ({ ...prev, [roleKey]: '' }));
    setSelectedStudentPicker((prev) => ({ ...prev, [roleKey]: '' }));
  };

  // Remove a Candidate
  const handleRemoveCandidate = (roleKey: ElectionRoleKey, candidateId: string) => {
    setRolesData((prev) => {
      const role = prev[roleKey];
      const updatedCandidates = role.candidates.filter((c) => c.id !== candidateId);
      const { totalVotes, winnerId, winnerName, isTie } = calculateRoleResults(updatedCandidates);

      return {
        ...prev,
        [roleKey]: {
          ...role,
          candidates: updatedCandidates,
          totalVotes,
          winnerId,
          winnerName,
          isTie,
        },
      };
    });
  };

  // Reset/Clear votes for a role
  const handleResetRoleVotes = (roleKey: ElectionRoleKey) => {
    setRolesData((prev) => {
      const role = prev[roleKey];
      const updatedCandidates = role.candidates.map((c) => ({ ...c, votes: 0 }));
      return {
        ...prev,
        [roleKey]: {
          ...role,
          candidates: updatedCandidates,
          totalVotes: 0,
          winnerId: null,
          winnerName: null,
          isTie: false,
        },
      };
    });
  };

  // Validation Checks: votes cannot be negative, cannot exceed totalStudents
  const getRoleValidation = (roleKey: ElectionRoleKey) => {
    const role = rolesData[roleKey];
    const exceeds = role.totalVotes > totalStudents;
    const hasNegative = role.candidates.some((c) => c.votes < 0);
    const isValid = !exceeds && !hasNegative;

    return {
      isValid,
      exceeds,
      hasNegative,
      message: exceeds
        ? `تنبيه: مجموع الأصوات (${role.totalVotes}) يتجاوز إجمالي عدد طلاب الصف (${totalStudents})!`
        : hasNegative
        ? 'تنبيه: لا يمكن إدخال عدد أصوات سالب!'
        : null,
    };
  };

  const isAllValid =
    getRoleValidation('president').isValid &&
    getRoleValidation('vicePresident').isValid &&
    getRoleValidation('secretary').isValid;

  // Save Election Data to Firebase Firestore
  const handleSaveElection = async () => {
    if (!isAllValid) {
      setSaveToast({
        show: true,
        message: 'يرجى تصحيح أرقام الأصوات التي تتجاوز إجمالي عدد طلاب الصف قبل الحفظ.',
        isError: true,
      });
      setTimeout(() => setSaveToast({ show: false, message: '' }), 4000);
      return;
    }

    setIsSaving(true);

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampStr = `[التاريخ: ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} | الوقت: ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;

    const electionRecord: ClassElection = {
      id: `election_${selectedClass.replace(/[^0-9a-zA-Z\u0600-\u06FF]/g, '_')}`,
      gradeClass: selectedClass,
      totalClassStudents: totalStudents,
      academicYear: '2025/2026',
      roles: rolesData,
      status: 'completed',
      certified: true,
      savedAt: now.toISOString(),
      teacherName: teacherName,
      timestampStr: timestampStr,
    };

    const res = await saveElectionToFirestore(electionRecord);
    setIsSaving(false);

    if (res.success) {
      // Fire celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C48B69', '#135D43', '#1B2A4A', '#8B1E1E', '#F59E0B'],
      });

      setSaveToast({
        show: true,
        message: `تم حفظ واعتماد نتائج انتخابات (${selectedClass}) بنجاح في قاعدة البيانات وتوثيقها رسمياً.`,
        isError: false,
      });

      // Update local saved elections
      setSavedElectionsList((prev) => {
        const filtered = prev.filter((e) => e.gradeClass !== selectedClass);
        return [electionRecord, ...filtered];
      });

      setTimeout(() => {
        setSaveToast({ show: false, message: '' });
      }, 5000);
    } else {
      setSaveToast({
        show: true,
        message: res.error || 'حدث خطأ أثناء حفظ النتائج في قاعدة البيانات.',
        isError: true,
      });
      setTimeout(() => setSaveToast({ show: false, message: '' }), 5000);
    }
  };

  // Load a previously saved election into the active editor
  const handleLoadElection = (election: ClassElection) => {
    setSelectedClass(election.gradeClass);
    setTotalStudents(election.totalClassStudents || 30);
    setRolesData(election.roles);
    setActiveTab('editor');
    setSaveToast({
      show: true,
      message: `تم استرجاع بيانات انتخابات (${election.gradeClass}) للتعديل أو المراجعة.`,
      isError: false,
    });
    setTimeout(() => setSaveToast({ show: false, message: '' }), 3000);
  };

  return (
    <div className="bg-[#F9F8F6] rounded-3xl border border-slate-200 shadow-md p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Toast Alert */}
      {saveToast.show && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold border transition-all animate-bounce ${
            saveToast.isError
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-[#135D43] text-white border-emerald-600'
          }`}
        >
          {saveToast.isError ? (
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          )}
          <span>{saveToast.message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Title with Official Branding */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#135D43] to-[#1B2A4A] flex items-center justify-center text-white shadow-sm shrink-0">
              <Vote className="w-6 h-6 text-[#C48B69]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-[#1B2A4A]">
                  إدارة انتخابات وترشيح مجالس الصفوف
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#135D43]/10 text-[#135D43] border border-[#135D43]/20">
                  بوابة المعلم المعتمدة
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  العام الدراسي 2025/2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                نظام فرز الأصوات الرقمي وتحديد الفائزين بمناصب (رئيس الصف، نائب رئيس الصف، وأمين سر الصف) مع التوثيق السحابي
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-[#1B2A4A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فرز وإدخال الأصوات
              </button>
              <button
                onClick={() => setActiveTab('certificate')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'certificate'
                    ? 'bg-white text-[#1B2A4A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                وثيقة الاعتماد الرسمية
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-white text-[#1B2A4A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>السجل السحابي</span>
                {savedElectionsList.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#135D43] text-white text-[9px] flex items-center justify-center font-mono">
                    {savedElectionsList.length}
                  </span>
                )}
              </button>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
              >
                رجوع
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: Main Election Editor (فرز وإدخال الأصوات) */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Class Selector & Total Students Configuration Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* 1. Class Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. تحديد الصف الدراسي المراد انتخاب مجلسه:
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#135D43] focus:ring-1 focus:ring-[#135D43] text-sm font-bold text-[#1B2A4A] transition-all cursor-pointer"
                  >
                    {AVAILABLE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Total Students in Class */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. إجمالي عدد طلاب الصف (السقف الأعلى للأصوات):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={totalStudents}
                    onChange={(e) => setTotalStudents(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#135D43] text-sm font-black text-center text-[#1B2A4A]"
                  />
                  <div className="text-[11px] text-slate-500 leading-tight">
                    <span className="block font-bold text-slate-800">طالباً في الفصل</span>
                    <span>(مسجلون في السجل الرسمي)</span>
                  </div>
                </div>
              </div>

              {/* 3. Class Teacher Info & Status */}
              <div className="bg-[#F9F8F6] p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-600 mb-1">
                  <span className="font-bold text-[#1B2A4A]">المعلم المشرف:</span>
                  <span className="font-medium text-[#135D43]">{teacherName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-bold text-[#1B2A4A]">حالة البيانات:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CloudCheck className="w-3.5 h-3.5" />
                    <span>متصل بـ Firestore</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Positions & Candidates Sections (3 Distinct Sections) */}
          <div className="space-y-5">
            {ROLE_TEMPLATES.map((tpl) => {
              const roleData = rolesData[tpl.key];
              const validation = getRoleValidation(tpl.key);

              return (
                <div
                  key={tpl.key}
                  className={`bg-white rounded-3xl border-2 ${
                    validation.exceeds ? 'border-rose-400 bg-rose-50/20' : tpl.borderColor
                  } shadow-xs overflow-hidden transition-all`}
                >
                  {/* Position Header Banner */}
                  <div className={`p-4 sm:p-5 border-b border-slate-200 ${tpl.bgLight}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-white shadow-xs border border-slate-200">
                          {tpl.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-[#1B2A4A] text-base sm:text-lg">
                              {tpl.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${tpl.badgeColor}`}>
                              {roleData.candidates.length} مرشحين
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{tpl.subtitle}</p>
                        </div>
                      </div>

                      {/* Vote Summary & Winner Display */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Winner Pill */}
                        {roleData.winnerName ? (
                          <div
                            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
                              roleData.isTie
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-950 border-emerald-400 shadow-xs'
                            }`}
                          >
                            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              {roleData.isTie ? 'حالة تعادل:' : 'الفائز بالمركز الأول:'}
                            </span>
                            <span className="font-black underline mr-1">{roleData.winnerName}</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
                            بانتظار رصد الأصوات
                          </div>
                        )}

                        {/* Total Votes Count */}
                        <div
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                            validation.exceeds
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}
                        >
                          مجموع الأصوات: <span className="font-black text-sm">{roleData.totalVotes}</span> / {totalStudents}
                        </div>

                        {/* Reset button */}
                        <button
                          onClick={() => handleResetRoleVotes(tpl.key)}
                          title="تصفير أصوات هذا المنصب"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Validation Warning Alert */}
                    {validation.message && (
                      <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-pulse">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{validation.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Position Candidates List & Manual Votes Table */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {roleData.candidates.length === 0 ? (
                      <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
                        لا يوجد مرشحون مسجلون لهذا المنصب حتى الآن. قم بإضافة مرشحين من الحقول أدناه.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {roleData.candidates.map((cand, index) => {
                          const isWinner =
                            !roleData.isTie &&
                            roleData.winnerId === cand.id &&
                            cand.votes > 0;
                          const isTieWinner =
                            roleData.isTie &&
                            cand.votes > 0 &&
                            cand.votes === Math.max(...roleData.candidates.map((c) => c.votes));
                          const votePercentage =
                            totalStudents > 0
                              ? Math.min(100, Math.round((cand.votes / totalStudents) * 100))
                              : 0;

                          return (
                            <div
                              key={cand.id}
                              className={`p-3.5 rounded-2xl border transition-all relative ${
                                isWinner
                                  ? 'bg-gradient-to-b from-amber-50/80 to-white border-amber-400 shadow-sm ring-2 ring-amber-400/30'
                                  : isTieWinner
                                  ? 'bg-amber-50/40 border-amber-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {/* 1st Place Ribbon if Winner */}
                              {isWinner && (
                                <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black shadow-xs flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-white" />
                                  <span>المركز الأول</span>
                                </div>
                              )}

                              {isTieWinner && (
                                <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-black border border-amber-300 flex items-center gap-1">
                                  <span>تعادل بالمركز الأول</span>
                                </div>
                              )}

                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                    {index + 1}
                                  </span>
                                  <div className="font-bold text-sm text-[#1B2A4A] leading-snug">
                                    {cand.name}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveCandidate(tpl.key, cand.id)}
                                  title="حذف هذا المرشح"
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Manual Vote Input Field with Stepper Buttons */}
                              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 mt-2">
                                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                  <span className="font-bold text-slate-700">عدد الأصوات الممنوحة:</span>
                                  <span className="font-mono text-[11px] text-slate-500">
                                    {votePercentage}% من الصف
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Step down button */}
                                  <button
                                    type="button"
                                    onClick={() => handleVoteStep(tpl.key, cand.id, -1)}
                                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center transition-colors"
                                    title="إنقاص صوت"
                                  >
                                    -
                                  </button>

                                  {/* Number Input Required by user request */}
                                  <input
                                    type="number"
                                    min="0"
                                    max={totalStudents}
                                    value={cand.votes}
                                    onChange={(e) => handleVoteChange(tpl.key, cand.id, e.target.value)}
                                    placeholder="0"
                                    className={`flex-1 px-3 py-1.5 rounded-lg border text-center font-black text-base text-[#1B2A4A] transition-all ${
                                      isWinner
                                        ? 'bg-amber-50/50 border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                                        : 'bg-white border-slate-300 focus:border-[#135D43] focus:ring-1 focus:ring-[#135D43]'
                                    }`}
                                  />

                                  {/* Step up button */}
                                  <button
                                    type="button"
                                    onClick={() => handleVoteStep(tpl.key, cand.id, 1)}
                                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center transition-colors"
                                    title="زيادة صوت"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Progress Bar of Votes */}
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isWinner ? 'bg-amber-500' : 'bg-[#135D43]'
                                    }`}
                                    style={{ width: `${votePercentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Candidate Controls: Either choose from Class Students or type custom name */}
                    <div className="bg-[#F9F8F6] p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Option A: Quick select from class roster */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          إضافة من قائمة طلاب ({selectedClass}):
                        </label>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={selectedStudentPicker[tpl.key]}
                            onChange={(e) => {
                              setSelectedStudentPicker((p) => ({ ...p, [tpl.key]: e.target.value }));
                              if (e.target.value) {
                                handleAddCandidate(tpl.key, e.target.value);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
                          >
                            <option value="">-- اختر طالباً لإضافته كمرشح --</option>
                            {classStudents.map((st) => (
                              <option key={st.id} value={st.name}>
                                {st.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Option B: Type a new candidate manually */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          أو إدخال اسم مرشح يدوياً:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="اكتب اسم الطالب المرشح..."
                            value={newCandidateInputs[tpl.key]}
                            onChange={(e) =>
                              setNewCandidateInputs((p) => ({ ...p, [tpl.key]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddCandidate(tpl.key, newCandidateInputs[tpl.key]);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:border-[#135D43]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCandidate(tpl.key, newCandidateInputs[tpl.key])}
                            className="px-3 py-1.5 rounded-xl bg-[#1B2A4A] hover:bg-[#132038] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>إضافة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer: Save to Firebase Firestore & Print Certificate */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black text-[#1B2A4A]">اعتماد نتائج انتخابات مجلس الصف</div>
              <p className="text-xs text-slate-500 mt-0.5">
                عند النقر على "حفظ النتائج"، سيتم توثيق النتائج بالثانية في قاعدة بيانات Firestore السحابية
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('certificate')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#1B2A4A] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#C48B69]" />
                <span>معاينة وثيقة الاعتماد</span>
              </button>

              <button
                type="button"
                onClick={handleSaveElection}
                disabled={isSaving || !isAllValid}
                className={`px-6 py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md ${
                  !isAllValid
                    ? 'bg-slate-400 cursor-not-allowed opacity-70'
                    : 'bg-[#135D43] hover:bg-[#0e4632] hover:scale-[1.02]'
                }`}
              >
                <Save className="w-4 h-4 text-emerald-200" />
                <span>{isSaving ? 'جارٍ الحفظ في Firestore...' : 'حفظ النتائج في قاعدة البيانات'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Official Printable Election Certificate (وثيقة الاعتماد الرسمية) */}
      {activeTab === 'certificate' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">
              شهادة اعتماد تشكيل مجلس الصف الرسمية مع التوثيق المزدوج لوزارة التربية والتعليم
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#1B2A4A] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#132038] transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>طباعة الشهادة الرسمية</span>
            </button>
          </div>

          {/* Printable Sheet */}
          <div
            id="class-election-printable-certificate"
            className="bg-white rounded-3xl border-4 border-double border-emerald-800 p-8 shadow-lg max-w-4xl mx-auto space-y-6 text-[#1B2A4A] relative overflow-hidden"
          >
            {/* Background Dual Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none gap-8">
              <img src="/sarh_main_logo.jpg" alt="" className="w-72 h-72 object-contain grayscale" />
              <MousaSchoolLogoSVG size={280} className="grayscale" />
            </div>

            {/* Official Header */}
            <div className="border-b-2 border-emerald-800 pb-5">
              <div className="flex items-start justify-between">
                <div className="text-right space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-950">سلطنة عُمان</h4>
                  <h3 className="text-sm font-extrabold text-emerald-900">وزارة التربية والتعليم</h3>
                  <p className="text-[11px] text-slate-600">المديرية العامة للتربية والتعليم بمحافظة مسقط</p>
                  <p className="text-xs font-bold text-slate-900">مدرسة موسى بن نصير للتعليم ما بعد الأساسي (9-12)</p>
                </div>

                {/* Dual Logos in Header */}
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl border-2 border-[#C48B69] p-0.5 bg-white shadow-xs">
                    <img src="/sarh_main_logo.jpg" alt="صرح" className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl border-2 border-[#8B1E1E] p-0.5 bg-white shadow-xs">
                    <MousaSchoolLogoSVG size="100%" />
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <h1 className="text-xl font-black text-[#1B2A4A] tracking-tight">
                  محضر وشهادة فرز انتخابات تشكيل مجلس الفصل
                </h1>
                <p className="text-xs text-slate-600 font-bold mt-1">
                  للعام الدراسي 2025/2026 • الفصل الدراسي الأول
                </p>
              </div>
            </div>

            {/* Class Details Banner */}
            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-slate-200 grid grid-cols-3 text-center text-xs">
              <div>
                <span className="text-slate-500 block">الصف الدراسي:</span>
                <strong className="text-sm text-[#1B2A4A]">{selectedClass}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">عدد طلاب الصف المقيدين:</span>
                <strong className="text-sm text-[#135D43]">{totalStudents} طالباً</strong>
              </div>
              <div>
                <span className="text-slate-500 block">المعلم المشرف ورائد الفصل:</span>
                <strong className="text-sm text-[#1B2A4A]">{teacherName}</strong>
              </div>
            </div>

            {/* Results Table */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-emerald-950 border-r-4 border-emerald-700 pr-2">
                النتائج النهائية المعتمدة للأعضاء الفائزين بمجلس الصف:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ROLE_TEMPLATES.map((tpl) => {
                  const role = rolesData[tpl.key];
                  return (
                    <div
                      key={tpl.key}
                      className="p-4 rounded-2xl border-2 border-emerald-700/40 bg-emerald-50/30 text-center space-y-2 relative"
                    >
                      <div className="inline-flex p-2 rounded-xl bg-white shadow-xs border border-emerald-200">
                        {tpl.icon}
                      </div>
                      <div className="text-xs font-bold text-slate-600">{tpl.title}</div>
                      <div className="text-base font-black text-emerald-950">
                        {role.winnerName || 'لم يتم الحسم بعد'}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#135D43]">
                        {role.winnerId
                          ? `الأصوات: ${role.candidates.find((c) => c.id === role.winnerId)?.votes || 0} صوتاً`
                          : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Breakdown Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse border border-slate-200">
                  <thead className="bg-[#1B2A4A] text-white">
                    <tr>
                      <th className="p-2.5 border border-slate-300">المنصب</th>
                      <th className="p-2.5 border border-slate-300">أسماء المرشحين</th>
                      <th className="p-2.5 border border-slate-300 text-center">عدد الأصوات</th>
                      <th className="p-2.5 border border-slate-300 text-center">النسبة المئوية</th>
                      <th className="p-2.5 border border-slate-300 text-center">الحالة النهائية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLE_TEMPLATES.map((tpl) => {
                      const role = rolesData[tpl.key];
                      return role.candidates.map((cand, idx) => {
                        const isWin = role.winnerId === cand.id;
                        const pct =
                          totalStudents > 0
                            ? Math.round((cand.votes / totalStudents) * 100)
                            : 0;

                        return (
                          <tr
                            key={cand.id}
                            className={isWin ? 'bg-amber-50/60 font-bold' : 'hover:bg-slate-50'}
                          >
                            {idx === 0 && (
                              <td
                                rowSpan={role.candidates.length}
                                className="p-2.5 border border-slate-200 font-bold bg-slate-50 text-[#1B2A4A] align-top"
                              >
                                {tpl.title}
                              </td>
                            )}
                            <td className="p-2.5 border border-slate-200">{cand.name}</td>
                            <td className="p-2.5 border border-slate-200 text-center font-mono font-bold">
                              {cand.votes}
                            </td>
                            <td className="p-2.5 border border-slate-200 text-center font-mono">
                              {pct}%
                            </td>
                            <td className="p-2.5 border border-slate-200 text-center">
                              {isWin ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                                  فائز بالمركز الأول 👑
                                </span>
                              ) : (
                                <span className="text-slate-400">مرشح</span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Signatures & Digital Stamp */}
            <div className="border-t-2 border-dashed border-slate-300 pt-6 mt-6 grid grid-cols-3 gap-4 text-center text-xs">
              <div className="space-y-10">
                <div className="font-bold text-slate-700">توقيع رائد الفصل:</div>
                <div className="font-serif text-slate-800 font-bold">..............................</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-10 h-10 rounded-xl border border-dashed border-[#C48B69] p-0.5 bg-white flex items-center justify-center">
                    <img src="/sarh_main_logo.jpg" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-10 h-10 rounded-xl border border-dashed border-[#8B1E1E] p-0.5 bg-white flex items-center justify-center">
                    <MousaSchoolLogoSVG size="100%" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">[ختم المنظومة الرسمي المزدوج]</span>
              </div>
              <div className="space-y-10">
                <div className="font-bold text-slate-700">اعتماد مدير المدرسة:</div>
                <div className="font-serif text-slate-800 font-bold">..............................</div>
              </div>
            </div>

            {/* Precision Timestamp Footer */}
            <div className="border-t border-slate-200 pt-3 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>نظام التوثيق الزمني الدقيق بالثانية لمنصة صَرْح المدرسية ومدرسة موسى بن نصير</span>
              <span>SHA256-ELECT-{selectedClass.replace(/[^0-9]/g, '')}-CERTIFIED</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Saved Cloud Elections History (السجل السحابي في Firestore) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1B2A4A]">
                سجل نتائج الانتخابات المحفوظة سحابياً (Firestore Database)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تصفح نتائج مجالس الصفوف التي تم اعتمادها وحفظها سابقاً مع إمكانية استرجاعها وتعديلها
              </p>
            </div>
            <button
              onClick={loadFirestoreElections}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تحديث السجل</span>
            </button>
          </div>

          {savedElectionsList.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Vote className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">
                لم يتم حفظ أي انتخابات صفوف حتى الآن
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                قم باختيار الصف وفرز الأصوات ثم اضغط "حفظ النتائج في قاعدة البيانات" ليتم حفظها سحابياً.
              </p>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2 rounded-xl bg-[#135D43] text-white text-xs font-bold hover:bg-[#0e4632] transition-colors"
              >
                الانتقال لفرز الأصوات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedElectionsList.map((elec) => (
                <div
                  key={elec.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#135D43] flex items-center justify-center font-bold">
                        <Vote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-[#1B2A4A] text-sm">{elec.gradeClass}</div>
                        <div className="text-[10px] text-slate-500">
                          {elec.timestampStr || elec.savedAt}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      معتمدة ومحفوظة
                    </span>
                  </div>

                  {/* Winners Summary */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-amber-50/50 p-2 rounded-xl border border-amber-200/60">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>رئيس الصف:</span>
                      </span>
                      <strong className="text-slate-900 font-extrabold">
                        {elec.roles?.president?.winnerName || 'غير محدد'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between bg-emerald-50/50 p-2 rounded-xl border border-emerald-200/60">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>نائب رئيس الصف:</span>
                      </span>
                      <strong className="text-slate-900 font-extrabold">
                        {elec.roles?.vicePresident?.winnerName || 'غير محدد'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between bg-sky-50/50 p-2 rounded-xl border border-sky-200/60">
                      <span className="font-bold text-sky-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>أمين سر الصف:</span>
                      </span>
                      <strong className="text-slate-900 font-extrabold">
                        {elec.roles?.secretary?.winnerName || 'غير محدد'}
                      </strong>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      إجمالي الطلاب: {elec.totalClassStudents}
                    </span>
                    <button
                      onClick={() => handleLoadElection(elec)}
                      className="px-3 py-1.5 rounded-lg bg-[#1B2A4A] text-white hover:bg-[#132038] font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>تعديل أو استعراض</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
