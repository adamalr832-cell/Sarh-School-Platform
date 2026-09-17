import { UserRole, RoleAuthConfig } from '../types';

export const ROLE_PINS: Record<UserRole, string> = {
  admin: '1010',
  teacher: '2020',
  student: '3030',
};

export const ROLE_AUTH_TOKENS: Record<UserRole, string> = {
  admin: '[ADMIN_AUTH_VALIDATED]',
  teacher: '[TEACHER_AUTH_VALIDATED]',
  student: '[STUDENT_AUTH_VALIDATED]',
};

export const ROLE_CONFIGS: Record<UserRole, RoleAuthConfig> = {
  admin: {
    role: 'admin',
    title: 'بوابة الإدارة المدرسية (Admin Portal)',
    subtitle: 'إدارة الجدول المدرسي، تغطية حصص الاحتياط، والتحليل التنبؤي لمؤشرات البوابة التعليمية',
    defaultPin: ROLE_PINS.admin,
    token: ROLE_AUTH_TOKENS.admin,
    colorClass: 'emerald',
    badgeText: 'منفذ الإدارة المعتمد',
    sampleName: 'مدرسة موسى بن نصير للتعليم ما بعد الأساسي',
  },
  teacher: {
    role: 'teacher',
    title: 'بوابة الهيئة التدريسية (Teacher Portal)',
    subtitle: 'مساعد تحضير سلاسل كامبريدج، الرصد السلوكي للائحة شؤون الطلاب، وتشكيل المجموعات',
    defaultPin: ROLE_PINS.teacher,
    token: ROLE_AUTH_TOKENS.teacher,
    colorClass: 'teal',
    badgeText: 'منفذ المعلم المعتمد',
    sampleName: 'كادر المعلمين - المناهج الوطنية وسلاسل كامبريدج',
  },
  student: {
    role: 'student',
    title: 'بوابة الطلاب (Student Portal)',
    subtitle: 'رصيد عملات صَرْح (Edu-Coins)، مُنظّم المذاكرة اليومي الذكي، والموجه الأكاديمي',
    defaultPin: ROLE_PINS.student,
    token: ROLE_AUTH_TOKENS.student,
    colorClass: 'blue',
    badgeText: 'منفذ الطالب المعتمد',
    sampleName: 'منظومة تميز وبناء قدرات الطالب العُماني',
  },
};

export const AUTH_ERROR_MESSAGE = 'الرمز غير صحيح، يرجى المراجعة';
