"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function Navigation({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          RoomFinder
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/rooms" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Browse Rooms
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link href="/saved" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Saved
              </Link>
            </>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-foreground hover:bg-primary/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-card/50 backdrop-blur-sm animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <Link href="/rooms" className="block py-2 text-foreground hover:text-primary transition-colors font-medium">
              Browse Rooms
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/saved"
                  className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                >
                  Saved Rooms
                </Link>
              </>
            )}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
              {!user ? (
                <>
                  <Link href="/auth/login" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
                  </Link>
                </>
              ) : (
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full text-destructive hover:bg-destructive/10"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
