interface InputProps {
    label?: string;
    type?: string;
    value?: string;
    placeholder?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    error?: string;
    labelVariant?: "default" | "white" | "gray";
}

const labelStyles = {
    default: "text-gray-700",
    white: "text-white/80",
    gray: "text-gray-400",
}

const Input: React.FC<InputProps> = ({
    label,
    type = "text",
    value,
    placeholder,
    name,
    required = false,
    disabled = false,
    onChange,
    className = "",
    error = "",
    labelVariant = "default",
}) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className={`font-medium text-sm ${labelStyles[labelVariant]}`}>
                    {label}
                </label>
            )}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                defaultValue={value}
                required={required}
                disabled={disabled}
                onChange={onChange}
                className={`w-full rounded-lg text-sm border px-3 py-2 mt-1 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-calltoaction1"
                } ${className}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Input