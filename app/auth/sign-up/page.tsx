"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
    firstName: "",
    lastName: "",
    userType: "finder" as "finder" | "owner",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Sign up failed")
        return
      }

      router.push("/auth/sign-up-success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-background via-background to-secondary/10 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
      <div
        className="absolute -bottom-32 right-20 w-72 h-72 bg-accent/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph"></div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <Card className="border border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Join RoomFinder
            </CardTitle>
            <CardDescription className="text-base">Create your account and find your perfect room</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">I am a</Label>
                <div className="flex gap-3">
                  {[
                    { value: "finder" as const, label: "Room Finder" },
                    { value: "owner" as const, label: "Room Owner" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, userType: option.value }))}
                      className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-300 ${
                        formData.userType === option.value
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/30 hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeatPassword" className="text-sm font-semibold text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="repeatPassword"
                  name="repeatPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.repeatPassword}
                  onChange={handleInputChange}
                  className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/30 animate-slide-up">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
