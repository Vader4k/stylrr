"use client";

import { Heart, UserRound } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import NavLinks from "./NavLinks";
import { NavSheet } from "./NavSheet";
import CartIndicator from "@/features/cart/components/CartIndicator";
import SearchModal from "@/features/search/components/SearchModal";
import { hideNavOnRoutes } from "@/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMe } from "@/features/auth/hooks/auth.hooks";

const NavbarLogo = ({ width, height }: { width: number; height: number }) => {
  return (
    <Image
      src="/logo-black.png"
      alt="logo"
      width={width}
      height={height}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className=""
      priority
    />
  );
};

const UserAvatar = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center justify-center font-jost w-7 h-7 rounded-full bg-neutral-600 text-white text-xs font-semibold select-none">
      {initials}
    </div>
  );
};

const Navbar = () => {
  const pathname = usePathname();
  const { data: user } = useMe();

  if (hideNavOnRoutes.some((page) => pathname.includes(page))) return null;

  return (
    <nav className="w-full border-b border-gray-200 font-jost px-3 sticky xl:relative top-0 bg-white z-50 overflow-x-clip">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between py-4 lg:py-6">
        {/* Left — NavSheet always visible, logo+links on xl */}
        <div className="flex items-center gap-8 flex-1">
          <NavSheet />
          <div className="hidden xl:block">
            <NavbarLogo width={120} height={120} />
          </div>
          <div className="hidden xl:block">
            <NavLinks />
          </div>
        </div>

        {/* Center logo — mobile only */}
        <div className="xl:hidden flex items-center justify-center">
          <NavbarLogo width={100} height={30} />
        </div>

        {/* Desktop controls */}
        <div className="hidden xl:flex items-center gap-4">
          {/* No prefetch: a guest prefetch gets the middleware's redirect to
              /account/login cached, and that stale redirect is replayed when
              the user navigates to /account right after logging in. */}
          <Link href={"/account"} prefetch={false}>
            {user ? (
              <UserAvatar name={user.name} />
            ) : (
              <UserRound strokeWidth={1.5} size={22} />
            )}
          </Link>
          <div>
            <Suspense fallback={null}>
              <SearchModal isMobile={false} />
            </Suspense>
          </div>
          <button>
            <Heart strokeWidth={1.5} size={22} />
          </button>
          <CartIndicator isMobile={false} />
        </div>

        {/* Mobile cart — right side */}
        <div className="xl:hidden flex-1 flex items-center justify-end">
          <CartIndicator isMobile={true} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
