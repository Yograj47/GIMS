import { type ChangeEvent } from 'react';

export interface InputGroupProps {
    label: string;
    disabled?: boolean;
    value: string | number;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function InputGroup({ label, disabled, value, onChange }: InputGroupProps) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>
            <input
                type="text"
                disabled={disabled}
                value={value}
                onChange={onChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-500 outline-none transition-all disabled:opacity-60"
            />
        </div>
    );
}