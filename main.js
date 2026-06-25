/* =====================================================================
   HARSHEEN KAUR ARORA — PORTFOLIO · main.js
   ===================================================================== */

document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================================================
   1. HERO REVEAL ON LOAD
   ===================================================================== */
(function heroReveal() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    // next frame so the initial hidden state is painted first, then transitions
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("in")));
})();

/* =====================================================================
   2. SCROLL PROGRESS BAR
   ===================================================================== */
const progress = document.createElement("div");
progress.className = "scroll_progress";
document.body.appendChild(progress);

function updateProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
}

/* =====================================================================
   3. EASED SMOOTH SCROLL for in-page anchors
   ===================================================================== */
function smoothScrollTo(targetY, duration = 820) {
    if (reduceMotion) { window.scrollTo(0, targetY); return; }
    const startY = window.scrollY;
    const dist = targetY - startY;
    let start = null;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function step(now) {
        if (start === null) start = now;
        const t = Math.min((now - start) / duration, 1);
        window.scrollTo(0, startY + dist * ease(t));
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

const NAV_OFFSET = 90;
document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        smoothScrollTo(Math.max(y, 0));
    });
});

/* =====================================================================
   4. STAGGERED SCROLL-REVEAL
   ===================================================================== */
(function initReveal() {
    const items = [];
    document.querySelectorAll("#brands, #pitch, #contact").forEach((el) => items.push(el));
    document.querySelectorAll(".exp_card, .media_split").forEach((el) => items.push(el));
    document.querySelectorAll(".projects_grid").forEach((grid) => {
        grid.querySelectorAll(".project_item").forEach((it, i) => {
            it.style.transitionDelay = (i * 80) + "ms";
            items.push(it);
        });
    });

    items.forEach((el) => el.classList.add("reveal"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add("is-visible");
            obs.unobserve(el);
            const cleanup = () => el.classList.remove("reveal", "is-visible");
            el.addEventListener("transitionend", cleanup, { once: true });
            setTimeout(cleanup, 1400);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach((el) => obs.observe(el));
})();

/* =====================================================================
   5. EMPTY IMAGE → PLACEHOLDER (pitch decks)
   ===================================================================== */
(function fillEmptyImages() {
    document.querySelectorAll(".project_item > img").forEach((img) => {
        const src = img.getAttribute("src");
        const handle = () => {
            const item = img.closest(".project_item");
            if (item.querySelector(".placeholder_tile")) return;
            const tile = document.createElement("div");
            tile.className = "placeholder_tile";
            tile.innerHTML = '<i class="fa-regular fa-image"></i><span>Coming soon</span>';
            img.replaceWith(tile);
        };
        if (!src || src.trim() === "") handle();
        else img.addEventListener("error", handle);
    });
})();

/* =====================================================================
   6. NAV STATE — section detection, sidebar, next button
   ===================================================================== */
const sections = ["home", "brands", "pitch", "contact"];
const nextBtn = document.getElementById("nextBtn");
const sidebar = document.querySelector(".section_sidebar");

function getCurrentSection() {
    const pos = window.scrollY + window.innerHeight / 2;
    let current = sections[0];
    for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= pos) current = id;
    }
    return current;
}
function updateNav() {
    const current = getCurrentSection();
    const i = sections.indexOf(current);
    if (nextBtn) nextBtn.setAttribute("href", "#" + (i < sections.length - 1 ? sections[i + 1] : sections[0]));
    document.querySelectorAll(".section_sidebar a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
}
let sidebarTimer;
function pingSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("show");
    clearTimeout(sidebarTimer);
    sidebarTimer = setTimeout(() => sidebar.classList.remove("show"), 900);
}

/* =====================================================================
   7. CAROUSELS (same logic & structure as before)
   ===================================================================== */
function moveBigCarousel(track, dir) {
    const card = track.querySelector(".insta_card");
    if (!card) return;
    track.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: "smooth" });
}

document.querySelectorAll(".mini_carousel").forEach((carousel) => {
    const track = carousel.querySelector(".mini_track");
    const images = carousel.querySelectorAll("img");
    const next = carousel.querySelector(".mini_next");
    const prev = carousel.querySelector(".mini_prev");
    let index = 0;
    const wrapper = carousel.closest(".carousel_wrapper");
    const bigTrack = wrapper ? wrapper.querySelector(".carousel_track") : null;
    const update = () => { track.style.transform = `translateX(-${index * 100}%)`; };

    next.addEventListener("click", () => {
        if (index < images.length - 1) { index++; update(); }
        else if (bigTrack) moveBigCarousel(bigTrack, 1);
    });
    prev.addEventListener("click", () => {
        if (index > 0) { index--; update(); }
        else if (bigTrack) moveBigCarousel(bigTrack, -1);
    });
});

document.querySelectorAll(".carousel_wrapper").forEach((wrapper) => {
    const track = wrapper.querySelector(".carousel_track");
    const next = wrapper.querySelector(".next");
    const prev = wrapper.querySelector(".prev");
    if (next) next.addEventListener("click", () => moveBigCarousel(track, 1));
    if (prev) prev.addEventListener("click", () => moveBigCarousel(track, -1));
});

/* =====================================================================
   8. EVENTS
   ===================================================================== */
window.addEventListener("scroll", () => {
    updateProgress();
    updateNav();
    pingSidebar();
}, { passive: true });

window.addEventListener("load", () => { updateProgress(); updateNav(); });
updateProgress();
updateNav();
