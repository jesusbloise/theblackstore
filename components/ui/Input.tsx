import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      id,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = "",
      disabled,
      required,
      ...props
    },
    ref,
  ) {
    const generatedId =
      id ?? `input-${props.name ?? props.type ?? "field"}`;

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

          <input
            ref={ref}
            id={generatedId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={descriptionId}
            className={[
              "min-h-12 w-full rounded-xl border bg-white px-4 text-base text-brand-950",
              "placeholder:text-slate-400",
              "transition-colors duration-200",
              "focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-300",
              "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
              error
                ? "border-red-500 focus:border-red-600 focus:ring-red-200"
                : "border-slate-300 hover:border-brand-400",
              leftIcon ? "pl-11" : "",
              rightIcon ? "pr-11" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">
              {rightIcon}
            </div>
          )}
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