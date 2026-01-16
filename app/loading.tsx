export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 z-50">
      <div className="space-y-4 text-center">
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
        <p className="text-muted-foreground font-semibold">Loading...</p>
      </div>
    </div>
  )
}
