"use client"

import { useEffect, useState } from "react"

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="animate-slide-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
              Perfect Room
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Discover amazing rooms in your area. Connect with trusted owners, explore detailed listings, and secure your
            ideal accommodation in minutes.
          </p>
        </div>

        {/* 3D-like card showcase */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              number: "1",
              title: "Search",
              description: "Browse rooms by location, price, and preferences",
            },
            {
              number: "2",
              title: "Explore",
              description: "View detailed photos, amenities, and owner info",
            },
            {
              number: "3",
              title: "Connect",
              description: "Message owners and schedule viewings instantly",
            },
          ].map((step, idx) => (
            <div key={idx} className="group relative" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-card border border-border/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-4xl font-bold text-primary mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
