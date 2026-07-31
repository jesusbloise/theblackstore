import {
  forwardRef,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      id,
      label,
      error,
      helperText,
      fullWidth = true,
      leftIcon,
      className = "",
      disabled,
      required,
      children,
      ...props
    },
    ref,
  ) {
    const generatedId = id ?? `select-${props.name ?? "field"}`;

    const descriptionId = error
      ? `${generatedId}-error`
      : helperText
        ? `${generatedId}-helper`
        : undefined;

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            htmlFor={generatedId}
            className="mb-2 block text-sm font-bold text-brand-950"
          >
            {label}

            {required && (
              <span className="ml-1 text-red-600" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            id={generatedId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={descriptionId}
            className={[
              "min-h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-11 text-base text-brand-950",
              "transition-colors duration-200",
              "focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-300",
              "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
              error
                ? "border-red-500 focus:border-red-600 focus:ring-red-200"
                : "border-slate-300 hover:border-brand-400",
              leftIcon ? "pl-11" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          >
            {children}
          </select>

          <div
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500"
            aria-hidden="true"
          >
            <ChevronDown size={18} />
          </div>
        </div>

        {error ? (
          <p
            id={`${generatedId}-error`}
            className="mt-2 text-sm font-medium text-red-600"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={`${generatedId}-helper`}
            className="mt-2 text-sm text-slate-500"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);