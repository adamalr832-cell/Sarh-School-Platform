import React from 'react';
import { X, Palette, Sparkles, Download, CheckCircle2, Shield, Eye } from 'lucide-react';

interface BrandIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandIdentityModal: React.FC<BrandIdentityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 text-right">
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#1B2A4A] text-white px-6 py-4 rounded-t-3xl flex items-center justify-between border-b border-[#1B2A4A]/80 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#135D43] to-[#1B2A4A] flex items-center justify-center text-white shadow-md border border-[#C48B69]/40">
              <Palette className="w-5 h-5 text-[#C48B69]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  المرجع التصميمي المعتمد لواجهة صَرْح (SARH Design System)
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C48B69]/20 text-[#C48B69] border border-[#C48B69]/40 font-mono font-bold">
                  Single Source of Truth
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                نموذج واجهة التطبيق التفاعلي على الهاتف الذكي • لوحة ألوان التعليم العماني الحديثة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Main Visual: Full Detailed Smartphone UI Screen Mockup */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-950 group">
            <img
              src="/sarh_mobile_ui_mockup.jpg"
              alt="نموذج واجهة تطبيق صَرْح على هاتف ذكي حديث يعكس الهوية الرقمية الكاملة"
              className="w-full h-auto max-h-[460px] object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-white/15 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C48B69] shrink-0" />
                <span className="font-semibold">
                  شاشة واجهة تطبيق منصة صَرْح كاملة على هاتف ذكي حديث فوق سطح خشب البلوط الطبيعي
                </span>
              </div>
              <a
                href="/sarh_mobile_ui_mockup.jpg"
                download="sarh_smartphone_ui_mockup.jpg"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-[#C48B69] hover:bg-[#b07857] text-white font-bold flex items-center justify-center gap-1.5 text-xs transition-colors shrink-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل شاشة الواجهة عالية الدقة</span>
              </a>
            </div>
          </div>

          {/* Color Transformation Specification Table with Exact Hex Codes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#135D43]" />
                <span>قواعد تعيين لوحة الألوان النظامية (Mandatory Design Tokens)</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">المرجعية الصارمة للنظام الكامل</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Token 1: Deep Royal Navy Blue (#1B2A4A) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1B2A4A]">الأساسي (Authority)</span>
                  <div className="w-6 h-6 rounded-full bg-[#1B2A4A] border-2 border-white shadow-xs"></div>
                </div>
                <div className="font-bold text-slate-900 text-sm">Deep Royal Navy Blue</div>
                <div className="text-xs font-mono font-bold text-[#1B2A4A] bg-blue-100/60 px-2 py-0.5 rounded w-fit">
                  #1B2A4A
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 pt-2">
                  <strong>التعيين الشامل:</strong> خلفية شريط التنقل العلوي (Top Bar)، عناوين لوحة التحكم الرئيسية، خط كلمة «صَرْح» الانسيابي، وكلمة «SARH PLATFORM».
                </p>
                <div className="text-[10px] text-[#1B2A4A] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#135D43]" />
                  <span>يرمز للهيبة المؤسسية والأمان السيبراني</span>
                </div>
              </div>

              {/* Token 2: Luxury Emerald Green (#135D43) */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#135D43]">الثانوي (Growth)</span>
                  <div className="w-6 h-6 rounded-full bg-[#135D43] border-2 border-white shadow-xs"></div>
                </div>
                <div className="font-bold text-emerald-950 text-sm">Luxury Emerald Green</div>
                <div className="text-xs font-mono font-bold text-[#135D43] bg-emerald-100/80 px-2 py-0.5 rounded w-fit">
                  #135D43
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-emerald-200/60 pt-2">
                  <strong>التعيين الشامل:</strong> أيقونة التبويب النشطة بشريط التنقل السفلي، حدود بطاقات لوحة التحكم النشطة، وأوراق الشعار المعماري.
                </p>
                <div className="text-[10px] text-[#135D43] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>يرمز للعلم والنماء والانضباط التربوي</span>
                </div>
              </div>

              {/* Token 3: Soft Omani Rose Gold (#C48B69) */}
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#C48B69]">التمييز (Heritage)</span>
                  <div className="w-6 h-6 rounded-full bg-[#C48B69] border-2 border-white shadow-xs"></div>
                </div>
                <div className="font-bold text-amber-950 text-sm">Soft Omani Rose Gold</div>
                <div className="text-xs font-mono font-bold text-[#C48B69] bg-amber-100/80 px-2 py-0.5 rounded w-fit">
                  #C48B69
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-amber-200/60 pt-2">
                  <strong>التعيين الشامل:</strong> العناصر التفاعلية (الزر الأساسي «إدارة الفصول»، مفاتيح التبديل)، وبرعم النمو في الشعار، وحلقات التمييز.
                </p>
                <div className="text-[10px] text-[#C48B69] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>يرمز للأصالة العمانية والتفاعل الحيوي</span>
                </div>
              </div>

              {/* Token 4: Warm Off-White / Beige (#F9F8F6) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-[#F9F8F6] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">السطح (Clean Tech)</span>
                  <div className="w-6 h-6 rounded-full bg-[#F9F8F6] border-2 border-slate-300 shadow-xs"></div>
                </div>
                <div className="font-bold text-slate-900 text-sm">Warm Off-White / Beige</div>
                <div className="text-xs font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded w-fit">
                  #F9F8F6
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 pt-2">
                  <strong>التعيين الشامل:</strong> الخلفية الكاملة لشاشة الهاتف والتطبيق، مسطحات البطاقات الهادئة، وخلفيات حقول الإدخال.
                </p>
                <div className="text-[10px] text-slate-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#135D43]" />
                  <span>يرمز للنقاء الرقمي وسهولة القراءة</span>
                </div>
              </div>
            </div>
          </div>

          {/* UI Screen Components Breakdown */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#135D43]" />
              <span>التفكيك الهيكلي لواجهة الشاشة (UI Breakdown Single Source of Truth):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <strong className="text-[#1B2A4A] block">1. الشريط العلوي (Top Bar):</strong>
                <span>خلفية أزرق كحلي ملكي عميق (#1B2A4A) مدمج بها شعار صَرْح الأيقوني بالذهب الوردي والأزرق، مع أيقونة جرس التنبيهات.</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <strong className="text-[#1B2A4A] block">2. القسم البارز (Hero Section):</strong>
                <span>مسطح بيج ناعم دافئ (#F9F8F6) يعرض الشعارين الرئيسيين: «منصة ذكية وآمنة للمدارس العُمانية» و«بوابتكم للتحول الرقمي».</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <strong className="text-[#135D43] block">3. شبكة لوحة التحكم (Dashboard Grid):</strong>
                <span>بطاقات منظمة للطلاب، الدرجات، والحضور والغياب، محاطة بإطارات خضراء زمردية (#135D43) وتفاصيل بالذهب الوردي.</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <strong className="text-[#C48B69] block">4. الزر التفاعلي الأساسي (Primary CTA):</strong>
                <span>زر دائري الحواف عريض يحمل عبارة «إدارة الفصول» بلون الذهب الوردي العماني الناعم (#C48B69) مع خط أبيض واضح وبارز.</span>
              </div>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <div>
                <strong className="text-slate-900">5. شريط التبويبات السفلي (Bottom Navigation):</strong> سطح أبيض ناصع بأيقونات كحلية (الرئيسية، التقارير، الإعدادات) مع تمييز التبويب النشط بالأخضر الزمردي الفاخر (#135D43).
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-3xl border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            المرجع الأوحد لنظام التصميم • منصة صَرْح التعليمية المعتمدة
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1B2A4A] hover:bg-[#132038] text-white font-bold transition-colors shadow-sm"
          >
            إغلاق المرجع
          </button>
        </div>
      </div>
    </div>
  );
};
