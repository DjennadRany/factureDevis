/* =========================================================
   ENTREPRISE LOOKUP (Raison sociale -> SIREN/SIRET + adresse)
   + ADRESSE AUTOCOMPLETE (IGN Géoplateforme)
   - 100% front (pas de token)
   ========================================================= */

// --- Config API
const ENTREPRISE_SEARCH_API = "https://recherche-entreprises.api.gouv.fr/search";
const IGN_COMPLETION_API = "https://data.geopf.fr/geocodage/completion/";

// --- Small utils
function debounce(fn, wait = 300) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function clearResults(container) {
  if (!container) return;
  container.innerHTML = "";
}

function renderList(container, items, onPick) {
  if (!container) return;
  clearResults(container);

  if (!items || items.length === 0) return;

  const wrap = document.createElement("div");
  wrap.className = "list-group";

  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "list-group-item list-group-item-action";

    row.innerHTML = `
      <div class="fw-semibold">${escapeHtml(it.title || "")}</div>
      ${it.subtitle ? `<div class="lookup-muted">${escapeHtml(it.subtitle)}</div>` : ""}
    `;

    row.addEventListener("click", () => onPick(it));
    wrap.appendChild(row);
  });

  container.appendChild(wrap);
}

// =========================================================
// 1) Recherche Entreprise (raison sociale -> SIREN/SIRET)
// =========================================================
async function searchEntrepriseByName(q) {
  const url = `${ENTREPRISE_SEARCH_API}?q=${encodeURIComponent(q)}&page=1&per_page=8`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("API Recherche d’entreprises indisponible");
  const data = await res.json();

  const results = data.results || [];
  return results.map(r => {
    const nom = r.nom_complet || r.nom_raison_sociale || r.denomination || "Entreprise";
    const siren = r.siren || "";
    const siege = r.siege || {};
    const siretSiege = siege.siret || "";
    const adresse = siege.adresse || "";
    const cp = siege.code_postal || "";
    const ville = siege.libelle_commune || "";

    return {
      raw: r,
      siren,
      siret: siretSiege,
      adresse,
      codePostal: cp,
      ville,
      title: `${nom}`,
      subtitle: `${siren ? "SIREN " + siren : ""}${ville ? " • " + ville : ""}${cp ? " " + cp : ""}`
    };
  });
}

// Apply selection (fill fields)
function applyEntrepriseToSeller(ent) {
  // Important : on remplit seulement si on a l’info
  if (ent.siret) ui.sellerSiret.value = ent.siret;
  else if (ent.siren && !ui.sellerSiret.value) {
    // pas de SIRET -> on laisse vide
  }

  if (ent.adresse) ui.sellerAddress.value = ent.adresse;
  if (ent.codePostal) ui.sellerZip.value = ent.codePostal;
  if (ent.ville) ui.sellerCity.value = ent.ville;

  // refléter dans state si tu utilises ton state central
  if (typeof state !== "undefined") {
    if (ent.siret) state.seller.siret = ent.siret;
    state.seller.name = ui.sellerName.value;
    state.seller.address = ui.sellerAddress.value;
    state.seller.zip = ui.sellerZip.value;
    state.seller.city = ui.sellerCity.value;
  }

  clearResults(document.getElementById("sellerLookupResults"));
  if (typeof renderAll === "function") renderAll();
}

function applyEntrepriseToClient(ent) {
  // Client PRO : on remplit SIREN + adresse
  if (ent.siren) ui.clientSiren.value = ent.siren;
  if (ent.adresse) ui.clientAddress.value = ent.adresse;
  if (ent.codePostal) ui.clientZip.value = ent.codePostal;
  if (ent.ville) ui.clientCity.value = ent.ville;

  if (typeof state !== "undefined") {
    state.client.name = ui.clientName.value;
    state.client.siren = ui.clientSiren.value;
    state.client.address = ui.clientAddress.value;
    state.client.zip = ui.clientZip.value;
    state.client.city = ui.clientCity.value;
  }

  clearResults(document.getElementById("clientLookupResults"));
  if (typeof renderAll === "function") renderAll();
}

// Wire entreprise lookup buttons + input (optional)
function initEntrepriseLookup() {
  const sellerRes = document.getElementById("sellerLookupResults");
  const clientRes = document.getElementById("clientLookupResults");

  const doSellerSearch = async () => {
    const q = (ui.sellerName.value || "").trim();
    if (q.length < 3) return clearResults(sellerRes);
    try {
      const results = await searchEntrepriseByName(q);
      renderList(
        sellerRes,
        results.map(r => ({ title: r.title, subtitle: r.subtitle, data: r })),
        (picked) => applyEntrepriseToSeller(picked.data)
      );
    } catch (e) {
      clearResults(sellerRes);
      sellerRes.innerHTML = `<div class="text-danger small mt-2">Recherche indisponible.</div>`;
    }
  };

  const doClientSearch = async () => {
    const q = (ui.clientName.value || "").trim();
    if (q.length < 3) return clearResults(clientRes);
    try {
      const results = await searchEntrepriseByName(q);
      renderList(
        clientRes,
        results.map(r => ({ title: r.title, subtitle: r.subtitle, data: r })),
        (picked) => applyEntrepriseToClient(picked.data)
      );
    } catch (e) {
      clearResults(clientRes);
      clientRes.innerHTML = `<div class="text-danger small mt-2">Recherche indisponible.</div>`;
    }
  };

  // Buttons (si présents)
  const btnSeller = document.getElementById("btnSellerLookup");
  if (btnSeller) btnSeller.addEventListener("click", doSellerSearch);

  const btnClient = document.getElementById("btnClientLookup");
  if (btnClient) btnClient.addEventListener("click", doClientSearch);

  // Optional: auto search while typing (debounced)
  ui.sellerName.addEventListener("input", debounce(doSellerSearch, 350));
  ui.clientName.addEventListener("input", debounce(doClientSearch, 350));

  // Close list on outside click
  document.addEventListener("click", (e) => {
    if (!sellerRes.contains(e.target) && e.target !== ui.sellerName) clearResults(sellerRes);
    if (!clientRes.contains(e.target) && e.target !== ui.clientName) clearResults(clientRes);
  });
}

// =========================================================
// 2) Autocomplétion adresse (IGN Géoplateforme completion)
// =========================================================
async function autocompleteAddressIgn(text, terr = "METROPOLE", max = 6) {
  const url =
    `${IGN_COMPLETION_API}?text=${encodeURIComponent(text)}` +
    `&type=StreetAddress&maximumResponses=${encodeURIComponent(String(max))}` +
    `&terr=${encodeURIComponent(terr)}`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error("Autocomplétion IGN indisponible");
  const data = await res.json();

  // Formats possibles : GeoJSON features OR results-like
  const feats = Array.isArray(data.features) ? data.features
    : Array.isArray(data.results) ? data.results
    : Array.isArray(data.completions) ? data.completions
    : [];

  return feats.map(f => {
    const p = f.properties || f;
    const label = p.label || p.fulltext || p.fullText || p.name || "";
    const postcode = p.postcode || p.postalcode || p.zip || "";
    const city = p.city || p.municipality || p.commune || "";
    const street = p.street || p.housenumber ? `${p.housenumber || ""} ${p.street || ""}`.trim() : "";
    return {
      label,
      street: street || label,
      postcode,
      city,
      title: label || street,
      subtitle: `${postcode || ""} ${city || ""}`.trim()
    };
  }).filter(x => x.title);
}

function applyAddressToFields(picked, addressEl, zipEl, cityEl, targetKey) {
  addressEl.value = picked.street || picked.label || "";
  if (picked.postcode) zipEl.value = picked.postcode;
  if (picked.city) cityEl.value = picked.city;

  if (typeof state !== "undefined" && targetKey) {
    state[targetKey].address = addressEl.value;
    state[targetKey].zip = zipEl.value;
    state[targetKey].city = cityEl.value;
  }

  if (typeof renderAll === "function") renderAll();
}

function initAddressAutocomplete() {
  const sellerAddrRes = document.getElementById("sellerAddressResults");
  const clientAddrRes = document.getElementById("clientAddressResults");

  const doSellerAddr = debounce(async () => {
    const q = (ui.sellerAddress.value || "").trim();
    if (q.length < 5) return clearResults(sellerAddrRes);
    try {
      const suggestions = await autocompleteAddressIgn(q, "METROPOLE", 6);
      renderList(
        sellerAddrRes,
        suggestions.map(s => ({ title: s.title, subtitle: s.subtitle, data: s })),
        (picked) => {
          applyAddressToFields(picked.data, ui.sellerAddress, ui.sellerZip, ui.sellerCity, "seller");
          clearResults(sellerAddrRes);
        }
      );
    } catch {
      clearResults(sellerAddrRes);
    }
  }, 300);

  const doClientAddr = debounce(async () => {
    const q = (ui.clientAddress.value || "").trim();
    if (q.length < 5) return clearResults(clientAddrRes);
    try {
      const suggestions = await autocompleteAddressIgn(q, "METROPOLE", 6);
      renderList(
        clientAddrRes,
        suggestions.map(s => ({ title: s.title, subtitle: s.subtitle, data: s })),
        (picked) => {
          applyAddressToFields(picked.data, ui.clientAddress, ui.clientZip, ui.clientCity, "client");
          clearResults(clientAddrRes);
        }
      );
    } catch {
      clearResults(clientAddrRes);
    }
  }, 300);

  ui.sellerAddress.addEventListener("input", doSellerAddr);
  ui.clientAddress.addEventListener("input", doClientAddr);

  document.addEventListener("click", (e) => {
    if (!sellerAddrRes.contains(e.target) && e.target !== ui.sellerAddress) clearResults(sellerAddrRes);
    if (!clientAddrRes.contains(e.target) && e.target !== ui.clientAddress) clearResults(clientAddrRes);
  });
}

// =========================================================
// Boot
// =========================================================
(function bootAutomations() {
  try {
    initEntrepriseLookup();
    initAddressAutocomplete();
  } catch (e) {
    console.warn("Automations not initialized:", e);
  }
})();

// =========================================================
// Header mobile menu
// =========================================================
(function initHeaderMenu() {
  const btn = document.getElementById("btnHeaderMenu");
  const panel = document.getElementById("headerActions");
  if (!btn || !panel) return;

  const toggle = () => {
    const isOpen = panel.classList.toggle("show");
    btn.setAttribute("aria-expanded", String(isOpen));
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove("show");
      btn.setAttribute("aria-expanded", "false");
    }
  });
})();

// =========================================================
// Test hooks (only when enabled)
// =========================================================
if (window.__hexaFactTest) {
  window.__hexaFactDebug = {
    computeTotals: () => computeTotals(),
    validate: () => validateState(),
    buildPdfDefinition: (final = false) => buildPdfDefinition({ final }),
    getState: () => state,
    setState: (nextState) => {
      state = nextState;
      renderAll();
    }
  };
}
