from glob import glob
import os
import json
for file in glob('_locales/*/*.json'):
  with open(file, 'r') as f:
    j = json.load(f)
  locale = file.split('/')[-2].replace('_','-')
  with open(f'/usr/local/google/home/zafzal/Downloads/{locale}/messages.json', 'r') as f:
    j2 = json.load(f)
  for k in j2.keys():
    j[k] = j2[k]
  with open(file, 'w') as f:
    json.dump(j, f, ensure_ascii=False)
