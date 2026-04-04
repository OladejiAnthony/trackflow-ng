import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold text-slate-800 dark:text-slate-100">404</h1>
      <p className="text-slate-500 dark:text-slate-400">Page not found.</p>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline underline-offset-2"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
