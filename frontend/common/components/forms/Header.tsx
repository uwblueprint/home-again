import Image from "next/image";
import { cn } from "@/common/lib/utils";

interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function Header({ className, children }: HeaderProps) {
  return (
    <header
      className={cn(
        "grid w-full grid-cols-[96px_minmax(0,1fr)_96px] items-center gap-4 px-4 py-5 md:px-8",
        className
      )}
    >
      <Image
        src="/hafb_logo.svg"
        alt="Home Again Furniture Bank"
        width={96}
        height={58}
        className="h-auto w-auto"
        priority
      />
      <div className="flex items-center justify-center">{children}</div>
      <div aria-hidden="true" />
    </header>
  );
}
