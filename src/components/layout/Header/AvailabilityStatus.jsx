import React from 'react'

/**
 * Status indicator dot with pulse animation and status label
 */
export default function AvailabilityStatus({
  text = 'AVAILABLE FOR WORK',
  className = '',
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200/80 bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-900/60 text-[11px] font-medium tracking-wider text-text-body select-none ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="whitespace-nowrap">{text}</span>
    </div>
  )
}

