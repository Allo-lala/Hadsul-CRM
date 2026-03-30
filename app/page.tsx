"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="h-12 w-12 text-primary animate-pulse" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Hadsul CRM</h1>
      <p className="text-muted-foreground mt-2">Loading...</p>
    </div>
  )
}
