# HexaFact — Générateur de Devis & Factures

HexaFact est une application simple qui vous permet de créer des devis et des factures au format PDF en utilisant JavaScript et la bibliothèque pdfMake. Vous pouvez ajouter des produits avec des détails tels que la référence, le titre, le prix et le descriptif, puis générer un document au format PDF avec ces informations.

## Caractéristiques

- Ajoutez des produits avec des détails tels que la référence, le titre, le prix et le descriptif.
- Affichez la liste des produits avec la possibilité de les modifier ou de les supprimer.
- Générez une facture au format PDF avec un en-tête d'entreprise, les détails du client, la liste des produits, et les montants totaux.
- Personnalisez l'en-tête de l'entreprise en ajoutant un logo.
- Choisissez le type de document (par exemple, facture, devis) et sa référence.
- Calculez automatiquement les montants HT, TVA et TTC en fonction des produits ajoutés.
- Paramétrez le taux de TVA.
- Interface utilisateur conviviale et réactive.

## Configuration

HexaFact est configuré à l'aide de JavaScript. Vous pouvez personnaliser les styles, l'en-tête de l'entreprise et d'autres paramètres directement dans le code source.

## Exigences

Aucune exigence particulière n'est nécessaire pour exécuter cette application, car tout est basé sur des technologies web standard.

## Installation

1. Clonez ce dépôt :

   ```shell
   git clone [https://github.com/votreutilisateur/generateur-de-factures-web.git](https://github.com/DjennadRany/factureDevis.git)https://github.com/DjennadRany/factureDevis.git

2. Utilisé index.html :
   1. Ouvrez le fichier index.html dans un navigateur web.
   2. Remplissez les détails de l'entreprise, du client, ajoutez des produits et générez une facture au format PDF.

## Tests E2E (Playwright)

### Prérequis
- Node.js 18+

### Installation
```shell
npm install
npx playwright install
```

### Lancer les tests
```shell
npm run test:e2e
```

### Mode UI
```shell
npm run test:e2e:ui
```

## Crédits :
   pdfMake - Bibliothèque JavaScript pour la génération de PDF dans le navigateur.

## Licence
   Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.




