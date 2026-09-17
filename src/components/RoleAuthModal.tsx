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
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_CONFIGS, AUTH_ERROR_MESSAGE } from '../config/authConfig';

interface RoleAuthModalProps {
  isOpen: boolean;
  role: UserRole;
  onClose: () => void;
  onVerify: (role: UserRole, pin: string) => boolean | Promise<boolean>;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  role,
  onClose,
  onVerify,
}) => {
  const config = ROLE_CONFIGS[role];
  const [pin, setPin] = useState(config?.defaultPin || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Update default PIN suggestion whenever role changes
  useEffect(() => {
    if (config) {
      setPin(config.defaultPin);
      setErrorMsg('');
    }
  }, [role, config]);

  if (!isOpen || !config) return null;

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
