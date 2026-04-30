const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Overall Dark Gray Theme (zinc is #18181b, perfectly matching ChatGPT #212121 vibes vs slate's blueish tint)
  content = content.replace(/slate-/g, 'zinc-');
  
  // 2. ChatInput specific improvements (ChatGPT has white round button with black arrow)
  content = content.replace(/bg-blue-600 text-white rounded-xl hover:bg-blue-500/g, 'bg-white text-black rounded-full hover:opacity-80 transition-opacity');
  content = content.replace(/focus:ring-blue-500\/50/g, 'focus:ring-zinc-600');
  content = content.replace(/focus:ring-blue-500/g, 'focus:ring-zinc-400');
  content = content.replace(/focus-within:ring-blue-500\/50/g, 'focus-within:ring-zinc-400');
  content = content.replace(/focus-within:border-blue-500\/50/g, 'focus-within:border-zinc-400');
  
  // 3. Message Avatars: User usually is dark circle, Bot is ChatGPT green circle #10a37f
  content = content.replace(/bg-gradient-to-tr from-zinc-200 to-white text-zinc-800 border-zinc-300/g, 'bg-zinc-700 text-white border-zinc-600');
  content = content.replace(/bg-gradient-to-br from-blue-600 to-blue-500 text-white border-blue-700/g, 'bg-[#10a37f] text-white border-transparent shadow-sm');
  
  // 4. Global backgrounds (ChatGPT specifically has lighter chat input box and darker sidebar)
  content = content.replace(/bg-zinc-950/g, 'bg-zinc-900'); // Sidebar
  content = content.replace(/bg-zinc-900/g, 'bg-[#212121]'); // Main chat body
  content = content.replace(/bg-zinc-800 border border-zinc-700/g, 'bg-[#2f2f2f] border border-[#2f2f2f]'); // Input
  
  // 5. Bot big icon at start
  content = content.replace(/bg-blue-500\/10 flex items-center justify-center text-blue-500 mb-6 shadow-xl shadow-blue-500\/10 ring-1 ring-blue-500\/20/g, 'bg-white flex items-center justify-center text-zinc-900 mb-6 ring-1 ring-zinc-200');
  
  // 6. Header pill
  content = content.replace(/text-blue-400 bg-blue-500\/10 hover:bg-blue-500\/20 border border-blue-500\/20/g, 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700');
  content = content.replace(/text-blue-500/g, 'text-zinc-100'); // any remaining blue texts
  content = content.replace(/bg-blue-500\/10/g, 'bg-zinc-800'); // any blue tints
  
  // 7. Selections
  content = content.replace(/selection:bg-blue-500\/30/g, 'selection:bg-zinc-700/50 text-zinc-100');

  fs.writeFileSync(filePath, content, 'utf8');
}

const dir = 'src/components';
if (fs.existsSync(dir)) {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.jsx')) {
      replaceInFile(path.join(dir, file));
    }
  });
}
replaceInFile('src/index.css');
replaceInFile('src/App.jsx');

console.log("Colors successfully replaced!");