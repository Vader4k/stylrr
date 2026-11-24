"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Settings,
    LogOut
} from "lucide-react"
import { SIDEBAR_LINKS } from "@/constants"
import { useLogout } from "@/features/auth/hooks/auth.hooks"


export const Sidebar = () => {
    const pathname = usePathname()
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const logout = useLogout()

    const handleLogout = () => {
        logout.mutate(undefined, {
            // full load: avoids the AuthGuard racing us to /login and clears
            // the cached session
            onSuccess: () => {
                window.location.replace("/")
            },
        })
    }

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform">
            <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
                <div className="mb-6 px-3">
                    <Link href="/admin" className="flex items-center">
                        <span className="self-center whitespace-nowrap text-xl font-bold dark:text-white">
                            Stylr <span className="text-primary">Admin</span>
                        </span>
                    </Link>
                </div>

                <ul className="space-y-2 font-medium flex-1">
                    {SIDEBAR_LINKS.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))

                        return (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    className={`flex items-center p-2 text-xs text-gray-900 hover:bg-gray-100 ${isActive ? "bg-gray-100 text-primary" : ""
                                        }`}
                                >
                                    <Icon strokeWidth={1} className={`size-4.5 transition-colors ${isActive ? "text-primary" : "text-gray-500"}`} />
                                    <span className={`ml-3 ${isActive ? "text-primary" : "text-gray-500"}`}>{link.name}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                <ul className="mt-auto space-y-2 font-medium pt-4 border-t border-gray-200">
                    <li>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex w-full items-center rounded-lg p-2 text-xs text-red-600 hover:bg-red-50"
                        >
                            <LogOut strokeWidth={1} className="size-4.5 transition-colors" />
                            <span className="ml-3">Logout</span>
                        </button>
                    </li>
                </ul>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Are you sure you want to log out? You will be redirected to the homepage.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={logout.isPending}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {logout.isPending ? "Logging out…" : "Logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    )
}
