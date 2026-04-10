import LoginCard from "@/components/auth/LoginCard";
import LoginHero from "@/components/auth/LoginHero";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <LoginHero />
      <LoginCard />
    </div>
  );
}
