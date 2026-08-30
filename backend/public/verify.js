const report = document.querySelector("#report");
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
const humanize = value => String(value || "Not recorded").replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase());
const formatDate = value => value ? new Intl.DateTimeFormat("en-IN", {day:"2-digit", month:"short", year:"numeric"}).format(new Date(value)) : "Not recorded";
const field = (label, value) => value !== null && value !== undefined && value !== "" ? `<div class="detail"><label>${escapeHtml(label)}</label><strong>${escapeHtml(value)}</strong></div>` : "";

async function loadReport() {
  const qr = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop());
  try {
    const response = await fetch(`/api/products/verify/${encodeURIComponent(qr)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Product record not found");
    const product = data.product;
    const details = [
      field("Product database ID", product.id), field("Product code / ID", product.productCode),
      field("Batch ID", product.batchNumber), field("Current status", humanize(product.status)),
      field("Description", product.description), field("Manufactured / processed", formatDate(product.processingDate)),
      field("Raw material source", product.rawMaterialSource), field("Supplier", product.supplier),
      field("Processing plant", product.processingPlant), field("Quality check", product.qualityCheck),
      field("Packaging unit", product.packagingUnit), field("Packaging date", formatDate(product.packagingDate)),
      field("Warehouse", product.warehouse), field("Distributor", product.distributor),
      field("Retailer", product.retailer), field("Current location", product.location),
      field("Dispatch date", formatDate(product.dispatchDate)), field("Delivery date", formatDate(product.deliveryDate)),
      field("Recorded temperature", product.temperature != null ? `${product.temperature} °C` : null),
      field("Manufacturer", product.manufacturer?.name), field("Manufacturer email", product.manufacturer?.email),
      field("TraceChain record created", formatDate(product.createdAt)),
    ].join("");
    const journey = product.traces.length ? product.traces.map((event, index) => `<article class="event"><div class="marker">${String(index + 1).padStart(2,"0")}</div><div><h3>${escapeHtml(humanize(event.stage))}</h3><div class="meta">${escapeHtml(event.location)} · ${escapeHtml(formatDate(event.eventDate || event.createdAt))}${event.temperature != null ? ` · ${escapeHtml(event.temperature)} °C` : ""}</div>${event.remarks ? `<p>${escapeHtml(event.remarks)}</p>` : ""}</div></article>`).join("") : `<p class="meta">No journey checkpoints have been recorded yet.</p>`;
    report.innerHTML = `<section class="hero"><div class="verified"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/></svg>AUTHENTIC TRACECHAIN RECORD</div><h1>${escapeHtml(product.productName)}</h1><div class="batch">Batch ${escapeHtml(product.batchNumber)}</div><div class="hero-grid"><div class="hero-stat"><span>PRODUCT ID</span><strong>${escapeHtml(product.productCode || product.id.slice(0,12))}</strong></div><div class="hero-stat"><span>STATUS</span><strong>${escapeHtml(humanize(product.status))}</strong></div><div class="hero-stat"><span>JOURNEY EVENTS</span><strong>${product.traces.length} verified checkpoints</strong></div></div></section><section class="section"><div class="section-head"><div><p class="eyebrow">DATABASE RECORD</p><h2>Product details</h2></div></div><div class="details">${details}</div></section><section class="section"><div class="section-head"><div><p class="eyebrow">END-TO-END PROVENANCE</p><h2>Traceability journey</h2></div><span class="record-count">${product.traces.length} events</span></div><div class="journey">${journey}</div></section><div class="proof"><svg viewBox="0 0 24 24"><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/></svg><div><strong>Verification reference</strong><span>${escapeHtml(product.qrCode)}</span></div></div>`;
    document.title = `${product.productName} | TraceChain Verification`;
  } catch (error) {
    report.innerHTML = `<section class="error-state"><h1>Product could not be verified</h1><p>${escapeHtml(error.message)}</p><a href="/">Return to TraceChain</a></section>`;
  }
}

loadReport();
