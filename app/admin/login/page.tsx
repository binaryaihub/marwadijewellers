import { redirect } from "next/navigation";
import { isAdmin, isAdminPasswordCorrect, setAdminCookie } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

async function login(formData: FormData) {
  "use server";
  const password = (formData.get("password") ?? "").toString();
  if (!isAdminPasswordCorrect(password)) {
    redirect("/admin/login?error=1");
  }
  await setAdminCookie();
  redirect("/admin/orders");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin/orders");
  const { error } = await searchParams;

  return (
    <Container className="py-16 md:py-24" size="narrow">
      <div className="mj-card bg-white p-8">
        <h1 className="font-display text-2xl">Admin sign in</h1>
        <p className="text-sm text-mj-mute mt-1">
          For shop owner / staff. Password is set in <code className="text-mj-maroon-700">.env.local</code>.
        </p>
        <form action={login} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
            {error && <p className="mt-2 text-xs text-mj-maroon-700">Incorrect password.</p>}
          </div>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </div>
    </Container>
  );
}
