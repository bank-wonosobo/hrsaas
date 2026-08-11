"use client";

import Button from "@/components/ui/button/button";
import Input from "@/components/ui/input/input";
import InputDate from "@/components/ui/input/input-date";
import Select, { Option } from "@/components/ui/select/select";
import { formatDate } from "@/lib/utils";
import { PenLine } from "lucide-react";
import { useEffect, useState } from "react";

type BaseProps = {
  label: string;
  value?: string;
  placeholder?: string;
  hint?: string;
  onSave?: (value: string) => void;
};

type TextProps = BaseProps & { type?: "text" };

type DateProps = BaseProps & {
  type: "date";
  dateValue?: Date;
};

type SelectProps = BaseProps & {
  type: "select";
  options: Option[];
};

type Props = TextProps | DateProps | SelectProps;

export default function EditableField(props: Props) {
  const { label, value = "", placeholder, hint, onSave } = props;

  const [isEdit, setIsEdit] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [localDate, setLocalDate] = useState<Date | undefined>(
    props.type === "date" ? props.dateValue : undefined,
  );

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    if (props.type === "date") {
      setLocalDate(props.dateValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.type === "date" ? props.dateValue : undefined]);

  const handleSave = () => {
    if (props.type === "date") {
      onSave?.(formatDate(localDate) ?? "");
    } else {
      onSave?.(localValue);
    }
    setIsEdit(false);
  };

  const renderInput = () => {
    if (props.type === "date") {
      return (
        <InputDate
          label={label}
          value={localDate}
          onChange={(date) => setLocalDate(date)}
        />
      );
    }

    if (props.type === "select") {
      return (
        <Select
          label={label}
          value={localValue}
          options={props.options}
          onChange={(val) => setLocalValue(val)}
        />
      );
    }

    return (
      <Input
        label={label}
        value={localValue}
        placeholder={placeholder}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    );
  };

  return (
    <div className="flex flex-col w-full justify-start items-center pb-6 border-b border-gray-200">
      <div className="flex w-full justify-between gap-y-1">
        <label className="text-md font-semibold">{label}</label>
        <Button
          variant={isEdit ? "link" : "ghost"}
          onClick={() => setIsEdit(!isEdit)}
        >
          {isEdit ? "Batal" : <PenLine size={15} />}
        </Button>
      </div>

      <div className="flex w-full justify-start mt-1">
        {isEdit ? (
          <div className="w-full space-y-3">
            {hint && (
              <p className="text-sm text-gray-400 font-extralight">{hint}</p>
            )}
            {renderInput()}
            <Button variant="secondary" onClick={handleSave}>
              Simpan
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{value || "-"}</p>
        )}
      </div>
    </div>
  );
}
