import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

function CInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      <div className="absolute right-0 top-0 w-12 h-12 bg-violet-400 rounded-full blur-lg opacity-60 pointer-events-none z-[-1]" />
      <div className="absolute right-12 top-3 w-20 h-20 bg-rose-300 rounded-full blur-2xl opacity-50 pointer-events-none z-[-1]" />

      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-red-500/60 selection:bg-primary selection:text-primary-foreground",
          "flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-xs backdrop-blur-md transition-all",
          "focus-visible:ring-2 focus-visible:ring-violet-400/50",
          "outline-none placeholder-opacity-60 text-foreground",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input, CInput }
