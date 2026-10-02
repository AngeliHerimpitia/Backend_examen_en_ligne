export class Niveau {
    #ID_Niveau;
    #Libelle_Niveau;

    constructor (ID_Niveau, Lielle_Niveau) {
        this.#ID_Niveau = ID_Niveau;
        this.#Libelle_Niveau = Lielle_Niveau;
    }
    getID_Niveau () {
        return this.#ID_Niveau;
    }
    setID_Niveau (ID_Niveau) {
        this.#ID_Niveau = ID_Niveau;
    }
    getLibelle_Niveau () {
        return this.#Libelle_Niveau;
    }
    setLibelle_Niveau (Libelle_Niveau) {
        this.#Libelle_Niveau = Libelle_Niveau;
    }
}