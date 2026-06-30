const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function collectBlobZips() {
  const zipFiles = [];
  const blobDirs = [
    path.join(process.cwd(), 'reports/blob'),
    path.join(process.cwd(), 'blob-report'),
  ];

  for (const dir of blobDirs) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.zip')) {
        zipFiles.push(path.join(dir, file));
      }
    }
  }

  return zipFiles;
}

const zipFiles = collectBlobZips();

if (!zipFiles.length) {
  console.warn('No Playwright blob reports found — skipping HTML report merge');
  process.exit(0);
}

const sourceDirs = [...new Set(zipFiles.map((zipPath) => path.dirname(zipPath)))];
let inputDir = sourceDirs[0];

if (sourceDirs.length > 1) {
  inputDir = path.join(process.cwd(), 'reports/blob-merge');
  fs.rmSync(inputDir, { recursive: true, force: true });
  fs.mkdirSync(inputDir, { recursive: true });

  for (const zipPath of zipFiles) {
    fs.copyFileSync(zipPath, path.join(inputDir, path.basename(zipPath)));
  }
}

const configPath = path.join(process.cwd(), 'playwright.merge.config.ts');
execSync(`npx playwright merge-reports --config "${configPath}" "${inputDir}"`, {
  stdio: 'inherit',
  shell: true,
});
