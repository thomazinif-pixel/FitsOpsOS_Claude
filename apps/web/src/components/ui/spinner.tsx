export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block w-5 h-5 border-2 border-gray-200 border-t-brand-green rounded-full animate-spin ${className}`} />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Spinner className="w-8 h-8 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    </div>
  );
}
