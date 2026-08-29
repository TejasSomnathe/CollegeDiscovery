import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollegeBySlug } from "@/features/colleges/college.service";
import { CollegeDetailClient } from "./college-detail-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) return { title: "College Not Found" };
  return {
    title: college.name,
    description: college.overview.slice(0, 160),
  };
}

export default async function CollegeDetailPage({ params }: Props) {
  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) notFound();

  return <CollegeDetailClient college={college} />;
}
