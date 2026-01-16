import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // If no code, send user to login
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  // If exchange fails, go to error page
  if (error) {
    console.error("Auth callback error:", error.message)
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  // ✅ SUCCESS: cookies are now set
  return NextResponse.redirect(`${origin}/`)
}
