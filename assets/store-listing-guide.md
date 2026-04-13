# Chrome Web Store 发布信息填写指南

## 商品详情 (Store Listing)

### 语言
- 默认语言：**中文（简体）**
- 建议同时添加：**English**

---

### 插件名称 (Name)
```
Auto Scroll Reader
```

### 简短描述 (Summary) — 最多 132 字符
```
自动匀速滚动页面，解放双手沉浸阅读。支持空格键暂停/继续，左右键调速，智能识别滚动容器，兼容各类网站。
```

### 英文简短描述 (Summary - English)
```
Auto-scroll pages at a steady speed for hands-free reading. Space to pause/resume, arrow keys to adjust speed. Works on any site.
```

### 详细描述 (Description)
```
Auto Scroll Reader — 让阅读长文章像看视频一样轻松。

你是否经常阅读长篇技术文档、小说或新闻，却不得不反复滚动鼠标？Auto Scroll Reader 让页面自动匀速滚动，你只需专注内容本身。

核心功能：
● 自动匀速滚动 — 开启后页面平滑向下滚动，适合长文章、小说、技术文档等场景
● 快捷键控制 — 无需打开插件面板：Space 开始/暂停，← → 调节速度
● 10 档速度调节 — 通过滑动条或键盘实时调节，滚动过程中即时生效
● 智能暂停 — 滚动鼠标滚轮、点击页面内容、触屏滑动时自动暂停
● 全局开关 — 一键关闭所有功能，空格键恢复浏览器默认行为
● 跨页面记忆 — 开关状态和速度设置自动保存

兼容性：
● 智能识别页面滚动容器，兼容掘金、知乎、Medium、GitHub 等各类网站
● 输入框内按键不会被拦截，不影响正常输入

技术特点：
● 基于 Manifest V3，遵循 Chrome 最新扩展标准
● 零依赖，纯原生 JavaScript，体积极小
● 开源免费，代码透明

让阅读回归纯粹，解放你的双手。
```

### 英文详细描述 (Description - English)
```
Auto Scroll Reader — Read long articles as effortlessly as watching a video.

Tired of constantly scrolling through lengthy articles, documentation, or novels? Auto Scroll Reader automatically scrolls the page at a steady speed so you can focus on the content.

Key Features:
● Smooth auto-scrolling — Pages scroll down steadily, perfect for articles, novels, and docs
● Keyboard shortcuts — No need to open the popup: Space to start/pause, ← → to adjust speed
● 10 speed levels — Adjust via slider or keyboard in real-time, even while scrolling
● Smart pause — Auto-pauses on mouse wheel, page click, or touch swipe
● Global toggle — One switch to disable all features and restore default browser behavior
● Persistent settings — Speed and toggle state are saved across sessions

Compatibility:
● Smart scroll container detection — works on Juejin, Zhihu, Medium, GitHub, and more
● Input fields are never intercepted — type freely without interference

Technical Highlights:
● Built on Manifest V3, Chrome's latest extension standard
● Zero dependencies, pure vanilla JavaScript, minimal footprint
● Open source and free

Let reading be reading. Free your hands.
```

---

### 分类 (Category)
```
生产力工具 (Productivity)
```

---

## 图片素材要求

### 1. 商店图标 (Store Icon) — 必填
- 尺寸：**128 × 128 px**
- 格式：PNG
- 说明：已有 `icons/icon128.png`，可直接上传

### 2. 截图 (Screenshots) — 必填，至少 1 张，最多 5 张
- 尺寸：**1280 × 800 px** 或 **640 × 400 px**
- 格式：PNG 或 JPG
- 生成方式：用浏览器打开 `assets/screenshot-generator.html`，截取页面
- 建议截图内容：
  1. **主功能展示** — 插件弹窗 + 正在滚动的文章页面
  2. **快捷键提示** — 展示 Space/左右键操作
  3. **速度调节** — 展示滑动条和速度档位
  4. **智能暂停** — 展示暂停状态
  5. **全局开关** — 展示开关关闭状态

### 3. 小尺寸宣传图 (Small Promo Tile) — 可选但推荐
- 尺寸：**440 × 280 px**
- 格式：PNG 或 JPG
- 生成方式：用浏览器打开 `assets/promo-small.html`，截取页面

### 4. 大尺寸宣传图 (Large Promo Tile) — 可选
- 尺寸：**920 × 680 px**

### 5. 超大宣传图 (Marquee Promo Tile) — 可选
- 尺寸：**1400 × 560 px**
- 生成方式：用浏览器打开 `assets/promo-marquee.html`，截取页面

---

## 隐私相关 (Privacy)

### 权限说明 (Permission Justifications)

| 权限 | 用途说明 |
|------|---------|
| `activeTab` | 在当前标签页执行自动滚动功能 |
| `scripting` | 向页面注入滚动控制脚本 |
| `storage` | 保存用户的速度设置和开关状态 |

### 单一用途描述 (Single Purpose)
```
This extension provides automatic page scrolling for hands-free reading of long articles and documents.
```

### 隐私政策
- 不收集任何用户数据
- 不使用远程代码
- 如需填写隐私政策 URL，可写：`无需隐私政策（不收集用户数据）` 或创建一个简单的 GitHub Pages

### 数据使用声明
- **不收集用户数据** — 勾选此项
- 数据仅存储在本地（chrome.storage.sync 仅用于同步用户自己的设置）

---

## 发布设置 (Distribution)

### 可见性 (Visibility)
```
公开 (Public)
```

### 发布地区 (Distribution)
```
所有地区 (All regions)
```

---

## 截图生成步骤

1. 用 Chrome 浏览器打开 `assets/screenshot-generator.html`
2. 页面会显示 5 张预设截图场景
3. 使用截图工具（如 macOS 的 Cmd+Shift+4）截取每个场景
4. 确保截图尺寸为 1280×800
5. 同样方式打开 `promo-small.html` 和 `promo-marquee.html` 截取宣传图
