"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"

interface Room {
  id: string
  owner_contact_number: string
  profiles: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function ContactSection({ room, user }: { room: Room; user: User | null }) {
  const [copied, setCopied] = useState(false)

  const copyPhone = () => {
    navigator.clipboard.writeText(room.owner_contact_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendEmail = () => {
    window.location.href = `mailto:${room.profiles.email}?subject=Inquiry about room: ${room.id}`
  }

  return (
    <Card className="border border-border/50 sticky top-24 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-sm bg-card/80">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          👋 Contact Owner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/30 rounded-lg p-5 hover:shadow-lg transition-all duration-300">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Owner Information</p>
          <p className="font-bold text-lg text-foreground">
            {room.profiles.first_name} {room.profiles.last_name}
          </p>
          <a
            href={`mailto:${room.profiles.email}`}
            className="text-sm text-primary hover:text-primary/80 transition-colors mt-2 break-all"
          >
            ✉️ {room.profiles.email}
          </a>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">📞 Contact Number</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-input/50 border border-border/50 backdrop-blur rounded-lg px-4 py-3 text-sm font-mono text-foreground font-semibold">
              {room.owner_contact_number}
            </div>
            <Button
              onClick={copyPhone}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 bg-transparent font-bold transition-all hover:scale-105"
              size="sm"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-border/30">
          <Button
            onClick={sendEmail}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            ✉️ Send Email
          </Button>

          <a href={`tel:${room.owner_contact_number}`} className="block">
            <Button
              variant="outline"
              className="w-full border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 rounded-lg bg-transparent transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              ☎️ Call Owner
            </Button>
          </a>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-lg p-4 text-sm text-muted-foreground hover:shadow-lg transition-all">
          <p className="font-bold text-foreground mb-2">💡 Before Contacting</p>
          <ul className="space-y-1.5 text-xs">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Verify room details match your needs</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Ask about lease terms & deposits</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Schedule an in-person visit</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
