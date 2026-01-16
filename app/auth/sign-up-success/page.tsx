"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/10 relative overflow-hidden">
      <div className="absolute top-10 right-20 w-80 h-80 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
      <div
        className="absolute bottom-10 left-10 w-80 h-80 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <Card className="border border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-3 text-center">
            <div className="text-6xl mx-auto mb-2 animate-pulse-scale">✓</div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Account Created!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-foreground font-semibold">Welcome to RoomFinder</p>
              <p className="text-muted-foreground">
                Check your email to confirm your account. You&apos;ll be able to start browsing rooms once you verify
                your email.
              </p>
            </div>
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
