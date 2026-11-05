export default function PageLoader({ text = 'Đang tải hương vị...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-xs text-muted-foreground mt-3 font-semibold">{text}</p>
    </div>
  );
}
