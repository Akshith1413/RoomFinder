"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Heart } from "lucide-react"

interface Room {
  id: string
  title: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  room_images?: Array<{ image_url: string }>
}

export default function FeaturedRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRooms = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("rooms")
        .select(`
          id,
          title,
          location,
          rent_price,
          property_type,
          tenant_preference,
          room_images(image_url)
        `)
        .eq("is_available", true)
        .limit(6)

      if (!error && data) {
        setRooms(data)
      }
      setIsLoading(false)
    }

    fetchRooms()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Featured Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="animate-slide-up">
          <h2 className="text-3xl font-bold text-foreground mb-8">Featured Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, idx) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <Card
                  className="group overflow-hidden border-border/50 hover:border-primary transition-all duration-300 cursor-pointer h-full hover:shadow-2xl hover:-translate-y-2"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {room.room_images?.[0]?.image_url ? (
                        <img
                          src={room.room_images[0].image_url || "/placeholder.svg"}
                          alt={room.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all">
                        <Heart size={20} className="text-accent" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {room.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">📍 {room.location}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">₹{room.rent_price.toLocaleString()}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-secondary/30 text-secondary-foreground px-3 py-1 rounded-full font-medium">
                          {room.property_type}
                        </span>
                        <span className="text-xs bg-accent/20 text-accent-foreground px-3 py-1 rounded-full font-medium">
                          {room.tenant_preference}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
