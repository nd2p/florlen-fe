'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type TableColumn<T> = {
    key: keyof T;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render?: (value: any, row: T) => React.ReactNode;
    align?: 'left' | 'right' | 'center';
};

export type TableAction<T> = {
    label: string | ((row: T) => string);
    icon: React.ReactNode | ((row: T) => React.ReactNode);
    onClick: (row: T) => void;
    className?: string | ((row: T) => string);
};

export type DataTableProps<T> = {
    columns: TableColumn<T>[];
    data: T[];
    actions?: TableAction<T>[];
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    searchableFields?: (keyof T)[];
    filterOptions?: {
        label: string;
        options: { value: string | null; label: string }[];
        onFilter: (value: string | null) => void;
    };
    itemsPerPage?: number;
};

export default function DataTable<T extends { id: string }>({
    columns,
    data,
    actions,
    searchPlaceholder = 'Search...',
    onSearch,
    searchableFields = [],
    filterOptions,
    itemsPerPage = 10,
}: DataTableProps<T>) {
    const { t } = useTranslation('common');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemsPerPageValue, setItemsPerPageValue] = useState(itemsPerPage);
    const [selectedFilterValue, setSelectedFilterValue] = useState<string | null>(null);
    const actualPlaceholder = searchPlaceholder || t('adminDataTable.search');

    const filteredData = data.filter((item) => {
        if (!searchTerm || searchableFields.length === 0) return true;
        return searchableFields.some((field) => {
            const value = item[field];
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPageValue);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPageValue,
        currentPage * itemsPerPageValue
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
        onSearch?.(value);
    };

    const selectedFilterLabel =
        filterOptions?.options.find((opt) => (opt.value ?? null) === selectedFilterValue)?.label ||
        filterOptions?.label;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block flex-1">
                    <IconSearch
                        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary"
                        stroke={2}
                    />
                    <Input
                        type="search"
                        aria-label={actualPlaceholder}
                        placeholder={actualPlaceholder}
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="h-14 rounded-full bg-surface-container-highest pl-12 pr-5 text-sm text-on-surface placeholder:text-secondary/70"
                    />
                </label>

                {filterOptions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="rounded-full bg-surface-container-high px-4 py-3 text-sm hover:bg-surface-container-highest"
                            >
                                <IconChevronDown className="h-4 w-4 text-secondary" stroke={2} />
                                <span className="text-on-surface">{selectedFilterLabel}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface-container-low border-surface-container-high">
                            {filterOptions.options.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value ?? 'all'}
                                    onClick={() => {
                                        const nextValue = opt.value ?? null;
                                        setSelectedFilterValue(nextValue);
                                        setCurrentPage(1);
                                        filterOptions.onFilter(nextValue);
                                    }}
                                    className="cursor-pointer text-on-surface hover:bg-surface-container-high"
                                >
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="overflow-x-auto rounded-[1.5rem] bg-surface-container-low shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-surface-container-high">
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-6 py-5 text-sm font-semibold text-secondary ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                                        }`}
                                >
                                    {column.label}
                                </th>
                            ))}
                            {actions && actions.length > 0 && (
                                <th className="px-6 py-5 text-right text-sm font-semibold text-secondary">{t('adminDataTable.actions')}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={row.id}
                                    className={`transition-colors ${index !== paginatedData.length - 1 ? 'border-b border-surface-container-high' : ''
                                        } hover:bg-surface-container-highest`}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={`px-6 py-5 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                                                }`}
                                        >
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : String(row[column.key])}
                                        </td>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions.map((action, idx) => (
                                                    (() => {
                                                        const resolvedLabel =
                                                            typeof action.label === 'function'
                                                                ? action.label(row)
                                                                : action.label;
                                                        const resolvedIcon =
                                                            typeof action.icon === 'function'
                                                                ? action.icon(row)
                                                                : action.icon;
                                                        const resolvedClassName =
                                                            typeof action.className === 'function'
                                                                ? action.className(row)
                                                                : action.className;

                                                        return (
                                                            <Button
                                                                key={idx}
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => action.onClick(row)}
                                                                className={
                                                                    resolvedClassName ||
                                                                    'h-9 w-9 rounded-full bg-surface-container-high px-0 py-0 text-secondary hover:bg-surface-container-highest hover:text-primary'
                                                                }
                                                                aria-label={resolvedLabel}
                                                            >
                                                                {resolvedIcon}
                                                            </Button>
                                                        );
                                                    })()
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="px-6 py-12 text-center"
                                >
                                    <p className="text-secondary">{t('adminDataTable.noData')}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between rounded-[1.5rem] bg-surface-container-low p-4 shadow-[0_22px_50px_-40px_rgba(27,28,28,0.28)]">
                <div className="flex items-center gap-3">
                    <p className="text-sm text-secondary">
                        {t('adminDataTable.pagination', { page: currentPage, total: totalPages, count: filteredData.length })}
                    </p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="rounded-full bg-surface-container-high px-3 py-1.5 text-xs font-medium text-secondary hover:bg-surface-container-highest"
                            >
                                {t('adminDataTable.show')} <span className="font-semibold text-on-surface">{itemsPerPageValue}</span>
                                <IconChevronDown className="h-4 w-4" stroke={2} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-surface-container-low border-surface-container-high">
                            {[3, 5, 10, 20].map((value) => (
                                <DropdownMenuItem
                                    key={value}
                                    onClick={() => {
                                        setItemsPerPageValue(value);
                                        setCurrentPage(1);
                                    }}
                                    className="cursor-pointer text-on-surface hover:bg-surface-container-high"
                                >
                                    {value}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-10 w-10 rounded-full bg-surface-container-high px-0 py-0 text-on-surface hover:bg-surface-container-highest disabled:cursor-not-allowed"
                        aria-label={t('adminDataTable.previous')}
                    >
                        ←
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 rounded-full bg-surface-container-high px-0 py-0 text-on-surface hover:bg-surface-container-highest disabled:cursor-not-allowed"
                        aria-label={t('adminDataTable.next')}
                    >
                        →
                    </Button>
                </div>
            </div>
        </div>
    );
}
