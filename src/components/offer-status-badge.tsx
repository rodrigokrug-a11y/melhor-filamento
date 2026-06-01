import { CircleAlert, CircleCheck, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const STATUS = {
  PENDING: { label: "Em análise", variant: "secondary" as const, Icon: Clock },
  APPROVED: {
    label: "Aprovada",
    variant: "success" as const,
    Icon: CircleCheck,
  },
  REJECTED: {
    label: "Rejeitada",
    variant: "destructive" as const,
    Icon: CircleAlert,
  },
};

export function OfferStatusBadge({ status }: { status: string }) {
  const s = STATUS[status as keyof typeof STATUS] ?? STATUS.PENDING;
  const { Icon } = s;
  return (
    <Badge variant={s.variant} className="gap-1">
      <Icon className="size-3" />
      {s.label}
    </Badge>
  );
}
