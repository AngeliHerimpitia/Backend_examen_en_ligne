export class Examen {
    #ID_Examen;
    #Heure_Debut;
    #Heure_Fin;
    #ID_Matiere;
    #ID_Niveau;
    #Matricule_Professeur;

    constructor (IDExamen, HeurDeb, HeureFin, NbrQuestion, Id_Matiere, Id_Niveau, MatriculeProf) {
        this.#Heure_Debut = HeurDeb;
        this.#Heure_Fin = HeureFin;
        this.#ID_Examen = IDExamen;
        this.#ID_Matiere = Id_Matiere;
        this.#ID_Niveau = Id_Niveau;
        this.#Matricule_Professeur = MatriculeProf;
    }

    getId_Examen() {
        return this.#ID_Examen;
    }
    setId_Examen (Id_Examen) {
        this.#ID_Examen = Id_Examen;
    }
    getHeure_Debut() {
        return this.#Heure_Debut;
    }
    setHeure_Debut (Heur_Debut) {
        this.#Heure_Debut = Heur_Debut;
    }
    getHeure_Fin() {
        return this.#Heure_Fin;
    }
    setHeur_Fin (HeurFin) {
        this.#Heure_Fin = HeurFin;

    }
    getId_Matiere() {
        return this.#ID_Matiere; 
    }
    setId_Matiere (Id_Matiere) {
        this.#ID_Matiere = Id_Matiere;
    }
    getId_Niveau() {
        return this.#ID_Niveau;
    }
    setId_Niveau (Id_Niveau) {
        this.#ID_Niveau = Id_Niveau;
    }
    getMatricule_Professeur () {
        return this.#Matricule_Professeur;
    }
    setMatricule_Professeur (Id_Prof) {
        this.#Matricule_Professeur = Id_Prof;
    }
} 

//tohizana model ty aloha de avy eo mikotrana connexion BD de avy eo mi crée API de avy eo mianatra maka front 
