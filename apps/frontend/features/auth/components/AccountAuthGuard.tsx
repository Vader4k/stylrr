"use client"

import { useMe } from "../hooks/auth.hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

const AccountAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isFetching } = useMe()
  const router = useRouter()
  // A cached `null` (guest) can be refetching right after login; wait for it
  // instead of treating the stale value as "logged out".
  const isResolving = isLoading || (!data && isFetching)

  useEffect(() => {
    if (!isResolving && !data) {
      // replace (not push) so a stale token doesn't build a back-button loop
      router.replace("/account/login")
    }
  }, [data, isResolving, router])

  if (isResolving) {
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
