import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch user's saved rooms
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("saved_rooms")
      .select(
        `
        *,
        rooms(*, room_images(*))
      `,
      )
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ savedRooms: data }, { status: 200 })
  } catch (error) {
    console.error("[v0] GET saved rooms error:", error)
    return NextResponse.json({ error: "Failed to fetch saved rooms" }, { status: 500 })
  }
}

// POST - Save a room
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId } = await request.json()

    const { data, error } = await supabase
      .from("saved_rooms")
      .insert({
        user_id: user.id,
        room_id: roomId,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ savedRoom: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] POST saved room error:", error)
    return NextResponse.json({ error: "Failed to save room" }, { status: 500 })
  }
}
