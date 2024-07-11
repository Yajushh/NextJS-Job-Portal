import { jobFilterValues } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import JobListItem from "./JobListItem";
import Link from "next/link";

interface JobResultsProps {
  filterValues: jobFilterValues;
}

export default async function JobResults({
  filterValues: { q, type, location, remote },
}: JobResultsProps) {
  const searchString = q
    ?.split(" ")
    .filter((word) => word.length > 0)
    .join(" & ");
  const searchFilter: Prisma.JobWhereInput = searchString
    ? {
        OR: [
          { title: { search: searchString } },
          { type: { search: searchString } },
          { location: { search: searchString } },
          { locationType: { search: searchString } },
          { companyName: { search: searchString } },
        ],
      }
    : {};
  const where: Prisma.JobWhereInput = {
    AND: [
      searchFilter,
      { approved: true },
      type ? { type } : {},
      location ? { location } : {},
      remote ? { locationType: "Remote" } : {},
    ],
  };
  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="grow space-y-4">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.slug}`} className="block">
          <JobListItem job={job} />
        </Link>
      ))}
      {jobs.length === 0 && (
        <div className="text-md mx-auto flex items-center font-medium">
          No Jobs found
        </div>
      )}
    </div>
  );
}
