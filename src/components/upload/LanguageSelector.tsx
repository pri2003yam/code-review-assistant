'use client';

import { ProgrammingLanguage } from '@/types';
import { getLanguageDisplayName } from '@/lib/utils';

interface LanguageSelectorProps {
  value: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  value,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  const languages = Object.values(ProgrammingLanguage);

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium text-gray-700 block">Programming Language</label>
      <select
        value={value}
        onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
        disabled={disabled}
        className="w-full h-12 px-4 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 cursor-pointer hover:border-blue-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 appearance-none bg-no-repeat bg-right pr-10"
        style={{
          backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
          backgroundPosition: "right 12px center"
        }}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {getLanguageDisplayName(lang)}
          </option>
        ))}
      </select>
    </div>
  );
}
