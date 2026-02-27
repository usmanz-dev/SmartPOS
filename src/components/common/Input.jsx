import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
    {error && <p className="text-accent-red text-[11px] mt-1 font-body">{error}</p>}
  </div>
));

export const Select = forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={`input ${error ? 'input-error' : ''} ${className}`} {...props}>{children}</select>
    {error && <p className="text-accent-red text-[11px] mt-1 font-body">{error}</p>}
  </div>
));

export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <textarea ref={ref} className={`input resize-none ${error ? 'input-error' : ''} ${className}`} {...props} />
    {error && <p className="text-accent-red text-[11px] mt-1 font-body">{error}</p>}
  </div>
));

Input.displayName = 'Input';
Select.displayName = 'Select';
Textarea.displayName = 'Textarea';
export default Input;
