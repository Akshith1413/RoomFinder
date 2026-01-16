import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch a specific room
export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // First, try with the full join including profiles
    let { data, error } = await supabase
      .from("rooms")
      .select("*, room_images(*), profiles(first_name, last_name, email, phone_number)")
      .eq("id", id)
      .single()

    // If the profiles join fails, fetch room and profile separately
    if (error && error.code === 'PGRST200') {
      console.log("[API] Profiles join failed, fetching separately...")
      
      const { data: roomData, error: roomError } = await supabase
        .from("rooms")
        .select("*, room_images(*)")
        .eq("id", id)
        .single()

      if (roomError) {
        console.error("[API] GET room error:", roomError)
        return NextResponse.json({ error: "Room not found" }, { status: 404 })
      }

      // Fetch owner profile separately
      if (roomData.owner_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name, email, phone_number")
          .eq("id", roomData.owner_id)
          .single()

        data = {
          ...roomData,
          profiles: profileData || null
        }
      } else {
        data = roomData
      }
    } else if (error) {
      console.error("[API] GET room error:", error)
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({ room: data }, { status: 200 })
  } catch (error) {
    console.error("[API] GET room fatal error:", error)
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 })
  }
}

// PUT - Update a room (owner only)
export async function PUT(
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

    // Check if user owns this room
    const { data: room, error: fetchError } = await supabase
      .from("rooms")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (fetchError || room?.owner_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to update this room" }, { status: 403 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from("rooms")
      .update(body)
      .eq("id", id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room: data[0] }, { status: 200 })
  } catch (error) {
    console.error("[API] PUT room error:", error)
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 })
  }
}

// DELETE - Delete a room (owner only)
export async function DELETE(
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

    // Check if user owns this room
    const { data: room, error: fetchError } = await supabase
      .from("rooms")
      .select("owner_id")
      .eq("id", id)
      .single()

    if (fetchError || room?.owner_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to delete this room" }, { status: 403 })
    }

    const { error } = await supabase.from("rooms").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API] DELETE room error:", error)
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 })
  }
}