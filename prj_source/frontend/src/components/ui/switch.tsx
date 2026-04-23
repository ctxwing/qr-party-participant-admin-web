'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
  label?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, label, ...props }, ref) => {
    return (
      <label className={cn("relative inline-flex items-center cursor-pointer group", className)}>
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => {
            e.stopPropagation()
            onCheckedChange?.(e.target.checked)
          }}
          onClick={(e) => e.stopPropagation()}
          ref={ref}
          {...props}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out border ${
            checked ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-gradient-to-r from-sos to-purple-600 border-transparent'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transform transition duration-200 ease-in-out mt-0.5 ml-0.5 ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
        {label && (
          <span className={`text-xs font-bold ${checked ? 'text-emerald-400/60' : 'text-sos animate-pulse'}`}>
            {label}
          </span>
        )}
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
