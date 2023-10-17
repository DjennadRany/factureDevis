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
    newRow.setAttribute('data-id', produitId);

    var cell0 = newRow.insertCell(0);
    var cell1 = newRow.insertCell(1);
    var cell2 = newRow.insertCell(2);
    var cell3 = newRow.insertCell(3);
    var cell4 = newRow.insertCell(4); // Cellule pour les boutons

    cell0.className = 'referenceProduit';
    cell1.className = 'titreProduit';
    cell2.className = 'prix';
    cell3.className = 'descriptifProduit';

    cell0.innerHTML = referenceProduit;
    cell1.innerHTML = titreProduit;
    cell2.innerHTML = prix + " €";
    cell3.innerHTML = descriptif;

    // Créer les boutons "Supprimer" et "Modifier" avec les attributs de données
    var supprimerButton = document.createElement('button');
    supprimerButton.textContent = 'Supprimer';
    supprimerButton.onclick = function () {
        supprimerProduit(produitId);
    };

    var modifierButton = document.createElement('button');
    modifierButton.textContent = 'Modifier';
    modifierButton.setAttribute('data-action', 'modifier');
    modifierButton.onclick = function () {
        modifierProduit(produitId);
    };

    cell4.appendChild(supprimerButton);
    cell4.appendChild(modifierButton);

    // Réinitialiser les champs de saisie
    document.getElementById('titreProduit').value = '';
    document.getElementById('prix').value = '';
    document.getElementById('referenceProduit').value = '';
    document.getElementById('descriptif').value = '';
    mettreAJourMontants();
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
    mettreAJourMontants();
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
        content: [{
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
                columns: [{
                        width: '*',
                        text: [{
                                text: nomEntreprise + '\n',
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
                        text: [{
                                text: nomClient + '\n',
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
                    body: [
                        ['Référence', 'Titre du Produit', 'Prix', 'Descriptif']
                    ].concat(
                        produits.map(function (produit) {
                            return [
                                {
                                    text: produit.reference,
                                    margin: [0, 10], // 10px de marge en haut et en bas
                                    fontSize:11,
                                    widths: '10%',
                                },
                                {
                                    text: produit.titre,
                                    margin: [0, 10],
                                    fontSize:11,
                                    widths: '30%',
                                },
                                {
                                    text: produit.prix + " €",
                                    margin: [0, 10],
                                    fontSize:11,
                                    widths: '30%',
                                    lineHeight: 1, // Pour forcer le texte du prix sur une seule ligne
                                },
                                {
                                    text: produit.descriptif,
                                    fontSize:10,
                                    widths: '30%',
                                    margin: [0, 10],
                                }
                            ];
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
                minHeight: 450, // Hauteur de la cellule du tableau (ajustée)
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
                columns: [{
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

function modifierProduit(produitId) {
    var produit = produits.find(function (p) {
        return p.id === produitId;
    });

    if (produit) {
        // Récupérer le <tr> correspondant à produitId
        var tr = document.querySelector("tr[data-id='" + produitId + "']");

        // Récupérer les champs textuels dans le même <tr>
        var titreProduitField = tr.querySelector('.titreProduit');
        var prixField = tr.querySelector('.prix');
        var referenceProduitField = tr.querySelector('.referenceProduit');
        var descriptifField = tr.querySelector('.descriptifProduit');

        // Créer des éléments d'entrée pour permettre la modification
        var titreProduitInput = document.createElement("input");
        titreProduitInput.type = "text";
        titreProduitInput.value = produit.titre;

        var prixInput = document.createElement("input");
        prixInput.type = "number";
        prixInput.value = produit.prix;

        var referenceProduitInput = document.createElement("input");
        referenceProduitInput.type = "text";
        referenceProduitInput.value = produit.reference;

        var descriptifInput = document.createElement("input");
        descriptifInput.type = "text";
        descriptifInput.value = produit.descriptif;

        // Remplacer les éléments d'affichage par des champs de saisie
        titreProduitField.innerHTML = '';
        titreProduitField.appendChild(titreProduitInput);

        prixField.innerHTML = '';
        prixField.appendChild(prixInput);

        referenceProduitField.innerHTML = '';
        referenceProduitField.appendChild(referenceProduitInput);

        descriptifField.innerHTML = '';
        descriptifField.appendChild(descriptifInput);

        // Remplacer le bouton "Modifier" par un bouton "Valider"
        var actionsField = tr.querySelector('td:last-child');
        var modifierButton = actionsField.querySelector("button[data-action='modifier']");

        var validerButton = document.createElement("button");
        validerButton.textContent = "Valider";
        validerButton.style.backgroundColor = "green"; // Le bouton est vert
        validerButton.onclick = function () {
            // Mettre à jour les données du produit avec les nouvelles valeurs des champs de saisie
            produit.titre = titreProduitInput.value;
            produit.prix = parseFloat(prixInput.value);
            produit.reference = referenceProduitInput.value;
            produit.descriptif = descriptifInput.value;

            // Mettre à jour l'affichage
            titreProduitField.textContent = produit.titre;
            prixField.textContent = produit.prix + " €";
            referenceProduitField.textContent = produit.reference;
            descriptifField.textContent = produit.descriptif;
            mettreAJourMontants();

            // Remettre le bouton "Modifier" à la place du bouton "Valider"
            actionsField.removeChild(validerButton);
            actionsField.appendChild(modifierButton);
        };

        // Remplacer le bouton "Modifier" par le bouton "Valider"
        modifierButton.replaceWith(validerButton);

    }

}
// Fonction pour mettre à jour les montants HT, TVA, et TTC
function mettreAJourMontants() {
    var montantTotalHT = produits.reduce(function (total, produit) {
        return total + produit.prix;
    }, 0);

    // Récupérer le taux de TVA à partir de l'entrée HTML
    var tauxTVA = parseFloat(document.getElementById('tva').value);
    var montantTVA = montantTotalHT * (tauxTVA / 100);
    var montantTotalTTC = montantTotalHT + montantTVA;

    // Mettre à jour les éléments HTML correspondants
    document.getElementById('montantTotalHT').textContent = montantTotalHT.toFixed(2) + ' €';
    document.getElementById('tvaPercentage').textContent = tauxTVA;
    document.getElementById('montantTVA').textContent = montantTVA.toFixed(2) + ' €';
    document.getElementById('montantTotalTTC').textContent = montantTotalTTC.toFixed(2) + ' €';
    // Gestionnaire d'événement pour la saisie en temps réel du taux de TVA

}
// Attendre que le document HTML soit chargé
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('tva').addEventListener('input', function () {
        mettreAJourMontants();
    });
});