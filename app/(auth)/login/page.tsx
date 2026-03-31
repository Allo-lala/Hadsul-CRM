"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Shield, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.")
        return
      }

      router.push(json.redirectTo ?? "/dashboard")
    } catch {
      setServerError("Unable to connect. Please check your connection and try again.")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand / illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Hadsul" className="h-42 w-42 rounded-xl object-contain" />
          <span className="text-xl font-bold text-sidebar-foreground">CRM</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-sidebar-foreground leading-tight">
              Care Home Management,
              <br />
              <span className="text-primary">Simplified.</span>
            </h1>
            <p className="mt-4 text-sidebar-foreground/70 text-lg leading-relaxed">
              Manage your staff, rotas, and residents all in one place — built for the people who
              keep care homes running.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Users, label: "Staff scheduling & rota management" },
              { icon: Shield, label: "Role-based access for every team member" },
              { icon: Heart, label: "Built for care home professionals" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sidebar-foreground/80 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sidebar-foreground/40 text-sm">
          © {new Date().getFullYear()} Hadsul. All rights reserved.
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <img src="/logo.png" alt="Hadsul" className="h-32 w-32 rounded-xl object-contain" />
            <span className="text-xl font-bold text-foreground">CRM</span>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-card-foreground">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                      tabIndex={-1}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="pr-10"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <div
                    role="alert"
                    className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                  >
                    {serverError}
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need help?{" "}
            <span className="text-foreground">Contact your administrator.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
