import { cn } from "@/lib/utils";

function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cn("h-px w-full bg-gradient-to-r from-transparent via-border to-transparent", className)}
      {...props}
    />
  );
}

export { Separator };
