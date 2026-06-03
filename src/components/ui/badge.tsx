import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "border-input text-muted-foreground",
        success: "border-transparent bg-offer text-offer-foreground",
        offer: "border-transparent bg-offer text-offer-foreground",
        teal: "border-transparent bg-teal text-teal-foreground",
        brandSoft: "border-transparent bg-brand-soft text-brand",
        best: "grad-brand border-transparent text-white",
        deal: "border-transparent bg-deal-bg text-accent-text",
        gold: "border-transparent bg-[#FBF1D6] text-[#8A6512]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
