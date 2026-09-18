-- ==============================================================================
-- قاعدة بيانات منصة "صَرْح" المدرسية الذكية
-- مدرسة موسى بن نصير للتعليم ما بعد الأساسي (10-12) - سلطنة عُمان
-- المعيار الزمني: [التاريخ: YYYY-MM-DD | الوقت: HH:MM:SS]
-- التوثيق وتاريخ التصدير: [التاريخ: 2026-09-18 | الوقت: 07:18:30]
-- ==============================================================================

-- 1. جدول بيانات المدرسة
CREATE TABLE IF NOT EXISTS school_info (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    curriculum VARCHAR(255) NOT NULL,
    principal VARCHAR(150) NOT NULL,
    contact VARCHAR(50),
    address VARCHAR(255)
);

INSERT INTO school_info (id, name, code, curriculum, principal, contact, address)
VALUES ('SCH-OM-MN-1012', 'مدرسة موسى بن نصير للتعليم ما بعد الأساسي', 'MN-40291', 'المنهج الوطني العماني وسلاسل كامبريدج للعلوم والرياضيات', 'أ. سالم بن راشد الهنائي', '+968-24000000', 'سلطنة عُمان')
ON CONFLICT (id) DO NOTHING;

-- 2. جدول الكادر التدريسي وأنصبة الحصص
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    current_weekly_load INT DEFAULT 0,
    max_weekly_load INT DEFAULT 22,
    available_periods TEXT, -- JSON or Comma-separated list e.g. "1,2,4"
    status VARCHAR(50) DEFAULT 'available', -- 'available' | 'busy' | 'absent'
    absence_recorded_at VARCHAR(100),
    last_status_change_timestamp VARCHAR(100),
    notes TEXT
);

INSERT INTO teachers (id, name, subject, current_weekly_load, max_weekly_load, available_periods, status, absence_recorded_at, last_status_change_timestamp, notes) VALUES
('t-1', 'أ. سالم بن سعيد السعدي', 'فيزياء (كامبريدج)', 18, 22, '[1,2,4]', 'absent', '[التاريخ: 2026-09-17 | الوقت: 07:15:00]', NULL, 'إجازة عارضة موثقة بالبوابة التعليمية'),
('t-2', 'أ. أحمد بن علي البلوشي', 'علوم عامة وفيزياء', 14, 22, '[1,3,5,6]', 'available', NULL, '[التاريخ: 2026-09-17 | الوقت: 07:10:00]', NULL),
('t-3', 'أ. ماجد بن ناصر الحوسني', 'لغة عربية', 20, 22, '[3,4]', 'absent', '[التاريخ: 2026-09-17 | الوقت: 07:22:30]', NULL, 'مهمة إشراف تربوي خارجي'),
('t-4', 'أ. خالد بن سلطان المعمري', 'لغة عربية', 15, 22, '[2,4,6]', 'available', NULL, '[التاريخ: 2026-09-17 | الوقت: 07:12:00]', NULL),
('t-5', 'أ. حمود بن زاهر الريامي', 'رياضيات متقدمة (كامبريدج)', 16, 22, '[1,2,5]', 'available', NULL, '[التاريخ: 2026-09-17 | الوقت: 07:05:00]', NULL),
('t-6', 'أ. يوسف بن راشد الغافري', 'دراسات اجتماعية وتاريخ', 13, 22, '[2,3,4,6]', 'available', NULL, '[التاريخ: 2026-09-17 | الوقت: 07:08:00]', NULL),
('t-7', 'أ. عبد الله بن حمد الوهيبي', 'تربية إسلامية', 17, 22, '[1,4,5]', 'available', NULL, '[التاريخ: 2026-09-17 | الوقت: 07:07:00]', NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. جدول طلبات غياب المعلمين وحصص الاحتياط
CREATE TABLE IF NOT EXISTS absence_requests (
    id VARCHAR(50) PRIMARY KEY,
    absent_teacher VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_class VARCHAR(50) NOT NULL,
    period INT NOT NULL,
    substitute_teacher VARCHAR(150),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'assigned'
    created_at VARCHAR(100) NOT NULL,
    assignment_timestamp VARCHAR(100),
    assigned_by VARCHAR(150),
    notes TEXT
);

INSERT INTO absence_requests (id, absent_teacher, subject, grade_class, period, substitute_teacher, status, created_at, assignment_timestamp, assigned_by, notes) VALUES
('abs-1', 'أ. سالم بن سعيد السعدي', 'فيزياء (كامبريدج)', '10 / 2', 1, 'أ. أحمد بن علي البلوشي', 'assigned', '[التاريخ: 2026-09-17 | الوقت: 07:15:00]', '[التاريخ: 2026-09-17 | الوقت: 07:25:12]', 'إدارة المدرسة (ADMIN-1010)', 'إجازة عارضة موثقة بالبوابة التعليمية'),
('abs-2', 'أ. ماجد بن ناصر الحوسني', 'لغة عربية', '11 / 1', 2, 'أ. خالد بن سلطان المعمري', 'assigned', '[التاريخ: 2026-09-17 | الوقت: 07:22:30]', '[التاريخ: 2026-09-17 | الوقت: 07:30:45]', 'إدارة المدرسة (ADMIN-1010)', 'مهمة إشراف تربوي خارجي'),
('abs-3', 'أ. محمد بن حارب الشحي', 'رياضيات تطبيقية', '12 / 3', 4, '', 'pending', '[التاريخ: 2026-09-17 | الوقت: 07:40:18]', NULL, NULL, 'غياب مرضي مفاجئ - بانتظار التكليف')
ON CONFLICT (id) DO NOTHING;

-- 4. جدول الطلاب وسجلات الحضور
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    grade_class VARCHAR(50) NOT NULL,
    points INT DEFAULT 0,
    attendance_status VARCHAR(50) DEFAULT 'present', -- 'present' | 'absent' | 'late'
    attendance_timestamp VARCHAR(100),
    attendance_period INT DEFAULT 1,
    seat_number INT
);

INSERT INTO students (id, name, grade_class, points, attendance_status, attendance_timestamp, attendance_period, seat_number) VALUES
('std-1', 'محمد بن حمد البوسعيدي', 'الصف العاشر / 1', 245, 'present', '[التاريخ: 2026-09-17 | الوقت: 07:45:10]', 1, 1),
('std-2', 'سعيد بن هلال المقبالي', 'الصف العاشر / 1', 190, 'present', '[التاريخ: 2026-09-17 | الوقت: 07:46:22]', 1, 2),
('std-3', 'فيصل بن نبهان الراسبي', 'الصف العاشر / 1', 130, 'absent', '[التاريخ: 2026-09-17 | الوقت: 07:55:04]', 1, 3),
('std-4', 'هزاع بن خالد العامري', 'الصف العاشر / 1', 280, 'present', '[التاريخ: 2026-09-17 | الوقت: 07:47:18]', 1, 4),
('std-5', 'عمر بن راشد الشكيلي', 'الصف العاشر / 1', 165, 'late', '[التاريخ: 2026-09-17 | الوقت: 08:05:33]', 1, 5),
('std-6', 'ناصر بن سالم الحارثي', 'الصف العاشر / 2', 210, 'present', '[التاريخ: 2026-09-17 | الوقت: 07:48:50]', 1, 1),
('std-7', 'حمد بن سيف الغافري', 'الصف العاشر / 2', 175, 'present', '[التاريخ: 2026-09-17 | الوقت: 07:49:15]', 1, 2),
('std-8', 'أحمد بن يوسف الزدجالي', 'الصف العاشر / 2', 310, 'present', '[التاريخ: 2026-09-17 | الوقت: 07:50:02]', 1, 3)
ON CONFLICT (id) DO NOTHING;

-- 5. جدول تكريم وإشادة المعلمين
CREATE TABLE IF NOT EXISTS teacher_honors (
    id VARCHAR(50) PRIMARY KEY,
    teacher_id VARCHAR(50) REFERENCES teachers(id),
    teacher_name VARCHAR(150) NOT NULL,
    honor_type VARCHAR(100) NOT NULL,
    occasion TEXT NOT NULL,
    recorded_by VARCHAR(150) NOT NULL,
    timestamp VARCHAR(100) NOT NULL,
    timestamp_ms BIGINT
);

INSERT INTO teacher_honors (id, teacher_id, teacher_name, honor_type, occasion, recorded_by, timestamp, timestamp_ms) VALUES
('thonor-1', 't-2', 'أ. أحمد بن علي البلوشي', 'وسام الإجادة التربوية', 'مبادرة تعليمية متميزة في تبسيط سلاسل كامبريدج وتفعيل المختبر الافتراضي', 'إدارة المدرسة (ADMIN-1010)', '[التاريخ: 2026-09-17 | الوقت: 08:30:00]', 1789716600000),
('thonor-2', 't-5', 'أ. حمود بن زاهر الريامي', 'شهادة تميّز', 'جهود استثنائية في تدريب الفريق المدرسي على الأولمبياد الوطني للرياضيات', 'إدارة المدرسة (ADMIN-1010)', '[التاريخ: 2026-09-16 | الوقت: 12:15:35]', 1789643735000)
ON CONFLICT (id) DO NOTHING;

-- 6. جدول المخالفات والملاحظات السلوكية
CREATE TABLE IF NOT EXISTS student_infractions (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id),
    student_name VARCHAR(150) NOT NULL,
    grade_class VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    recorded_by VARCHAR(150) NOT NULL,
    timestamp VARCHAR(100) NOT NULL,
    timestamp_ms BIGINT
);

INSERT INTO student_infractions (id, student_id, student_name, grade_class, description, category, severity, recorded_by, timestamp, timestamp_ms) VALUES
('infr-1', 'std-5', 'عمر بن راشد الشكيلي', 'الصف العاشر / 1', 'تأخر عن دخول الحصة الأولى لمدة 20 دقيقة بعد انتهاء طابور الصباح', 'تأخر متكرر', 'خفيفة', 'أ. حمود الريامي (معلم الحصة)', '[التاريخ: 2026-09-17 | الوقت: 08:05:33]', 1789715133000),
('infr-2', 'std-3', 'فيصل بن نبهان الراسبي', 'الصف العاشر / 1', 'عدم إحضار كراسة الأنشطة الاستقصائية للمرة الثانية على التوالي', 'عدم إحضار أدوات التعلم', 'خفيفة', 'أ. أحمد البلوشي (معلم المادة)', '[التاريخ: 2026-09-16 | الوقت: 09:12:10]', 1789632730000)
ON CONFLICT (id) DO NOTHING;

-- 7. جدول منح نقاط التميز والأوسمة للطلاب (بواسطة المعلم فقط)
CREATE TABLE IF NOT EXISTS award_logs (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id),
    student_name VARCHAR(150) NOT NULL,
    points INT NOT NULL,
    award_type VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    timestamp VARCHAR(100) NOT NULL,
    timestamp_ms BIGINT,
    teacher_name VARCHAR(150) NOT NULL
);

INSERT INTO award_logs (id, student_id, student_name, points, award_type, reason, timestamp, timestamp_ms, teacher_name) VALUES
('awd-1', 'std-1', 'محمد بن حمد البوسعيدي', 25, 'نقطة تميّز', 'مشاركة صفية متميزة وتفاعل مبدع في سلاسل كامبريدج', '[التاريخ: 2026-09-17 | الوقت: 09:15:30]', 1789719330000, 'أ. أحمد البلوشي'),
('awd-2', 'std-4', 'هزاع بن خالد العامري', 20, 'وسام الإجادة', 'التزام نموذجي وحل النشاط الاستقصائي للفيزياء', '[التاريخ: 2026-09-17 | الوقت: 10:30:12]', 1789723812000, 'أ. حمود الريامي'),
('awd-3', 'std-8', 'أحمد بن يوسف الزدجالي', 30, 'شهادة شكر', 'مبادرة تطوعية ومساعدة زملائه في المختبر المدرسي', '[التاريخ: 2026-09-16 | الوقت: 11:45:50]', 1789641950000, 'أ. خالد المعمري')
ON CONFLICT (id) DO NOTHING;

-- 8. جدول طلبات الاستبدال (درجات أو تكريم)
CREATE TABLE IF NOT EXISTS redemption_requests (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id),
    student_name VARCHAR(150) NOT NULL,
    grade_class VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'grades' | 'honor'
    points_cost INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    awarded_grades INT,
    created_at VARCHAR(100) NOT NULL,
    teacher_action_at VARCHAR(100),
    teacher_name VARCHAR(150)
);

INSERT INTO redemption_requests (id, student_id, student_name, grade_class, type, points_cost, status, awarded_grades, created_at, teacher_action_at, teacher_name) VALUES
('req-1', 'std-1', 'محمد بن حمد البوسعيدي', 'الصف العاشر / 1', 'grades', 50, 'pending', NULL, '[التاريخ: 2026-09-17 | الوقت: 09:40:15]', NULL, NULL),
('req-2', 'std-2', 'سعيد بن هلال المقبالي', 'الصف العاشر / 1', 'honor', 100, 'pending', NULL, '[التاريخ: 2026-09-17 | الوقت: 10:15:42]', NULL, NULL),
('req-3', 'std-4', 'هزاع بن خالد العامري', 'الصف العاشر / 1', 'grades', 50, 'approved', 2, '[التاريخ: 2026-09-16 | الوقت: 11:20:05]', '[التاريخ: 2026-09-16 | الوقت: 11:45:22]', 'أ. أحمد البلوشي')
ON CONFLICT (id) DO NOTHING;

-- 9. جدول سجل التتبع والأمان غير القابل للتعديل (Audit Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp VARCHAR(100) NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    operator_id VARCHAR(50) NOT NULL,
    operator_role VARCHAR(50) NOT NULL,
    operator_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_person VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT
);

INSERT INTO audit_logs (id, timestamp, timestamp_ms, operator_id, operator_role, operator_name, category, action_type, target_person, details, previous_state, new_state) VALUES
('audit-1', '[التاريخ: 2026-09-17 | الوقت: 07:15:00]', 1789712100000, 'ADMIN-1010', 'admin', 'مدير المدرسة / إدارة شؤون المعلمين', 'teacher_attendance', 'رصد', 'أ. سالم بن سعيد السعدي', 'رصد غياب المعلم رسمياً بداعي إجازة عارضة موثقة بالبوابة التعليمية', 'حاضر (available)', 'غائب (absent)'),
('audit-2', '[التاريخ: 2026-09-17 | الوقت: 07:25:12]', 1789712712000, 'ADMIN-1010', 'admin', 'إدارة المدرسة (قسم الجدول المدرسي)', 'substitution', 'إسناد', 'أ. أحمد بن علي البلوشي (بديل) / أ. سالم السعدي (غائب)', 'إسناد حصة الاحتياط الأولى للصف 10 / 2 فيزياء للمعلم أ. أحمد البلوشي بناءً على النصاب الأسبوعي', 'بانتظار التكليف (pending)', 'مُسنَد ومُعتمد (assigned)'),
('audit-3', '[التاريخ: 2026-09-17 | الوقت: 07:45:10]', 1789713910000, 'TEACHER-2020', 'teacher', 'أ. أحمد البلوشي (معلم الحصة)', 'student_attendance', 'رصد', 'محمد بن حمد البوسعيدي', 'تسجيل الحضور الصفي بالحصة الأولى (الصف العاشر / 1)', 'غير مسجل', 'حاضر (present)'),
('audit-4', '[التاريخ: 2026-09-17 | الوقت: 08:05:33]', 1789715133000, 'TEACHER-2020', 'teacher', 'أ. حمود الريامي', 'student_infraction', 'رصد', 'عمر بن راشد الشكيلي', 'رصد تأخر عن الحصة الأولى لمدة 20 دقيقة وتوجيه إشعار للأخصائي الاجتماعي', 'انضباط عادي', 'مخالفة تأخر متكرر (خفيفة)'),
('audit-5', '[التاريخ: 2026-09-17 | الوقت: 08:30:00]', 1789716600000, 'ADMIN-1010', 'admin', 'مدير المدرسة', 'teacher_honor', 'اعتماد', 'أ. أحمد بن علي البلوشي', 'منح وسام الإجادة التربوية تقديراً للمبادرة التعليمية بالمختبر الافتراضي', 'سجل اعتيادي', 'ممنوح وسام الإجادة التربوية'),
('audit-6', '[التاريخ: 2026-09-17 | الوقت: 09:15:30]', 1789719330000, 'TEACHER-2020', 'teacher', 'أ. أحمد البلوشي', 'student_honor', 'إضافة', 'محمد بن حمد البوسعيدي', 'منح +25 نقطة تميّز للمشاركة الصفية والتفاعل المبدع في سلاسل كامبريدج', '220 نقطة', '245 نقطة (+25)')
ON CONFLICT (id) DO NOTHING;

-- 10. جدول المكافآت والأوسمة الرقمية المتاحة (متجر Edu-Coins)
CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    cost INT NOT NULL,
    icon_name VARCHAR(50),
    description TEXT,
    unlocked BOOLEAN DEFAULT FALSE
);

INSERT INTO rewards (id, title, reward_type, cost, icon_name, description, unlocked) VALUES
('rew-1', 'وسام التميز المدرسي الرقمي', 'badge', 120, 'Award', 'يظهر في ملف إنجاز الطالب في البوابة التعليمية ومنصة صَرْح.', TRUE),
('rew-2', 'تكريم وثناء في الإذاعة المدرسية', 'announcement', 180, 'Mic', 'ذكر اسم الطالب في طابور الصباح تقديراً لانضباطه وسلوكه المتميز.', FALSE),
('rew-3', 'شهادة شكر معتمدة من مدير المدرسة', 'certificate', 250, 'FileBadge', 'شهادة تقدير رسمية مختومة موجهة لولي الأمر تشيد بالتميز الأكاديمي.', FALSE),
('rew-4', 'شرف قيادة طابور الصباح ليوم كامل', 'privilege', 320, 'Crown', 'المشاركة كقائد مراسم رفع العلم العماني وترديد النشيد السلطاني.', FALSE)
ON CONFLICT (id) DO NOTHING;

-- فهارس تحسين الأداء وسرعة الاستعلام
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade_class);
CREATE INDEX IF NOT EXISTS idx_students_attendance ON students(attendance_status);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_absence_status ON absence_requests(status);
