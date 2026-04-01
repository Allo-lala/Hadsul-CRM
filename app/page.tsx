"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, X, LayoutDashboard, Clock, Users, BarChart3, Calendar, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

// ─── Login form schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})
type LoginForm = z.infer<typeof loginSchema>

// ─── Features list ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: LayoutDashboard, title: "Smart Dashboards", desc: "Real-time KPIs for every role — super admin, care home admin, and staff." },
  { icon: Clock,           title: "Clock In / Out",   desc: "GPS-aware time tracking with late detection and live attendance panels." },
  { icon: Users,           title: "Staff Management", desc: "Onboard, manage, and monitor your entire workforce from one place." },
  { icon: Calendar,        title: "Rota & Scheduling", desc: "Build and publish weekly rotas, assign shifts, and track compliance." },
  { icon: BarChart3,       title: "Reports & Analytics", desc: "Hours worked, attendance rates, and finance reports at a glance." },
  { icon: CreditCard,      title: "Payments",         desc: "Streamlined payroll data exports and invoice management." },
]

// ─── Auth modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error ?? "Something went wrong."); return }
      router.push(json.redirectTo ?? "/dashboard")
    } catch {
      setServerError("Unable to connect. Please check your connection.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl p-8"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition-colors">
          <X className="h-5 w-5" />
        </button>
            {/********** Center the logo on the sign in form ************** */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Hadsul" className="h-16 w-16 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">Welcome back</h2>
        <p className="text-sm text-zinc-500 mb-6">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email address</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com"
              className="h-11" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                placeholder="••••••••" className="h-11 pr-10" {...register("password")} />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-zinc-400">
          Need access? Contact your care home administrator.
        </p>
      </div>
    </div>
  )
}

// ─── Landing page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#174731" }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:py-12">
          {/* Logo at top */}
          <div className="flex items-center gap-2.5 mb-4">
            <img src="/logo.png" alt="Hadsul" className="h-32 w-32 object-contain" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: "#e2d2b1", color: "#174731" }}>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#e2d2b1" }} />
              AI-powered care home platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-tight tracking-tight text-white">
              Care home management{" "}
              <span style={{ color: "#e2d2b1" }}>is easier</span>{" "}
              with the right tools
            </h1>

            <p className="text-lg leading-relaxed max-w-xl text-white">
              One AI-powered care home platform for all your home and staff needs. From dashboards,
              clock-ins/outs, Rota, payments, and beyond — manage care homes efficiently with ease
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#2563eb" }}
                onClick={() => setAuthOpen(true)}>
                Sign in free
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-semibold border-2 border-white text-black bg-white hover:bg-gray-50 hover:text-black transition-colors"
                onClick={() => setAuthOpen(true)}>
                Request CRM
              </Button>
            </div>

            <p className="text-sm text-white">Trusted by care homes across the UK</p>
          </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #174731, #e2d2b1)" }} />
              <img
                src="/first_page/login.webp"
                alt="Hadsul platform preview"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-zinc-900">Everything your care home needs</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">
              Built specifically for UK care homes — every feature designed around the people who deliver care.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border p-6 hover:shadow-md transition-all"
                style={{ borderColor: "#e2d2b1", backgroundColor: "#faf8f4" }}>
                <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#e2d2b1" }}>
                  <Icon className="h-5 w-5" style={{ color: "#174731" }} />
                </div>
                <h3 className="font-semibold text-base mb-1.5 text-zinc-900">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#174731" }}>
        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 items-start">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-start gap-2.5 mb-1">
              <img src="/logo.png" alt="Hadsul" className="h-24 w-24 object-contain" />
            </div>
            <p className="text-sm leading-tight mb-1" style={{ color: "#e2d2b1" }}>
              The AI-powered care home management platform built for care home professionals.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-0">
              {/* Twitter / X */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#e2d2b1" }} aria-label="Twitter">
                <svg className="h-4 w-4" style={{ fill: "#174731" }} viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#e2d2b1" }} aria-label="Instagram">
                <svg className="h-4 w-4" style={{ fill: "#174731" }} viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#e2d2b1" }} aria-label="TikTok">
                <svg className="h-4 w-4" style={{ fill: "#174731" }} viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="h-9 w-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#e2d2b1" }} aria-label="YouTube">
                <svg className="h-4 w-4" style={{ fill: "#174731" }} viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#e2d2b1" }}>
              {["Dashboards", "Clock In/Out", "Staff Management", "Rota & Scheduling", "Reports", "Payments"].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#e2d2b1" }}>
              {["About Us", "Careers", "Blog", "Press", "Contact"].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal + contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: "#e2d2b1" }}>
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
            <div className="pt-2 space-y-1 text-sm" style={{ color: "#e2d2b1" }}>
              <p className="font-medium text-white">Get in touch</p>
              <p>hello@hadsul.com</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "rgba(226,210,177,0.2)" }}>
          <p className="text-xs" style={{ color: "#e2d2b1" }}>
            © {new Date().getFullYear()} Hadsul. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "#e2d2b1" }}>
            Built for Modern care home professionals
          </p>
        </div>
      </footer>

      {/* ── Auth modal ── */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
