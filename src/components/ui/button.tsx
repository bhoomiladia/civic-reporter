import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-900 text-white hover:bg-blue-950 active:bg-gray-900 shadow-sm hover:shadow-md",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-700 shadow-sm",
  outline:
    "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 shadow-xs hover:shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[13px] rounded-lg gap-1.5",
  md: "h-10 px-5 text-[14px] rounded-lg gap-2",
  lg: "h-12 px-7 text-[15px] rounded-xl gap-2.5",
  icon: "h-10 w-10 rounded-lg justify-center",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold",
          "tracking-[-0.01em]",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
          "disabled:opacity-50 disabled:pointer-events-none",
          "select-none cursor-pointer",
          "active:scale-[0.97]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
