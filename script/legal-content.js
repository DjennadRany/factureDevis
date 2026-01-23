/* =========================================================
   HexaFact — Legal content (externalized)
   ========================================================= */

window.LEGAL_CONTENT = {
  legal: {
    title: "Mentions légales",
    html: `
      <p><strong>Éditeur :</strong> Djennad Rany</p>
      <p><strong>Projet indépendant – France</strong></p>
      <p><strong>Contact :</strong> djennad.ar@gmail.com</p>
      <p><strong>Directeur de publication :</strong> Djennad Rany</p>
      <h6>Hébergement</h6>
      <p>GitHub Pages (GitHub, Inc.) – hébergeur technique.</p>
      <h6>Objet du site</h6>
      <p>Outil d’aide à la génération de devis et factures.</p>
      <h6>Responsabilité</h6>
      <p>L’utilisateur reste responsable des informations saisies et de l’usage des documents.</p>
      <h6>Propriété intellectuelle</h6>
      <p>Interface, contenus et structure protégés.</p>
      <p><strong>Version :</strong> HexaFact V2 (beta)</p>
    `
  },
  privacy: {
    title: "Confidentialité & données personnelles",
    html: `
      <p><strong>Responsable de traitement :</strong> Djennad Rany (djennad.ar@gmail.com)</p>
      <h6>Données traitées</h6>
      <p>Données saisies (vendeur, client, lignes), brouillons, paramètres.</p>
      <h6>Fonctionnement local</h6>
      <p>Stockage dans le navigateur (localStorage / IndexedDB). Aucun serveur HexaFact ne collecte de données.</p>
      <h6>Services tiers optionnels</h6>
      <ul>
        <li>recherche-entreprises.api.gouv.fr (SIREN/SIRET)</li>
        <li>data.geopf.fr (autocomplétion adresses)</li>
      </ul>
      <h6>Finalités</h6>
      <p>Génération devis/factures, calculs, export.</p>
      <h6>Conservation</h6>
      <p>Tant que stockées localement.</p>
      <h6>Droits RGPD</h6>
      <p>Accès, rectification, effacement via djennad.ar@gmail.com. Possibilité de saisir la CNIL.</p>
      <h6>Recommandation</h6>
      <p>Évitez l’usage sur poste partagé.</p>
    `
  },
  cookies: {
    title: "Cookies & stockage local",
    html: `
      <p>Aucun cookie publicitaire.</p>
      <h6>Stockage local</h6>
      <p>Utilisation du stockage local uniquement (localStorage) pour les brouillons. Ce n’est pas un cookie.</p>
      <button id="btnClearLocalData" class="btn btn-outline-danger btn-sm" data-testid="clear-local-data">Effacer mes données locales</button>
      <div id="clearLocalDataMsg" class="small text-muted mt-2"></div>
      <h6>Suppression manuelle</h6>
      <p>Vous pouvez aussi vider le stockage via les réglages de votre navigateur.</p>
    `
  },
  support: {
    title: "Support",
    html: `
      <p><strong>Contact :</strong> djennad.ar@gmail.com</p>
      <h6>FAQ</h6>
      <ul>
        <li>Comment créer un devis/facture ?</li>
        <li>Comment transformer un devis en facture ?</li>
        <li>Comment gérer la franchise de TVA ?</li>
        <li>Client pro vs particulier : quelles différences ?</li>
        <li>Où sont stockés les brouillons ?</li>
        <li>Comment exporter/importer mes données ?</li>
      </ul>
      <p>Projet en évolution – retours bienvenus.</p>
    `
  },
  about: {
    title: "À propos de HexaFact",
    html: `
      <p>HexaFact est un projet indépendant, gratuit, conçu pour simplifier la facturation.</p>
      <p><strong>Objectif :</strong> rendre la facturation simple et conforme.</p>
      <p><strong>Public :</strong> freelances, TPE, PME.</p>
      <p><strong>Approche :</strong> pédagogique, offline-first.</p>
      <p><strong>Vision :</strong> un outil de référence simple pour la facturation française.</p>
      <h6>Roadmap</h6>
      <ul>
        <li>V2 : UX, conformité</li>
        <li>V3 : interopérabilité future</li>
      </ul>
    `
  },
  partners: {
    title: "Partenariats & financement",
    html: `
      <p>Projet auto-financé.</p>
      <h6>Recherche</h6>
      <ul>
        <li>Retours utilisateurs</li>
        <li>Partenaires (experts-comptables, réseaux, CCI, acteurs numériques)</li>
        <li>Soutiens financiers ou institutionnels</li>
      </ul>
      <h6>Pourquoi soutenir HexaFact</h6>
      <ul>
        <li>Impact TPE/freelances</li>
        <li>Conformité simplifiée</li>
        <li>Souveraineté numérique</li>
      </ul>
      <p><strong>Contact partenariats :</strong> djennad.ar@gmail.com</p>
    `
  }
};
