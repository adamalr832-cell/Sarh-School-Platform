import React, { useState } from 'react';
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  Clock,
  UserX,
  FileCheck2,
  CheckCircle2,
  Phone,
  UserCheck,
  Building2,
  Send,
  HelpCircle,
  FileText,
  Filter,
} from 'lucide-react';
import {
  StudentInfraction,
  StudentRecord,
  InfractionDegree,
  AdministrativeSanction,
  ReferralStatus,
} from '../types';

interface StudentAffairsReviewProps {
  infractions: StudentInfraction[];
  students: StudentRecord[];
  onEnforceAction: (
    infractionId: string,
    action: AdministrativeSanction,
    actionNotes: string,
    reviewerName: string,
    deductPoints?: number
  ) => void;
  onDismissReferral: (infractionId: string, reason: string, reviewerName: string) => void;
}

export const StudentAffairsReview: React.FC<StudentAffairsReviewProps> = ({
  infractions,
  students,
  onEnforceAction,
  onDismissReferral,
}) => {
  const [selectedInfraction, setSelectedInfraction] = useState<StudentInfraction | null>(null);
  const [sanction, setSanction] = useState<AdministrativeSanction>('استدعاء ولي الأمر وتوقيع تعهد');
  const [actionNotes, setActionNotes] = useState('');
  const [deductPoints, setDeductPoints] = useState<number>(5);
  const [filterDegree, setFilterDegree] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewerName, setReviewerName] = useState('أ. رئيس لجنة شؤون الطلاب والأخصائي الاجتماعي');
  const [showDecreeInfo, setShowDecreeInfo] = useState(false);

  // Filter infractions
  const filteredInfractions = infractions.filter((item) => {
    const matchesDegree = filterDegree === 'all' || item.degree === filterDegree;
    const itemStatus = item.status || 'pending_review';
    const matchesStatus = filterStatus === 'all' || itemStatus === filterStatus;
    return matchesDegree && matchesStatus;
  });

  const pendingCount = infractions.filter((i) => (i.status || 'pending_review') === 'pending_review').length;
  const enforcedCount = infractions.filter((i) => i.status === 'action_enforced').length;

  const handleOpenActionModal = (infr: StudentInfraction) => {
    setSelectedInfraction(infr);
    setActionNotes('');
    if (infr.degree?.includes('الأولى')) {
      setSanction('تنبيه شفهي وتوثيق');
      setDeductPoints(2);
    } else if (infr.degree?.includes('الثانية')) {
      setSanction('إنذار كتابي رسمي');
      setDeductPoints(5);
    } else if (infr.degree?.includes('الثالثة')) {
      setSanction('استدعاء ولي الأمر وتوقيع تعهد');
      setDeductPoints(10);
    } else {
      setSanction('إحالة إلى الأخصائي الاجتماعي');
      setDeductPoints(15);
    }
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInfraction) return;
    onEnforceAction(
      selectedInfraction.id,
      sanction,
      actionNotes || 'تم استدعاء الطالب واتخاذ الإجراء التنظيمي المعتمد بالقرار 234/2017 وتدوينه في ملف الانضباط.',
      reviewerName,
      deductPoints
    );
    setSelectedInfraction(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header card with Decree 234/2017 highlight */}
      <div className="bg-gradient-to-l from-slate-900 via-slate-800 to-amber-950 rounded-2xl p-6 text-white border border-amber-500/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold">لجنة شؤون الطلاب ورصد المخالفات السلوكية</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono">
                  القرار الوزاري 234/2017
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 font-mono">
                  سلطنة عُمان
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                إحالة المخالفات السلوكية المرصودة من المعلمين إلى الإدارة المدرسية ولجنة شؤون الطلاب لاعتماد الجزاءات والتدابير التربوية المعتمدة رسمياً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDecreeInfo(!showDecreeInfo)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>دليل درجات المخالفات (234/2017)</span>
            </button>
          </div>
        </div>

        {/* Collapsible Decree Summary */}
        {showDecreeInfo && (
          <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-200 animate-in fade-in">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
              <div className="font-bold text-amber-300 mb-1">الدرجة الأولى (خفيفة)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                التأخر الصباحي، عدم إحضار الكتب، التشويش الخفيف.
                <br />
                <strong>الإجراء:</strong> تنبيه شفهي، تدريب بديل، إشعار ولي الأمر.
              </p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
              <div className="font-bold text-amber-400 mb-1">الدرجة الثانية (متوسطة)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                الغياب المتكرر، إتلاف بسيط للممتلكات، المشاحنات الكلامية.
                <br />
                <strong>الإجراء:</strong> إنذار خطي، تعهد، استدعاء ولي الأمر.
              </p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
              <div className="font-bold text-orange-400 mb-1">الدرجة الثالثة (جسيمة)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                التنمر أو المشاجرات العنيفة، الإضرار المتعمد بالمرافق، الخروج دون إذن.
                <br />
                <strong>الإجراء:</strong> اجتماع لجنة شؤون الطلاب، فصل مؤقت 1-3 أيام.
              </p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700">
              <div className="font-bold text-rose-400 mb-1">الدرجة الرابعة (شديدة الخطورة)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                السلوكيات المنافية أو إدخال مواد ممنوعة أو الاعتداء على الهيئة التدريسية.
                <br />
                <strong>الإجراء:</strong> إحالة للمديرية العامة والجهات المختصة ونقل تأديبي.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">إجمالي الإحالات المرصودة</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{infractions.length} إحالة</div>
          <div className="text-[11px] text-slate-400 mt-0.5">موثقة ومقيدة بالثانية</div>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 shadow-sm">
          <div className="text-xs text-amber-800 font-medium">بانتظار قرار اللجنة</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingCount} حالة</div>
          <div className="text-[11px] text-amber-600 mt-0.5">تتطلب دراسة أو استدعاء</div>
        </div>

        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 shadow-sm">
          <div className="text-xs text-emerald-800 font-medium">إجراءات معتمدة ومنفذة</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{enforcedCount} إجراء</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">منفذة بملف الانضباط</div>
        </div>

        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 shadow-sm">
          <div className="text-xs text-blue-800 font-medium">معدل الانضباط المدرسي</div>
          <div className="text-2xl font-black text-blue-700 mt-1">94.8%</div>
          <div className="text-[11px] text-blue-600 mt-0.5">مؤشر كامبريدج وسلوك الطلاب</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-bold text-slate-700">تصفية الحالات:</span>

          <select
            value={filterDegree}
            onChange={(e) => setFilterDegree(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium"
          >
            <option value="all">كافة الدرجات (القرار 234)</option>
            <option value="الأولى (خفيفة)">الدرجة الأولى (خفيفة)</option>
            <option value="الثانية (متوسطة)">الدرجة الثانية (متوسطة)</option>
            <option value="الثالثة (جسيمة)">الدرجة الثالثة (جسيمة)</option>
            <option value="الرابعة (شديدة الخطورة)">الدرجة الرابعة (شديدة الخطورة)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium"
          >
            <option value="all">كافة الحالات</option>
            <option value="pending_review">قيد المراجعة والدراسة</option>
            <option value="action_enforced">تم اتخاذ الإجراء الرسمي</option>
            <option value="dismissed">محفوظة / مستوفاة بالتعهد</option>
          </select>
        </div>

        <div className="text-slate-500 text-[11px]">
          يتم حفظ التغييرات فوراً في السحابة وسجل الأمان.
        </div>
      </div>

      {/* Referrals List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <h4 className="font-bold text-sm text-slate-900">
              قائمة إحالات الطلاب للجنة شؤون الطلاب ({filteredInfractions.length})
            </h4>
          </div>
        </div>

        {filteredInfractions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            لا توجد أي إحالات سلوكية تطابق خيارات التصفية المختارة.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredInfractions.map((infr) => {
              const student = students.find((s) => s.id === infr.studentId);
              const isPending = !infr.status || infr.status === 'pending_review';
              const isEnforced = infr.status === 'action_enforced';

              return (
                <div
                  key={infr.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs"
                >
                  {/* Left Column: Student & Infraction Details */}
                  <div className="space-y-2 lg:max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{infr.studentName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
                        {infr.gradeClass}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          infr.degree?.includes('الأولى')
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : infr.degree?.includes('الثانية')
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {infr.degree || `درجة: ${infr.severity}`}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isEnforced
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isPending && <Clock className="w-3 h-3 text-amber-600 animate-pulse" />}
                        {isEnforced && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isPending ? 'بانتظار قرار اللجنة' : isEnforced ? 'تم تنفيذ الإجراء' : 'محفوظة'}
                      </span>
                    </div>

                    <div className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                      <span className="font-bold text-amber-900 ml-1">[{infr.category}]:</span>
                      {infr.description}
                      {infr.witnesses && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          الشهود / الحضور: <strong>{infr.witnesses}</strong>
                        </div>
                      )}
                    </div>

                    {/* Parent details if available */}
                    {student?.parentName && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span>ولي الأمر: <strong className="text-slate-700">{student.parentName}</strong></span>
                        {student.parentPhone && (
                          <span className="flex items-center gap-1 text-blue-700 font-mono">
                            <Phone className="w-3 h-3 text-blue-600" />
                            {student.parentPhone}
                          </span>
                        )}
                        {student.civilId && <span>الرقم المدني: <strong className="font-mono">{student.civilId}</strong></span>}
                      </div>
                    )}

                    {/* If action already taken, show details */}
                    {infr.administrativeAction && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-[11px] space-y-0.5">
                        <div className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>الإجراء الإداري المتخذ: {infr.administrativeAction}</span>
                          {infr.deductedPoints && (
                            <span className="mr-2 text-rose-700 font-mono font-bold">
                              (حسم {infr.deductedPoints} نقاط سلوك)
                            </span>
                          )}
                        </div>
                        <p className="text-emerald-800">{infr.actionNotes}</p>
                        <div className="text-[10px] text-emerald-700 pt-1 flex items-center gap-2">
                          <span>المسؤول المعتمد: {infr.reviewedBy}</span>
                          <span>•</span>
                          <span className="font-mono">{infr.reviewedAt}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Metadata & Committee Decision Buttons */}
                  <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                    <div className="text-left font-mono text-[11px] bg-slate-900 text-emerald-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{infr.timestamp}</span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      المعلم الراصد: <strong className="text-slate-800">{infr.recordedBy}</strong>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleOpenActionModal(infr)}
                          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>اتخاذ الإجراء الإداري</span>
                        </button>
                        <button
                          onClick={() =>
                            onDismissReferral(
                              infr.id,
                              'تمت المعالجة الإرشادية داخل الصف دون الحاجة لعقوبة تأديبية',
                              reviewerName
                            )
                          }
                          className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          حفظ بالتعهد
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                        معتمد رسمياً في السجل
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision enforcement modal */}
      {selectedInfraction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  اعتماد إجراء إداري وفق القرار 234/2017
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfraction(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold">الطالب: {selectedInfraction.studentName} ({selectedInfraction.gradeClass})</div>
              <div>المخالفة: {selectedInfraction.description}</div>
              <div className="text-[11px] font-mono text-amber-700">رُصدت بالثانية: {selectedInfraction.timestamp}</div>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الإجراء الإداري المعتمد للجنة شؤون الطلاب:
                </label>
                <select
                  value={sanction}
                  onChange={(e) => setSanction(e.target.value as AdministrativeSanction)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold"
                >
                  <option value="تنبيه شفهي وتوثيق">تنبيه شفهي وتوثيق في ملف الطالب (الدرجة الأولى)</option>
                  <option value="إنذار كتابي رسمي">إنذار كتابي رسمي وإشعار ولي الأمر (الدرجة الثانية)</option>
                  <option value="استدعاء ولي الأمر وتوقيع تعهد">استدعاء ولي الأمر وتوقيع تعهد والتزام (الدرجة الثانية/الثالثة)</option>
                  <option value="إحالة إلى الأخصائي الاجتماعي">إحالة إلى الأخصائي الاجتماعي للدراسة السلوكية</option>
                  <option value="فصل مؤقت مع تكليف بأنشطة بديلة">فصل مؤقت (1-3 أيام) مع تكليف بأنشطة خدمة مجتمعية</option>
                  <option value="خصم نقاط السلوك والانضباط">خصم نقاط من رصيد السلوك والمواظبة</option>
                  <option value="أخرى">تدبير تربوي بديل معتمد</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    خصم نقاط السلوك (اختياري):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={deductPoints}
                    onChange={(e) => setDeductPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    المسؤول أو رئيس اللجنة:
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  مبررات الإجراء والتوصيات التربوية:
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  placeholder="اكتب التوصية أو محضر جلسة لجنة شؤون الطلاب..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInfraction(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد وتثبيت القرار بالثانية</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
