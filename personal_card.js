const HOME_QUOTES = [
    "把问题说清楚，答案自然会出现。",
    "先搭出最小可行版本，再追求优雅。",
    "真正的效率，是让未来的自己也能看懂现在的代码。",
    "研究不只关心正确答案，也关心正确问题。"
];

const BLOG_STORAGE_KEY = "personal-card-blog-posts-v1";
const BLOG_DRAFT_KEY = "personal-card-blog-draft-v1";
const SUDOKU_SIZE = 9;

const SUDOKU_DIFFICULTY_CONFIG = {
    easy: { label: "简单", removeCount: 38 },
    medium: { label: "中等", removeCount: 48 },
    hard: { label: "困难", removeCount: 56 }
};

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
    const board = document.getElementById("sudokuBoard");
    const status = document.getElementById("sudokuStatus");
    const newGameButton = document.getElementById("newSudokuGame");
    const difficultyButtons = Array.from(document.querySelectorAll(".difficulty-btn"));

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

    if (!board || !status || !newGameButton || difficultyButtons.length === 0) {
        return;
    }

    const state = {
        difficulty: "easy",
        puzzle: createEmptyGrid(),
        solution: createEmptyGrid()
    };

    const startGame = () => {
        const config = SUDOKU_DIFFICULTY_CONFIG[state.difficulty];
        state.solution = generateSudokuSolution();
        state.puzzle = createSudokuPuzzle(state.solution, config.removeCount);
        renderSudokuBoard(board, state.puzzle, state.solution, status, config.label);
        updateDifficultyButtons(difficultyButtons, state.difficulty);
    };

    difficultyButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const nextDifficulty = button.dataset.difficulty;
            if (!nextDifficulty || !(nextDifficulty in SUDOKU_DIFFICULTY_CONFIG)) {
                return;
            }
            state.difficulty = nextDifficulty;
            startGame();
        });
    });

    newGameButton.addEventListener("click", () => {
        startGame();
    });

    startGame();
}

function updateDifficultyButtons(buttons, activeDifficulty) {
    buttons.forEach((button) => {
        const selected = button.dataset.difficulty === activeDifficulty;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
}

function createEmptyGrid() {
    return Array.from({ length: SUDOKU_SIZE }, () => Array(SUDOKU_SIZE).fill(0));
}

function generateSudokuSolution() {
    const board = createEmptyGrid();
    fillSudokuBoard(board, 0, 0);
    return board;
}

function fillSudokuBoard(board, row, col) {
    if (row === SUDOKU_SIZE) {
        return true;
    }

    const nextRow = col === SUDOKU_SIZE - 1 ? row + 1 : row;
    const nextCol = col === SUDOKU_SIZE - 1 ? 0 : col + 1;

    const candidates = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const value of candidates) {
        if (!isSudokuMoveValid(board, row, col, value)) {
            continue;
        }
        board[row][col] = value;
        if (fillSudokuBoard(board, nextRow, nextCol)) {
            return true;
        }
        board[row][col] = 0;
    }

    return false;
}

function isSudokuMoveValid(board, row, col, value) {
    for (let index = 0; index < SUDOKU_SIZE; index += 1) {
        if (board[row][index] === value || board[index][col] === value) {
            return false;
        }
    }

    const rowStart = Math.floor(row / 3) * 3;
    const colStart = Math.floor(col / 3) * 3;
    for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
        for (let colOffset = 0; colOffset < 3; colOffset += 1) {
            if (board[rowStart + rowOffset][colStart + colOffset] === value) {
                return false;
            }
        }
    }

    return true;
}

function createSudokuPuzzle(solution, removeCount) {
    const puzzle = solution.map((row) => [...row]);
    const cells = [];

    for (let row = 0; row < SUDOKU_SIZE; row += 1) {
        for (let col = 0; col < SUDOKU_SIZE; col += 1) {
            cells.push([row, col]);
        }
    }

    const shuffled = shuffleArray(cells);
    const removeLimit = Math.min(removeCount, shuffled.length);
    for (let index = 0; index < removeLimit; index += 1) {
        const [row, col] = shuffled[index];
        puzzle[row][col] = 0;
    }

    return puzzle;
}

function shuffleArray(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const next = Math.floor(Math.random() * (index + 1));
        [result[index], result[next]] = [result[next], result[index]];
    }
    return result;
}

function renderSudokuBoard(boardElement, puzzle, solution, statusElement, difficultyLabel) {
    boardElement.innerHTML = "";

    for (let row = 0; row < SUDOKU_SIZE; row += 1) {
        for (let col = 0; col < SUDOKU_SIZE; col += 1) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.className = "sudoku-cell";
            input.inputMode = "numeric";
            input.setAttribute("aria-label", `第 ${row + 1} 行第 ${col + 1} 列`);

            if (col === 0) {
                input.classList.add("box-left");
            }
            if (row === 0) {
                input.classList.add("box-top");
            }
            if ((col + 1) % 3 === 0) {
                input.classList.add("box-right");
            }
            if ((row + 1) % 3 === 0) {
                input.classList.add("box-bottom");
            }

            const presetValue = puzzle[row][col];
            if (presetValue !== 0) {
                input.value = String(presetValue);
                input.disabled = true;
                input.classList.add("preset");
            } else {
                input.addEventListener("input", () => {
                    const cleaned = input.value.replace(/[^1-9]/g, "").slice(-1);
                    input.value = cleaned;

                    if (!cleaned) {
                        input.classList.remove("invalid");
                        updateSudokuStatus(boardElement, statusElement, difficultyLabel);
                        return;
                    }

                    const isCorrect = Number(cleaned) === solution[row][col];
                    input.classList.toggle("invalid", !isCorrect);
                    updateSudokuStatus(boardElement, statusElement, difficultyLabel);
                });
            }

            boardElement.appendChild(input);
        }
    }

    updateSudokuStatus(boardElement, statusElement, difficultyLabel);
}

function updateSudokuStatus(boardElement, statusElement, difficultyLabel) {
    const allCells = Array.from(boardElement.querySelectorAll(".sudoku-cell"));
    const filledCount = allCells.filter((cell) => cell.value !== "").length;
    const invalidCount = allCells.filter((cell) => cell.classList.contains("invalid")).length;

    statusElement.classList.remove("is-success", "is-error");
    if (invalidCount > 0) {
        statusElement.textContent = `当前有 ${invalidCount} 个错误数字，请继续修正。`;
        statusElement.classList.add("is-error");
        return;
    }

    if (filledCount === SUDOKU_SIZE * SUDOKU_SIZE) {
        statusElement.textContent = `你已完成 ${difficultyLabel} 难度数独，恭喜通关。`;
        statusElement.classList.add("is-success");
        return;
    }

    statusElement.textContent = `${difficultyLabel}难度进行中：已填写 ${filledCount}/81。`;
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