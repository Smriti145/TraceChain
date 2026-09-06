const loginView = document.querySelector("#login-view");
const dashboardView = document.querySelector("#dashboard-view");
const loginForm = document.querySelector("#login-form");
const productForm = document.querySelector("#product-form");
const qrResult = document.querySelector("#qr-result");
const productsElement = document.querySelector("#products");
const tokenKey = "tracechain_portal_token";
const cubeSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>`;
const value = id => document.querySelector(`#${id}`).value.trim();

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
    const data = await request("/products", {method: "POST", body: JSON.stringify({
      productName: value("product-name"), category: value("category"), brand: value("brand"), variant: value("variant"),
      productCode: value("product-code"), barcode: value("barcode"), description: value("description"),
      netQuantity: value("net-quantity"), unitOfMeasure: value("unit-of-measure"), countryOfOrigin: value("country-of-origin"), expiryDate: value("expiry-date"),
      rawMaterialSource: value("raw-material-source"), supplier: value("supplier"), processingPlant: value("processing-plant"),
      processingDate: value("processing-date"), qualityCheck: value("quality-check"), packagingUnit: value("packaging-unit"),
      packagingDate: value("packaging-date"), warehouse: value("warehouse"), distributor: value("distributor"),
      dispatchDate: value("dispatch-date"), retailer: value("retailer"), deliveryDate: value("delivery-date"),
      location: value("location"), temperature: value("temperature"),
    })});
    const product = data.product;
    qrResult.classList.remove("empty-result");
    qrResult.innerHTML = `<p class="eyebrow">QR READY TO SCAN</p><img src="${escapeHtml(product.qrImage)}" alt="QR code for ${escapeHtml(product.productName)}"><span class="batch">${escapeHtml(product.batchNumber)}</span><h2>${escapeHtml(product.productName)}</h2><a class="verification-link" href="${escapeHtml(product.verificationUrl)}" target="_blank" rel="noopener">Open web traceability report</a><a class="download" href="${escapeHtml(product.qrImage)}" download="${escapeHtml(product.batchNumber)}.png"><button type="button">Download QR</button></a>`;
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
    productsElement.innerHTML = products.slice(0, 9).map(product => `<article class="product"><div class="product-top"><div class="product-icon">${cubeSvg}</div><span class="status">${escapeHtml(product.status)}</span></div><span class="eyebrow">${escapeHtml(product.category || "GENERAL")}</span><h3>${escapeHtml(product.productName)}</h3><p>${escapeHtml(product.batchNumber)}</p></article>`).join("") || `<p class="muted">No products yet. Create your first traceable product above.</p>`;
  } catch (error) {
    if (error.message.toLowerCase().includes("token")) localStorage.removeItem(tokenKey);
  }
}

document.querySelector("#logout").addEventListener("click", () => { localStorage.removeItem(tokenKey); location.reload(); });
if (localStorage.getItem(tokenKey)) showDashboard();
