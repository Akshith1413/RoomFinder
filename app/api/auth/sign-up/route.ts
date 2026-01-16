import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, userType } = await request.json()

    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // ✅ Auth client (SSR, cookies)
    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 })
    }

    // ✅ REAL service role client (RLS bypass)
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        user_type: userType,
      })

    if (profileError) {
      console.error("[profile insert error]", profileError)
      // optional rollback
    }

    return NextResponse.json(
      {
        success: true,
        message: "Sign up successful. Please check your email.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[sign-up error]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
