import { Sun, Moon } from 'lucide-react';

interface ThemeToggleButtonProps {
    darkMode: boolean;
    toggleTheme: () => void;
}

export default function ThemeToggleButton({
                                              darkMode,
                                              toggleTheme,
                                          }: ThemeToggleButtonProps) {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            type="button"
        >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}