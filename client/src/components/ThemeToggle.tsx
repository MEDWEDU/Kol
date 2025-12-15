import { useThemeStore } from '../stores/themeStore';
import { Button } from '../ui/Button';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={toggleTheme}
      className="px-3"
      aria-label="Toggle dark/light theme"
    >
      {theme === 'dark' ? 'Dark' : 'Light'}
    </Button>
  );
}
