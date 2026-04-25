import { Star } from "lucide-react";

const reviews = [
  { name: "Priya M.", city: "Jaipur", text: "The kundan set looked like the real thing. Got compliments all night at my cousin's wedding!" },
  { name: "Anish R.", city: "Mumbai", text: "Bought the figaro chain for daily wear. Quality is way above the price. Will buy again." },
  { name: "Kavya S.", city: "Bengaluru", text: "Loved the meenakari jhumkas. Light, beautiful, and pairs with everything in my wardrobe." },
  { name: "Rohit P.", city: "Delhi", text: "The kada is a stunner. UPI checkout was smooth — got delivery in 4 days." },
  { name: "Diya K.", city: "Surat", text: "Ordered for my engagement. Packaging felt premium, jewellery felt premium. 10/10." },
  { name: "Aman T.", city: "Pune", text: "Solid Onyx ring, looks sharp at office and in evenings out. Repeat customer here." },
];

export function Testimonials() {
  const doubled = [...reviews, ...reviews];
  return (
    <div className="overflow-hidden">
      <div className="flex gap-5 marquee-track w-max">
        {doubled.map((r, i) => (
          <article
            key={i}
            className="mj-card bg-white p-6 w-[320px] shrink-0"
          >
            <div className="flex items-center gap-0.5 text-mj-gold-500 mb-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className="size-4 fill-mj-gold-500" />
              ))}
            </div>
            <p className="text-mj-ink leading-relaxed">"{r.text}"</p>
            <p className="mt-4 text-sm font-semibold text-mj-maroon-800">
              {r.name} <span className="text-mj-mute font-normal">· {r.city}</span>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
