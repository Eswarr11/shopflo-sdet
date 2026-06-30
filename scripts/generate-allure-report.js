const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const base = path.join(process.cwd(), 'reports/allure-results');
const shardDirs = fs.existsSync(base)
  ? fs.readdirSync(base)
    .filter((d) => d.startsWith('shard-') && fs.statSync(path.join(base, d)).isDirectory())
  : [];

const inputs = shardDirs.length
  ? shardDirs.map((s) => path.join(base, s))
  : [base];

const hasResults = inputs.some(
  (p) => fs.existsSync(p) && fs.readdirSync(p).some((f) => f.endsWith('-result.json')),
);

if (!hasResults) {
  console.warn('No Allure results found — skipping Allure report generation');
  process.exit(0);
}

const outDir = path.join(process.cwd(), 'reports/allure-report');
const args = [...inputs, '-o', outDir, '--clean'].join(' ');
execSync(`npx allure generate ${args}`, { stdio: 'inherit' });
