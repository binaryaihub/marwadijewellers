import { redirect } from "next/navigation";
import { isAdmin, clearAdminCookie } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AdminOrderRow } from "@/components/admin/AdminOrderRow";

async function logout() {
  "use server";
  await clearAdminCookie();
  redirect("/admin/login");
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const rows = await listOrders();

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Orders</h1>
          <p className="text-sm text-mj-mute">Verify UPI payments and update order status.</p>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">Sign out</Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="mj-card bg-white p-10 text-center text-mj-mute">
          No orders yet. They'll appear here as customers check out.
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
