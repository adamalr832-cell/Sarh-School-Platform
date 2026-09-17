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
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_CONFIGS } from '../config/authConfig';
import { getPrecisionTimestamp } from '../utils/timestamp';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  authenticatedRole: UserRole | null;
  onOpenAuthModal: (role?: UserRole) => void;
  onLogout: () => void;
  onOpenAiChat: () => void;
  onOpenAuditLog: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  authenticatedRole,
  onOpenAuthModal,
  onLogout,
  onOpenAiChat,
  onOpenAuditLog,
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
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30" dir="rtl">
      {/* Top Ministerial Ribbon */}
      <div className="bg-gradient-to-r from-emerald-800 via-slate-900 to-emerald-900 px-4 py-1 text-xs text-emerald-100 flex items-center justify-between border-b border-emerald-700/40">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>سلطنة عُمان - وزارة التعليم</span>
          <span className="text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">مدرسة موسى بن نصير للتعليم ما بعد الأساسي</span>
        </div>

        {/* Live Precision Timestamp & Audit Log Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock with Precision Format */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-slate-700 text-emerald-300">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{liveTimestamp}</span>
          </div>

          <button
            id="header-open-audit-log-btn"
            onClick={onOpenAuditLog}
            className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 px-2.5 py-0.5 rounded-lg transition-colors"
            title="سجل التتبع والأمان الموثق بالثانية"
          >
            <History className="w-3 h-3 text-emerald-400" />
            <span>سجل الأمان (Audit)</span>
          </button>

          {/* Active Auth Token Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium bg-slate-800/90 px-2.5 py-0.5 rounded-lg border border-slate-700">
            {authenticatedRole ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">
                  موثق: <strong className="font-mono">{ROLE_CONFIGS[authenticatedRole].token}</strong>
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
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-inner border border-emerald-400/30 text-white font-bold text-xl tracking-tight">
                صَ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    منصة صَرْح
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      عُمان الذكية
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  المساعد المدمج للإدارة المدرسية والهيئة التدريسية والطلاب
                </p>
              </div>
            </div>

            {/* Mobile Chat button */}
            <div className="md:hidden">
              <button
                id="mobile-sarh-ai-core-btn"
                onClick={onOpenAiChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>نواة صَرْح الذكية</span>
              </button>
            </div>
          </div>

          {/* Role Navigation Switcher & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* 3 Role Portals Buttons */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700/80 flex items-center shadow-inner">
              {/* Admin Button */}
              <button
                id="role-btn-admin"
                onClick={() => onRoleChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
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
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>الهيئة التدريسية</span>
                {authenticatedRole === 'teacher' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-200" />
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
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>الطلاب</span>
                {authenticatedRole === 'student' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
                title={`توثيق ${currentConfig.title} بالرمز السري`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
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

            {/* Desktop Sarh AI Core Button */}
            <button
              id="desktop-sarh-ai-core-btn"
              onClick={onOpenAiChat}
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md hover:shadow-emerald-900/40"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>نواة صَرْح الذكية</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
