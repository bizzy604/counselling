import { Siren } from "lucide-react";

import { Button } from "@/components/ui/Button";

type SOSButtonProps = {
  compact?: boolean;
};

export function SOSButton({ compact = false }: SOSButtonProps) {
  return (
    <Button aria-label="Open the crisis support flow" className={compact ? "px-4" : undefined} variant="sos">
      <Siren aria-hidden="true" size={compact ? 16 : 18} />
      <span>{compact ? "SOS" : "SOS Support"}</span>
    </Button>
  );
}
