models:
  # -------------------------
  # OPENROUTER (DeepSeek, Qwen)
  # -------------------------
  - name: 🧠 DeepSeek V3 (OpenRouter)
    provider: openrouter
    model: deepseek/deepseek-chat-v3-0324:free
    apiKey: sk-or-xxx
    apiBase: https://openrouter.ai/api/v1
    contextLength: 64000

  - name: ⚡ Qwen 2.5 Coder 32B
    provider: openrouter
    model: qwen/qwen-2.5-coder-32b:free
    apiKey: sk-or-xxx
    apiBase: https://openrouter.ai/api/v1
    contextLength: 64000

  # -------------------------
  # GROQ (super cepat)
  # -------------------------
  - name: 🚀 Groq Llama 3.3 70B
    provider: groq
    model: llama-3.3-70b-versatile
    apiKey: gsk_xxx
    contextLength: 128000

  - name: ⚡ Groq Llama 3.1 8B Instant
    provider: groq
    model: llama-3.1-8b-instant
    apiKey: gsk_xxx
    contextLength: 128000

  # -------------------------
  # CEREBRAS (gunakan provider openai)
  # -------------------------
  - name: 💎 Cerebras Llama 3.1 8B
    provider: openai
    model: llama-3.1-8b
    apiKey: csk_xxx
    apiBase: https://api.cerebras.ai/v1
    contextLength: 8000

  # -------------------------
  # GOOGLE GEMINI API
  # -------------------------
  - name: 🌟 Gemini 1.5 Pro
    provider: google
    model: gemini-1.5-pro
    apiKey: AIzaSyXXX
    contextLength: 2000000

  - name: 🌟 Gemini 1.5 Flash
    provider: google
    model: gemini-1.5-flash
    apiKey: AIzaSyXXX
    contextLength: 1000000

  - name: 🌟 Gemini 2.5 Flash Lite
    provider: google
    model: gemini-2.5-flash-lite
    apiKey: AIzaSyXXX

  # -------------------------
  # OLLAMA (opsional local model)
  # -------------------------
  - name: 🖥️ Ollama: Llama 3.1 8B
    provider: ollama
    model: llama3.1:8b
    apiBase: http://localhost:11434

# TAB AUTOCOMPLETE
tabAutocompleteModel:
  name: 💎 Cerebras Llama 3.1 8B

tabAutocompleteOptions:
  maxTokens: 80
  debounceDelay: 200

embeddingsProvider:
  provider: google
  model: text-embedding-004
  apiKey: AIzaSyXXX

context:
  - provider: code
    params: { nLines: 100 }
  - provider: docs
  - provider: diff
  - provider: terminal
    params: { nLines: 30 }
  - provider: problems
  - provider: folder
    params: { maxFiles: 15 }

# COMMANDS
slashCommands:
  - name: explain
    description: Jelaskan kode
    prompt: "Jelaskan kode berikut:\n\n{{input}}"

  - name: refactor
    description: Refactor kode
    prompt: "Refactor kode berikut:\n\n{{input}}"

  - name: fix
    description: Fix bug
    prompt: "Perbaiki bug berikut:\n\n{{input}}"

systemMessage: |
  Kamu adalah AI programmer senior.
  Selalu pakai Bahasa Indonesia.
  Jelaskan reasoning setiap langkah.