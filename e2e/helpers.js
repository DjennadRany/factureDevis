const SELLER_PME = {
  name: "HEXAFACT SARL",
  siret: "73282932000074",
  address: "10 Rue de la Paix",
  zip: "75002",
  city: "Paris",
  vatNumber: "FR34732829320"
};

const SELLER_MICRO = {
  name: "AUTO ENTREPRENEUR TEST",
  siret: "81234567890123",
  address: "5 Avenue Victor Hugo",
  zip: "69006",
  city: "Lyon",
  vatNumber: ""
};

const CLIENT_PRO = {
  name: "CLIENT PRO SAS",
  siren: "552100554",
  address: "20 Boulevard Voltaire",
  zip: "75011",
  city: "Paris"
};

const CLIENT_PART = {
  name: "Jean Martin",
  address: "3 Rue Nationale",
  zip: "59000",
  city: "Lille"
};

const LINE_1 = {
  ref: "PRESTA-1",
  title: "Prestation conseil",
  qty: 1,
  unit: "forfait",
  unitPrice: 1200,
  vatRate: 20,
  discount: 0
};

const LINE_2 = {
  ref: "SERV-2",
  title: "Maintenance",
  qty: 2,
  unit: "h",
  unitPrice: 80,
  vatRate: 10,
  discount: 10
};

function parseEuro(text) {
  const cleaned = text
    .replace(/\s/g, "")
    .replace("€", "")
    .replace(",", ".");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function toCents(value) {
  return Math.round(Number(value) * 100);
}

function calcTotals(lines) {
  let totalHT = 0;
  let totalTVA = 0;
  const vatByRate = new Map();

  lines.forEach((line) => {
    const ht = line.qty * line.unitPrice * (1 - (line.discount || 0) / 100);
    const htCents = toCents(ht);
    totalHT += htCents;

    const tva = ht * (line.vatRate || 0) / 100;
    const tvaCents = toCents(tva);
    totalTVA += tvaCents;

    const rateKey = line.vatRate || 0;
    vatByRate.set(rateKey, (vatByRate.get(rateKey) || 0) + tvaCents);
  });

  return {
    totalHT,
    totalTVA,
    totalTTC: totalHT + totalTVA,
    vatByRate
  };
}

async function gotoApp(page) {
  await page.addInitScript(() => {
    window.__hexaFactTest = true;
  });
  await page.goto("/index.html");
}

async function mockPdf(page) {
  await page.evaluate(() => {
    window.__pdfCalls = [];
    window.pdfMake = {
      createPdf: (def) => ({
        download: (name) => {
          window.__pdfCalls.push({ def, name });
        }
      })
    };
  });
}

async function goToStep(page, label) {
  await page.locator(".step-btn", { hasText: label }).click();
}

async function clickLabelFor(page, id) {
  await page.locator(`label[for="${id}"]`).click();
}

async function fillSeller(page, data) {
  await page.getByTestId("seller-name").fill(data.name);
  await page.getByTestId("seller-siret").fill(data.siret);
  await page.getByTestId("seller-address").fill(data.address);
  await page.getByTestId("seller-zip").fill(data.zip);
  await page.getByTestId("seller-city").fill(data.city);
  if (data.vatNumber !== undefined) {
    const vatInput = page.getByTestId("seller-vat-number");
    if (await vatInput.isVisible()) {
      await vatInput.fill(data.vatNumber);
    }
  }
}

async function fillClientPro(page, data) {
  await page.getByTestId("client-name").fill(data.name);
  await page.getByTestId("client-siren").fill(data.siren);
  await page.getByTestId("client-address").fill(data.address);
  await page.getByTestId("client-zip").fill(data.zip);
  await page.getByTestId("client-city").fill(data.city);
}

async function fillClientPart(page, data) {
  await page.getByTestId("client-name").fill(data.name);
  await page.getByTestId("client-address").fill(data.address);
  await page.getByTestId("client-zip").fill(data.zip);
  await page.getByTestId("client-city").fill(data.city);
}

async function addLine(page, line) {
  await page.getByTestId("item-ref").fill(line.ref);
  await page.getByTestId("item-title").fill(line.title);
  await page.getByTestId("item-qty").fill(String(line.qty));
  await page.getByTestId("item-unit").selectOption(line.unit);
  await page.getByTestId("item-price-ht").fill(String(line.unitPrice));
  const vatSelect = page.getByTestId("item-vat-rate");
  if (await vatSelect.isVisible()) {
    await vatSelect.selectOption(String(line.vatRate));
  }
  await page.getByTestId("item-discount").fill(String(line.discount));
  await page.getByTestId("add-item").click();
}

module.exports = {
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
};
