from pathlib import Path
import hashlib,json,subprocess
root=Path(__file__).resolve().parent
receipt=json.loads((root/'receipt.json').read_text())
for part in receipt['parts']:
    dest=root/part['file']
    if not dest.exists() or hashlib.sha256(dest.read_bytes()).hexdigest()!=part['sha256']:
        subprocess.run(['curl','--fail','--location','--retry','3','--output',str(dest),part['download_url']],check=True)
    if hashlib.sha256(dest.read_bytes()).hexdigest()!=part['sha256']:raise RuntimeError('Part checksum mismatch: '+part['file'])
combined=root/'claude-history-20261019.enc'
with combined.open('wb') as out:
    for part in receipt['parts']:
        with (root/part['file']).open('rb') as src:
            while data:=src.read(1024*1024):out.write(data)
if hashlib.sha256(combined.read_bytes()).hexdigest()!=receipt['archive_ciphertext_sha256']:raise RuntimeError('Archive checksum mismatch')
print('All encrypted parts downloaded and verified:',combined)
