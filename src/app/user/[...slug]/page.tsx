import { notFound } from "next/navigation";

export default function CatchAllUserRoute({ params }: { params: { slug: string[] } }) {
  // This will trigger the not-found page
  notFound();
}
