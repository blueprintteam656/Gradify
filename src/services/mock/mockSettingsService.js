
import settingsData from '../../mocks/data/settings.json';

const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEY = 'gradify-demo-settings';

function getDefaultSettings() {
  return structuredClone(settingsData);
}

function readStoredSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return getDefaultSettings();
    }

    const parsed = JSON.parse(stored);

    return {
      ...getDefaultSettings(),
      ...parsed,
      notificationPreferences: {
        ...settingsData.notificationPreferences,
        ...(parsed.notificationPreferences || {}),
      },
    };
  } catch {
    return getDefaultSettings();
  }
}

export async function getSettings() {
  await delay();
  return readStoredSettings();
}

export async function updateSettings(settings) {
  await delay();

  const updated = structuredClone(settings);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updated;
}

export async function resetSettings() {
  await delay();

  localStorage.removeItem(STORAGE_KEY);

  return getDefaultSettings();
}
