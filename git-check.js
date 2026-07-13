const { execSync } = require('child_process');
const opts = { cwd: 'C:\\laragon\\www\\christianelka.github.io', encoding: 'utf8', shell: 'cmd.exe' };

console.log('=== GIT LOG (last 3) ===');
try {
  const log = execSync('git log --oneline -3', opts);
  console.log(log);
} catch(e) { console.log('FAIL:', e.message); }

console.log('=== GIT STATUS ===');
try {
  const status = execSync('git status --short', opts);
  console.log(status || '(clean)');
} catch(e) { console.log('FAIL:', e.message); }
