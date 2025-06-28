let quotes = [];
const SERVER_URL = "https://raw.githubusercontent.com/FaizaSuraw/alx_fe_javascript/refs/heads/master/dom-manipulation/server-quotes.json"

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [];
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show notification
function showNotification(message) {
  alert("🔄 Sync Notice: " + message);
}

// Create quote form
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  addButton.addEventListener("click", addQuote);
}

// Add quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added!");
}

// Populate category dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const savedFilter = localStorage.getItem("lastFilter") || "all";

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === savedFilter) {
      option.selected = true;
    }
    categoryFilter.appendChild(option);
  });
}

// Filter quotes
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastFilter", selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — ${quote.category}`;

  sessionStorage.setItem("lastQuote", quoteDisplay.textContent);
}

// Export to JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert('Quotes imported successfully!');
    } catch (e) {
      alert("Failed to import: " + e.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Sync quotes with simulated server (fetch new quotes)
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    // Check for new or updated quotes
    let conflicts = 0;
    serverQuotes.forEach(serverQuote => {
      const exists = quotes.some(local => local.text === serverQuote.text);
      if (!exists) {
        quotes.push(serverQuote);
        conflicts++;
      }
    });

    if (conflicts > 0) {
      saveQuotes();
      populateCategories();
      showNotification(`${conflicts} new quote(s) added from server.`);
    }
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

// Periodic sync
setInterval(syncWithServer, 10000); // Every 10 seconds

// Event listeners
newQuoteBtn.addEventListener("click", filterQuotes);
categoryFilter.addEventListener("change", filterQuotes);

// Init
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuotes();
syncWithServer(); // Initial sync
