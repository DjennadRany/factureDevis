/* =========================================================
   HexaFact — Devis & Factures
   - Wizard + champs conditionnels
   - Calculs en centimes
   - Checklist légale (bloquante pour PDF final)
   - Numérotation locale
   - Sauvegarde brouillon (localStorage)
   - Export/Import JSON
   - PDF via pdfmake
   ========================================================= */

   const LS_KEYS = {
    drafts: "df_offline_drafts_v1",
    counters: "df_offline_counters_v1"
  };
  
  const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
  
  const $ = (id) => document.getElementById(id);
  
  const ui = {
    // Wizard
    stepBtns: Array.from(document.querySelectorAll(".step-btn")),
    steps: Array.from(document.querySelectorAll(".wizard-step")),
    progressBar: $("progressBar"),
    btnBack: $("btnBack"),
    btnNext: $("btnNext"),
  
    // Header actions
    btnNew: $("btnNew"),
    btnSaveDraft: $("btnSaveDraft"),
  
    // Document
    docBadge: $("docBadge"),
    docTypeDevis: $("docTypeDevis"),
    docTypeFacture: $("docTypeFacture"),
    docReference: $("docReference"),
    clientTypePro: $("clientTypePro"),
    clientTypePart: $("clientTypePart"),
    vatMode: $("vatMode"),
    issueDate: $("issueDate"),
    docNumber: $("docNumber"),
    wrapDocNumber: $("wrapDocNumber"),
    wrapSpecialVatText: $("wrapSpecialVatText"),
    specialVatText: $("specialVatText"),
  
    // Seller
    sellerName: $("sellerName"),
    sellerSiret: $("sellerSiret"),
    sellerAddress: $("sellerAddress"),
    sellerZip: $("sellerZip"),
    sellerCity: $("sellerCity"),
    sellerEmail: $("sellerEmail"),
    sellerPhone: $("sellerPhone"),
    wrapSellerVatNumber: $("wrapSellerVatNumber"),
    sellerVatNumber: $("sellerVatNumber"),
    sellerLogo: $("sellerLogo"),
  
    // Client
    clientNameLabel: $("clientNameLabel"),
    clientName: $("clientName"),
    wrapClientSiren: $("wrapClientSiren"),
    clientSiren: $("clientSiren"),
    clientAddress: $("clientAddress"),
    clientZip: $("clientZip"),
    clientCity: $("clientCity"),
    clientEmail: $("clientEmail"),
    clientPhone: $("clientPhone"),
  
    // Items
    btnAddItem: $("btnAddItem"),
    itemRef: $("itemRef"),
    itemTitle: $("itemTitle"),
    itemQty: $("itemQty"),
    itemUnit: $("itemUnit"),
    itemDesc: $("itemDesc"),
    itemPriceHT: $("itemPriceHT"),
    wrapItemVatRate: $("wrapItemVatRate"),
    itemVatRate: $("itemVatRate"),
    wrapCustomVatRate: $("wrapCustomVatRate"),
    customVatRate: $("customVatRate"),
    itemDiscount: $("itemDiscount"),
    itemsTbody: $("itemsTbody"),
    thVat: $("thVat"),
  
    // Conditions
    wrapQuoteFields: $("wrapQuoteFields"),
    quoteValidityDays: $("quoteValidityDays"),
    quoteDepositPct: $("quoteDepositPct"),
    quoteAcceptanceText: $("quoteAcceptanceText"),
    wrapInvoiceFields: $("wrapInvoiceFields"),
    invoiceDueDate: $("invoiceDueDate"),
    invoicePaymentTermDays: $("invoicePaymentTermDays"),
    latePenaltiesText: $("latePenaltiesText"),
    wrapB2BIndemnity: $("wrapB2BIndemnity"),
    b2bIndemnityText: $("b2bIndemnityText"),
    paymentMethods: $("paymentMethods"),
    docNotes: $("docNotes"),
  
    // Preview & validation
    validationAlert: $("validationAlert"),
    validationList: $("validationList"),
    validationOk: $("validationOk"),
    btnGenerateDraftPdf: $("btnGenerateDraftPdf"),
    btnValidateAndPdf: $("btnValidateAndPdf"),
    btnDuplicate: $("btnDuplicate"),
    btnConvertQuoteToInvoice: $("btnConvertQuoteToInvoice"),
    previewText: $("previewText"),
    btnExportJson: $("btnExportJson"),
    importJsonFile: $("importJsonFile"),
  
    // Totals
    totalHT: $("totalHT"),
    totalTVA: $("totalTVA"),
    totalTTC: $("totalTTC"),
    rowTVA: $("rowTVA"),
    vatSummary: $("vatSummary"),
  
    // Draft list
    savedList: $("savedList"),
    btnClearAll: $("btnClearAll"),
  
    // Footer placeholder links
    linkLegal: $("linkLegal"),
    linkPrivacy: $("linkPrivacy"),
    linkCookies: $("linkCookies"),
    linkSupport: $("linkSupport"),
  };
  
  let currentStep = 0;
  
  // ---- State (source of truth)
  let state = newEmptyState();
  
  // =========================================================
  // State / Defaults
  // =========================================================
  function newEmptyState() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
  
    return {
      version: 1,
      doc: {
        type: "devis", // devis | facture
        clientType: "pro", // pro | particulier
        vatMode: "assujetti", // assujetti | franchise | exonere
        specialVatText: "",
        reference: "",
        issueDate: `${yyyy}-${mm}-${dd}`,
        number: "",
        status: "brouillon", // brouillon | valide
        locked: false
      },
      seller: {
        name: "",
        siret: "",
        address: "",
        zip: "",
        city: "",
        email: "",
        phone: "",
        vatNumber: "",
        logoDataUrl: "" // base64
      },
      client: {
        name: "",
        siren: "",
        address: "",
        zip: "",
        city: "",
        email: "",
        phone: ""
      },
      quote: {
        validityDays: 30,
        depositPct: 0,
        acceptanceText: 'Bon pour accord, date et signature'
      },
      invoice: {
        dueDate: "",
        paymentTermDays: 30,
        latePenaltiesText: "",
        b2bIndemnityText: "Indemnité forfaitaire pour frais de recouvrement : 40 €.",
        paymentMethods: ""
      },
      notes: "",
      items: [] // {ref,title,desc,qty,unit,unitPriceHTCents,vatRate,discountPct}
    };
  }
  
  // =========================================================
  // Utils
  // =========================================================
  function toCents(input) {
    // Accepts "1200", "1200.50", "1 200,50", "1200,50"
    if (typeof input !== "string") input = String(input ?? "");
    const cleaned = input
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");
    if (!cleaned) return NaN;
    const value = Number(cleaned);
    if (!Number.isFinite(value)) return NaN;
    return Math.round(value * 100);
  }
  
  function clampNumber(n, min, max) {
    const x = Number(n);
    if (!Number.isFinite(x)) return min;
    return Math.min(max, Math.max(min, x));
  }
  
  function isDigits(str, len) {
    return new RegExp(`^\\d{${len}}$`).test((str ?? "").trim());
  }
  
  function formatPercent(p) {
    const n = Number(p);
    if (!Number.isFinite(n)) return "0%";
    return `${n.toString().replace(".", ",")}%`;
  }
  
  function safeText(s) {
    return (s ?? "").toString().trim();
  }

  function safePdfText(s) {
    return safeText(s)
      .replace(/\u00A0/g, " ")
      .replace(/\u202F/g, " ")
      .replace(/[“”]/g, "\"")
      .replace(/[’]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatEuro(cents) {
    return euro.format(cents / 100).replace(/\u00A0|\u202F/g, " ");
  }
  
  function yearFromIssueDate() {
    const d = state.doc.issueDate || "";
    const y = d.slice(0, 4);
    return /^\d{4}$/.test(y) ? y : String(new Date().getFullYear());
  }
  
  // =========================================================
  // UI binding
  // =========================================================
  function bindUI() {
    // Wizard nav
    ui.stepBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const go = Number(btn.dataset.go);
        goToStep(go);
      });
    });
  
    ui.btnBack.addEventListener("click", () => goToStep(currentStep - 1));
    ui.btnNext.addEventListener("click", () => goToStep(currentStep + 1));

    const btnBackMobile = document.getElementById("btnBackMobile");
    const btnNextMobile = document.getElementById("btnNextMobile");
    if (btnBackMobile && btnNextMobile) {
      btnBackMobile.addEventListener("click", () => goToStep(currentStep - 1));
      btnNextMobile.addEventListener("click", () => goToStep(currentStep + 1));
    }
  
    ui.btnNew.addEventListener("click", () => {
      state = newEmptyState();
      currentStep = 0;
      syncUIFromState();
      renderAll();
    });
  
    ui.btnSaveDraft.addEventListener("click", () => saveDraft());
  
    // Document
    ui.docTypeDevis.addEventListener("change", () => setDocType("devis"));
    ui.docTypeFacture.addEventListener("change", () => setDocType("facture"));
    ui.docReference.addEventListener("input", () => { state.doc.reference = ui.docReference.value; renderPreview(); });
    ui.clientTypePro.addEventListener("change", () => setClientType("pro"));
    ui.clientTypePart.addEventListener("change", () => setClientType("particulier"));
    ui.vatMode.addEventListener("change", () => {
      state.doc.vatMode = ui.vatMode.value;
      renderAll();
    });
    ui.specialVatText.addEventListener("input", () => {
      state.doc.specialVatText = ui.specialVatText.value;
      renderPreview();
    });
    ui.issueDate.addEventListener("change", () => {
      state.doc.issueDate = ui.issueDate.value;
      renderAll();
    });
  
    // Seller
    [
      ["sellerName", "name"],
      ["sellerSiret", "siret"],
      ["sellerAddress", "address"],
      ["sellerZip", "zip"],
      ["sellerCity", "city"],
      ["sellerEmail", "email"],
      ["sellerPhone", "phone"],
      ["sellerVatNumber", "vatNumber"],
    ].forEach(([uiKey, stateKey]) => {
      ui[uiKey].addEventListener("input", () => {
        state.seller[stateKey] = ui[uiKey].value;
        renderPreview();
        renderValidation();
      });
    });
  
    ui.sellerLogo.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const dataUrl = await readFileAsDataURL(file);
      state.seller.logoDataUrl = dataUrl;
      renderPreview();
    });
  
    // Client
    [
      ["clientName", "name"],
      ["clientSiren", "siren"],
      ["clientAddress", "address"],
      ["clientZip", "zip"],
      ["clientCity", "city"],
      ["clientEmail", "email"],
      ["clientPhone", "phone"],
    ].forEach(([uiKey, stateKey]) => {
      ui[uiKey].addEventListener("input", () => {
        state.client[stateKey] = ui[uiKey].value;
        renderPreview();
        renderValidation();
      });
    });
  
    // Items
    ui.itemVatRate.addEventListener("change", () => {
      ui.wrapCustomVatRate.classList.toggle("d-none", ui.itemVatRate.value !== "custom");
    });
  
    ui.btnAddItem.addEventListener("click", () => addItemFromInputs());
  
    // Conditions
    ui.quoteValidityDays.addEventListener("input", () => {
      state.quote.validityDays = clampNumber(ui.quoteValidityDays.value, 1, 3650);
      renderPreview();
      renderValidation();
    });
    ui.quoteDepositPct.addEventListener("input", () => {
      state.quote.depositPct = clampNumber(ui.quoteDepositPct.value, 0, 100);
      renderPreview();
    });
    ui.quoteAcceptanceText.addEventListener("input", () => {
      state.quote.acceptanceText = ui.quoteAcceptanceText.value;
      renderPreview();
    });
  
    ui.invoiceDueDate.addEventListener("change", () => {
      state.invoice.dueDate = ui.invoiceDueDate.value;
      renderPreview();
      renderValidation();
    });
    ui.invoicePaymentTermDays.addEventListener("input", () => {
      state.invoice.paymentTermDays = clampNumber(ui.invoicePaymentTermDays.value, 0, 3650);
      renderPreview();
    });
    ui.latePenaltiesText.addEventListener("input", () => {
      state.invoice.latePenaltiesText = ui.latePenaltiesText.value;
      renderPreview();
      renderValidation();
    });
    ui.b2bIndemnityText.addEventListener("input", () => {
      state.invoice.b2bIndemnityText = ui.b2bIndemnityText.value;
      renderPreview();
      renderValidation();
    });
    ui.paymentMethods.addEventListener("input", () => {
      state.invoice.paymentMethods = ui.paymentMethods.value;
      renderPreview();
    });
    ui.docNotes.addEventListener("input", () => {
      state.notes = ui.docNotes.value;
      renderPreview();
    });
  
    // Preview buttons
    ui.btnGenerateDraftPdf.addEventListener("click", () => generatePdf({ final: false }));
    ui.btnValidateAndPdf.addEventListener("click", () => validateAndGenerateFinal());
    ui.btnDuplicate.addEventListener("click", () => duplicateAsDraft());
    ui.btnConvertQuoteToInvoice.addEventListener("click", () => convertQuoteToInvoice());
  
    // Export / Import JSON
    ui.btnExportJson.addEventListener("click", () => exportJson());
    ui.importJsonFile.addEventListener("change", (e) => importJson(e));
  
    // Draft list
    ui.btnClearAll.addEventListener("click", () => clearAllDrafts());
  
    // Footer legal modal
    const legalLinks = [
      ui.linkLegal,
      ui.linkPrivacy,
      ui.linkCookies,
      ui.linkSupport,
      document.getElementById("linkAbout"),
      document.getElementById("linkPartners")
    ].filter(Boolean);
    legalLinks.forEach(a => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const key = a.dataset.legal;
        openLegalModal(key);
      });
    });
  }

  function openLegalModal(sectionKey) {
    const modalEl = document.getElementById("legalModal");
    const titleEl = document.getElementById("legalModalTitle");
    const bodyEl = document.getElementById("legalModalBody");
    if (!modalEl || !titleEl || !bodyEl) return;

    const content = window.LEGAL_CONTENT?.[sectionKey];
    if (!content) return;

    titleEl.textContent = content.title;
    bodyEl.innerHTML = content.html;

    const clearBtn = bodyEl.querySelector("#btnClearLocalData");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!confirm("Supprimer vos brouillons et compteurs locaux ?")) return;
        localStorage.removeItem(LS_KEYS.drafts);
        localStorage.removeItem(LS_KEYS.counters);
        renderSavedList();
        const msg = bodyEl.querySelector("#clearLocalDataMsg");
        if (msg) msg.textContent = "Données locales supprimées.";
      });
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
  
  function setDocType(type) {
    if (state.doc.locked) return;
    state.doc.type = type;
    renderAll();
  }
  
  function setClientType(type) {
    if (state.doc.locked) return;
    state.doc.clientType = type;
    renderAll();
  }
  
  function goToStep(n) {
    const next = clampNumber(n, 0, ui.steps.length - 1);
    currentStep = next;
    ui.steps.forEach(sec => sec.classList.add("d-none"));
    ui.steps.find(s => Number(s.dataset.step) === currentStep)?.classList.remove("d-none");
  
    ui.stepBtns.forEach(b => b.classList.toggle("active", Number(b.dataset.go) === currentStep));
  
    const pct = ((currentStep + 1) / ui.steps.length) * 100;
    ui.progressBar.style.width = `${pct}%`;
  
    ui.btnBack.disabled = currentStep === 0;
    ui.btnNext.disabled = currentStep === ui.steps.length - 1;

    const btnBackMobile = document.getElementById("btnBackMobile");
    const btnNextMobile = document.getElementById("btnNextMobile");
    if (btnBackMobile && btnNextMobile) {
      btnBackMobile.disabled = currentStep === 0;
      btnNextMobile.disabled = currentStep === ui.steps.length - 1;
    }
  
    // Re-render validation on preview step
    if (currentStep === 5) renderValidation();
  }
  
  async function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }
  
  // =========================================================
  // Rendering / Conditional UI
  // =========================================================
  function syncUIFromState() {
    // Document
    ui.docTypeDevis.checked = state.doc.type === "devis";
    ui.docTypeFacture.checked = state.doc.type === "facture";
    ui.docReference.value = state.doc.reference;
    ui.clientTypePro.checked = state.doc.clientType === "pro";
    ui.clientTypePart.checked = state.doc.clientType === "particulier";
    ui.vatMode.value = state.doc.vatMode;
    ui.issueDate.value = state.doc.issueDate;
    ui.docNumber.value = state.doc.number;
  
    ui.specialVatText.value = state.doc.specialVatText;
  
    // Seller
    ui.sellerName.value = state.seller.name;
    ui.sellerSiret.value = state.seller.siret;
    ui.sellerAddress.value = state.seller.address;
    ui.sellerZip.value = state.seller.zip;
    ui.sellerCity.value = state.seller.city;
    ui.sellerEmail.value = state.seller.email;
    ui.sellerPhone.value = state.seller.phone;
    ui.sellerVatNumber.value = state.seller.vatNumber;
  
    // Client
    ui.clientName.value = state.client.name;
    ui.clientSiren.value = state.client.siren;
    ui.clientAddress.value = state.client.address;
    ui.clientZip.value = state.client.zip;
    ui.clientCity.value = state.client.city;
    ui.clientEmail.value = state.client.email;
    ui.clientPhone.value = state.client.phone;
  
    // Conditions
    ui.quoteValidityDays.value = state.quote.validityDays;
    ui.quoteDepositPct.value = state.quote.depositPct;
    ui.quoteAcceptanceText.value = state.quote.acceptanceText;
  
    ui.invoiceDueDate.value = state.invoice.dueDate;
    ui.invoicePaymentTermDays.value = state.invoice.paymentTermDays;
    ui.latePenaltiesText.value = state.invoice.latePenaltiesText;
    ui.b2bIndemnityText.value = state.invoice.b2bIndemnityText;
    ui.paymentMethods.value = state.invoice.paymentMethods;
  
    ui.docNotes.value = state.notes;
  
    ui.docBadge.textContent = state.doc.locked ? "Validé (verrouillé)" : "Brouillon";
    ui.docBadge.className = `badge ${state.doc.locked ? "text-bg-success" : "text-bg-secondary"}`;
  
    // Locking behavior
    const lock = state.doc.locked;
    [
      ui.docTypeDevis, ui.docTypeFacture,
      ui.clientTypePro, ui.clientTypePart,
      ui.vatMode, ui.issueDate, ui.docReference,
      ui.specialVatText,
      ui.sellerName, ui.sellerSiret, ui.sellerAddress, ui.sellerZip, ui.sellerCity, ui.sellerEmail, ui.sellerPhone, ui.sellerVatNumber,
      ui.clientName, ui.clientSiren, ui.clientAddress, ui.clientZip, ui.clientCity, ui.clientEmail, ui.clientPhone,
      ui.quoteValidityDays, ui.quoteDepositPct, ui.quoteAcceptanceText,
      ui.invoiceDueDate, ui.invoicePaymentTermDays, ui.latePenaltiesText, ui.b2bIndemnityText, ui.paymentMethods,
      ui.docNotes,
      ui.itemRef, ui.itemTitle, ui.itemQty, ui.itemUnit, ui.itemDesc, ui.itemPriceHT, ui.itemVatRate, ui.customVatRate, ui.itemDiscount,
      ui.btnAddItem
    ].forEach(el => {
      if (!el) return;
      el.disabled = lock;
    });
  
    ui.btnValidateAndPdf.disabled = lock; // will be enabled only if validation OK (when unlocked)
  
    // Conditional labels
    ui.clientNameLabel.textContent = state.doc.clientType === "pro" ? "Société cliente" : "Nom du client";
  }
  
  function applyVisibilityRules() {
    // VAT mode visibility
    const vatMode = state.doc.vatMode;
    ui.wrapSellerVatNumber.classList.toggle("d-none", vatMode !== "assujetti");
    ui.wrapItemVatRate.classList.toggle("d-none", vatMode !== "assujetti");
    ui.thVat.classList.toggle("d-none", vatMode !== "assujetti");
    ui.rowTVA.classList.toggle("d-none", vatMode !== "assujetti");
    ui.wrapSpecialVatText.classList.toggle("d-none", vatMode !== "exonere");
  
    // custom VAT
    ui.wrapCustomVatRate.classList.toggle("d-none", ui.itemVatRate.value !== "custom" || vatMode !== "assujetti");
  
    // Client siren only for B2B
    ui.wrapClientSiren.classList.toggle("d-none", state.doc.clientType !== "pro");
  
    // Type-specific sections
    ui.wrapQuoteFields.classList.toggle("d-none", state.doc.type !== "devis");
    ui.wrapInvoiceFields.classList.toggle("d-none", state.doc.type !== "facture");
  
    // B2B-only invoice mention
    ui.wrapB2BIndemnity.classList.toggle("d-none", !(state.doc.type === "facture" && state.doc.clientType === "pro"));
  
    // Convert button only if devis
    ui.btnConvertQuoteToInvoice.classList.toggle("d-none", state.doc.type !== "devis");
  
    // If franchise: clear vat info on items for consistency
    if (vatMode !== "assujetti") {
      state.items = state.items.map(it => ({ ...it, vatRate: 0 }));
    }
  }
  
  function renderItemsTable() {
    const tb = ui.itemsTbody;
    tb.innerHTML = "";
  
    if (state.items.length === 0) {
      const tr = document.createElement("tr");
      tr.className = "text-muted";
      tr.innerHTML = `<td colspan="8">Aucune ligne pour l’instant.</td>`;
      tb.appendChild(tr);
      return;
    }
  
    state.items.forEach((it, idx) => {
      const lineHT = computeLineHTCents(it);
  
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(it.ref)}</td>
        <td>
          <div class="fw-semibold">${escapeHtml(it.title)}</div>
          <div class="small text-muted">${escapeHtml(it.desc)}</div>
        </td>
        <td class="text-end">${formatNumber(it.qty)}</td>
        <td>${escapeHtml(it.unit)}</td>
        <td class="text-end">${euro.format(it.unitPriceHTCents / 100)}</td>
        <td class="text-end ${state.doc.vatMode === "assujetti" ? "" : "d-none"}">${formatPercent(it.vatRate)}</td>
        <td class="text-end">${euro.format(lineHT / 100)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1" data-action="edit" data-idx="${idx}" ${state.doc.locked ? "disabled" : ""}>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" data-action="del" data-idx="${idx}" ${state.doc.locked ? "disabled" : ""}>
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tb.appendChild(tr);
    });
  
    tb.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const idx = Number(btn.dataset.idx);
        if (action === "del") {
          state.items.splice(idx, 1);
          renderAll();
        } else if (action === "edit") {
          loadItemToInputs(idx);
        }
      });
    });
  }
  
  function escapeHtml(s) {
    return (s ?? "").toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
  
  function formatNumber(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "0";
    // keep 2 decimals max for qty
    return x.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  }
  
  // =========================================================
  // Items logic
  // =========================================================
  function addItemFromInputs() {
    if (state.doc.locked) return;
  
    const title = safeText(ui.itemTitle.value);
    const ref = safeText(ui.itemRef.value);
    const desc = safeText(ui.itemDesc.value);
  
    const qty = Number(String(ui.itemQty.value).replace(",", "."));
    const qtySafe = Number.isFinite(qty) && qty > 0 ? qty : NaN;
  
    const unit = ui.itemUnit.value;
    const unitPriceCents = toCents(ui.itemPriceHT.value);
    const discountPct = clampNumber(ui.itemDiscount.value, 0, 100);
  
    let vatRate = 0;
    if (state.doc.vatMode === "assujetti") {
      if (ui.itemVatRate.value === "custom") {
        const cv = Number(String(ui.customVatRate.value).replace(",", "."));
        vatRate = Number.isFinite(cv) ? clampNumber(cv, 0, 100) : NaN;
      } else {
        vatRate = Number(ui.itemVatRate.value);
      }
    }
  
    // Minimal validation for adding an item
    const errors = [];
    if (!title) errors.push("Le libellé de la ligne est obligatoire.");
    if (!Number.isFinite(qtySafe)) errors.push("La quantité doit être un nombre > 0.");
    if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) errors.push("Le prix unitaire HT doit être un nombre valide.");
    if (state.doc.vatMode === "assujetti" && !Number.isFinite(vatRate)) errors.push("Le taux de TVA est invalide.");
  
    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }
  
    state.items.push({
      ref,
      title,
      desc,
      qty: qtySafe,
      unit,
      unitPriceHTCents: unitPriceCents,
      vatRate: state.doc.vatMode === "assujetti" ? vatRate : 0,
      discountPct
    });
  
    // reset inputs
    ui.itemRef.value = "";
    ui.itemTitle.value = "";
    ui.itemDesc.value = "";
    ui.itemQty.value = "1";
    ui.itemUnit.value = "u";
    ui.itemPriceHT.value = "";
    ui.itemVatRate.value = "20";
    ui.customVatRate.value = "";
    ui.wrapCustomVatRate.classList.add("d-none");
    ui.itemDiscount.value = "0";
  
    renderAll();
  }
  
  function loadItemToInputs(idx) {
    const it = state.items[idx];
    if (!it) return;
  
    ui.itemRef.value = it.ref;
    ui.itemTitle.value = it.title;
    ui.itemDesc.value = it.desc;
    ui.itemQty.value = String(it.qty).replace(".", ",");
    ui.itemUnit.value = it.unit;
    ui.itemPriceHT.value = String(it.unitPriceHTCents / 100).replace(".", ",");
    ui.itemDiscount.value = String(it.discountPct).replace(".", ",");
  
    if (state.doc.vatMode === "assujetti") {
      const known = ["20", "10", "5.5", "0"];
      if (known.includes(String(it.vatRate))) {
        ui.itemVatRate.value = String(it.vatRate);
        ui.wrapCustomVatRate.classList.add("d-none");
      } else {
        ui.itemVatRate.value = "custom";
        ui.customVatRate.value = String(it.vatRate).replace(".", ",");
        ui.wrapCustomVatRate.classList.remove("d-none");
      }
    }
  
    // Replace item on next add
    state.items.splice(idx, 1);
    renderAll();
  }
  
  // =========================================================
  // Calculations
  // =========================================================
  function computeLineHTCents(it) {
    const qty = Number(it.qty);
    const base = Math.round(qty * it.unitPriceHTCents);
    const discount = Math.round(base * (clampNumber(it.discountPct, 0, 100) / 100));
    return base - discount;
  }
  
  function computeTotals() {
    let totalHT = 0;
    let totalTVA = 0;
  
    // VAT breakdown
    const vatByRate = new Map(); // rate -> cents
  
    for (const it of state.items) {
      const lineHT = computeLineHTCents(it);
      totalHT += lineHT;
  
      if (state.doc.vatMode === "assujetti") {
        const rate = clampNumber(it.vatRate, 0, 100);
        const lineTVA = Math.round(lineHT * (rate / 100));
        totalTVA += lineTVA;
        vatByRate.set(rate, (vatByRate.get(rate) ?? 0) + lineTVA);
      }
    }
  
    const totalTTC = totalHT + totalTVA;
  
    return { totalHT, totalTVA, totalTTC, vatByRate };
  }
  
  function renderTotals() {
    const { totalHT, totalTVA, totalTTC, vatByRate } = computeTotals();
  
    ui.totalHT.textContent = euro.format(totalHT / 100);
    ui.totalTVA.textContent = euro.format(totalTVA / 100);
    ui.totalTTC.textContent = euro.format(totalTTC / 100);
  
    if (state.doc.vatMode !== "assujetti") {
      ui.vatSummary.textContent = state.doc.vatMode === "franchise"
        ? "TVA non applicable (franchise en base)."
        : (state.doc.vatMode === "exonere" ? "TVA : mention spéciale (manuel)." : "");
      return;
    }
  
    if (vatByRate.size === 0) {
      ui.vatSummary.textContent = "";
      return;
    }
  
    const parts = Array.from(vatByRate.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rate, cents]) => `${rate.toString().replace(".", ",")}% : ${euro.format(cents / 100)}`);
  
    ui.vatSummary.textContent = `Détail TVA — ${parts.join(" • ")}`;
  }
  
  // =========================================================
  // Validation (Checklist légale + cohérence)
  // =========================================================
  function validateState() {
    const errs = [];
  
    // Document type
    if (!["devis", "facture"].includes(state.doc.type)) errs.push("Type de document : choisir Devis ou Facture.");
  
    // Date
    if (!state.doc.issueDate) errs.push("Date d’émission manquante.");
  
    // Seller mandatory
    if (!safeText(state.seller.name)) errs.push("Vendeur : nom / raison sociale manquant.");
    if (!isDigits(state.seller.siret, 14)) errs.push("Vendeur : SIRET invalide (14 chiffres requis).");
    if (!safeText(state.seller.address)) errs.push("Vendeur : adresse manquante.");
    if (!isDigits(state.seller.zip, 5)) errs.push("Vendeur : code postal invalide (5 chiffres).");
    if (!safeText(state.seller.city)) errs.push("Vendeur : ville manquante.");
  
    // VAT consistency
    if (state.doc.vatMode === "assujetti") {
      // If assujetti, VAT number recommended but not strictly mandatory for all (keep as warning? here we keep non-blocking)
      // We'll not block on sellerVatNumber.
    }
    if (state.doc.vatMode === "exonere" && !safeText(state.doc.specialVatText)) {
      errs.push("TVA : en mode exonéré/mention spéciale, la mention TVA doit être renseignée.");
    }
  
    // Client
    if (!safeText(state.client.name)) errs.push("Client : nom/société manquant.");
    if (!safeText(state.client.address)) errs.push("Client : adresse manquante.");
    if (!isDigits(state.client.zip, 5)) errs.push("Client : code postal invalide (5 chiffres).");
    if (!safeText(state.client.city)) errs.push("Client : ville manquante.");
  
    if (state.doc.clientType === "pro") {
      if (!isDigits(state.client.siren, 9)) errs.push("Client PRO : SIREN invalide (9 chiffres).");
    }
  
    // Items
    if (state.items.length === 0) errs.push("Ajouter au moins une ligne (produit/service).");
    for (const [i, it] of state.items.entries()) {
      if (!safeText(it.title)) errs.push(`Ligne ${i + 1} : libellé manquant.`);
      if (!Number.isFinite(Number(it.qty)) || Number(it.qty) <= 0) errs.push(`Ligne ${i + 1} : quantité invalide.`);
      if (!Number.isFinite(Number(it.unitPriceHTCents)) || it.unitPriceHTCents < 0) errs.push(`Ligne ${i + 1} : prix unitaire HT invalide.`);
      if (state.doc.vatMode === "assujetti" && (!Number.isFinite(Number(it.vatRate)) || it.vatRate < 0 || it.vatRate > 100)) {
        errs.push(`Ligne ${i + 1} : taux TVA invalide.`);
      }
    }
  
    // Type-specific rules
    if (state.doc.type === "devis") {
      const v = Number(state.quote.validityDays);
      if (!Number.isFinite(v) || v <= 0) errs.push("Devis : durée de validité invalide.");
      // acceptance text recommended, not blocking
    }
  
    if (state.doc.type === "facture") {
      // Needs number once final - not blocking in draft, but final step will assign
      // Payment rules: either due date or term days
      const due = safeText(state.invoice.dueDate);
      const term = Number(state.invoice.paymentTermDays);
      if (!due && (!Number.isFinite(term) || term < 0)) errs.push("Facture : préciser une échéance (date) ou un délai valide.");
  
      // B2B extra
      if (state.doc.clientType === "pro") {
        if (!safeText(state.invoice.latePenaltiesText)) errs.push("Facture B2B : texte des pénalités de retard manquant.");
        if (!safeText(state.invoice.b2bIndemnityText)) errs.push("Facture B2B : mention indemnité forfaitaire (40€) manquante.");
      }
    }
  
    return errs;
  }
  
  function renderValidation() {
    const errs = validateState();
  
    ui.validationList.innerHTML = "";
    if (errs.length) {
      ui.validationAlert.classList.remove("d-none");
      ui.validationOk.classList.add("d-none");
  
      errs.forEach(e => {
        const li = document.createElement("li");
        li.textContent = e;
        ui.validationList.appendChild(li);
      });
  
      ui.btnValidateAndPdf.disabled = true;
    } else {
      ui.validationAlert.classList.add("d-none");
      ui.validationOk.classList.remove("d-none");
  
      ui.btnValidateAndPdf.disabled = state.doc.locked; // only enable if not locked
    }
  
    // Update preview summary too
    renderPreview();
  }
  
  // =========================================================
  // Preview
  // =========================================================
  function renderPreview() {
    const { totalHT, totalTVA, totalTTC } = computeTotals();
    const lines = state.items.length;
  
    const title = state.doc.type === "devis" ? "DEVIS" : "FACTURE";
  
    const vatLine = state.doc.vatMode === "assujetti"
      ? `TVA : ${euro.format(totalTVA / 100)}`
      : (state.doc.vatMode === "franchise"
        ? "TVA : non applicable (franchise)"
        : `TVA : mention spéciale`);
  
    const clientKind = state.doc.clientType === "pro" ? "Client PRO (B2B)" : "Client Particulier (B2C)";
    const lock = state.doc.locked ? "VERROUILLÉ" : "Brouillon";
  
    ui.previewText.innerHTML = `
      <div class="d-flex justify-content-between flex-wrap gap-2">
        <div>
          <div class="fw-semibold">${title} — ${lock}</div>
          <div class="text-muted">Date : ${escapeHtml(state.doc.issueDate || "-")} • Réf : ${escapeHtml(state.doc.reference || "-")}</div>
        </div>
        <div class="text-end">
          <div class="fw-semibold">${euro.format(totalTTC / 100)}</div>
          <div class="text-muted small">HT : ${euro.format(totalHT / 100)} • ${vatLine}</div>
        </div>
      </div>
  
      <hr class="my-2">
  
      <div class="row g-2 small">
        <div class="col-12 col-md-6">
          <div class="fw-semibold">Vendeur</div>
          <div>${escapeHtml(state.seller.name || "-")}</div>
          <div class="text-muted">${escapeHtml(state.seller.address || "")} ${escapeHtml(state.seller.zip || "")} ${escapeHtml(state.seller.city || "")}</div>
          <div class="text-muted">SIRET : ${escapeHtml(state.seller.siret || "-")}</div>
        </div>
        <div class="col-12 col-md-6">
          <div class="fw-semibold">${clientKind}</div>
          <div>${escapeHtml(state.client.name || "-")}</div>
          <div class="text-muted">${escapeHtml(state.client.address || "")} ${escapeHtml(state.client.zip || "")} ${escapeHtml(state.client.city || "")}</div>
          ${state.doc.clientType === "pro" ? `<div class="text-muted">SIREN : ${escapeHtml(state.client.siren || "-")}</div>` : ""}
        </div>
      </div>
  
      <hr class="my-2">
  
      <div class="small text-muted">Lignes : ${lines} • La conformité est validée dans cette étape.</div>
    `;
  }
  
  // =========================================================
  // PDF generation
  // =========================================================
  function buildPdfDefinition({ final }) {
    const title = state.doc.type === "devis" ? "DEVIS" : "FACTURE";
    const y = yearFromIssueDate();
    const number = state.doc.number || (final ? "—" : "Brouillon");
  
    const { totalHT, totalTVA, totalTTC, vatByRate } = computeTotals();
  
    const sellerLines = [
      safePdfText(state.seller.name),
      safePdfText(state.seller.address),
      `${safePdfText(state.seller.zip)} ${safePdfText(state.seller.city)}`.trim(),
      `SIRET : ${safePdfText(state.seller.siret)}`
    ].filter(Boolean);
  
    if (state.doc.vatMode === "assujetti" && safePdfText(state.seller.vatNumber)) {
      sellerLines.push(`TVA : ${safePdfText(state.seller.vatNumber)}`);
    }
  
    const clientLines = [
      safePdfText(state.client.name),
      safePdfText(state.client.address),
      `${safePdfText(state.client.zip)} ${safePdfText(state.client.city)}`.trim(),
    ].filter(Boolean);
  
    if (state.doc.clientType === "pro") {
      clientLines.push(`SIREN : ${safePdfText(state.client.siren)}`);
    }

  
    const itemsBody = [
      [
        { text: "Réf", style: "th" },
        { text: "Libellé", style: "th" },
        { text: "Qté", style: "th", alignment: "right" },
        { text: "PU HT", style: "th", alignment: "right" },
        ...(state.doc.vatMode === "assujetti" ? [{ text: "TVA", style: "th", alignment: "right" }] : []),
        { text: "Total HT", style: "th", alignment: "right" }
      ]
    ];
  
    state.items.forEach(it => {
      const lineHT = computeLineHTCents(it);
      const title = safePdfText(it.title);
      const desc = safePdfText(it.desc);
      const label = desc ? `${title} — ${desc}` : title;

      const row = [
        safePdfText(it.ref),
        { text: label, bold: true },
        { text: formatNumber(it.qty), alignment: "right" },
        { text: formatEuro(it.unitPriceHTCents), alignment: "right" },
        ...(state.doc.vatMode === "assujetti" ? [{ text: formatPercent(it.vatRate), alignment: "right" }] : []),
        { text: formatEuro(lineHT), alignment: "right" }
      ];
      itemsBody.push(row);
    });
  
    const vatNote = (() => {
      if (state.doc.vatMode === "franchise") return "TVA non applicable, art. 293 B du CGI.";
      if (state.doc.vatMode === "exonere") return safePdfText(state.doc.specialVatText) || "TVA : mention spéciale.";
      return "";
    })();
  
    const totalsStack = [
      { columns: [{ text: "Total HT", width: "*" }, { text: formatEuro(totalHT), width: "auto", alignment: "right" }] }
    ];
  
    if (state.doc.vatMode === "assujetti") {
      totalsStack.push(
        { columns: [{ text: "TVA", width: "*" }, { text: formatEuro(totalTVA), width: "auto", alignment: "right" }] },
        { columns: [{ text: "Total TTC", width: "*" }, { text: formatEuro(totalTTC), width: "auto", alignment: "right", bold: true }] }
      );
    } else {
      totalsStack.push(
        { columns: [{ text: "Total TTC", width: "*" }, { text: formatEuro(totalTTC), width: "auto", alignment: "right", bold: true }] }
      );
    }
  
    const extraConditions = [];
    if (state.doc.type === "devis") {
      extraConditions.push(
        { text: `Validité : ${state.quote.validityDays} jour(s)`, margin: [0, 8, 0, 0] },
      );
      if (Number(state.quote.depositPct) > 0) {
        extraConditions.push({ text: `Acompte : ${state.quote.depositPct}%`, margin: [0, 4, 0, 0] });
      }
    }
  
    if (state.doc.type === "facture") {
      const due = safePdfText(state.invoice.dueDate);
      if (due) extraConditions.push({ text: `Échéance : ${due}`, margin: [0, 4, 0, 0] });
      else extraConditions.push({ text: `Délai de paiement : ${state.invoice.paymentTermDays} jour(s)`, margin: [0, 4, 0, 0] });
  
      if (safePdfText(state.invoice.paymentMethods)) {
        extraConditions.push({ text: `Moyens de paiement : ${safePdfText(state.invoice.paymentMethods)}`, margin: [0, 2, 0, 0] });
      }
  
      if (state.doc.clientType === "pro") {
        extraConditions.push(
          { text: `Pénalités de retard : ${safePdfText(state.invoice.latePenaltiesText) || "—"}`, margin: [0, 4, 0, 0] },
          { text: safePdfText(state.invoice.b2bIndemnityText) || "Indemnité forfaitaire pour frais de recouvrement : 40 €.", margin: [0, 2, 0, 0] },
        );
      }
    }
  
    const vatBreakdownText = (state.doc.vatMode === "assujetti" && vatByRate.size > 0)
      ? "Détail TVA : " + Array.from(vatByRate.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([rate, cents]) => `${rate.toString().replace(".", ",")}% = ${formatEuro(cents)}`)
        .join(" • ")
      : "";
  
    const watermark = final ? null : { text: "BROUILLON", color: "gray", opacity: 0.2, bold: true, italics: false };
  
    return {
      pageMargins: [40, 40, 40, 70],
      watermark,
      content: [
        {
          columns: [
            state.seller.logoDataUrl
              ? { image: state.seller.logoDataUrl, width: 70 }
              : { text: "" },
            {
              stack: [
                { text: title, style: "title" },
                { text: final ? `N° : ${number}` : `N° : (attribué à la validation)`, style: "sub" },
                { text: `Date : ${state.doc.issueDate || ""}`, style: "sub" },
                state.doc.reference ? { text: `Réf : ${state.doc.reference}`, style: "sub" } : {}
              ],
              alignment: "right"
            }
          ]
        },
  
        { text: " ", margin: [0, 10] },
  
        {
          columns: [
            {
              stack: [
                { text: "Vendeur", style: "h" },
                { text: sellerLines.join("\n"), margin: [0, 6, 0, 0], lineHeight: 1.2 }
              ],
              margin: [0, 0, 0, 6]
            },
            {
              stack: [
                { text: "Client", style: "h" },
                { text: clientLines.join("\n"), margin: [0, 6, 0, 0], lineHeight: 1.2 }
              ],
              margin: [0, 0, 0, 6]
            }
          ]
        },
  
        { text: " ", margin: [0, 10] },
  
        {
          table: {
            headerRows: 1,
            widths: state.doc.vatMode === "assujetti"
              ? ["auto", "*", "auto", "auto", "auto", "auto"]
              : ["auto", "*", "auto", "auto", "auto"],
            body: itemsBody
          },
          layout: "lightHorizontalLines"
        },
  
        { text: " ", margin: [0, 10] },
  
        {
          columns: [
            {
              width: "*",
              stack: [
                vatNote ? { text: vatNote, italics: true, color: "#444" } : {},
                vatBreakdownText ? { text: vatBreakdownText, fontSize: 9, color: "#555", margin: [0, 4, 0, 0] } : {},
                state.notes ? { text: `Notes : ${safePdfText(state.notes)}`, margin: [0, 6, 0, 0] } : {}
              ]
            },
            {
              width: 220,
              stack: totalsStack,
              style: "totalsBox"
            }
          ]
        },
  
        { text: " ", margin: [0, 10] },
        ...extraConditions
      ],
      footer: (currentPage, pageCount) => {
        if (state.doc.type !== "devis") return "";
        const acceptance = safePdfText(state.quote.acceptanceText) || "Bon pour accord, date et signature";
        return {
          margin: [40, 0, 40, 20],
          stack: [
            { text: acceptance, italics: true, lineHeight: 1.2 },
            { text: "Signature : ____________________________", margin: [0, 6, 0, 0] }
          ]
        };
      },
      styles: {
        title: { fontSize: 20, bold: true },
        sub: { fontSize: 10, color: "#555" },
        h: { fontSize: 11, bold: true },
        th: { bold: true, fillColor: "#f2f2f2" },
        totalsBox: { margin: [0, 0, 0, 0] }
      },
      defaultStyle: { fontSize: 10 }
    };
  }
  
  function generatePdf({ final }) {
    const def = buildPdfDefinition({ final });
    const title = state.doc.type === "devis" ? "DEVIS" : "FACTURE";
    const baseName = `${title}-${state.doc.number || "BROUILLON"}-${state.doc.issueDate || ""}`.replaceAll("/", "-");
    pdfMake.createPdf(def).download(`${baseName}.pdf`);
  }
  
  function validateAndGenerateFinal() {
    if (state.doc.locked) {
      alert("Document déjà validé.");
      return;
    }
  
    const errs = validateState();
    if (errs.length) {
      goToStep(5);
      renderValidation();
      return;
    }
  
    // Assign number & lock
    state.doc.number = generateNextNumber();
    state.doc.status = "valide";
    state.doc.locked = true;
  
    syncUIFromState();
    applyVisibilityRules();
    renderItemsTable();
    renderTotals();
    renderValidation();
  
    generatePdf({ final: true });
  }
  
  function generateNextNumber() {
    // Local counters per year and doc type
    const counters = loadCounters();
    const y = yearFromIssueDate();
    const typeKey = state.doc.type === "facture" ? "FAC" : "DEV";
    const key = `${typeKey}-${y}`;
  
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    saveCounters(counters);
  
    const padded = String(next).padStart(4, "0");
    return `${typeKey}-${y}-${padded}`;
  }
  
  // =========================================================
  // Draft storage
  // =========================================================
  function loadDrafts() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.drafts) || "[]");
    } catch {
      return [];
    }
  }
  
  function saveDrafts(list) {
    try {
      localStorage.setItem(LS_KEYS.drafts, JSON.stringify(list));
      return { ok: true };
    } catch (err) {
      return { ok: false, err };
    }
  }
  
  function saveDraft() {
    const drafts = loadDrafts();

    const stamp = new Date().toISOString();
    const id = crypto?.randomUUID?.() || `id_${Math.random().toString(16).slice(2)}`;

    // If already has a draftId in state, update it
    const existingId = state._draftId;
    const payload = {
      id: existingId || id,
      savedAt: stamp,
      title: buildDraftTitle(),
      data: state
    };

    if (!existingId) state._draftId = payload.id;

    const idx = drafts.findIndex(d => d.id === payload.id);
    if (idx >= 0) drafts[idx] = payload;
    else drafts.unshift(payload);

    let res = saveDrafts(drafts);
    if (!res.ok) {
      // Likely quota issue: retry without embedded logo
      const sanitized = JSON.parse(JSON.stringify(payload));
      if (sanitized?.data?.seller?.logoDataUrl) {
        sanitized.data.seller.logoDataUrl = "";
        const draftsSansLogo = drafts.map(d => d.id === payload.id ? sanitized : d);
        res = saveDrafts(draftsSansLogo);
        if (res.ok) {
          renderSavedList();
          alert("Brouillon sauvegardé (logo non enregistré : stockage local plein).");
          return;
        }
      }
      alert("Impossible de sauvegarder le brouillon (stockage local indisponible).");
      return;
    }

    renderSavedList();
    alert("Brouillon sauvegardé en local.");
  }
  
  function buildDraftTitle() {
    const t = state.doc.type === "facture" ? "Facture" : "Devis";
    const c = safeText(state.client.name) || "Sans client";
    const d = state.doc.issueDate || "";
    return `${t} — ${c} — ${d}`;
  }
  
  function renderSavedList() {
    const drafts = loadDrafts();
    ui.savedList.innerHTML = "";
  
    if (!drafts.length) {
      ui.savedList.innerHTML = `<div class="text-muted small">Aucun brouillon sauvegardé.</div>`;
      return;
    }
  
    drafts.slice(0, 20).forEach(d => {
      const el = document.createElement("div");
      el.className = "border rounded p-2";
      el.innerHTML = `
        <div class="d-flex justify-content-between gap-2">
          <div class="small">
            <div class="fw-semibold">${escapeHtml(d.title || "Brouillon")}</div>
            <div class="text-muted">Sauvé : ${escapeHtml(new Date(d.savedAt).toLocaleString("fr-FR"))}</div>
          </div>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" data-act="load" data-id="${d.id}">
              <i class="bi bi-box-arrow-in-down"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" data-act="del" data-id="${d.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
      ui.savedList.appendChild(el);
    });
  
    ui.savedList.querySelectorAll("button[data-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.act;
        const id = btn.dataset.id;
        if (act === "load") loadDraft(id);
        if (act === "del") deleteDraft(id);
      });
    });
  }
  
  function loadDraft(id) {
    const drafts = loadDrafts();
    const found = drafts.find(d => d.id === id);
    if (!found) return;
  
    state = found.data;
    state._draftId = id; // keep link to update same draft
    currentStep = 0;
  
    syncUIFromState();
    renderAll();
    alert("Brouillon chargé.");
  }
  
  function deleteDraft(id) {
    const drafts = loadDrafts().filter(d => d.id !== id);
    saveDrafts(drafts);
    renderSavedList();
  }
  
  function clearAllDrafts() {
    if (!confirm("Supprimer tous les brouillons locaux ?")) return;
    saveDrafts([]);
    renderSavedList();
  }
  
  // =========================================================
  // Counters
  // =========================================================
  function loadCounters() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.counters) || "{}");
    } catch {
      return {};
    }
  }
  function saveCounters(obj) {
    localStorage.setItem(LS_KEYS.counters, JSON.stringify(obj));
  }
  
  // =========================================================
  // Convert / Duplicate / JSON
  // =========================================================
  function duplicateAsDraft() {
    // Copy state but unlock & reset number
    const copy = JSON.parse(JSON.stringify(state));
    copy.doc.number = "";
    copy.doc.status = "brouillon";
    copy.doc.locked = false;
    delete copy._draftId;
  
    state = copy;
    currentStep = 0;
    syncUIFromState();
    renderAll();
    alert("Document dupliqué en brouillon.");
  }
  
  function convertQuoteToInvoice() {
    if (state.doc.type !== "devis") return;
    if (state.doc.locked) {
      alert("Duplique le devis si tu veux le convertir (document verrouillé).");
      return;
    }
  
    state.doc.type = "facture";
    // Keep same date; invoice settings default if missing
    if (!state.invoice.paymentTermDays) state.invoice.paymentTermDays = 30;
  
    renderAll();
    alert("Converti en facture (brouillon). Vérifie les conditions de paiement.");
  }
  
  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-${state.doc.type}-${state.doc.issueDate || "date"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function importJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        // minimal guard
        if (!obj || !obj.doc || !obj.seller || !obj.client || !Array.isArray(obj.items)) {
          alert("Fichier JSON invalide.");
          return;
        }
        state = obj;
        currentStep = 0;
        syncUIFromState();
        renderAll();
        alert("Import JSON OK.");
      } catch {
        alert("Impossible de lire le JSON.");
      } finally {
        ui.importJsonFile.value = "";
      }
    };
    reader.readAsText(file);
  }
  
  // =========================================================
  // Render orchestration
  // =========================================================
  function renderAll() {
    syncUIFromState();
    applyVisibilityRules();
    renderItemsTable();
    renderTotals();
    renderPreview();
    renderSavedList();
  
    // Keep wizard aligned
    goToStep(currentStep);
  
    // When on preview step, refresh validation
    if (currentStep === 5) renderValidation();
  }
  
  function init() {
    bindUI();
    renderSavedList();
  
    // Load initial state into inputs
    syncUIFromState();
    applyVisibilityRules();
    renderAll();
  
    // Default doc type checked
    if (state.doc.type === "devis") ui.docTypeDevis.checked = true;
    else ui.docTypeFacture.checked = true;
  }
  
  init();
  