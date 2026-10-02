export class Matiere {
    #ID_Matiere;
    #Libelle_Matiere;
    #ID_Niveau;

    constructor (ID_Matiere, Libelle_Matiere, ID_Niveau) {
        this.#ID_Matiere = ID_Matiere;
        this.#ID_Niveau = ID_Niveau;
        this.#Libelle_Matiere = Libelle_Matiere;
    }
    getID_Matiere () {
        return this.#ID_Matiere;
    }
    setID_Matiere (ID_Matiere) {
        this.#ID_Matiere = ID_Matiere;
    }
    getLibelle_Matiere () {
        return this.#Libelle_Matiere;
    }
    setLibelle_Matier (Libbelle_Matiere) {
        this.#Libelle_Matiere = Libbelle_Matiere;
    }
    getID_Niveau () {
        return this.#ID_Niveau;
    }
    setID_Niveau (ID_Niveau) {
        this.#ID_Niveau = ID_Niveau;
    }
}