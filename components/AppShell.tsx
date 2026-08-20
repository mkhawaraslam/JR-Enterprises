import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-[var(--header-border)] bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
          <Link href="/" className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-lg font-semibold tracking-tight text-[#9b1c1c] sm:text-xl dark:text-[#ef4444]">
              J.R. Enterprises
            </span>
            <span className="hidden text-sm text-muted md:inline">
              Bill Management
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="min-h-10 rounded-md px-3 py-2 text-muted-strong hover:bg-surface-muted"
            >
              Dashboard
            </Link>
            <Link
              href="/documents"
              className="min-h-10 rounded-md px-3 py-2 text-muted-strong hover:bg-surface-muted"
            >
              Documents
            </Link>
            <Link
              href="/descriptions"
              className="min-h-10 rounded-md px-3 py-2 text-muted-strong hover:bg-surface-muted"
            >
              Descriptions
            </Link>
            <Link
              href="/documents/new"
              className="ml-auto min-h-10 rounded-md bg-[#9b1c1c] px-3 py-2 font-medium text-white hover:bg-[#7f1717] sm:ml-0 dark:bg-[#b91c1c] dark:hover:bg-[#991b1b]"
            >
              <span className="sm:hidden">New</span>
              <span className="hidden sm:inline">Create New Document</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:py-6">{children}</main>
    </div>
  );
}
