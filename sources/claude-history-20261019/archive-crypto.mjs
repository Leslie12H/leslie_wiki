import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { createReadStream, createWriteStream, readFileSync, writeFileSync, openSync, readSync, closeSync, statSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';

// Format: 8 byte magic, 32 byte salt, 12 byte nonce, 16 byte GCM tag, ciphertext.
// The 52 byte magic/salt/nonce header is authenticated as AAD.
const [mode, input, output, keyFile] = process.argv.slice(2);
const magic = Buffer.from('LWCHAT01');
function derive(secret,salt) { return scryptSync(secret,salt,32,{N:32768,r:8,p:1,maxmem:64*1024*1024}); }
if (mode === 'encrypt') {
  const secret = randomBytes(32).toString('base64url');
  writeFileSync(keyFile,secret+'\n',{mode:0o600,flag:'wx'});
  const salt = randomBytes(32), nonce = randomBytes(12), header = Buffer.concat([magic,salt,nonce]);
  const cipher = createCipheriv('aes-256-gcm',derive(secret,salt),nonce); cipher.setAAD(header);
  writeFileSync(output,Buffer.concat([header,Buffer.alloc(16)]),{mode:0o600,flag:'wx'});
  await pipeline(createReadStream(input),cipher,createWriteStream(output,{flags:'r+',start:68}));
  const fs = await import('node:fs'); const fd = fs.openSync(output,'r+');fs.writeSync(fd,cipher.getAuthTag(),0,16,52);fs.closeSync(fd);
  console.log(JSON.stringify({encrypted_bytes:statSync(output).size,algorithm:'AES-256-GCM',kdf:'scrypt N=32768 r=8 p=1'}));
} else if (mode === 'decrypt') {
  const header = Buffer.alloc(68), fd = openSync(input,'r');
  if (readSync(fd,header,0,68,0)!==68) throw new Error('Truncated archive'); closeSync(fd);
  if (!header.subarray(0,8).equals(magic)) throw new Error('Wrong archive format');
  const key = derive(readFileSync(keyFile,'utf8').trim(),header.subarray(8,40));
  const decipher = createDecipheriv('aes-256-gcm',key,header.subarray(40,52));
  decipher.setAAD(header.subarray(0,52));decipher.setAuthTag(header.subarray(52,68));
  try { await pipeline(createReadStream(input,{start:68}),decipher,createWriteStream(output,{mode:0o600,flags:'wx'})); }
  catch(e) { const fs = await import('node:fs'); fs.rmSync(output,{force:true}); throw e; }
  console.log('Authenticated decryption succeeded');
} else throw new Error('Usage: node archive-crypto.mjs encrypt|decrypt input output key-file');
