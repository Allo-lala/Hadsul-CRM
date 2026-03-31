import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Fetch care home name if the user belongs to one
  let careHomeName: string | null = null
  if (user.care_home_id) {
    try {
      const rows = await sql`
        SELECT name FROM care_homes WHERE id = ${user.care_home_id} LIMIT 1
      `
      careHomeName = (rows[0] as { name: string } | undefined)?.name ?? null
    } catch {
      // non-fatal — sidebar will fall back gracefully
    }
  }

  const userProps = {
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    careHomeName,
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={userProps} />
      <main className="lg:pl-64 transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
