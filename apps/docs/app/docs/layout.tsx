import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      nav={{
        title: (
          <span className="flex items-center gap-2 font-bold text-lg">
            <img src="/icon.png" alt="" width={20} height={20} className="rounded" />
            <span><span className="text-[#d4a246]">Dis</span>patch</span>
          </span>
        ),
      }}
      sidebar={{
        defaultOpenLevel: 1,
      }}
      themeSwitch={{ enabled: false }}
      links={[
        {
          text: 'Litepaper',
          url: 'https://github.com/pranit-garg/Dispatch/blob/main/docs/Dispatch_Litepaper.pdf',
        },
        {
          text: 'GitHub',
          url: 'https://github.com/pranit-garg/Dispatch',
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}
