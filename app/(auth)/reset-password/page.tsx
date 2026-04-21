"use client"

import { useEffect, useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { AnimatedLoginBackground } from "@/frontend/components/auth/AnimatedLoginBackground"

// Mirror the server-side strength rules 
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

  // Verify token on mount
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

      // Success — redirect to login with toast 
      toast.success("Password updated. You can now log in.")
      router.push("/login")
    } catch {
      setServerError("Unable to connect. Please check your connection and try again.")
    }
  }

  if (tokenState === "loading") {
    return (
      <>
        <AnimatedLoginBackground />
        <div className="min-h-screen flex items-center justify-center relative">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      </>
    )
  }

  // Invalid / expired token 
  if (tokenState === "invalid") {
    return (
      <>
        <AnimatedLoginBackground />
        <div className="min-h-screen flex items-center justify-center p-6 relative">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src="/logo.png" alt="Hadsul" className="h-60 w-60 rounded-lg object-contain" />
            </div>

            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl -mt-16">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Link expired or invalid</h2>
                    <p className="text-gray-600 mt-2 text-sm">
                      This password reset link has expired or has already been used. Request a new
                      one below.
                    </p>
                  </div>
                  <Link href="/forgot-password">
                    <Button className="w-full text-white" style={{ backgroundColor: '#174731' }}>Request a new link</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Link href="/login">
              <button className="w-full py-2 px-4 text-white hover:bg-white hover:text-gray-900 transition-colors rounded-md">
                <ArrowLeft className="h-4 w-4 mr-2 inline" />
                Back to login
              </button>
            </Link>
          </div>
        </div>
        
        {/* Copyright Footer */}
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
          <p className="text-sm text-white drop-shadow-lg">
            © {new Date().getFullYear()} Hadsul Care Home CRM
          </p>
        </footer>
      </>
    )
  }

  return (
    <>
      <AnimatedLoginBackground />
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img src="/logo.png" alt="Hadsul" className="h-60 w-60 rounded-lg object-contain" />
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl -mt-16">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Set new password</CardTitle>
              <CardDescription className="text-gray-600">
                Choose a strong password to secure your account.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-900">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="pr-10 !text-gray-900 !bg-white !border-gray-900 placeholder:!text-gray-600"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    At least 8 characters, one uppercase letter, and one number.
                  </p>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-gray-900">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="!text-gray-900 !bg-white !border-gray-900 placeholder:!text-gray-900"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirm-error" : undefined}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p id="confirm-error" className="text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <div
                    role="alert"
                    className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
                  >
                    {serverError}
                  </div>
                )}

                <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#174731' }} disabled={isSubmitting}>
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
            <button className="w-full py-2 px-4 text-white hover:bg-white hover:text-gray-900 transition-colors rounded-md">
              <ArrowLeft className="h-4 w-4 mr-2 inline" />
              Back to login
            </button>
          </Link>
        </div>
      </div>
      
      {/* Copyright Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-sm text-white drop-shadow-lg">
          © {new Date().getFullYear()} Hadsul CRM. All rights reserved.
        </p>
      </footer>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <>
          <AnimatedLoginBackground />
          <div className="min-h-screen flex items-center justify-center relative">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
