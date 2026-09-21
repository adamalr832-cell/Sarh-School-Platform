import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface SecurityBannerProps {
  authenticatedRole: UserRole | null;
  onOpenAuthModal: (role: UserRole) => void;
  onTestPrompt?: (promptText: string, forceAdminToken?: boolean) => void;
}

export const SecurityBanner: React.FC<SecurityBannerProps> = ({
  authenticatedRole,
  onOpenAuthModal,
}) => {
  return (
    <div className="bg-white border border-[#135D43]/20 rounded-2xl p-4 sm:p-5 shadow-xs mb-6" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B2A4A] text-[#C48B69] flex items-center justify-center shrink-0 shadow-sm border border-[#C48B69]/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1B2A4A]">
                بروتوكول الأمان الصارم ونظام التوثيق المنفصل (Multi-PIN Guardrails)
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#135D43]/15 text-[#135D43] border border-[#135D43]/30">
                مفعل 100%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              توثيق منفصل برمز سرّي خاص لكل فئة: الإدارة (1010)، المعلم (2020)، والطالب (3030)
            </p>
          </div>
        </div>

        {/* Status Badges for 3 Portals */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Admin status pill */}
          <button
            onClick={() => onOpenAuthModal('admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              authenticatedRole === 'admin'
                ? 'bg-[#135D43]/15 text-[#135D43] border-[#135D43]/50 font-bold'
                : 'bg-[#F9F8F6] text-slate-700 border-slate-300 hover:bg-[#135D43]/10'
            }`}
            title="انقر لتوثيق الإدارة"
          >
            <Lock className="w-3.5 h-3.5 text-[#135D43]" />
            <span>
              الإدارة (1010): {authenticatedRole === 'admin' ? '[ADMIN_AUTH_VALIDATED]' : 'قفل'}
            </span>
          </button>

          {/* Teacher status pill */}
          <button
            onClick={() => onOpenAuthModal('teacher')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              authenticatedRole === 'teacher'
                ? 'bg-[#135D43]/15 text-[#135D43] border-[#135D43]/50 font-bold'
                : 'bg-[#F9F8F6] text-slate-700 border-slate-300 hover:bg-[#135D43]/10'
            }`}
            title="انقر لتوثيق المعلم"
          >
            <Lock className="w-3.5 h-3.5 text-[#135D43]" />
            <span>
              المعلم (2020): {authenticatedRole === 'teacher' ? '[TEACHER_AUTH_VALIDATED]' : 'قفل'}
            </span>
          </button>

          {/* Student status pill */}
          <button
            onClick={() => onOpenAuthModal('student')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
              authenticatedRole === 'student'
                ? 'bg-[#135D43]/15 text-[#135D43] border-[#135D43]/50 font-bold'
                : 'bg-[#F9F8F6] text-slate-700 border-slate-300 hover:bg-[#135D43]/10'
            }`}
            title="انقر لتوثيق الطالب"
          >
            <Lock className="w-3.5 h-3.5 text-[#135D43]" />
            <span>
              الطالب (3030): {authenticatedRole === 'student' ? '[STUDENT_AUTH_VALIDATED]' : 'قفل'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
