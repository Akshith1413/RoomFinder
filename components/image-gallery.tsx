"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"

interface Image {
  id: string
  image_url: string
}

export default function ImageGallery({
  images,
  isSaved,
  onToggleSave,
}: {
  images: Image[]
  isSaved: boolean
  onToggleSave: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % (images.length || 1))
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + (images.length || 1)) % (images.length || 1))
  }

  const currentImage = images?.[currentIndex]?.image_url || "/placeholder.svg"

  return (
    <div className="relative w-full h-96 md:h-[600px] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 group">
      {/* Main Image with 3D effect */}
      <img
        src={currentImage || "/placeholder.svg"}
        alt="Room"
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 filter group-hover:brightness-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/20 transition-all duration-500"></div>

      <button
        onClick={onToggleSave}
        className={`absolute top-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-125 backdrop-blur-sm ${
          isSaved
            ? "bg-accent text-white scale-110 shadow-accent/50"
            : "bg-white/80 text-accent hover:bg-white hover:scale-105 backdrop-blur-md"
        }`}
      >
        <Heart size={28} fill={isSaved ? "currentColor" : "none"} className="transition-all" />
      </button>

      {/* Navigation Buttons */}
      {images && images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110 duration-300"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110 duration-300"
          >
            <ChevronRight size={24} className="text-foreground" />
          </button>
        </>
      )}

      {/* Image Indicators */}
      {images && images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "bg-white w-8 shadow-lg" : "bg-white/50 w-2 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images && images.length > 0 && (
        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-bold border border-white/20">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
