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

头像位于 `assets/portrait.jpg`，桌面和手机均按正方形显示，替换时建议使用方形图片。
样式位于 `assets/style.css`；强调色由 `--blue` 控制。
论文 `published: true` 显示在已发表列表，其他条目显示在研究稿件列表。公开链接维护在 `links`。研究稿件不表示已录用或已公开预印本。

## GitHub Pages 发布

1. 在自己的 GitHub 账号下创建 `用户名.github.io` 仓库（若已有，先保留其原有内容）。
2. 把本目录的**内容**上传到仓库根目录，不要再套一层 `mingyuan-site` 文件夹。
3. 打开仓库 **Settings → Pages → Build and deployment**。
4. Source 选择 **Deploy from a branch**；分支选择 `clean-website`，目录选择 `/ (root)`，保存。
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
- 中文姓名依据原主页确认为贾明远；公司及导师未确认的中文译名保留英文。
- AirScape 的作者拼写和共同一作标记以正式 PDF 与公开项目页为准。
- CV 中 WorldScape、Worldscape-MoE 的标题与所附 PDF 不一致；当前采用 CV 标题。
- ReplicateAnyScene 的 CV 标注 3DV 2027 投稿，PDF 为 ECCV 2026 匿名稿；前台统一显示研究稿件，不推断录用状态。
- 所附其他匿名 PDF 未打包到网站；已公开的 AirScape 使用 arXiv 和项目主页链接。
- 兴趣栏目采用研究兴趣，未添加没有资料依据的个人爱好。
- 当前经历的“至今”和投稿信息依据所提供 CV，后续应随个人进展更新。
- 网站未包含手机号，也未打包其他个人证明文件。

仓库：https://github.com/benjamin0227/my-github-page

维护分支：`clean-website`。在 Settings → Pages 中启用该分支根目录发布后，网站地址为 https://benjamin0227.github.io/my-github-page/ 。

## 论文资源链接

`content.json` 每篇论文的 `links` 支持 `Project`、`Paper`、`Code`，按此顺序显示。只填写已公开且核实的 URL；空缺入口不显示。论文标题优先链接项目页，其次论文页，无可用链接时保留普通标题。论文外链、Scholar 和 CV 在新标签页打开，站内导航仍在当前页跳转。

链接分层参考 https://wkwan7.github.io/ ，样式独立实现。AirScape 代码入口依据其官方项目页核实：https://github.com/EmbodiedCity/AirScape.code 。

论文展示图位于 `assets/papers/`，从用户提供 PDF 中提取：AirScape 第 2 页、WorldScape 第 2 页、WorldREPA 第 3 页、MoE 第 2 页、ReplicateAnyScene 第 1 页。`content.json` 的 `image` 字段指定图片。论文列表不再展示个人贡献和作者身份说明；点击缩略图在新标签页查看大图。

## 经历机构标识

教育、研究和业界经历的标识存放在 `assets/organizations/`，来自各机构官网或官方 GitHub 组织头像，原始资源 URL 记录于 `sources.json`。清华校徽使用官网白色图形，置于紫色背景上。每条经历的 `logo` 与 `url` 控制图标及官网链接，点击图标在新标签页打开机构主页。

## 论文视图配置

首页不再显示语言切换入口。论文默认显示 Selected，当前仅 AirScape。修改 `content.json`：
- `publication_view`：`selected` 或 `date`，控制默认视图。
- 每篇论文的 `selected`：`true` 加入精选，`false` 移出。
- `selected_order`：精选顺序，数字越小越靠前。
- `year`：按年份降序排列；需要精确顺序时添加 `date`（YYYY-MM-DD）。相同日期保持数据中的先后顺序。

修改后运行 `python3 scripts/build.py`。关闭 JavaScript 时显示全部论文。CSS 和 JS 链接自动附带内容版本号，以避免继续使用旧布局缓存。
