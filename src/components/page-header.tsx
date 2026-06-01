import { cn } from "@/lib/utils";

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  eyebrow,
  className,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Icon className="size-5" />
          </span>
        ) : null}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
      </div>
      {subtitle ? (
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      {children}
    </div>
  );
}
