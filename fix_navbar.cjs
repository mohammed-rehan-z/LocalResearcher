const fs = require('fs');
const file = 'components/navbar.jsx';
let code = fs.readFileSync(file, 'utf8');

// Remove bg-white
code = code.replace(/\bbg-white\b/g, '');

// Remove text-black
code = code.replace(/\btext-black\b/g, '');

// Strip "dark:" from all classes
code = code.replace(/dark:/g, '');

fs.writeFileSync(file, code);
console.log('Fixed themes in navbar');
