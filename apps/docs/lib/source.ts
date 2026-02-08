import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

const fumadocsSource = docs.toFumadocsSource();

// fumadocs-mdx v11 returns files as a function, fumadocs-core v15 expects an array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const files = typeof (fumadocsSource as any).files === 'function'
  ? (fumadocsSource as any).files()
  : (fumadocsSource as any).files;

export const source = loader({
  baseUrl: '/docs',
  source: { files },
});
