import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-xl border border-mj-line bg-white px-4 text-sm text-mj-ink",
          "placeholder:text-mj-mute/70",
          "focus:border-mj-gold-500 focus:outline-none focus:ring-2 focus:ring-mj-gold-300/50",
          "transition-colors",
          className,
        )}
        {...props}
      />
    );
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full rounded-xl border border-mj-line bg-white p-4 text-sm text-mj-ink",
          "placeholder:text-mj-mute/70",
          "focus:border-mj-gold-500 focus:outline-none focus:ring-2 focus:ring-mj-gold-300/50",
          "transition-colors",
          className,
        )}
        {...props}
      />
    );
  },
);

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium uppercase tracking-wider text-mj-mute mb-1.5", className)}
      {...props}
    />
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-mj-maroon-700">{message}</p>;
}
