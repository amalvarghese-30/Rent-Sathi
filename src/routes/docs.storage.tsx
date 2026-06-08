import { Helmet } from "react-helmet-async";
import { DocsShell, Section, Card } from "@/components/docs/DocsShell";
import { Upload, CheckCircle2, ShieldCheck, Eye } from "lucide-react";

const BUCKETS = [
  { name: "broker-kyc", access: "private", purpose: "PAN, Aadhaar, RERA certificates", retention: "7 years", max: "5MB · PDF/JPG" },
  { name: "property-photos", access: "signed urls", purpose: "Listing photos (≤10 per property)", retention: "active + 12 months", max: "8MB · JPG/WebP" },
  { name: "user-docs", access: "private", purpose: "Optional renter IDs, employment letter", retention: "until requirement closed", max: "5MB · PDF/JPG" },
  { name: "complaint-evidence", access: "private", purpose: "Screenshots, audio from complaint flow", retention: "3 years", max: "10MB" },
];

export default function StorageDocs() {
  return (
    <DocsShell title="File Storage" eyebrow="Upload architecture" description="Buckets, lifecycle and the upload state machine used across broker KYC, property photos and user documents.">
      <Helmet><title>File Storage — RentSaathi</title></Helmet>
      <Section title="Buckets">
        <Card>
          <div className="divide-y divide-border">
            {BUCKETS.map((b) => (
              <div key={b.name} className="py-3 grid md:grid-cols-[180px_1fr_140px_120px] gap-3 items-start text-sm">
                <code className="font-mono text-foreground">{b.name}</code>
                <span className="text-muted-foreground">{b.purpose}</span>
                <span className="text-xs text-muted-foreground">{b.access}</span>
                <span className="text-xs text-muted-foreground text-right">{b.max}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Upload lifecycle">
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { i: Upload, l: "1. Client picks file", d: "Validated size + MIME locally" },
            { i: ShieldCheck, l: "2. Signed URL", d: "Server returns short-lived PUT URL" },
            { i: CheckCircle2, l: "3. Direct PUT", d: "Browser uploads to bucket directly" },
            { i: Eye, l: "4. Status callback", d: "Backend marks record uploaded; admin reviews" },
          ].map((s) => (
            <Card key={s.l}>
              <s.i className="size-5 text-accent" />
              <div className="mt-3 text-sm font-semibold">{s.l}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.d}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Validation rules">
        <Card>
          <ul className="text-sm space-y-1.5 text-muted-foreground">
            <li>• Reject files where MIME differs from extension (server-side magic-byte check).</li>
            <li>• Strip EXIF/GPS metadata from property photos before serving.</li>
            <li>• Watermark broker KYC docs on download for admin review.</li>
            <li>• Block bucket-level public access; always use signed URLs (15 min expiry).</li>
            <li>• Virus scan via async worker before marking document as <code>reviewable</code>.</li>
          </ul>
        </Card>
      </Section>
    </DocsShell>
  );
}
