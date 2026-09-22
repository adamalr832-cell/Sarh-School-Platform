export type UserRole = 'admin' | 'teacher' | 'student';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  guardrailTriggered?: string;
  hasAdminToken?: boolean;
  validatedRole?: UserRole;
  authToken?: string;
}

export interface TeacherLoad {
  id: string;
  name: string;
  subject: string;
  currentWeeklyLoad: number;
  maxWeeklyLoad: number;
  availablePeriods: number[]; // e.g. [1, 3, 5]
  status: 'available' | 'busy' | 'absent' | 'delegated';
  absenceRecordedAt?: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  lastStatusChangeTimestamp?: string;
  notes?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  gradeClass: string;
  points: number;
  attendanceStatus: 'present' | 'absent' | 'late';
  attendanceTimestamp?: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  attendancePeriod?: number;
  seatNumber: number;
  parentName?: string;
  parentPhone?: string;
  civilId?: string;
}

export interface TeacherAwardLog {
  id: string;
  studentId: string;
  studentName: string;
  points: number;
  reason: string;
  awardType?: 'نقطة تميّز' | 'وسام الإجادة' | 'شهادة شكر' | string;
  timestamp: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  timestampMs?: number;
  teacherName: string;
}

export interface TeacherHonor {
  id: string;
  teacherId: string;
  teacherName: string;
  honorType: 'نقطة تميّز' | 'شهادة تميّز' | 'وسام الإجادة التربوية' | string;
  occasion: string; // المناسبة
  recordedBy: string; // الإدارة المدرسية
  timestamp: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  timestampMs?: number;
}

export type InfractionDegree = 'الأولى (خفيفة)' | 'الثانية (متوسطة)' | 'الثالثة (جسيمة)' | 'الرابعة (شديدة الخطورة)';
export type ReferralStatus = 'pending_review' | 'action_enforced' | 'counseled' | 'dismissed';
export type AdministrativeSanction =
  | 'تنبيه شفهي وتوثيق'
  | 'إنذار كتابي رسمي'
  | 'استدعاء ولي الأمر وتوقيع تعهد'
  | 'إحالة إلى الأخصائي الاجتماعي'
  | 'فصل مؤقت مع تكليف بأنشطة بديلة'
  | 'خصم نقاط السلوك والانضباط'
  | 'أخرى';

export interface StudentInfraction {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  description: string;
  category: 'تأخر متكرر' | 'عدم إحضار أدوات التعلم' | 'مخالفة الانضباط الصفي' | 'سلوك سلبي' | string;
  severity: 'خفيفة' | 'متوسطة' | 'جسيمة';
  degree?: InfractionDegree; // الدرجة حسب القرار الوزاري 234/2017
  witnesses?: string; // أسماء الشهود إن وجد
  recordedBy: string; // اسم الشخص الذي قام بالرصد
  teacherEmail?: string; // البريد الإلكتروني للمعلم الراصد
  timestamp: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  timestampMs?: number;
  // Student Affairs Administrative Review
  status?: ReferralStatus; // حالة الإحالة للجنة شؤون الطلاب
  administrativeAction?: AdministrativeSanction; // الإجراء الإداري المتخذ
  actionNotes?: string; // مبررات وقرار لجنة شؤون الطلاب
  reviewedBy?: string; // اسم المسؤول المعتمد
  reviewerEmail?: string; // بريد المسؤول المعتمد
  reviewedAt?: string; // وقت اعتماد الإجراء بالثانية
  deductedPoints?: number; // عدد النقاط المحسومة
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  timestampMs: number;
  operatorId: string; // e.g. ADMIN-1010, TEACHER-2020, STUDENT-3030
  operatorRole: UserRole;
  operatorName: string;
  category:
    | 'teacher_attendance'
    | 'substitution'
    | 'teacher_honor'
    | 'student_attendance'
    | 'student_infraction'
    | 'student_referral'
    | 'disciplinary_action'
    | 'student_honor'
    | 'redemption_request'
    | 'security_audit'
    | 'cloud_sync'
    | string;
  actionType: string;
  targetPerson: string; // اسم الشخص المرتبط بالحدث
  details: string;
  previousState?: string;
  newState: string;
}

export type RedemptionType = 'grades' | 'honor';

export interface RedemptionRequest {
  id: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  type: RedemptionType;
  pointsCost: number;
  status: 'pending' | 'approved';
  awardedGrades?: number;
  createdAt: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  teacherActionAt?: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  teacherName?: string;
}

export interface AbsenceRequest {
  id: string;
  absentTeacher: string;
  subject: string;
  gradeClass: string;
  period: number;
  substituteTeacher?: string;
  status: 'pending' | 'assigned';
  assignmentTimestamp?: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  createdAt?: string; // [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
  assignedBy?: string;
  notes?: string;
}

export interface EduCoinItem {
  id: string;
  title: string;
  rewardType: 'badge' | 'announcement' | 'certificate' | 'privilege';
  cost: number;
  iconName: string;
  description: string;
  unlocked: boolean;
}

export interface DailyAchievement {
  id: string;
  task: string;
  points: number;
  completed: boolean;
  category: 'academic' | 'discipline' | 'activities';
}

export interface StudyItem {
  id: string;
  subject: string;
  taskDescription: string;
  estimatedMinutes: number;
  timeSlot: string;
  done: boolean;
  priority: 'high' | 'medium';
}

export interface BehaviorReport {
  id: string;
  studentName: string;
  gradeClass: string;
  type: 'positive' | 'remedial';
  observation: string;
  actionTaken: string;
  recordedBy: string;
  date: string;
}

export interface RoleAuthConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  defaultPin: string;
  token: string;
  colorClass: string;
  badgeText: string;
  sampleName: string;
}

export interface ElectionCandidate {
  id: string;
  name: string;
  votes: number;
  percentage?: number;
}

export type ElectionRoleKey = 'president' | 'vicePresident' | 'secretary';

export interface ElectionRoleData {
  roleKey: ElectionRoleKey;
  roleTitle: string; // رئيس الصف / نائب رئيس الصف / أمين سر الصف
  roleDescription: string;
  candidates: ElectionCandidate[];
  totalVotes: number;
  winnerId: string | null;
  winnerName: string | null;
  isTie: boolean;
}

export interface ClassElection {
  id: string;
  gradeClass: string;
  totalClassStudents: number;
  academicYear: string;
  roles: {
    president: ElectionRoleData;
    vicePresident: ElectionRoleData;
    secretary: ElectionRoleData;
  };
  status: 'draft' | 'completed';
  certified: boolean;
  savedAt: string;
  teacherName: string;
  timestampStr: string;
}
