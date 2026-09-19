const emojis = require('unicode-emoji-json');
const fs = require('fs');

const result = Object.entries(emojis).map(([char, details]) => ({
  emoji: char,
  name: details.name
}));

fs.writeFileSync('emojis.js', 'const emojiData = ' + JSON.stringify(result) + ';\n');
console.log('Generated emojis.js with ' + result.length + ' emojis.');
