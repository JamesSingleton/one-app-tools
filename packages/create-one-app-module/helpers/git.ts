/* eslint-disable import/no-extraneous-dependencies */
import { execSync } from 'child_process';
import path from 'path';
import rimraf from 'rimraf';

function isInGitRepository(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (_) {}
  return false;
}

export function tryGitInit(root: string): boolean {
  let didInitSucceed = false;

  try {
    execSync('git --version', { stdio: 'ignore' });

    if (isInGitRepository()) {
      return false;
    }

    execSync('git init', { stdio: 'ignore' });
    didInitSucceed = true;

    execSync('git checkout -b main', { stdio: 'ignore' })

    execSync('git add -A', { stdio: 'ignore' });
    execSync(
      'git commit -m "feat(init): initial commit from Create One App Module"',
      { stdio: 'ignore' }
    );
    return true;
  } catch (e) {
    if (didInitSucceed) {
      try {
        rimraf.sync(path.join(root, '.git'));
      } catch (_) {}
    }
    return false;
  }
}
