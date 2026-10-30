import json,sys
b=json.load(open('src/bank.json',encoding='utf8'))
for q in b:
 if len(sys.argv)>1 and not q['id'].startswith(sys.argv[1]):continue
 print('\n###',q['id'],q['subject'],'정답',q['answer'])
 print(q['stem'])
 for i,c in enumerate(q['choices']):print(str(i+1)+':',c)
