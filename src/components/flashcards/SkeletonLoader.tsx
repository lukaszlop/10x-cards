import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="h-[350px]">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t bg-gray-50/50">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
