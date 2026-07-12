const fs = require('fs');
let code = fs.readFileSync('src/components/ProfilePage.tsx', 'utf8');

code = code.replace(
  /12 June 2026/g,
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
);

fs.writeFileSync('src/components/ProfilePage.tsx', code);
