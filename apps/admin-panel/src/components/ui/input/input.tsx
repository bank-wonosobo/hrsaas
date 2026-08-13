"use client";

import clsx from "clsx";
import { forwardRef, useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  prefix?: string;
  error?: string;
  containerClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const hasInputValue = (value: React.InputHTMLAttributes<HTMLInputElement>["value"]) =>
  value !== undefined && value !== null && value !== "";

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      prefix,
      error,
      containerClassName,
      className,
      disabled,
      readOnly,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      hasInputValue(value) || hasInputValue(defaultValue),
    );

    const isActive = isFocused || hasValue;

    useEffect(() => {
      const currentValue = inputRef.current?.value;
      setHasValue(
        hasInputValue(value) ||
          hasInputValue(defaultValue) ||
          hasInputValue(currentValue),
      );
    }, [defaultValue, value]);

    return (
      <div className="space-y-0.5">
        <div className={clsx("relative w-full", containerClassName)}>
          {/* Wrapper */}
          <div
            className={clsx(
              "flex items-center rounded-xl border px-4 pt-6 pb-1.5 transition-all",
              disabled && "bg-gray-100 cursor-not-allowed",
              error
                ? "border-red-500"
                : isFocused
                  ? "border-black"
                  : "border-gray-300",
            )}
          >
            {/* Prefix */}
            {prefix && isActive && (
              <span className="mr-2 text-gray-500">{prefix}</span>
            )}

            {/* Input */}
            <input
              ref={(node) => {
                inputRef.current = node;

                if (typeof ref === "function") {
                  ref(node);
                  return;
                }

                if (ref) {
                  ref.current = node;
                }
              }}
              disabled={disabled}
              readOnly={readOnly}
              value={value}
              defaultValue={defaultValue}
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                setHasValue(hasInputValue(e.target.value));
                onBlur?.(e);
              }}
              onChange={(e) => {
                setHasValue(hasInputValue(e.target.value));
                onChange?.(e);
              }}
              className={clsx(
                "w-full bg-transparent outline-none text-sm",
                "disabled:bg-transparent",
                className,
              )}
              {...props}
            />
          </div>

          {/* Label */}
          <label
            className="pointer-events-none absolute left-4 top-2 text-xs text-gray-500"
          >
            {label}
          </label>
        </div>
        {/* Error */}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
