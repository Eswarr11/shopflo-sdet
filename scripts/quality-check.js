const { execSync } = require('child_process');

function run(command, { allowFail = false } = {}) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch {
    if (allowFail) {
      return false;
    }
    process.exit(1);
  }
}

function runOutput(command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

run('npm run typecheck');
run('npm run lint');

if (!run('npm run format:check', { allowFail: true })) {
  console.log('\n[quality] Format check failed — running Prettier --write...\n');
  run('npm run format');
  run('npm run format:check');
}

if (process.env.CI === 'true') {
  const diff = runOutput('git status --porcelain');
  if (diff) {
    console.error(
      '\n[quality] Prettier modified files in CI. Run `npm run format` locally and commit the changes.\n',
    );
    process.exit(1);
  }
}

console.log('\n[quality] All checks passed.\n');
