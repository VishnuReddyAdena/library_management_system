import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

/**
 * GlassSelect — fully styleable dark-glass dropdown.
 * Uses a portal so it's never clipped by parent overflow containers.
 *
 * Props:
 *   value       : current selected value (string)
 *   onChange    : (value: string) => void
 *   options     : string[] | { label: string, value: string }[]
 *   placeholder : string (optional)
 *   className   : extra classes for the trigger wrapper (optional)
 */
export default function GlassSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  className = '',
}) {
  const [open, setOpen]     = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef          = useRef(null);

  // Normalise options → { label, value }
  const items   = options.map(o => (typeof o === 'string' ? { label: o, value: o } : o));
  const current = items.find(i => i.value === value);

  // Recalculate position every time we open
  const openDropdown = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({
        top:   r.bottom + 6,
        left:  r.left,
        width: r.width,
      });
    }
    setOpen(true);
  };

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const select = (v) => { onChange(v); setOpen(false); };

  return (
    <>
      {/* Trigger button */}
      <div ref={triggerRef} className={`relative ${className}`}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            open ? setOpen(false) : openDropdown();
          }}
          className={`
            w-full flex items-center justify-between gap-2
            px-4 py-2.5 rounded-xl text-sm font-medium
            bg-slate-900/80 border text-slate-200
            backdrop-blur-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40
            ${open
              ? 'border-indigo-500/60 bg-slate-800/90 ring-2 ring-indigo-500/20'
              : 'border-white/10 hover:border-white/20 hover:bg-slate-800/70'}
          `}
        >
          <span className={current ? 'text-slate-200' : 'text-slate-500'}>
            {current?.label ?? placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200
              ${open ? 'rotate-180 text-indigo-400' : ''}`}
          />
        </button>
      </div>

      {/* Portal glass panel — renders at document.body level */}
      {open && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position:  'fixed',
            top:       coords.top,
            left:      coords.left,
            width:     coords.width,
            zIndex:    9999,
            animation: 'glassDropIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
          className="
            rounded-2xl overflow-hidden py-1
            bg-slate-900/80 backdrop-blur-2xl
            border border-white/10
            shadow-2xl shadow-black/60
            ring-1 ring-white/5
          "
        >
          {items.map(item => {
            const isSelected = item.value === value;
            return (
              <button
                key={item.value}
                type="button"
                onMouseDown={e => { e.stopPropagation(); select(item.value); }}
                className={`
                  w-full text-left px-4 py-2.5 text-sm transition-colors duration-100
                  ${isSelected
                    ? 'text-indigo-300 bg-indigo-500/15 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/8'}
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
