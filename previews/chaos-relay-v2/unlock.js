/* Password never leaves this document. Public artifacts contain authenticated ciphertext only. */
'use strict';
const form=document.getElementById('unlock-form'),input=document.getElementById('access-key'),button=document.getElementById('unlock'),status=document.getElementById('status');
let busy=false,frame=null;
const bytes=s=>Uint8Array.from(atob(s.trim()),c=>c.charCodeAt(0));
document.getElementById('show-key').addEventListener('change',e=>input.type=e.target.checked?'text':'password');
async function get(path){const r=await fetch(new URL(path,location.href),{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});if(!r.ok)throw Error('No es pot carregar la preview. Torna-ho a provar.');return r;}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 if(!globalThis.crypto?.subtle||!globalThis.DecompressionStream){status.textContent='Obre l’enllaç HTTPS en un navegador actual, com Safari o Chrome.';return;}
 let password=input.value.toUpperCase().replace(/[\s-]/g,'');
 if(!/^[A-Z2-7]{32}$/.test(password)){status.textContent='Revisa la clau: 32 caràcters, amb o sense guionets.';return;}
 busy=true;button.disabled=true;status.textContent='Desxifrant la preview…';
 let decoded=null;
 try{
  const m=await(await get('./manifest.json')).json();
  if(m.format!==1||m.cipher!=='AES-256-GCM'||m.kdf!=='PBKDF2-SHA256'||m.encoding!=='gzip'||m.iterations!==600000||!Array.isArray(m.parts)||m.parts.length>12||!m.parts.length||m.parts.some(p=>!/^payload-\d+\.txt$/.test(p)))throw Error('Format de preview no reconegut.');
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);password='';input.value='';
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:bytes(m.salt),iterations:m.iterations},material,{name:'AES-GCM',length:256},false,['decrypt']);
  const parts=await Promise.all(m.parts.map(async p=>bytes(await(await get('./'+p)).text())));
  const size=parts.reduce((n,p)=>n+p.length,0);if(size!==m.bytes||size>1000000)throw Error('Preview incompleta. Recarrega la pàgina.');
  const ciphertext=new Uint8Array(size);let offset=0;for(const p of parts){ciphertext.set(p,offset);offset+=p.length;}
  try{decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(m.iv),additionalData:new TextEncoder().encode(m.aad),tagLength:128},key,ciphertext);}catch{throw Error('Clau incorrecta o contingut alterat. Comprova la clau i torna-ho a provar.');}
  const html=await new Response(new Blob([decoded]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  if(html.length>500000||!html.startsWith('<!doctype html>'))throw Error('Contingut de preview no vàlid.');
  frame=document.createElement('iframe');frame.title='Chaos Relay 2.0 — prototip solo';frame.id='preview';frame.setAttribute('allow','autoplay; fullscreen; clipboard-write');frame.referrerPolicy='no-referrer';frame.srcdoc=html;
  document.body.classList.add('unlocked');document.getElementById('gate').remove();document.body.append(frame);document.title='Chaos Relay 2.0 — Preview';
 }catch(error){status.textContent=error instanceof Error?error.message:'No s’ha pogut obrir la preview.';input.focus();}
 finally{password='';if(decoded)new Uint8Array(decoded).fill(0);busy=false;button.disabled=false;}
});
window.addEventListener('pagehide',()=>{input.value='';if(frame){frame.remove();frame=null;}});
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
