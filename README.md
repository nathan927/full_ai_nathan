# AI 智能教育助手 (AI Education Assistant)

一個支持粵語、普通話、英語的多功能智能教育平台，提供語音學習、作業批改、個性化輔導等功能。

## 🌟 主要功能

- **多語言支持**: 粵語、普通話、英語三語教學
- **智能對話**: AI驅動的個性化學習助手
- **語音識別**: 支持語音輸入和語音合成
- **作業批改**: OCR識別 + AI智能批改
- **科目覆蓋**: 數學、中文、英文等多個科目

## 🚀 技術棧

- **前端**: Next.js 13, React 18, TypeScript
- **UI組件**: Tailwind CSS, shadcn/ui, Framer Motion
- **AI服務**: OpenRouter (多模型支持)
- **語音技術**: Web Speech API
- **OCR**: Tesseract.js
- **數據庫**: Supabase (可選)

## 📦 安裝與運行

### 本地開發

1. 克隆項目
```bash
git clone https://github.com/nathan927/full_ai_nathan.git
cd full_ai_nathan
```

2. 安裝依賴
```bash
npm install
```

3. 配置環境變量
```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件，添加必要的API密鑰：
```env
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. 運行開發服務器
```bash
npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看應用。

### 生產部署

項目已配置自動部署到 GitHub Pages：

1. 在 GitHub 倉庫設置中添加以下 Secrets：
   - `NEXT_PUBLIC_OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. 推送到 main 分支會自動觸發部署

3. 在倉庫設置中啟用 GitHub Pages，選擇 "GitHub Actions" 作為源

## 🔧 配置說明

### OpenRouter API
項目使用 OpenRouter 提供多模型AI服務支持：
- MiniMax M1 Extended (付費)
- Gemini 2.0 Flash (免費)
- Kimi Dev 72B (免費)
- DeepSeek R1 (免費)

### Supabase (可選)
用於用戶數據和學習記錄存儲，如不需要可跳過配置。

## 📱 功能特色

### 智能對話學習
- 支持文字和語音輸入
- 個性化教學提示
- 實時AI回應

### 作業批改系統
- 拍照上傳作業
- OCR文字識別
- AI智能批改和建議

### 多語言教學
- 粵語：使用廣東話表達和教學
- 普通話：標準中文教學
- 英語：英文教學和口語練習

## 🛠️ 開發指南

### 項目結構
```
├── app/                 # Next.js App Router
├── components/          # React 組件
├── lib/                # 工具庫和服務
│   ├── ai/             # AI服務
│   ├── speech/         # 語音服務
│   ├── ocr/            # OCR服務
│   └── language/       # 語言配置
├── hooks/              # React Hooks
└── public/             # 靜態資源
```

### 添加新功能
1. 在 `components/` 中創建UI組件
2. 在 `lib/` 中添加業務邏輯
3. 在 `hooks/` 中創建自定義Hook
4. 更新語言配置文件

## 📄 許可證

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 聯繫

如有問題或建議，請通過 GitHub Issues 聯繫。