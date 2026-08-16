import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input3D({
  icon: Icon,
  label,
  type = "text",
  error,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label className="text-ink-500 text-[12px] font-semibold mb-1.5 block px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-leaf-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={actualType}
          className={`input-3d w-full h-[48px] rounded-2xl text-[14px] font-medium ${
            Icon ? "pl-10" : "pl-4"
          } ${isPassword ? "pr-10" : "pr-4"} ${
            error ? "input-error" : ""
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 text-ink-300 hover:text-leaf-500 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" strokeWidth={2} />
            ) : (
              <Eye className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-coral-500 text-[11px] font-semibold mt-1 px-1">{error}</p>
      )}
    </div>
  );
}

