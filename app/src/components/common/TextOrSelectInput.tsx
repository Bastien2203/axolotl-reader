import { Trash } from "lucide-react";
import React from "react";

type TextOrSelectInputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  toggleLabel?: string;
};

export const TextOrSelectInput = (props: TextOrSelectInputProps) => {
  const [mode, setMode] = React.useState<"text" | "select">(props.options.includes(props.value) ? "select" : "text");

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{props.label}</span>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500">{props.toggleLabel}</span>
          <input
            type="checkbox"
            className="toggle toggle-sm"
            checked={mode === "select"}
            onChange={() => setMode(prev => (prev === "text" ? "select" : "text"))}
          />
        </div>
      </label>

      {mode === "text" ? (
        <input
          name={props.name}
          type="text"
          className="input input-bordered w-full"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      ) : (
        <select
          name={props.name}
          className="select select-bordered w-full"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        >
          <option disabled value="">-- Select --</option>
          {props.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};



type TextOrSelectInputManyProps = {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  toggleLabel?: string;
};

export const TextOrSelectInputMany = (props: TextOrSelectInputManyProps) => {
  const [_value, _setValue] = React.useState<string>("");

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <TextOrSelectInput
            label={props.label}
            name={props.name}
            value={_value}
            onChange={_setValue}
            options={props.options}
            toggleLabel={props.toggleLabel}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (_value && !props.value.includes(_value)) {
              props.onChange([...props.value, _value]);
              _setValue("");
            }
          }}
        >
          Add
        </button>
      </div>

      <ul className="space-y-1 list">
        {props.value.map((v, i) => (
          <li
            key={i}
            className="flex items-center justify-between list-row"
          >
            <span className="text-sm">{v}</span>
            <button
              className="text-error hover:text-red-600"
              onClick={() =>
                props.onChange(props.value.filter((_, j) => j !== i))
              }
            >
              <Trash size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
