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
            Pay in USDC. Earn in $BOLT. x402 payments. ERC-8004 reputation. Onchain and open source.
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
              href="https://github.com/pranit-garg/Dispatch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              GitHub
            </a>
            <a
              href="https://github.com/pranit-garg/Dispatch/raw/main/docs/Dispatch_Litepaper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted transition-colors hover:text-text"
            >
              Litepaper
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
