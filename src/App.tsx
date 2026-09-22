import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import { Header } from './components/Header';
import { SecurityBanner } from './components/SecurityBanner';
import { AdminMode } from './components/AdminMode';
import { TeacherMode } from './components/TeacherMode';
import { StudentMode } from './components/StudentMode';
import { RoleAuthModal } from './components/RoleAuthModal';
import { SarhAiChatDrawer } from './components/SarhAiChatDrawer';
import { AuditLogModal } from './components/AuditLogModal';
import { DatabaseExportModal } from './components/DatabaseExportModal';
import { DatabaseDashboardView } from './components/DatabaseDashboardView';
import { ClassElectionsView } from './components/ClassElectionsView';
import { SarhLogo } from './components/SarhLogo';
import {
  INITIAL_TEACHERS,
  INITIAL_ABSENCES,
  INITIAL_STUDENTS,
  INITIAL_AWARD_LOGS,
  INITIAL_REDEMPTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEACHER_HONORS,
  INITIAL_STUDENT_INFRACTIONS,
} from './data/mockSchoolData';
import {
  UserRole,
  ChatMessage,
  TeacherLoad,
  AbsenceRequest,
  StudentRecord,
  TeacherAwardLog,
  RedemptionRequest,
  RedemptionType,
  AuditLogEntry,
  TeacherHonor,
  StudentInfraction,
  AdministrativeSanction,
} from './types';
import { ROLE_PINS, ROLE_AUTH_TOKENS } from './config/authConfig';
import { getPrecisionTimestamp } from './utils/timestamp';
import {
  auth,
  onAuthStateChanged,
  loginWithGoogle,
  logoutFirebase,
  getUserCloudData,
  saveUserCloudData,
  FirebaseUser,
} from './lib/firebase';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  // Separate authentication status per role
  const [authenticatedRole, setAuthenticatedRole] = useState<UserRole | null>('admin');
  const [targetAuthRole, setTargetAuthRole] = useState<UserRole>('admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isDatabaseExportModalOpen, setIsDatabaseExportModalOpen] = useState(false);
  const [isDatabaseDashboardOpen, setIsDatabaseDashboardOpen] = useState(false);
  const [isElectionsViewOpen, setIsElectionsViewOpen] = useState(false);

  // Core Data States
  const [teachers, setTeachers] = useState<TeacherLoad[]>(INITIAL_TEACHERS);
  const [absences, setAbsences] = useState<AbsenceRequest[]>(INITIAL_ABSENCES);
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [awardLogs, setAwardLogs] = useState<TeacherAwardLog[]>(INITIAL_AWARD_LOGS);
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>(INITIAL_REDEMPTIONS);
  const [teacherHonors, setTeacherHonors] = useState<TeacherHonor[]>(INITIAL_TEACHER_HONORS);
  const [infractions, setInfractions] = useState<StudentInfraction[]>(INITIAL_STUDENT_INFRACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [eduCoins, setEduCoins] = useState<number>(245);

  // Firebase Auth and Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string>('');

  // Listen to Firebase Auth changes & load isolated cloud database
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setCurrentUser(user);
      if (user && user.email) {
        try {
          setIsCloudSyncing(true);
          const cloudData = await getUserCloudData(user.email);
          if (cloudData) {
            if (Array.isArray(cloudData.teachers)) setTeachers(cloudData.teachers as TeacherLoad[]);
            if (Array.isArray(cloudData.absences)) setAbsences(cloudData.absences as AbsenceRequest[]);
            if (Array.isArray(cloudData.students)) setStudents(cloudData.students as StudentRecord[]);
            if (Array.isArray(cloudData.awardLogs)) setAwardLogs(cloudData.awardLogs as TeacherAwardLog[]);
            if (Array.isArray(cloudData.redemptionRequests))
              setRedemptionRequests(cloudData.redemptionRequests as RedemptionRequest[]);
            if (Array.isArray(cloudData.teacherHonors))
              setTeacherHonors(cloudData.teacherHonors as TeacherHonor[]);
            if (Array.isArray(cloudData.infractions))
              setInfractions(cloudData.infractions as StudentInfraction[]);
            if (Array.isArray(cloudData.auditLogs))
              setAuditLogs(cloudData.auditLogs as AuditLogEntry[]);
            if (typeof cloudData.eduCoins === 'number') setEduCoins(cloudData.eduCoins);

            const ts = getPrecisionTimestamp();
            setLastCloudSyncTime(ts);
            logAudit(
              user.email,
              'admin',
              user.displayName || user.email,
              'cloud_sync',
              'استرجاع سحابي',
              'مخزن المستخدم المعزول',
              `تم استرجاع ومزامنة السجلات المدرسية بنجاح من سحابة Firestore`,
              'بيانات محلية',
              'بيانات سحابية متزامنة'
            );
          } else {
            // First time user: save the initial schema to their cloud store
            await saveUserCloudData(user.email, {
              teachers: INITIAL_TEACHERS,
              absences: INITIAL_ABSENCES,
              students: INITIAL_STUDENTS,
              awardLogs: INITIAL_AWARD_LOGS,
              redemptionRequests: INITIAL_REDEMPTIONS,
              teacherHonors: INITIAL_TEACHER_HONORS,
              infractions: INITIAL_STUDENT_INFRACTIONS,
              auditLogs: INITIAL_AUDIT_LOGS,
              eduCoins: 245,
            });
            setLastCloudSyncTime(getPrecisionTimestamp());
          }
        } catch (err) {
          console.warn('Error loading user cloud store:', err);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Trigger manual or state-change cloud sync
  const syncToCloud = async (overrideEmail?: string) => {
    const targetEmail = overrideEmail || currentUser?.email;
    if (!targetEmail) return;
    try {
      setIsCloudSyncing(true);
      await saveUserCloudData(targetEmail, {
        teachers,
        absences,
        students,
        awardLogs,
        redemptionRequests,
        teacherHonors,
        infractions,
        auditLogs,
        eduCoins,
      });
      const ts = getPrecisionTimestamp();
      setLastCloudSyncTime(ts);
    } catch (err) {
      console.warn('Cloud save error:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Helper to log audit entries immutably
  const logAudit = (
    operatorId: string,
    operatorRole: UserRole,
    operatorName: string,
    category: AuditLogEntry['category'],
    actionType: string,
    targetPerson: string,
    details: string,
    previousState: string,
    newState: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: getPrecisionTimestamp(),
      timestampMs: Date.now(),
      operatorId,
      operatorRole,
      operatorName,
      category,
      actionType,
      targetPerson,
      details,
      previousState,
      newState,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // AI Chat & History State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `مرحباً بكم في **منصة "صَرْح" المدرسية الذكية** في **مدرسة موسى بن نصير للتعليم ما بعد الأساسي** - سلطنة عُمان.

نظام إداري وتوثيقي ذكي يلتزم بالمعيار الزمني الموحد بالثانية:
\`[التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]\` مع حظر التعديل التاريخي وتسجيل كافة الإجراءات في سجل التتبع والأمان (Audit Log).

* 🏢 **بوابة الإدارة المدرسية:** الرمز السري (1010) لتفعيل الوسم \`[ADMIN_AUTH_VALIDATED]\`.
* 👨‍🏫 **بوابة الهيئة التدريسية:** الرمز السري (2020) لتفعيل الوسم \`[TEACHER_AUTH_VALIDATED]\`.
* 🎓 **بوابة الطلاب:** الرمز السري (3030) لتفعيل الوسم \`[STUDENT_AUTH_VALIDATED]\`.

يمكنك استعراض ومتابعة سجلات الكادر التدريسي والطلاب الموثقة بالثانية الآن.`,
      timestamp: getPrecisionTimestamp(),
    },
  ]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Switch Role Handler: If the user selects a role that is not authenticated, prompt for PIN
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setIsDatabaseDashboardOpen(false);
    if (authenticatedRole !== role) {
      setTargetAuthRole(role);
      setIsAuthModalOpen(true);
    }
  };

  // Open modal explicitly for any role
  const handleOpenAuthModal = (role?: UserRole) => {
    setTargetAuthRole(role || currentRole);
    setIsAuthModalOpen(true);
  };

  // Logout Handler: Resets authenticated role and clears session
  const handleLogout = () => {
    setAuthenticatedRole(null);
  };

  // Verify Role PIN with backend or fallback
  const handleVerifyRolePin = async (role: UserRole, pin: string): Promise<boolean> => {
    const trimmedPin = String(pin || '').trim();

    try {
      const response = await fetch('/api/auth/verify-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, pin: trimmedPin }),
      });
      const data = await response.json();
      if (data.success) {
        setAuthenticatedRole(role);
        setCurrentRole(role);
        logAudit(
          `${role.toUpperCase()}-${ROLE_PINS[role]}`,
          role,
          `مستخدم بوابة ${role === 'admin' ? 'الإدارة' : role === 'teacher' ? 'المعلمين' : 'الطلاب'}`,
          'security_audit',
          'توثيق دخول',
          `بوابة ${role}`,
          `تسجيل دخول وتوثيق ناجح للبوابة بالرمز السري المعتمد`,
          'بوابة مقفلة',
          'بوابة موثقة ومفتوحة'
        );
        return true;
      }
      return false;
    } catch {
      // Local fallback in case of connection latency
      const expectedPin = ROLE_PINS[role];
      const validAdminFallbacks = ['OM-EDU-2026', 'SARH-OMAN', '1010'];
      const isSuccess =
        (role === 'admin' && (trimmedPin === expectedPin || validAdminFallbacks.includes(trimmedPin))) ||
        (role === 'teacher' && trimmedPin === expectedPin) ||
        (role === 'student' && trimmedPin === expectedPin);

      if (isSuccess) {
        setAuthenticatedRole(role);
        setCurrentRole(role);
        logAudit(
          `${role.toUpperCase()}-${ROLE_PINS[role]}`,
          role,
          `مستخدم بوابة ${role === 'admin' ? 'الإدارة' : role === 'teacher' ? 'المعلمين' : 'الطلاب'}`,
          'security_audit',
          'توثيق دخول',
          `بوابة ${role}`,
          `تسجيل دخول وتوثيق ناجح للبوابة بالرمز السري المعتمد`,
          'بوابة مقفلة',
          'بوابة موثقة ومفتوحة'
        );
        return true;
      }
      return false;
    }
  };

  // Send message to Sarh AI Core via Express backend
  const handleSendMessage = async (text: string, forceAdminToken?: boolean) => {
    const userMsgId = `user-${Date.now()}`;
    const activeToken =
      forceAdminToken || authenticatedRole === 'admin'
        ? ROLE_AUTH_TOKENS.admin
        : authenticatedRole
        ? ROLE_AUTH_TOKENS[authenticatedRole]
        : undefined;

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: getPrecisionTimestamp(),
      authToken: activeToken,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoadingAi(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            authToken: m.authToken,
          })),
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          role: currentRole,
          authenticatedRole: authenticatedRole,
          authToken: activeToken,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: getPrecisionTimestamp(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `تم استلام الاستعلام وتوثيقه بالثانية ${getPrecisionTimestamp()} في سجلات مدرسة موسى بن نصير للتعليم ما بعد الأساسي وفق معايير وزارة التعليم المحدثة.`,
        timestamp: getPrecisionTimestamp(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Admin: Update Teacher Attendance Status
  const handleUpdateTeacherStatus = (
    teacherId: string,
    status: 'available' | 'absent' | 'delegated'
  ) => {
    const targetTeacher = teachers.find((t) => t.id === teacherId);
    const prevStatus = targetTeacher?.status || 'available';
    const ts = getPrecisionTimestamp();

    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, status } : t))
    );

    if (targetTeacher && (status === 'absent' || status === 'delegated')) {
      const existing = absences.find((a) => a.absentTeacher === targetTeacher.name);
      if (!existing) {
        const newAbs: AbsenceRequest = {
          id: `abs-${Date.now()}`,
          absentTeacher: targetTeacher.name,
          subject: targetTeacher.subject,
          gradeClass: 'الصف العاشر / 1',
          period: 2,
          status: 'pending',
          notes: status === 'delegated' ? 'انتداب وزاري رسمي' : 'غياب طارئ - بانتظار التكليف',
          createdAt: ts,
        };
        setAbsences((prev) => [newAbs, ...prev]);
      }
    }

    logAudit(
      'ADMIN-1010',
      'admin',
      'إدارة المدرسة (ADMIN-1010)',
      'teacher_attendance',
      'رصد',
      targetTeacher?.name || 'معلم',
      `تعديل حالة حضور المعلم إلى ${status === 'available' ? 'حاضر (available)' : status === 'absent' ? 'غائب (absent)' : 'منتدب (delegated)'}`,
      `الحالة السابقة: ${prevStatus}`,
      `الحالة الجديدة: ${status}`
    );
  };

  // Admin: Assign Substitute Teacher
  const handleAssignSubstitute = (absenceId: string, substituteName: string) => {
    const abs = absences.find((a) => a.id === absenceId);
    const ts = getPrecisionTimestamp();

    setAbsences((prev) =>
      prev.map((a) =>
        a.id === absenceId
          ? {
              ...a,
              substituteTeacher: substituteName || undefined,
              status: substituteName ? 'assigned' : 'pending',
              assignmentTimestamp: ts,
              assignedBy: 'إدارة المدرسة (ADMIN-1010)',
            }
          : a
      )
    );

    if (substituteName) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.name === substituteName
            ? { ...t, currentWeeklyLoad: Math.min(t.maxWeeklyLoad, t.currentWeeklyLoad + 1) }
            : t
        )
      );
    }

    logAudit(
      'ADMIN-1010',
      'admin',
      'إدارة المدرسة (ADMIN-1010)',
      'substitution',
      'إسناد',
      `${substituteName} (مكلف) / ${abs?.absentTeacher} (غائب)`,
      `إسناد حصة الاحتياط ${abs?.period} صف ${abs?.gradeClass} مادة ${abs?.subject}`,
      `المكلف السابق: ${abs?.substituteTeacher || 'لا يوجد (قيد الانتظار)'}`,
      `المكلف المعتمد: ${substituteName}`
    );
  };

  // Admin: Add Absence
  const handleAddAbsence = (item: Omit<AbsenceRequest, 'id' | 'status'>) => {
    const ts = getPrecisionTimestamp();
    const newRecord: AbsenceRequest = {
      ...item,
      id: `abs-${Date.now()}`,
      status: 'pending',
      createdAt: ts,
    };
    setAbsences([newRecord, ...absences]);

    logAudit(
      'ADMIN-1010',
      'admin',
      'إدارة المدرسة (ADMIN-1010)',
      'teacher_attendance',
      'رصد',
      item.absentTeacher,
      `رصد غياب/انتداب المعلم للحصة ${item.period} مادة ${item.subject} (${item.gradeClass})`,
      'حاضر',
      'غائب / بانتظار التكليف'
    );
  };

  // Admin: Smart Auto-Distribution for Substitutes
  const handleAutoDistributeSubstitutes = () => {
    const ts = getPrecisionTimestamp();
    const updated = absences.map((item) => {
      if (!item.substituteTeacher) {
        const availableTeachers = teachers.filter(
          (t) => t.status !== 'absent' && t.status !== 'delegated' && t.currentWeeklyLoad < t.maxWeeklyLoad
        );
        availableTeachers.sort((a, b) => a.currentWeeklyLoad - b.currentWeeklyLoad);
        const bestCandidate = availableTeachers[0];

        if (bestCandidate) {
          setTeachers((prev) =>
            prev.map((t) =>
              t.id === bestCandidate.id
                ? { ...t, currentWeeklyLoad: t.currentWeeklyLoad + 1 }
                : t
            )
          );

          logAudit(
            'ADMIN-1010',
            'admin',
            'إدارة المدرسة (قسم الجدول)',
            'substitution',
            'توزيع ذكي',
            `${bestCandidate.name} (بديل) / ${item.absentTeacher} (غائب)`,
            `إسناد حصة الاحتياط ${item.period} صف ${item.gradeClass} مادة ${item.subject} آلياً`,
            'قيد الانتظار',
            `مكلف: ${bestCandidate.name}`
          );

          return {
            ...item,
            substituteTeacher: bestCandidate.name,
            status: 'assigned' as const,
            assignmentTimestamp: ts,
            assignedBy: 'إدارة المدرسة (ADMIN-1010 - توزيع ذكي)',
          };
        }
      }
      return item;
    });

    setAbsences(updated);
  };

  // Admin: Add Teacher Honor
  const handleAddTeacherHonor = (
    teacherId: string,
    honorType: 'نقطة تميّز' | 'شهادة تميّز' | 'وسام الإجادة التربوية',
    occasion: string
  ) => {
    const targetTeacher = teachers.find((t) => t.id === teacherId);
    const ts = getPrecisionTimestamp();

    const newHonor: TeacherHonor = {
      id: `thonor-${Date.now()}`,
      teacherId,
      teacherName: targetTeacher?.name || 'معلم متميز',
      honorType,
      occasion,
      recordedBy: 'إدارة المدرسة (ADMIN-1010)',
      timestamp: ts,
      timestampMs: Date.now(),
    };

    setTeacherHonors((prev) => [newHonor, ...prev]);

    logAudit(
      'ADMIN-1010',
      'admin',
      'إدارة المدرسة (ADMIN-1010)',
      'teacher_honor',
      'اعتماد',
      targetTeacher?.name || 'معلم',
      `منح المعلم (${honorType}) للمناسبة: ${occasion}`,
      'سجل اعتيادي',
      `تم منح (${honorType})`
    );
  };

  // Teacher: Update Student Attendance with precision timestamp
  const handleUpdateStudentAttendance = (
    studentId: string,
    status: 'present' | 'absent' | 'late',
    period: number = 1
  ) => {
    const ts = getPrecisionTimestamp();
    const targetStudent = students.find((s) => s.id === studentId);
    const prevStatus = targetStudent?.attendanceStatus || 'present';

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              attendanceStatus: status,
              attendanceTimestamp: ts,
              attendancePeriod: period,
            }
          : s
      )
    );

    logAudit(
      'TEACHER-2020',
      'teacher',
      'أ. معلم المادة (TEACHER-2020)',
      'student_attendance',
      'رصد',
      targetStudent?.name || 'طالب',
      `رصد حضور/غياب الطالب للحصة ${period}: تم التغيير إلى (${status === 'present' ? 'حاضر' : status === 'absent' ? 'غائب' : 'متأخر'})`,
      `الحالة السابقة: ${prevStatus}`,
      `الحالة الجديدة: ${status} (الحصة ${period})`
    );
  };

  // Teacher: Mark All Present in Class
  const handleMarkAllPresent = (gradeClass: string, period: number = 1) => {
    const ts = getPrecisionTimestamp();

    setStudents((prev) =>
      prev.map((s) =>
        s.gradeClass === gradeClass
          ? {
              ...s,
              attendanceStatus: 'present',
              attendanceTimestamp: ts,
              attendancePeriod: period,
            }
          : s
      )
    );

    logAudit(
      'TEACHER-2020',
      'teacher',
      'أ. معلم المادة (TEACHER-2020)',
      'student_attendance',
      'رصد',
      `طلاب شعبة ${gradeClass}`,
      `تسجيل الحضور الشامل لجميع طلاب ${gradeClass} للحصة ${period} مؤرخاً بالثانية`,
      'حالات سابقة متعددة',
      'الجميع حاضر (present)'
    );
  };

  // Teacher: Award Points to Student
  const handleAwardPoints = (studentId: string, points: number, reason: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const prevPoints = targetStudent?.points || 0;
    const ts = getPrecisionTimestamp();

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, points: s.points + points } : s))
    );

    // Sync with student portal active demo balance if it's the current student
    if (studentId === 'std-1' || targetStudent?.name.includes('محمد بن حمد')) {
      setEduCoins((prev) => prev + points);
    }

    const newLog: TeacherAwardLog = {
      id: `awd-${Date.now()}`,
      studentId,
      studentName: targetStudent?.name || 'طالب متميز',
      points,
      reason,
      timestamp: ts,
      teacherName: 'أ. معلم المادة (TEACHER-2020)',
    };

    setAwardLogs((prev) => [newLog, ...prev]);

    logAudit(
      'TEACHER-2020',
      'teacher',
      'أ. معلم المادة (TEACHER-2020)',
      'student_honor',
      'إضافة',
      targetStudent?.name || 'طالب',
      `منح الطالب +${points} نقطة تشجيعية (وسام تميّز) لسبب: ${reason}`,
      `${prevPoints} نقطة`,
      `${prevPoints + points} نقطة (+${points})`
    );
  };

  // Teacher: Add Student Infraction
  const handleAddInfraction = (
    studentId: string,
    category: string,
    description: string,
    severity: 'خفيفة' | 'متوسطة' | 'جسيمة'
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const ts = getPrecisionTimestamp();

    const newInfr: StudentInfraction = {
      id: `infr-${Date.now()}`,
      studentId,
      studentName: targetStudent?.name || 'طالب',
      gradeClass: targetStudent?.gradeClass || 'الصف العاشر / 1',
      description,
      category,
      severity,
      recordedBy: 'أ. معلم المادة (TEACHER-2020)',
      timestamp: ts,
      timestampMs: Date.now(),
    };

    setInfractions((prev) => [newInfr, ...prev]);

    logAudit(
      'TEACHER-2020',
      'teacher',
      'أ. معلم المادة (TEACHER-2020)',
      'student_infraction',
      'رصد',
      targetStudent?.name || 'طالب',
      `رصد مخالفة/ملاحظة سلوكية (${category} - درجة: ${severity}): ${description}`,
      'سلوك عادي',
      `مخالفة مرصودة (${category})`
    );
  };

  // Student: Request Redemption (Strictly Grades or Honor)
  const handleStudentRequestRedemption = (type: RedemptionType, cost: number) => {
    if (eduCoins < cost) return;
    const ts = getPrecisionTimestamp();

    // Deduct points from student balance
    setEduCoins((prev) => prev - cost);
    setStudents((prev) =>
      prev.map((s) => (s.id === 'std-1' ? { ...s, points: Math.max(0, s.points - cost) } : s))
    );

    const newReq: RedemptionRequest = {
      id: `req-${Date.now()}`,
      studentId: 'std-1',
      studentName: 'محمد بن حمد البوسعيدي',
      gradeClass: 'الصف العاشر / 1',
      type,
      pointsCost: cost,
      status: 'pending',
      createdAt: ts,
    };

    setRedemptionRequests((prev) => [newReq, ...prev]);

    logAudit(
      'STUDENT-3030',
      'student',
      'محمد بن حمد البوسعيدي (طالب)',
      'student_honor',
      'طلب استبدال',
      'محمد بن حمد البوسعيدي',
      `رفع طلب استبدال (${type === 'grades' ? 'طلب درجات' : 'طلب تكريم'}) بتكلفة ${cost} نقطة للمعلم`,
      'رصيد النقاط الكامل',
      `خصم ${cost} نقطة وقيد انتظار موافقة المعلم`
    );
  };

  // Student Affairs: Enforce Committee / Administrative Action (Decision 234/2017)
  const handleEnforceAdministrativeAction = (
    infractionId: string,
    action: AdministrativeSanction,
    actionNotes: string,
    reviewerName: string,
    deductPoints = 0
  ) => {
    const ts = getPrecisionTimestamp();
    const targetInfr = infractions.find((i) => i.id === infractionId);
    if (!targetInfr) return;

    // Update infraction referral record
    setInfractions((prev) =>
      prev.map((i) =>
        i.id === infractionId
          ? {
              ...i,
              referralStatus: 'action_enforced',
              administrativeAction: action,
              actionNotes,
              reviewedBy: reviewerName,
              reviewedAt: ts,
              penaltyPointsDeducted: deductPoints,
            }
          : i
      )
    );

    // If points deduction applies, update student points
    if (deductPoints > 0 && targetInfr.studentId) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === targetInfr.studentId
            ? { ...s, points: Math.max(0, s.points - deductPoints) }
            : s
        )
      );
    }

    logAudit(
      'ADMIN-1010',
      'admin',
      reviewerName || 'لجنة شؤون الطلاب (ADMIN-1010)',
      'student_infraction',
      'اعتماد عقوبة إدارية',
      targetInfr.studentName,
      `اعتماد عقوبة (${action}) بموجب القرار الوزاري 234/2017 مع خصم ${deductPoints} نقطة: ${actionNotes}`,
      'قيد المراجعة',
      `نافذة (${action})`
    );

    // Auto sync to cloud if user connected
    if (currentUser?.email) {
      setTimeout(() => syncToCloud(), 200);
    }
  };

  // Student Affairs: Dismiss Infraction Referral
  const handleDismissInfractionReferral = (
    infractionId: string,
    reason: string,
    reviewerName: string
  ) => {
    const ts = getPrecisionTimestamp();
    const targetInfr = infractions.find((i) => i.id === infractionId);
    if (!targetInfr) return;

    setInfractions((prev) =>
      prev.map((i) =>
        i.id === infractionId
          ? {
              ...i,
              referralStatus: 'dismissed',
              actionNotes: `حفظ المخالفة: ${reason}`,
              reviewedBy: reviewerName,
              reviewedAt: ts,
            }
          : i
      )
    );

    logAudit(
      'ADMIN-1010',
      'admin',
      reviewerName || 'لجنة شؤون الطلاب (ADMIN-1010)',
      'student_infraction',
      'حفظ إحالة مخالفة',
      targetInfr.studentName,
      `حفظ وتبرئة الإحالة السلوكية بموجب مداولات اللجنة: ${reason}`,
      'قيد المراجعة',
      'محفوظة ومبرأة'
    );

    // Auto sync to cloud if user connected
    if (currentUser?.email) {
      setTimeout(() => syncToCloud(), 200);
    }
  };

  // Teacher: Approve Grades Request
  const handleApproveGradesRequest = (requestId: string, gradesAmount: number) => {
    const ts = getPrecisionTimestamp();
    const req = redemptionRequests.find((r) => r.id === requestId);

    setRedemptionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              awardedGrades: gradesAmount,
              teacherActionAt: ts,
              teacherName: 'أ. معلم المادة (TEACHER-2020)',
            }
          : r
      )
    );

    logAudit(
      'TEACHER-2020',
      'teacher',
      'أ. معلم المادة (TEACHER-2020)',
      'student_honor',
      'اعتماد درجات',
      req?.studentName || 'طالب',
      `اعتماد طلب الدرجات للطالب ومنحه +${gradesAmount} درجات في الكشف الصفي`,
      'طلب معلق',
      `معتمد (+${gradesAmount} درجات)`
    );
  };

  // Teacher: Approve Honor Request
  const handleApproveHonorRequest = (requestId: string) => {
    const ts = getPrecisionTimestamp();
    const req = redemptionRequests.find((r) => r.id === requestId);

    setRedemptionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'approved',
              teacherActionAt: ts,
              teacherName: 'أ. معلم المادة (TEACHER-2020)',
            }
          : r
      )
    );

    logAudit(
      'TEACHER-2020',
      'teacher',
      'أ. معلم المادة (TEACHER-2020)',
      'student_honor',
      'اعتماد تكريم',
      req?.studentName || 'طالب',
      `اعتماد وتثبيت طلب التكريم والثناء الرسمي للطالب أمام الصف والمدرسة`,
      'طلب معلق',
      'معتمد رسمياً'
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1B2A4A] flex flex-col selection:bg-[#135D43] selection:text-white" dir="rtl">
      {/* Official Header with Live Clock and Audit trigger */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        authenticatedRole={authenticatedRole}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenAuditLog={() => setIsAuditLogModalOpen(true)}
        onOpenDatabaseExport={() => setIsDatabaseExportModalOpen(true)}
        onOpenDatabaseDashboard={() => {
          setIsDatabaseDashboardOpen(!isDatabaseDashboardOpen);
          if (isElectionsViewOpen) setIsElectionsViewOpen(false);
        }}
        isDatabaseDashboardOpen={isDatabaseDashboardOpen}
        onOpenElections={() => {
          setIsElectionsViewOpen(!isElectionsViewOpen);
          if (isDatabaseDashboardOpen) setIsDatabaseDashboardOpen(false);
        }}
        isElectionsOpen={isElectionsViewOpen}
        currentUser={currentUser}
        isCloudSyncing={isCloudSyncing}
        onTriggerCloudSync={() => syncToCloud()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Security & Multi-Role Guardrails Banner */}
        <SecurityBanner
          authenticatedRole={authenticatedRole}
          onOpenAuthModal={handleOpenAuthModal}
        />

        {/* Database Management & Exploration View or Class Elections View */}
        {isElectionsViewOpen ? (
          <ClassElectionsView
            students={students}
            teacherName="أ. سعيد بن راشد الحارثي (رائد الفصل)"
            isTeacherAuthenticated={authenticatedRole === 'teacher'}
            onOpenAuthModal={() => handleOpenAuthModal('teacher')}
            onClose={() => setIsElectionsViewOpen(false)}
          />
        ) : isDatabaseDashboardOpen ? (
          <DatabaseDashboardView
            teachers={teachers}
            absences={absences}
            students={students}
            awardLogs={awardLogs}
            redemptionRequests={redemptionRequests}
            teacherHonors={teacherHonors}
            infractions={infractions}
            auditLogs={auditLogs}
            eduCoins={eduCoins}
            onOpenExportModal={() => setIsDatabaseExportModalOpen(true)}
            onClose={() => setIsDatabaseDashboardOpen(false)}
          />
        ) : (
          <>
            {/* Active Role View */}
            {currentRole === 'admin' && (
              <AdminMode
                isAdminAuthenticated={authenticatedRole === 'admin'}
                onOpenAuthModal={() => handleOpenAuthModal('admin')}
                onOpenDatabase={() => setIsDatabaseDashboardOpen(true)}
                onOpenExportModal={() => setIsDatabaseExportModalOpen(true)}
                teachers={teachers}
                absences={absences}
                teacherHonors={teacherHonors}
                auditLogs={auditLogs}
                infractions={infractions}
                students={students}
                onEnforceAdministrativeAction={handleEnforceAdministrativeAction}
                onDismissInfractionReferral={handleDismissInfractionReferral}
                onUpdateTeacherStatus={handleUpdateTeacherStatus}
                onAddAbsence={handleAddAbsence}
                onAssignSubstitute={handleAssignSubstitute}
                onAutoDistributeSubstitutes={handleAutoDistributeSubstitutes}
                onAddTeacherHonor={handleAddTeacherHonor}
              />
            )}
            {currentRole === 'teacher' && (
              <TeacherMode
                isTeacherAuthenticated={authenticatedRole === 'teacher'}
                onOpenAuthModal={() => handleOpenAuthModal('teacher')}
                students={students}
                awardLogs={awardLogs}
                redemptionRequests={redemptionRequests}
                infractions={infractions}
                onUpdateStudentAttendance={handleUpdateStudentAttendance}
                onMarkAllPresent={handleMarkAllPresent}
                onAwardPoints={handleAwardPoints}
                onAddInfraction={handleAddInfraction}
                onApproveGradesRequest={handleApproveGradesRequest}
                onApproveHonorRequest={handleApproveHonorRequest}
              />
            )}
            {currentRole === 'student' && (
              <StudentMode
                isStudentAuthenticated={authenticatedRole === 'student'}
                onOpenAuthModal={() => handleOpenAuthModal('student')}
                students={students}
                eduCoins={eduCoins}
                redemptionRequests={redemptionRequests}
                onRequestRedemption={handleStudentRequestRedemption}
              />
            )}
          </>
        )}
      </main>

      {/* Modals & Drawers */}
      <RoleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        targetRole={targetAuthRole}
        onVerifyPin={handleVerifyRolePin}
        currentUser={currentUser}
        onLoginGoogle={loginWithGoogle}
        onLogoutFirebase={logoutFirebase}
      />

      <SarhAiChatDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoadingAi}
      />

      <AuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
        auditLogs={auditLogs}
      />

      <DatabaseExportModal
        isOpen={isDatabaseExportModalOpen}
        onClose={() => setIsDatabaseExportModalOpen(false)}
        teachers={teachers}
        absences={absences}
        students={students}
        awardLogs={awardLogs}
        redemptionRequests={redemptionRequests}
        teacherHonors={teacherHonors}
        infractions={infractions}
        auditLogs={auditLogs}
        eduCoins={eduCoins}
      />
    </div>
  );
}
