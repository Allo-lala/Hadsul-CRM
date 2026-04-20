"use client"

import { useEffect, useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Building2, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"

// Mirror the server-side strength rules (Requirement 3.4)
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [tokenState, setTokenState] = useState<"loading" | "valid" | "invalid">("loading")
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Verify token on mount (Requirement 3.1, 4.3)
  useEffect(() => {
    if (!token) {
      setTokenState("invalid")
      return
    }

    fetch(`/api/auth/verify-token?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        setTokenState(data.valid ? "valid" : "invalid")
      })
      .catch(() => setTokenState("invalid"))
  }, [token])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.")
        return
      }

      // Success — redirect to login with toast (Requirement 3.2, 4.4)
      toast.success("Password updated. You can now log in.")
      router.push("/login")
    } catch {
      setServerError("Unable to connect. Please check your connection and try again.")
    }
  }

  if (tokenState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Invalid / expired token (Requirement 3.3, 4.5)
  if (tokenState === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Hadsul CRM</span>
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground">Link expired or invalid</h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    This password reset link has expired or has already been used. Request a new
                    one below.
                  </p>
                </div>
                <Link href="/forgot-password">
                  <Button className="w-full">Request a new link</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Link href="/login">
            <Button variant="ghost" className="w-full text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Hadsul CRM</span>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-card-foreground">Set new password</CardTitle>
            <CardDescription>
              Choose a strong password to secure your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  At least 8 characters, one uppercase letter, and one number.
                </p>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p id="confirm-error" className="text-sm text-destructive">
                    {errors.confirmPassword.message}
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Set password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Link href="/login">
          <Button variant="ghost" className="w-full text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
