'use client';

import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { t, i18n } = useTranslation('common');
  const activeLanguage = i18n.resolvedLanguage?.startsWith('vi') ? 'vi' : 'en';

  const handleLanguageChange = (value: string) => {
    if (value !== activeLanguage) {
      void i18n.changeLanguage(value);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-surface/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-xl"></label>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          {/* Localization Language Switcher Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-11 px-4 items-center justify-center rounded-full bg-surface-container-highest text-sm font-bold uppercase tracking-wider text-primary transition-all duration-200 hover:bg-surface-container-high active:scale-95 cursor-pointer shrink-0 border border-primary/10"
                aria-label={t('header.language.label')}
              >
                {activeLanguage.toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-surface-container-low border border-surface-container-high text-on-surface shadow-2xl rounded-2xl p-2 z-[60]"
            >
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-secondary px-3 py-2">
                {t('header.language.label')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-surface-container-high my-1" />
              <DropdownMenuRadioGroup value={activeLanguage} onValueChange={handleLanguageChange}>
                <DropdownMenuRadioItem
                  value="en"
                  className="cursor-pointer rounded-lg text-sm text-on-surface py-2 hover:bg-surface-container-high focus:bg-surface-container-high focus:text-on-surface"
                >
                  {t('header.language.en')}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="vi"
                  className="cursor-pointer rounded-lg text-sm text-on-surface py-2 hover:bg-surface-container-high focus:bg-surface-container-high focus:text-on-surface"
                >
                  {t('header.language.vi')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="flex items-center gap-3 rounded-full bg-surface-container-highest px-2 py-2 pr-4 text-left transition-colors hover:bg-surface-container-high">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-secondary">{t('adminHeader.loggedInAs')}</p>
              <p className="text-sm font-bold text-on-surface">{t('adminHeader.adminRole')}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
