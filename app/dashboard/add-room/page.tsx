"use client"
import type { User } from "@supabase/supabase-js"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const AMENITIES_OPTIONS = [
  "WiFi",
  "AC",
  "Furnishing",
  "Kitchen",
  "Bathroom",
  "Parking",
  "Balcony",
  "Hot Water",
  "Geyser",
  "TV",
  "Laundry",
  "Garden",
]

export default function AddRoomPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    rent_price: "",
    property_type: "1 BHK",
    tenant_preference: "Bachelor",
    owner_contact_number: "",
    amenities: [] as string[],
    area_sqft: "",
    floor_number: "",
  })

  const [imageUrls, setImageUrls] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      setUser(authUser)
    }

    checkAuth()
  }, [supabase, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user) return

    setUploadingImage(true)
    setError(null)

    for (const file of Array.from(files)) {
      try {
        const formDataObj = new FormData()
        formDataObj.append("file", file)
        formDataObj.append("userId", user.id)

        const timestamp = Date.now()
        const fileName = `${user.id}/${timestamp}_${file.name}`

        const { data, error: uploadError } = await supabase.storage.from("room-images").upload(fileName, file)

        if (uploadError) throw uploadError

        const publicUrl = supabase.storage.from("room-images").getPublicUrl(data.path).data.publicUrl

        setImageUrls((prev) => [...prev, publicUrl])
      } catch (err) {
        console.error("[v0] Upload error:", err)
        setError("Failed to upload image. Please try again.")
      }
    }

    setUploadingImage(false)
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          rentPrice: Number.parseInt(formData.rent_price),
          propertyType: formData.property_type,
          tenantPreference: formData.tenant_preference,
          ownerContactNumber: formData.owner_contact_number,
          amenities: formData.amenities,
          areaSqft: formData.area_sqft ? Number.parseInt(formData.area_sqft) : null,
          floorNumber: formData.floor_number ? Number.parseInt(formData.floor_number) : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create room")
        return
      }

      const roomId = data.room.id

      // Upload images to room
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const imageResponse = await fetch(`/api/rooms/${roomId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: imageUrls[i],
              displayOrder: i,
            }),
          })

          if (!imageResponse.ok) {
            console.error("[v0] Failed to add image:", imageResponse.status)
          }
        } catch (err) {
          console.error("[v0] Image upload error:", err)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("[v0] Error creating room:", err)
      setError(err instanceof Error ? err.message : "Failed to create room. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 relative overflow-hidden">
      <div className="absolute top-40 left-5 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float pointer-events-none"></div>
      <div
        className="absolute bottom-40 right-10 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph pointer-events-none"
        style={{ animationDelay: "1s" }}
      ></div>

      <Navigation user={user} />

      <section className="py-12 px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto animate-slide-up">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ✚ Add New Room
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill in all the details to create an attractive listing and attract potential tenants
            </p>
          </div>

          {success && (
            <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-slide-up">
              <p className="text-green-700 dark:text-green-400 font-semibold">
                ✓ Room created successfully! Redirecting...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg animate-slide-up">
              <p className="text-destructive font-semibold">✗ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card
              className="border border-border/50 shadow-lg hover:shadow-xl transition-all backdrop-blur-sm bg-card/80 animate-slide-up"
              style={{ animationDelay: "0.05s" }}
            >
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="text-2xl font-bold">📝 Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                    Room Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Cozy 1 BHK in Downtown"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your room in detail - highlight unique features, natural light, view, etc..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-input/50 border border-border/50 backdrop-blur rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary min-h-32 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                    Location *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Bangalore, Indiranagar"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                      Monthly Rent (₹) *
                    </label>
                    <Input
                      type="number"
                      placeholder="15000"
                      required
                      value={formData.rent_price}
                      onChange={(e) => setFormData({ ...formData, rent_price: e.target.value })}
                      className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                      Area (sqft)
                    </label>
                    <Input
                      type="number"
                      placeholder="400"
                      value={formData.area_sqft}
                      onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                      className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                      Property Type *
                    </label>
                    <select
                      required
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      className="w-full bg-input/50 border border-border/50 backdrop-blur rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="1 Bed">1 Bed</option>
                      <option value="2 Bed">2 Bed</option>
                      <option value="3 Bed">3 Bed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                      Tenant Preference *
                    </label>
                    <select
                      required
                      value={formData.tenant_preference}
                      onChange={(e) => setFormData({ ...formData, tenant_preference: e.target.value })}
                      className="w-full bg-input/50 border border-border/50 backdrop-blur rounded-lg px-4 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="Bachelor">Bachelor</option>
                      <option value="Family">Family</option>
                      <option value="Girls">Girls</option>
                      <option value="Working">Working Professionals</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                      Floor Number
                    </label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={formData.floor_number}
                      onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                      className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide">
                      Contact Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      required
                      value={formData.owner_contact_number}
                      onChange={(e) => setFormData({ ...formData, owner_contact_number: e.target.value })}
                      className="bg-input/50 border-border/50 backdrop-blur focus:border-primary focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card
              className="border border-border/50 shadow-lg hover:shadow-xl transition-all backdrop-blur-sm bg-card/80 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-t-lg">
                <CardTitle className="text-2xl font-bold">🎁 Amenities</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">Select all amenities available in your room</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                        formData.amenities.includes(amenity)
                          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg scale-105"
                          : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card
              className="border border-border/50 shadow-lg hover:shadow-xl transition-all backdrop-blur-sm bg-card/80 animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-lg">
                <CardTitle className="text-2xl font-bold">📸 Room Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="border-2 border-dashed border-border/50 hover:border-primary/50 rounded-lg p-8 text-center transition-all duration-300 group bg-gradient-to-br from-primary/5 to-transparent">
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="space-y-2 group-hover:scale-105 transition-transform duration-300">
                      <div className="text-5xl">📸</div>
                      <p className="text-base font-bold text-foreground">Click to upload images</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB each</p>
                      {uploadingImage && (
                        <p className="text-sm text-primary font-semibold animate-pulse">⏳ Uploading...</p>
                      )}
                    </div>
                  </label>
                </div>

                {imageUrls.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      {imageUrls.length} image{imageUrls.length !== 1 ? "s" : ""} uploaded
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-lg">
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Room ${idx + 1}`}
                            className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <span className="text-white font-bold text-3xl">✕</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "🔄 Creating..." : "✓ Create Listing"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 rounded-lg bg-transparent transition-all duration-300 hover:shadow-lg hover:scale-105"
                onClick={() => router.back()}
              >
                ✕ Cancel
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
