import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[15px] font-semibold ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-premium hover:bg-primary/90 hover:shadow-[0_0_24px_hsl(199_89%_58%/0.4)]",
        destructive: "bg-destructive text-destructive-foreground shadow-premium hover:bg-destructive/90 hover:shadow-[0_0_20px_hsl(0_84%_60%/0.3)]",
        outline: "border border-border bg-card hover:bg-muted hover:border-muted-foreground/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted/60",
        link: "text-primary underline-offset-4 hover:underline",
        // New glow variants
        glow: "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(199_89%_58%/0.3)] hover:shadow-[0_0_32px_hsl(199_89%_58%/0.5)]",
        "glow-accent": "bg-accent text-accent-foreground shadow-[0_0_16px_hsl(25_95%_53%/0.3)] hover:shadow-[0_0_32px_hsl(25_95%_53%/0.5)]",
        "glow-success": "bg-success text-success-foreground shadow-[0_0_16px_hsl(142_76%_42%/0.3)] hover:shadow-[0_0_32px_hsl(142_76%_42%/0.5)]",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-sm",
        lg: "h-12 rounded-xl px-8",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10 rounded-xl",
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