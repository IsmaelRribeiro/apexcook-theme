// Lists theme files (relative to theme/) changed or added since the Horizon base tag.
import { execSync } from 'node:child_process';
const sh = (c) => execSync(c, { encoding: 'utf8' }).split('\n').filter(Boolean);
const base = process.argv[2] || 'horizon-4.4.0';
const files = new Set([
  ...sh(`git diff --name-only --diff-filter=ACMR ${base} -- theme/`),
  ...sh('git ls-files --others --exclude-standard -- theme/'),
]);
for (const f of [...files].sort()) console.log(f.replace(/^theme\//, ''));
