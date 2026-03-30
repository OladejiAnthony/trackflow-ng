import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-3xl animate-pulse h-96 rounded-3xl bg-white/5" />
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
