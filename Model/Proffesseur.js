export class Proffesseur {
    #Matricule_Professeur;
    #Email_Professeur;
    #Mdp_Professeur;
    #Nom_Professeur;
    #Status_Inscription;

    constructor (Matricule_Prof, Email_Prof, Mdp_Prof, Nom_Prof, Status_Inscription = false) {
        this.#Matricule_Professeur = Matricule_Prof;
        this.#Email_Professeur = Email_Prof;
        this.#Mdp_Professeur = Mdp_Prof;
        this.#Nom_Professeur = Nom_Prof;
        this.#Status_Inscription = Status_Inscription;
    }
    getMatricule_Professeur () {
        return this.#Matricule_Professeur;
    }
    setMatricule_Professeur (Matri_Prof) {
        this.#Matricule_Professeur = Matri_Prof;
    }
    getEmail_Professeur () {
        return this.#Email_Professeur;
    }
    setEmail_Professeur (Email_Prof) {
        this.#Email_Professeur = Email_Prof;
    }
    getMdp_Professeur () {
        return this.#Mdp_Professeur;
    }
    setMdp_Professeur (Mdp_Professeur) {
        this.#Mdp_Professeur = Mdp_Professeur;
    }
    getNom_Professeur () {
        return this.#Nom_Professeur;
    }
    setNom_Professeur (Nom_Prof) {
        this.#Nom_Professeur = Nom_Prof;
    }
    getStatuts_Inscription () {
        return this.#Status_Inscription;
    }
    setStatuts_Inscription (Statuts_Inscription) {
        this.#Status_Inscription = Statuts_Inscription;
    }
}