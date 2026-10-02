export class Etudiant {
    #Matricule_Etudiant;
    #Nom_Etudiant;
    #Email_Etudiant;
    #Mdp_Etudiant;
    #Statuts_Inscription = false;
    #Id_Niveau;
    constructor (Matricule_Etudiant, Nom, email, Mdp, Status = false, IDNiveau = null) {
        this.#Matricule_Etudiant = Matricule_Etudiant;
        this.#Nom_Etudiant = Nom;
        this.#Mdp_Etudiant = Mdp;
        this.#Email_Etudiant = email;
        this.#Statuts_Inscription = Status;
        this.#Id_Niveau = IDNiveau;
    }
    getMatricule_Etudiant () {
        return this.#Matricule_Etudiant;
    }
    setMatricule_Etudiant (Matricule_Etudiant_Enter) {
        this.#Matricule_Etudiant = Matricule_Etudiant_Enter;
    }
    getNom_Etudiant () {
        return this.#Nom_Etudiant;
    }
    setNom_Etudiant (Nom) {
        this.#Nom_Etudiant = Nom;
    }
    getEmail_Etudiant () {
        return this.#Email_Etudiant;
    }
    setEmail_Etudiant (email) {
        this.#Email_Etudiant = email;
    }
    getMdp_Etudiant () {
        return this.#Mdp_Etudiant;
    }
    setMdp_Etudiant (Mdp) {
        this.#Mdp_Etudiant = Mdp;
    }
    getStatus_Inscription () {
        return this.#Statuts_Inscription;
    }
    setStatutsInscription (Statuts) {
        this.#Statuts_Inscription = Statuts;
    }
    getID_Niveau () {
        return this.#Id_Niveau;
    }
    setID_Niveau (IDNiveau) {
        this.#Id_Niveau= IDNiveau;
    }
}