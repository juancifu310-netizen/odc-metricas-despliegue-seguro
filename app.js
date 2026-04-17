/* ODC - Navegación + Actividades + Retro
   Nota: los audios son opcionales. Si no existen los mp3, el sitio igual funciona.
*/

const screens = Array.from(document.querySelectorAll(".screen"));
const sideItems = Array.from(document.querySelectorAll(".side-nav__item"));
const progressBar = document.getElementById("progressBar");

const menuDialog = document.getElementById("menuDialog");
const helpDialog = document.getElementById("helpDialog");
const infoDialog = document.getElementById("infoDialog");
const infoTitle = document.getElementById("infoTitle");
const infoBody = document.getElementById("infoBody");

const btnMenu = document.getElementById("btnMenu");
const btnHelp = document.getElementById("btnHelp");
const btnAudioToggle = document.getElementById("btnAudioToggle");

let globalAudioEnabled = false;

const INFO = {
  rea: {
    title: "Cómo escribir un REA",
    body: `
      <p><strong>Plantilla:</strong> “Al finalizar, el estudiante [verbo] [contenido] [contexto] [condición], evidenciado por [criterio].”</p>
      <ul>
        <li>Usa verbos observables: analiza, aplica, diseña, evalúa.</li>
        <li>Incluye condición (herramienta, guía, caso).</li>
        <li>Define criterio verificable (p. ej., 80% acierto).</li>
      </ul>
    `
  },
  metricaIndicador: {
    title: "Métrica vs indicador",
    body: `
      <p><strong>Métrica:</strong> valor medido (p. ej., latencia p95 = 220 ms).</p>
      <p><strong>Indicador:</strong> interpretación para actuar (p. ej., “incumple SLO, bloquear despliegue”).</p>
    `
  },
  gate: {
    title: "Qué es un gate",
    body: `
      <p><strong>Gate:</strong> regla que habilita o bloquea una acción (por ejemplo, despliegue).</p>
      <p>Un gate debe tener: métrica, umbral, condición y acción (permitir/bloquear/alertar).</p>
    `
  },
  mi: {
    title: "Maintainability Index",
    body: `
      <p>Indicador compuesto usado para estimar mantenibilidad. Se apoya en complejidad, volumen y otros factores.</p>
      <p>Útil para identificar módulos que acumulan deuda técnica.</p>
    `
  },
  smells: {
    title: "Code smells",
    body: `
      <p>Patrones de código que elevan riesgo de mantenimiento (duplicación, métodos largos, alta complejidad).</p>
      <p>No siempre son bugs, pero predicen costos de cambio y defectos futuros.</p>
    `
  },
  slo: {
    title: "SLI vs SLO",
    body: `
      <p><strong>SLI</strong>: indicador medible del servicio (p. ej., disponibilidad, latencia p95).</p>
      <p><strong>SLO</strong>: objetivo/compromiso (“latencia p95 &lt; 250 ms el 95% del tiempo”).</p>
      <p>Decisiones de despliegue deben respetar SLOs: si estás fuera, frenas o mitigás.</p>
    `
  },
  umbral: {
    title: "Cómo escribir un umbral",
    body: `
      <ul>
        <li><strong>Métrica</strong> + <strong>operador</strong> + <strong>valor</strong> + <strong>acción</strong>.</li>
        <li>Ej: “Bloquear si vuln críticas &gt; 0”.</li>
        <li>Ej: “Alertar si latencia p95 &gt; 15% vs baseline”.</li>
      </ul>
    `
  }
};

// ===== Navegación =====
function setActiveScreen(id) {
  screens.forEach(s => s.classList.toggle("is-active", s.id === id));

  sideItems.forEach(b => b.classList.toggle("is-active", b.dataset.go === id));

  const idx = screens.findIndex(s => s.id === id);
  const pct = Math.round(((idx + 1) / screens.length) * 100);
  progressBar.style.width = `${pct}%`;

  if (globalAudioEnabled) {
    // si hay audio en la pantalla, auto-play no (por navegador), pero queda listo
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) {
    setActiveScreen(go.dataset.go);
  }

  const open = e.target.closest("[data-open]");
  if (open) {
    const id = open.dataset.open;
    const dlg = document.getElementById(id);
    if (dlg) dlg.showModal();
  }

  const close = e.target.closest("[data-close]");
  if (close) {
    const id = close.dataset.close;
    const dlg = document.getElementById(id);
    if (dlg) dlg.close();
  }

  const info = e.target.closest("[data-info]");
  if (info) {
    const key = info.dataset.info;
    const def = INFO[key];
    if (!def) return;
    infoTitle.textContent = def.title;
    infoBody.innerHTML = def.body;
    infoDialog.showModal();
  }

  const audioBtn = e.target.closest("[data-audio]");
  if (audioBtn) {
    const audioId = audioBtn.dataset.audio;
    const el = document.getElementById(audioId);
    if (!el) return;
    if (el.paused) el.play().catch(()=>{});
    else el.pause();
  }
});

btnMenu.addEventListener("click", () => menuDialog.showModal());
btnHelp.addEventListener("click", () => helpDialog.showModal());

btnAudioToggle.addEventListener("click", () => {
  globalAudioEnabled = !globalAudioEnabled;
  btnAudioToggle.setAttribute("aria-pressed", String(globalAudioEnabled));
  btnAudioToggle.textContent = globalAudioEnabled ? "Audio: ON" : "Audio: OFF";
});

// ===== M01 V/F =====
const m01Answers = { q1: "F", q2: "V", q3: "F" };
const m01Feedback = {
  q1: "Falso: depende del SLO, el impacto y el contexto del cambio. Puede bastar con monitoreo o rollback si empeora.",
  q2: "Verdadero: sin umbral no hay criterio de acción, solo números.",
  q3: "Falso: cobertura no garantiza calidad de pruebas ni ausencia de defectos."
};

function checkM01() {
  const form = document.querySelector('[data-quiz="m01_vf"]');
  ["q1","q2","q3"].forEach(q => {
    const chosen = form.querySelector(`input[name="${q}"]:checked`)?.value;
    const fb = form.querySelector(`[data-fb="${q}"]`);
    if (!chosen) {
      fb.className = "feedback bad";
      fb.textContent = "Selecciona una opción.";
      return;
    }
    const ok = chosen === m01Answers[q];
    fb.className = "feedback " + (ok ? "ok" : "bad");
    fb.textContent = (ok ? "Correcto. " : "Incorrecto. ") + m01Feedback[q];
  });
}

// ===== M03 Multiple choice (3 correct) =====
function checkM03() {
  const form = document.querySelector('[data-quiz="m03_mc"]');
  const chosen = Array.from(form.querySelectorAll('input[name="a"]:checked')).map(x=>x.value).sort();
  const fb = form.querySelector('[data-fb="m03"]');
  const correct = ["A","B","D"];
  if (chosen.length !== 3) {
    fb.className = "feedback bad";
    fb.textContent = "Debes seleccionar exactamente 3 opciones.";
    return;
  }
  const ok = chosen.join(",") === correct.join(",");
  fb.className = "feedback " + (ok ? "ok" : "bad");
  fb.textContent = ok
    ? "Correcto: complejidad, cobertura del módulo y smells son señales accionables del riesgo del cambio."
    : "Incorrecto: prioriza complejidad (A), cobertura del módulo (B) y code smells (D). Likes y LOC no guían decisiones.";
}

// ===== M04 Order (simple expected order) =====
function checkM04() {
  const form = document.querySelector('[data-quiz="m04_order"]');
  const o1 = form.querySelector('select[name="o1"]').value;
  const o2 = form.querySelector('select[name="o2"]').value;
  const o3 = form.querySelector('select[name="o3"]').value;
  const o4 = form.querySelector('select[name="o4"]').value;
  const fb = form.querySelector('[data-fb="m04"]');

  const chosen = [o1,o2,o3,o4];
  if (chosen.some(x=>!x)) {
    fb.className = "feedback bad";
    fb.textContent = "Completa los 4 puestos.";
    return;
  }
  const expected = ["Disponibilidad","Latencia p95","Packet loss","Throughput"];
  const ok = chosen.join("|") === expected.join("|");
  fb.className = "feedback " + (ok ? "ok" : "bad");
  fb.textContent = ok
    ? "Correcto: disponibilidad y latencia suelen dominar en servicios transaccionales; luego pérdida de paquetes; throughput depende del caso."
    : "Tu orden puede variar, pero una referencia típica es: Disponibilidad → Latencia p95 → Packet loss → Throughput. Justifica con SLO y experiencia de usuario.";
}

// ===== M05 Map stages =====
function checkM05() {
  const form = document.querySelector('[data-quiz="m05_map"]');
  const vals = {
    sast: form.querySelector('select[name="sast"]').value,
    deps: form.querySelector('select[name="deps"]').value,
    dast: form.querySelector('select[name="dast"]').value,
    cont: form.querySelector('select[name="cont"]').value
  };
  const fb = form.querySelector('[data-fb="m05"]');

  if (Object.values(vals).some(v=>!v)) {
    fb.className = "feedback bad";
    fb.textContent = "Completa todas las selecciones.";
    return;
  }
  const expected = { sast:"build", deps:"build", dast:"test", cont:"deploy" };
  const ok = Object.keys(expected).every(k => vals[k] === expected[k]);

  fb.className = "feedback " + (ok ? "ok" : "bad");
  fb.textContent = ok
    ? "Correcto: SAST y dependencias en build; DAST en test; contenedores cerca de deploy (y también en build del contenedor si aplica)."
    : "Revisa: SAST+dependencias → Build; DAST → Test; contenedores → antes de Deploy (y/o en build del contenedor).";
}

// ===== M06 Threshold validator =====
function looksLikeThreshold(s) {
  const hasOp = /[<>]=?|=/.test(s);
  const hasAction = /(bloquear|alertar|revisar|detener|permitir)/i.test(s);
  return s.trim().length >= 10 && hasOp && hasAction;
}

function checkThresholds() {
  const sw = document.getElementById("th_sw").value;
  const infra = document.getElementById("th_infra").value;
  const sec = document.getElementById("th_sec").value;
  const test = document.getElementById("th_test").value;

  const fb = document.getElementById("thFeedback");
  const all = [sw, infra, sec, test];

  const okCount = all.filter(looksLikeThreshold).length;
  if (okCount === 4) {
    fb.className = "feedback ok";
    fb.textContent = "Correcto: los 4 umbrales son medibles y accionables. Buen trabajo.";
  } else {
    fb.className = "feedback bad";
    fb.textContent = `Te faltan umbrales accionables. Reglas: incluye operador (> < =) y una acción (bloquear/alertar/revisar). Válidos: ${okCount}/4.`;
  }
}

// ===== M07 Cases =====
function checkCases() {
  const A = document.getElementById("caseA").value;
  const B = document.getElementById("caseB").value;
  const C = document.getElementById("caseC").value;

  const fbA = document.getElementById("fbA");
  const fbB = document.getElementById("fbB");
  const fbC = document.getElementById("fbC");

  // Expected
  const expA = "liberar";
  const expB = "bloquear";
  const expC = "bloquear";

  function setFb(el, ok, msg) {
    el.className = "feedback " + (ok ? "ok" : "bad");
    el.textContent = msg;
  }

  if (!A || !B || !C) {
    setFb(fbA,false,"Selecciona decisión.");
    setFb(fbB,false,"Selecciona decisión.");
    setFb(fbC,false,"Selecciona decisión.");
    return;
  }

  setFb(fbA, A===expA, (A===expA)
    ? "Correcto: sin vulnerabilidades críticas y variación menor de latencia, puedes liberar con monitoreo."
    : "Incorrecto: con esos datos, normalmente se libera y se monitorea (si cumple SLO).");

  setFb(fbB, B===expB, (B===expB)
    ? "Correcto: vulnerabilidades críticas bloquean (gate de seguridad)."
    : "Incorrecto: con 2 críticas, lo consistente es bloquear y corregir/mitigar.");

  setFb(fbC, C===expC, (C===expC)
    ? "Correcto: pruebas fallidas bloquean (gate de calidad)."
    : "Incorrecto: si fallan pruebas, bloqueas. Latencia no compensa ese riesgo.");
}

// ===== M08 checklist =====
function checkM08() {
  const form = document.querySelector('[data-quiz="m08_check"]');
  const chosen = Array.from(form.querySelectorAll('input[name="c"]:checked')).map(x=>x.value);
  const fb = form.querySelector('[data-fb="m08"]');

  const good = ["accionables","trazables","umbrales","rev","automat","slo"];
  const bad = ["vanity","ruido"];

  const goodCount = chosen.filter(x=>good.includes(x)).length;
  const hasBad = chosen.some(x=>bad.includes(x));

  if (chosen.length < 6) {
    fb.className = "feedback bad";
    fb.textContent = "Marca al menos 6 criterios para evaluar bien.";
    return;
  }

  if (goodCount >= 5 && !hasBad) {
    fb.className = "feedback ok";
    fb.textContent = "Correcto: priorizaste criterios accionables, trazables y alineados a objetivos. Evitaste vanity/ruido.";
  } else {
    fb.className = "feedback bad";
    fb.textContent = "Revisa: un buen sistema es accionable, trazable, con umbrales, revisable, automatizado y alineado a SLO. Likes y alertas sin criterio NO ayudan.";
  }
}

// ===== Final evaluation =====
function checkFinal() {
  const form = document.querySelector('[data-quiz="final"]');
  let score = 0;
  const total = 8;

  function setFb(name, ok, msg) {
    const fb = form.querySelector(`[data-fb="${name}"]`);
    fb.className = "feedback " + (ok ? "ok" : "bad");
    fb.textContent = msg;
  }

  // 1
  const f1 = form.querySelector('input[name="f1"]:checked')?.value;
  if (f1 === "infra") { score++; setFb("f1",true,"Correcto: latencia p95 es operativa (red/infra/servicio)."); }
  else setFb("f1",false,"Incorrecto: latencia p95 pertenece a red/infra/servicio.");

  // 2
  const f2 = form.querySelector('input[name="f2"]:checked')?.value;
  if (f2 === "sw") { score++; setFb("f2",true,"Correcto: code smells son señales de calidad de software."); }
  else setFb("f2",false,"Incorrecto: code smells corresponden a software.");

  // 3
  const f3 = form.querySelector('input[name="f3"]:checked')?.value;
  if (f3 === "sec") { score++; setFb("f3",true,"Correcto: vulnerabilidades abiertas son seguridad."); }
  else setFb("f3",false,"Incorrecto: vulnerabilidades críticas abiertas son seguridad.");

  // 4
  const f4 = form.querySelector('input[name="f4"]:checked')?.value;
  if (f4 === "tests") { score++; setFb("f4",true,"Correcto: pruebas fallidas bloquean el despliegue."); }
  else setFb("f4",false,"Incorrecto: el gate típico de bloqueo es fallar pruebas.");

  // 5
  const f5 = form.querySelector('input[name="f5"]:checked')?.value;
  if (f5 === "b") { score++; setFb("f5",true,"Correcto: tiene métrica, umbral y acción (alerta)."); }
  else setFb("f5",false,"Incorrecto: el umbral debe ser medible y accionable.");

  // 6
  const f6 = form.querySelector('input[name="f6"]:checked')?.value;
  if (f6 === "likes") { score++; setFb("f6",true,"Correcto: likes/estrellas es vanity."); }
  else setFb("f6",false,"Incorrecto: vanity típica es likes/estrellas.");

  // 7
  const f7 = form.querySelector('input[name="f7"]:checked')?.value;
  if (f7 === "bloquear") { score++; setFb("f7",true,"Correcto: 1 vulnerabilidad crítica debe bloquear (gate de seguridad)."); }
  else setFb("f7",false,"Incorrecto: vulnerabilidad crítica bloquea.");

  // 8 (3 selections)
  const f8 = Array.from(form.querySelectorAll('input[name="f8"]:checked')).map(x=>x.value).sort();
  const correct8 = ["cov","lat","vuln"];
  const ok8 = f8.length === 3 && f8.join(",") === correct8.join(",");
  if (ok8) { score++; setFb("f8",true,"Correcto: cobertura + latencia p95 + vuln críticas son mínimas para release seguro."); }
  else setFb("f8",false,"Incorrecto: debes elegir cobertura, latencia p95 y vulnerabilidades críticas (3).");

  const pct = Math.round((score / total) * 100);
  const box = document.getElementById("finalScore");
  box.className = "score";
  box.textContent = `Resultado: ${score}/${total} (${pct}%). ${pct >= 80 ? "Aprobado." : "No aprobado: repasa módulos y reintenta."}`;
}

// ===== Bind check buttons =====
document.addEventListener("click", (e) => {
  const check = e.target.closest("[data-check]");
  if (!check) return;
  const quiz = check.dataset.check;
  if (quiz === "m01_vf") checkM01();
  if (quiz === "m03_mc") checkM03();
  if (quiz === "m04_order") checkM04();
  if (quiz === "m05_map") checkM05();
  if (quiz === "m08_check") checkM08();
  if (quiz === "final") checkFinal();
});

document.getElementById("checkThresholds")?.addEventListener("click", checkThresholds);
document.getElementById("checkCases")?.addEventListener("click", checkCases);

// ===== Drag & Drop M02 =====
let dragged = null;

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("dragstart", () => { dragged = chip; });
});

document.querySelectorAll(".dropzone").forEach(zone => {
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    zone.querySelector(".dropzone__body")?.appendChild(dragged);
    dragged = null;
  });
});

const correctDnd = {
  software: ["defect density","cyclomatic complexity","test coverage","code smells"],
  infra: ["latency p95","throughput","jitter","packet loss"],
  seguridad: ["vuln critical count","mean time to patch","risk score","security gate pass rate"]
};

document.getElementById("checkDnd")?.addEventListener("click", () => {
  const fb = document.getElementById("dndFeedback");
  let ok = true;

  ["software","infra","seguridad"].forEach(z => {
    const zone = document.querySelector(`.dropzone[data-zone="${z}"] .dropzone__body`);
    const items = Array.from(zone.querySelectorAll(".chip")).map(x=>x.textContent.trim());
    const expected = correctDnd[z].slice().sort();
    const got = items.slice().sort();
    if (expected.join("|") !== got.join("|")) ok = false;
  });

  fb.className = "feedback " + (ok ? "ok" : "bad");
  fb.textContent = ok
    ? "Correcto: clasificaste las 12 métricas en sus capas."
    : "Aún hay elementos mal ubicados. Pista: defect/complexity/coverage/smells → software; latency/throughput/jitter/packet loss → infra; vuln/patch/risk/gate → seguridad.";
});

// ===== Init =====
setActiveScreen("p01");
