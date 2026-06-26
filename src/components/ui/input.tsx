import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-10 px-3 rounded-lg",
            "bg-white border border-gray-200",
            "text-body text-gray-900 placeholder:text-gray-400",
            "transition-all duration-fast ease-out",
            "hover:border-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
