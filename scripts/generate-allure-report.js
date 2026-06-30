const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function hasAllureResults(dir) {
  return fs.existsSync(dir) && fs.readdirSync(dir).some((file) => file.endsWith('-result.json'));
}

function collectAllureInputs() {
  const inputs = [];
  const seen = new Set();

  const addInput = (dir) => {
    const resolved = path.resolve(dir);
    if (seen.has(resolved) || !hasAllureResults(resolved)) {
      return;
    }
    seen.add(resolved);
    inputs.push(resolved);
  };

  const primary = path.join(process.cwd(), 'reports/allure-results');
  addInput(primary);

  if (fs.existsSync(primary)) {
    fs.readdirSync(primary)
      .filter((entry) => entry.startsWith('shard-'))
      .map((entry) => path.join(primary, entry))
      .filter((entry) => fs.statSync(entry).isDirectory())
      .forEach(addInput);
  }

  addInput(path.join(process.cwd(), 'my-allure-results'));

  return inputs;
}

const inputs = collectAllureInputs();

if (!inputs.length) {
  console.warn('No Allure results found — skipping Allure report generation');
  process.exit(0);
}

const outDir = path.join(process.cwd(), 'reports/allure-report');
const args = [...inputs, '-o', outDir, '--clean'].join(' ');
execSync(`npx allure generate ${args}`, { stdio: 'inherit' });
