const loginView = document.querySelector("#login-view");
const dashboardView = document.querySelector("#dashboard-view");
const loginForm = document.querySelector("#login-form");
const productForm = document.querySelector("#product-form");
const qrResult = document.querySelector("#qr-result");
const productsElement = document.querySelector("#products");
const tokenKey = "tracechain_portal_token";

const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
const toast = message => { const el = document.querySelector("#toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2400); };

async function request(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {"Content-Type": "application/json", ...(token ? {Authorization: `Bearer ${token}`} : {}), ...options.headers},
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  loadProducts();
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = loginForm.querySelector("button");
  button.disabled = true;
  document.querySelector("#login-error").textContent = "";
  try {
    const data = await request("/auth/login", {method: "POST", body: JSON.stringify({email: document.querySelector("#email").value.trim().toLowerCase(), password: document.querySelector("#password").value})});
    if (data.user.role !== "MANUFACTURER") throw new Error("Manufacturer access is required");
    localStorage.setItem(tokenKey, data.token);
    showDashboard();
  } catch (error) { document.querySelector("#login-error").textContent = error.message; }
  finally { button.disabled = false; }
});

productForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button = productForm.querySelector("button");
  button.disabled = true;
  document.querySelector("#product-error").textContent = "";
  try {
    const data = await request("/products", {method: "POST", body: JSON.stringify({productName: document.querySelector("#product-name").value.trim(), description: document.querySelector("#description").value.trim()})});
    const product = data.product;
    qrResult.classList.remove("empty-result");
    qrResult.innerHTML = `<p class="eyebrow">QR READY TO SCAN</p><img src="${escapeHtml(product.qrImage)}" alt="QR code for ${escapeHtml(product.productName)}"><span class="batch">${escapeHtml(product.batchNumber)}</span><h2>${escapeHtml(product.productName)}</h2><p class="qr-code">${escapeHtml(product.qrCode)}</p><a class="download" href="${escapeHtml(product.qrImage)}" download="${escapeHtml(product.batchNumber)}.png"><button type="button">Download QR</button></a>`;
    productForm.reset();
    toast("Product and QR created successfully");
    loadProducts();
  } catch (error) { document.querySelector("#product-error").textContent = error.message; }
  finally { button.disabled = false; }
});

async function loadProducts() {
  try {
    const products = await request("/products");
    document.querySelector("#product-count").textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
    productsElement.innerHTML = products.slice(0, 9).map(product => `<article class="product"><div class="product-top"><div class="product-icon">◇</div><span class="status">${escapeHtml(product.status)}</span></div><h3>${escapeHtml(product.productName)}</h3><p>${escapeHtml(product.batchNumber)}</p></article>`).join("") || `<p class="muted">No products yet. Create your first traceable product above.</p>`;
  } catch (error) {
    if (error.message.toLowerCase().includes("token")) localStorage.removeItem(tokenKey);
  }
}

document.querySelector("#logout").addEventListener("click", () => { localStorage.removeItem(tokenKey); location.reload(); });
if (localStorage.getItem(tokenKey)) showDashboard();
