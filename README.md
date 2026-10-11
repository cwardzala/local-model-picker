# Local Model Picker

Pick the best open model your machine can run, for the job you have in mind.
Model data (parameter counts, context length, downloads) is fetched live from
the [Hugging Face API](https://huggingface.co/docs/hub/api) in the browser —
there is no backend.

1. Choose your hardware (Mac chip + memory, or PC GPU + RAM).
2. Choose a task: chat, coding, data processing, note taking, writing, images.
3. Get ranked GGUF models with the best quant that fits, estimated tokens/s,
   and a copy-paste Ollama / llama.cpp command. Fine-tunes and re-quantisations
   of the same architecture and size are grouped under one card (toggle "Group
   similar").

## Develop

```bash
npm install
npm run dev     # http://localhost:5173
npm test
npm run build   # ~12 KB gzipped JS (Preact)
```

## Deploy

**Vercel** — import the repo; Vite is auto-detected, `vercel.json` adds cache
and CSP headers. Vercel Web Analytics (cookieless) is compiled in only when the
build runs on Vercel; enable it under the project's Analytics tab. Docker and
local builds include no analytics.

**Docker** — static files on `busybox` (~6 MB image):

```bash
docker build -t local-model-picker .
docker run --rm -p 8080:8080 local-model-picker
```

## How estimates work

`memory = params × bits-per-quant / 8 + KV cache + ~0.8 GB`. Speed is
`bandwidth / active-weight-bytes × 0.6`, blended between GPU and system RAM when
a model spills over. Mixture-of-experts models use active parameters for speed (parsed
from names like `30B-A3B`) and the geometric mean of active and total
parameters as a dense-equivalent size for capability. Task profiles in `src/lib/tasks.ts` set the context
size, minimum quant quality, minimum model size and speed-vs-capability weight.
