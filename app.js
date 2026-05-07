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
const btnZoom = document.getElementById("btnZoom");

let globalAudioEnabled = false;

/* ===== AUDIO CONTROL ===== */
function stopAllAudio() {
  document.querySelectorAll("audio").forEach(a => {
    a.pause();
    try { a.currentTime = 0; } catch(e) {}
  });
  document.querySelectorAll(".speaker__img--big").forEach(img => img.classList.remove("is-speaking"));
  document.querySelectorAll(".avatar").forEach(av => av.classList.remove("is-speaking"));
}

function setAudioButtonsEnabled(enabled) {
  document.querySelectorAll('[data-audio]').forEach(btn => {
    btn.disabled = !enabled;
    btn.classList.toggle("is-disabled", !enabled);
  });
}

/* ===== ZOOM CONTROL ===== */
const ZOOMS = [1, 1.1, 1.25, 1.4];
let zoomIndex = 0;

function applyZoom(z) {
  document.body.style.zoom = String(z);
  localStorage.setItem("odc_zoom", String(z));
  if (btnZoom) btnZoom.textContent = `Zoom: ${Math.round(z * 100)}%`;
}

function loadZoom() {
  const saved = parseFloat(localStorage.getItem("odc_zoom") || "1");
  const idx = ZOOMS.findIndex(v => Math.abs(v - saved) < 0.001);
  zoomIndex = idx >= 0 ? idx : 0;
  applyZoom(ZOOMS[zoomIndex]);
}

/* ===== INFO ===== */
const INFO = {
  rea: {
    title: "Cómo escribir un REA",
    body: `
      <p><strong>Plantilla:</strong> “Al finalizar, el estudiante [verbo] [contenido] [contexto] [condición], evidenciado por [criterio].”</p>
      <ul>
        <li>Usa verbos observables: analiza, aplica, diseña, evalúa.</li>
        <li>Incluye condición y criterio verificable.</li>
      </ul>`
  },
  metricaIndicador: {
    title: "Métrica vs indicador",
    body: `<p><strong>Métrica:</strong> valor medido (p. ej., latencia p95 = 220 ms).</p>
           <p><strong>Indicador:</strong> interpretación para actuar (p. ej., “incumple SLO, bloquear”).</p>`
  },
  gate: { title: "Qué es un gate", body: `<p><strong>Gate:</strong> regla que habilita o bloquea una acción (por ejemplo, despliegue).</p>` },
  mi: { title: "Maintainability Index", body: `<p>Indicador compuesto para estimar mantenibilidad.</p>` },
  smells: { title: "Code smells", body: `<p>Patrones de código que elevan riesgo de mantenimiento.</p>` },
  slo: { title: "SLI vs SLO", body: `<p><strong>SLI</strong>: indicador medible (latencia, disponibilidad).</p><p><strong>SLO</strong>: objetivo/compromiso.</p>` },
  umbral: { title: "Cómo escribir un umbral", body: `<ul><li>Métrica + operador + valor + acción.</li></ul>` }
};

/* ===== NAV ===== */
function setActiveScreen(id) {
  stopAllAudio(); // audio se corta al cambiar pantalla

  screens.forEach(s => s.classList.toggle("is-active", s.id === id));
  sideItems.forEach(b => b.classList.toggle("is-active", b.dataset.go === id));

  const idx = screens.findIndex(s => s.id === id);
  const pct = Math.round(((idx + 1) / screens.length) * 100);
  if (progressBar) progressBar.style.width = `${pct}%`;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ===== EVENTS ===== */
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) setActiveScreen(go.dataset.go);

  const open = e.target.closest("[data-open]");
  if (open) document.getElementById(open.dataset.open)?.showModal();

  const close = e.target.closest("[data-close]");
  if (close) document.getElementById(close.dataset.close)?.close();

  const info = e.target.closest("[data-info]");
  if (info) {
    const def = INFO[info.dataset.info];
    if (!def) return;
    infoTitle.textContent = def.title;
    infoBody.innerHTML = def.body;
    infoDialog.showModal();
  }

  // AUDIO + ANIMACIÓN (bloqueado si OFF)
  const audioBtn = e.target.closest("[data-audio]");
  if (audioBtn) {
    if (!globalAudioEnabled) {
      stopAllAudio();
      return;
    }

    const audioId = audioBtn.dataset.audio;
    const el = document.getElementById(audioId);
    if (!el) return;

    document.querySelectorAll("audio").forEach(a => { if (a !== el) a.pause(); });

    // Limpia animación previa
    document.querySelectorAll(".speaker__img--big").forEach(img => img.classList.remove("is-speaking"));
    document.querySelectorAll(".avatar").forEach(av => av.classList.remove("is-speaking"));

    const avatarCard = audioBtn.closest(".avatar");
    const speakerImg = avatarCard?.querySelector(".speaker__img--big");

    if (el.paused) {
      el.play().catch(()=>{});
      if (speakerImg) speakerImg.classList.add("is-speaking");
      if (avatarCard) avatarCard.classList.add("is-speaking");

      el.onended = () => {
        if (speakerImg) speakerImg.classList.remove("is-speaking");
        if (avatarCard) avatarCard.classList.remove("is-speaking");
      };
    } else {
      el.pause();
      if (speakerImg) speakerImg.classList.remove("is-speaking");
      if (avatarCard) avatarCard.classList.remove("is-speaking");
    }
  }

  // CHECKS
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

btnMenu?.addEventListener("click", () => menuDialog.showModal());
btnHelp?.addEventListener("click", () => helpDialog.showModal());

btnZoom?.addEventListener("click", () => {
  zoomIndex = (zoomIndex + 1) % ZOOMS.length;
  applyZoom(ZOOMS[zoomIndex]);
});

btnAudioToggle?.addEventListener("click", () => {
  globalAudioEnabled = !globalAudioEnabled;

  btnAudioToggle.setAttribute("aria-pressed", String(globalAudioEnabled));
  btnAudioToggle.textContent = globalAudioEnabled ? "Audio: ON" : "Audio: OFF";

  if (!globalAudioEnabled) stopAllAudio();
  setAudioButtonsEnabled(globalAudioEnabled);

  localStorage.setItem("odc_audio_enabled", globalAudioEnabled ? "1" : "0");
});

/* ===== QUIZZES ===== */
const m01Answers = { q1: "F", q2: "V", q3: "F" };
const m01Feedback = {
  q1: "Falso: depende del SLO y del contexto. Puede bastar monitoreo.",
  q2: "Verdadero: sin umbral no hay criterio de acción.",
  q3: "Falso: cobertura no garantiza ausencia de fallos."
};

function checkM01() {
  const form = document.querySelector('[data-quiz="m01_vf"]');
  ["q1","q2","q3"].forEach(q => {
    const chosen = form.querySelector(`input[name="${q}"]:checked`)?.value;
    const fb = form.querySelector(`[data-fb="${q}"]`);
    if (!chosen) { fb.className="feedback bad"; fb.textContent="Selecciona una opción."; return; }
    const ok = chosen === m01Answers[q];
    fb.className = "feedback " + (ok ? "ok" : "bad");
    fb.textContent = (ok ? "Correcto. " : "Incorrecto. ") + m01Feedback[q];
  });
}

function checkM03() {
  const form = document.querySelector('[data-quiz="m03_mc"]');
  const chosen = Array.from(form.querySelectorAll('input[name="a"]:checked')).map(x=>x.value).sort();
  const fb = form.querySelector('[data-fb="m03"]');
  const correct = ["A","B","D"];
  if (chosen.length !== 3) { fb.className="feedback bad"; fb.textContent="Selecciona exactamente 3 opciones."; return; }
  const ok = chosen.join(",") === correct.join(",");
  fb.className="feedback " + (ok ? "ok":"bad");
  fb.textContent = ok ? "Correcto." : "Incorrecto: las correctas son A, B y D.";
}

function checkM04() {
  const form = document.querySelector('[data-quiz="m04_order"]');
  const o1=form.querySelector('select[name="o1"]').value;
  const o2=form.querySelector('select[name="o2"]').value;
  const o3=form.querySelector('select[name="o3"]').value;
  const o4=form.querySelector('select[name="o4"]').value;
  const fb=form.querySelector('[data-fb="m04"]');
  if ([o1,o2,o3,o4].some(x=>!x)) { fb.className="feedback bad"; fb.textContent="Completa los 4 puestos."; return; }
  const expected=["Disponibilidad","Latencia p95","Packet loss","Throughput"];
  const ok=[o1,o2,o3,o4].join("|")===expected.join("|");
  fb.className="feedback " + (ok ? "ok":"bad");
  fb.textContent = ok ? "Correcto." : "Referencia típica: Disponibilidad → Latencia p95 → Packet loss → Throughput.";
}

function checkM05() {
  const form = document.querySelector('[data-quiz="m05_map"]');
  const vals = {
    sast: form.querySelector('select[name="sast"]').value,
    deps: form.querySelector('select[name="deps"]').value,
    dast: form.querySelector('select[name="dast"]').value,
    cont: form.querySelector('select[name="cont"]').value
  };
  const fb = form.querySelector('[data-fb="m05"]');
  if (Object.values(vals).some(v=>!v)) { fb.className="feedback bad"; fb.textContent="Completa todas las selecciones."; return; }
  const expected = { sast:"build", deps:"build", dast:"test", cont:"deploy" };
  const ok = Object.keys(expected).every(k => vals[k]===expected[k]);
  fb.className="feedback " + (ok ? "ok":"bad");
  fb.textContent = ok ? "Correcto." : "Revisa: SAST+dependencias → Build; DAST → Test; contenedores → Deploy.";
}

function checkM08() {
  const form = document.querySelector('[data-quiz="m08_check"]');
  const chosen = Array.from(form.querySelectorAll('input[name="c"]:checked')).map(x=>x.value);
  const fb = form.querySelector('[data-fb="m08"]');
  const good = ["accionables","trazables","umbrales","rev","automat","slo"];
  const bad  = ["vanity","ruido"];
  if (chosen.length < 6) { fb.className="feedback bad"; fb.textContent="Marca al menos 6 criterios."; return; }
  const goodCount = chosen.filter(x=>good.includes(x)).length;
  const hasBad = chosen.some(x=>bad.includes(x));
  fb.className="feedback " + ((goodCount>=5 && !hasBad) ? "ok":"bad");
  fb.textContent = (goodCount>=5 && !hasBad) ? "Correcto." : "Evita vanity/ruido y prioriza accionables, trazables, umbrales, automatización y SLO.";
}

function checkFinal() {
  const form = document.querySelector('[data-quiz="final"]');
  let score=0, total=8;

  function setFb(name, ok, msg){
    const fb=form.querySelector(`[data-fb="${name}"]`);
    fb.className="feedback " + (ok ? "ok":"bad");
    fb.textContent=msg;
  }

  const f1=form.querySelector('input[name="f1"]:checked')?.value;
  if (f1==="infra"){score++; setFb("f1",true,"Correcto.");} else setFb("f1",false,"Incorrecto: es Red/Infra.");

  const f2=form.querySelector('input[name="f2"]:checked')?.value;
  if (f2==="sw"){score++; setFb("f2",true,"Correcto.");} else setFb("f2",false,"Incorrecto: es Software.");

  const f3=form.querySelector('input[name="f3"]:checked')?.value;
  if (f3==="sec"){score++; setFb("f3",true,"Correcto.");} else setFb("f3",false,"Incorrecto: es Seguridad.");

  const f4=form.querySelector('input[name="f4"]:checked')?.value;
  if (f4==="tests"){score++; setFb("f4",true,"Correcto.");} else setFb("f4",false,"Incorrecto: fallar pruebas bloquea.");

  const f5=form.querySelector('input[name="f5"]:checked')?.value;
  if (f5==="b"){score++; setFb("f5",true,"Correcto.");} else setFb("f5",false,"Incorrecto: umbral medible y accionable.");

  const f6=form.querySelector('input[name="f6"]:checked')?.value;
  if (f6==="likes"){score++; setFb("f6",true,"Correcto.");} else setFb("f6",false,"Incorrecto: likes es vanity.");

  const f7=form.querySelector('input[name="f7"]:checked')?.value;
  if (f7==="bloquear"){score++; setFb("f7",true,"Correcto.");} else setFb("f7",false,"Incorrecto: vuln crítica bloquea.");

  const f8=Array.from(form.querySelectorAll('input[name="f8"]:checked')).map(x=>x.value).sort();
  const ok8=f8.length===3 && f8.join(",")==="cov,lat,vuln";
  if (ok8){score++; setFb("f8",true,"Correcto.");} else setFb("f8",false,"Incorrecto: cobertura + latencia + vuln críticas.");

  const pct=Math.round((score/total)*100);
  const box=document.getElementById("finalScore");
  box.className="score";
  box.textContent=`Resultado: ${score}/${total} (${pct}%). ${pct>=80 ? "Aprobado." : "No aprobado: repasa y reintenta."}`;
}

/* ===== Drag & Drop M02 ===== */
let dragged=null;
document.querySelectorAll(".chip").forEach(chip => chip.addEventListener("dragstart", () => { dragged=chip; }));

document.querySelectorAll(".dropzone").forEach(zone => {
  zone.addEventListener("dragover", (e)=>{e.preventDefault(); zone.classList.add("dragover");});
  zone.addEventListener("dragleave", ()=>zone.classList.remove("dragover"));
  zone.addEventListener("drop", (e)=>{
    e.preventDefault();
    zone.classList.remove("dragover");
    zone.querySelector(".dropzone__body")?.appendChild(dragged);
    dragged=null;
  });
});

const correctDnd = {
  software: ["defect density","cyclomatic complexity","test coverage","code smells"],
  infra: ["latency p95","throughput","jitter","packet loss"],
  seguridad: ["vuln critical count","mean time to patch","risk score","security gate pass rate"]
};

document.getElementById("checkDnd")?.addEventListener("click", ()=>{
  const fb=document.getElementById("dndFeedback");
  let ok=true;
  ["software","infra","seguridad"].forEach(z=>{
    const zone=document.querySelector(`.dropzone[data-zone="${z}"] .dropzone__body`);
    const items=Array.from(zone.querySelectorAll(".chip")).map(x=>x.textContent.trim()).sort();
    const exp=correctDnd[z].slice().sort();
    if (items.join("|")!==exp.join("|")) ok=false;
  });
  fb.className="feedback " + (ok ? "ok":"bad");
  fb.textContent = ok ? "Correcto." : "Aún hay elementos mal ubicados. Revisa categorías.";
});

document.getElementById("checkThresholds")?.addEventListener("click", ()=>{
  const sw=document.getElementById("th_sw").value;
  const infra=document.getElementById("th_infra").value;
  const sec=document.getElementById("th_sec").value;
  const test=document.getElementById("th_test").value;
  const fb=document.getElementById("thFeedback");
  const all=[sw,infra,sec,test];
  const has = (s)=> /[<>]=?|=/.test(s) && /(bloquear|alertar|revisar|detener|permitir)/i.test(s) && s.trim().length>=10;
  const okCount=all.filter(has).length;
  fb.className="feedback " + (okCount===4 ? "ok":"bad");
  fb.textContent = okCount===4 ? "Correcto." : `Te faltan umbrales accionables. Válidos: ${okCount}/4.`;
});

document.getElementById("checkCases")?.addEventListener("click", ()=>{
  const A=document.getElementById("caseA").value;
  const B=document.getElementById("caseB").value;
  const C=document.getElementById("caseC").value;

  const fbA=document.getElementById("fbA");
  const fbB=document.getElementById("fbB");
  const fbC=document.getElementById("fbC");

  const set=(el,ok,msg)=>{el.className="feedback "+(ok?"ok":"bad"); el.textContent=msg;};

  if(!A||!B||!C){ set(fbA,false,"Selecciona decisión."); set(fbB,false,"Selecciona decisión."); set(fbC,false,"Selecciona decisión."); return; }

  set(fbA, A==="liberar", A==="liberar" ? "Correcto." : "Incorrecto: normalmente se libera con monitoreo.");
  set(fbB, B==="bloquear", B==="bloquear" ? "Correcto." : "Incorrecto: vulnerabilidades críticas bloquean.");
  set(fbC, C==="bloquear", C==="bloquear" ? "Correcto." : "Incorrecto: fallar pruebas bloquea.");
});

/* ===== INIT ===== */
loadZoom();

const savedAudio = localStorage.getItem("odc_audio_enabled");
globalAudioEnabled = savedAudio === "1";
if (btnAudioToggle) {
  btnAudioToggle.setAttribute("aria-pressed", String(globalAudioEnabled));
  btnAudioToggle.textContent = globalAudioEnabled ? "Audio: ON" : "Audio: OFF";
}
setAudioButtonsEnabled(globalAudioEnabled);
if (!globalAudioEnabled) stopAllAudio();

setActiveScreen("p01");
