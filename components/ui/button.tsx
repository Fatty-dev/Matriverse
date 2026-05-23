import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary:
        "bg-gradient-to-r from-brand-mid to-brand-accent text-white hover:from-brand-dark hover:to-brand-mid focus:ring-brand-accent shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
      secondary:
        "bg-brand-surface text-brand-dark hover:bg-brand-light focus:ring-brand-accent border border-brand-light/50",
      outline:
        "border-2 border-brand-mid text-brand-mid hover:bg-brand-mid hover:text-white focus:ring-brand-accent",
      ghost:
        "text-brand-mid hover:bg-brand-surface focus:ring-brand-accent",
      danger:
        "bg-gradient-to-r from-danger to-red-500 text-white hover:from-red-700 hover:to-danger focus:ring-danger shadow-md hover:shadow-lg",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm gap-1.5",
      md: "h-10 px-5 text-sm gap-2",
      lg: "h-11 px-7 text-base gap-2",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
