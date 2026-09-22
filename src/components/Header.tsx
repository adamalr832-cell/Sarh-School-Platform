import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Building2,
  GraduationCap,
  Users,
  Lock,
  KeyRound,
  LogOut,
  CheckCircle2,
  Clock,
  History,
  Database,
  FileJson,
  FileText,
  Cloud,
  Check,
  Vote,
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_CONFIGS } from '../config/authConfig';
import { getPrecisionTimestamp } from '../utils/timestamp';
import { FirebaseUser } from '../lib/firebase';
import { SarhLogo } from './SarhLogo';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  authenticatedRole: UserRole | null;
  onOpenAuthModal: (role?: UserRole) => void;
  onLogout: () => void;
  onOpenAiChat: () => void;
  onOpenAuditLog: () => void;
  onOpenDatabaseExport?: () => void;
  onOpenDatabaseDashboard?: () => void;
  isDatabaseDashboardOpen?: boolean;
  onOpenElections?: () => void;
  isElectionsOpen?: boolean;
  currentUser?: FirebaseUser | null;
  isCloudSyncing?: boolean;
  onTriggerCloudSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  authenticatedRole,
  onOpenAuthModal,
  onLogout,
  onOpenAiChat,
  onOpenAuditLog,
  onOpenDatabaseExport,
  onOpenDatabaseDashboard,
  isDatabaseDashboardOpen = false,
  onOpenElections,
  isElectionsOpen = false,
  currentUser,
  isCloudSyncing = false,
  onTriggerCloudSync,
}) => {
  const currentConfig = ROLE_CONFIGS[currentRole];
  const isCurrentRoleAuthed = authenticatedRole === currentRole;

  // Live Precision Clock running every second
  const [liveTimestamp, setLiveTimestamp] = useState<string>(getPrecisionTimestamp());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimestamp(getPrecisionTimestamp());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[#1B2A4A] text-white border-b border-[#132038] shadow-md sticky top-0 z-30" dir="rtl">
      {/* Top Ministerial Ribbon */}
      <div className="bg-[#132038] px-4 py-1 text-xs text-slate-200 flex items-center justify-between border-b border-[#135D43]/40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#135D43] ring-2 ring-[#C48B69] animate-pulse"></span>
          <span className="font-semibold text-slate-100">سلطنة عُمان - وزارة التعليم</span>
          <span className="text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">مدرسة موسى بن نصير للتعليم ما بعد الأساسي</span>
        </div>

        {/* Live Precision Timestamp & Audit Log Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock with Precision Format */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] bg-[#0d1627] px-2.5 py-0.5 rounded-lg border border-[#135D43]/40 text-[#C48B69]">
            <Clock className="w-3 h-3 text-[#C48B69]" />
            <span>{liveTimestamp}</span>
          </div>

          <button
            id="header-open-audit-log-btn"
            onClick={onOpenAuditLog}
            className="flex items-center gap-1 text-[11px] font-semibold bg-[#135D43]/30 hover:bg-[#135D43]/60 text-slate-100 border border-[#135D43]/70 px-2.5 py-0.5 rounded-lg transition-colors"
            title="سجل التتبع والأمان الموثق بالثانية"
          >
            <History className="w-3 h-3 text-[#C48B69]" />
            <span>سجل الأمان (Audit)</span>
          </button>

          {onOpenDatabaseDashboard && (
            <button
              id="header-open-database-dashboard-btn"
              onClick={onOpenDatabaseDashboard}
              className={`flex items-center gap-1 text-[11px] font-semibold border px-2.5 py-0.5 rounded-lg transition-colors ${
                isDatabaseDashboardOpen
                  ? 'bg-[#C48B69] text-white border-[#C48B69] shadow-sm'
                  : 'bg-[#132038] hover:bg-[#1a2d4f] text-slate-200 border-[#135D43]/50'
              }`}
              title="استعراض وإدارة قاعدة البيانات الشاملة للمدرسة"
            >
              <Database className="w-3 h-3 text-[#C48B69]" />
              <span>لوحة قاعدة البيانات</span>
            </button>
          )}

          {onOpenDatabaseExport && (
            <button
              id="header-open-database-btn"
              onClick={onOpenDatabaseExport}
              className="flex items-center gap-1.5 text-[11px] font-semibold bg-[#135D43]/40 hover:bg-[#135D43]/70 text-emerald-100 border border-[#135D43] px-2.5 py-0.5 rounded-lg transition-colors shadow-sm"
              title="تصدير كشوفات وتقارير PDF وقاعدة البيانات الرسمية"
            >
              <FileText className="w-3 h-3 text-[#C48B69]" />
              <span>تقارير PDF / قاعدة البيانات</span>
            </button>
          )}

          {onOpenElections && (
            <button
              id="header-open-elections-btn"
              onClick={onOpenElections}
              className={`flex items-center gap-1.5 text-[11px] font-semibold border px-2.5 py-0.5 rounded-lg transition-colors shadow-sm ${
                isElectionsOpen
                  ? 'bg-[#C48B69] text-white border-[#C48B69]'
                  : 'bg-[#135D43]/40 hover:bg-[#135D43]/70 text-emerald-100 border-[#135D43]'
              }`}
              title="صفحة تصويت وترشيح مجالس الصفوف للمعلمين"
            >
              <Vote className="w-3 h-3 text-[#C48B69]" />
              <span>انتخابات الصفوف</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </button>
          )}

          {/* Cloud Account & Storage Badge */}
          {currentUser ? (
            <div
              onClick={onTriggerCloudSync}
              className="flex items-center gap-1.5 text-[11px] font-medium bg-[#135D43]/30 hover:bg-[#135D43]/50 cursor-pointer text-emerald-200 px-2.5 py-0.5 rounded-lg border border-[#135D43] transition-colors"
              title="سحابة Google متصلة ومزامنة تلقائياً. اضغط للمزامنة الفورية."
            >
              <Cloud className={`w-3.5 h-3.5 text-[#C48B69] ${isCloudSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline font-mono">{currentUser.email?.split('@')[0]}</span>
              <span className="text-[10px] bg-[#135D43] text-white px-1.5 py-0.2 rounded font-bold">
                {isCloudSyncing ? 'مزامنة...' : 'سحابي'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuthModal(currentRole)}
              className="flex items-center gap-1 text-[11px] font-medium bg-[#132038] hover:bg-[#1b2c4c] text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700 transition-colors"
              title="تسجيل الدخول بحساب Google لربط السحابة"
            >
              <Cloud className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">سحابة Google</span>
            </button>
          )}

          {/* Active Auth Token Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium bg-[#0f1b30] px-2.5 py-0.5 rounded-lg border border-[#135D43]/40">
            {authenticatedRole ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#135D43]" />
                <span className="text-slate-200">
                  موثق: <strong className="font-mono text-[#C48B69]">{ROLE_CONFIGS[authenticatedRole].token}</strong>
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">غير موثق</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & School Identity */}
          <div className="flex items-center justify-between">
            <SarhLogo
              size="md"
              variant="dark"
              showText={true}
              subtext="المساعد المدمج للإدارة المدرسية والهيئة التدريسية والطلاب"
            />

            {/* Mobile Chat button */}
            <div className="md:hidden">
              <button
                id="mobile-sarh-ai-core-btn"
                onClick={onOpenAiChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C48B69] text-white text-xs font-semibold hover:bg-[#b07857] transition-colors shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>نواة صَرْح الذكية</span>
              </button>
            </div>
          </div>

          {/* Role Navigation Switcher & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* 3 Role Portals Buttons */}
            <div className="bg-[#132038] p-1 rounded-xl border border-[#1B2A4A] flex items-center shadow-inner">
              {/* Admin Button */}
              <button
                id="role-btn-admin"
                onClick={() => onRoleChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#C48B69]" />
                <span>الإدارة المدرسية</span>
                {authenticatedRole === 'admin' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Teacher Button */}
              <button
                id="role-btn-teacher"
                onClick={() => onRoleChange('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'teacher'
                    ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-[#C48B69]" />
                <span>الهيئة التدريسية</span>
                {authenticatedRole === 'teacher' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Student Button */}
              <button
                id="role-btn-student"
                onClick={() => onRoleChange('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'student'
                    ? 'bg-[#135D43] text-white shadow-sm border border-[#135D43]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4 text-[#C48B69]" />
                <span>الطلاب</span>
                {authenticatedRole === 'student' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>

            {/* If Current Role is NOT Authenticated, show Login / Enter PIN button */}
            {!isCurrentRoleAuthed ? (
              <button
                id="header-role-login-btn"
                onClick={() => onOpenAuthModal(currentRole)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C48B69]/20 text-[#C48B69] border border-[#C48B69]/50 text-xs font-semibold hover:bg-[#C48B69]/30 transition-colors"
                title={`توثيق ${currentConfig.title} بالرمز السري`}
              >
                <KeyRound className="w-3.5 h-3.5 text-[#C48B69]" />
                <span>توثيق {currentRole === 'admin' ? 'الإدارة' : currentRole === 'teacher' ? 'المعلم' : 'الطالب'}</span>
              </button>
            ) : (
              /* If Authenticated, show Logout / Lock Button */
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                title="تسجيل الخروج وقفل البوابة"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>تسجيل الخروج</span>
              </button>
            )}

            {/* Desktop Sarh AI Core Button - Soft Omani Rose Gold Primary CTA */}
            <button
              id="desktop-sarh-ai-core-btn"
              onClick={onOpenAiChat}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C48B69] hover:bg-[#b07857] text-white text-xs font-bold transition-all shadow-md shadow-[#C48B69]/30"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>نواة صَرْح الذكية</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
