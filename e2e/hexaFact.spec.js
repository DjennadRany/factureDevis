const { test, expect } = require("@playwright/test");
const {
  SELLER_PME,
  SELLER_MICRO,
  CLIENT_PRO,
  CLIENT_PART,
  LINE_1,
  LINE_2,
  parseEuro,
  calcTotals,
  gotoApp,
  mockPdf,
  goToStep,
  clickLabelFor,
  fillSeller,
  fillClientPro,
  fillClientPart,
  addLine
} = require("./helpers");

async function getTotals(page) {
  const ht = parseEuro(await page.getByTestId("total-ht").innerText());
  const tva = parseEuro(await page.getByTestId("total-tva").innerText());
  const ttc = parseEuro(await page.getByTestId("total-ttc").innerText());
  return { ht, tva, ttc };
}

test.beforeEach(async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await gotoApp(page);
});

test("A. Devis PME assujetti TVA PRO 2 lignes PDF brouillon", async ({ page }) => {
  await clickLabelFor(page, "clientTypePro");
  await page.getByTestId("vat-mode").selectOption("assujetti");

  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_PME);

  await goToStep(page, "Client");
  await fillClientPro(page, CLIENT_PRO);

  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_1, vatRate: 20, discount: 0 });
  await addLine(page, { ...LINE_2, vatRate: 20, discount: 0 });

  const expected = calcTotals([
    { ...LINE_1, vatRate: 20, discount: 0 },
    { ...LINE_2, vatRate: 20, discount: 0 }
  ]);

  const totals = await getTotals(page);
  expect(Math.round(totals.ht * 100)).toBe(expected.totalHT);
  expect(Math.round(totals.tva * 100)).toBe(expected.totalTVA);
  expect(Math.round(totals.ttc * 100)).toBe(expected.totalTTC);

  await goToStep(page, "Aperçu");
  await mockPdf(page);
  await page.getByTestId("pdf-draft").click();

  const pdfCalls = await page.evaluate(() => window.__pdfCalls);
  expect(pdfCalls.length).toBe(1);
  const content = JSON.stringify(pdfCalls[0].def);
  expect(content).toContain("DEVIS");
  expect(content).toContain(SELLER_PME.siret);
  expect(content).toContain(CLIENT_PRO.siren);
});

test("B. Devis micro franchise client particulier mention TVA non applicable", async ({ page }) => {
  await clickLabelFor(page, "clientTypePart");
  await page.getByTestId("vat-mode").selectOption("franchise");

  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_MICRO);

  await goToStep(page, "Client");
  await fillClientPart(page, CLIENT_PART);

  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_1, vatRate: 0, discount: 0 });

  await expect(page.getByTestId("row-tva")).toBeHidden();
  const totals = await getTotals(page);
  expect(Math.round(totals.tva * 100)).toBe(0);
  expect(Math.round(totals.ttc * 100)).toBe(Math.round(totals.ht * 100));

  await goToStep(page, "Aperçu");
  await mockPdf(page);
  await page.getByTestId("pdf-draft").click();
  const pdfCalls = await page.evaluate(() => window.__pdfCalls);
  expect(JSON.stringify(pdfCalls[0].def)).toContain("TVA non applicable");
});

test("C. Facture assujetti PRO avec pénalités et indemnité 40€ PDF final", async ({ page }) => {
  await clickLabelFor(page, "docTypeFacture");
  await clickLabelFor(page, "clientTypePro");
  await page.getByTestId("vat-mode").selectOption("assujetti");

  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_PME);

  await goToStep(page, "Client");
  await fillClientPro(page, CLIENT_PRO);

  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_1, vatRate: 20, discount: 0 });

  await goToStep(page, "Conditions");
  await page.getByTestId("invoice-due-date").fill("2026-02-15");
  await page.getByTestId("invoice-late-penalties").fill("Pénalités: 3x taux légal");
  await page.getByTestId("invoice-b2b-indemnity").fill("Indemnité forfaitaire pour frais de recouvrement : 40 €.");

  await goToStep(page, "Aperçu");
  await expect(page.getByTestId("pdf-final")).toBeEnabled();
  await mockPdf(page);
  await page.getByTestId("pdf-final").click();

  const pdfCalls = await page.evaluate(() => window.__pdfCalls);
  const content = JSON.stringify(pdfCalls[0].def);
  expect(content).toContain("FACTURE");
  expect(content).toContain("Indemnité forfaitaire");
  const docNumber = await page.getByTestId("doc-number").inputValue();
  expect(docNumber).toMatch(/FAC-/);
});

test("D. Facture client particulier sans indemnité 40€", async ({ page }) => {
  await clickLabelFor(page, "docTypeFacture");
  await clickLabelFor(page, "clientTypePart");

  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_PME);

  await goToStep(page, "Client");
  await fillClientPart(page, CLIENT_PART);

  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_1, vatRate: 20, discount: 0 });

  await goToStep(page, "Conditions");
  await expect(page.getByTestId("wrap-b2b-indemnity")).toBeHidden();

  await goToStep(page, "Aperçu");
  await mockPdf(page);
  await page.getByTestId("pdf-draft").click();
  const pdfCalls = await page.evaluate(() => window.__pdfCalls);
  expect(JSON.stringify(pdfCalls[0].def)).not.toContain("Indemnité forfaitaire");
});

test("E. Conversion devis → facture conserve lignes + totaux", async ({ page }) => {
  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_PME);

  await goToStep(page, "Client");
  await fillClientPro(page, CLIENT_PRO);

  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_1, vatRate: 20, discount: 0 });
  await addLine(page, { ...LINE_2, vatRate: 10, discount: 10 });

  const totalsBefore = await getTotals(page);
  await goToStep(page, "Aperçu");
  await page.getByTestId("convert-quote-invoice").click();
  await expect(page.getByTestId("doc-type-facture")).toBeChecked();

  const totalsAfter = await getTotals(page);
  expect(totalsAfter.ht).toBe(totalsBefore.ht);
  expect(totalsAfter.tva).toBe(totalsBefore.tva);
});

test("F. TVA assujetti → franchise : TVA 0, colonnes masquées", async ({ page }) => {
  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_1, vatRate: 20, discount: 0 });

  await goToStep(page, "Document");
  await page.getByTestId("vat-mode").selectOption("franchise");
  await expect(page.getByTestId("row-tva")).toBeHidden();

  const totals = await getTotals(page);
  expect(Math.round(totals.tva * 100)).toBe(0);
});

test("G. Multi-taux TVA 20% + 10% : récap TVA OK", async ({ page }) => {
  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_1, vatRate: 20, discount: 0 });
  await addLine(page, { ...LINE_2, vatRate: 10, discount: 0 });

  const summary = await page.getByTestId("vat-summary").innerText();
  expect(summary).toContain("20");
  expect(summary).toContain("10");
});

test("H. Remise ligne 10% : HT/TVA/TTC corrects", async ({ page }) => {
  await goToStep(page, "Lignes");
  await addLine(page, { ...LINE_2, vatRate: 10, discount: 10 });

  const expected = calcTotals([{ ...LINE_2, vatRate: 10, discount: 10 }]);
  const totals = await getTotals(page);
  expect(Math.round(totals.ht * 100)).toBe(expected.totalHT);
  expect(Math.round(totals.tva * 100)).toBe(expected.totalTVA);
});

test("I. Validation bloquante si SIRET vendeur invalide", async ({ page }) => {
  await goToStep(page, "Vendeur");
  await fillSeller(page, { ...SELLER_PME, siret: "123" });

  await goToStep(page, "Aperçu");
  await expect(page.getByTestId("validation-alert")).toBeVisible();
  const errors = await page.getByTestId("validation-list").innerText();
  expect(errors).toContain("SIRET");
  await expect(page.getByTestId("pdf-final")).toBeDisabled();
});

test("J. Validation bloquante B2B si SIREN client manquant", async ({ page }) => {
  await clickLabelFor(page, "clientTypePro");
  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_PME);

  await goToStep(page, "Client");
  await fillClientPro(page, { ...CLIENT_PRO, siren: "" });

  await goToStep(page, "Aperçu");
  await expect(page.getByTestId("validation-alert")).toBeVisible();
  const errors = await page.getByTestId("validation-list").innerText();
  expect(errors).toContain("SIREN");
});

test("K. Sauvegarde brouillon localStorage", async ({ page }) => {
  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_PME);
  await goToStep(page, "Client");
  await fillClientPro(page, CLIENT_PRO);

  await page.getByTestId("save-draft").click();
  await page.reload();
  await expect(page.getByTestId("saved-list")).toContainText("Devis");

  await page.locator("button[data-act=\"load\"]").first().click();
  await expect(page.getByTestId("seller-name")).toHaveValue(SELLER_PME.name);
});

test("L. Export / Import JSON conserve l'état", async ({ page, context }) => {
  await goToStep(page, "Vendeur");
  await fillSeller(page, SELLER_PME);
  await goToStep(page, "Client");
  await fillClientPro(page, CLIENT_PRO);

  await goToStep(page, "Aperçu");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-json").click();
  const download = await downloadPromise;
  const jsonPath = await download.path();

  const newPage = await context.newPage();
  await gotoApp(newPage);
  await newPage.getByTestId("import-json").setInputFiles(jsonPath);
  await expect(newPage.getByTestId("seller-name")).toHaveValue(SELLER_PME.name);
  await expect(newPage.getByTestId("client-name")).toHaveValue(CLIENT_PRO.name);
});
