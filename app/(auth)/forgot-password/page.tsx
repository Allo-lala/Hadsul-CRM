"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Building2, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/frontend/components/ui/button"
import { Input } from "@/frontend/components/ui/input"
import { Label } from "@/frontend/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { AnimatedLoginBackground } from "@/frontend/components/auth/AnimatedLoginBackground"

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Always show confirmation regardless of result (Requirement 4.1)
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email }),
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <>
        <AnimatedLoginBackground />
        <div className="min-h-screen flex items-center justify-center p-6 relative">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                <Building2 className="h-6 w-6 text-emerald-500" />
              </div>
              <span className="text-xl font-bold text-white drop-shadow-lg">Hadsul CRM</span>
            </div>

            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
                    <p className="text-gray-600 mt-2 text-sm">
                      If <strong>{getValues("email")}</strong> is registered, you will receive a
                      password reset link shortly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/login">
              <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AnimatedLoginBackground />
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-500" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">Hadsul CRM</span>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Forgot password?</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email address and we&apos;ll send you a reset link.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Link href="/login">
            <Button variant="ghost" className="w-full text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
