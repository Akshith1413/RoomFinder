"use client"

import { useEffect, useRef } from "react"

export default function HeroSection3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let animationFrame = 0
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
    }> = []

    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * (canvas.width / window.devicePixelRatio),
        y: Math.random() * (canvas.height / window.devicePixelRatio),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
      })
    }

    const animate = () => {
      const width = canvas.width / window.devicePixelRatio
      const height = canvas.height / window.devicePixelRatio

      ctx.fillStyle = "rgba(250, 250, 249, 0.02)"
      ctx.fillRect(0, 0, width, height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > width) particle.vx *= -1
        if (particle.y < 0 || particle.y > height) particle.vy *= -1

        ctx.fillStyle = `rgba(85, 153, 187, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.strokeStyle = `rgba(85, 153, 187, ${(1 - distance / 150) * 0.2})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/50">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Animated blur blobs */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
      <div
        className="absolute -bottom-20 right-20 w-80 h-80 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div className="absolute top-1/3 left-1/2 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-morph"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 md:px-6 animate-slide-up">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse-scale">
                Find Your Perfect Room
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover, connect, and rent the ideal room for your lifestyle. Simple. Secure. Successful.
            </p>
          </div>

          {/* 3D-like cards showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: "🔍", title: "Easy Search", desc: "Find rooms with advanced filters" },
              { icon: "🏠", title: "Verified Listings", desc: "Trusted room owners & details" },
              { icon: "✓", title: "Secure Booking", desc: "Safe and transparent process" },
            ].map((item, i) => (
              <div
                key={i}
                className="group p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
