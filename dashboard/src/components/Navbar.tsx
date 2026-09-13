"use client";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 text-sm font-medium">
          <span className="text-gradient font-semibold">🎤 Google Meet Bot</span>
        </a>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a href="#features" className="hidden transition hover:text-foreground sm:inline">
            Features
          </a>
          <a href="#prototype" className="hidden transition hover:text-foreground sm:inline">
            Prototype
          </a>
          <a
            href="https://github.com/dayan-ai/Google-Meet-Bot"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-3 py-1.5 text-foreground transition hover:bg-card"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
