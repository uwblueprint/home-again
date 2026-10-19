import { CircleAlert } from "lucide-react";

import { Alert } from "@/common/components/ui/alert";

interface ServiceAreaNoticeProps {
  className?: string;
}

function ServiceAreaNotice({ className }: ServiceAreaNoticeProps) {
  return (
    <Alert variant="info" icon={CircleAlert} className={className}>
      Home Again Furniture Bank currently serves only the Northeast Avalon
      region of Newfoundland and Labrador, Canada.
    </Alert>
  );
}

export { ServiceAreaNotice };
