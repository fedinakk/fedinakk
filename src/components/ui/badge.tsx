import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-ember-600/40 bg-ember-600/15 text-ember-300",
        positive: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
        negative: "border-red-500/40 bg-red-500/10 text-red-300",
        neutral: "border-white/10 bg-white/[0.05] text-muted-foreground",
        gold: "border-amber-400/40 bg-amber-400/10 text-amber-300",
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
