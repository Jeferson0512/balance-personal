import { cn } from "@/lib/utils";

const Button = ({ className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
      className
    )}
    {...props}
  />
);

export default Button;
