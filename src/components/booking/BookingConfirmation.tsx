import { Calendar, CheckCircle2, User } from "lucide-react";

type BookingConfirmationProps = {
  serviceType: string;
  counsellorName: string;
  dateTime: string;
  onDone?: () => void;
};

export function BookingConfirmation({
  counsellorName,
  dateTime,
  onDone,
  serviceType,
}: BookingConfirmationProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--savanna-100)]">
        <CheckCircle2 className="text-[var(--savanna-700)]" size={32} />
      </div>

      <div className="space-y-2">
        <h3 className="text-h4 text-[var(--text-primary)]">Booking confirmed</h3>
        <p className="text-body-sm text-[var(--text-secondary)]">
          Your session has been booked. You will receive a confirmation notification shortly.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-5 text-left">
        <div className="flex items-center gap-3">
          <Calendar aria-hidden="true" className="text-[var(--text-brand)]" size={16} />
          <div>
            <p className="text-label text-[var(--text-primary)]">{dateTime}</p>
            <p className="text-body-sm text-[var(--text-secondary)]">{serviceType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User aria-hidden="true" className="text-[var(--text-brand)]" size={16} />
          <p className="text-label text-[var(--text-primary)]">{counsellorName}</p>
        </div>
      </div>

      {onDone && (
        <button
          className="btn btn-md btn-primary"
          onClick={onDone}
          type="button"
        >
          Back to dashboard
        </button>
      )}
    </div>
  );
}
