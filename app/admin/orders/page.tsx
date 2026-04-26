import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin, clearAdminCookie } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AdminOrderRow } from "@/components/admin/AdminOrderRow";
import { cn } from "@/lib/cn";

async function logout() {
  "use server";
  await clearAdminCookie();
  redirect("/admin/login");
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { view } = await searchParams;
  const showArchived = view === "archived";
  const rows = await listOrders({ archived: showArchived });

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Orders</h1>
          <p className="text-sm text-mj-mute">
            {showArchived ? "Archived orders." : "Verify UPI payments and update order status."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewTab href="/admin/orders" active={!showArchived}>
            Active
          </ViewTab>
          <ViewTab href="/admin/orders?view=archived" active={showArchived}>
            Archived
          </ViewTab>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mj-card bg-white p-10 text-center text-mj-mute">
          {showArchived
            ? "No archived orders yet."
            : "No orders yet. They'll appear here as customers check out."}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <AdminOrderRow key={r.order.id} order={r.order} items={r.items} />
          ))}
        </div>
      )}
    </Container>
  );
}

function ViewTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-mj-maroon-700 bg-mj-maroon-700 text-mj-ivory"
          : "border-mj-line bg-white text-mj-mute hover:border-mj-gold-300",
      )}
    >
      {children}
    </Link>
  );
}
