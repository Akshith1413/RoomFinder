"use client"
import type { User } from "@supabase/supabase-js"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import ImageGallery from "@/components/image-gallery"
import RoomDetails from "@/components/room-details"
import ContactSection from "@/components/contact-section"

interface Room {
  id: string
  title: string
  description: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  owner_contact_number: string
  amenities: string[]
  area_sqft: number
  floor_number: number
  is_available: boolean
  room_images: Array<{ id: string; image_url: string }>
  profiles: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function RoomDetailPage() {
  const params = useParams()
  const roomId = params.id as string
  const [room, setRoom] = useState<Room | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setUser(authUser)

      try {
        const response = await fetch(`/api/rooms/${roomId}`)
        const data = await response.json()

        if (data.room) {
          setRoom(data.room)

          // Check if saved
          if (authUser) {
            const { data: saved } = await supabase
              .from("saved_rooms")
              .select("id")
              .eq("room_id", roomId)
              .eq("user_id", authUser.id)
              .single()

            setIsSaved(!!saved)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching room:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [roomId, supabase])

  const toggleSave = async () => {
    if (!user) return

    if (isSaved) {
      await supabase.from("saved_rooms").delete().eq("room_id", roomId).eq("user_id", user.id)
      setIsSaved(false)
    } else {
      await supabase.from("saved_rooms").insert({ room_id: roomId, user_id: user.id })
      setIsSaved(true)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
        <Navigation user={user} />
        <div className="h-96 md:h-[600px] bg-gradient-to-br from-muted to-muted/50 animate-pulse"></div>
        <section className="py-12 px-4 md:px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted rounded-xl animate-pulse"></div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
        <Navigation user={user} />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="text-6xl mb-4">🏚️</div>
            <p className="text-2xl font-bold text-foreground mb-2">Room not found</p>
            <p className="text-muted-foreground">This room listing may have been removed or is no longer available.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 relative overflow-hidden">
      <div className="absolute top-96 left-5 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float pointer-events-none"></div>
      <div
        className="absolute bottom-40 right-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      <Navigation user={user} />

      <section className="relative z-10">
        <ImageGallery images={room.room_images} isSaved={isSaved} onToggleSave={toggleSave} />
      </section>

      <section className="py-12 px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 animate-slide-up">
            <RoomDetails room={room} />
          </div>

          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <ContactSection room={room} user={user} />
          </div>
        </div>
      </section>
    </main>
  )
}
