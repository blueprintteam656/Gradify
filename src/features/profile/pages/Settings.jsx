
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getSettings,
  updateSettings,
} from '../../../services/mock/mockSettingsService';

const DEFAULT_SETTINGS = {
  theme: 'light',
  notificationsEnabled: true,
  notificationPreferences: {
    tasks: true,
    feedback: true,
    deadlines: true,
    ai: false,
  },
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
};

const translations = {
  en: {
    workspace: 'STUDENT WORKSPACE',
    settings: 'Settings',
    passwordHelp: 'Looking for password settings?',
    changePassword: 'Go to Change Password',
    appearance: 'Appearance',
    appearanceDesc:
      'Select your preferred interface theme for working on your graduation project.',
    autoSynced: 'Auto-synced',
    lightMode: 'Light Mode',
    lightDesc:
      'Soft cream background with high-contrast navy typography.',
    darkMode: 'Dark Mode',
    darkDesc: 'Easy on the eyes for late-night sprint sessions.',
    systemDefault: 'System Default',
    systemDesc:
      'Automatically syncs with your operating system.',
    notifications: 'Notifications',
    notificationsDesc:
      'Manage how and when Gradify alerts you about milestone updates, reviews, and tasks.',
    desktopNotifications: 'Enable Desktop Notifications',
    desktopDesc:
      'Receive real-time browser alerts for immediate project updates even when Gradify is in the background.',
    live: 'LIVE',
    tasks: 'Task Assignments & Mentions',
    tasksDesc:
      'Get notified when a team leader or peer assigns you a deliverable or mentions you in comment threads.',
    feedback: 'Supervisor Feedback & Approvals',
    feedbackDesc:
      'Immediate alerts when your Academic Advisor reviews submissions, code repositories, or milestone rubrics.',
    deadlines: 'Sprint Deadline Reminders',
    deadlinesDesc:
      'Proactive alerts dispatched 48 hours and 24 hours prior to submission deadlines and presentation milestones.',
    ai: 'AI Insights & Plagiarism Alerts',
    aiDesc:
      'Notifications when automated analysis detects documentation inconsistencies or critical citation issues.',
    languageRegion: 'Language & Region',
    languageDesc:
      'Choose your default display language for navigation, tasks, and system emails.',
    systemLanguage: 'System Language',
    academicHint:
      'Academic terminology aligns to IEEE & ACM templates.',
    dateFormat: 'Date & Time Format',
    activeStandard: 'Active standard',
    dateHint: 'Synchronized with your preferred date format.',
    english: 'English (US)',
    arabic: 'Arabic',
    security: 'Security & Access',
    credential: 'Credential governance',
    authentication: 'Password & Authentication',
    authenticationDesc:
      'Passwords are managed in a dedicated security workflow. To update your password or configure multi-factor auth, visit the Change Password page.',
    securityStatus:
      'Account security status will appear when connected.',
    distribution: 'Notification Distribution',
    weekly: 'Weekly',
    chartPreview: 'Preview notification activity',
    illustrative: 'Illustrative data',
    activeProject: 'Active Academic Project',
    projectUnavailable: 'Project information unavailable',
    projectDesc:
      'Your project name and supervisor will appear here when project data is connected.',
    settingsScope:
      'Settings apply only to your personal student dashboard view.',
    resetDesc:
      'Resetting will restore system defaults for theme, alerts, and language preferences.',
    reset: 'Reset Settings',
    save: 'Save Settings',
    saving: 'Saving...',
    saved: 'Settings saved successfully.',
    saveError: 'Failed to save settings. Please try again.',
    loadError: 'Failed to load settings.',
    loading: 'Loading settings...',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
  },
  ar: {
    workspace: 'مساحة عمل الطالب',
    settings: 'الإعدادات',
    passwordHelp: 'هل تبحث عن إعدادات كلمة المرور؟',
    changePassword: 'الانتقال إلى تغيير كلمة المرور',
    appearance: 'المظهر',
    appearanceDesc:
      'اختر المظهر المفضل لك أثناء العمل على مشروع التخرج.',
    autoSynced: 'مزامنة تلقائية',
    lightMode: 'الوضع الفاتح',
    lightDesc: 'خلفية فاتحة مع نصوص كحلية واضحة.',
    darkMode: 'الوضع الداكن',
    darkDesc: 'مظهر مريح للعين أثناء العمل ليلًا.',
    systemDefault: 'إعدادات الجهاز',
    systemDesc: 'يتغير المظهر تلقائيًا حسب إعدادات جهازك.',
    notifications: 'الإشعارات',
    notificationsDesc:
      'تحكم في الإشعارات الخاصة بالمهام والمراجعات ومراحل المشروع.',
    desktopNotifications: 'تفعيل إشعارات سطح المكتب',
    desktopDesc:
      'استقبل إشعارات فورية عن تحديثات المشروع حتى أثناء وجود Gradify في الخلفية.',
    live: 'مفعّل',
    tasks: 'المهام والإشارات',
    tasksDesc:
      'استقبل إشعارًا عند إسناد مهمة إليك أو الإشارة إليك في التعليقات.',
    feedback: 'ملاحظات المشرف والموافقات',
    feedbackDesc:
      'استقبل إشعارات عند مراجعة المشرف الأكاديمي للتسليمات أو مستودعات الكود أو تقييمات المشروع.',
    deadlines: 'تذكيرات مواعيد التسليم',
    deadlinesDesc:
      'استقبل تنبيهات قبل مواعيد التسليم والعروض التقديمية بـ 48 و24 ساعة.',
    ai: 'تحليلات الذكاء الاصطناعي وتنبيهات الاقتباس',
    aiDesc:
      'استقبل إشعارات عند اكتشاف مشكلات في التوثيق أو الاقتباسات من خلال التحليل التلقائي.',
    languageRegion: 'اللغة والمنطقة',
    languageDesc: 'اختر اللغة المستخدمة في عرض إعدادات الصفحة.',
    systemLanguage: 'لغة النظام',
    academicHint:
      'تتوافق المصطلحات الأكاديمية مع قوالب IEEE وACM.',
    dateFormat: 'تنسيق التاريخ والوقت',
    activeStandard: 'التنسيق الحالي',
    dateHint: 'يتم استخدام تنسيق التاريخ الذي اخترته.',
    english: 'الإنجليزية',
    arabic: 'العربية',
    security: 'الأمان والوصول',
    credential: 'إدارة بيانات تسجيل الدخول',
    authentication: 'كلمة المرور والمصادقة',
    authenticationDesc:
      'تتم إدارة كلمات المرور في صفحة أمان منفصلة. لتغيير كلمة المرور أو إعداد المصادقة متعددة العوامل، انتقل إلى صفحة تغيير كلمة المرور.',
    securityStatus:
      'ستظهر حالة أمان الحساب عند ربط بيانات الأمان.',
    distribution: 'توزيع الإشعارات',
    weekly: 'أسبوعيًا',
    chartPreview: 'معاينة نشاط الإشعارات',
    illustrative: 'بيانات توضيحية',
    activeProject: 'مشروع التخرج الحالي',
    projectUnavailable: 'معلومات المشروع غير متاحة',
    projectDesc:
      'سيظهر اسم مشروعك والمشرف الأكاديمي عند ربط بيانات المشروع.',
    settingsScope:
      'تنطبق هذه الإعدادات على لوحة الطالب الشخصية فقط.',
    resetDesc:
      'ستؤدي إعادة الضبط إلى استعادة الإعدادات الافتراضية للمظهر والإشعارات واللغة.',
    reset: 'إعادة ضبط الإعدادات',
    save: 'حفظ الإعدادات',
    saving: 'جارٍ الحفظ...',
    saved: 'تم حفظ الإعدادات بنجاح.',
    saveError: 'تعذر حفظ الإعدادات. حاول مرة أخرى.',
    loadError: 'تعذر تحميل الإعدادات.',
    loading: 'جارٍ تحميل الإعدادات...',
    mon: 'الإثنين',
    tue: 'الثلاثاء',
    wed: 'الأربعاء',
    thu: 'الخميس',
    fri: 'الجمعة',
    sat: 'السبت',
  },
};

const FONT = {
  pageTitle: { fontSize: 32, fontWeight: 800, lineHeight: 1.3 },
  section: { fontSize: 23, fontWeight: 800, lineHeight: 1.4 },
  heading: { fontSize: 20, fontWeight: 800, lineHeight: 1.45 },
  body: { fontSize: 18, lineHeight: 1.75 },
  hint: { fontSize: 18, lineHeight: 1.75, fontWeight: 500 },
  label: { fontSize: 19, fontWeight: 800, lineHeight: 1.5 },
  small: { fontSize: 16, lineHeight: 1.6 },
};

function Icon({ name, size = 22, className = '' }) {
  const paths = {
    sliders: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="2.5" />
        <circle cx="16" cy="17" r="2.5" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.5-3.3 1.7 1.7 0 0 1 1.4-2.7H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9Z" />
        <circle cx="7.5" cy="11" r=".8" />
        <circle cx="10" cy="7" r=".8" />
        <circle cx="15" cy="7.5" r=".8" />
        <circle cx="17" cy="12" r=".8" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: (
      <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
    ),
    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </>
    ),
    desktop: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 22h8M12 18v4" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="5" width="14" height="16" rx="2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="m9 14 2 2 4-4" />
      </>
    ),
    message: (
      <>
        <path d="M4 5h16v12H8l-4 4V5Z" />
        <path d="m9 13 2-2 2 2 3-4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 15h8M8 18h5" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="M19 16v6M16 19h6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] || paths.info}
    </svg>
  );
}

function SecurityBadge() {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: 42,
        height: 42,
        backgroundColor: '#F0EFED',
        borderRadius: 10,
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2.5 19 5.5v5.8c0 4.6-2.8 8.2-7 10.2-4.2-2-7-5.6-7-10.2V5.5L12 2.5Z"
          fill="#17264C"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function OutlineShield() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4657C5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="m12 2 8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Switch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full transition-colors"
      style={{
        width: 54,
        height: 30,
        backgroundColor: checked ? '#4657C5' : '#B8C0E8',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="absolute rounded-full bg-white shadow-sm transition-all"
        style={{
          width: 24,
          height: 24,
          top: 3,
          left: checked ? 27 : 3,
        }}
      />
    </button>
  );
}

function SectionTitle({ icon, title, description, dark }) {
  return (
    <div className="flex items-start gap-4">
      <span
        className="flex shrink-0 items-center justify-center rounded-xl"
        style={{
          width: 46,
          height: 46,
          backgroundColor: dark ? '#383B65' : '#ECECF7',
          color: dark ? '#CACBFF' : '#4657C5',
        }}
      >
        <Icon name={icon} size={24} />
      </span>

      <div className="min-w-0">
        <h2 style={FONT.section}>{title}</h2>
        <p
          className={dark ? 'text-[#D4D5E3]' : 'text-[#555762]'}
          style={{ ...FONT.body, marginTop: 8 }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function ThemePreview({ mode }) {
  const dark = mode === 'dark';
  const system = mode === 'system';

  return (
    <div
      className={`h-[112px] overflow-hidden rounded-lg p-3 ${
        dark ? 'bg-[#1C224A]' : 'bg-[#FCFCFB]'
      }`}
    >
      <div
        className={`mb-3 h-2 w-[40%] rounded-full ${
          dark ? 'bg-[#555B87]' : 'bg-[#D0D3DC]'
        }`}
      />

      <div className="flex h-[74px] gap-2">
        <div
          className={`w-[35%] rounded-md p-2 ${
            dark ? 'bg-[#30365E]' : 'bg-white'
          }`}
        >
          <div
            className={`h-2 rounded-full ${
              dark ? 'bg-[#626A9A]' : 'bg-[#D6D9E0]'
            }`}
          />
          <div
            className={`mt-2 h-2 w-2/3 rounded-full ${
              dark ? 'bg-[#626A9A]' : 'bg-[#E7E9ED]'
            }`}
          />
        </div>

        <div
          className={`flex-1 rounded-md p-2 ${
            dark || system ? 'bg-[#282E5C]' : 'bg-white'
          }`}
        >
          <div
            className={`h-2 rounded-full ${
              dark || system ? 'bg-[#626A9A]' : 'bg-[#D6D9E0]'
            }`}
          />
          <div
            className={`mt-2 h-2 w-3/4 rounded-full ${
              dark || system ? 'bg-[#626A9A]' : 'bg-[#E7E9ED]'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled,
  dark,
  badge,
}) {
  return (
    <div
      className={`flex items-start gap-4 border-b py-6 last:border-b-0 ${
        dark ? 'border-[#3B3E60]' : 'border-[#E6E5EF]'
      }`}
    >
      <span className="mt-1 shrink-0 text-[#4657C5]">
        <Icon name={icon} size={23} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 style={FONT.heading}>{title}</h3>

          {badge && (
            <span
              className="rounded-md bg-[#E8E0F7] px-2 py-1 font-extrabold text-[#6940A4]"
              style={{ fontSize: 14 }}
            >
              {badge}
            </span>
          )}
        </div>

        <p
          className={dark ? 'text-[#D4D5E3]' : 'text-[#555762]'}
          style={{ ...FONT.body, marginTop: 8 }}
        >
          {description}
        </p>
      </div>

      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        label={title}
      />
    </div>
  );
}

function Dropdown({
  value,
  options,
  onChange,
  dark,
  label,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handleOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const selected =
    options.find((option) => option.value === value) || options[0];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-start ${
          dark
            ? 'border-[#4A4E70] bg-[#313553] text-white'
            : 'border-[#DCDDE8] bg-white text-[#17264C]'
        }`}
        style={{ fontSize: 19, fontWeight: 700 }}
      >
        <span>{selected?.label}</span>
        <Icon
          name="chevron"
          size={21}
          className={`shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className={`absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border p-2 shadow-xl ${
            dark
              ? 'border-[#4A4E70] bg-[#313553] text-white'
              : 'border-[#DCDDE8] bg-white text-[#17264C]'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-start transition-colors ${
                value === option.value
                  ? 'bg-[#E9E9FA] text-[#3546AC]'
                  : dark
                  ? 'hover:bg-[#41456A]'
                  : 'hover:bg-[#F5F4F1]'
              }`}
              style={{
                fontSize: 20,
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Icon name="check" size={20} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [savedSettings, setSavedSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const data = await getSettings();

        if (!active) return;

        const normalized = {
          ...DEFAULT_SETTINGS,
          ...(data || {}),
          notificationPreferences: {
            ...DEFAULT_SETTINGS.notificationPreferences,
            ...(data?.notificationPreferences || {}),
          },
        };

        setSettings(normalized);
        setSavedSettings(JSON.parse(JSON.stringify(normalized)));
      } catch {
        if (active) setMessage({ type: 'error', key: 'loadError' });
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia) return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);

    update();
    media.addEventListener?.('change', update);

    return () => media.removeEventListener?.('change', update);
  }, []);

  const language = settings?.language === 'ar' ? 'ar' : 'en';
  const t = translations[language];
  const isArabic = language === 'ar';

  const isDark =
    settings?.theme === 'dark' ||
    (settings?.theme === 'system' && systemDark);

  const hasChanges =
    Boolean(settings && savedSettings) &&
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const card = `rounded-[16px] border shadow-[0_3px_16px_rgba(30,34,73,0.04)] ${
    isDark
      ? 'border-[#393C60] bg-[#242844] text-white'
      : 'border-[#ECEBF0] bg-white text-[#17264C]'
  }`;

  const muted = isDark ? 'text-[#D4D5E3]' : 'text-[#555762]';
  const soft = isDark ? 'bg-[#313553]' : 'bg-[#F5F4F1]';

  function changeField(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setMessage(null);
  }

  function changeNotification(key, value) {
    setSettings((previous) => ({
      ...previous,
      notificationPreferences: {
        ...previous.notificationPreferences,
        [key]: value,
      },
    }));
    setMessage(null);
  }

  function handleReset() {
    setSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
    setMessage(null);
  }

  async function handleSave() {
    if (!settings || saving || !hasChanges) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateSettings(settings);
      setSavedSettings(JSON.parse(JSON.stringify(settings)));
      setMessage({ type: 'success', key: 'saved' });
    } catch {
      setMessage({ type: 'error', key: 'saveError' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8" style={FONT.body}>
        {t.loading}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-red-600" style={FONT.body}>
        {t.loadError}
      </div>
    );
  }

  const themes = [
    {
      id: 'light',
      icon: 'sun',
      title: t.lightMode,
      description: t.lightDesc,
    },
    {
      id: 'dark',
      icon: 'moon',
      title: t.darkMode,
      description: t.darkDesc,
    },
    {
      id: 'system',
      icon: 'monitor',
      title: t.systemDefault,
      description: t.systemDesc,
    },
  ];

  const notifications = [
    {
      id: 'tasks',
      icon: 'clipboard',
      title: t.tasks,
      description: t.tasksDesc,
    },
    {
      id: 'feedback',
      icon: 'message',
      title: t.feedback,
      description: t.feedbackDesc,
    },
    {
      id: 'deadlines',
      icon: 'calendar',
      title: t.deadlines,
      description: t.deadlinesDesc,
    },
    {
      id: 'ai',
      icon: 'sparkles',
      title: t.ai,
      description: t.aiDesc,
      badge: 'GEMINI 1.5',
    },
  ];

  const chartValues = [45, 75, 100, 58, 33, 18];
  const chartDays = [
    t.mon,
    t.tue,
    t.wed,
    t.thu,
    t.fri,
    t.sat,
  ];

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={language}
      className={`min-h-screen px-4 py-6 font-sans sm:px-6 lg:px-8 ${
        isDark ? 'bg-[#191D36]' : 'bg-[#FAF9F7]'
      }`}
    >
      <div className="mx-auto max-w-[1280px]">
        <header
          className={`${card} mb-9 flex flex-wrap items-center justify-between gap-6 px-6 py-6`}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#E9E9FA] text-[#4657C5]">
              <Icon name="sliders" size={26} />
            </span>

            <div>
              <p
                className={muted}
                style={{ fontSize: 15, fontWeight: 700 }}
              >
                {t.workspace}
                <span className="text-[#4657C5]">
                  {' · '}2024/2025
                </span>
              </p>

              <h1 className="mt-1" style={FONT.pageTitle}>
                {t.settings}
              </h1>
            </div>
          </div>

          <Link
            to="/profile/change-password"
            className={`flex items-center gap-3 rounded-xl px-4 py-4 ${soft}`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E9E9FA] text-[#4657C5]">
              <Icon name="lock" size={23} />
            </span>

            <span>
              <span className={`block ${muted}`} style={FONT.small}>
                {t.passwordHelp}
              </span>
              <span
                className="mt-1 flex items-center gap-2 text-[#4657C5]"
                style={{ fontSize: 18, fontWeight: 800 }}
              >
                {t.changePassword}
                <Icon name="arrow" size={19} />
              </span>
            </span>
          </Link>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]">
          <main className="space-y-6">
            <section className={`${card} p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <SectionTitle
                  icon="palette"
                  title={t.appearance}
                  description={t.appearanceDesc}
                  dark={isDark}
                />

                <span
                  className={`rounded-full px-3 py-2 ${soft}`}
                  style={{ fontSize: 15, fontWeight: 700 }}
                >
                  {t.autoSynced}
                </span>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {themes.map((theme) => {
                  const selected = settings.theme === theme.id;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => changeField('theme', theme.id)}
                      className={`rounded-xl border p-3 text-start transition-all ${
                        isDark
                          ? 'border-[#3F4365] bg-[#313553]'
                          : 'border-[#ECEBF0] bg-[#F5F4F1]'
                      } ${
                        selected
                          ? 'ring-2 ring-[#4657C5] ring-offset-2'
                          : 'hover:border-[#A8AAE0]'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#4657C5]">
                          <Icon name={theme.icon} size={20} />
                        </span>

                        {selected && (
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4657C5] text-white">
                            <Icon name="check" size={17} />
                          </span>
                        )}
                      </div>

                      <ThemePreview mode={theme.id} />

                      <h3 className="mt-4" style={FONT.heading}>
                        {theme.title}
                      </h3>

                      <p
                        className={`mt-2 ${muted}`}
                        style={{ fontSize: 17, lineHeight: 1.7 }}
                      >
                        {theme.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={`${card} p-6`}>
              <SectionTitle
                icon="bell"
                title={t.notifications}
                description={t.notificationsDesc}
                dark={isDark}
              />

              <div
                className={`mt-7 flex items-center gap-4 rounded-xl p-5 ${soft}`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E9E9FA] text-[#4657C5]">
                  <Icon name="desktop" size={25} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 style={FONT.heading}>
                      {t.desktopNotifications}
                    </h3>

                    <span
                      className="rounded bg-[#DDF8E8] px-2 py-1 text-[#16A765]"
                      style={{ fontSize: 13, fontWeight: 800 }}
                    >
                      {t.live}
                    </span>
                  </div>

                  <p className={`mt-2 ${muted}`} style={FONT.body}>
                    {t.desktopDesc}
                  </p>
                </div>

                <Switch
                  label={t.desktopNotifications}
                  checked={settings.notificationsEnabled}
                  onChange={(value) =>
                    changeField('notificationsEnabled', value)
                  }
                />
              </div>

              <div className="mt-3">
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    icon={notification.icon}
                    title={notification.title}
                    description={notification.description}
                    badge={notification.badge}
                    dark={isDark}
                    checked={Boolean(
                      settings.notificationPreferences[notification.id]
                    )}
                    disabled={!settings.notificationsEnabled}
                    onChange={(value) =>
                      changeNotification(notification.id, value)
                    }
                  />
                ))}
              </div>
            </section>

            <section className={`${card} p-6`}>
              <SectionTitle
                icon="globe"
                title={t.languageRegion}
                description={t.languageDesc}
                dark={isDark}
              />

              <div className="mt-8 grid gap-7 sm:grid-cols-2">
                <div>
                  <label className="mb-3 block" style={FONT.label}>
                    {t.systemLanguage}
                  </label>

                  <Dropdown
                    label={t.systemLanguage}
                    dark={isDark}
                    value={settings.language}
                    onChange={(value) =>
                      changeField('language', value)
                    }
                    options={[
                      { value: 'en', label: t.english },
                      { value: 'ar', label: t.arabic },
                    ]}
                  />

                  <p className={`mt-4 ${muted}`} style={FONT.hint}>
                    {t.academicHint}
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <label style={FONT.label}>
                      {t.dateFormat}
                    </label>

                    <span
                      className="text-[#4657C5]"
                      style={{ fontSize: 16, fontWeight: 700 }}
                    >
                      {t.activeStandard}
                    </span>
                  </div>

                  <Dropdown
                    label={t.dateFormat}
                    dark={isDark}
                    value={settings.dateFormat}
                    onChange={(value) =>
                      changeField('dateFormat', value)
                    }
                    options={[
                      {
                        value: 'DD/MM/YYYY',
                        label: 'DD/MM/YYYY',
                      },
                      {
                        value: 'MM/DD/YYYY',
                        label: 'MM/DD/YYYY',
                      },
                      {
                        value: 'YYYY-MM-DD',
                        label: 'YYYY-MM-DD',
                      },
                    ]}
                  />

                  <p className={`mt-4 ${muted}`} style={FONT.hint}>
                    {t.dateHint}
                  </p>
                </div>
              </div>
            </section>
          </main>

          <aside className="space-y-6">
            <section className={`${card} p-5`}>
              <div className="flex items-center gap-3">
                <SecurityBadge />

                <div>
                  <h2
                    style={{
                      fontSize: 21,
                      fontWeight: 800,
                      lineHeight: 1.35,
                    }}
                  >
                    {t.security}
                  </h2>

                  <p
                    className={muted}
                    style={{ fontSize: 16, lineHeight: 1.5 }}
                  >
                    {t.credential}
                  </p>
                </div>
              </div>

              <div
                className="mt-5 rounded-[12px] p-5"
                style={{
                  backgroundColor: isDark
                    ? '#313553'
                    : '#F5F4F1',
                }}
              >
                <div className="flex items-start gap-2">
                  <OutlineShield />

                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      lineHeight: 1.45,
                    }}
                  >
                    {t.authentication}
                  </h3>
                </div>

                <p
                  className={`mt-5 ${muted}`}
                  style={{ fontSize: 17, lineHeight: 1.8 }}
                >
                  {t.authenticationDesc}
                </p>

                <Link
                  to="/profile/change-password"
                  className={`mt-5 flex min-h-[48px] items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-center ${
                    isDark
                      ? 'bg-[#41456A] text-white'
                      : 'bg-white text-[#17264C]'
                  }`}
                  style={{ fontSize: 16, fontWeight: 800 }}
                >
                  {t.changePassword}
                  <Icon name="arrow" size={18} />
                </Link>
              </div>

              <div className="mt-5 flex items-center gap-3 px-1">
                <span
                  className="block shrink-0"
                  style={{
                    width: 10,
                    height: 10,
                    minWidth: 10,
                    minHeight: 10,
                    aspectRatio: '1 / 1',
                    borderRadius: '50%',
                    backgroundColor: '#20C878',
                  }}
                />

                <p
                  className={muted}
                  style={{ fontSize: 16, lineHeight: 1.6 }}
                >
                  {t.securityStatus}
                </p>
              </div>
            </section>

            <section className={`${card} p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                  style={{
                    fontSize: 21,
                    fontWeight: 800,
                  }}
                >
                  {t.distribution}
                </h2>

                <span
                  className="text-[#4657C5]"
                  style={{ fontSize: 16, fontWeight: 700 }}
                >
                  {t.weekly}
                </span>
              </div>

              <div className={`mt-6 rounded-lg px-3 pb-4 pt-5 ${soft}`}>
                <div className="flex h-[130px] items-end justify-between gap-2">
                  {chartValues.map((height, index) => (
                    <div
                      key={index}
                      className="flex h-full min-w-0 flex-1 items-end"
                    >
                      <div
                        className={`w-full rounded-t-[4px] ${
                          index === 2
                            ? 'bg-[#4657C5]'
                            : 'bg-[#DADCF5]'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between gap-2">
                  {chartDays.map((day, index) => (
                    <span
                      key={index}
                      className={`min-w-0 flex-1 text-center ${
                        index === 2
                          ? 'font-extrabold text-[#4657C5]'
                          : muted
                      }`}
                      style={{ fontSize: isArabic ? 11 : 14 }}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className={muted} style={FONT.small}>
                  {t.chartPreview}
                </span>

                <span
                  className="text-[#4657C5]"
                  style={{ fontSize: 15, fontWeight: 700 }}
                >
                  {t.illustrative}
                </span>
              </div>
            </section>

            <section className={`${card} overflow-hidden`}>
              <div className="relative flex h-[160px] items-end overflow-hidden bg-gradient-to-br from-[#575B93] via-[#353A73] to-[#23294E] p-5">
                <div className="absolute end-5 top-5 text-white/20">
                  <Icon name="monitor" size={85} />
                </div>

                <span
                  className="relative rounded-md bg-white/20 px-3 py-2 text-white"
                  style={{ fontSize: 15, fontWeight: 700 }}
                >
                  {t.activeProject}
                </span>
              </div>

              <div className="p-6">
                <h3 style={FONT.heading}>
                  {t.projectUnavailable}
                </h3>

                <p className={`mt-3 ${muted}`} style={FONT.body}>
                  {t.projectDesc}
                </p>

                <div className="mt-5 flex items-start gap-3 text-[#4657C5]">
                  <Icon
                    name="info"
                    size={21}
                    className="mt-1 shrink-0"
                  />

                  <p style={FONT.small}>
                    {t.settingsScope}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <footer
          className={`${card} mt-7 flex flex-wrap items-center justify-between gap-6 px-6 py-6`}
        >
          <div className="flex max-w-[700px] items-start gap-3">
            <Icon
              name="info"
              size={23}
              className="mt-1 shrink-0"
            />

            <p className={muted} style={FONT.body}>
              {t.resetDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className={`rounded-lg px-4 py-4 disabled:opacity-50 ${
                isDark ? 'text-white' : 'text-[#17264C]'
              }`}
              style={{ fontSize: 18, fontWeight: 800 }}
            >
              {t.reset}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 rounded-lg bg-[#4657C5] px-6 py-4 text-white transition-colors hover:bg-[#3546AC] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontSize: 18, fontWeight: 800 }}
            >
              <Icon name="check" size={20} />
              {saving ? t.saving : t.save}
            </button>
          </div>
        </footer>

        {message && (
          <p
            role="status"
            className={`mt-4 rounded-lg px-5 py-4 ${
              message.type === 'error'
                ? 'bg-[#FCE8E8] text-[#A12E2E]'
                : 'bg-[#ECECFB] text-[#3546AC]'
            }`}
            style={FONT.body}
          >
            {t[message.key]}
          </p>
        )}
      </div>
    </div>
  );
}
