"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/Card";

const reportTypes = [
  {
    id: "utilisation",
    title: "Utilisation Report",
    description: "Counsellor workload, session counts, and capacity metrics.",
    formats: ["CSV"],
  },
  {
    id: "mood-trends",
    title: "Mood Trends Report",
    description: "Aggregated and anonymised mood check-in data over time.",
    formats: ["CSV"],
  },
  {
    id: "referrals",
    title: "Referral Summary",
    description: "Employer referral counts, outcomes, and turnaround times.",
    formats: ["CSV"],
  },
  {
    id: "crisis",
    title: "Crisis Events Report",
    description: "Crisis event records, response times, and follow-up status.",
    formats: ["CSV"],
  },
  {
    id: "audit",
    title: "Audit Trail Export",
    description: "Authentication events and sensitive data access logs.",
    formats: ["CSV"],
  },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(reportId: string) {
    setDownloading(reportId);
    try {
      const res = await fetch(`/v1/admin/reports?type=${encodeURIComponent(reportId)}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportId}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <header className="mb-2">
        <h1 className="text-h2 text-[var(--text-primary)]">Export & Reports</h1>
        <p className="text-body mt-1 text-[var(--text-secondary)]">
          Generate and download platform reports in CSV format.
        </p>
      </header>

      <div className="space-y-4">
        {reportTypes.map((report) => (
          <Card key={report.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 text-[var(--text-secondary)]" size={20} />
                <div>
                  <p className="text-label text-[var(--text-primary)]">{report.title}</p>
                  <p className="text-body-sm mt-1 text-[var(--text-secondary)]">
                    {report.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {report.formats.map((fmt) => (
                  <button
                    className="btn btn-sm btn-ghost"
                    disabled={downloading === report.id}
                    key={fmt}
                    onClick={() => handleDownload(report.id)}
                    type="button"
                  >
                    {downloading === report.id ? (
                      <Loader2 aria-hidden className="animate-spin" size={14} />
                    ) : (
                      <Download aria-hidden size={14} />
                    )}
                    {" "}{fmt}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
