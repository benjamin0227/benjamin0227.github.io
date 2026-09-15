"""Build both language pages using only the Python standard library."""
import json
import re
import hashlib
from html import escape as esc
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'content.json').read_text())
labels = {
 'en': {'hobbies':'Hobbies', 'about':'About', 'news':'News', 'education':'Education & research', 'industry':'Industry experience', 'publications':'Publications & preprints', 'interests':'Interests', 'research':'Research experience', 'published':'Publications', 'manuscripts':'Research manuscripts', 'legend':'* Equal contribution. ', 'manuscript':'Research manuscript', 'email':'Email', 'skip':'Skip to content', 'updated':'Updated', 'top':'Back to top', 'Paper':'Paper', 'Project':'Project', 'Code':'Code'},
 'zh': {'hobbies':'个人爱好', 'about':'关于我', 'news':'最新动态', 'education':'教育与研究经历', 'industry':'业界经历', 'publications':'论文与预印本', 'interests':'研究兴趣', 'research':'研究经历', 'published':'已发表论文', 'manuscripts':'研究稿件', 'legend':'* 表示同等贡献。', 'manuscript':'研究稿件', 'email':'邮箱', 'skip':'跳至正文', 'updated':'更新于', 'top':'返回顶部', 'Paper':'论文', 'Project':'项目主页', 'Code':'代码'}
}

def icon(kind):
 paths = {
  'project': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  'code': '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>',
  'email': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  'scholar': '<path d="m2 9 10-5 10 5-10 5-10-5Zm4 2v6c4 3 8 3 12 0v-6M22 9v8"/>',
  'cv': '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Zm0 0v6h6M8 13h8M8 17h6"/>'
 }
 return '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths[kind] + '</svg>'

for lang in ('en', 'zh'):
 t = labels[lang]
 prefix = './' if lang == 'en' else '../'
 def local(value):
  return esc(value[lang] if isinstance(value, dict) else value)
 def about_paragraph(text):
  phrases = {phrase: kind for kind, values in data.get('about_emphasis', {}).get(lang, {}).items() for phrase in values}
  if not phrases:
   return '<p>' + esc(text) + '</p>'
  pattern = re.compile('|'.join(re.escape(phrase) for phrase in sorted(phrases, key=len, reverse=True)))
  parts, position = [], 0
  for match in pattern.finditer(text):
   parts.append(esc(text[position:match.start()]))
   kind = phrases[match.group()]
   tag = {'institution':'strong', 'person':'strong', 'interest':'mark', 'idea':'em'}[kind]
   parts.append(f'<{tag} class="about-{kind}">{esc(match.group())}</{tag}>')
   position = match.end()
  parts.append(esc(text[position:]))
  return '<p>' + ''.join(parts) + '</p>'
 def section(key, number, body):
  return f'<section class="section {key}" id="{key}" aria-labelledby="heading-{key}"><div class="section-head"><span class="num" aria-hidden="true">{number:02d}</span><h2 id="heading-{key}">{t[key]}</h2></div>{body}</section>'
 def entries(items):
  result = []
  for e in items:
   variant = ' organization-logo--tsinghua' if e['logo'].endswith('/tsinghua.png') else ''
   logo = f'<a class="organization-logo{variant}" href="{esc(e["url"], quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{local(e["title"])}"><img src="{prefix}{esc(e["logo"])}" alt="" width="64" height="64"></a>'
   result.append(f'<article class="entry">{logo}<div class="entry-details"><div class="date">{local(e["date"])}</div><h3>{local(e["title"])}</h3><p class="subtitle">{local(e["subtitle"])}</p><p>{local(e["text"])}</p></div></article>')
  return ''.join(result)
 def paper(p):
  authors = esc(p['authors']).replace('Mingyuan Jia', '<strong>Mingyuan Jia</strong>')
  resources = dict(p['links'])
  ordered = [(key, resources[key]) for key in ('Project', 'Paper', 'Code') if resources.get(key)]
  ordered += [(key, url) for key, url in p['links'] if key not in ('Project', 'Paper', 'Code') and url]
  new_tab = 'opens in a new tab' if lang == 'en' else '在新标签页打开'
  links = ''.join(f'<a class="resource-link" href="{esc(url, quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{esc(p["key"])} · {t.get(label, esc(label))} ({new_tab})">{icon({"Project":"project","Paper":"cv","Code":"code"}.get(label,"project"))}<span>{t.get(label, esc(label))}</span><span class="external-mark" aria-hidden="true">↗</span></a>' for label,url in ordered)
  destination = resources.get('Project') or resources.get('Paper')
  title = esc(p['title'])
  if destination:
   title = f'<a class="paper-title-link" href="{esc(destination, quote=True)}" target="_blank" rel="noopener noreferrer" aria-label="{title} ({new_tab})">{title}</a>'
  thumbnail = f'<a class="paper-figure" href="{prefix}{esc(p["image"])}" target="_blank" rel="noopener" aria-label="{esc(p["key"])} · {"View figure" if lang == "en" else "查看论文配图"}"><img src="{prefix}{esc(p["image"])}" alt="{esc(p["key"])} {"overview figure" if lang == "en" else "概览图"}" width="{p['image_width']}" height="{p['image_height']}" loading="lazy"></a>'
  venue = local(p['venue']) if p['published'] else f'{p["year"]} · {t["manuscript"]}'
  return f'<article class="paper" data-selected="{str(p.get("selected", False)).lower()}" data-selected-order="{p.get("selected_order", 100)}">{thumbnail}<div class="paper-details"><div class="paper-top"><span class="paper-key">{esc(p["key"])}</span><span class="venue">{venue}</span></div><h3>{title}</h3><p class="authors">{authors}</p>{'<div class="paper-links">' + links + '</div>' if links else ''}</div></article>'
 def hobbies():
  tabs, panels = [], []
  for i, hobby in enumerate(data.get('hobbies', [])):
   key = esc(hobby['id'], quote=True)
   tabs.append(f'<button type="button" role="tab" id="hobby-tab-{key}" aria-controls="hobby-panel-{key}" aria-selected="{str(i == 0).lower()}" tabindex="{0 if i == 0 else -1}">{local(hobby["title"])}</button>')
   slides = []
   for j, photo in enumerate(hobby.get('images', [])):
    slides.append(f'<figure class="hobby-slide"{ " hidden" if j else ""}><img src="{prefix}{esc(photo["src"], quote=True)}" alt="{local(photo["alt"])}" loading="lazy"><figcaption>{local(photo.get("caption", ""))}</figcaption></figure>')
   empty = '<div class="hobby-empty"><span aria-hidden="true">＋</span><p>Photos coming soon.</p></div>' if not slides else ''
   panels.append(f'<div class="hobby-panel" role="tabpanel" id="hobby-panel-{key}" aria-labelledby="hobby-tab-{key}" tabindex="0"{ " hidden" if i else ""}><h3>{local(hobby["title"])}</h3><div class="hobby-stage">{empty}{"".join(slides)}</div><div class="hobby-pagination"><button type="button" data-step="-1" aria-label="Previous photo" disabled>←</button><span class="hobby-count" role="status" aria-live="polite">{ "1 / " + str(len(slides)) if slides else "0 / 0"}</span><button type="button" data-step="1" aria-label="Next photo" disabled>→</button></div></div>')
  return '<div class="hobby-tabs" role="tablist" aria-label="Hobbies">' + ''.join(tabs) + '</div>' + ''.join(panels)
 sections = [
  section('about',1,''.join(about_paragraph(p) for p in data['about'][lang])),
  section('news',2,'<ul class="news">'+''.join(f'<li><time>{esc(n["date"])}</time><p>{esc(n[lang])}</p></li>' for n in data['news'])+'</ul>'),
  section('interests',3,'<div class="interest-grid">'+''.join(f'<article><h3>{local(i["title"])}</h3><p>{local(i["text"])}</p></article>' for i in data['interests'])+'</div>'),
  section('education',4,entries(data['education'])+f'<h3 class="subheading">{t["research"]}</h3>'+entries(data['research'])),
  section('industry',5,entries(data['industry'])),
  section('publications',6,f'<div class="publication-controls" role="group" aria-label="Publication view" hidden><button type="button" data-publication-view="date" aria-pressed="false">By date</button><button type="button" data-publication-view="selected" aria-pressed="false">Selected</button></div><p class="legend">{t["legend"]}</p><div class="publication-list" data-default-view="{esc(data.get("publication_view", "selected"))}">'+''.join(paper(p) for p in sorted(data['publications'], key=lambda p: p.get('date', str(p['year'])), reverse=True))+'</div><p class="publication-empty" hidden>No selected publications yet.</p>'),
 ]
 sections.append(section('hobbies',7,hobbies()))
 nav = ''.join(f'<a href="#{key}">{t[key]}</a>' for key in ('about','news','interests','education','industry','publications','hobbies'))
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
<link rel="stylesheet" href="{prefix}assets/style.css?v={hashlib.sha256((ROOT / "assets/style.css").read_bytes()).hexdigest()[:10]}"><script src="{prefix}assets/site.js?v={hashlib.sha256((ROOT / "assets/site.js").read_bytes()).hexdigest()[:10]}" defer></script>
</head>
<body class="{lang}" id="top">
<a class="skip" href="#content">{t['skip']}</a>
<div class="layout">
<aside class="profile" aria-label="{'Profile and navigation' if lang == 'en' else '个人信息与导航'}">
<img class="portrait" src="{prefix}assets/portrait.jpg" width="120" height="120" alt="Mingyuan Jia">
<h1>{local(data['name'])}</h1>
<p class="bio">{esc(profile[0])}<br><strong>{esc(profile[1])}</strong></p>
<p class="focus">{esc(profile[2])}</p>
<div class="contact"><a href="mailto:{esc(data['email'])}">{icon('email')}{t['email']}</a><a href="{esc(data['scholar'])}" target="_blank" rel="noopener noreferrer" title="Google Scholar ↗">{icon('scholar')}Google Scholar</a><a href="{prefix}assets/files/MingyuanJia-CV.pdf" target="_blank" rel="noopener noreferrer" title="CV · PDF ↗">{icon('cv')}CV <span class="file-type">PDF</span></a></div>
<nav class="nav" aria-label="{'Sections' if lang == 'en' else '章节'}">{nav}</nav>
</aside>
<main id="content">{''.join(sections)}
<footer><span>© {data['updated'][:4]} {local(data['name'])} · {t['updated']} {data['updated'][:7]}</span><a href="#top">{t['top']} ↑</a></footer>
</main></div></body></html>'''
 out = ROOT / ('index.html' if lang == 'en' else 'zh/index.html')
 out.parent.mkdir(exist_ok=True)
 out.write_text(page)
 print(f'Built {out.relative_to(ROOT)}')
