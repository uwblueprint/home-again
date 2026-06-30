"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/common/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/common/components/ui/tabs";

function FurnitureCategoryIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
    >
      <path
        d="M8.29758 1.2053C9.42187 0.987719 10.5774 0.987722 11.7017 1.2053C12.0405 1.27086 12.2619 1.59813 12.1965 1.9369C12.1309 2.27579 11.803 2.49809 11.4641 2.43251C10.4967 2.24532 9.50258 2.2453 8.53521 2.43251C8.19632 2.49809 7.86837 2.27579 7.80279 1.9369C7.73744 1.59818 7.95889 1.27092 8.29758 1.2053Z"
        className="fill-current"
      />
      <path
        d="M11.4641 17.5684C11.8029 17.5028 12.1309 17.7244 12.1965 18.0632C12.2621 18.4021 12.0406 18.73 11.7017 18.7956C10.5775 19.0132 9.42184 19.0132 8.29758 18.7956C7.95873 18.73 7.73721 18.4021 7.80279 18.0632C7.8684 17.7244 8.19634 17.5028 8.53521 17.5684C9.50253 17.7556 10.4968 17.7556 11.4641 17.5684Z"
        className="fill-current"
      />
      <path
        d="M14.157 2.74989C14.3506 2.46416 14.7395 2.38945 15.0253 2.58306C15.9761 3.22732 16.7942 4.04849 17.435 5.00168C17.6275 5.28813 17.5513 5.67662 17.2649 5.8692C16.9784 6.06176 16.5899 5.98559 16.3974 5.69911C15.846 4.87893 15.1419 4.17258 14.3238 3.61822C14.0381 3.42459 13.9633 3.03564 14.157 2.74989Z"
        className="fill-current"
      />
      <path
        d="M1.2053 8.29758C1.27092 7.95889 1.59818 7.73744 1.9369 7.80279C2.27579 7.86837 2.49809 8.19632 2.43251 8.53521C2.2453 9.50258 2.24532 10.4967 2.43251 11.4641C2.49809 11.803 2.27579 12.1309 1.9369 12.1965C1.59813 12.2619 1.27086 12.0405 1.2053 11.7017C0.987722 10.5774 0.987719 9.42187 1.2053 8.29758Z"
        className="fill-current"
      />
      <path
        d="M16.3819 14.3238C16.5755 14.0381 16.9645 13.9634 17.2502 14.157C17.5358 14.3506 17.6106 14.7396 17.417 15.0253C16.7727 15.9762 15.9509 16.7942 14.9976 17.435C14.7112 17.6273 14.3235 17.5511 14.1309 17.2649C13.9384 16.9784 14.0145 16.5899 14.301 16.3974C15.1211 15.846 15.8276 15.1419 16.3819 14.3238Z"
        className="fill-current"
      />
      <path
        d="M18.0632 7.80279C18.4021 7.73721 18.73 7.95873 18.7956 8.29758C19.0132 9.42184 19.0132 10.5775 18.7956 11.7017C18.73 12.0406 18.4021 12.2621 18.0632 12.1965C17.7244 12.1309 17.5028 11.8029 17.5684 11.4641C17.7556 10.4968 17.7556 9.50253 17.5684 8.53521C17.5028 8.19634 17.7244 7.8684 18.0632 7.80279Z"
        className="fill-current"
      />
      <path
        d="M5.00168 2.56597C5.28816 2.37341 5.67664 2.44958 5.8692 2.73606C6.06161 3.02251 5.98552 3.41023 5.69911 3.60276C4.87894 4.15406 4.17259 4.85823 3.61822 5.67633C3.4246 5.96208 3.03565 6.03678 2.74989 5.84315C2.46441 5.64952 2.38968 5.2613 2.58306 4.97564C3.22729 4.02486 4.04855 3.20671 5.00168 2.56597Z"
        className="fill-current"
      />
      <path
        d="M2.73592 14.1308C3.02238 13.9384 3.41008 14.0145 3.60261 14.3009C4.15392 15.1211 4.85808 15.8274 5.67618 16.3818C5.96194 16.5754 6.03663 16.9644 5.84301 17.2501C5.64937 17.5355 5.26111 17.6103 4.9755 17.417C4.0246 16.7727 3.2066 15.9508 2.56583 14.9975C2.37335 14.7111 2.44947 14.3234 2.73592 14.1308Z"
        className="fill-current"
      />
    </svg>
  );
}

function FurnitureCategoryTabs({
  className,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  return <Tabs className={className} {...props} />;
}

function FurnitureCategoryTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return <TabsList className={className} {...props} />;
}

function FurnitureCategoryTabsTrigger({
  className,
  children,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="furniture-category-tabs-trigger"
      className={cn(
        "relative flex min-h-[29px] min-w-[29px] items-center justify-center gap-sm border-b-2 border-transparent px-2xl py-xs text-paragraph-regular font-medium whitespace-nowrap text-neutral-400 transition-colors [&:not([data-active])]:hover:text-neutral-500 data-active:border-[var(--brand-purples-700)] data-active:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <FurnitureCategoryIcon />
      {children}
    </TabsPrimitive.Tab>
  );
}

function FurnitureCategoryTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return <TabsContent className={className} {...props} />;
}

export {
  FurnitureCategoryTabs,
  FurnitureCategoryTabsList,
  FurnitureCategoryTabsTrigger,
  FurnitureCategoryTabsContent,
  FurnitureCategoryIcon,
};
