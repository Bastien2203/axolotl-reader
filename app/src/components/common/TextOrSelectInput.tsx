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
