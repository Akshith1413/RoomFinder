import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch images for a room
export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("room_images")
      .select("*")
      .eq("room_id", id)
      .order("display_order", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ images: data }, { status: 200 })
  } catch (error) {
    console.error("[API] GET images error:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}

// POST - Add images to a room (owner only)
export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: room, error: fetchError } = await supabase
      .from("rooms")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (fetchError || room?.owner_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { imageUrl, displayOrder } = await request.json()

    const { data, error } = await supabase
      .from("room_images")
      .insert({
        room_id: id,
        image_url: imageUrl,
        display_order: displayOrder || 0,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ image: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[API] POST images error:", error)
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 })
  }
}