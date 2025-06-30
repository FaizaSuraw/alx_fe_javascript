let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Load from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [];
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show notification
function showNotification(message) {
  alert("🔄 Sync Notice: " + message);
}

// Add quote form
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Add quote to array
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Both fields are required!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added!");

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Populate dropdown
function populateCategories() {
  const saved = localStorage.getItem("lastFilter") || "all";
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === saved) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// ✅ Required: showRandomQuote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
}

// ✅ Required: filterQuote
function filterQuote() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastFilter", selected);

  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
  sessionStorage.setItem("lastQuote", quoteDisplay.textContent);
}

// ✅ Export quotes
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ Import quotes
document.getElementById("importFile").addEventListener("change", function (event) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      quotes.push(...data);
      saveQuotes();
      populateCategories();
      alert("Quotes imported!");
    } catch (e) {
      alert("Import failed: " + e.message);
    }
  };
  reader.readAsText(event.target.files[0]);
});

// ✅ Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    let added = 0;

    data.slice(0, 5).forEach(post => {
      const newQuote = { text: post.title, category: "Server" };
      if (!quotes.some(q => q.text === newQuote.text)) {
        quotes.push(newQuote);
        added++;
      }
    });

    if (added > 0) {
      saveQuotes();
      populateCategories();
    }

    showNotification("Quotes synced with server!");
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

// ✅ POST to server
function syncQuotes() {
  fetchQuotesFromServer();

  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotes)
  })
    .then(res => res.json())
    .then(data => console.log("Posted to server:", data))
    .catch(err => console.error("POST failed:", err));
}

// ✅ Periodic sync
setInterval(syncQuotes, 10000);

// ✅ Event bindings
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuote);

// ✅ Initialization
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuote();
syncQuotes();
