import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// DELETE - Unsave a room
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

    const { error } = await supabase
      .from("saved_rooms")
      .delete()
      .eq("room_id", id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API] DELETE saved room error:", error)
    return NextResponse.json({ error: "Failed to unsave room" }, { status: 500 })
  }
}