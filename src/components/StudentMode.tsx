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
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
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
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">بوابة الطلاب مقفلة</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          هذه البوابة مخصصة للطلاب وتتطلب إدخال رمز الدخول السري المعتمد للطلاب (الرمز الافتراضي: 3030) لمشاهدة رصيد نقاطك ورفع طلبات الاستبدال للمعلم.
        </p>
        {onOpenAuthModal && (
          <button
            id="student-unlock-gateway-btn"
            onClick={onOpenAuthModal}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 1. لوحة بسيطة تُظهر رصيد "نقاطي" الحالي للطالب (عرض فقط دون إمكانية التعديل) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-800/40">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                [STUDENT_AUTH_VALIDATED]
              </span>
              <span className="text-xs text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                مدرسة موسى بن نصير للتعليم ما بعد الأساسي
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>مرحباً، {studentName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 font-medium">
              الصف: <strong className="text-white">{studentClass}</strong> • نظام منح النقاط خاضع حصرياً لتقييم المعلم.
            </p>
          </div>

          {/* Read-Only Points Balance Card */}
          <div className="bg-gradient-to-br from-amber-500/20 via-slate-800/80 to-slate-900/90 border-2 border-amber-400/50 rounded-2xl p-5 text-center min-w-[220px] shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>رصيد "نقاطي" الحالي (عرض فقط)</span>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight my-1 drop-shadow-sm flex items-center justify-center gap-1">
              <span>{eduCoins}</span>
              <span className="text-sm sm:text-base font-bold text-amber-200">نقطة</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              مُعتمدة وممنوحة من المعلم
            </div>
          </div>
        </div>

        {/* Informational banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>المعلم هو الجهة الوحيدة المخولة بمنح النقاط للطالب تقديراً للمشاركة والانضباط الصفي.</span>
          </div>
        </div>
      </div>

      {/* 2. متجر الاستبدال (مقيد بحصر مطلق بخيارين اثنين فقط لا غير) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="pb-4 mb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>متجر الاستبدال (خيارات الاستبدال المعتمدة)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              يمكنك استبدال نقاطك بأحد الخيارين المحددين أدناه ليرتفع الطلب مباشرة إلى المعلم لمراجعته واعتماده:
            </p>
          </div>

          <div className="bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs text-amber-800 font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>رصيدك المتاح: {eduCoins} نقطة</span>
          </div>
        </div>

        {/* The 2 Allowed Options Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* الخيار الأول: طلب درجات */}
          <div className="relative rounded-2xl p-6 border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 font-mono">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>50 نقطة</span>
                </span>
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold mb-2">
                الخيار الأول
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
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
                    ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
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
          <div className="relative rounded-2xl p-6 border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 font-mono">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>100 نقطة</span>
                </span>
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-2">
                الخيار الثاني
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
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
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
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
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span>سجل متابعة طلبات الاستبدال المرفوعة للمعلم:</span>
          </h4>

          {studentRequests.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              لم تقم برفع أي طلب استبدال حتى الآن. اختر "طلب درجات" أو "طلب تكريم" من الأعلى.
            </div>
          ) : (
            <div className="space-y-2.5">
              {studentRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    req.status === 'approved'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {req.status === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                    )}
                    <div>
                      <span className="font-bold">
                        {req.type === 'grades' ? 'طلب درجات' : 'طلب تكريم'}
                      </span>
                      <span className="text-slate-500 mr-2 text-[11px]">({req.createdAt})</span>
                    </div>
                  </div>

                  <div>
                    {req.status === 'approved' ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {req.type === 'grades'
                          ? `تم الاعتماد: تم منحك +${req.awardedGrades || 1} درجات مستحقة بواسطة ${req.teacherName || 'المعلم'}`
                          : `تم قبول واعتماد التكريم بنجاح بواسطة ${req.teacherName || 'الأستاذ'}`}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
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
