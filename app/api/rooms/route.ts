import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET - Fetch all rooms with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const location = searchParams.get("location")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const propertyType = searchParams.get("propertyType")
    const tenantPref = searchParams.get("tenantPref")

    // Try with profiles join first
    let query = supabase
      .from("rooms")
      .select("*, room_images(*), profiles(first_name, last_name, email)")

    if (location) {
      query = query.ilike("location", `%${location}%`)
    }
    if (minPrice) {
      query = query.gte("rent_price", Number.parseInt(minPrice))
    }
    if (maxPrice) {
      query = query.lte("rent_price", Number.parseInt(maxPrice))
    }
    if (propertyType) {
      query = query.eq("property_type", propertyType)
    }
    if (tenantPref) {
      query = query.eq("tenant_preference", tenantPref)
    }

    let { data, error } = await query
      .eq("is_available", true)
      .order("created_at", { ascending: false })

    // If profiles join fails, fetch without it
    if (error && error.code === 'PGRST200') {
      console.log("[API] Profiles join failed, fetching without profiles...")
      
      let simpleQuery = supabase
        .from("rooms")
        .select("*, room_images(*)")

      if (location) {
        simpleQuery = simpleQuery.ilike("location", `%${location}%`)
      }
      if (minPrice) {
        simpleQuery = simpleQuery.gte("rent_price", Number.parseInt(minPrice))
      }
      if (maxPrice) {
        simpleQuery = simpleQuery.lte("rent_price", Number.parseInt(maxPrice))
      }
      if (propertyType) {
        simpleQuery = simpleQuery.eq("property_type", propertyType)
      }
      if (tenantPref) {
        simpleQuery = simpleQuery.eq("tenant_preference", tenantPref)
      }

      const result = await simpleQuery
        .eq("is_available", true)
        .order("created_at", { ascending: false })

      data = result.data
      error = result.error
    }

    if (error) {
      console.error("[API] GET rooms error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rooms: data }, { status: 200 })
  } catch (error) {
    console.error("[API] GET rooms fatal error:", error)
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}

// POST - Create a new room (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      location,
      rentPrice,
      propertyType,
      tenantPreference,
      ownerContactNumber,
      amenities,
      areaSqft,
      floorNumber,
    } = body

    if (!title || !location || !rentPrice || !propertyType || !tenantPreference || !ownerContactNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        title,
        description,
        location,
        rent_price: rentPrice,
        property_type: propertyType,
        tenant_preference: tenantPreference,
        owner_contact_number: ownerContactNumber,
        amenities,
        area_sqft: areaSqft ?? null,
        floor_number: floorNumber ?? null,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] POST room error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ room: data }, { status: 201 })
  } catch (error) {
    console.error("[API] POST rooms fatal error:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}