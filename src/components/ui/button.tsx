import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "clip-corner-sm !rounded-none bg-gradient-to-b from-ember-500 to-ember-600 font-semibold uppercase tracking-wide text-white drop-shadow-[0_0_16px_rgba(249,115,22,0.35)] hover:brightness-110 hover:drop-shadow-[0_0_22px_rgba(249,115,22,0.5)] active:brightness-95",
        secondary: "glass text-foreground hover:bg-white/[0.07]",
        ghost: "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
        outline: "border border-border bg-transparent hover:border-ember-600/60 hover:text-ember-400",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-ember-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
