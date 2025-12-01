import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">404 - Page Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/items">Browse Items</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
