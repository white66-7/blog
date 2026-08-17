# OFX 插件汉化关键规则

## 用户项目：汉化达芬奇 OpenFX 插件（RapidGrade 等）

用户是达芬奇调色用户，常用方式是把 `.setting` 转场预设和 `.ofx` 插件汉化成中文。OFX 汉化工具链保留在 `C:\Users\12625\Desktop\PROJECTS\tools\`（ofx_localize.py 等长替换引擎 + ofx_final_map.json 通用映射库，600+ 条英中映射可复用）。

## 核心教训（从 RapidGrade 事故总结）

**绝不能翻译 OFX 内部标识字符串**，否则达芬奇报"参数未公布/插件不可用"：
- `Output`、`Source` 是 OFX 输入/输出 clip 的标准内部 ID —— 翻译它们达芬奇就找不到 clip → 插件崩
- 参数 ID 是带下划线的小驼峰（如 `cs_primaries`、`ga_global_exp`）—— 绝不能碰
- 纯大写内部标识（如 `PRIMARIES_AP0`、`GRAIN_MODE_MONO`）—— 绝不能碰

**安全翻译的**：首字母大写的参数 label（Exposure→曝光）、组名、按钮（Reset/Enable/Copy/Paste）、预设名（Kodak 2383→柯达2383）、长句悬停提示（kOfxParamPropHint）。这些只影响显示。

**等长限制**：等长替换要求中文 UTF-8 字节数 ≤ 英文原长（短词如 Look=4 字节放不下"风格"=6 字节）。放不下的保留英文或用单字。

## How to apply
汉化新 OFX 时：
1. 只翻译"确定是 UI 显示文本"的长短语/组名/预设/提示
2. 短单词（≤6 字母）谨慎——先确认不是 OFX clip ID / 参数 ID
3. 每次改完让用户在达芬奇实测能加载，再扩大范围
4. 先备份原文件（tools 目录有备份惯例）
