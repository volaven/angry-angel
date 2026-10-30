"""Local Qwen production; no runtime API and no changes to Mathheroes files."""
import os,pathlib,json,hashlib,time,math
os.environ['TOKENIZERS_PARALLELISM']='false'
import torch,numpy as np,soundfile as sf
from scipy.signal import resample_poly
from qwen_tts import Qwen3TTSModel
r=pathlib.Path(__file__).resolve().parents[1];root=r/'assets/audio';public=r/'public/audio';public.mkdir(exist_ok=True);(root/'masters').mkdir(exist_ok=True)
info=json.loads(pathlib.Path('C:/gpt/mathheros/app/.cache/qwen-tts/models.json').read_text())['CustomVoice']
torch.set_num_threads(4)
model=Qwen3TTSModel.from_pretrained(info['path'],device_map='cuda:0',dtype=torch.bfloat16,attn_implementation='sdpa')
instruct='A mature Korean woman with a low, cool, composed librarian voice. Clear Korean consonants, measured natural pace, dry restrained delivery, never shouting or squeaky. Speak as a strict adult exam tutor.'
ledger=[]
for item in json.loads((root/'script.json').read_text(encoding='utf8')):
 target=public/(item['id']+'.wav');meta=root/(item['id']+'.json')
 if target.exists() and meta.exists():ledger.append(json.loads(meta.read_text(encoding='utf8')));continue
 start=time.time();torch.manual_seed(224)
 with torch.inference_mode():wavs,sr=model.generate_custom_voice(text=item['text'],language='Korean',speaker='Sohee',instruct=instruct,max_new_tokens=900,do_sample=True,temperature=.65,top_p=.9,repetition_penalty=1.05)
 data=np.asarray(wavs[0],dtype=np.float64);assert np.isfinite(data).all() and np.max(np.abs(data))>.005
 sf.write(root/'masters'/target.name,data,sr,subtype='PCM_16')
 data=resample_poly(data,22050//math.gcd(22050,sr),sr//math.gcd(22050,sr));peak=max(abs(data));data*=min(2,.9/max(.001,peak))
 sf.write(target,data,22050,subtype='PCM_16');entry={**item,'model':info,'instruct':instruct,'sampleRate':22050,'seconds':len(data)/22050,'generationSeconds':time.time()-start,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'status':'generated_pending_listening'};meta.write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf8');ledger.append(entry);(root/'manifest.json').write_text(json.dumps(ledger,ensure_ascii=False,indent=2),encoding='utf8');print(item['id'],round(entry['generationSeconds']),flush=True)
