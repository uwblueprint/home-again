"use client";

// ─── helpers ─────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-md">
      <h2 className="text-heading-4 font-semibold border-b border-border pb-sm">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-xs">
      <p className="text-paragraph-small text-muted-foreground font-medium">{title}</p>
      {children}
    </div>
  );
}

function TokenLabel({ label }: { label: string }) {
  return (
    <code className="text-caption font-medium bg-muted text-muted-foreground px-xs py-[2px] rounded-sm border border-border">
      {label}
    </code>
  );
}

/** Solid color swatch — fixed size so all swatches are identical everywhere. */
function Swatch({ v, className }: { v: string; className?: string }) {
  return (
    <div className="relative group shrink-0">
      <div
        title={v}
        className={`w-[8rem] h-10 rounded-sm border border-black/10 ${className ?? ""}`}
        style={{ background: `var(${v})` }}
      />
      <span className="absolute top-full left-0 mt-1 z-20 text-[9px] font-mono leading-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white px-1 py-0.5 rounded whitespace-nowrap pointer-events-none">
        {v}
      </span>
    </div>
  );
}

/** Swatch container — flex wrap so fixed-size swatches flow naturally. */
function SwatchGrid({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="flex flex-wrap gap-xs rounded-sm" style={style}>{children}</div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function DesignSystemShowcase() {
  return (
    <div className="space-y-xl py-xl">

      {/* ── 1. Typography ───────────────────────────────────────────────── */}
      <Section title="Typography">
        <SubSection title="Type scale">
          <div className="bg-card rounded-md border border-border px-md py-sm space-y-sm">
            {(
              [
                ["text-heading-1",         "font-semibold", "Heading 1"],
                ["text-heading-2",         "font-semibold", "Heading 2"],
                ["text-heading-3",         "font-semibold", "Heading 3"],
                ["text-heading-4",         "font-semibold", "Heading 4"],
                ["text-paragraph-large",   "font-normal",   "Paragraph large"],
                ["text-paragraph-regular", "font-normal",   "Paragraph regular"],
                ["text-paragraph-small",   "font-normal",   "Paragraph small"],
                ["text-paragraph-mini",    "font-normal",   "Paragraph mini"],
                ["text-caption",           "font-normal",   "Caption"],
              ] as [string, string, string][]
            ).map(([size, weight, label]) => (
              <div key={size} className="flex items-baseline gap-md">
                <p className={`${size} ${weight} text-foreground flex-1`}>{label}</p>
                <TokenLabel label={size} />
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Font weights">
          <div className="bg-card rounded-md border border-border px-md py-sm space-y-xs">
            {(
              [
                ["font-normal",   "Regular (400)"],
                ["font-medium",   "Medium (500)"],
                ["font-semibold", "Semibold (600)"],
              ] as [string, string][]
            ).map(([cls, label]) => (
              <div key={cls} className="flex items-center justify-between gap-md">
                <span className={`text-paragraph-regular ${cls} text-foreground`}>{label}</span>
                <TokenLabel label={cls} />
              </div>
            ))}
          </div>
        </SubSection>
      </Section>

      {/* ── 2. Colors ───────────────────────────────────────────────────── */}
      <Section title="Colors">

        <SubSection title="Semantic — general">
          <SwatchGrid>
            {[
              "--background", "--foreground",
              "--primary", "--primary-foreground",
              "--secondary", "--secondary-foreground",
              "--accent", "--accent-foreground",
              "--muted", "--muted-foreground",
              "--destructive", "--destructive-foreground",
              "--border", "--ring", "--ring-error", "--input",
            ].map((v) => <Swatch key={v} v={v} />)}
          </SwatchGrid>
        </SubSection>

        <SubSection title="Semantic — card">
          <SwatchGrid>
            {["--card", "--card-foreground"].map((v) => (
              <Swatch key={v} v={v} />
            ))}
          </SwatchGrid>
        </SubSection>

        <SubSection title="Semantic — popover">
          <SwatchGrid>
            {["--popover", "--popover-foreground"].map((v) => (
              <Swatch key={v} v={v} />
            ))}
          </SwatchGrid>
        </SubSection>

        {/* Sidebar */}
        <SubSection title="Semantic — sidebar">
          <SwatchGrid>
            {[
              "--sidebar", "--sidebar-foreground",
              "--sidebar-primary", "--sidebar-primary-foreground",
              "--sidebar-accent", "--sidebar-accent-foreground",
              "--sidebar-border", "--sidebar-ring", "--sidebar-muted",
            ].map((v) => <Swatch key={v} v={v} />)}
          </SwatchGrid>
        </SubSection>

        {/* Unofficial */}
        <SubSection title="Unofficial">
          <SwatchGrid>
            {[
              "--unofficial-accent-0",
              "--unofficial-accent-2",
              "--unofficial-accent-3",
              "--unofficial-backdrop",
              "--unofficial-body-background",
              "--unofficial-border-0",
              "--unofficial-border-1",
              "--unofficial-border-3",
              "--unofficial-border-4",
              "--unofficial-border-5",
              "--unofficial-destructive-border",
              "--unofficial-destructive-subtle",
              "--unofficial-destructive-text",
              "--unofficial-foreground-alt",
              "--unofficial-ghost",
              "--unofficial-ghost-foreground",
              "--unofficial-ghost-hover",
              "--unofficial-mid-alt",
              "--unofficial-outline",
              "--unofficial-outline-active",
              "--unofficial-outline-hover",
              "--unofficial-primary-hover",
              "--unofficial-secondary-hover",
            ].map((v) => (
              <Swatch key={v} v={v} />
            ))}
          </SwatchGrid>
        </SubSection>

        {/* Brand colors */}
        <SubSection title="Brand — greens">
          <SwatchGrid>
            {["--brand-greens-100", "--brand-greens-200"].map((v) => (
              <Swatch key={v} v={v} />
            ))}
          </SwatchGrid>
        </SubSection>

        <SubSection title="Brand — purples">
          <SwatchGrid>
            {[
              "--brand-purples-50",
              "--brand-purples-100",
              "--brand-purples-200",
              "--brand-purples-300",
              "--brand-purples-400",
              "--brand-purples-500",
              "--brand-purples-600",
              "--brand-purples-700",
              "--brand-purples-800",
              "--brand-purples-900",
              "--brand-purples-950",
            ].map((v) => (
              <Swatch key={v} v={v} />
            ))}
          </SwatchGrid>
        </SubSection>

        <SubSection title="Brand — reds">
          <SwatchGrid>
            {["--brand-reds-300"].map((v) => (
              <Swatch key={v} v={v} />
            ))}
          </SwatchGrid>
        </SubSection>

        {/* Chart colors */}
        <SubSection title="Chart">
          <SwatchGrid>
            {[
              "--chart-1",
              "--chart-2",
              "--chart-3",
              "--chart-4",
              "--chart-5",
              "--chart-sentiment-negative",
              "--chart-sentiment-positive",
              "--chart-shades-fill",
              "--chart-shades-fill-2",
              "--chart-shades-stroke",
              "--chart-shades-stroke-2",
            ].map((v) => (
              <Swatch key={v} v={v} />
            ))}
          </SwatchGrid>
        </SubSection>

        {/* Alpha — shown on checkered background */}
        <SubSection title="Alpha — black">
          <SwatchGrid style={{
              backgroundImage:
                "linear-gradient(45deg,#ccc 25%,transparent 25%),linear-gradient(-45deg,#ccc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ccc 75%),linear-gradient(-45deg,transparent 75%,#ccc 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
              backgroundColor: "#fff",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
            }}>
            {[
              "--black-alpha-0",
              "--black-alpha-001",
              "--black-alpha-333",
              "--black-alpha-5",
              "--black-alpha-10",
              "--black-alpha-15",
              "--black-alpha-20",
              "--black-alpha-30",
              "--black-alpha-40",
              "--black-alpha-50",
              "--black-alpha-60",
              "--black-alpha-70",
              "--black-alpha-80",
              "--black-alpha-90",
              "--black-alpha-95",
              "--black-alpha-100",
            ].map((v) => (
              <Swatch key={v} v={v} className="border-0" />
            ))}
          </SwatchGrid>
        </SubSection>

        <SubSection title="Alpha — white">
          <SwatchGrid style={{
              backgroundImage:
                "linear-gradient(45deg,#555 25%,transparent 25%),linear-gradient(-45deg,#555 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#555 75%),linear-gradient(-45deg,transparent 75%,#555 75%)",
              backgroundSize: "16px 16px",
              backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
              backgroundColor: "#222",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
            }}>
            {[
              "--white-alpha-0",
              "--white-alpha-001",
              "--white-alpha-333",
              "--white-alpha-5",
              "--white-alpha-10",
              "--white-alpha-15",
              "--white-alpha-20",
              "--white-alpha-30",
              "--white-alpha-40",
              "--white-alpha-50",
              "--white-alpha-60",
              "--white-alpha-70",
              "--white-alpha-80",
              "--white-alpha-90",
              "--white-alpha-95",
              "--white-alpha-100",
            ].map((v) => (
              <Swatch key={v} v={v} className="border-0" />
            ))}
          </SwatchGrid>
        </SubSection>
      </Section>

      {/* ── 3. Border Radii ─────────────────────────────────────────────── */}
      <Section title="Border Radii">
        <div className="flex flex-wrap gap-md items-end">
          {(
            [
              ["rounded-none", "--rounded-none",  "0"],
              ["rounded-xs",   "--rounded-xs",    "2px"],
              ["rounded-sm",   "--rounded-sm",    "4px"],
              ["rounded-md",   "--rounded-md",    "6px"],
              ["rounded-lg",   "--rounded-lg",    "8px"],
              ["rounded-xl",   "--rounded-xl",    "12px"],
              ["rounded-2xl",  "--rounded-2xl",   "16px"],
              ["rounded-3xl",  "--rounded-3xl",   "24px"],
              ["rounded-4xl",  "--rounded-4xl",   "32px"],
              ["rounded-full", "--rounded-full",  "∞"],
            ] as [string, string, string][]
          ).map(([cls, varName, px]) => (
            <div key={cls} className="flex flex-col items-center gap-xs group cursor-default">
              <div
                className={`w-20 h-20 bg-primary border-2 border-primary/50 ${cls}`}
                title={varName}
              />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                <TokenLabel label={varName} />
              </div>
              <span className="text-caption text-muted-foreground">{px}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. Spacing ──────────────────────────────────────────────────── */}
      <Section title="Spacing">
        <div className="space-y-xs">
          {(
            [
              ["xs",  "--xs",  "0.5rem  / 8px"],
              ["sm",  "--sm",  "0.75rem / 12px"],
              ["md",  "--md",  "1rem    / 16px"],
              ["lg",  "--lg",  "1.25rem / 20px"],
              ["xl",  "--xl",  "1.5rem  / 24px"],
              ["2xl", "--2xl", "2rem    / 32px"],
              ["3xl", "--3xl", "2.5rem  / 40px"],
              ["4xl", "--4xl", "3rem    / 48px"],
            ] as [string, string, string][]
          ).map(([name, varName, value]) => (
            <div key={name} className="flex items-center gap-md group cursor-default">
              <div className={`bg-primary/20 border border-primary/40 rounded-sm p-${name} shrink-0`}>
                <div className="bg-primary rounded-xs w-4 h-1" />
              </div>
              <div className="flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <TokenLabel label={`p-${name}`} />
                <TokenLabel label={varName} />
              </div>
              <span className="text-paragraph-small text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 5. Shadows ──────────────────────────────────────────────────── */}
      <Section title="Shadows">
        <div className="flex gap-md items-end pb-xl">
          {(
            [
              "--shadow-xs",
              "--shadow-2xs",
              "--shadow-sm",
              "--shadow-md",
              "--shadow-lg",
              "--shadow-xl",
              "--shadow-2xl",
            ] as string[]
          ).map((token) => (
            <div key={token} className="flex flex-col items-center gap-sm group cursor-default">
              <div className="p-md">
                <div
                  className="w-28 h-28 bg-white rounded-md"
                  style={{ boxShadow: `var(${token})` }}
                  title={token}
                />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <TokenLabel label={token} />
              </div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
}
