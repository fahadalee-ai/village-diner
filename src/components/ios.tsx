import { createContext, useContext, useEffect, useId, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { imageSrc } from "@/lib/images";
import { SFIcon, type SFName } from "./sf";
import { useApp } from "@/lib/store";

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-[17px] font-semibold text-white transition-colors duration-200 active:bg-primary-pressed disabled:bg-disabled disabled:text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border-2 border-primary bg-transparent px-4 text-[17px] font-semibold text-primary transition-colors duration-200 active:bg-primary/10 disabled:border-disabled disabled:text-disabled",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TextButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center px-2 text-[17px] font-semibold text-primary disabled:text-disabled",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  name,
  filled,
  onClick,
  badge,
  className,
}: {
  label: string;
  name: SFName;
  filled?: boolean;
  onClick?: () => void;
  badge?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground active:bg-surface",
        className,
      )}
    >
      <SFIcon name={name} size={22} weight={filled ? "fill" : "regular"} />
      {badge ? (
        <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { id: T; label: string; disabled?: boolean }[];
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="grid rounded-[10px] bg-surface p-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={option.disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              "h-8 rounded-[8px] px-2 text-[13px] font-semibold transition-colors duration-200",
              active ? "bg-background text-foreground diner-shadow" : "text-muted-foreground",
              option.disabled && "text-disabled",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search the menu",
  onFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-[12px] bg-surface px-3 text-muted-foreground">
      <SFIcon name="search" size={18} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full w-full bg-transparent text-[17px] text-foreground outline-none placeholder:text-muted-foreground"
      />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={() => onChange("")} className="flex h-11 w-8 items-center justify-center">
          <SFIcon name="xmark" size={16} />
        </button>
      ) : null}
    </label>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full px-4 text-[15px] font-semibold transition-colors duration-200",
        active ? "bg-primary text-white" : "bg-surface text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "green" | "amber" | "neutral" }) {
  const tones = {
    red: "bg-primary text-white",
    green: "bg-success text-white",
    amber: "bg-warning text-black",
    neutral: "bg-surface text-foreground",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[13px] font-semibold", tones[tone])}>{children}</span>;
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-primary" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <SFIcon key={i} name={i < value ? "star.fill" : "star"} size={size} />
      ))}
    </span>
  );
}

export function Stepper({ value, onChange, min = 1, max = 20 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-full bg-surface">
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)} className="flex h-11 w-11 items-center justify-center disabled:text-disabled">
        <SFIcon name="minus" size={16} />
      </button>
      <span className="min-w-6 text-center text-[17px] font-semibold tabular-nums">{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className="flex h-11 w-11 items-center justify-center disabled:text-disabled">
        <SFIcon name="plus" size={16} />
      </button>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  autoComplete,
  inputMode,
  right,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "decimal";
  right?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <div className={cn("relative rounded-[14px] border bg-background", error ? "border-danger" : "border-divider")}>
        <input
          id={id}
          value={value}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder=" "
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn("peer h-14 w-full rounded-[14px] bg-transparent px-4 pb-1 pt-5 text-[17px] text-foreground outline-none", right && "pr-14")}
        />
        <label htmlFor={id} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[17px] text-muted-foreground transition-all peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-[13px] peer-focus:top-3 peer-focus:text-[13px]">
          {label}
        </label>
        {right ? <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div> : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1 px-1 text-[13px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block px-1 text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className={cn("w-full rounded-[14px] border bg-background px-4 py-3 text-[17px] outline-none", error ? "border-danger" : "border-divider")}
      />
      {error ? <p className="mt-1 px-1 text-[13px] text-danger">{error}</p> : null}
    </div>
  );
}

export function ToggleRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex min-h-[52px] items-center gap-3 py-2">
      <span className="min-w-0 flex-1">
        <span className="block text-[17px]">{label}</span>
        {detail ? <span className="block text-[13px] text-muted-foreground">{detail}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-200", checked ? "bg-primary" : "bg-disabled")}
      >
        <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white transition-transform duration-200", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </label>
  );
}

export function ListRow({
  title,
  detail,
  icon,
  onClick,
  trailing,
  destructive,
}: {
  title: string;
  detail?: string;
  icon?: SFName;
  onClick?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center gap-3 border-b border-divider py-3 text-left last:border-b-0"
    >
      {icon ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SFIcon name={icon} size={18} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[17px]", destructive && "text-danger")}>{title}</span>
        {detail ? <span className="block truncate text-[13px] text-muted-foreground">{detail}</span> : null}
      </span>
      {trailing}
      {onClick ? <SFIcon name="chevron.right" size={16} className="text-muted-foreground" /> : null}
    </Comp>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="display text-[22px]">{children}</h2>
      {action}
    </div>
  );
}

export function FoodImage({
  folder,
  file,
  alt,
  className,
}: {
  folder: string;
  file: string;
  alt: string;
  className?: string;
}) {
  const src = imageSrc(folder, file);
  if (!src) {
    return <div className={cn("bg-[#E7D5C8] dark:bg-[#2A211E]", className)} role="img" aria-label={alt} />;
  }
  return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} />;
}

export function EmptyState({
  icon = "takeout",
  title,
  body,
  action,
}: {
  icon?: SFName;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface text-primary">
        <SFIcon name={icon} size={34} />
      </span>
      <h2 className="display text-[22px]">{title}</h2>
      <p className="mt-2 max-w-[280px] text-[16px] leading-relaxed text-muted-foreground">{body}</p>
      {action ? <div className="mt-5 w-full max-w-[260px]">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-danger">
        <SFIcon name="exclamation" size={32} />
      </span>
      <h2 className="display text-[22px]">{title}</h2>
      <p className="mt-2 max-w-[280px] text-[16px] text-muted-foreground">{body}</p>
      <div className="mt-5 w-full max-w-[260px]">
        <PrimaryButton onClick={onRetry}>Try again</PrimaryButton>
      </div>
    </div>
  );
}

export function SkeletonRows() {
  return (
    <div className="space-y-3 px-5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-24 w-24 animate-pulse rounded-[16px] bg-surface" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-3 w-full animate-pulse rounded bg-surface" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Screen({
  children,
  footer,
  header,
}: {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {header}
      <div className="diner-scroll min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer}
    </div>
  );
}

export function NavBar({
  title,
  large,
  onBack,
  right,
  subtitle,
}: {
  title: string;
  large?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  subtitle?: string;
}) {
  return (
    <header className="bg-background px-5 pt-[max(8px,env(safe-area-inset-top))]">
      <div className="flex h-11 items-center gap-1">
        {onBack ? (
          <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-11 items-center gap-0.5 pr-2 text-primary">
            <SFIcon name="chevron.left" size={22} />
            <span className="text-[17px]">Back</span>
          </button>
        ) : (
          <span />
        )}
        {!large ? <h1 className="flex-1 truncate text-center text-[17px] font-semibold">{title}</h1> : <span className="flex-1" />}
        <div className="flex min-w-11 justify-end">{right}</div>
      </div>
      {large ? (
        <div className="pb-2 pt-1">
          <h1 className="display text-[34px]">{title}</h1>
          {subtitle ? <p className="mt-1 text-[16px] text-muted-foreground">{subtitle}</p> : null}
        </div>
      ) : null}
    </header>
  );
}

const OverlayHost = createContext<HTMLElement | null>(null);

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  const [node, setNode] = useState<HTMLElement | null>(null);
  return (
    <OverlayHost.Provider value={node}>
      <div ref={setNode} className={cn("phone-frame relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-background shadow-[0_12px_40px_rgba(0,0,0,0.12)]", className)}>
        {children}
      </div>
    </OverlayHost.Provider>
  );
}

function Overlay({ children }: { children: ReactNode }) {
  const node = useContext(OverlayHost);
  if (!node) return null;
  return createPortal(children, node);
}

export function Sheet({
  open,
  title,
  onClose,
  children,
  footer,
  tall,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  tall?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Overlay>
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40">
      <button type="button" aria-label="Close sheet" className="min-h-0 flex-1" onClick={onClose} />
      <div className={cn("flex flex-col rounded-t-[24px] bg-background pb-[max(12px,env(safe-area-inset-bottom))] diner-shadow", tall ? "max-h-[92%]" : "max-h-[70%]")}>
        <div className="flex justify-center pt-2">
          <span className="h-1 w-9 rounded-full bg-divider" />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-11 w-11 items-center justify-center">
            <SFIcon name="xmark" size={18} />
          </button>
        </div>
        <div className="diner-scroll min-h-0 flex-1 overflow-y-auto px-5">{children}</div>
        {footer ? <div className="px-5 pt-3">{footer}</div> : null}
      </div>
    </div>
    </Overlay>
  );
}

export function ActionSheet({
  open,
  title,
  message,
  actions,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  actions: { label: string; destructive?: boolean; onPress: () => void }[];
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Overlay>
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <button type="button" aria-label="Dismiss" className="min-h-0 flex-1" onClick={onClose} />
      <div className="overflow-hidden rounded-[14px] bg-background text-center">
        <div className="px-4 py-3">
          <p className="text-[13px] font-semibold text-muted-foreground">{title}</p>
          {message ? <p className="mt-1 text-[13px] text-muted-foreground">{message}</p> : null}
        </div>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onPress}
            className={cn("flex h-[52px] w-full items-center justify-center border-t border-divider text-[17px]", action.destructive ? "font-semibold text-danger" : "text-primary")}
          >
            {action.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={onClose} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-background text-[17px] font-semibold text-primary">
        Cancel
      </button>
    </div>
    </Overlay>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <Overlay>
    <div className="pointer-events-none absolute inset-x-0 top-[max(8px,env(safe-area-inset-top))] z-[60] space-y-2 px-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className="pointer-events-auto w-full rounded-[16px] bg-foreground/95 px-4 py-3 text-left text-background diner-shadow"
        >
          <p className="text-[15px] font-semibold">{toast.title}</p>
          {toast.body ? <p className="text-[13px] opacity-80">{toast.body}</p> : null}
        </button>
      ))}
    </div>
    </Overlay>
  );
}

export function StatusStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start justify-between gap-1">
      {steps.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="flex flex-1 flex-col items-center text-center">
            <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-semibold", done ? "bg-primary text-white" : "bg-surface text-muted-foreground")}>
              {index < current ? <SFIcon name="checkmark" size={14} /> : index + 1}
            </span>
            <span className={cn("mt-1 text-[13px] leading-tight", done ? "font-semibold text-foreground" : "text-muted-foreground")}>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return online;
}

export function useDelayedReady(ms = 700) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return ready;
}
