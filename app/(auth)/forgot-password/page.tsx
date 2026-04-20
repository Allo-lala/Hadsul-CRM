"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
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
    // Always show confirmation regardless of result 
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
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src="/logo.png" alt="Hadsul" className="h-60 w-60 rounded-lg object-contain" />
            </div>

            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl -mt-16">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-24 h-24 flex items-center justify-center">
                    <img src="/logo.png" alt="Hadsul" className="w-full h-full rounded-lg object-contain" />
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
        
        {/* Copyright Footer */}
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
          <p className="text-sm text-white drop-shadow-lg">
            © {new Date().getFullYear()} Hadsul Care Home CRM. All rights reserved.
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
            <img src="/logo.png" alt="logo" className="h-60 w-60 rounded-lg object-contain" />
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl -mt-16">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Forgot password?</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email address and you&apos;ll receive you a reset link.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-900">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="text-gray-900 bg-white"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#174731' }} disabled={isSubmitting}>
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
            <Button variant="ghost" className="w-full text-white hover:bg-white/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Copyright Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-sm text-white drop-shadow-lg">
          © {new Date().getFullYear()} Hadsul Cre Home CRM. All rights reserved.
        </p>
      </footer>
    </>
  )
}
