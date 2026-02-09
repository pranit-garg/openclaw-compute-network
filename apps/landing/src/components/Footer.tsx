export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 md:flex-row md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Dispatch</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-dim">
              MVP
            </span>
          </div>
          <p className="mt-1 text-sm text-text-dim">
            The dispatch layer for AI compute. x402 payments. ERC-8004 reputation. Onchain and open source.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="flex items-center gap-6">
            <a
              href="https://docs.dispatch.computer/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              Docs
            </a>
<a
              href="https://x.com/pranit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              Twitter/X
            </a>
            <a
              href="#why"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              Why Dispatch
            </a>
          </div>
          <span className="text-sm text-text-dim">
            Built by{" "}
            <a
              href="https://x.com/pranit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted transition-colors hover:text-text"
            >
              Pranit Garg
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
