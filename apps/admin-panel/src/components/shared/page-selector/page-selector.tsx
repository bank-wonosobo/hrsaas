import Select from "@/components/ui/select/select";

interface PageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: number[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export function PageSelector({
  value,
  onValueChange,
  options = [5, 10, 25, 50, 100],
  label = "Rows per page",
  placeholder = "Select",
  className,
}: PageSelectorProps) {
  return (
    <div className="flex items-center gap-3 text-sm justify-center text-gray-600 ">
      {/* LABEL */}
      <span className="whitespace-nowrap">{label}</span>

      <div className="w-30">
        <Select
          value={value}
          onChange={onValueChange}
          className={className}
          label="Total data"
          options={options.map((num) => ({
            label: num.toString(),
            value: num.toString(),
          }))}
        />
      </div>
    </div>
  );
}
