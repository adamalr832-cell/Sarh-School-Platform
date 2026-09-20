import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Building2,
  GraduationCap,
  Users,
  Lock,
  Cloud,
  Check,
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_CONFIGS, AUTH_ERROR_MESSAGE } from '../config/authConfig';
import { loginWithGoogle, FirebaseUser } from '../lib/firebase';

interface RoleAuthModalProps {
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
  onVerify: (role: UserRole, pin: string) => boolean | Promise<boolean>;
  currentUser?: FirebaseUser | null;
  onGoogleSignInSuccess?: (user: FirebaseUser) => void;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  role,
  onClose,
  onVerify,
  currentUser,
  onGoogleSignInSuccess,
}) => {
  const config = ROLE_CONFIGS[role];
  const [pin, setPin] = useState(config?.defaultPin || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Update default PIN suggestion whenever role changes
  useEffect(() => {
    if (config) {
      setPin(config.defaultPin);
      setErrorMsg('');
    }
  }, [role, config]);

  if (!isOpen || !config) return null;

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleSigningIn(true);
      setErrorMsg('');
      const user = await loginWithGoogle();
      if (onGoogleSignInSuccess) {
        onGoogleSignInSuccess(user);
      }
      // Also auto-verify current role
      await onVerify(role, config.defaultPin);
      onClose();
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      setErrorMsg(err.message || 'تعذر تسجيل الدخول بحساب Google.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);
    try {
      const success = await onVerify(role, pin);
      if (success) {
        onClose();
      } else {
        setErrorMsg(AUTH_ERROR_MESSAGE);
      }
    } catch {
      setErrorMsg(AUTH_ERROR_MESSAGE);
    } finally {
      setIsVerifying(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Building2 className="w-5 h-5 text-emerald-700" />;
      case 'teacher':
        return <GraduationCap className="w-5 h-5 text-teal-700" />;
      case 'student':
        return <Users className="w-5 h-5 text-blue-700" />;
    }
  };

  const getRoleBadgeClasses = () => {
    switch (role) {
      case 'admin':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'teacher':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'student':
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div
      id="role-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in"
      dir="rtl"
    >
      <div
        id="role-auth-modal-dialog"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 relative"
      >
        <button
          id="role-auth-modal-close-btn"
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
            {getRoleIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">{config.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeClasses()}`}>
                {config.badgeText}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              لتفعيل الرمز التوثيقي: <span className="font-mono font-bold text-emerald-700">{config.token}</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {config.subtitle}. يُرجى إدخال الرمز السرّي المعتمد للبوابة للتحقق وفتح الصلاحيات وإرفاق علامة التوثيق التلقائية مع استعلامات الذكاء الاصطناعي.
        </p>

        {/* Google Cloud Account Connection Option */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">الربط السحابي (Google / Firebase):</span>
            </div>
            {currentUser && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                متصل
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <div>الحساب السحابي المتصل: <strong className="text-slate-900 font-mono">{currentUser.email}</strong></div>
              <div className="text-[10px] text-emerald-700 font-medium">بياناتك (السجلات، الغياب، المخالفات) محفوظة سحابياً في مخزنك المعزول.</div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-slate-500 mb-2">
                سجل الدخول بحساب Google الرسمي لعزل وتخزين بياناتك المدرسية ومزامنتها على السحابة تلقائياً.
              </p>
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleLogin}
                disabled={isGoogleSigningIn}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleSigningIn ? 'جارِ فتح نافذة تسجيل Google...' : 'تسجيل الدخول ومزامنة السحابة بحساب Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div
            id="role-auth-error-box"
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in shake"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
              <span>الرمز السرّي للبوابة (PIN Code)</span>
              <span className="text-[11px] text-slate-400 font-normal">
                الافتراضي: <span className="font-mono font-bold text-slate-700">{config.defaultPin}</span>
              </span>
            </label>
            <div className="relative">
              <input
                id="role-pin-input"
                type="password"
                inputMode="numeric"
                required
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={config.defaultPin}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-center text-lg font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Preset reference tip */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>الرموز السرّية الافتراضية لمنصة صَرْح:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-xs mt-1">
              <div
                onClick={() => role === 'admin' && setPin('1010')}
                className={`p-1.5 rounded border cursor-pointer ${
                  role === 'admin'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-sans text-[10px] text-slate-500">الإدارة</div>
                <div>1010</div>
              </div>
              <div
                onClick={() => role === 'teacher' && setPin('2020')}
                className={`p-1.5 rounded border cursor-pointer ${
                  role === 'teacher'
                    ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-sans text-[10px] text-slate-500">المعلم</div>
                <div>2020</div>
              </div>
              <div
                onClick={() => role === 'student' && setPin('3030')}
                className={`p-1.5 rounded border cursor-pointer ${
                  role === 'student'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="font-sans text-[10px] text-slate-500">الطالب</div>
                <div>3030</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              id="role-auth-submit-btn"
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'جارِ التحقق...' : 'تأكيد الرمز وفتح البوابة'}</span>
            </button>
            <button
              id="role-auth-cancel-btn"
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
