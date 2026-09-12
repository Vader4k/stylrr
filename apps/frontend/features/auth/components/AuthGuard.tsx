"use client"

import { useMe } from "../hooks/auth.hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useMe()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!data) {
        // If not logged in at all (or stale/invalid token cleared by the
        // API), redirect to main login. replace avoids history-stack loops.
        router.replace("/login")
      } else if (data.role !== "admin") {
        // If logged in but not an admin, redirect to account login
        router.replace("/account/login")
      }
    }
  }, [data, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying authentication...
        </p>
      </div>
    )
  }

  // Only render children if we have an admin user
  if (!data || data.role !== "admin") {
    return null
  }

  return children
}

export default AdminAuthGuard