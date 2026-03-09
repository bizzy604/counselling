"use client";

import { cn } from "@/lib/utils";

type ServiceOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

const services: ServiceOption[] = [
  { value: "INDIVIDUAL", label: "Individual", description: "One-on-one session", icon: "👤" },
  { value: "FAMILY", label: "Family", description: "Family counselling", icon: "👨‍👩‍👧" },
  { value: "STRESS", label: "Stress & Burnout", description: "Stress management", icon: "🧠" },
  { value: "SUBSTANCE_USE", label: "Substance Use", description: "Substance support", icon: "🍶" },
  { value: "ASSESSMENT", label: "Assessment", description: "Initial evaluation", icon: "📋" },
];

type ServiceSelectorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export function ServiceSelector({ onChange, value }: ServiceSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const isSelected = value === service.value;
        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              "card card--interactive flex items-start gap-4 text-left transition",
              isSelected &&
                "border-[var(--savanna-400)] bg-[var(--savanna-50)] shadow-[var(--shadow-brand)]",
            )}
            key={service.value}
            onClick={() => onChange?.(service.value)}
            type="button"
          >
            <span className="text-2xl">{service.icon}</span>
            <div>
              <p className="text-h4 text-[var(--text-primary)]">{service.label}</p>
              <p className="text-body-sm text-[var(--text-secondary)]">{service.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
