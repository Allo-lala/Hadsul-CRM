import { redirect } from "next/navigation"
import { getCurrentUser } from "@/backend/lib/auth"
import { getDb } from "@/backend/lib/db"
import { Sidebar } from "@/frontend/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const db = getDb()

  // Fetch care home name and profile image
  let careHomeName: string | null = null
  let profileImageUrl: string | null = null

  try {
    const userRow = await db`SELECT profile_image_url FROM users WHERE id = ${user.id} LIMIT 1`
    profileImageUrl = (userRow[0] as { profile_image_url: string | null } | undefined)?.profile_image_url ?? null
  } catch { /* non-fatal */ }

  if (user.care_home_id) {
    try {
      const rows = await db`SELECT name FROM care_homes WHERE id = ${user.care_home_id} LIMIT 1`
      careHomeName = (rows[0] as { name: string } | undefined)?.name ?? null
    } catch { /* non-fatal */ }
  }

  const userProps = {
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    careHomeName,
    profileImageUrl,
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
