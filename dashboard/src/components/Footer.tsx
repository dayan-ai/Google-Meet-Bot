export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-muted sm:flex-row sm:justify-between sm:text-left">
        <p>
          Maintained by{" "}
          <a
            href="https://github.com/dayan-ai"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            dayan-ai
          </a>{" "}
          · originally created by{" "}
          <a
            href="https://github.com/pooja30123/Google-Meet-Bot"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            Pooja Verma
          </a>
        </p>
        <p>MIT Licensed</p>
      </div>
    </footer>
  );
}
