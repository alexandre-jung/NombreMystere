// Pour les noms et codes des touches claviers, voir https://keycode.info/


// Réglages
const MIN = 1;
const MAX = 100;
const ESSAIS = 7;
const tempsMaxMS = 30000;


// Eléments du DOM
let elementProposition = document.querySelector('#proposition');
let elementEssai = document.querySelector('#essai');
let elementMessage = document.querySelector('#message');
let elementReponses = document.querySelector('#reponses');
let elementTemps = document.querySelector('#temps');
let boutonProposer = document.querySelector('#proposer');
let boutonSolution = document.querySelector('#solution');
let boutonNouvellePartie = document.querySelector('#nouveau');
let saisieInvalide = document.querySelector('#saisieInvalide');


// Variables
let nombreMystere;
let compteurEssais = 0;
let tempsEcouleMS = 0;
let interval = null;


// Choisit un nombre au hasard dans l'intervalle min-max (inclus)
function hasard(min = MIN, max = MAX) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Affiche un message coloré. Si color vaut null,
// conserve la couleur précédenter.
function afficherMessage(message, color = 'black') {
    elementMessage.value = message;
    elementMessage.style.color = color;
}


// Change la couleur des inputs:
// Si value est vrai, en gris, sinon en noir
function fadeInformations(value) {
    let color = value ? 'gray' : 'black';
    elementEssai.style.color = color;
    elementReponses.style.color = color;
    elementTemps.style.color = color;
}


// Termine la partie
// Désactive les boutons et le timer
function terminerPartie() {
    // Réinitialise le timer
    clearInterval(interval);
    interval = null;

    // Désactive l'input proposition
    elementProposition.disabled = true;
    elementProposition.style.borderColor = 'gray';

    // Active seulement le bouton nouvelle partie
    boutonProposer.disabled = true;
    boutonSolution.disabled = true;
    boutonNouvellePartie.disabled = false;

    // Grise les autres inputs
    // Masque le message d'erreur
    // Déselectionne le contenu de l'input proposition
    fadeInformations(true);
    saisieInvalide.style.display = 'none';
    elementProposition.setSelectionRange(0, 0);
}


// Vérifie le temps écoulé
// S'il n'y a plus de temps, termine la partie
function verifierTemps() {
    tempsEcouleMS += 1000;
    let tempsRestant = tempsMaxMS - tempsEcouleMS
    temps.value = tempsRestant / 1000;
    if (tempsEcouleMS >= tempsMaxMS) {
        terminerPartie();
        afficherMessage('Le temps est écoulé !', 'red');
    }
}


function initialiserInterface() {
    document.querySelector('span#essais').textContent = ESSAIS;
    document.querySelector('span#min').textContent = MIN;
    document.querySelector('span#max').textContent = MAX;
    document.querySelector('span#tempsMax').textContent = tempsMaxMS / 1000;

    // Désactive tous les boutons sauf nouvelle partie
    elementProposition.disabled = true;
    boutonProposer.disabled = true;
    boutonSolution.disabled = true;
    boutonNouvellePartie.disabled = false;

    // Vide l'affichage
    elementTemps.value = '';
    elementEssai.value = '';
    elementProposition.value = '';
    elementReponses.value = '';
    elementMessage.value = '';
}


function commencerPartie() {
    initialiserInterface();
    fadeInformations(false);

    // Active tous les boutons sauf nouvelle partie
    elementProposition.disabled = false;
    boutonProposer.disabled = false;
    boutonSolution.disabled = false;
    boutonNouvellePartie.disabled = true;

    // Tire un nombre aléatoire
    // Réinitialise le nombre d'essais
    // Dit bonjour
    // Vide la liste des réponses
    // Met à jour les attributs min-max de l'input
    nombreMystere = hasard();
    compteurEssais = 0;
    elementEssai.value = compteurEssais;
    afficherMessage(`Choisissez un nombre entre ${MIN} et ${MAX}`, 'black');
    elementProposition.min = MIN;
    elementProposition.max = MAX;
    elementProposition.focus();

    // Réinitialise / démarre le timer
    tempsEcouleMS = 0;
    interval = setInterval(verifierTemps, 1000);
    temps.value = tempsMaxMS / 1000;
}


// Ajoute une réponse à la liste
function ajouterReponse(reponse) {
    let tmp = elementReponses.value;
    if (compteurEssais != 1)
        tmp = ', ' + tmp;
    elementReponses.value = reponse + tmp;
}


// Termine la partie et affiche la solution
function afficherSolution() {
    if (confirm('Voulez-vous vraiment afficher la solution ?\nCette action arrêtera la partie en cours.')) {
        afficherMessage(`La solution était ${nombreMystere}. N'hésitez pas à rejouer !`, 'gray');
        terminerPartie();
    }
}


function proposer() {
    let prop = Number(elementProposition.value);
    let partieTerminee = false;
    let partieGagnee = false;

    // Erreur de saisie
    if (prop < MIN || prop > MAX || prop == '' || !Number.isInteger(prop)) {
        afficherMessage(`Vous devez saisir un nombre entre ${MIN} et ${MAX} !`, 'darkorange');

        // Selectionne tout le contenu de l'input
        // pour pouvoir faire une nouvelle proposition rapidement
        elementProposition.select();

        // Démarre une animation
        elementProposition.classList.add('error');
        setTimeout(() => {
            elementProposition.classList.remove('error');
        }, 100);
        elementProposition.style.borderColor = 'darkorange';
        return;
    }

    // Teste la proposition
    if (prop < nombreMystere) {
        afficherMessage('Trop petit !');

    } else if (prop > nombreMystere) {
        afficherMessage('Trop grand !');

    } else {
        partieTerminee = true;
        partieGagnee = true;
    }


    // Utilise un essai
    compteurEssais++;
    elementEssai.value = compteurEssais;

    // Ajoute la réponse
    ajouterReponse(prop);

    // Vide la proposition et lui donne le focus
    elementProposition.value = '';
    elementProposition.focus();

    // Partie terminée ?
    if (compteurEssais == ESSAIS) {
        partieTerminee = true;
    }

    // Termine la partie
    if (partieTerminee) {
        terminerPartie();
        if (partieGagnee) {
            afficherMessage(`Vous avez trouvé le nombre mystère en ${compteurEssais} coup(s) !`, 'green');
        } else {
            afficherMessage(`Perdu... Vous deviez trouver ${nombreMystere}. Voulez-vous rejouer ?`, 'red');
        }
    }
}


// --- Validation dynamique de la proposition ---
// Quand l'utilisateur entre un caractère, vérifie que c'est un nombre
// dans l'intervalle, et ajuste la couleur du bord en fonction.
elementProposition.addEventListener('keyup', function () {
    let valeur = this.value.trim();
    let nombre = Number(valeur);

    let estVide = (valeur.length == 0);
    let estValide = (Number.isInteger(nombre) && nombre >= MIN && nombre <= MAX);

    if (estValide || estVide) {
        this.style.borderColor = 'cornflowerblue';
        saisieInvalide.style.display = 'none';
    } else {
        this.style.borderColor = 'darkorange';
        saisieInvalide.style.display = 'inline';
    }
});


// Ajoute les autres écouteurs d'évènements
boutonProposer.addEventListener('click', () => proposer());
boutonNouvellePartie.addEventListener('click', () => commencerPartie());
boutonSolution.addEventListener('click', () => afficherSolution());
elementProposition.addEventListener('keydown', event => { if (event.key == 'Enter') proposer() });


// Initialise l'interface' et affiche un message de bienvenue
initialiserInterface();
afficherMessage('Bienvenue ! Pour jouer, cliquez sur nouveau jeu :)', 'cornflowerblue');
