import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
        <FileQuestion aria-hidden="true" className="size-5" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold">
        Page not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        This documentation route does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Return to docs
      </Link>
    </div>
  );
}
