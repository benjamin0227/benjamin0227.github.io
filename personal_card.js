const HOME_QUOTES = [
    "把问题说清楚，答案自然会出现。",
    "先搭出最小可行版本，再追求优雅。",
    "真正的效率，是让未来的自己也能看懂现在的代码。",
    "研究不只关心正确答案，也关心正确问题。"
];

const BLOG_STORAGE_KEY = "personal-card-blog-posts-v1";
const BLOG_DRAFT_KEY = "personal-card-blog-draft-v1";

const DEFAULT_BLOG_POSTS = [
    {
        id: "seed-1",
        title: "第一篇杂谈：为什么开始做个人站点",
        category: "杂谈",
        content: "个人站点像一个可持续更新的工作台，能把阶段性思考沉淀成长期资产。",
        date: "2026-04-01T08:30:00.000Z"
    },
    {
        id: "seed-2",
        title: "本周学习笔记：控制与学习结合",
        category: "学习笔记",
        content: "我在实验中逐步体会到，控制系统的稳定性约束与学习策略的探索能力并不冲突。",
        date: "2026-04-05T10:00:00.000Z"
    }
];

const INTEREST_GATE_CONFIG = {
    storageKey: "personal-card-interest-unlocked-v1",
    questions: [
        { question: "我的 GitHub 用户名是？", answer: "jmy-idea" },
        { question: "我的学校简称是？（例如：THU）", answer: "thu" },
        { question: "当前站点主要使用的前端语言之一是？", answer: "javascript" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    markActiveNavigation();
    setupRevealAnimation();

    const page = document.body.dataset.page;
    if (page === "home") {
        initHomePage();
    }
    if (page === "blog") {
        initBlogPage();
    }
    if (page === "interests") {
        initInterestGate();
    }
});

function setCurrentYear() {
    const yearText = String(new Date().getFullYear());
    document.querySelectorAll(".current-year").forEach((node) => {
        node.textContent = yearText;
    });
}

function markActiveNavigation() {
    const current = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href === current || (current === "" && href === "index.html")) {
            link.classList.add("active");
        }
    });
}

function setupRevealAnimation() {
    const revealItems = Array.from(document.querySelectorAll(".reveal"));
    if (revealItems.length === 0) {
        return;
    }

    if (!("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
        observer.observe(item);
    });
}

function initHomePage() {
    const quoteText = document.getElementById("quoteText");
    const changeQuoteBtn = document.getElementById("changeQuote");
    const greetForm = document.getElementById("greetForm");
    const visitorNameInput = document.getElementById("visitorName");
    const greetOutput = document.getElementById("greetOutput");

    let quoteIndex = 0;
    if (quoteText) {
        quoteText.textContent = HOME_QUOTES[quoteIndex];
    }

    if (changeQuoteBtn && quoteText) {
        changeQuoteBtn.addEventListener("click", () => {
            quoteIndex = (quoteIndex + 1) % HOME_QUOTES.length;
            quoteText.textContent = HOME_QUOTES[quoteIndex];
        });
    }

    if (greetForm && visitorNameInput && greetOutput) {
        greetForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const userName = visitorNameInput.value.trim();
            const displayName = userName || "朋友";
            greetOutput.textContent = `${timeGreeting()}，${displayName}！欢迎来到我的个人主页。`;
        });
    }
}

function timeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
        return "早上好";
    }
    if (hour < 18) {
        return "下午好";
    }
    return "晚上好";
}

function initBlogPage() {
    const form = document.getElementById("blogForm");
    const titleInput = document.getElementById("blogTitle");
    const categorySelect = document.getElementById("blogCategory");
    const contentInput = document.getElementById("blogContent");
    const feed = document.getElementById("blogFeed");
    const clearBtn = document.getElementById("clearBlogDraft");
    const message = document.getElementById("blogFormMessage");

    if (!form || !titleInput || !categorySelect || !contentInput || !feed || !clearBtn || !message) {
        return;
    }

    const posts = loadBlogPosts();
    renderBlogPosts(posts, feed);
    restoreBlogDraft(titleInput, categorySelect, contentInput);

    const saveDraft = () => {
        const draft = {
            title: titleInput.value,
            category: categorySelect.value,
            content: contentInput.value
        };
        localStorage.setItem(BLOG_DRAFT_KEY, JSON.stringify(draft));
    };

    titleInput.addEventListener("input", saveDraft);
    categorySelect.addEventListener("change", saveDraft);
    contentInput.addEventListener("input", saveDraft);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = titleInput.value.trim();
        const category = categorySelect.value;
        const content = contentInput.value.trim();

        if (!title || !content) {
            setMessage(message, "标题和内容不能为空。", "error");
            return;
        }

        posts.unshift({
            id: String(Date.now()),
            title,
            category,
            content,
            date: new Date().toISOString()
        });

        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
        localStorage.removeItem(BLOG_DRAFT_KEY);
        form.reset();
        renderBlogPosts(posts, feed);
        setMessage(message, "发布成功，内容已保存在当前浏览器。", "success");
    });

    clearBtn.addEventListener("click", () => {
        form.reset();
        localStorage.removeItem(BLOG_DRAFT_KEY);
        setMessage(message, "输入已清空。", "success");
    });
}

function loadBlogPosts() {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) {
        return [...DEFAULT_BLOG_POSTS];
    }

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch (error) {
        console.warn("无法解析博客数据，已回退默认数据。", error);
    }
    return [...DEFAULT_BLOG_POSTS];
}

function restoreBlogDraft(titleInput, categorySelect, contentInput) {
    const raw = localStorage.getItem(BLOG_DRAFT_KEY);
    if (!raw) {
        return;
    }

    try {
        const draft = JSON.parse(raw);
        titleInput.value = draft.title || "";
        categorySelect.value = draft.category || "杂谈";
        contentInput.value = draft.content || "";
    } catch (error) {
        console.warn("无法恢复草稿。", error);
    }
}

function renderBlogPosts(posts, container) {
    if (!Array.isArray(posts) || posts.length === 0) {
        container.innerHTML = '<p class="form-message">还没有博客，快写第一篇吧。</p>';
        return;
    }

    container.innerHTML = posts.map((post) => {
        const title = escapeHtml(post.title || "未命名");
        const category = escapeHtml(post.category || "未分类");
        const content = escapeHtml(post.content || "");
        const dateText = formatDate(post.date);
        return `
            <article class="blog-item">
                <header>
                    <h3>${title}</h3>
                    <span class="blog-meta">${category} · ${dateText}</span>
                </header>
                <p>${content}</p>
            </article>
        `;
    }).join("");
}

function initInterestGate() {
    const gateBox = document.getElementById("interestGate");
    const form = document.getElementById("interestGateForm");
    const message = document.getElementById("gateMessage");
    const content = document.getElementById("interestContent");
    const lockButton = document.getElementById("lockInterestPage");

    if (!gateBox || !form || !message || !content || !lockButton) {
        return;
    }

    renderGateQuestions(form, INTEREST_GATE_CONFIG.questions);

    const shouldUnlock = localStorage.getItem(INTEREST_GATE_CONFIG.storageKey) === "true";
    if (shouldUnlock) {
        unlockInterestContent(gateBox, content);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const allCorrect = INTEREST_GATE_CONFIG.questions.every((item, index) => {
            const input = form.elements.namedItem(`q-${index}`);
            const value = input && typeof input.value === "string" ? input.value : "";
            return normalizeAnswer(value) === normalizeAnswer(item.answer);
        });

        if (allCorrect) {
            localStorage.setItem(INTEREST_GATE_CONFIG.storageKey, "true");
            setMessage(message, "验证成功，已解锁兴趣页内容。", "success");
            unlockInterestContent(gateBox, content);
            return;
        }

        setMessage(message, "答案未全部正确，请再试一次。", "error");
    });

    lockButton.addEventListener("click", () => {
        localStorage.removeItem(INTEREST_GATE_CONFIG.storageKey);
        gateBox.classList.remove("hidden");
        content.classList.add("hidden");
        form.reset();
        setMessage(message, "页面已重新上锁。", "success");
    });
}

function renderGateQuestions(form, questions) {
    form.innerHTML = "";
    questions.forEach((item, index) => {
        const label = document.createElement("label");
        label.className = "quiz-row";
        label.textContent = `问题 ${index + 1}：${item.question}`;

        const input = document.createElement("input");
        input.type = "text";
        input.name = `q-${index}`;
        input.autocomplete = "off";
        input.required = true;

        label.appendChild(input);
        form.appendChild(label);
    });

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "btn";
    submitButton.textContent = "验证答案";
    form.appendChild(submitButton);
}

function unlockInterestContent(gateBox, contentBox) {
    gateBox.classList.add("hidden");
    contentBox.classList.remove("hidden");
}

function normalizeAnswer(text) {
    return String(text).trim().toLowerCase().replace(/\s+/g, "");
}

function setMessage(target, text, state) {
    target.textContent = text;
    target.classList.remove("is-error", "is-success");

    if (state === "error") {
        target.classList.add("is-error");
    }
    if (state === "success") {
        target.classList.add("is-success");
    }
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "日期未知";
    }

    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}