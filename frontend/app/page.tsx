import React from "react";
import Link from "next/link";
import { Button } from "@/common/components/ui/button";
import { DesignSystemShowcase } from "@/app/DesignSystemShowcase";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-heading-2 font-semibold">
            Home Again Furniture Bank
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="flex justify-center gap-md mb-xl">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">API docs (Swagger)</Button>
          </a>
          <Link href="/component-gallery">
            <Button variant="outline">Component Gallery</Button>
          </Link>
          <Link href="/agencies">
            <Button variant="outline">Agencies</Button>
          </Link>
        </div>

        <DesignSystemShowcase />
      </main>
    </div>
  );
}
