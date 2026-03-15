// Global nutrition state
let caloriesCurrent = 0;
let caloriesGoalTotal = 2000;
let carbsCurrent = 0;
let carbsGoalTotal = 250;
let proteinCurrent = 0;
let proteinGoalTotal = 160;
let fatCurrent = 0;
let fatGoalTotal = 70;
let waterGoal = 8; // cups

// Register ScrollTrigger and boot the experience
document.addEventListener("DOMContentLoaded", () => {
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    initBackgroundColorStory();
    initParallaxFoodOrbit();
    initFloatingHeroImage();
    initHeroScrollStory();
    initWaterTracker();

    const attachmentBar = initAttachmentBar();
    initFoodLogger(attachmentBar);

    initGoals();
    renderNutritionDashboard();
  }
});

function initBackgroundColorStory() {
  const sections = gsap.utils.toArray(".section");

  const colors = [
    "#ffde38", // hero – bright yellow
    "#ff5f6d", // AI magic – warm red
    "#7f5dff", // dashboard – cool purple
    "#0fd976", // outro – fresh green
  ];

  sections.forEach((section, index) => {
    const color = colors[index] || colors[colors.length - 1];

    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onEnter: () => setBodyColor(color),
      onEnterBack: () => setBodyColor(color),
    });
  });
}

function initFloatingHeroImage() {
  const heroImage = document.querySelector(".hero-food-image");
  if (!heroImage) return;

  gsap.to(heroImage, {
    y: -20,
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}

function setBodyColor(color) {
  gsap.to("body", {
    backgroundColor: color,
    duration: 0.8,
    ease: "power2.out",
  });
}

// Nutrition dashboard rendering
function renderNutritionDashboard() {
  const caloriesValueEl = document.querySelector("#caloriesValue");
  const caloriesGoalEl = document.querySelector("#caloriesGoal");
  const caloriesPctEl = document.querySelector("#caloriesPct");
  const progressFill = document.querySelector(".progress-fill");
  const carbsValueEl = document.querySelector("#carbsValue");
  const carbsFill = document.querySelector(".mini-fill--carbs");
  const proteinValueEl = document.querySelector("#proteinValue");
  const proteinFill = document.querySelector(".mini-fill--protein");
  const fatValueEl = document.querySelector("#fatValue");
  const fatFill = document.querySelector(".mini-fill--fat");

  if (!caloriesValueEl || !caloriesGoalEl || !caloriesPctEl || !progressFill) {
    return;
  }

  const caloriesPct = caloriesGoalTotal ? Math.min(1, caloriesCurrent / caloriesGoalTotal) : 0;
  const carbsPct = carbsGoalTotal ? Math.min(1, carbsCurrent / carbsGoalTotal) : 0;
  const proteinPct = proteinGoalTotal ? Math.min(1, proteinCurrent / proteinGoalTotal) : 0;
  const fatPct = fatGoalTotal ? Math.min(1, fatCurrent / fatGoalTotal) : 0;

  caloriesValueEl.textContent = String(Math.round(caloriesCurrent));
  caloriesGoalEl.textContent = String(caloriesGoalTotal);
  caloriesPctEl.textContent = String(Math.round(caloriesPct * 100));

  if (carbsValueEl) carbsValueEl.textContent = String(Math.round(carbsCurrent));
  if (proteinValueEl) proteinValueEl.textContent = String(Math.round(proteinCurrent));
  if (fatValueEl) fatValueEl.textContent = String(Math.round(fatCurrent));

  gsap.to(progressFill, {
    width: `${caloriesPct * 100}%`,
    duration: 0.7,
    ease: "power2.out",
  });

  if (carbsFill) {
    gsap.to(carbsFill, {
      width: `${carbsPct * 100}%`,
      duration: 0.7,
      ease: "power2.out",
    });
  }
  if (proteinFill) {
    gsap.to(proteinFill, {
      width: `${proteinPct * 100}%`,
      duration: 0.7,
      ease: "power2.out",
    });
  }
  if (fatFill) {
    gsap.to(fatFill, {
      width: `${fatPct * 100}%`,
      duration: 0.7,
      ease: "power2.out",
    });
  }
}

function updateMealsCount() {
  const mealsList = document.querySelector("#mealsList");
  const mealsCountEl = document.querySelector("#mealsCount");
  if (!mealsList || !mealsCountEl) return;

  const current = mealsList.children.length;
  mealsCountEl.textContent =
    current === 1 ? "1 meal logged" : `${current} meals logged`;
}

function addMealCard({ label, calories, carbs, protein, fat }) {
  const mealsList = document.querySelector("#mealsList");
  if (!mealsList) return;

  const chip = document.createElement("div");
  chip.className = "meal-chip";
  chip.dataset.calories = String(calories);
  chip.dataset.carbs = String(carbs);
  chip.dataset.protein = String(protein);
  chip.dataset.fat = String(fat);

  chip.innerHTML = `
    <button class="meal-chip-close" type="button" aria-label="Remove meal">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
    <span class="meal-chip-label">${label}</span>
    <span class="meal-chip-meta">≈${calories} kcal · ${carbs}C / ${protein}P / ${fat}F</span>
  `;

  const closeButton = chip.querySelector(".meal-chip-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      const cals = Number.parseFloat(chip.dataset.calories || "0");
      const cbs = Number.parseFloat(chip.dataset.carbs || "0");
      const prs = Number.parseFloat(chip.dataset.protein || "0");
      const fts = Number.parseFloat(chip.dataset.fat || "0");

      caloriesCurrent = Math.max(0, caloriesCurrent - cals);
      carbsCurrent = Math.max(0, carbsCurrent - cbs);
      proteinCurrent = Math.max(0, proteinCurrent - prs);
      fatCurrent = Math.max(0, fatCurrent - fts);

      chip.remove();
      renderNutritionDashboard();
      updateMealsCount();
    });
  }

  mealsList.appendChild(chip);
  gsap.fromTo(
    chip,
    { opacity: 0, y: 10, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
  );

  caloriesCurrent += calories;
  carbsCurrent += carbs;
  proteinCurrent += protein;
  fatCurrent += fat;
  renderNutritionDashboard();
  updateMealsCount();
}

function updateGoalDisplay() {
  const caloriesGoalEl = document.querySelector("#caloriesGoal");
  const carbsGoalEl = document.querySelector("#carbsGoal");
  const proteinGoalEl = document.querySelector("#proteinGoal");
  const fatGoalEl = document.querySelector("#fatGoal");

  if (caloriesGoalEl) caloriesGoalEl.textContent = String(caloriesGoalTotal);
  if (carbsGoalEl) carbsGoalEl.textContent = String(carbsGoalTotal);
  if (proteinGoalEl) proteinGoalEl.textContent = String(proteinGoalTotal);
  if (fatGoalEl) fatGoalEl.textContent = String(fatGoalTotal);
}

function initGoals() {
  const goalCarbs = document.querySelector("#goalCarbs");
  const goalProtein = document.querySelector("#goalProtein");
  const goalFat = document.querySelector("#goalFat");
  const goalCalories = document.querySelector("#goalCalories");
  const goalWater = document.querySelector("#goalWater");
  const saveBtn = document.querySelector("#saveGoals");

  if (!goalCarbs || !goalProtein || !goalFat || !goalCalories || !goalWater || !saveBtn)
    return;

  // Initialize inputs with current goal values
  goalCarbs.value = carbsGoalTotal;
  goalProtein.value = proteinGoalTotal;
  goalFat.value = fatGoalTotal;
  goalWater.value = waterGoal;

  function computeCalories() {
    const c = Number(goalCarbs.value) || 0;
    const p = Number(goalProtein.value) || 0;
    const f = Number(goalFat.value) || 0;
    const total = c * 4 + p * 4 + f * 9;
    goalCalories.value = total;
  }

  goalCarbs.addEventListener("input", computeCalories);
  goalProtein.addEventListener("input", computeCalories);
  goalFat.addEventListener("input", computeCalories);

  computeCalories();

  saveBtn.addEventListener("click", () => {
    const c = Number(goalCarbs.value) || carbsGoalTotal;
    const p = Number(goalProtein.value) || proteinGoalTotal;
    const f = Number(goalFat.value) || fatGoalTotal;
    const cal = Number(goalCalories.value) || caloriesGoalTotal;
    const water = Number(goalWater.value) || waterGoal;

    carbsGoalTotal = c;
    proteinGoalTotal = p;
    fatGoalTotal = f;
    caloriesGoalTotal = cal;
    waterGoal = water;

    updateGoalDisplay();
    renderNutritionDashboard();

    const cupsEl = document.querySelector("#waterCups");
    const gaugeFill = document.querySelector("#waterGaugeFill");
    if (cupsEl && gaugeFill) {
      const cups = Number(cupsEl.textContent) || 0;
      const max = Math.max(1, waterGoal);
      gaugeFill.style.width = `${Math.max(0, Math.min(1, cups / max)) * 100}%`;
    }
  });
}

// Visual AI Scanner (legacy)
function initVisualScanner() {
  const dropZone = document.querySelector("#dropZone");
  const input = document.querySelector("#imageInput");
  const previewImage = document.querySelector("#previewImage");
  const scanStatus = document.querySelector("#scanStatus");
  const analyzeBtn = document.querySelector("#analyzeImage");
  const clearBtn = document.querySelector("#clearImage");
  const mealsList = document.querySelector("#mealsList");
  const mealsCountEl = document.querySelector("#mealsCount");
  if (!dropZone || !input || !previewImage || !scanStatus) return;

  let scanTimeoutId = null;

  if (analyzeBtn) {
    analyzeBtn.disabled = true;
  }
  if (clearBtn) {
    clearBtn.style.display = "none";
    clearBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      clearImageUpload();
    });
  }

  function resetDropZone() {
    previewImage.src = "";
    if (input) input.value = "";
    dropZone.classList.remove("has-image", "scanning", "drag-over");
    scanStatus.textContent = "Waiting for a delicious photo.";
    if (analyzeBtn) {
      analyzeBtn.disabled = true;
    }
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
    if (scanTimeoutId !== null) {
      clearTimeout(scanTimeoutId);
      scanTimeoutId = null;
    }
  }

  function clearImageUpload() {
    resetDropZone();
  }

  function startScan() {
    dropZone.classList.add("has-image", "scanning");
    scanStatus.textContent = "Analyzing image...";
    if (analyzeBtn) analyzeBtn.disabled = true;

    if (scanTimeoutId !== null) {
      clearTimeout(scanTimeoutId);
    }

    scanTimeoutId = window.setTimeout(() => {
      dropZone.classList.remove("scanning");
      scanStatus.textContent = "AI Match: Cheeseburger";

      addMealCard({
        label: "Cheeseburger (AI)",
        calories: 600,
        carbs: 45,
        protein: 30,
        fat: 35,
      });

      resetDropZone();
    }, 2500);
  }

  function setImagePreview(src) {
    previewImage.src = src;
    dropZone.classList.add("has-image");
    scanStatus.textContent = "Ready to analyze.";
    if (analyzeBtn) analyzeBtn.disabled = false;
    if (clearBtn) clearBtn.style.display = "grid";
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result || "");
    };
    reader.readAsDataURL(file);
  }

  dropZone.addEventListener("click", () => {
    input.click();
  });

  dropZone.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter" || evt.key === " ") {
      evt.preventDefault();
      input.click();
    }
  });

  input.addEventListener("change", (evt) => {
    const target = evt.target;
    if (!target || !target.files || !target.files[0]) return;
    handleFile(target.files[0]);
  });

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", () => {
      startScan();
    });
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      dropZone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      dropZone.classList.remove("drag-over");
    });
  });

  dropZone.addEventListener("drop", (evt) => {
    const files = evt.dataTransfer?.files;
    if (!files || !files[0]) return;
    handleFile(files[0]);
  });
}

// Attachment preview + multi-image picker (used by the AI input bar)
function initAttachmentBar() {
  const attachBtn = document.querySelector("#attachPhoto");
  const input = document.querySelector("#imageInput");
  const previews = document.querySelector("#attachmentPreviews");
  if (!attachBtn || !input || !previews) {
    return { getFiles: () => [], clear: () => {}, playScan: () => Promise.resolve() };
  }

  let items = [];

  function renderPreviews() {
    previews.innerHTML = "";
    if (!items.length) return;

    items.forEach((item, index) => {
      const thumb = document.createElement("div");
      thumb.className = "attachment-thumb";
      thumb.innerHTML = `
        <img src="${item.url}" alt="${item.file.name}" />
        <button type="button" aria-label="Remove attachment">×</button>
      `;

      const closeBtn = thumb.querySelector("button");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          URL.revokeObjectURL(item.url);
          items.splice(index, 1);
          renderPreviews();
        });
      }

      previews.appendChild(thumb);
    });
  }

  function clearAll() {
    items.forEach((item) => URL.revokeObjectURL(item.url));
    items = [];
    input.value = "";
    renderPreviews();
  }

  function handleFiles(files) {
    const newFiles = Array.from(files || []).filter(
      (file) => file && file.type?.startsWith("image/")
    );
    if (!newFiles.length) return;

    newFiles.forEach((file) => {
      const exists = items.some(
        (item) =>
          item.file.name === file.name &&
          item.file.size === file.size &&
          item.file.lastModified === file.lastModified
      );
      if (!exists) {
        items.push({ file, url: URL.createObjectURL(file) });
      }
    });

    renderPreviews();
    // clear the input so the user can re-select the same file if needed
    input.value = "";
  }

  function playScanAnimation() {
    if (!previews || !previews.children.length) return Promise.resolve();

    const laser = document.createElement("div");
    laser.className = "scan-laser";
    previews.appendChild(laser);

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          laser.remove();
          resolve();
        },
      });

      tl.to(laser, { opacity: 1, duration: 0.2, ease: "power2.out" })
        .to(laser, { xPercent: 420, duration: 1.1, ease: "power1.inOut" })
        .to(laser, { opacity: 0, duration: 0.25 }, "-=0.25");
    });
  }

  attachBtn.addEventListener("click", () => input.click());
  input.addEventListener("change", (evt) => {
    handleFiles(evt.target.files);
  });

  return {
    getFiles: () => items.map((item) => item.file),
    clear: clearAll,
    playScan: playScanAnimation,
  };
}

// Scroll into Section 01: gently reposition taco and pop out macros
function initHeroScrollStory() {
  const hero = document.querySelector("#ai-magic");
  const heroOrbit = document.querySelector(".hero-orbit");
  const bubbles = gsap.utils.toArray(".macro-bubble");
  if (!hero || !heroOrbit || !bubbles.length) return;

  // Start bubbles collapsed at the taco center
  gsap.set(bubbles, {
    opacity: 0,
    scale: 0,
    x: 0,
    y: 0,
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top bottom",
      end: "top center",
      scrub: true,
    },
  });

  // Gently move and scale the taco as we enter Section 01
  tl.to(
    heroOrbit,
    {
      xPercent: 40,
      yPercent: -10,
      scale: 0.8,
      ease: "power2.out",
    },
    0
  );

  // Pop bubbles outward from the taco
  tl.to(
    bubbles,
    {
      opacity: 1,
      scale: 1,
      stagger: 0.1,
      duration: 0.6,
      ease: "back.out(1.8)",
    },
    0.1
  )
    .to(
      bubbles[0],
      {
        x: -70,
        y: -40,
        duration: 0.6,
        ease: "power2.out",
      },
      0.1
    )
    .to(
      bubbles[1],
      {
        x: 70,
        y: -30,
        duration: 0.6,
        ease: "power2.out",
      },
      0.12
    )
    .to(
      bubbles[2],
      {
        x: 20,
        y: 50,
        duration: 0.6,
        ease: "power2.out",
      },
      0.14
    );
}

function initParallaxFoodOrbit() {
  const hero = document.querySelector("#hero");
  const orbit = document.querySelector(".hero-orbit");
  if (!hero || !orbit) return;

  gsap.to(orbit, {
    yPercent: -12,
    rotation: -6,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

function initWaterTracker() {
  const cupsEl = document.querySelector("#waterCups");
  const plusBtn = document.querySelector("#waterPlus");
  const minusBtn = document.querySelector("#waterMinus");
  const gaugeFill = document.querySelector("#waterGaugeFill");
  const waterHint = document.querySelector(".water-hint");
  if (!cupsEl || !plusBtn || !minusBtn) return;

  let cups = Number.parseInt(cupsEl.textContent || "0", 10);
  if (!Number.isFinite(cups) || cups < 0) cups = 0;

  function render() {
    cupsEl.textContent = String(cups);
    if (gaugeFill) {
      const max = Math.max(1, waterGoal);
      const pct = Math.max(0, Math.min(1, cups / max)) * 100;
      gaugeFill.style.width = `${pct}%`;
    }
    if (waterHint) {
      waterHint.textContent = `Goal: ${waterGoal} cups. Tap to adjust.`;
    }
    minusBtn.disabled = cups <= 0;
  }

  plusBtn.addEventListener("click", () => {
    cups += 1;
    render();
  });

  minusBtn.addEventListener("click", () => {
    cups = Math.max(0, cups - 1);
    render();
  });

  render();
}

// Food logger + send control bar
function initFoodLogger(attachmentBar) {
  const inputEl = document.querySelector("#aiInput");
  const sendBtn = document.querySelector("#sendFood");
  const voiceBtn = document.querySelector("#voiceLog");

  if (!inputEl || !sendBtn) return;

  let recognition = null;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function initSpeech() {
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const transcript = event.results[0][0]?.transcript || "";
      inputEl.value = transcript;
      inputEl.focus();
    };
    rec.onend = () => {
      if (voiceBtn) {
        voiceBtn.disabled = false;
        voiceBtn.classList.remove("mic-active");
      }
    };
    rec.onerror = () => {
      if (voiceBtn) {
        voiceBtn.disabled = false;
        voiceBtn.classList.remove("mic-active");
      }
    };

    return rec;
  }

  function clearInputs() {
    inputEl.value = "";
    attachmentBar?.clear();
  }

  async function sendEntry() {
    const text = (inputEl.value || "").trim();
    const attachments = attachmentBar?.getFiles() || [];
    if (!text && attachments.length === 0) return;

    const label =
      text ||
      `Photo log${attachments.length > 1 ? ` (${attachments.length})` : ""}`;

    const calories = 180 + attachments.length * 110;

    const originalPlaceholder = inputEl.placeholder;
    sendBtn.disabled = true;
    if (voiceBtn) voiceBtn.disabled = true;

    if (attachments.length) {
      inputEl.placeholder = "Analyzing Cheeseburgers...";
      await attachmentBar.playScan?.();
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    addMealCard({
      label,
      calories,
      carbs: 0,
      protein: 0,
      fat: 0,
    });

    clearInputs();
    inputEl.placeholder = originalPlaceholder;

    sendBtn.disabled = false;
    if (voiceBtn) voiceBtn.disabled = false;
  }

  sendBtn.addEventListener("click", sendEntry);

  inputEl.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      evt.preventDefault();
      sendEntry();
    }
  });

  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      if (!SpeechRecognition) return;
      if (!recognition) recognition = initSpeech();
      if (!recognition) return;

      voiceBtn.disabled = true;
      voiceBtn.classList.add("mic-active");
      recognition.start();
    });
  }
}

function initHowItWorksHorizontal() {
  const track = document.querySelector(".how-track-line");
  const viewport = document.querySelector(".how-track-viewport");
  const section = document.querySelector(".how-it-works");
  if (!track || !viewport || !section) return;

  const totalScroll =
    track.scrollWidth - viewport.clientWidth > 0
      ? track.scrollWidth - viewport.clientWidth
      : 0;

  gsap.to(track, {
    x: () => -totalScroll,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${section.offsetHeight}`,
      scrub: true,
      pin: true,
      anticipatePin: 1,
    },
  });
}

