/* =====================================================================
   HARSHEEN KAUR ARORA — PORTFOLIO  ·  main.js
   ===================================================================== */

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

/* =====================================================================
   1. CUSTOM CURSOR — a trailing point of "divine light"
   ===================================================================== */
(function initCursor() {
    if (coarsePointer) return; // never on touch devices

    const dot  = document.createElement("div");
    const ring = document.createElement("div");
    dot.className  = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.append(dot, ring);

    document.documentElement.classList.add("has-cursor");

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;
    let ready = false;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // dot is instant
        dot.style.left = mouseX + "px";
        dot.style.top  = mouseY + "px";
        if (!ready) {
            ready = true;
            document.documentElement.classList.add("cursor-ready");
        }
    });

    // ring follows with a soft lag (lerp)
    function animateRing() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        ring.style.left = ringX + "px";
        ring.style.top  = ringY + "px";
        requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    // grow over interactive things
    const interactive = "a, button, video, .insta_card, .project_item > a, .project_item > img";
    document.addEventListener("mouseover", (e) => {
        if (e.target.closest(interactive)) {
            ring.classList.add("is-active");
            dot.classList.add("is-active");
        }
    });
    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(interactive)) {
            ring.classList.remove("is-active");
            dot.classList.remove("is-active");
        }
    });

    document.addEventListener("mousedown", () => ring.classList.add("is-down"));
    document.addEventListener("mouseup",   () => ring.classList.remove("is-down"));

    // hide when leaving the window
    document.addEventListener("mouseleave", () => document.documentElement.classList.remove("cursor-ready"));
    document.addEventListener("mouseenter", () => document.documentElement.classList.add("cursor-ready"));
})();

/* =====================================================================
   2. SCROLL PROGRESS BAR
   ===================================================================== */
const progress = document.createElement("div");
progress.className = "scroll_progress";
document.body.appendChild(progress);

function updateProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    progress.style.width = pct + "%";
}

/* =====================================================================
   3. EASED SMOOTH SCROLLING for in-page anchor links
   ===================================================================== */
function smoothScrollTo(targetY, duration = 800) {
    if (reduceMotion) { window.scrollTo(0, targetY); return; }
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;
    const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function step(now) {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(t));
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

const NAV_OFFSET = 110; // clears the fixed navbar

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
   4. SCROLL-REVEAL ANIMATIONS
   ===================================================================== */
(function initReveal() {
    const targets = document.querySelectorAll(
        ".project_item, .exp_card, .suntory_image, .yl_image, .adan_image, " +
        ".suntory_text, .yl_text, .adan_text, #brands, #pitch, #contact, " +
        "#suntory, #yl, #adan, .home_image"
    );
    targets.forEach((el) => el.classList.add("reveal"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
        targets.forEach((el) => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add("is-visible");
            observer.unobserve(el);
            // once revealed, drop the helper classes so element-level
            // hover transforms (e.g. cards) work and will-change is freed
            const cleanup = () => el.classList.remove("reveal", "is-visible");
            el.addEventListener("transitionend", cleanup, { once: true });
            setTimeout(cleanup, 1100); // fallback
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    targets.forEach((el) => observer.observe(el));
})();

/* =====================================================================
   5. EMPTY IMAGE → GRACEFUL PLACEHOLDER (pitch decks, etc.)
   ===================================================================== */
(function fillEmptyImages() {
    document.querySelectorAll(".project_item > img").forEach((img) => {
        const src = img.getAttribute("src");
        const handleEmpty = () => {
            const item = img.closest(".project_item");
            if (item.querySelector(".placeholder_tile")) return;
            item.classList.add("is-empty");
            const tile = document.createElement("div");
            tile.className = "placeholder_tile";
            tile.innerHTML = '<i class="fa-regular fa-image"></i><span>Coming soon</span>';
            img.replaceWith(tile);
        };
        if (!src || src.trim() === "") handleEmpty();
        else img.addEventListener("error", handleEmpty);
    });
})();

/* =====================================================================
   6. NAVIGATION STATE — section detection, sidebar highlight + reveal
   ===================================================================== */
const sections = ["home", "brands", "pitch", "contact"];
const nextBtn = document.getElementById("nextBtn");
const sidebar = document.querySelector(".section_sidebar");

function getCurrentSection() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    let current = sections[0];
    for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            if (top <= scrollPos) current = id;
        }
    }
    return current;
}

function updateSidebarHighlight(current) {
    document.querySelectorAll(".section_sidebar a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
}

function updateNextButton() {
    const current = getCurrentSection();
    const index = sections.indexOf(current);
    if (nextBtn) {
        nextBtn.setAttribute(
            "href",
            "#" + (index < sections.length - 1 ? sections[index + 1] : sections[0])
        );
    }
    updateSidebarHighlight(current);
}

let scrollTimeout;
function handleSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("show");
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => sidebar.classList.remove("show"), 900);
}

/* =====================================================================
   7. CAROUSELS  (big "netflix" track + mini carousels with cross-nav)
   ===================================================================== */
function moveBigCarousel(track, direction) {
    const card = track.querySelector(".insta_card");
    if (!card) return;
    const amount = card.offsetWidth + 20;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
}

document.querySelectorAll(".mini_carousel").forEach((carousel) => {
    const track  = carousel.querySelector(".mini_track");
    const images = carousel.querySelectorAll("img");
    const next   = carousel.querySelector(".mini_next");
    const prev   = carousel.querySelector(".mini_prev");
    let index = 0;

    const wrapper  = carousel.closest(".carousel_wrapper");
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
    const next  = wrapper.querySelector(".next");
    const prev  = wrapper.querySelector(".prev");
    if (next) next.addEventListener("click", () => moveBigCarousel(track, 1));
    if (prev) prev.addEventListener("click", () => moveBigCarousel(track, -1));
});

/* =====================================================================
   8. SCROLL + LOAD EVENTS
   ===================================================================== */
window.addEventListener("scroll", () => {
    updateProgress();
    updateNextButton();
    handleSidebar();
}, { passive: true });

window.addEventListener("load", () => {
    updateProgress();
    updateNextButton();
});
