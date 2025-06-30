let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Load from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) quotes = JSON.parse(stored);
  else quotes = [];
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show alert notification
function showNotification(message) {
  alert("🔄 Sync Notice: " + message);
}

// Create form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer") || document.createElement("div");
  formContainer.id = "formContainer";
  document.body.insertBefore(formContainer, newQuoteBtn);

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Add new quote
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

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
}

// Populate categories
function populateCategories() {
  const saved = localStorage.getItem("lastFilter") || "all";
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === saved) opt.selected = true;
    categoryFilter.appendChild(opt);
  });
}

// ✅ ALX Required: Show random quote
function showRandomQuote() {
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

// Export quotes as JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
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
      alert("Error importing: " + e.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ✅ Required: fetch from server using JSONPlaceholder
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    let added = 0;

    data.slice(0, 5).forEach(post => {
      const newQuote = { text: post.title, category: "Server" };
      const exists = quotes.some(q => q.text === newQuote.text);
      if (!exists) {
        quotes.push(newQuote);
        added++;
      }
    });

    if (added > 0) {
      saveQuotes();
      populateCategories();
    }

    // ✅ Required exact wording by ALX
    showNotification("Quotes synced with server!");
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

// ✅ Required: post to server using JSONPlaceholder
function syncQuotes() {
  fetchQuotesFromServer();

  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quotes)
  })
    .then(res => res.json())
    .then(data => console.log("Posted to server (simulated):", data))
    .catch(err => console.error("POST failed:", err));
}

// ✅ Required: periodic sync every 10 seconds
setInterval(syncQuotes, 10000);

// ✅ Event bindings
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", showRandomQuote);

// ✅ Init
loadQuotes();
createAddQuoteForm();
populateCategories();
showRandomQuote();
syncQuotes();
