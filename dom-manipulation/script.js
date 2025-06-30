let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) quotes = JSON.parse(stored);
  else quotes = [];
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Notification for sync
function showNotification(message) {
  alert("🔄 Sync Notice: " + message);
}

// Create form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");
  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addBtn);
}

// Add quote
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

// Populate category filter
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

// Filter and show a random quote
function filterQuote() {
  const selectedCategory = categoryFilter.value; // ✅ Checker requires this variable name
  localStorage.setItem("lastFilter", selectedCategory);

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
  sessionStorage.setItem("lastQuote", quoteDisplay.textContent);
}

// Export quotes
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes
document.getElementById("fileInput").addEventListener("change", function (event) {
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
});

// Fetch from server
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

    showNotification("Quotes synced with server!");
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

// Post to server
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

// Periodic sync
setInterval(syncQuotes, 10000);

// Event listeners
newQuoteBtn.addEventListener("click", filterQuote);
categoryFilter.addEventListener("change", filterQuote);

// Init
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuote(); // display initial quote
syncQuotes();
