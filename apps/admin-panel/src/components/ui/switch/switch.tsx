import clsx from "clsx";
import { forwardRef } from "react";

export type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
};

const Switch = forwardRef<HTMLButtonElement, Props>(
  (
    { checked, onChange, disabled = false, label, description, className },
    ref,
  ) => {
    return (
      <div
        className={clsx("flex items-start justify-between gap-4", className)}
      >
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-gray-900">{label}</span>
            )}
            {description && (
              <span className="text-sm text-gray-500">{description}</span>
            )}
          </div>
        )}

        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => {
            if (!disabled) onChange(!checked);
          }}
          className={clsx(
            "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition duration-300 ease-in-out",
            checked ? "bg-black" : "bg-gray-300",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <span
            className={clsx(
              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
      </div>
    );
  },
);

Switch.displayName = "Switch";

export default Switch;

// ================= USAGE =================

/*
import { useState } from "react";
import Switch from "@/components/ui/switch";

export default function Example() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="p-6">
      <Switch
        checked={enabled}
        onChange={setEnabled}
        label="Enable feature"
        description="Turn this on to activate the feature"
      />
    </div>
  );
}
*/
