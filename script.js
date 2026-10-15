const emailText = document.getElementById("emailText");
const counter = document.getElementById("counter");
const analyzeBtn = document.getElementById("analyzeBtn");
const scanCard = document.getElementById("scanCard");
const resultCard = document.getElementById("resultCard");
const progressBar = document.getElementById("progressBar");
const scanText = document.getElementById("scanText");

emailText.addEventListener("input", () => {
  counter.textContent = `${emailText.value.length} characters`;
});

document.querySelectorAll(".examples button").forEach(btn => {
  btn.addEventListener("click", () => {
    emailText.value = btn.dataset.example;
    emailText.dispatchEvent(new Event("input"));
    emailText.focus();
  });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyze() {
  const text = emailText.value.trim();
  if (!text) {
    emailText.focus();
    return;
  }

  analyzeBtn.classList.add("loading");
  scanCard.classList.remove("hidden");
  resultCard.classList.add("hidden");
  progressBar.style.width = "0%";

  const stages = [
    ["Cleaning text...", "p1", 20],
    ["Extracting TF-IDF features...", "p2", 45],
    ["Running Naive Bayes...", "p3", 72],
    ["Calculating spam probability...", "p4", 90]
  ];

  for (const [message, id, progress] of stages) {
    scanText.textContent = message;
    document.querySelectorAll(".pipeline span").forEach(x => x.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    progressBar.style.width = progress + "%";
    await sleep(420);
  }

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({text})
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Prediction failed.");

    progressBar.style.width = "100%";
    await sleep(300);
    showResult(data);
  } catch (error) {
    scanText.textContent = error.message;
    progressBar.style.width = "0%";
  } finally {
    analyzeBtn.classList.remove("loading");
  }
}

function showResult(data) {
  resultCard.classList.remove("hidden", "is-spam");
  const spam = data.label === "SPAM";

  if (spam) {
    resultCard.classList.add("is-spam");
    document.getElementById("resultIcon").textContent = "!";
    document.getElementById("resultLabel").textContent = "SPAM DETECTED";
    document.getElementById("resultMessage").textContent =
      "This message has a high probability of being spam.";
    document.getElementById("resultBadge").textContent = "THREAT DETECTED";
  } else {
    document.getElementById("resultIcon").textContent = "✓";
    document.getElementById("resultLabel").textContent = "NOT SPAM";
    document.getElementById("resultMessage").textContent =
      "This message appears to be legitimate.";
    document.getElementById("resultBadge").textContent = "MESSAGE SAFE";
  }

  document.getElementById("probability").textContent =
    `${data.probability.toFixed(1)}%`;

  requestAnimationFrame(() => {
    document.getElementById("meterFill").style.width =
      `${data.probability}%`;
  });

  resultCard.scrollIntoView({behavior: "smooth", block: "center"});
}

analyzeBtn.addEventListener("click", analyze);

emailText.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") analyze();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resultCard.classList.add("hidden");
  scanCard.classList.add("hidden");
  emailText.value = "";
  emailText.dispatchEvent(new Event("input"));
  emailText.focus();
});
