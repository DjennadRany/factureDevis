var produits = [];
var logoDataUrl = null;

// Fonction pour gérer le changement de logo de l'entreprise
document.getElementById('logoEntreprise').addEventListener('change', function (event) {
  var file = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    logoDataUrl = e.target.result;
  };
  reader.readAsDataURL(file);
});

function ajouterProduit() {
  var titreProduit = document.getElementById('titreProduit').value;
  var prix = parseFloat(document.getElementById('prix').value);
  var referenceProduit = document.getElementById('referenceProduit').value;
  var descriptif = document.getElementById('descriptif').value;

  if (!titreProduit) {
    alert("Veuillez saisir un titre pour le produit.");
    return;
  }

  if (isNaN(prix) || prix <= 0) {
    alert("Veuillez saisir un prix valide supérieur à zéro.");
    return;
  }

  if (!referenceProduit) {
    alert("Veuillez saisir une référence pour le produit.");
    return;
  }

  if (!descriptif) {
    alert("Veuillez saisir un descriptif pour le produit.");
    return;
  }

  // Crée un identifiant unique pour le produit (par exemple, basé sur la date actuelle)
  var produitId = new Date().getTime();

  var produit = {
    id: produitId,
    titre: titreProduit,
    prix: prix,
    reference: referenceProduit,
    descriptif: descriptif
  };

  produits.push(produit);

  // Ajouter le produit à la liste des produits affichée
  var listeProduits = document.getElementById('listeProduits');
  var newRow = listeProduits.insertRow(-1);
  var cell0 = newRow.insertCell(0);
  var cell1 = newRow.insertCell(1);
  var cell2 = newRow.insertCell(2);
  var cell3 = newRow.insertCell(3);
  var cell4 = newRow.insertCell(4); // Cellule pour le bouton Supprimer
  cell0.innerHTML = referenceProduit;
  cell1.innerHTML = titreProduit;
  cell2.innerHTML = prix + " €";
  cell3.innerHTML = descriptif;
  cell4.innerHTML = '<button onclick="supprimerProduit(' + produitId + ')">Supprimer</button>';

  // Réinitialiser les champs de saisie
  document.getElementById('titreProduit').value = "";
  document.getElementById('prix').value = "";
  document.getElementById('referenceProduit').value = "";
  document.getElementById('descriptif').value = "";
}

function supprimerProduit(produitId) {
    var index = produits.findIndex(function (produit) {
      return produit.id === produitId;
    });
  
    if (index !== -1) {
      produits.splice(index, 1); // Supprime le produit du tableau
  
      var table = document.getElementById('listeProduits');
      table.deleteRow(index); // Supprime la ligne de la table
    }
  }
  
  

function genererDocument() {
  if (produits.length === 0) {
    alert("Ajoutez au moins un produit avant de générer le document.");
    return;
  }

  var numeroDocument = '';
  var dateDocument = new Date().toLocaleDateString();
  var typeDocument = document.querySelector('input[name="typeDocument"]:checked').value;
  var referenceDocument = document.getElementById('referenceDocument').value;

  var montantTotalHT = produits.reduce(function (total, produit) {
    return total + produit.prix;
  }, 0);

  // Récupérer le taux de TVA à partir de l'entrée HTML
  var tauxTVA = parseFloat(document.getElementById('tva').value);

  var montantTVA = montantTotalHT * (tauxTVA / 100);
  var montantTotalTTC = montantTotalHT + montantTVA;

  var nomEntreprise = document.getElementById('nomEntreprise').value;
  var adresseEntreprise = document.getElementById('adresseEntreprise').value;
  var codePostalEntreprise = document.getElementById('codePostalEntreprise').value;
  var villeEntreprise = document.getElementById('villeEntreprise').value;
  var numeroSiret = document.getElementById('numeroSiret').value;
  var nomClient = document.getElementById('nomClient').value;
  var adresseClient = document.getElementById('adresseClient').value;
  var codePostalClient = document.getElementById('codePostalClient').value;
  var villeClient = document.getElementById('villeClient').value;
  var numeroSiretClient = document.getElementById('numeroSiretClient').value;

  var titreDocument = typeDocument.charAt(0).toUpperCase() + typeDocument.slice(1) + " - Référence: " + referenceDocument;

  var documentDefinition = {
    pageMargins: [40, 60, 40, 60],
    content: [
      {
        text: titreDocument,
        style: 'header',
        alignment: 'center',
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 20]
      },
      {
        image: logoDataUrl,
        style: 'logo',
        fit: [100, 100],
        background: 'black',
        margin: [0, 0, 0, 20]
      },
      {
        columns: [
          {
            width: '*',
            text: [
              {
                text:  nomEntreprise + '\n',
                style: 'header'
              },
              {
                text: 'Adresse : ' + adresseEntreprise + '\n'
              },
              {
                text: 'Code postal : ' + codePostalEntreprise + '\n'
              },
              {
                text: 'Ville : ' + villeEntreprise + '\n'
              },
              {
                text: 'Numéro de SIRET: ' + numeroSiret + '\n'
              }
            ]
          },
          {
            width: '*',
            text: [
              {
                text:  nomClient + '\n',
                style: 'header'
              },
              {
                text: 'Adresse : ' + adresseClient + '\n'
              },
              {
                text: 'Code postal : ' + codePostalClient + '\n'
              },
              {
                text: 'Ville : ' + villeClient + '\n'
              },
              {
                text: 'Numéro de SIRET : ' + numeroSiretClient + '\n'
              }
            ]
          }
        ]
      },
      {
        text: '', // Espace vide pour la séparation
        margin: [0, 20]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', '*'],
          body: [['Référence', 'Titre du Produit', 'Prix', 'Descriptif']].concat(
            produits.map(function (produit) {
              return [produit.reference, produit.titre, produit.prix + " €", produit.descriptif];
            })
          ),
        },
        layout: {
          hLineColor: function (i, node) {
            return i === 1 ? '#000' : '#DDD'; // Couleur des lignes horizontales
          },
          vLineColor: '#DDD', // Couleur des lignes verticales
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 2 : 1; // Épaisseur des lignes horizontales
          },
          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 2 : 1; // Épaisseur des lignes verticales
          },
        },
        margin: [0, 20],
        padding: [20],
        minHeight: 450,  // Hauteur de la cellule du tableau (ajustée)
      },
      {
        text: 'Montant Total HT: ' + montantTotalHT.toFixed(2) + ' €',
        alignment: 'right',
        margin: [0, 20]
      },
      {
        text: 'Montant TVA (' + tauxTVA + '%): ' + montantTVA.toFixed(2) + ' €',
        alignment: 'right',
        margin: [0, 10]
      },
      {
        text: 'Montant Total TTC: ' + montantTotalTTC.toFixed(2) + ' €',
        alignment: 'right',
        margin: [0, 10]
      },
      {
        text: '', // Espace vide pour la séparation
        margin: [0, 20]
      },
      {
        columns: [
          {
            width: '*',
            text: 'Signature de l\'entreprise:',
            margin: [0, 0],
          },
          {
            width: '*',
            text: 'Signature du client:',
            margin: [0, 0],
          }
        ]
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      subheader: {
        fontSize: 14,
        bold: true
      },
      logo: {
        width: 100,
        alignment: 'left',
        margin: [0, 0, 0, 20]
      }
    }
  };

  // Créer le PDF
  var pdfDocGenerator = pdfMake.createPdf(documentDefinition);
  pdfDocGenerator.download('document.pdf');
}
