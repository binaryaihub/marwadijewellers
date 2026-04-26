import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";

export const metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mj-ivory">
      <header className="border-b border-mj-line bg-white">
        <Container className="flex items-center justify-between py-3">
          <Logo size="sm" />
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin/orders" className="text-mj-ink hover:text-mj-maroon-700">Orders</Link>
            <Link href="/admin/products" className="text-mj-ink hover:text-mj-maroon-700">Catalog</Link>
            <Link href="/" className="text-mj-mute hover:text-mj-maroon-700">View site →</Link>
          </nav>
        </Container>
      </header>
      <main>{children}</main>
    </div>
  );
}
