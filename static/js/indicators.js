/* Misalignment Indicator Browser — renders the 18-indicator taxonomy. */
const DATA = window.INDICATOR_DATA || null;
const GROUPS = DATA ? DATA.groups : [];
const INDICATORS = DATA ? DATA.indicators : [];

const ALL_GROUP = { id: "all", label: "All", emoji: "✶", color: "#1e40af", blurb: "All 18 misalignment indicators across six behavioral groups." };

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    }[c]));
}

function groupOf(id) {
    return GROUPS.find(g => g.id === id) || { id, label: id, emoji: "◇", color: "#2563eb", blurb: "" };
}

function plural(n, singular) {
    return `${n} ${n === 1 ? singular : singular + "s"}`;
}

function indicatorBlob(ind) {
    return [ind.name, ind.group, groupOf(ind.group).label, ind.definition, ...(ind.examples || [])]
        .join(" ").toLowerCase();
}

let activeGroup = "all";
let activeQuery = "";

function renderMissingData() {
    const grid = document.getElementById("indicatorGrid");
    if (grid) grid.innerHTML = `<div class="task-empty">Indicator data is missing. Load <code>static/js/indicator_data.js</code> before <code>static/js/indicators.js</code>.</div>`;
}

function renderHeroStats() {
    const strip = document.getElementById("statsStrip");
    if (!strip || !DATA) return;
    const s = DATA.stats || {};
    const cards = [
        [s.indicator_count, "Indicators"],
        [s.group_count, "Behavioral Groups"],
        [s.behavior_count, "Target Behaviors"],
        [s.target_model, "Target Model"],
    ];
    strip.innerHTML = cards.map(([num, label]) => `
        <div class="stat-card"><div class="num">${escapeHtml(num)}</div><div class="label">${escapeHtml(label)}</div></div>
    `).join("");
}

function counts() {
    const m = { all: INDICATORS.length };
    GROUPS.forEach(g => { m[g.id] = INDICATORS.filter(i => i.group === g.id).length; });
    return m;
}

function renderChips() {
    const chipsEl = document.getElementById("groupChips");
    if (!chipsEl) return;
    const c = counts();
    const chipGroups = [ALL_GROUP, ...GROUPS];
    chipsEl.innerHTML = chipGroups.map(g => `
        <button class="domain-chip ${activeGroup === g.id ? "active" : ""}" data-g="${g.id}"
            style="${activeGroup === g.id ? `background:linear-gradient(135deg,${g.color},${g.color}cc);` : ""}">
            <span class="chip-emoji">${g.emoji}</span> ${escapeHtml(g.label)}
            <span class="chip-count">${c[g.id] || 0}</span>
        </button>
    `).join("");
    chipsEl.querySelectorAll(".domain-chip").forEach(btn => {
        btn.addEventListener("click", () => {
            activeGroup = btn.dataset.g;
            renderChips();
            renderPanel();
            renderIndicators();
            const params = new URLSearchParams(window.location.search);
            if (activeGroup === "all") params.delete("group"); else params.set("group", activeGroup);
            const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
            window.history.replaceState(null, "", next);
        });
    });
}

function renderPanel() {
    const panel = document.getElementById("domainPanel");
    if (!panel) return;
    const g = activeGroup === "all" ? ALL_GROUP : groupOf(activeGroup);
    const n = activeGroup === "all" ? INDICATORS.length : INDICATORS.filter(i => i.group === activeGroup).length;
    panel.innerHTML = `
        <div class="domain-panel-icon" style="background:linear-gradient(135deg,${g.color},${g.color}cc);">${g.emoji}</div>
        <div style="flex:1;min-width:0;">
            <div class="domain-panel-label" style="color:${g.color}">${escapeHtml(g.label)}</div>
            <p class="domain-panel-blurb">${escapeHtml(g.blurb)}</p>
            <div class="domain-panel-stats">
                <span><strong>${n}</strong> indicators</span>
            </div>
        </div>
    `;
}

function filteredIndicators() {
    const q = activeQuery.trim().toLowerCase();
    return INDICATORS.filter(i => {
        if (activeGroup !== "all" && i.group !== activeGroup) return false;
        return !q || indicatorBlob(i).includes(q);
    });
}

function renderIndicators() {
    const grid = document.getElementById("indicatorGrid");
    const countEl = document.getElementById("indicatorCount");
    if (!grid) return;
    const list = filteredIndicators();
    if (countEl) countEl.textContent = `${list.length} indicator${list.length === 1 ? "" : "s"} shown`;
    if (list.length === 0) {
        grid.innerHTML = `<div class="task-empty">No indicators match your filter.</div>`;
        return;
    }
    grid.innerHTML = list.map(i => {
        const g = groupOf(i.group);
        return `
        <div class="task-card" data-id="${escapeHtml(i.id)}" style="border-left-color:${g.color}">
            <div class="task-id">${g.emoji} ${escapeHtml(g.label)}</div>
            <div class="task-title">${escapeHtml(i.name)}</div>
            <div class="task-meta">
                <span class="meta-pill" style="background:${g.color}1a;color:${g.color}">indicator</span>
                <span class="meta-pill role">${plural((i.examples || []).length, "example")}</span>
            </div>
            <div class="task-snippet">${escapeHtml(i.definition)}</div>
        </div>`;
    }).join("");
    grid.querySelectorAll(".task-card").forEach(card => {
        card.addEventListener("click", () => openModal(card.dataset.id));
    });
}

function openModal(id) {
    const ind = INDICATORS.find(x => x.id === id);
    if (!ind) return;
    const g = groupOf(ind.group);
    const modal = document.getElementById("indicatorModal");
    const body = document.getElementById("modalBody");
    document.getElementById("modalId").textContent = `${g.emoji} ${g.label}`;
    document.getElementById("modalTitle").textContent = ind.name;
    document.getElementById("modalMeta").innerHTML = `
        <span class="meta-pill" style="background:${g.color}1a;color:${g.color}">${g.emoji} ${escapeHtml(g.label)}</span>
        <span class="meta-pill role">${plural((ind.examples || []).length, "example")}</span>
    `;
    body.innerHTML = `
        <div class="field">
            <h4>Definition</h4>
            <p>${escapeHtml(ind.definition)}</p>
        </div>
        <div class="field">
            <h4>Example reasoning</h4>
            <div class="example-list">
                ${(ind.examples || []).map(ex => `<blockquote class="example-quote">${escapeHtml(ex)}</blockquote>`).join("")}
            </div>
        </div>
    `;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    const modal = document.getElementById("indicatorModal");
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
    if (!DATA) { renderMissingData(); return; }
    renderHeroStats();

    const params = new URLSearchParams(window.location.search);
    const requested = params.get("group");
    if (requested && (requested === "all" || GROUPS.some(g => g.id === requested))) {
        activeGroup = requested;
    }

    renderChips();
    renderPanel();
    renderIndicators();

    const search = document.getElementById("indicatorSearch");
    if (search) {
        search.addEventListener("input", e => { activeQuery = e.target.value; renderIndicators(); });
    }

    const closeBtn = document.getElementById("modalClose");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    const modal = document.getElementById("indicatorModal");
    if (modal) modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal && modal.classList.contains("open")) closeModal();
    });
});
