import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <CardContent className="flex flex-col items-center gap-4 p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember-600/15 text-ember-400">
            <Compass className="h-7 w-7" />
          </span>
          <h1 className="font-display text-3xl font-bold">404</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Такой страницы нет — похоже, крипы завели вас не в тот лес.
          </p>
          <Button asChild className="mt-2">
            <Link href="/">На главную</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
