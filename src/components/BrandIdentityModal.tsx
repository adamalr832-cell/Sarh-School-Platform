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
        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between border-b border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md border border-emerald-400/40">
              <Palette className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  دليل الهوية البصرية المعتمدة لمنصة صَرْح
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  SARH Luxury-Tech Identity
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                نظام الألوان الرسمي للمنظومة التعليمية الرقمية المعتمد لسلطنة عُمان
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Main Visual: The Generated Mockup */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-950 group">
            <img
              src="/brand_mockup.jpg"
              alt="بطاقة الهوية البصرية الفاخرة لمنصة صَرْح المدرسية"
              className="w-full h-auto max-h-[440px] object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  مشهد تصويري ماكرو (Macro Mockup) لبطاقة الهوية الرقمية على خشب البلوط الطبيعي
                </span>
              </div>
              <a
                href="/brand_mockup.jpg"
                download="sarh_luxury_brand_mockup.jpg"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 text-xs transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل الصورة بدقة كاملة</span>
              </a>
            </div>
          </div>

          {/* Color Transformation Specification Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>مواصفات لوحة الألوان المعتمدة (Omani Modern Education Palette)</span>
              </h4>
              <span className="text-xs text-slate-500 font-medium">المرجعية التصميمية الصارمة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Token 1: Deep Royal Navy Blue */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">اللون الأساسي (Primary)</span>
                  <div className="w-5 h-5 rounded-full bg-[#0d1b2a] border border-slate-400/40 shadow-xs"></div>
                </div>
                <div className="font-bold text-slate-900 text-sm">أزرق كحلي ملكي عميق</div>
                <div className="text-[11px] font-mono text-slate-500">Deep Royal Navy Blue</div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 pt-2">
                  <strong>الاستخدام:</strong> النصوص الرئيسية "صَرْح" و"SARH PLATFORM"، والشعارات الفرعية "منصة ذكية وآمنة للمدارس العُمانية" و"بوابتكم للتحول الرقمي"، بالإضافة للإطار المعماري الخارجي لأيقونة الصرح.
                </p>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>يرمز للهيبة والأمان السيبراني الرسمي</span>
                </div>
              </div>

              {/* Token 2: Luxury Emerald Green */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/50 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">اللون الثانوي (Secondary)</span>
                  <div className="w-5 h-5 rounded-full bg-[#055a40] border border-emerald-400/40 shadow-xs"></div>
                </div>
                <div className="font-bold text-emerald-950 text-sm">أخضر زمردي فاخر</div>
                <div className="text-[11px] font-mono text-emerald-700">Luxury Emerald Green</div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-emerald-200/60 pt-2">
                  <strong>الاستخدام:</strong> الوريقات الداخلية لنبتة النمو الصاعدة في قلب الشعار وفوق قاعدة الكتاب المفتوح.
                </p>
                <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>يرمز للعلم والنماء والتوازن المعرفي</span>
                </div>
              </div>

              {/* Token 3: Soft Omani Rose Gold */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-rose-50/40 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900">لون التمييز (Accent)</span>
                  <div className="w-5 h-5 rounded-full bg-[#c58b73] border border-rose-300 shadow-xs"></div>
                </div>
                <div className="font-bold text-rose-950 text-sm">ذهب وردي عُماني ناعم</div>
                <div className="text-[11px] font-mono text-rose-700">Soft Omani Rose Gold</div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-rose-200/60 pt-2">
                  <strong>الاستخدام:</strong> الساق والبرعم المركزي لنبتة النمو الصاعدة (بديلاً للذهب الأصفر التقليدي).
                </p>
                <div className="text-[10px] text-rose-800 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>يرمز للأصالة والتراث العماني المتجدد</span>
                </div>
              </div>

              {/* Token 4: Warm Off-White / Beige */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-amber-50/30 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">السطح الحيادي (Surface)</span>
                  <div className="w-5 h-5 rounded-full bg-[#f8f6f0] border border-amber-300 shadow-xs"></div>
                </div>
                <div className="font-bold text-slate-900 text-sm">أوف وايت / بيج ناعم</div>
                <div className="text-[11px] font-mono text-slate-600">Warm Off-White / Beige</div>
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-amber-200/60 pt-2">
                  <strong>الاستخدام:</strong> سطح بطاقة الهوية الرقمية وملمس البطاقة التقنية النظيفة الخالية من النتوءات القديمة.
                </p>
                <div className="text-[10px] text-amber-900 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>يرمز للحداثة التقنية والنقاء البصري</span>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Elements Kept Intact */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>العناصر الهيكلية والتركيبية المحفوظة بالكامل (Identity Preserved):</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 list-disc list-inside">
              <li>البطاقة المربعة المستوية على اليسار بدقة ماكرو سينمائية مع إضاءة النهار الناعمة.</li>
              <li>الرمز الأيقوني المعماري المدمج بين القوس العماني وقاعدة الكتاب المفتوح.</li>
              <li>الخط العربي الانسيابي لكلمة "صَرْح" مع التشكيل الدقيق والخط الإنجليزي الحديث SARH PLATFORM.</li>
              <li>النصوص والشعارات الفرعية: "منصة ذكية وآمنة للمدارس العُمانية" و"بوابتكم للتحول الرقمي".</li>
              <li>حاسوب اللابتوب النحيف المموّه بالخلفية الذي يعرض واجهة صَرْح الرقمية بنفس الألوان المعتمدة مع هاتف ذكي في الخلفية على مكتب خشب البلوط.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-3xl border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            نظام الهوية البصرية الرقمية المعتمد • مدرسة موسى بن نصير
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-sm"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};
