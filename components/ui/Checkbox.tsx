"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "children"
> & {
  label: ReactNode;
  description?: string;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      id,
      label,
      description,
      error,
      className = "",
      disabled,
      required,
      ...props
    },
    ref,
  ) {
    const reactId = useId();
    const checkboxId = id ?? `checkbox-${reactId}`;

    const descriptionId = error
      ? `${checkboxId}-error`
      : description
        ? `${checkboxId}-description`
        : undefined;

    return (
      <div className={className}>
        <label
          htmlFor={checkboxId}
          className={[
            "group flex items-start gap-3",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          ].join(" ")}
        >
          <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              disabled={disabled}
              required={required}
              aria-invalid={Boolean(error)}
              aria-describedby={descriptionId}
              className="peer h-5 w-5 appearance-none rounded-md border border-slate-300 bg-white transition-colors checked:border-brand-950 checked:bg-brand-950 hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              {...props}
            />

            <Check
              size={14}
              strokeWidth={3}
              className="pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100"
              aria-hidden="true"
            />
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-semibold text-brand-950">
              {label}

              {required && (
                <span className="ml-1 text-red-600" aria-hidden="true">
                  *
                </span>
              )}
            </span>

            {description && !error && (
              <span
                id={`${checkboxId}-description`}
                className="mt-1 block text-sm leading-5 text-slate-500"
              >
                {description}
              </span>
            )}

            {error && (
              <span
                id={`${checkboxId}-error`}
                className="mt-1 block text-sm font-medium text-red-600"
              >
                {error}
              </span>
            )}
          </span>
        </label>
      </div>
    );
  },
);