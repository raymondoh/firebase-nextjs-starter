export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
        <div className="space-y-2 mb-6">
          <div className="h-7 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-72 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-full bg-primary/30 rounded animate-pulse mt-6"></div>
        </div>
      </div>
    </div>
  );
}
