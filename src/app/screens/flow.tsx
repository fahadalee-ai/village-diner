import { useEffect, useRef, useState, type ReactNode } from "react";
import { business } from "@/data/business";
import { logo } from "@/lib/images";
import { haptic, passwordLabel, passwordScore, prefersReducedMotion } from "@/lib/format";
import { useApp } from "@/lib/store";
import { useNav } from "@/app/nav";
import { Field, FoodImage, PrimaryButton, Screen, SecondaryButton, TextButton, ToggleRow } from "@/components/ios";
import { SFIcon } from "@/components/sf";

function AuthFrame({
  title,
  subtitle,
  onBack,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  onBack?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full">
      <Screen footer={footer}>
        <div className="bg-primary px-5 pb-14 pt-[max(36px,env(safe-area-inset-top))] text-center text-white">
          <img src={logo} alt="The Village Diner" className="mx-auto h-[88px] w-[88px] rounded-full object-cover ring-4 ring-white/30" />
          <h1 className="display mt-4 text-[34px] leading-[1.15] text-white">{title}</h1>
          <p className="mx-auto mt-2 max-w-[300px] text-[16px] leading-snug text-white">{subtitle}</p>
        </div>
        <div className="-mt-6 rounded-t-[24px] bg-background px-5 pb-10 pt-6">{children}</div>
      </Screen>
      {onBack ? (
        <button type="button" aria-label="Back" onClick={onBack} className="absolute left-3 top-[max(8px,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white">
          <SFIcon name="chevron.left" size={22} />
        </button>
      ) : null}
    </div>
  );
}

const slides = [
  {
    title: "Breakfast, Made With Care",
    body: "Fluffy pancakes, Texas French toast and classic diner breakfasts, served fresh every day.",
    image: "pancakes.jpg",
  },
  {
    title: "Order Ahead, Skip the Wait",
    body: "Browse the full menu, customize your meal and schedule pickup in a few taps.",
    image: "takeout.jpg",
  },
  {
    title: "Rewards for Every Visit",
    body: "Earn points, unlock offers and get a treat on your birthday.",
    image: "milkshake.jpg",
  },
];

export function Splash() {
  const nav = useNav();
  const { hydrated } = useApp();
  useEffect(() => {
    if (!hydrated) return;
    const delay = prefersReducedMotion() ? 400 : 2500;
    const timer = window.setTimeout(() => {
      if (business.maintenanceMode) nav.reset("maintenance");
      else if (business.forceUpdate) nav.reset("force-update");
      else nav.reset("onboarding");
    }, delay);
    return () => window.clearTimeout(timer);
  }, [hydrated, nav]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-primary px-8 text-center text-white">
      <div className="relative">
        <img src={logo} alt="The Village Diner" className="anim-splash-logo h-44 w-44 rounded-full object-cover" />
        <span className="anim-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
      <p className="anim-tagline mt-8 max-w-[280px] text-[16px] leading-snug text-white/95">{business.tagline}</p>
    </div>
  );
}

export function Onboarding() {
  const nav = useNav();
  const { markOnboarded } = useApp();
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const slide = slides[index];
  const last = index === slides.length - 1;

  function finish() {
    markOnboarded();
    nav.reset("login");
  }

  function go(next: number) {
    setIndex(Math.max(0, Math.min(slides.length - 1, next)));
  }

  return (
    <div
      className="relative h-full overflow-hidden bg-black text-white"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        drag.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        drag.current = null;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        go(index + (dx < 0 ? 1 : -1));
      }}
    >
      {slides.map((item, i) => (
        <FoodImage
          key={item.image}
          folder="onboarding"
          file={item.image}
          alt=""
          className={i === index ? "absolute inset-0 h-full w-full object-cover object-[center_18%] transition-opacity duration-300" : "absolute inset-0 h-full w-full object-cover object-[center_18%] opacity-0 transition-opacity duration-300"}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0">
        <div className="pointer-events-none h-28 bg-gradient-to-t from-black to-transparent" />
        <div className="bg-black px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          <h1 className="display text-[34px] leading-[1.15] text-white">{slide.title}</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-white">{slide.body}</p>
          <div className="mt-5 flex gap-2" aria-label="Onboarding progress">
            {slides.map((item, i) => (
              <span key={item.title} className={i === index ? "h-2 w-6 rounded-full bg-white" : "h-2 w-2 rounded-full bg-white/45"} />
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <TextButton className="w-24 text-white" onClick={finish}>
              Skip
            </TextButton>
            <PrimaryButton
              onClick={() => {
                if (last) finish();
                else go(index + 1);
              }}
            >
              {last ? "Get Started" : "Next"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const nav = useNav();
  const app = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  function submit() {
    app.login(email, password);
    haptic("success");
    nav.reset("home");
  }

  function social() {
    app.login("alex@email.com", "Diner123");
    haptic("success");
    nav.reset("home");
  }

  return (
    <AuthFrame title="Welcome back" subtitle={business.tagline}>
      <div>
        <div className="space-y-3">
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" inputMode="email" />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type={show ? "text" : "password"}
            autoComplete="current-password"
            right={
              <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((value) => !value)} className="flex h-11 w-11 items-center justify-center">
                <SFIcon name={show ? "eye.slash" : "eye"} size={18} />
              </button>
            }
          />
          <div className="flex justify-end">
            <TextButton onClick={() => nav.push("forgot")}>Forgot password?</TextButton>
          </div>
          <PrimaryButton onClick={submit}>Log In</PrimaryButton>
        </div>
        <div className="my-5 flex items-center gap-3 text-[15px] text-muted-foreground">
          <span className="h-px flex-1 bg-divider" />
          or
          <span className="h-px flex-1 bg-divider" />
        </div>
        <div className="space-y-3">
          <button type="button" onClick={social} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-foreground text-[17px] font-semibold text-background">
            <SFIcon name="apple" size={18} />
            Sign in with Apple
          </button>
          <SecondaryButton onClick={social}>Continue with Google</SecondaryButton>
          <TextButton
            className="w-full"
            onClick={() => {
              app.continueAsGuest();
              nav.reset("home");
            }}
          >
            Continue as Guest
          </TextButton>
        </div>
        <p className="mt-6 text-center text-[16px]">
          New here?{" "}
          <button type="button" className="font-semibold text-primary" onClick={() => nav.push("register")}>
            Create an account
          </button>
        </p>
        <button
          type="button"
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-[14px] bg-surface px-4 text-[15px] font-semibold"
          onClick={() => {
            setEmail("alex@email.com");
            setPassword("Diner123");
          }}
        >
          Use preview account
        </button>
      </div>
    </AuthFrame>
  );
}

export function Register() {
  const nav = useNav();
  const app = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [agree, setAgree] = useState(false);
  const [promo, setPromo] = useState(true);
  const score = passwordScore(password);
  const strength = ["bg-divider", "bg-danger", "bg-warning", "bg-primary", "bg-success"][score] ?? "bg-divider";

  function submit() {
    app.register({ name, email, phone, password, birthday: birthday || undefined, promoOptIn: promo });
    haptic("success");
    nav.push("otp");
  }

  return (
    <AuthFrame
      title="Create account"
      subtitle="Breakfast, lunch, and rewards in one place."
      onBack={() => nav.pop()}
      footer={
        <div className="border-t border-divider bg-background px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <PrimaryButton onClick={submit}>Create Account</PrimaryButton>
        </div>
      }
    >
      <div className="space-y-5">
        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold">Your details</h2>
          <Field label="Full name" value={name} onChange={setName} autoComplete="name" />
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" inputMode="email" />
          <Field label="Mobile number" value={phone} onChange={setPhone} type="tel" autoComplete="tel" inputMode="tel" />
        </section>
        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold">Password</h2>
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            type={show ? "text" : "password"}
            autoComplete="new-password"
            right={
              <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((value) => !value)} className="flex h-11 w-11 items-center justify-center">
                <SFIcon name={show ? "eye.slash" : "eye"} size={18} />
              </button>
            }
          />
          <div className="px-1">
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={i < score ? `h-1.5 flex-1 rounded-full ${strength}` : "h-1.5 flex-1 rounded-full bg-divider"} />
              ))}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">Password strength: {password ? passwordLabel(score) : "Enter a password"}</p>
          </div>
        </section>
        <section className="rounded-[16px] bg-surface p-4">
          <label className="block">
            <span className="block text-[17px] font-semibold">Birthday</span>
            <span className="mt-1 block text-[15px] leading-snug text-muted-foreground">Used for your birthday offer. You can skip this.</span>
            <input
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
              className="mt-3 h-12 w-full rounded-[14px] border border-divider bg-background px-4 text-[17px] text-foreground"
            />
          </label>
        </section>
        <section className="rounded-[16px] bg-surface p-4">
          <div className="flex items-start gap-3 text-[16px] leading-snug">
            <input id="agree-terms" type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-primary" />
            <p>
              <label htmlFor="agree-terms">I agree to the </label>
              <button type="button" className="font-semibold text-primary" onClick={() => nav.push("terms")}>
                Terms
              </button>{" "}
              and{" "}
              <button type="button" className="font-semibold text-primary" onClick={() => nav.push("privacy")}>
                Privacy Policy
              </button>
              .
            </p>
          </div>
          <div className="mt-2 border-t border-divider">
            <ToggleRow label="Promotions" detail="Occasional specials and rewards. Optional." checked={promo} onChange={setPromo} />
          </div>
        </section>
        <p className="text-center text-[16px]">
          Already have an account?{" "}
          <button type="button" className="font-semibold text-primary" onClick={() => nav.pop()}>
            Log in
          </button>
        </p>
      </div>
    </AuthFrame>
  );
}

export function Forgot() {
  const nav = useNav();
  const [email, setEmail] = useState("");
  return (
    <AuthFrame title="Forgot password" subtitle="Enter the email on your account. We'll send a reset link." onBack={() => nav.pop()}>
      <div className="space-y-4">
        <Field label="Email" value={email} onChange={setEmail} type="email" inputMode="email" autoComplete="email" />
        <PrimaryButton onClick={() => nav.push("forgot-done", { email })}>
          Send reset link
        </PrimaryButton>
      </div>
    </AuthFrame>
  );
}

export function ForgotDone() {
  const nav = useNav();
  const email = nav.current.params?.email ?? "your email";
  return (
    <AuthFrame title="Check your email" subtitle={`A reset link was sent to ${email}.`} onBack={() => nav.pop()}>
      <div className="space-y-4">
        <p className="text-[16px] leading-relaxed text-muted-foreground">In this preview, continue to choose a new password. No email is sent.</p>
        <PrimaryButton onClick={() => nav.push("reset", { email })}>Reset password</PrimaryButton>
      </div>
    </AuthFrame>
  );
}

export function ResetPassword() {
  const nav = useNav();
  const app = useApp();
  const email = nav.current.params?.email ?? "";
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const score = passwordScore(password);
  const strength = ["bg-divider", "bg-danger", "bg-warning", "bg-primary", "bg-success"][score] ?? "bg-divider";
  return (
    <AuthFrame title="New password" subtitle="Choose a password for your Village Diner account." onBack={() => nav.pop()}>
      <div className="space-y-4">
        <Field
          label="New password"
          value={password}
          onChange={setPassword}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          right={
            <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((value) => !value)} className="flex h-11 w-11 items-center justify-center">
              <SFIcon name={show ? "eye.slash" : "eye"} size={18} />
            </button>
          }
        />
        <div className="px-1">
          <div className="flex gap-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={i < score ? `h-1.5 flex-1 rounded-full ${strength}` : "h-1.5 flex-1 rounded-full bg-divider"} />
            ))}
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">Password strength: {password ? passwordLabel(score) : "Enter a password"}</p>
        </div>
        <PrimaryButton
          onClick={() => {
            app.resetPassword(email, password);
            haptic("success");
            app.pushToast("Password updated");
            nav.reset("login");
          }}
        >
          Save password
        </PrimaryButton>
      </div>
    </AuthFrame>
  );
}

export function Otp() {
  const nav = useNav();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  function setDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  return (
    <AuthFrame title="Enter the code" subtitle="We sent a 6-digit code to your email." onBack={() => nav.pop()}>
      <div>
        <p className="text-[16px] leading-relaxed text-muted-foreground">In this preview, any 6 digits will do.</p>
        <div className="mt-6 flex justify-between gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              value={digit}
              aria-label={`Digit ${index + 1}`}
              onChange={(event) => setDigit(index, event.target.value)}
              className="h-14 w-11 rounded-[12px] border border-divider bg-surface text-center text-[22px] font-semibold text-foreground outline-none"
            />
          ))}
        </div>
        <div className="mt-6">
          <PrimaryButton
            onClick={() => {
              haptic("success");
              nav.reset("home");
            }}
          >
            Verify
          </PrimaryButton>
        </div>
        <div className="mt-4 text-center">
          {seconds > 0 ? (
            <p className="text-[15px] text-muted-foreground">Resend code in {seconds}s</p>
          ) : (
            <TextButton
              onClick={() => {
                setSeconds(30);
              }}
            >
              Resend code
            </TextButton>
          )}
        </div>
      </div>
    </AuthFrame>
  );
}
