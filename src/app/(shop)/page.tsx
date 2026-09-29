import { getPublishedContent } from "@/lib/site-content/get";
import { HomeView } from "@/components/shop/HomeView";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const [{ categoria }, content] = await Promise.all([searchParams, getPublishedContent()]);
  return <HomeView categoria={categoria} content={content} />;
}
