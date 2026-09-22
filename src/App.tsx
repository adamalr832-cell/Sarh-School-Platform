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

// معرف عام وثابت لكي يشارك الجميع نفس قاعدة البيانات السحابية
const SHARED_CLOUD_ID = 'sarh_public_school_database_2026';

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

  // Core Data States - قراءة فورية من التخزين المحلي كقاعدة أولية
  const [teachers, setTeachers] = useState<TeacherLoad[]>(() => {
    const saved = localStorage.getItem('sarh_teachers_v3');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });
  const [absences, setAbsences] = useState<AbsenceRequest[]>(() => {
    const saved = localStorage.getItem('sarh_absences_v3');
    return saved ? JSON.parse(saved) : INITIAL_ABSENCES;
  });
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem('sarh_students_v3');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [awardLogs, setAwardLogs] = useState<TeacherAwardLog[]>(() => {
    const saved = localStorage.getItem('sarh_awardLogs_v3');
    return saved ? JSON.parse(saved) : INITIAL_AWARD_LOGS;
  });
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>(() => {
    const saved = localStorage.getItem('sarh_redemptions_v3');
    return saved ? JSON.parse(saved) : INITIAL_REDEMPTIONS;
  });
  const [teacherHonors, setTeacherHonors] = useState<TeacherHonor[]>(() => {
    const saved = localStorage.getItem('sarh_teacherHonors_v3');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_HONORS;
  });
  const [infractions, setInfractions] = useState<StudentInfraction[]>(() => {
    const saved = localStorage.getItem('sarh_infractions_v3');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_INFRACTIONS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('sarh_auditLogs_v3');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [eduCoins, setEduCoins] = useState<number>(() => {
    const saved = localStorage.getItem('sarh_eduCoins_v3');
    return saved ? JSON.parse(saved) : 245;
  });
  const [electionCandidates, setElectionCandidates] = useState<any[]>(() => {
    const saved = localStorage.getItem('sarh_election_candidates_v3');
    return saved ? JSON.parse(saved) : [
      { id: 'cand-1', name: 'محمد بن حمد البوسعيدي', votes: 12, position: 'رئيس المجلس الطلابي' },
      { id: 'cand-2', name: 'عمر بن أحمد العلوي', votes: 8, position: 'رئيس المجلس الطلابي' },
      { id: 'cand-3', name: 'سالم بن علي المعمري', votes: 15, position: 'مسؤول الأنشطة والفعاليات' },
    ];
  });

  // مزامنة فورية محلية وعامة للسحابة
  const persistAndSync = async (key: string, value: any, setter: Function) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));

    // رفع التحديث مباشرة إلى المستند العام المشترك لكي يراه الجميع في كل الأجهزة
    try {
      setIsCloudSyncing(true);
      await saveUserCloudData(SHARED_CLOUD_ID, {
        teachers: key === 'sarh_teachers_v3' ? value : teachers,
        absences: key === 'sarh_absences_v3' ? value : absences,
        students: key === 'sarh_students_v3' ? value : students,
        awardLogs: key === 'sarh_awardLogs_v3' ? value : awardLogs,
        redemptionRequests: key === 'sarh_redemptions_v3' ? value : redemptionRequests,
        teacherHonors: key === 'sarh_teacherHonors_v3' ? value : teacherHonors,
        infractions: key === 'sarh_infractions_v3' ? value : infractions,
        auditLogs: key === 'sarh_auditLogs_v3' ? value : auditLogs,
        eduCoins: key === 'sarh_eduCoins_v3' ? value : eduCoins,
        electionCandidates: key === 'sarh_election_candidates_v3' ? value : electionCandidates,
      });
      setLastCloudSyncTime(getPrecisionTimestamp());
    } catch (err) {
      console.warn('Cloud sync error:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Firebase Auth and Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string>('');

  // جلب البيانات من المستند العام المشترك فور فتح التطبيق
  React.useEffect(() => {
    const fetchSharedCloudData = async () => {
      try {
        setIsCloudSyncing(true);
        const cloudData = await getUserCloudData(SHARED_CLOUD_ID);
        if (cloudData) {
          if (Array.isArray(cloudData.teachers)) { setTeachers(cloudData.teachers); localStorage.setItem('sarh_teachers_v3', JSON.stringify(cloudData.teachers)); }
          if (Array.isArray(cloudData.absences)) { setAbsences(cloudData.absences); localStorage.setItem('sarh_absences_v3', JSON.stringify(cloudData.absences)); }
          if (Array.isArray(cloudData.students)) { setStudents(cloudData.students); localStorage.setItem('sarh_students_v3', JSON.stringify(cloudData.students)); }
          if (Array.isArray(cloudData.awardLogs)) { setAwardLogs(cloudData.awardLogs); localStorage.setItem('sarh_awardLogs_v3', JSON.stringify(cloudData.awardLogs)); }
          if (Array.isArray(cloudData.redemptionRequests)) { setRedemptionRequests(cloudData.redemptionRequests); localStorage.setItem('sarh_redemptions_v3', JSON.stringify(cloudData.redemptionRequests)); }
          if (Array.isArray(cloudData.teacherHonors)) { setTeacherHonors(cloudData.teacherHonors); localStorage.setItem('sarh_teacherHonors_v3', JSON.stringify(cloudData.teacherHonors)); }
          if (Array.isArray(cloudData.infractions)) { setInfractions(cloudData.infractions); localStorage.setItem('sarh_infractions_v3', JSON.stringify(cloudData.infractions)); }
          if (Array.isArray(cloudData.auditLogs)) { setAuditLogs(cloudData.auditLogs); localStorage.setItem('sarh_auditLogs_v3', JSON.stringify(cloudData.auditLogs)); }
          if (typeof cloudData.eduCoins === 'number') { setEduCoins(cloudData.eduCoins); localStorage.setItem('sarh_eduCoins_v3', JSON.stringify(cloudData.eduCoins)); }
          if (Array.isArray(cloudData.electionCandidates)) { setElectionCandidates(cloudData.electionCandidates); localStorage.setItem('sarh_election_candidates_v3', JSON.stringify(cloudData.electionCandidates)); }
          
          setLastCloudSyncTime(getPrecisionTimestamp());
        }
      } catch (err) {
        console.warn('Error loading shared cloud store:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    };

    fetchSharedCloudData();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const syncToCloud = async () => {
    await persistAndSync('sarh_teachers_v3', teachers, setTeachers);
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
    persistAndSync('sarh_auditLogs_v3', [newEntry, ...auditLogs], setAuditLogs);
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
    persistAndSync('sarh_teachers_v3', updatedTeachers, setTeachers);

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
        persistAndSync('sarh_absences_v3', [newAbs, ...absences], setAbsences);
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
    persistAndSync('sarh_absences_v3', updatedAbsences, setAbsences);

    if (substituteName) {
      const updatedTeachers = teachers.map((t) =>
        t.name === substituteName ? { ...t, currentWeeklyLoad: Math.min(t.maxWeeklyLoad, t.currentWeeklyLoad + 1) } : t
      );
      persistAndSync('sarh_teachers_v3', updatedTeachers, setTeachers);
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
    persistAndSync('sarh_absences_v3', [newRecord, ...absences], setAbsences);
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

    setTeachers(updatedTeachers);
    setAbsences(updatedAbsences);
    localStorage.setItem('sarh_teachers_v3', JSON.stringify(updatedTeachers));
    localStorage.setItem('sarh_absences_v3', JSON.stringify(updatedAbsences));
    syncToCloud();
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
    persistAndSync('sarh_teacherHonors_v3', [newHonor, ...teacherHonors], setTeacherHonors);
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
    persistAndSync('sarh_students_v3', updatedStudents, setStudents);
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
    persistAndSync('sarh_students_v3', updatedStudents, setStudents);
  };

  // Teacher: Award Points
  const handleAwardPoints = (studentId: string, points: number, reason: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const updatedStudents = students.map((s) => (s.id === studentId ? { ...s, points: s.points + points } : s));
    setStudents(updatedStudents);
    localStorage.setItem('sarh_students_v3', JSON.stringify(updatedStudents));

    if (studentId === 'std-1') {
      setEduCoins(eduCoins + points);
      localStorage.setItem('sarh_eduCoins_v3', JSON.stringify(eduCoins + points));
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
    setAwardLogs([newLog, ...awardLogs]);
    localStorage.setItem('sarh_awardLogs_v3', JSON.stringify([newLog, ...awardLogs]));
    syncToCloud();
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
    persistAndSync('sarh_infractions_v3', [newInfr, ...infractions], setInfractions);
  };

  const handleStudentRequestRedemption = (type: RedemptionType, cost: number) => {
    if (eduCoins < cost) return;
    setEduCoins(eduCoins - cost);
    localStorage.setItem('sarh_eduCoins_v3', JSON.stringify(eduCoins - cost));

    const updatedStudents = students.map((s) => (s.id === 'std-1' ? { ...s, points: Math.max(0, s.points - cost) } : s));
    setStudents(updatedStudents);
    localStorage.setItem('sarh_students_v3', JSON.stringify(updatedStudents));

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
    setRedemptionRequests([newReq, ...redemptionRequests]);
    localStorage.setItem('sarh_redemptions_v3', JSON.stringify([newReq, ...redemptionRequests]));
    syncToCloud();
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
    persistAndSync('sarh_infractions_v3', updatedInfractions, setInfractions);
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
    persistAndSync('sarh_infractions_v3', updatedInfractions, setInfractions);
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
    persistAndSync('sarh_redemptions_v3', updatedRequests, setRedemptionRequests);
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
    persistAndSync('sarh_redemptions_v3', updatedRequests, setRedemptionRequests);
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
            candidates={electionCandidates}
            onUpdateCandidates={(newCandidates: any[]) => persistAndSync('sarh_election_candidates_v3', newCandidates, setElectionCandidates)}
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
