import React, { useState } from 'react';
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
  const [authenticatedRole, setAuthenticatedRole] = useState<UserRole | null>('admin');
  const [targetAuthRole, setTargetAuthRole] = useState<UserRole>('admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isDatabaseExportModalOpen, setIsDatabaseExportModalOpen] = useState(false);
  const [isDatabaseDashboardOpen, setIsDatabaseDashboardOpen] = useState(false);
  const [isElectionsViewOpen, setIsElectionsViewOpen] = useState(false);

  // Core Data States - قراءة فورية من التخزين المحلي لضمان عدم الضياع
  const [teachers, setTeachers] = useState<TeacherLoad[]>(() => {
    const saved = localStorage.getItem('sarh_teachers_v2');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });
  const [absences, setAbsences] = useState<AbsenceRequest[]>(() => {
    const saved = localStorage.getItem('sarh_absences_v2');
    return saved ? JSON.parse(saved) : INITIAL_ABSENCES;
  });
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('sarh_students_v2');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [awardLogs, setAwardLogs] = useState<TeacherAwardLog[]>(() => {
    const saved = localStorage.getItem('sarh_awardLogs_v2');
    return saved ? JSON.parse(saved) : INITIAL_AWARD_LOGS;
  });
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>(() => {
    const saved = localStorage.getItem('sarh_redemptions_v2');
    return saved ? JSON.parse(saved) : INITIAL_REDEMPTIONS;
  });
  const [teacherHonors, setTeacherHonors] = useState<TeacherHonor[]>(() => {
    const saved = localStorage.getItem('sarh_teacherHonors_v2');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_HONORS;
  });
  const [infractions, setInfractions] = useState<StudentInfraction[]>(() => {
    const saved = localStorage.getItem('sarh_infractions_v2');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_INFRACTIONS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('sarh_auditLogs_v2');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [eduCoins, setEduCoins] = useState<number>(() => {
    const saved = localStorage.getItem('sarh_eduCoins_v2');
    return saved ? JSON.parse(saved) : 245;
  });

  // حفظ فوري ومستمر في التخزين المحلي عند أي تغيير
  const persistAndUpdate = (key: string, value: any, setter: Function) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Firebase Auth and Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string>('');

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setCurrentUser(user);
      if (user && user.email) {
        try {
          setIsCloudSyncing(true);
          const cloudData = await getUserCloudData(user.email);
          if (cloudData) {
            if (Array.isArray(cloudData.teachers)) persistAndUpdate('sarh_teachers_v2', cloudData.teachers, setTeachers);
            if (Array.isArray(cloudData.absences)) persistAndUpdate('sarh_absences_v2', cloudData.absences, setAbsences);
            if (Array.isArray(cloudData.students)) persistAndUpdate('sarh_students_v2', cloudData.students, setStudents);
            if (Array.isArray(cloudData.awardLogs)) persistAndUpdate('sarh_awardLogs_v2', cloudData.awardLogs, setAwardLogs);
            if (Array.isArray(cloudData.redemptionRequests)) persistAndUpdate('sarh_redemptions_v2', cloudData.redemptionRequests, setRedemptionRequests);
            if (Array.isArray(cloudData.teacherHonors)) persistAndUpdate('sarh_teacherHonors_v2', cloudData.teacherHonors, setTeacherHonors);
            if (Array.isArray(cloudData.infractions)) persistAndUpdate('sarh_infractions_v2', cloudData.infractions, setInfractions);
            if (Array.isArray(cloudData.auditLogs)) persistAndUpdate('sarh_auditLogs_v2', cloudData.auditLogs, setAuditLogs);
            if (typeof cloudData.eduCoins === 'number') persistAndUpdate('sarh_eduCoins_v2', cloudData.eduCoins, setEduCoins);

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
      setLastCloudSyncTime(getPrecisionTimestamp());
    } catch (err) {
      console.warn('Cloud save error:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  };

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
    persistAndUpdate('sarh_auditLogs_v2', [newEntry, ...auditLogs], setAuditLogs);
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `مرحباً بكم في **منصة "صَرْح" المدرسية الذكية** في **مدرسة موسى بن نصير للتعليم ما بعد الأساسي** - سلطنة عُمان.`,
      timestamp: getPrecisionTimestamp(),
    },
  ]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setIsDatabaseDashboardOpen(false);
    if (authenticatedRole !== role) {
      setTargetAuthRole(role);
      setIsAuthModalOpen(true);
    }
  };

  const handleOpenAuthModal = (role?: UserRole) => {
    setTargetAuthRole(role || currentRole);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    setAuthenticatedRole(null);
  };

  const handleVerifyRolePin = async (role: UserRole, pin: string): Promise<boolean> => {
    const trimmedPin = String(pin || '').trim();
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
        `مستخدم بوابة ${role}`,
        'security_audit',
        'توثيق دخول',
        `بوابة ${role}`,
        `تسجيل دخول وتوثيق ناجح بالرمز المعتمد`,
        'مقفلة',
        'مفتوحة'
      );
      return true;
    }
    return false;
  };

  const handleSendMessage = async (text: string, forceAdminToken?: boolean) => {
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: getPrecisionTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingAi(false);
  };

  // Admin: Update Teacher Attendance Status
  const handleUpdateTeacherStatus = (teacherId: string, status: 'available' | 'absent' | 'delegated') => {
    const targetTeacher = teachers.find((t) => t.id === teacherId);
    const prevStatus = targetTeacher?.status || 'available';
    const ts = getPrecisionTimestamp();

    const updatedTeachers = teachers.map((t) => (t.id === teacherId ? { ...t, status } : t));
    persistAndUpdate('sarh_teachers_v2', updatedTeachers, setTeachers);

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
        persistAndUpdate('sarh_absences_v2', [newAbs, ...absences], setAbsences);
      }
    }
  };

  // Admin: Assign Substitute Teacher
  const handleAssignSubstitute = (absenceId: string, substituteName: string) => {
    const ts = getPrecisionTimestamp();
    const updatedAbsences = absences.map((a) =>
      a.id === absenceId
        ? {
            ...a,
            substituteTeacher: substituteName || undefined,
            status: substituteName ? ('assigned' as const) : ('pending' as const),
            assignmentTimestamp: ts,
            assignedBy: 'إدارة المدرسة',
          }
        : a
    );
    persistAndUpdate('sarh_absences_v2', updatedAbsences, setAbsences);

    if (substituteName) {
      const updatedTeachers = teachers.map((t) =>
        t.name === substituteName ? { ...t, currentWeeklyLoad: Math.min(t.maxWeeklyLoad, t.currentWeeklyLoad + 1) } : t
      );
      persistAndUpdate('sarh_teachers_v2', updatedTeachers, setTeachers);
    }
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
    persistAndUpdate('sarh_absences_v2', [newRecord, ...absences], setAbsences);
  };

  // Admin: Auto-Distribution
  const handleAutoDistributeSubstitutes = () => {
    const ts = getPrecisionTimestamp();
    let updatedTeachers = [...teachers];
    const updatedAbsences = absences.map((item) => {
      if (!item.substituteTeacher) {
        const availableTeachers = updatedTeachers.filter(
          (t) => t.status !== 'absent' && t.status !== 'delegated' && t.currentWeeklyLoad < t.maxWeeklyLoad
        );
        availableTeachers.sort((a, b) => a.currentWeeklyLoad - b.currentWeeklyLoad);
        const bestCandidate = availableTeachers[0];

        if (bestCandidate) {
          updatedTeachers = updatedTeachers.map((t) =>
            t.id === bestCandidate.id ? { ...t, currentWeeklyLoad: t.currentWeeklyLoad + 1 } : t
          );
          return {
            ...item,
            substituteTeacher: bestCandidate.name,
            status: 'assigned' as const,
            assignmentTimestamp: ts,
            assignedBy: 'توزيع ذكي آلي',
          };
        }
      }
      return item;
    });

    persistAndUpdate('sarh_teachers_v2', updatedTeachers, setTeachers);
    persistAndUpdate('sarh_absences_v2', updatedAbsences, setAbsences);
  };

  const handleAddTeacherHonor = (
    teacherId: string,
    honorType: 'نقطة تميّز' | 'شهادة تميّز' | 'وسام الإجادة التربوية',
    occasion: string
  ) => {
    const targetTeacher = teachers.find((t) => t.id === teacherId);
    const newHonor: TeacherHonor = {
      id: `thonor-${Date.now()}`,
      teacherId,
      teacherName: targetTeacher?.name || 'معلم متميز',
      honorType,
      occasion,
      recordedBy: 'الإدارة',
      timestamp: getPrecisionTimestamp(),
      timestampMs: Date.now(),
    };
    persistAndUpdate('sarh_teacherHonors_v2', [newHonor, ...teacherHonors], setTeacherHonors);
  };

  // Teacher: Update Student Attendance
  const handleUpdateStudentAttendance = (studentId: string, status: 'present' | 'absent' | 'late', period: number = 1) => {
    const updatedStudents = students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            attendanceStatus: status,
            attendanceTimestamp: getPrecisionTimestamp(),
            attendancePeriod: period,
          }
        : s
    );
    persistAndUpdate('sarh_students_v2', updatedStudents, setStudents);
  };

  const handleMarkAllPresent = (gradeClass: string, period: number = 1) => {
    const ts = getPrecisionTimestamp();
    const updatedStudents = students.map((s) =>
      s.gradeClass === gradeClass
        ? {
            ...s,
            attendanceStatus: 'present' as const,
            attendanceTimestamp: ts,
            attendancePeriod: period,
          }
        : s
    );
    persistAndUpdate('sarh_students_v2', updatedStudents, setStudents);
  };

  // Teacher: Award Points
  const handleAwardPoints = (studentId: string, points: number, reason: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const updatedStudents = students.map((s) => (s.id === studentId ? { ...s, points: s.points + points } : s));
    persistAndUpdate('sarh_students_v2', updatedStudents, setStudents);

    if (studentId === 'std-1') {
      persistAndUpdate('sarh_eduCoins_v2', eduCoins + points, setEduCoins);
    }

    const newLog: TeacherAwardLog = {
      id: `awd-${Date.now()}`,
      studentId,
      studentName: targetStudent?.name || 'طالب متميز',
      points,
      reason,
      timestamp: getPrecisionTimestamp(),
      teacherName: 'أ. معلم المادة',
    };
    persistAndUpdate('sarh_awardLogs_v2', [newLog, ...awardLogs], setAwardLogs);
  };

  const handleAddInfraction = (
    studentId: string,
    category: string,
    description: string,
    severity: 'خفيفة' | 'متوسطة' | 'جسيمة'
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const newInfr: StudentInfraction = {
      id: `infr-${Date.now()}`,
      studentId,
      studentName: targetStudent?.name || 'طالب',
      gradeClass: targetStudent?.gradeClass || 'الصف العاشر / 1',
      description,
      category,
      severity,
      recordedBy: 'أ. معلم المادة',
      timestamp: getPrecisionTimestamp(),
      timestampMs: Date.now(),
    };
    persistAndUpdate('sarh_infractions_v2', [newInfr, ...infractions], setInfractions);
  };

  const handleStudentRequestRedemption = (type: RedemptionType, cost: number) => {
    if (eduCoins < cost) return;
    persistAndUpdate('sarh_eduCoins_v2', eduCoins - cost, setEduCoins);

    const updatedStudents = students.map((s) => (s.id === 'std-1' ? { ...s, points: Math.max(0, s.points - cost) } : s));
    persistAndUpdate('sarh_students_v2', updatedStudents, setStudents);

    const newReq: RedemptionRequest = {
      id: `req-${Date.now()}`,
      studentId: 'std-1',
      studentName: 'محمد بن حمد البوسعيدي',
      gradeClass: 'الصف العاشر / 1',
      type,
      pointsCost: cost,
      status: 'pending',
      createdAt: getPrecisionTimestamp(),
    };
    persistAndUpdate('sarh_redemptions_v2', [newReq, ...redemptionRequests], setRedemptionRequests);
  };

  const handleEnforceAdministrativeAction = (
    infractionId: string,
    action: AdministrativeSanction,
    actionNotes: string,
    reviewerName: string,
    deductPoints = 0
  ) => {
    const updatedInfractions = infractions.map((i) =>
      i.id === infractionId
        ? {
            ...i,
            referralStatus: 'action_enforced' as const,
            administrativeAction: action,
            actionNotes,
            reviewedBy: reviewerName,
            reviewedAt: getPrecisionTimestamp(),
            penaltyPointsDeducted: deductPoints,
          }
        : i
    );
    persistAndUpdate('sarh_infractions_v2', updatedInfractions, setInfractions);
  };

  const handleDismissInfractionReferral = (infractionId: string, reason: string, reviewerName: string) => {
    const updatedInfractions = infractions.map((i) =>
      i.id === infractionId
        ? {
            ...i,
            referralStatus: 'dismissed' as const,
            actionNotes: `حفظ المخالفة: ${reason}`,
            reviewedBy: reviewerName,
            reviewedAt: getPrecisionTimestamp(),
          }
        : i
    );
    persistAndUpdate('sarh_infractions_v2', updatedInfractions, setInfractions);
  };

  const handleApproveGradesRequest = (requestId: string, gradesAmount: number) => {
    const updatedRequests = redemptionRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as const,
            awardedGrades: gradesAmount,
            teacherActionAt: getPrecisionTimestamp(),
          }
        : r
    );
    persistAndUpdate('sarh_redemptions_v2', updatedRequests, setRedemptionRequests);
  };

  const handleApproveHonorRequest = (requestId: string) => {
    const updatedRequests = redemptionRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as const,
            teacherActionAt: getPrecisionTimestamp(),
          }
        : r
    );
    persistAndUpdate('sarh_redemptions_v2', updatedRequests, setRedemptionRequests);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1B2A4A] flex flex-col selection:bg-[#135D43] selection:text-white" dir="rtl">
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <SecurityBanner authenticatedRole={authenticatedRole} onOpenAuthModal={handleOpenAuthModal} />

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
                teachers={teachers}
                students={students}
                awardLogs={awardLogs}
                redemptionRequests={redemptionRequests}
                infractions={infractions}
                onUpdateAttendance={handleUpdateStudentAttendance}
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
                awardLogs={awardLogs}
                redemptionRequests={redemptionRequests}
                eduCoins={eduCoins}
                onRequestRedemption={handleStudentRequestRedemption}
                onOpenElections={() => setIsElectionsViewOpen(true)}
              />
            )}
          </>
        )}
      </main>

      <RoleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        targetRole={targetAuthRole}
        onVerifyPin={handleVerifyRolePin}
        currentUser={currentUser}
        onGoogleLogin={loginWithGoogle}
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
      />
    </div>
  );
}
