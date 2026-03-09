"use client";

import { useState } from "react";
import { Siren } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CrisisModal } from "@/components/crisis/CrisisModal";

type SOSButtonProps = {
  compact?: boolean;
};

export function SOSButton({ compact = false }: SOSButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        aria-label="Open the crisis support flow"
        className={compact ? "px-4" : undefined}
        onClick={() => setOpen(true)}
        variant="sos"
      >
        <Siren aria-hidden="true" size={compact ? 16 : 18} />
        <span>{compact ? "SOS" : "SOS Support"}</span>
      </Button>
      <CrisisModal onClose={() => setOpen(false)} open={open} />
    </>
  );
}
