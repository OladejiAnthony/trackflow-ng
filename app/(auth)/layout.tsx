export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Gradient mesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(at 20% 30%, rgba(26,79,245,0.2) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(91,148,255,0.12) 0px, transparent 50%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
