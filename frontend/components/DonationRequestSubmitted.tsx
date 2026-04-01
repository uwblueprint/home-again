import Link from "next/link";
import Image from "next/image";
import { HOME_PAGE } from "@/constants/Routes";
import { Button } from "@/components/ui/button";

export default function DonationRequestSubmitted() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="hidden w-[34.2%] items-center justify-center py-5 pl-3 pr-5 md:flex">
          <div className="h-full w-full rounded-xl bg-muted" />
        </aside>

        <main className="flex flex-1 items-center justify-center px-6 py-16 md:px-10">
          <section className="w-full max-w-[476px] space-y-4">
            <Image
              src="/hafb_logo.svg"
              alt="Home Again"
              width={91}
              height={55}
              className="h-[55px] w-[91px]"
            />

            <div className="space-y-3">
              <h1 className="text-[30px] font-semibold leading-[30px] tracking-[-0.0625rem] text-foreground">
                Donation Request Submitted!
              </h1>
              <p className="text-base leading-6 text-muted-foreground">
                You&apos;ll receive an email shortly confirming your submission.
                We will reach out to schedule a pickup time if your request is
                approved.
              </p>
            </div>

            <Button
              nativeButton={false}
              render={<Link href={HOME_PAGE} />}
              className="h-10 w-full rounded-full px-6 py-2.5 text-sm font-medium leading-5"
            >
              Back to Home
            </Button>
          </section>
        </main>
      </div>
    </div>
  );
}
