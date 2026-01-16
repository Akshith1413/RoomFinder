"use client"

import type React from "react"
import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  area_sqft: number | null
  floor_number: number | null
  is_available: boolean
  room_images: Array<{ id: string; image_url: string }>
}

export default function EditRoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const router = useRouter()
 const [user, setUser] = useState<User | null>(null)

  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

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
    is_available: true,
  })

  const [imageUrls, setImageUrls] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      setUser(authUser)

      const { data, error } = await supabase
        .from("rooms")
        .select(`
          *,
          room_images(id, image_url)
        `)
        .eq("id", roomId)
        .single()

      if (!error && data) {
        setRoom(data as Room)
        setFormData({
          title: data.title,
          description: data.description || "",
          location: data.location,
          rent_price: data.rent_price.toString(),
          property_type: data.property_type,
          tenant_preference: data.tenant_preference,
          owner_contact_number: data.owner_contact_number,
          amenities: data.amenities || [],
          area_sqft: data.area_sqft ? data.area_sqft.toString() : "",
          floor_number: data.floor_number ? data.floor_number.toString() : "",
          is_available: data.is_available,
        })
        setImageUrls(data.room_images.map((img: any) => img.image_url))
      }

      setIsLoading(false)
    }

    fetchData()
  }, [roomId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !user) return

    setUploadingImage(true)

    for (const file of Array.from(files)) {
      try {
        const timestamp = Date.now()
        const fileName = `${user.id}/${timestamp}_${file.name}`

        const { data, error } = await supabase.storage.from("room-images").upload(fileName, file)

        if (error) throw error

        const publicUrl = supabase.storage.from("room-images").getPublicUrl(data.path).data.publicUrl

        setImageUrls((prev) => [...prev, publicUrl])
      } catch (error) {
        console.error("Upload error:", error)
        alert("Failed to upload image")
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
    if (!room) return

    setIsSaving(true)

    try {
      const { error: updateError } = await supabase
        .from("rooms")
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          rent_price: Number.parseInt(formData.rent_price),
          property_type: formData.property_type,
          tenant_preference: formData.tenant_preference,
          owner_contact_number: formData.owner_contact_number,
          amenities: formData.amenities,
          area_sqft: formData.area_sqft ? Number.parseInt(formData.area_sqft) : null,
          floor_number: formData.floor_number ? Number.parseInt(formData.floor_number) : null,
          is_available: formData.is_available,
        })
        .eq("id", roomId)

      if (updateError) throw updateError

      // Handle new images
      const currentImageUrls = room.room_images.map((img: any) => img.image_url)
      const newImages = imageUrls.filter((url) => !currentImageUrls.includes(url))

      for (let i = 0; i < newImages.length; i++) {
        await supabase.from("room_images").insert({
          room_id: roomId,
          image_url: newImages[i],
          display_order: currentImageUrls.length + i,
        })
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating room:", error)
      alert("Failed to update room. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation user={user} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <Navigation user={user} />

      <section className="py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto animate-slide-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">Edit Room</h1>
          <p className="text-muted-foreground mb-8">Update your room listing details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Room Title *</label>
                  <Input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-input border-border/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
                  <Input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-input border-border/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Monthly Rent (₹) *</label>
                    <Input
                      type="number"
                      required
                      value={formData.rent_price}
                      onChange={(e) => setFormData({ ...formData, rent_price: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Area (sqft)</label>
                    <Input
                      type="number"
                      value={formData.area_sqft}
                      onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Property Type *</label>
                    <select
                      required
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-foreground"
                    >
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="1 Bed">1 Bed</option>
                      <option value="2 Bed">2 Bed</option>
                      <option value="3 Bed">3 Bed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tenant Preference *</label>
                    <select
                      required
                      value={formData.tenant_preference}
                      onChange={(e) => setFormData({ ...formData, tenant_preference: e.target.value })}
                      className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-foreground"
                    >
                      <option value="Bachelor">Bachelor</option>
                      <option value="Family">Family</option>
                      <option value="Girls">Girls</option>
                      <option value="Working">Working</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Floor Number</label>
                    <Input
                      type="number"
                      value={formData.floor_number}
                      onChange={(e) => setFormData({ ...formData, floor_number: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Contact Number *</label>
                    <Input
                      type="tel"
                      required
                      value={formData.owner_contact_number}
                      onChange={(e) => setFormData({ ...formData, owner_contact_number: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4 rounded border-border/50"
                    />
                    <span className="text-sm font-medium text-foreground">Mark as available for booking</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`py-2 px-3 rounded-lg font-medium transition-all text-sm ${
                        formData.amenities.includes(amenity)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground border border-border hover:border-primary"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-xl">Room Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="space-y-2">
                      <div className="text-3xl">📸</div>
                      <p className="text-sm font-medium text-foreground">Click to add more images</p>
                      {uploadingImage && <p className="text-xs text-primary">Uploading...</p>}
                    </div>
                  </label>
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Room ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-white font-bold text-xl">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
