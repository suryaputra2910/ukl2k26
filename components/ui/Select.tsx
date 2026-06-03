'use client';
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}
interface SelectOption { value: string; label: string; }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options: SelectOption[]; placeholder?: string; className?: string;
}
export default function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-black mb-1">{label}</label>}
      <select id={selectId} className={cn(
        'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white',
        error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
        className
      )} {...props}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}