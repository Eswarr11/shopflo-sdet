const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const blobRoot = path.join(process.cwd(), 'reports/blob');
const mergedDir = path.join(process.cwd(), 'reports/blob-merged');

function findZips(dir) {
  const zips = [];
  if (!fs.existsSync(dir)) return zips;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      zips.push(...findZips(full));
    } else if (entry.name.endsWith('.zip')) {
      zips.push(full);
    }
  }
  return zips;
}

const zips = findZips(blobRoot);
if (!zips.length) {
  console.log('No blob zip files found — skipping HTML report merge');
  process.exit(0);
}

fs.mkdirSync(mergedDir, { recursive: true });
zips.forEach((zip, index) => {
  fs.copyFileSync(zip, path.join(mergedDir, `report-${index + 1}.zip`));
});

execSync('npx playwright merge-reports --reporter html reports/blob-merged', { stdio: 'inherit' });
