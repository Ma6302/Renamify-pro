# Renamify Pro 🚀

![License](https://img.shields.io/badge/license-NonCommercial-red.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

**Renamify Pro** 是一款智能批量文件管理系统，旨在打通 Excel 数据与本地文件系统之间的壁垒。它允许用户通过自定义规则，将本地文件与 Excel 记录进行智能匹配，从而瞬间完成数千个文件的重命名工作，极大提升办公效率。

![软件截图](./docs/screenshot-main.png)

---

## ✨ 核心功能 (Key Features)

*   **📊 Excel 数据深度集成**：支持导入 `.xlsx`, `.xls`, `.csv` 文件。内置智能解析引擎，自动识别表头，完美处理合并单元格数据。
*   **🔍 智能模糊匹配**：自动将本地文件（如学生作业、发票、合同）与 Excel 行数据进行匹配，支持姓名、学号、ID 等关键字段检索。
*   **🛠️ 可视化规则编辑器**：通过拖拽式界面创建重命名规则。支持混合使用 Excel 动态列（如“班级”、“姓名”）和自定义文本字符。
*   **⚡ 原生级性能**：基于 Electron 构建，调用 Node.js 底层 `fs` 模块，绕过浏览器沙箱限制，实现秒级处理大量文件。
*   **🛡️ 安全预览机制**：在执行重命名通过“预览”功能检查结果。提供详细的状态日志（成功/失败/跳过/源数据缺失），确保文件安全。
*   **🎨 现代化 UI 设计**：基于 Tailwind CSS 构建的清爽界面，支持 **深色模式 (Dark Mode)** 和 **中英双语** 一键切换。
*   **📦 智能安装程序**：定制化的 Windows 安装包，自动检测磁盘环境。如果存在 D 盘，将优先安装至 `D:\Renamify Pro`，减少 C 盘占用。

---

## 🛠️ 技术栈 (Tech Stack)

*   **核心框架**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **构建工具**: [Vite](https://vitejs.dev/)
*   **桌面运行时**: [Electron 28](https://www.electronjs.org/)
*   **样式库**: [Tailwind CSS v3](https://tailwindcss.com/)
*   **数据处理**: [SheetJS (xlsx)](https://sheetjs.com/) - 强大的 Excel 解析库
*   **图标库**: [Lucide React](https://lucide.dev/)
*   **打包工具**: [Electron Builder](https://www.electron.build/) (集成 NSIS 脚本)

---

## 🚀 开发指南 (Getting Started)

### 环境要求
*   Node.js (建议 v18 或更高版本)
*   npm 或 yarn

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/your-username/renamify-pro.git

# 进入目录
cd renamify-pro

# 安装依赖包
npm install
```

### 2. 启动开发模式

在浏览器中运行 Web 版（用于 UI 调试）：
```bash
npm run dev
```

### 3. 启动桌面端调试

在 Electron 容器中预览应用（模拟真实环境）：
```bash
# 确保先运行一次构建，因为 main.cjs 依赖 dist 目录
npm run build
npx electron .
```

---

## 📦 打包发布 (Build)

生成 Windows 安装程序 (`.exe`)：

```bash
npm run dist
```

**该命令执行流程：**
1.  调用 Vite 将 React 代码编译至 `dist/` 目录。
2.  调用 Electron Builder 进行封装。
3.  应用 `build/installer.nsh` 中的自定义脚本（实现 D 盘优先安装逻辑）。
4.  最终安装包将输出至 `release/` 文件夹。

---

## 📂 项目结构 (Project Structure)

```text
renamify-pro/
├── components/          # React 组件层
│   ├── ExcelManagerView.tsx  # Excel 导入与数据管理视图
│   ├── RenamerView.tsx       # 核心重命名逻辑与规则编辑器
│   └── ui/                   # 通用 UI 组件 (复选框、Tab切换、主题开关)
├── build/               # Electron 构建资源
│   └── installer.nsh    # NSIS 自定义安装脚本 (D盘优先逻辑)
├── release/             # 打包输出目录 (exe 文件在此)
├── App.tsx              # 应用入口与全局状态管理
├── main.cjs             # Electron 主进程 (Node.js 后端逻辑)
├── types.ts             # TypeScript 类型定义
├── tailwind.config.js   # 样式配置文件
└── vite.config.ts       # 构建配置文件
```

---

## 💡 工作原理 (How It Works)

1.  **数据摄入**：应用使用 `SheetJS` 读取用户本地 Excel 文件并转换为 JSON 对象存储在内存中。
2.  **匹配算法**：当用户选择文件夹时，应用遍历文件列表，尝试将文件名与已导入的 Excel 数据进行模糊匹配（基于用户设定的关键列）。
3.  **重命名引擎**：
    *   **Electron 模式**：检测到桌面环境时，动态加载 `fs` 和 `path` 模块，直接调用 `fs.renameSync` 执行操作，无需额外权限弹窗。
    *   **Web 模式**：降级使用 File System Access API (仅限 Chrome)，能力受限。
4.  **持久化**：用户设置和导入的数据引用会保存至 `localStorage`，确保关闭软件后数据不丢失。

---

## ⚠️ 许可协议 (License)

**本项目非开源软件 (Source Available)**。使用本项目源码需遵循以下条款：

1.  **个人/非营利使用**：允许个人用户下载、编译源码用于学习或个人用途。
2.  **二次开发**：如需基于本项目进行二次开发并分发（无论是否收费），**必须事先联系作者获得许可**。
3.  **商业用途**：任何将本项目用于商业环境、整合进收费产品或提供商业服务的行为，**必须购买商业授权**。

如需获取商业授权或二次开发许可，请联系：
📧 **Email**: [2639582822@qq.com]
💬 **WeChat**: [m2639582822]

---

**Author**: [Ma6302]
**Copyright**: © 2026 Renamify Pro. All Rights Reserved.
