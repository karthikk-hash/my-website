const pdfInput = document.getElementById("pdfInput");
const parseBtn = document.getElementById("parseBtn");
const clearBtn = document.getElementById("clearBtn");
const statusText = document.getElementById("status");
const highlightsEl = document.getElementById("highlights");
const activitiesEl = document.getElementById("activities");
const rawTextEl = document.getElementById("rawText");

let pdfFile = null;

const keywords = [
  { key: /meeting|call|sync/i, activity: "Schedule a meeting" },
  { key: /invoice|payment|due/i, activity: "Follow up on payment" },
  { key: /deadline|submit|due date/i, activity: "Set a deadline reminder" },
  { key: /review|approve|sign/i, activity: "Request review/approval" },
  { key: /deliver|shipment|dispatch/i, activity: "Track delivery status" },
  { key: /onboarding|training/i, activity: "Plan onboarding/training" },
];

function setStatus(text) {
  statusText.textContent = text;
}

function setStackContent(element, items, className) {
  element.innerHTML = "";
  if (items.length === 0) {
    element.textContent = "No items detected.";
    element.classList.add("empty");
    return;
  }

  element.classList.remove("empty");
  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = className;
    div.textContent = item;
    element.appendChild(div);
  });
}

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    text += `${pageText}\n`;
  }

  return text.trim();
}

function findHighlights(text) {
  const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 12);
  return sentences.filter((sentence) => sentence.length > 20).slice(0, 6);
}

function suggestActivities(text) {
  const suggestions = [];
  keywords.forEach(({ key, activity }) => {
    if (key.test(text)) {
      suggestions.push(activity);
    }
  });

  if (suggestions.length === 0) {
    suggestions.push("Create a summary task", "Share with the team");
  }

  return suggestions;
}

pdfInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  pdfFile = file || null;
  parseBtn.disabled = !pdfFile;
  setStatus(pdfFile ? `Ready to parse: ${pdfFile.name}` : "Waiting for a PDF.");
});

parseBtn.addEventListener("click", async () => {
  if (!pdfFile) {
    return;
  }

  setStatus("Parsing PDF... this can take a few seconds.");
  parseBtn.disabled = true;

  try {
    const text = await extractTextFromPdf(pdfFile);
    rawTextEl.textContent = text || "No text found in the PDF.";

    const highlights = findHighlights(text);
    const activities = suggestActivities(text);

    setStackContent(highlightsEl, highlights, "chip");
    setStackContent(activitiesEl, activities, "activity");

    setStatus("Parsing complete. Review highlights and activities.");
  } catch (error) {
    setStatus("Failed to parse PDF. Try another file.");
    rawTextEl.textContent = String(error);
  } finally {
    parseBtn.disabled = false;
  }
});

clearBtn.addEventListener("click", () => {
  pdfInput.value = "";
  pdfFile = null;
  parseBtn.disabled = true;
  rawTextEl.textContent = "Upload a PDF to see extracted text here.";
  setStackContent(highlightsEl, [], "chip");
  setStackContent(activitiesEl, [], "activity");
  setStatus("Waiting for a PDF.");
});
