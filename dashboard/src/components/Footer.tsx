export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted sm:flex-row sm:justify-between sm:text-left">
        <p>
          Built by{" "}
          <a
            href="https://github.com/dayan-ai"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            dayan-ai
          </a>
        </p>
        <p>MIT Licensed</p>
      </div>
    </footer>
  );
}
