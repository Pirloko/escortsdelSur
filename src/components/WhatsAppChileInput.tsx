/**
 * Input de WhatsApp con prefijo "+569" fijo (solo números celulares chilenos).
 * El usuario solo escribe los 8 dígitos restantes.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

const PREFIX = "+569";
const MAX_DIGITS = 8;

function getSuffix(fullValue: string | null | undefined): string {
  if (!fullValue || typeof fullValue !== "string") return "";
  const digits = fullValue.replace(/\D/g, "");
  if (digits.startsWith("569") && digits.length >= 3) return digits.slice(3, 3 + MAX_DIGITS);
  if (digits.startsWith("9") && digits.length >= 1) return digits.slice(1, 1 + MAX_DIGITS);
  return digits.slice(0, MAX_DIGITS);
}

export interface WhatsAppChileInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange"> {
  value: string;
  onChange: (fullValue: string) => void;
}

export const WhatsAppChileInput = React.forwardRef<HTMLInputElement, WhatsAppChileInputProps>(
  ({ value, onChange, className, required, ...props }, ref) => {
    const suffix = getSuffix(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS);
      onChange(raw.length > 0 ? `${PREFIX}${raw}` : "");
    };

    return (
      <div className={cn("flex h-10 w-full rounded-md border border-input bg-surface overflow-hidden", className)}>
        <span className="flex items-center px-3 py-2 text-sm text-muted-foreground border-r border-input bg-muted/50 shrink-0">
          {PREFIX}
        </span>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={MAX_DIGITS}
          value={suffix}
          onChange={handleChange}
          placeholder="12345678"
          required={required}
          className="flex-1 min-w-0 px-3 py-2 text-sm bg-transparent border-0 focus-visible:outline-none focus-visible:ring-0"
          {...props}
        />
      </div>
    );
  }
);
WhatsAppChileInput.displayName = "WhatsAppChileInput";
