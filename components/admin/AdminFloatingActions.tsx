import Link from "next/link";
import { Plus } from "lucide-react";

export function AdminFloatingActions() {
  return (
    <div className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-30 flex flex-col gap-2">
      <Link
        href="/admin/products/new"
        className="inline-flex items-center gap-2 rounded-full bg-mj-maroon-700 px-4 py-3 text-sm font-semibold text-mj-gold-200 shadow-lg hover:bg-mj-maroon-800"
      >
        <Plus className="size-4" /> Add product
      </Link>
    </div>
  );
}
