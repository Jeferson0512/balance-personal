import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }) => (
  <div
    className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1 p-4 md:p-5", className)} {...props} />
);

/* text-2xl era desproporcionado para un título de tarjeta: competía con el
   título de la página y hacía que todo pareciera un prototipo. */
export const CardTitle = ({ className, ...props }) => (
  <h2 className={cn("text-base font-medium leading-tight tracking-tight", className)} {...props} />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("p-4 pt-0 md:p-5 md:pt-0", className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-4 pt-0 md:p-5 md:pt-0", className)} {...props} />
);
