
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Bell,
  CalendarDays,
  Globe,
  ShieldCheck,
  Lock,
  Check,
  Info,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Laptop,
  GraduationCap,
} from "lucide-react";

import {
  getSettings,
  updateSettings,
} from "../../../services/mock/mockSettingsService";

const DEFAULT_SETTINGS = {
  theme: "light",
  notificationsEnabled: true,
  notificationPreferences: {
    tasks: true,
    feedback: true,
    deadlines: true,
    ai: false,
  },
  language: "en",
  dateFormat: "DD/MM/YYYY",
  selectedDate: "",
};

const translations = {
  en: {
    workspace: "STUDENT WORKSPACE",
    settings: "Settings",
    passwordHelp: "Looking for password settings?",
    changePassword: "Go to Change Password",
    appearance: "Appearance",
    appearanceDesc: "Select your preferred interface theme.",
    lightMode: "Light Mode",
    lightDesc: "A bright, comfortable interface.",
    darkMode: "Dark Mode",
    darkDesc: "Easy on the eyes during late-night work.",
    systemDefault: "System Default",
    systemDesc: "Follow your device appearance settings.",
    notifications: "Notifications",
    notificationsDesc:
      "Manage notifications for your graduation project.",
    desktopNotifications: "Enable Desktop Notifications",
    desktopDesc:
      "Receive browser notifications about important updates.",
    tasks: "Task Assignments & Mentions",
    tasksDesc:
      "Get notified when tasks are assigned or you are mentioned.",
    feedback: "Supervisor Feedback & Approvals",
    feedbackDesc:
      "Receive updates when your supervisor reviews your work.",
    deadlines: "Sprint Deadline Reminders",
    deadlinesDesc:
      "Receive reminders about upcoming deadlines.",
    ai: "AI Insights & Plagiarism Alerts",
    aiDesc:
      "Receive alerts about AI analysis and documentation.",
    languageRegion: "Language & Region",
    languageDesc:
      "Choose your preferred language and date.",
    systemLanguage: "System Language",
    selectDate: "Select Date",
    dateHint:
      "Enter a date or choose one from the calendar.",
    english: "English (US)",
    arabic: "Arabic",
    security: "Security & Access",
    credential: "Credential governance",
    authentication: "Password & Authentication",
    authenticationDesc:
      "Manage your password from the dedicated security page.",
    securityStatus:
      "Account security information will appear when connected.",
    distribution: "Notification Distribution",
    weekly: "Weekly",
    chartPreview: "Preview notification activity",
    illustrative: "Illustrative data",
    activeProject: "Active Academic Project",
    projectUnavailable: "Project information unavailable",
    projectDesc:
      "Your project details will appear when connected.",
    settingsScope:
      "These settings apply to your personal dashboard.",
    resetDesc:
      "Resetting will restore the default settings.",
    reset: "Reset Settings",
    save: "Save Settings",
    saving: "Saving...",
    saved: "Settings saved successfully.",
    saveError: "Failed to save settings. Please try again.",
    loadError: "Failed to load settings.",
    loading: "Loading settings...",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
  },

  ar: {
    workspace: "مساحة عمل الطالب",
    settings: "الإعدادات",
    passwordHelp: "هل تبحث عن إعدادات كلمة المرور؟",
    changePassword: "الانتقال إلى تغيير كلمة المرور",
    appearance: "المظهر",
    appearanceDesc: "اختر المظهر المناسب لك.",
    lightMode: "الوضع الفاتح",
    lightDesc: "واجهة فاتحة ومريحة.",
    darkMode: "الوضع الداكن",
    darkDesc: "مظهر مريح للعين أثناء العمل ليلًا.",
    systemDefault: "إعدادات الجهاز",
    systemDesc: "استخدام المظهر المحدد على جهازك.",
    notifications: "الإشعارات",
    notificationsDesc:
      "تحكم في إشعارات مشروع التخرج.",
    desktopNotifications: "تفعيل إشعارات سطح المكتب",
    desktopDesc:
      "استقبل إشعارات المتصفح عن التحديثات المهمة.",
    tasks: "المهام والإشارات",
    tasksDesc:
      "استقبل إشعارات عند إسناد مهمة إليك أو الإشارة إليك.",
    feedback: "ملاحظات المشرف والموافقات",
    feedbackDesc:
      "استقبل إشعارات عند مراجعة المشرف لعملك.",
    deadlines: "تذكيرات مواعيد التسليم",
    deadlinesDesc:
      "استقبل تذكيرات بمواعيد التسليم القادمة.",
    ai: "تحليلات الذكاء الاصطناعي وتنبيهات الاقتباس",
    aiDesc:
      "استقبل تنبيهات التحليل والتوثيق.",
    languageRegion: "اللغة والمنطقة",
    languageDesc:
      "اختر اللغة والتاريخ المفضلين لديك.",
    systemLanguage: "لغة النظام",
    selectDate: "اختيار التاريخ",
    dateHint:
      "اكتب التاريخ أو اختره من التقويم.",
    english: "الإنجليزية",
    arabic: "العربية",
    security: "الأمان والوصول",
    credential: "إدارة بيانات تسجيل الدخول",
    authentication: "كلمة المرور والمصادقة",
    authenticationDesc:
      "يمكنك إدارة كلمة المرور من صفحة الأمان المخصصة.",
    securityStatus:
      "ستظهر معلومات أمان الحساب عند ربطها.",
    distribution: "توزيع الإشعارات",
    weekly: "أسبوعيًا",
    chartPreview: "معاينة نشاط الإشعارات",
    illustrative: "بيانات توضيحية",
    activeProject: "مشروع التخرج الحالي",
    projectUnavailable: "معلومات المشروع غير متاحة",
    projectDesc:
      "ستظهر تفاصيل المشروع عند ربطها.",
    settingsScope:
      "تنطبق الإعدادات على لوحة التحكم الشخصية.",
    resetDesc:
      "إعادة الضبط ستستعيد الإعدادات الافتراضية.",
    reset: "إعادة ضبط الإعدادات",
    save: "حفظ الإعدادات",
    saving: "جارٍ الحفظ...",
    saved: "تم حفظ الإعدادات بنجاح.",
    saveError: "تعذر حفظ الإعدادات. حاول مرة أخرى.",
    loadError: "تعذر تحميل الإعدادات.",
    loading: "جارٍ تحميل الإعدادات...",
    mon: "الإثنين",
    tue: "الثلاثاء",
    wed: "الأربعاء",
    thu: "الخميس",
    fri: "الجمعة",
    sat: "السبت",
  },
};

function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[#4657C5]" : "bg-[#B8C0E8]"
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
          checked ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
  dark,
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          dark
            ? "bg-[#383B65] text-[#CACBFF]"
            : "bg-[#ECECF7] text-[#4657C5]"
        }`}
      >
        <Icon size={23} />
      </div>

      <div className="min-w-0">
        <h2 className="text-xl font-extrabold sm:text-2xl">
          {title}
        </h2>
        <p
          className={`mt-2 text-sm leading-7 sm:text-base ${
            dark ? "text-[#D4D5E3]" : "text-[#555762]"
          }`}
        >
          {description}
        </p>
      </div>
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
        setSavedSettings(
          JSON.parse(JSON.stringify(normalized))
        );
      } catch {
        if (active) {
          setMessage({
            type: "error",
            key: "loadError",
          });
        }
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
    if (!window.matchMedia) return;

    const media = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const update = () => setSystemDark(media.matches);

    update();
    media.addEventListener?.("change", update);

    return () => {
      media.removeEventListener?.("change", update);
    };
  }, []);

  const language =
    settings?.language === "ar" ? "ar" : "en";

  const t = translations[language];
  const isArabic = language === "ar";

  const isDark =
    settings?.theme === "dark" ||
    (settings?.theme === "system" && systemDark);

  const hasChanges =
    Boolean(settings && savedSettings) &&
    JSON.stringify(settings) !==
      JSON.stringify(savedSettings);

  const card = `min-w-0 rounded-2xl border shadow-sm ${
    isDark
      ? "border-[#393C60] bg-[#242844] text-white"
      : "border-[#ECEBF0] bg-white text-[#17264C]"
  }`;

  const muted = isDark
    ? "text-[#D4D5E3]"
    : "text-[#555762]";

  const soft = isDark
    ? "bg-[#313553]"
    : "bg-[#F5F4F1]";

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
    setSettings(
      JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
    );
    setMessage(null);
  }

  async function handleSave() {
    if (!settings || saving || !hasChanges) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateSettings(settings);

      setSavedSettings(
        JSON.parse(JSON.stringify(settings))
      );

      setMessage({
        type: "success",
        key: "saved",
      });
    } catch {
      setMessage({
        type: "error",
        key: "saveError",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-lg">
        {t.loading}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-lg text-red-600">
        {t.loadError}
      </div>
    );
  }

  const themes = [
    {
      id: "light",
      icon: Sun,
      title: t.lightMode,
      description: t.lightDesc,
    },
    {
      id: "dark",
      icon: Moon,
      title: t.darkMode,
      description: t.darkDesc,
    },
    {
      id: "system",
      icon: Monitor,
      title: t.systemDefault,
      description: t.systemDesc,
    },
  ];

  const notifications = [
    {
      id: "tasks",
      icon: ClipboardList,
      title: t.tasks,
      description: t.tasksDesc,
    },
    {
      id: "feedback",
      icon: MessageSquare,
      title: t.feedback,
      description: t.feedbackDesc,
    },
    {
      id: "deadlines",
      icon: CalendarDays,
      title: t.deadlines,
      description: t.deadlinesDesc,
    },
    {
      id: "ai",
      icon: Sparkles,
      title: t.ai,
      description: t.aiDesc,
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
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
      className={`min-h-screen min-w-0 px-3 py-5 font-sans sm:px-6 sm:py-7 lg:px-8 ${
        isDark ? "bg-[#191D36]" : "bg-[#FAF9F7]"
      }`}
    >
      <div className="mx-auto max-w-[1280px] space-y-6">
        {/* Page Header */}
        <header
          className={`${card} flex flex-wrap items-center justify-between gap-5 p-4 sm:p-6`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E9E9FA] text-[#4657C5]">
              <SettingsIcon size={25} />
            </div>

            <div className="min-w-0">
              <p className={`text-xs font-bold sm:text-sm ${muted}`}>
                {t.workspace}
                <span className="text-[#4657C5]">
                  {" · "}2024/2025
                </span>
              </p>

              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                {t.settings}
              </h1>
            </div>
          </div>

          <Link
            to="/profile/change-password"
            className={`flex min-w-0 items-center gap-3 rounded-xl p-3 no-underline ${soft}`}
          >
            <Lock
              size={21}
              className="shrink-0 text-[#4657C5]"
            />

            <div className="min-w-0">
              <p className={`text-sm ${muted}`}>
                {t.passwordHelp}
              </p>

              <p className="mt-1 text-sm font-extrabold text-[#4657C5] sm:text-base">
                {t.changePassword}
              </p>
            </div>
          </Link>
        </header>

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(290px,1fr)]">
          {/* Main Settings */}
          <div className="min-w-0 space-y-6">
            {/* Appearance */}
            <section className={`${card} p-4 sm:p-6`}>
              <SectionHeading
                icon={Sun}
                title={t.appearance}
                description={t.appearanceDesc}
                dark={isDark}
              />

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  const selected =
                    settings.theme === theme.id;

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        changeField("theme", theme.id)
                      }
                      className={`min-w-0 rounded-xl border p-4 text-start transition-all ${
                        isDark
                          ? "border-[#3F4365] bg-[#313553]"
                          : "border-[#ECEBF0] bg-[#F5F4F1]"
                      } ${
                        selected
                          ? "ring-2 ring-[#4657C5]"
                          : "hover:border-[#A8AAE0]"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#4657C5]">
                          <Icon size={21} />
                        </div>

                        {selected && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4657C5] text-white">
                            <Check size={18} />
                          </div>
                        )}
                      </div>

                      <div
                        className={`mb-4 h-20 rounded-lg p-3 ${
                          theme.id === "dark"
                            ? "bg-[#1C224A]"
                            : "bg-white"
                        }`}
                      >
                        <div className="h-2 w-1/2 rounded-full bg-[#D0D3DC]" />
                        <div className="mt-4 h-2 w-3/4 rounded-full bg-[#D0D3DC]" />
                        <div className="mt-2 h-2 w-1/2 rounded-full bg-[#D0D3DC]" />
                      </div>

                      <h3 className="text-base font-extrabold sm:text-lg">
                        {theme.title}
                      </h3>

                      <p className={`mt-2 text-sm leading-6 ${muted}`}>
                        {theme.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Notifications */}
            <section className={`${card} p-4 sm:p-6`}>
              <SectionHeading
                icon={Bell}
                title={t.notifications}
                description={t.notificationsDesc}
                dark={isDark}
              />

              <div
                className={`mt-6 flex items-start gap-3 rounded-xl p-4 sm:gap-4 sm:p-5 ${soft}`}
              >
                <Laptop
                  size={24}
                  className="mt-1 shrink-0 text-[#4657C5]"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold sm:text-lg">
                    {t.desktopNotifications}
                  </h3>

                  <p className={`mt-2 text-sm leading-6 ${muted}`}>
                    {t.desktopDesc}
                  </p>
                </div>

                <Toggle
                  label={t.desktopNotifications}
                  checked={settings.notificationsEnabled}
                  onChange={(value) =>
                    changeField(
                      "notificationsEnabled",
                      value
                    )
                  }
                />
              </div>

              <div className="mt-3">
                {notifications.map((notification) => {
                  const Icon = notification.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 border-b py-5 last:border-b-0 sm:gap-4 ${
                        isDark
                          ? "border-[#3B3E60]"
                          : "border-[#E6E5EF]"
                      }`}
                    >
                      <Icon
                        size={22}
                        className="mt-1 shrink-0 text-[#4657C5]"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold sm:text-lg">
                          {notification.title}
                        </h3>

                        <p className={`mt-2 text-sm leading-6 ${muted}`}>
                          {notification.description}
                        </p>
                      </div>

                      <Toggle
                        label={notification.title}
                        checked={Boolean(
                          settings.notificationPreferences[
                            notification.id
                          ]
                        )}
                        disabled={
                          !settings.notificationsEnabled
                        }
                        onChange={(value) =>
                          changeNotification(
                            notification.id,
                            value
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Language and Date */}
            <section className={`${card} p-4 sm:p-6`}>
              <SectionHeading
                icon={Globe}
                title={t.languageRegion}
                description={t.languageDesc}
                dark={isDark}
              />

              <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="min-w-0">
                  <label
                    htmlFor="settings-language"
                    className="mb-3 block text-base font-bold sm:text-lg"
                  >
                    {t.systemLanguage}
                  </label>

                  <select
                    id="settings-language"
                    value={settings.language}
                    onChange={(event) =>
                      changeField(
                        "language",
                        event.target.value
                      )
                    }
                    className={`min-h-[56px] w-full min-w-0 rounded-lg border px-3 py-3 text-base ${
                      isDark
                        ? "border-[#4A4E70] bg-[#313553] text-white"
                        : "border-[#DCDDE8] bg-white text-[#17264C]"
                    }`}
                  >
                    <option value="en">
                      {t.english}
                    </option>
                    <option value="ar">
                      {t.arabic}
                    </option>
                  </select>
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="settings-date"
                    className="mb-3 block text-base font-bold sm:text-lg"
                  >
                    {t.selectDate}
                  </label>

                  <input
                    id="settings-date"
                    type="date"
                    value={settings.selectedDate || ""}
                    onChange={(event) =>
                      changeField(
                        "selectedDate",
                        event.target.value
                      )
                    }
                    className={`min-h-[56px] w-full min-w-0 rounded-lg border px-3 py-3 text-base ${
                      isDark
                        ? "border-[#4A4E70] bg-[#313553] text-white [color-scheme:dark]"
                        : "border-[#DCDDE8] bg-white text-[#17264C] [color-scheme:light]"
                    }`}
                  />

                  <p className={`mt-3 text-sm leading-6 ${muted}`}>
                    {t.dateHint}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="min-w-0 space-y-6">
            {/* Security */}
            <section className={`${card} p-4 sm:p-5`}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECECF7] text-[#4657C5]">
                  <ShieldCheck size={24} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-extrabold sm:text-xl">
                    {t.security}
                  </h2>

                  <p className={`text-sm ${muted}`}>
                    {t.credential}
                  </p>
                </div>
              </div>

              <div className={`mt-5 rounded-xl p-4 ${soft}`}>
                <div className="flex items-center gap-2">
                  <Lock
                    size={21}
                    className="shrink-0 text-[#4657C5]"
                  />

                  <h3 className="text-base font-extrabold">
                    {t.authentication}
                  </h3>
                </div>

                <p className={`mt-4 text-sm leading-7 ${muted}`}>
                  {t.authenticationDesc}
                </p>

                <Link
                  to="/profile/change-password"
                  className={`mt-5 block rounded-lg px-3 py-3 text-center text-sm font-bold no-underline ${
                    isDark
                      ? "bg-[#41456A] text-white"
                      : "bg-white text-[#17264C]"
                  }`}
                >
                  {t.changePassword}
                </Link>
              </div>

              <p className={`mt-5 text-sm leading-6 ${muted}`}>
                {t.securityStatus}
              </p>
            </section>

            {/* Notification Chart */}
            <section className={`${card} p-4 sm:p-6`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold sm:text-xl">
                  {t.distribution}
                </h2>

                <span className="text-sm font-bold text-[#4657C5]">
                  {t.weekly}
                </span>
              </div>

              <div className={`mt-6 rounded-lg p-4 ${soft}`}>
                <div className="flex h-[130px] items-end justify-between gap-2">
                  {chartValues.map((height, index) => (
                    <div
                      key={index}
                      className="flex h-full min-w-0 flex-1 items-end"
                    >
                      <div
                        className={`w-full rounded-t ${
                          index === 2
                            ? "bg-[#4657C5]"
                            : "bg-[#DADCF5]"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between gap-1">
                  {chartDays.map((day, index) => (
                    <span
                      key={index}
                      className={`min-w-0 flex-1 text-center text-[10px] sm:text-xs ${
                        index === 2
                          ? "font-extrabold text-[#4657C5]"
                          : muted
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className={`text-sm ${muted}`}>
                  {t.chartPreview}
                </span>

                <span className="text-xs font-bold text-[#4657C5]">
                  {t.illustrative}
                </span>
              </div>
            </section>

            {/* Project */}
            <section className={`${card} overflow-hidden`}>
              <div className="relative flex h-[150px] items-end overflow-hidden bg-gradient-to-br from-[#575B93] via-[#353A73] to-[#23294E] p-5">
                <GraduationCap
                  size={85}
                  className="absolute end-5 top-5 text-white/20"
                />

                <span className="relative rounded-md bg-white/20 px-3 py-2 text-sm font-bold text-white">
                  {t.activeProject}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-extrabold">
                  {t.projectUnavailable}
                </h3>

                <p className={`mt-3 text-sm leading-7 ${muted}`}>
                  {t.projectDesc}
                </p>

                <div className="mt-5 flex items-start gap-3 text-[#4657C5]">
                  <Info size={20} className="mt-1 shrink-0" />

                  <p className="text-sm leading-6">
                    {t.settingsScope}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Save and Reset */}
        <footer
          className={`${card} flex flex-wrap items-center justify-between gap-5 p-4 sm:p-6`}
        >
          <div className="flex min-w-0 max-w-[700px] items-start gap-3">
            <Info
              size={22}
              className="mt-1 shrink-0 text-[#4657C5]"
            />

            <p className={`text-sm leading-7 sm:text-base ${muted}`}>
              {t.resetDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className={`rounded-lg px-4 py-3 text-sm font-bold disabled:opacity-50 sm:text-base ${
                isDark ? "text-white" : "text-[#17264C]"
              }`}
            >
              {t.reset}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 rounded-lg bg-[#4657C5] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3546AC] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
            >
              <Check size={19} />
              {saving ? t.saving : t.save}
            </button>
          </div>
        </footer>

        {message && (
          <p
            role="status"
            className={`rounded-lg px-5 py-4 text-sm font-semibold ${
              message.type === "error"
                ? "bg-[#FCE8E8] text-[#A12E2E]"
                : "bg-[#ECECFB] text-[#3546AC]"
            }`}
          >
            {t[message.key]}
          </p>
        )}
      </div>
    </div>
  );
}
