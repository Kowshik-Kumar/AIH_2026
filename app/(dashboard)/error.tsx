"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="h-20 w-20 bg-danger/10 text-danger rounded-full flex items-center justify-center border border-danger/20 shadow-lg shadow-danger/10">
        <AlertCircle className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          An unexpected error occurred while loading this section. Our systems have been notified.
        </p>
      </div>
      <Button onClick={() => reset()} variant="default" size="lg" className="rounded-full px-8">
        Try again
      </Button>
    </div>
  );
}
