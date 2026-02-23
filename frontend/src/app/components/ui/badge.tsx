import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "h-fit w-fit inline-flex text-nowrap items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "rounded-full border border-primary1/40 bg-primary1/15 text-primary1",
        secondary:
          "rounded-full border border-secondary1/30 bg-secondary1/10 text-secondary1",
        destructive:
          "rounded-full border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        outline:
          "rounded-full border-2 border-primary2 text-primary2 bg-transparent",
        accepted:
          "rounded-full border border-emerald-400 bg-emerald-100 text-emerald-800",
        neutral:
          "rounded-full border border-secondary2/50 bg-secondary2/25 text-secondary1",
        denied:
          "rounded-full border border-red-400 bg-red-100 text-red-700",
        waiting:
          "rounded-full border border-calltoaction2 bg-calltoaction1/30 text-calltoaction2",
        draft:
          "rounded-full border border-primary2/60 bg-primary2/20 text-primary2",
        primary:
          "rounded-full border border-primary2/50 bg-primary2/25 text-primary1",
        calltoaction:
          "rounded-full border border-calltoaction2 bg-calltoaction1/25 text-calltoaction2",
        success:
          "rounded-full border border-calltoactionsuccess/60 bg-calltoactionsuccess/20 text-calltoactionsuccess",
          info:
  "rounded-full border border-blue-400 bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };