interface Room {
  id: string
  title: string
  description: string
  location: string
  rent_price: number
  property_type: string
  tenant_preference: string
  amenities: string[]
  area_sqft: number
  floor_number: number
  is_available: boolean
}

export default function RoomDetails({ room }: { room: Room }) {
  const amenitiesList = Array.isArray(room.amenities) ? room.amenities : room.amenities?.split(",") || []

  return (
    <div className="space-y-8">
      <div className="border-b border-border/30 pb-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 -mx-6">
        <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          {room.title}
        </h1>
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ₹{room.rent_price.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-lg">/month</span>
        </div>
        <p className="text-lg text-muted-foreground flex items-center gap-2">
          <span className="text-2xl">📍</span> {room.location}
        </p>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Property Type", value: room.property_type, icon: "🏠" },
          { label: "For", value: room.tenant_preference, icon: "👥" },
          { label: "Floor", value: `Floor ${room.floor_number}`, icon: "📍" },
        ].map((info) => (
          <div
            key={info.label}
            className="bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group"
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{info.icon}</div>
            <p className="text-xs text-muted-foreground font-medium uppercase mb-1">{info.label}</p>
            <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {room.description && (
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg group">
          <h2 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
            ✨ About this room
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">{room.description}</p>
        </div>
      )}

      {/* Amenities */}
      {amenitiesList.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg group">
          <h2 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
            🎁 Amenities
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {amenitiesList.map((amenity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-all">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0"></div>
                <span className="text-foreground font-medium">{amenity.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Area Info */}
      {room.area_sqft && (
        <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 hover:border-secondary/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg group">
          <p className="text-sm text-muted-foreground mb-2 font-semibold uppercase">📐 Room Area</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
            {room.area_sqft} <span className="text-xl">sqft</span>
          </p>
        </div>
      )}

      {/* Availability Status */}
      <div
        className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
          room.is_available
            ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 hover:border-green-500/50"
            : "bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 hover:border-red-500/50"
        }`}
      >
        <p
          className={`font-bold text-lg ${
            room.is_available ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {room.is_available ? "✓ Available Now" : "✗ Not Available"}
        </p>
      </div>
    </div>
  )
}
