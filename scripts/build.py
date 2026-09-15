"""Build both language pages using only the Python standard library."""
import json
from html import escape as esc
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'content.json').read_text())
labels = {
 'en': {'about':'About', 'news':'News', 'education':'Education & research', 'industry':'Industry experience', 'publications':'Publications & preprints', 'interests':'Interests', 'research':'Research experience', 'published':'Publications', 'manuscripts':'Research manuscripts', 'legend':'* Equal contribution. Project leadership is noted separately.', 'manuscript':'Research manuscript', 'email':'Email', 'skip':'Skip to content', 'updated':'Updated', 'top':'Back to top', 'Paper':'Paper', 'Project':'Project'},
 'zh': {'about':'关于我', 'news':'最新动态', 'education':'教育与研究经历', 'industry':'业界经历', 'publications':'论文与预印本', 'interests':'研究兴趣', 'research':'研究经历', 'published':'已发表论文', 'manuscripts':'研究稿件', 'legend':'* 表示同等贡献；项目负责人身份单独标注。', 'manuscript':'研究稿件', 'email':'邮箱', 'skip':'跳至正文', 'updated':'更新于', 'top':'返回顶部', 'Paper':'论文', 'Project':'项目主页'}
}

for lang in ('en', 'zh'):
 t = labels[lang]
 prefix = './' if lang == 'en' else '../'
 def local(value):
  return esc(value[lang] if isinstance(value, dict) else value)
 def section(key, number, body):
  return f'<section class="section {key}" id="{key}" aria-labelledby="heading-{key}"><div class="section-head"><span class="num" aria-hidden="true">{number:02d}</span><h2 id="heading-{key}">{t[key]}</h2></div>{body}</section>'
 def entries(items):
  return ''.join(f'<article class="entry"><div class="date">{local(e["date"])}</div><h3>{local(e["title"])}</h3><p class="subtitle">{local(e["subtitle"])}</p><p>{local(e["text"])}</p></article>' for e in items)
 def paper(p):
  authors = esc(p['authors']).replace('Mingyuan Jia', '<strong>Mingyuan Jia</strong>')
  links = ''.join(f'<a href="{esc(url, quote=True)}">{t.get(label, esc(label))}</a>' for label,url in p['links'])
  venue = local(p['venue']) if p['published'] else f'{p["year"]} · {t["manuscript"]}'
  return f'<article class="paper"><div class="paper-top"><span class="paper-key">{esc(p["key"])}</span><span class="venue">{venue}</span></div><h3>{esc(p["title"])}</h3><p class="authors">{authors}</p><p class="summary">{local(p["summary"])}</p><div class="paper-links">{links}<span class="role">{local(p["role"])}</span></div></article>'
 sections = [
  section('about',1,''.join(f'<p>{esc(p)}</p>' for p in data['about'][lang])),
  section('news',2,'<ul class="news">'+''.join(f'<li><time>{esc(n["date"])}</time><p>{esc(n[lang])}</p></li>' for n in data['news'])+'</ul>'),
  section('education',3,entries(data['education'])+f'<h3 class="subheading">{t["research"]}</h3>'+entries(data['research'])),
  section('industry',4,entries(data['industry'])),
  section('publications',5,f'<p class="legend">{t["legend"]}</p>'+''.join(paper(p) for p in data['publications'] if p['published'])+f'<h3 class="subheading">{t["manuscripts"]}</h3>'+''.join(paper(p) for p in data['publications'] if not p['published'])),
  section('interests',6,'<div class="interest-grid">'+''.join(f'<article><h3>{local(i["title"])}</h3><p>{local(i["text"])}</p></article>' for i in data['interests'])+'</div>')
 ]
 nav = ''.join(f'<a href="#{key}">{t[key]}</a>' for key in ('about','news','education','industry','publications','interests'))
 langs = '<span aria-current="page" lang="en">EN</span><a data-language href="./zh/" lang="zh-CN" hreflang="zh-CN">中文</a>' if lang == 'en' else '<a data-language href="../" lang="en" hreflang="en">EN</a><span aria-current="page" lang="zh-CN">中文</span>'
 profile = data['profile'][lang]
 description = 'Mingyuan Jia, Tsinghua University. Research in world models, embodied intelligence, robotics, and representation learning.' if lang == 'en' else 'Mingyuan Jia，清华大学自动化系本科生。研究方向：世界模型、具身智能、机器人与表征学习。'
 page = f'''<!doctype html>
<html lang="{'en' if lang == 'en' else 'zh-CN'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{local(data['name'])} · {'Tsinghua University' if lang == 'en' else '清华大学'}</title>
<meta name="description" content="{esc(description, quote=True)}">
<meta name="theme-color" content="#245caf">
<link rel="alternate" hreflang="en" href="{prefix}"><link rel="alternate" hreflang="zh-CN" href="{prefix}zh/">
<link rel="alternate" hreflang="x-default" href="{prefix}">
<link rel="icon" href="{prefix}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="{prefix}assets/style.css"><script src="{prefix}assets/site.js" defer></script>
</head>
<body class="{lang}" id="top">
<a class="skip" href="#content">{t['skip']}</a>
<div class="layout">
<aside class="profile" aria-label="{'Profile and navigation' if lang == 'en' else '个人信息与导航'}">
<img class="portrait" src="{prefix}assets/portrait.jpg" width="120" height="160" alt="Mingyuan Jia">
<h1>{local(data['name'])}</h1>
<p class="bio">{esc(profile[0])}<br><strong>{esc(profile[1])}</strong></p>
<p class="focus">{esc(profile[2])}</p>
<div class="contact"><a href="mailto:{esc(data['email'])}">{t['email']}</a><a href="{esc(data['scholar'])}">Google Scholar</a></div>
<nav class="nav" aria-label="{'Sections' if lang == 'en' else '章节'}">{nav}</nav>
<nav class="languages" aria-label="{'Language' if lang == 'en' else '语言'}">{langs}</nav>
</aside>
<main id="content">{''.join(sections)}
<footer><span>© {data['updated'][:4]} {local(data['name'])} · {t['updated']} {data['updated'][:7]}</span><a href="#top">{t['top']} ↑</a></footer>
</main></div></body></html>'''
 out = ROOT / ('index.html' if lang == 'en' else 'zh/index.html')
 out.parent.mkdir(exist_ok=True)
 out.write_text(page)
 print(f'Built {out.relative_to(ROOT)}')
