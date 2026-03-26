const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (content.includes("'/owner")) {
        content = content.replace(/'\/owner/g, "'/manager");
        changed = true;
      }
      if (content.includes('"/owner')) {
        content = content.replace(/"\/owner/g, '"/manager');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Replaced in ' + fullPath);
      }
    }
  }
}

replaceInDir('./frontend/src/app/manager');
