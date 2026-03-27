import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md glass rounded-3xl p-8 border border-white/10 animate-pulse">
          <div className="h-8 skeleton rounded-lg mb-6 mx-auto w-48" />
          <div className="h-12 skeleton rounded-xl mb-4" />
          <div className="h-12 skeleton rounded-xl mb-4" />
          <div className="h-12 skeleton rounded-xl" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
