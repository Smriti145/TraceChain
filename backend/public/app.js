const $ = (selector) => document.querySelector(selector);
const loginView = $("#login-view"),
  dashboardView = $("#dashboard-view"),
  loginForm = $("#login-form"),
  productForm = $("#product-form"),
  qrResult = $("#qr-result"),
  productsElement = $("#products");
const tokenKey = "tracechain_portal_token",
  userKey = "tracechain_portal_user";
const roleStages = {
  MANUFACTURER: ["MANUFACTURED", "QUALITY_CHECK", "PACKAGED"],
  SUPPLIER: ["SOURCED", "SUPPLIED"],
  WAREHOUSE: ["WAREHOUSE"],
  DISTRIBUTOR: ["IN_TRANSIT", "DISTRIBUTED"],
  RETAILER: ["RETAIL", "SOLD"],
  CUSTOMER: [],
};
const roleCopy = {
  SUPPLIER: [
    "Supplier source workspace",
    "Record sourcing and supplier handover with location and condition.",
  ],
  WAREHOUSE: [
    "Warehouse custody workspace",
    "Record product receipt, storage location and environmental condition.",
  ],
  DISTRIBUTOR: [
    "Distribution movement workspace",
    "Record in-transit and distribution checkpoints.",
  ],
  RETAILER: [
    "Retail fulfillment workspace",
    "Confirm retail receipt or final sale.",
  ],
  CUSTOMER: [
    "Customer trust workspace",
    "Verify the latest provenance using the permanent product QR.",
  ],
};
const cubeSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>`;
const value = (id) => $(`#${id}`).value.trim();
const escapeHtml = (input) =>
  String(input ?? "").replace(
    /[&<>'"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[
        char
      ])
  );
const toast = (message) => {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
};

async function request(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(userKey));
  } catch {
    return null;
  }
}
function applyRole(user) {
  const manufacturer = user?.role === "MANUFACTURER";
  document.body.dataset.role = user?.role || "GUEST";
  $("#side-user").textContent = user?.name || "TraceChain User";
  $("#side-role").textContent = user?.role || "ROLE";
  $("#role-badge").textContent = user?.role || "USER";
  $("#qr-studio").classList.toggle("hidden", !manufacturer);
  $("#read-only-banner").classList.toggle("hidden", manufacturer);
  const customer = user?.role === "CUSTOMER";
  $("#customer-workspace").classList.toggle("hidden", !customer);
  $("#stage-workspace").classList.toggle("hidden", manufacturer || customer);
  const copy = roleCopy[user?.role];
  if (copy) {
    $("#workspace-title").textContent = copy[0];
    $("#workspace-description").textContent = copy[1];
  }
  const workspaceNav = $("#workspace-nav");
  if (manufacturer) {
    workspaceNav.textContent = "QR Studio";
    workspaceNav.href = "#qr-studio";
  } else if (customer) {
    workspaceNav.textContent = "Verify Product";
    workspaceNav.href = "#customer-workspace";
  } else {
    workspaceNav.textContent = "Update Journey";
    workspaceNav.href = "#stage-workspace";
  }
  if (!manufacturer && !customer) {
    $("#stage-heading").textContent = `${user.role.replaceAll(
      "_",
      " "
    )} journey update`;
    $("#trace-stage").innerHTML = roleStages[user.role]
      .map(
        (stage) =>
          `<option value="${stage}">${stage.replaceAll("_", " ")}</option>`
      )
      .join("");
    $("#stage-permissions").textContent = `Allowed stages · ${roleStages[
      user.role
    ]
      .map((stage) => stage.replaceAll("_", " "))
      .join(" · ")}`;
  }
}
function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  applyRole(currentUser());
  loadProducts();
}

$("#demo-roles").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-email]");
  if (!button) return;
  $("#email").value = button.dataset.email;
  $("#password").value = "TraceChain@123";
  document
    .querySelectorAll("#demo-roles button")
    .forEach((item) => item.classList.toggle("active", item === button));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button[type=submit]");
  button.disabled = true;
  $("#login-error").textContent = "";
  try {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: value("email").toLowerCase(),
        password: $("#password").value,
      }),
    });
    localStorage.setItem(tokenKey, data.token);
    localStorage.setItem(userKey, JSON.stringify(data.user));
    showDashboard();
  } catch (error) {
    $("#login-error").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = productForm.querySelector("button[type=submit]");
  button.disabled = true;
  $("#product-error").textContent = "";
  try {
    const data = await request("/products", {
      method: "POST",
      body: JSON.stringify({
        productName: value("product-name"),
        category: value("category"),
        brand: value("brand"),
        variant: value("variant"),
        productCode: value("product-code"),
        barcode: value("barcode"),
        description: value("description"),
        netQuantity: value("net-quantity"),
        unitOfMeasure: value("unit-of-measure"),
        countryOfOrigin: value("country-of-origin"),
        expiryDate: value("expiry-date"),
        rawMaterialSource: value("raw-material-source"),
        supplier: value("supplier"),
        processingPlant: value("processing-plant"),
        processingDate: value("processing-date"),
        qualityCheck: value("quality-check"),
        packagingUnit: value("packaging-unit"),
        packagingDate: value("packaging-date"),
        warehouse: value("warehouse"),
        distributor: value("distributor"),
        dispatchDate: value("dispatch-date"),
        retailer: value("retailer"),
        deliveryDate: value("delivery-date"),
        location: value("location"),
        temperature: value("temperature"),
      }),
    });
    renderQr(data.product);
    productForm.reset();
    toast("Product identity and QR created");
    loadProducts();
  } catch (error) {
    $("#product-error").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

function renderQr(product) {
  qrResult.classList.remove("empty-result");
  qrResult.innerHTML = `<div class="qr-label"><div class="qr-label-head"><strong>TRACECHAIN</strong><span class="verified-chip">SECURE IDENTITY</span></div><img src="${escapeHtml(
    product.qrImage
  )}" alt="QR code for ${escapeHtml(
    product.productName
  )}"><span class="batch">${escapeHtml(
    product.batchNumber
  )}</span><h2>${escapeHtml(
    product.productName
  )}</h2><div class="qr-details"><span>INDUSTRY<strong>${escapeHtml(
    product.category
  )}</strong></span><span>STATUS<strong>${escapeHtml(
    product.status
  )}</strong></span><span>BRAND<strong>${escapeHtml(
    product.brand || "—"
  )}</strong></span><span>ORIGIN<strong>${escapeHtml(
    product.countryOfOrigin || "—"
  )}</strong></span></div></div><div class="qr-actions"><a class="action-primary" href="${escapeHtml(
    product.qrImage
  )}" download="${escapeHtml(
    product.batchNumber
  )}.png">Download QR</a><a href="${escapeHtml(
    product.verificationUrl
  )}" target="_blank" rel="noopener">Open journey</a><button id="copy-link" type="button">Copy link</button><button type="button" onclick="window.print()">Print label</button></div>`;
  $("#copy-link").addEventListener("click", async () => {
    await navigator.clipboard.writeText(product.verificationUrl);
    toast("Verification link copied");
  });
}

$("#trace-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  // `Event.currentTarget` is only guaranteed while the synchronous event
  // listener is running. Keep the form reference before awaiting the API.
  const form = event.currentTarget;
  const button = form.querySelector("button");
  button.disabled = true;
  $("#trace-error").textContent = "";
  try {
    await request("/traces", {
      method: "POST",
      body: JSON.stringify({
        productId: value("trace-product"),
        stage: value("trace-stage"),
        location: value("trace-location"),
        temperature:
          value("trace-temperature") === ""
            ? undefined
            : Number(value("trace-temperature")),
        remarks: value("trace-remarks") || undefined,
      }),
    });
    form.reset();
    toast("Journey checkpoint recorded. The same QR now shows updated data.");
    await loadProducts();
  } catch (error) {
    $("#trace-error").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

$("#customer-verify-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = value("customer-code");
  const match = raw.match(/\/verify\/([^/?#]+)/i);
  const code = match ? decodeURIComponent(match[1]) : raw;
  window.open(`/verify/${encodeURIComponent(code)}`, "_blank", "noopener");
});

let allProducts = [];
function renderProducts(products) {
  productsElement.innerHTML =
    products
      .map(
        (product) =>
          `<article class="product"><div class="product-top"><div class="product-icon">${cubeSvg}</div><span class="status">${escapeHtml(
            product.status
          )}</span></div><p class="eyebrow">${escapeHtml(
            product.category || "GENERAL"
          )}</p><h3>${escapeHtml(product.productName)}</h3><p>${escapeHtml(
            product.batchNumber
          )}</p><footer><span>${escapeHtml(
            product.brand || "Independent"
          )}</span><span>${new Date(
            product.createdAt
          ).toLocaleDateString()}</span></footer></article>`
      )
      .join("") || `<p class="muted">No matching products found.</p>`;
}
async function loadProducts() {
  try {
    allProducts = await request("/products");
    const categories = new Set(allProducts.map((item) => item.category));
    $("#product-count").textContent = `${allProducts.length} products`;
    $("#metric-products").textContent = String(allProducts.length).padStart(
      2,
      "0"
    );
    $("#metric-industries").textContent = String(categories.size).padStart(
      2,
      "0"
    );
    $("#metric-delivered").textContent = String(
      allProducts.filter((item) =>
        ["DELIVERED", "RETAIL", "SOLD"].includes(item.status)
      ).length
    ).padStart(2, "0");
    $("#trace-product").innerHTML = allProducts
      .map(
        (product) =>
          `<option value="${escapeHtml(product.id)}">${escapeHtml(
            product.productName
          )} · ${escapeHtml(product.batchNumber)}</option>`
      )
      .join("");
    renderProducts(allProducts);
  } catch (error) {
    if (error.message.toLowerCase().includes("token")) {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      location.reload();
    }
  }
}
$("#inventory-search").addEventListener("input", (event) => {
  const q = event.target.value.trim().toLowerCase();
  renderProducts(
    !q
      ? allProducts
      : allProducts.filter((item) =>
          [item.productName, item.batchNumber, item.category, item.brand].some(
            (field) =>
              String(field || "")
                .toLowerCase()
                .includes(q)
          )
        )
  );
});
$("#logout").addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  location.reload();
});
if (localStorage.getItem(tokenKey) && currentUser()) showDashboard();
