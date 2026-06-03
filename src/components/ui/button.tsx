import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "grad-brand text-white shadow-[0_10px_26px_rgba(14,126,123,0.3)] hover:-translate-y-px hover:shadow-[0_14px_32px_rgba(14,126,123,0.4)]",
        solid: "bg-teal text-teal-foreground hover:opacity-90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border-[1.5px] border-input bg-transparent text-teal hover:border-brand hover:bg-brand-soft",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-brand underline-offset-4 hover:underline",
        white: "bg-white text-teal hover:bg-brand-soft",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
