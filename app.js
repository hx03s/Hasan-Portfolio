/* ===== Edit these to personalise the site ===== */
const CONFIG = {
  // YOUR PHOTO: put your photo in the `images` folder as `me.jpg` (or change the path here).
  // A portrait (about 4:5) looks best. Until the file exists, the "H" monogram shows instead.
  photo: "images/me.jpg",
  email: "habdulla2903@gmail.com",
  github: "https://github.com/hx03s",
  linkedin: ""          // e.g. "https://www.linkedin.com/in/your-handle"
};

/* Your stack, shown as badges on the planet. Edit names or colours here. */
const STACK = [
  ["Go", "#4fc3dc"], ["Rust", "#e8835a"], ["TypeScript", "#5b9cf0"], ["JavaScript", "#f2d45a"],
  ["React Native", "#61dafb"], ["Next.js", "#ece6dc"], ["Node.js", "#7cc46a"], ["Express", "#b8c4c8"],
  ["Supabase", "#4fd18b"], ["SQLite", "#6aa8d8"], ["WebSockets", "#f2a65a"], ["Docker", "#3d9be9"],
  ["GraphQL", "#e45fb0"], ["JWT", "#c38cf2"], ["Chart.js", "#f27a8a"], ["Linux", "#f2c94c"],
  ["UDP", "#4fc3b5"], ["Git", "#f0784f"]
];

(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const site = document.querySelector(".site");
  const page = site ? site.dataset.page : "";

  /* ---- nav: current page + mobile menu ---- */
  document.querySelectorAll(".nav-links a").forEach(a => {
    if (a.dataset.page === page) a.setAttribute("aria-current", "page");
  });
  const menuBtn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "Close" : "Menu";
    });
  }

  /* ---- page transition curtain ---- */
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-nav]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (a.getAttribute("aria-current") === "page") { e.preventDefault(); return; }
    if (reduce) return;
    e.preventDefault();
    document.documentElement.classList.add("leaving");
    setTimeout(() => { window.location.href = a.getAttribute("href"); }, 480);
  });
  window.addEventListener("pageshow", () => document.documentElement.classList.remove("leaving"));

  /* ---- 3D tilt ---- */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !reduce) {
    document.querySelectorAll("[data-tilt]").forEach(el => {
      const max = parseFloat(el.dataset.tilt) || 8;
      if (!el.querySelector(".glare")) {
        const g = document.createElement("span"); g.className = "glare"; el.appendChild(g);
      }
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add("tilting");
        el.style.setProperty("--ry", ((x - 0.5) * max * 2).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - y) * max * 2).toFixed(2) + "deg");
        el.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("tilting");
        el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg");
      });
    });

    /* magnetic buttons */
    document.querySelectorAll(".btn").forEach(b => {
      b.addEventListener("pointermove", e => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
  }

  /* ---- ambient "tide": drifting particles that part around the cursor ---- */
  const tide = document.getElementById("tide");
  if (tide && !reduce) {
    const ctx = tide.getContext("2d");
    let w, h, dpr, pts = [];
    const mouse = { x: -999, y: -999 };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = tide.clientWidth; h = tide.clientHeight;
      tide.width = w * dpr; tide.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 16000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4, v: Math.random() * 0.25 + 0.08,
        p: Math.random() * Math.PI * 2, a: Math.random() * 0.5 + 0.15
      }));
    };
    resize(); window.addEventListener("resize", resize);
    window.addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    const tick = t => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.y -= p.v; p.x += Math.sin(t / 2400 + p.p) * 0.15;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120) { p.x += (dx / d) * 1.2; p.y += (dy / d) * 1.2; }
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 228, 236, ${p.a * (0.6 + 0.4 * Math.sin(t / 900 + p.p))})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---- the tech planet (Three.js) ---- */
  const globeCanvas = document.getElementById("globe");
  if (globeCanvas && window.THREE) {
    try { buildPlanet(globeCanvas.parentElement, globeCanvas, reduce); document.documentElement.classList.add("has-gl"); }
    catch (err) { /* CSS fallback shape stays visible */ }
  }

  /* ---- photo slot: shows CONFIG.photo, or the monogram if the file isn't there yet ---- */
  const frame = document.querySelector(".photo-frame");
  if (frame && CONFIG.photo) {
    const img = frame.querySelector("img");
    const empty = frame.querySelector(".photo-empty");
    img.onload = () => { img.hidden = false; empty.hidden = true; };
    img.src = CONFIG.photo;
  }

  /* ---- counters ---- */
  document.querySelectorAll("[data-count]").forEach(el => {
    const end = parseInt(el.dataset.count, 10), suffix = el.dataset.suffix || "";
    if (reduce || !end) return;
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e).toLocaleString() + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  /* ---- project filters ---- */
  const filters = document.querySelectorAll(".filter");
  if (filters.length) {
    const cats = document.querySelectorAll(".cat");
    const apply = key => {
      filters.forEach(f => f.setAttribute("aria-pressed", String(f.dataset.filter === key)));
      cats.forEach(c => { c.hidden = !(key === "all" || c.id === key); });
    };
    filters.forEach(f => f.addEventListener("click", () => {
      apply(f.dataset.filter);
      const top = document.querySelector(".projects-top");
      if (top) top.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }));
    const hash = (location.hash || "").slice(1);
    if (["mobile", "websites", "games", "tools", "coursework"].includes(hash)) apply(hash);
  }

  /* ---- contact: links, copy, compose ---- */
  document.querySelectorAll("[data-email]").forEach(el => { el.textContent = CONFIG.email; });
  document.querySelectorAll("[data-link]").forEach(row => {
    const url = CONFIG[row.dataset.link];
    if (url) { row.href = url; row.querySelector("b").textContent = url.replace(/^https?:\/\/(www\.)?/, ""); }
    else row.hidden = true;
  });
  document.querySelectorAll(".copy-btn").forEach(b => b.addEventListener("click", e => {
    e.preventDefault();
    copyText(CONFIG.email, b.closest(".channel").querySelector("b"), "Email copied");
  }));
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const text =
`To: ${CONFIG.email}
Subject: ${d.get("topic")} — from ${d.get("name")}

${d.get("message")}

${d.get("name")}
${d.get("from")}`;
      const out = document.getElementById("composed");
      out.value = text; out.parentElement.hidden = false;
      copyText(text, out, "Message copied. Paste it into your email app.");
    });
  }

  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });

  /* helpers */
  function copyText(text, fallbackEl, msg) {
    const done = () => toast(msg);
    const fallback = () => {
      if (!fallbackEl) return;
      if (fallbackEl.select) { fallbackEl.focus(); fallbackEl.select(); }
      else { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      toast("Selected. Press copy on your keyboard.");
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
  }
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }
})();

function fibSphere(n, r) {
  const pts = [], g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), t = g * i;
    pts.push([Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r]);
  }
  return pts;
}

function buildPlanet(stage, canvas, reduce) {
  const THREE = window.THREE;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6.6);

  const globe = new THREE.Group();
  scene.add(globe);

  // planet body: dark sphere with an iridescent rim
  const uniforms = { uTime: { value: 0 } };
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vP = position;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){
        float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.4);
        vec3 irid = 0.55 + 0.45*cos(6.2831*(vec3(0.0,0.33,0.67) + f*1.1 + vP.y*0.25 + uTime*0.05));
        vec3 base = vec3(0.035, 0.11, 0.14);
        vec3 col = mix(base, irid, f*0.85);
        col += vec3(0.31,0.76,0.71) * pow(max(dot(normalize(vN), normalize(vec3(-0.5,0.7,0.6))),0.0), 6.0) * 0.12;
        gl_FragColor = vec4(col, 1.0);
      }`
  }));
  globe.add(body);

  // dotted surface
  const dots = fibSphere(1400, 1.32);
  const dg = new THREE.BufferGeometry();
  dg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(dots.flat()), 3));
  globe.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x8fd9cf, size: 0.022, transparent: true, opacity: 0.75 })));

  // latitude lines
  const lineMat = new THREE.LineBasicMaterial({ color: 0x4fc3b5, transparent: true, opacity: 0.18 });
  [-0.8, -0.4, 0, 0.4, 0.8].forEach(y => {
    const r = Math.sqrt(1.34 * 1.34 - y * y), pts = [];
    for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)); }
    globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  });

  // two tilted orbits with satellites
  const sats = [];
  [[1.95, 0.5, 0.2, 0xece6dc, 0.5], [2.2, -0.35, -0.4, 0xf2a65a, -0.35]].forEach(([r, tx, tz, col, speed]) => {
    const g = new THREE.Group(); g.rotation.x = tx; g.rotation.z = tz;
    const pts = [];
    for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xbfe6ea, transparent: true, opacity: 0.16 })));
    const sat = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), new THREE.MeshBasicMaterial({ color: col }));
    g.add(sat); scene.add(g); sats.push({ sat, r, speed });
  });

  // badges pinned to the surface
  const layer = stage.querySelector(".badge-layer");
  const anchors = fibSphere(STACK.length, 1.62).map(p => new THREE.Vector3(p[0], p[1], p[2]));
  const badges = STACK.map(([name, c]) => {
    const el = document.createElement("span");
    el.className = "tech-badge"; el.style.setProperty("--c", c);
    el.innerHTML = "<i></i>" + name;
    layer.appendChild(el); return el;
  });

  // drag to spin, with inertia
  let rotY = 0.6, rotX = 0.28, velY = 0, velX = 0, dragging = false, lx = 0, ly = 0;
  const auto = reduce ? 0 : 0.0035;
  stage.addEventListener("pointerdown", e => {
    dragging = true; lx = e.clientX; ly = e.clientY; velY = 0; velX = 0;
    stage.classList.add("dragging");
    if (e.pointerType === "mouse") stage.setPointerCapture(e.pointerId);
  });
  window.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    velY = dx * 0.006; velX = e.pointerType === "mouse" ? dy * 0.004 : 0;
    rotY += velY; rotX = Math.max(-0.9, Math.min(0.9, rotX + velX));
  });
  const end = () => { dragging = false; stage.classList.remove("dragging"); };
  window.addEventListener("pointerup", end); window.addEventListener("pointercancel", end);

  let w = 1, h = 1;
  const size = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  size(); window.addEventListener("resize", size);

  const v = new THREE.Vector3(), clock = new THREE.Clock();
  const loop = () => {
    const t = clock.getElapsedTime();
    if (!dragging) {
      velY += (auto - velY) * 0.03; velX *= 0.92;
      rotY += velY; rotX = Math.max(-0.9, Math.min(0.9, rotX + velX));
      rotX += (0.28 - rotX) * 0.01;
    }
    globe.rotation.set(rotX, rotY, 0);
    uniforms.uTime.value = reduce ? 0 : t;
    sats.forEach(s => {
      const a = (reduce ? 0 : t) * s.speed;
      s.sat.position.set(Math.cos(a) * s.r, 0, Math.sin(a) * s.r);
    });
    renderer.render(scene, camera);

    globe.updateMatrixWorld();
    anchors.forEach((p, i) => {
      v.copy(p).applyMatrix4(globe.matrixWorld);
      const depth = (v.z + 1.62) / 3.24;             // 0 = back, 1 = front
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      const el = badges[i];
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) scale(${(0.72 + depth * 0.38).toFixed(3)})`;
      el.style.opacity = (0.12 + depth * 0.88).toFixed(3);
      el.style.zIndex = depth > 0.5 ? 2 : 0;
    });
    requestAnimationFrame(loop);
  };
  loop();
}
