import { getT } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getT();
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-block h-10 w-10 rounded-full border-2 border-mj-gold-300 border-t-mj-maroon-700 animate-spin" />
        <p className="text-xs uppercase tracking-[0.22em] text-mj-mute">{t("loading")}</p>
      </div>
    </div>
  );
}
