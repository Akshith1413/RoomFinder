import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"
import HeroSection3D from "@/components/hero-section-3d"
import SearchSection from "@/components/search-section"
import FeaturedRooms from "@/components/featured-rooms"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-background via-background to-secondary/5 overflow-hidden">
      <Navigation user={user} />
      <HeroSection3D />
      <SearchSection />
      <FeaturedRooms />

      {/* CTA Section with 3D effects */}
      <section className="py-24 px-4 md:px-6 relative overflow-hidden">
        <div
          className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute -bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph"
          style={{ animationDelay: "1s" }}
        ></div>

        <div
          className="max-w-4xl mx-auto text-center animate-slide-up relative z-10"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Ready to find your perfect room?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of happy renters and room owners using RoomFinder to connect and discover great
            accommodations in your area.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold px-10 py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-base">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary/10 font-bold px-10 py-6 rounded-lg bg-transparent transition-all duration-300 hover:shadow-lg hover:scale-105 text-base"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/rooms">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold px-10 py-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 text-base">
                  Browse Rooms
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary/10 font-bold px-10 py-6 rounded-lg bg-transparent transition-all duration-300 hover:shadow-lg hover:scale-105 text-base"
                >
                  My Dashboard
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
