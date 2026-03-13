export type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "revenew-theme";

const isThemePreference = (value: string): value is ThemePreference => {
  return value === "light" || value === "dark" || value === "system";
};

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const getThemePreference = (): ThemePreference => {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme && isThemePreference(storedTheme)) {
    return storedTheme;
  }

  return "system";
};

export const applyTheme = (
  preference: ThemePreference = getThemePreference(),
) => {
  const resolvedTheme = preference === "system" ? getSystemTheme() : preference;
  const isDark = resolvedTheme === "dark";

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = resolvedTheme;
};

export const setThemePreference = (preference: ThemePreference) => {
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyTheme(preference);
};

export const initializeTheme = () => {
  applyTheme();

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleSystemThemeChange = () => {
    if (getThemePreference() === "system") {
      applyTheme("system");
    }
  };

  mediaQuery.addEventListener("change", handleSystemThemeChange);

  return () => {
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };
};
