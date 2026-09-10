import { Phone, X } from "lucide-react";
import type { MarkStatus, Voter } from "@/lib/types";
import {
  formatDate,
  formatPhone,
  fullName,
  partyLabel,
  raceLabel,
  sexLabel,
  titleCaseStreet,
  zipLine,
} from "@/lib/format";
import { turnoutScore, turnoutTier, TURNOUT_BLURB, TURNOUT_LABEL } from "@/lib/turnout";
import { useVoterStore } from "@/lib/voter-store";
import { Badge, distTone, partyTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InmanActions } from "@/components/inman-actions";

const MARKS: { id: MarkStatus; label: string }[] = [
  { id: "uncontacted", label: "Uncontacted" },
  { id: "contacted", label: "Contacted" },
  { id: "not-home", label: "Not home" },
  { id: "supporter", label: "Supporter" },
  { id: "lean", label: "Lean" },
  { id: "opposed", label: "Opposed" },
  { id: "refused", label: "Refused" },
];

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  const shown = value === 0 ? "0" : value ? String(value) : "—";
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{shown}</dd>
    </div>
  );
}

export function VoterDrawer({ voter }: { voter: Voter }) {
  const mark = useVoterStore((s) => s.marks[voter.id]);
  const setMark = useVoterStore((s) => s.setMark);
  const select = useVoterStore((s) => s.select);
  const note = mark?.note ?? "";

  return (
    <aside className="flex h-full flex-col border-line bg-panel md:border-l">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
        <div>
          <p className="display text-xl">{fullName(voter)}</p>
          <p className="mt-1 text-sm text-muted">
            {titleCaseStreet(voter.addr)}
            {voter.addr2 ? ` · ${titleCaseStreet(voter.addr2)}` : ""}
          </p>
          <p className="text-sm text-muted">{zipLine(voter)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={distTone(voter.dist)}>Dist {voter.dist}</Badge>
            <Badge>{voter.pct}</Badge>
            <Badge tone={partyTone(voter.party)}>{partyLabel(voter.party)}</Badge>
            {voter.region ? <Badge>{voter.region}</Badge> : null}
            {voter.nb.map((n) => (
              <Badge key={n}>{n} sheet</Badge>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => select(null)} aria-label="Close">
          <X className="size-5" />
        </Button>
      </div>
      <div className="grid gap-5 overflow-y-auto px-4 py-4 text-sm">
        <dl className="grid grid-cols-2 gap-3">
          <Field label="Age" value={voter.age} />
          <Field label="Sex" value={sexLabel(voter.sex)} />
          <Field label="Race" value={raceLabel(voter.race)} />
          <Field label="Status" value={voter.status === "A" ? "Active" : voter.status} />
          <Field label="Registered" value={formatDate(voter.rd)} />
          <Field label="Last voted" value={formatDate(voter.lv)} />
          <Field label="Reg. number" value={voter.id} />
          <Field label="Walk order" value={voter.walk} />
          <Field
            label="Turnout"
            value={`${turnoutScore(voter)} · ${TURNOUT_LABEL[turnoutTier(voter)]}`}
          />
        </dl>
        <p className="text-xs text-muted">{TURNOUT_BLURB[turnoutTier(voter)]}</p>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-faint">Phone</p>
          {voter.phone ? (
            <a className="mt-1 inline-flex min-h-11 items-center gap-2 text-river" href={`tel:${voter.phone}`}>
              <Phone className="size-4" />
              {formatPhone(voter.phone)}
            </a>
          ) : (
            <p className="mt-1 text-muted">No phone on file</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-faint">City offices</p>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Council district" value={voter.dist} />
            <Field label="Precinct" value={voter.pct} />
            <Field label="Region" value={voter.region} />
            <Field label="Walk sheet" value={voter.nb.length ? voter.nb.join(", ") : "—"} />
          </dl>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-faint">Ballot districts</p>
          <dl className="grid grid-cols-2 gap-3">
            <Field label="School board" value={voter.sb} />
            <Field label="State house" value={voter.hd} />
            <Field label="State senate" value={voter.sen} />
            <Field label="Police jury" value={voter.pj} />
            <Field label="Congress" value={voter.cd} />
            <Field label="BESE" value={voter.bese} />
            <Field label="RSCC" value={voter.rscc} />
            <Field label="DSCC" value={voter.dscc} />
            <Field label="Tax commission" value={voter.taxc} />
            <Field label="Recreation" value={voter.rec} />
            <Field label="Tax ward" value={voter.tw} />
            <Field label="Justice of the peace" value={voter.jp} />
            <Field label="Appeals court" value={voter.ac} />
            <Field label="District court" value={voter.dc} />
            <Field label="Public service" value={voter.psc} />
            <Field label="Supreme court" value={voter.sc} />
          </dl>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-faint">Inman</p>
          <InmanActions id={voter.id} />
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-faint">Field mark</p>
          <div className="flex flex-wrap gap-1.5">
            {MARKS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMark(voter.id, m.id, note)}
                className={`min-h-10 rounded-full border px-3 text-xs font-medium ${
                  (mark?.status ?? "uncontacted") === m.id
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-ink-soft"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <label className="grid gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-faint">Note</span>
          <textarea
            value={note}
            onChange={(e) => setMark(voter.id, mark?.status ?? "uncontacted", e.target.value)}
            rows={4}
            className="rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm"
            placeholder="Door conversation, issue, follow-up…"
          />
        </label>
      </div>
    </aside>
  );
}
