import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Coins,
  Sparkles,
  CheckCircle2,
  Lock,
  KeyRound,
  GraduationCap,
  Award,
  Clock,
  ShieldCheck,
  Send,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { RedemptionRequest, RedemptionType } from '../types';

interface StudentModeProps {
  isStudentAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  eduCoins: number;
  studentRequests: RedemptionRequest[];
  onRequestRedemption: (type: RedemptionType, cost: number) => void;
  studentName?: string;
  studentClass?: string;
}

export const StudentMode: React.FC<StudentModeProps> = ({
  isStudentAuthenticated = false,
  onOpenAuthModal,
  eduCoins,
  studentRequests,
  onRequestRedemption,
  studentName = 'محمد بن حمد البوسعيدي',
  studentClass = 'الصف العاشر / 1',
}) => {
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleRequest = (type: RedemptionType, cost: number) => {
    if (eduCoins < cost) return;

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1B2A4A', '#135D43', '#C48B69'],
    });

    onRequestRedemption(type, cost);

    if (type === 'grades') {
      setSuccessToast('تم رفع "طلب درجات" إلى المعلم بنجاح! بانتظار تحديد كمية الدرجات المستحقة واعتمادها.');
    } else {
      setSuccessToast('تم رفع "طلب تكريم" إلى الأستاذ بنجاح! بانتظار قبوله واعتماده رسمياً.');
    }

    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  // Locked Gateway State if Student is not authenticated
  if (!isStudentAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-lg" dir="rtl">
        <div className="w-16 h-16 bg-[#F9F8F6] text-[#C48B69] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C48B69]/30 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">بوابة الطلاب مقفلة</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          هذه البوابة مخصصة للطلاب وتتطلب إدخال رمز الدخول السري المعتمد للطلاب (الرمز الافتراضي: 3030) لمشاهدة رصيد نقاطك ورفع طلبات الاستبدال للمعلم.
        </p>
        {onOpenAuthModal && (
          <button
            id="student-unlock-gateway-btn"
            onClick={onOpenAuthModal}
            className="w-full py-3 px-4 rounded-xl bg-[#1B2A4A] hover:bg-[#14233f] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 border border-[#C48B69]/40"
          >
            <KeyRound className="w-4 h-4 text-[#C48B69]" />
            <span>إدخال رمز الدخول (3030) وفتح بوابة الطالب</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#1B2A4A] text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in border border-[#C48B69]/40">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#C48B69] shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 1. لوحة بسيطة تُظهر رصيد "نقاطي" الحالي للطالب (عرض فقط دون إمكانية التعديل) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#14233f] to-[#0d172a] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#C48B69]/30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#C48B69]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#135D43]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-[#135D43]/30 text-emerald-300 border border-[#135D43]/50 font-bold flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C48B69]" />
                [STUDENT_AUTH_VALIDATED]
              </span>
              <span className="text-xs text-[#F9F8F6]/80 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                مدرسة موسى بن نصير للتعليم ما بعد الأساسي
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>مرحباً، {studentName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#F9F8F6]/80 font-medium">
              الصف: <strong className="text-[#C48B69]">{studentClass}</strong> • نظام منح النقاط خاضع حصرياً لتقييم المعلم.
            </p>
          </div>

          {/* Read-Only Points Balance Card */}
          <div className="bg-white/10 border-2 border-[#C48B69]/50 rounded-2xl p-5 text-center min-w-[220px] shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#C48B69] mb-1">
              <Coins className="w-4 h-4 text-[#C48B69]" />
              <span>رصيد "نقاطي" الحالي (عرض فقط)</span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight my-1 drop-shadow-sm flex items-center justify-center gap-1">
              <span>{eduCoins}</span>
              <span className="text-sm sm:text-base font-bold text-[#C48B69]">نقطة</span>
            </div>
            <div className="text-[11px] text-[#F9F8F6]/70 mt-1">
              مُعتمدة وممنوحة من المعلم
            </div>
          </div>
        </div>

        {/* Informational banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#F9F8F6]/80 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#C48B69]" />
            <span>المعلم هو الجهة الوحيدة المخولة بمنح النقاط للطالب تقديراً للمشاركة والانضباط الصفي.</span>
          </div>
        </div>
      </div>

      {/* 2. متجر الاستبدال (مقيد بحصر مطلق بخيارين اثنين فقط لا غير) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="pb-4 mb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C48B69]" />
              <span>متجر الاستبدال (خيارات الاستبدال المعتمدة)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              يمكنك استبدال نقاطك بأحد الخيارين المحددين أدناه ليرتفع الطلب مباشرة إلى المعلم لمراجعته واعتماده:
            </p>
          </div>

          <div className="bg-[#C48B69]/15 px-3.5 py-1.5 rounded-xl border border-[#C48B69]/30 text-xs text-[#9a6444] font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <Coins className="w-4 h-4 text-[#C48B69]" />
            <span>رصيدك المتاح: {eduCoins} نقطة</span>
          </div>
        </div>

        {/* The 2 Allowed Options Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* الخيار الأول: طلب درجات */}
          <div className="relative rounded-2xl p-6 border border-[#135D43]/30 bg-gradient-to-br from-[#135D43]/5 to-white hover:border-[#135D43]/50 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#135D43]/15 border border-[#135D43]/30 text-[#135D43] flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C48B69]/20 text-[#9a6444] border border-[#C48B69]/30 flex items-center gap-1 font-mono">
                  <Coins className="w-3.5 h-3.5 text-[#C48B69]" />
                  <span>50 نقطة</span>
                </span>
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#135D43]/15 text-[#135D43] text-[11px] font-bold mb-2">
                الخيار الأول
              </div>
              <h3 className="text-base font-bold text-[#1B2A4A] mb-2">
                1) طلب درجات
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                عند الضغط على هذا الزر، يرتفع طلب رسمي إلى معلم المادة ليقوم بالاطلاع على التزامك ونقاطك، وتحديد كمية الدرجات الممنوحة لك واعتمادها يدوياً في كشف المادة.
              </p>
            </div>

            <div>
              <button
                id="request-grades-btn"
                onClick={() => handleRequest('grades', 50)}
                disabled={eduCoins < 50}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow transition-all flex items-center justify-center gap-2 ${
                  eduCoins >= 50
                    ? 'bg-[#135D43] hover:bg-[#0e4834] text-white active:scale-98'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {eduCoins >= 50 ? 'رفع طلب درجات للمعلم (50 نقطة)' : 'رصيد النقاط غير كافٍ (تحتاج 50 نقطة)'}
                </span>
              </button>
            </div>
          </div>

          {/* الخيار الثاني: طلب تكريم */}
          <div className="relative rounded-2xl p-6 border border-[#C48B69]/30 bg-gradient-to-br from-[#C48B69]/5 to-white hover:border-[#C48B69]/50 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C48B69]/15 border border-[#C48B69]/30 text-[#C48B69] flex items-center justify-center shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C48B69]/20 text-[#9a6444] border border-[#C48B69]/30 flex items-center gap-1 font-mono">
                  <Coins className="w-3.5 h-3.5 text-[#C48B69]" />
                  <span>100 نقطة</span>
                </span>
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#C48B69]/15 text-[#9a6444] text-[11px] font-bold mb-2">
                الخيار الثاني
              </div>
              <h3 className="text-base font-bold text-[#1B2A4A] mb-2">
                2) طلب تكريم
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                عند الضغط على هذا الزر، يرتفع طلب رسمي إلى الأستاذ لاعتماده وقبول تكريمك والثناء على جهودك وانضباطك أمام زملائك في الصف أو في الإذاعة المدرسية.
              </p>
            </div>

            <div>
              <button
                id="request-honor-btn"
                onClick={() => handleRequest('honor', 100)}
                disabled={eduCoins < 100}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow transition-all flex items-center justify-center gap-2 ${
                  eduCoins >= 100
                    ? 'bg-[#C48B69] hover:bg-[#b07857] text-white active:scale-98'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>
                  {eduCoins >= 100 ? 'رفع طلب تكريم للأستاذ (100 نقطة)' : 'رصيد النقاط غير كافٍ (تحتاج 100 نقطة)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* سجل متابعة طلبات الاستبدال المرفوعة للمعلم */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs sm:text-sm font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#C48B69]" />
            <span>سجل متابعة طلبات الاستبدال المرفوعة للمعلم:</span>
          </h4>

          {studentRequests.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#F9F8F6] border border-slate-200 text-xs text-slate-500 text-center">
              لم تقم برفع أي طلب استبدال حتى الآن. اختر "طلب درجات" أو "طلب تكريم" من الأعلى.
            </div>
          ) : (
            <div className="space-y-2.5">
              {studentRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    req.status === 'approved'
                      ? 'bg-[#135D43]/10 border-[#135D43]/30 text-[#135D43]'
                      : 'bg-[#C48B69]/10 border-[#C48B69]/30 text-[#9a6444]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {req.status === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#135D43] shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#C48B69] shrink-0 animate-pulse" />
                    )}
                    <div>
                      <span className="font-bold text-[#1B2A4A]">
                        {req.type === 'grades' ? 'طلب درجات' : 'طلب تكريم'}
                      </span>
                      <span className="text-slate-500 mr-2 text-[11px]">({req.createdAt})</span>
                    </div>
                  </div>

                  <div>
                    {req.status === 'approved' ? (
                      <span className="px-3 py-1 rounded-lg bg-[#135D43]/15 text-[#135D43] font-bold flex items-center gap-1 text-[11px] border border-[#135D43]/20">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#135D43]" />
                        {req.type === 'grades'
                          ? `تم الاعتماد: تم منحك +${req.awardedGrades || 1} درجات مستحقة بواسطة ${req.teacherName || 'المعلم'}`
                          : `تم قبول واعتماد التكريم بنجاح بواسطة ${req.teacherName || 'الأستاذ'}`}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-[#C48B69]/15 text-[#9a6444] font-bold flex items-center gap-1 text-[11px] border border-[#C48B69]/20">
                        <Clock className="w-3.5 h-3.5 text-[#C48B69]" />
                        بانتظار مراجعة المعلم وتحديد الاستحقاق
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
