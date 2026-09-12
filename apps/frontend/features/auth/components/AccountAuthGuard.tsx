"use client"

import { useMe } from "../hooks/auth.hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

const AccountAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useMe()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !data) {
      // replace (not push) so a stale token doesn't build a back-button loop
      router.replace("/account/login")
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

  if (!data) {
    return null
  }

  return children
}

export default AccountAuthGuard
