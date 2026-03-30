"use client"

import { useState } from "react"
import { SignIn } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, Shield } from "lucide-react"

type LoginMode = "select" | "staff" | "admin"

export default function SignInPage() {
  const [loginMode, setLoginMode] = useState<LoginMode>("select")

  if (loginMode === "select") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Hadsul CRM</h1>
          <p className="text-muted-foreground">Care Home Management System</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-card-foreground">Welcome Back</CardTitle>
            <CardDescription>Choose how you would like to sign in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-center gap-4 justify-start hover:bg-primary/10 hover:border-primary"
              onClick={() => setLoginMode("staff")}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Staff Login</div>
                <div className="text-sm text-muted-foreground">
                  For carers, nurses, and support staff
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 flex items-center gap-4 justify-start hover:bg-primary/10 hover:border-primary"
              onClick={() => setLoginMode("admin")}
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Admin Login</div>
                <div className="text-sm text-muted-foreground">
                  For care home managers and administrators
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Contact your administrator if you need help signing in
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Hadsul CRM</h1>
        <p className="text-muted-foreground">
          {loginMode === "staff" ? "Staff Portal" : "Admin Portal"}
        </p>
      </div>

      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border shadow-lg",
            headerTitle: "text-card-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border-input text-foreground",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            footerActionLink: "text-primary hover:text-primary/90",
            identityPreviewText: "text-foreground",
            identityPreviewEditButton: "text-primary",
            formFieldInputShowPasswordButton: "text-muted-foreground",
            otpCodeFieldInput: "border-input bg-background text-foreground",
            formResendCodeLink: "text-primary",
            alert: "bg-destructive/10 text-destructive border-destructive/20",
            alertText: "text-destructive",
          },
          variables: {
            colorPrimary: "hsl(var(--primary))",
            colorBackground: "hsl(var(--card))",
            colorText: "hsl(var(--foreground))",
            colorTextSecondary: "hsl(var(--muted-foreground))",
            colorInputBackground: "hsl(var(--background))",
            colorInputText: "hsl(var(--foreground))",
            borderRadius: "var(--radius)",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl={loginMode === "staff" ? "/dashboard/clock" : "/dashboard"}
      />

      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => setLoginMode("select")}
      >
        Back to login options
      </Button>
    </div>
  )
}
