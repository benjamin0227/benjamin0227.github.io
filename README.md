# Mingyuan Jia — Personal website

简约、中英文双页、适配手机的个人学术主页。英文首页为 `index.html`，中文为 `zh/index.html`，切换语言保留当前章节。页面即使关闭 JavaScript 也能阅读和切换语言。无外部字体、无追踪、无运行时依赖。

## 本地预览

在本目录运行：

```sh
python3 -m http.server 8000
```

打开 http://localhost:8000 。

## 修改内容

1. 编辑 `content.json`。中英文文案分别放在 `en`、`zh` 字段。
2. 运行 `python3 scripts/build.py`，同时更新两种语言的页面。
3. 将 `content.json` 和生成的 HTML 一起提交到 GitHub。

照片位于 `assets/portrait.jpg`。原图只有 150 × 200 像素，建议日后替换更高清的同纵横比照片。
样式位于 `assets/style.css`；强调色由 `--blue` 控制。
论文 `published: true` 显示在已发表列表，其他条目显示在研究稿件列表。公开链接维护在 `links`。研究稿件不表示已录用或已公开预印本。

## GitHub Pages 发布

1. 在自己的 GitHub 账号下创建 `用户名.github.io` 仓库（若已有，先保留其原有内容）。
2. 把本目录的**内容**上传到仓库根目录，不要再套一层 `mingyuan-site` 文件夹。
3. 打开仓库 **Settings → Pages → Build and deployment**。
4. Source 选择 **Deploy from a branch**；分支选择 `main`，目录选择 `/ (root)`，保存。
5. 等待 Pages 部署完成，访问 `https://用户名.github.io/`。

也支持普通项目仓库对应的 `https://用户名.github.io/仓库名/`，资源使用相对路径。`.nojekyll` 让 GitHub 直接发布预生成的页面；无需安装 Ruby 或 Jekyll。后续若要加入博客，可再迁移到 Jekyll。

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## 模板调研与选型

- [Minimal Light](https://github.com/yaoyao-liu/minimal-light)：最贴近本次朴实双栏需求，提供学术主页、移动适配和 Markdown 管理。
- [Academic Pages](https://academicpages.github.io/)：适合需要 teaching、talks、portfolio 等更多学术栏目的网站。
- [al-folio](https://github.com/alshedivat/al-folio)：适合较完整的个人网站，含更多布局和功能，初始维护量较大。
- [Jekyll](https://jekyllrb.com/)：把模板和内容生成为静态页面，可配合 GitHub Pages。

本项目借鉴简约学术主页的双栏结构，代码为独立实现，没有复制模板源码。按当前需求直接生成 HTML，减少依赖和维护步骤。

## 内容依据与待核实事项

- 个人经历及主要论文元数据来自用户提供的 MingyuanJia-CV.pdf；动态由已有经历提炼。
- 中文姓名尚未确认，中文页面暂用 Mingyuan Jia；公司及导师未确认的中文译名保留英文。
- AirScape 的作者拼写和共同一作标记以正式 PDF 与公开项目页为准。
- CV 中 WorldScape、Worldscape-MoE 的标题与所附 PDF 不一致；当前采用 CV 标题。
- ReplicateAnyScene 的 CV 标注 3DV 2027 投稿，PDF 为 ECCV 2026 匿名稿；前台统一显示研究稿件，不推断录用状态。
- 所附其他匿名 PDF 未打包到网站；已公开的 AirScape 使用 arXiv 和项目主页链接。
- 兴趣栏目采用研究兴趣，未添加没有资料依据的个人爱好。
- 当前经历的“至今”和投稿信息依据所提供 CV，后续应随个人进展更新。
- 网站未包含手机号，也未打包其他个人证明文件。

尚未连接 GitHub 仓库，当前交付是可预览、可部署的本地版本。
