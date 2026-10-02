export class Question {
    #ID_Question;
    #Ennoncé_Question;
    #Barème_20;
    #Id_Examen;

    constructor (Id_Question, ennonce, barem, nbrReponse, id_examen) {
        this.#ID_Question = Id_Question;
        this.#Ennoncé_Question = ennonce;
        this.#Barème_20 = barem;
        this.#Id_Examen = id_examen;
    }

    getId_Question () {
        return this.#ID_Question;
    }
    setId_Question (Id_Question) {
        this.#ID_Question = Id_Question;
    }
    getEnnoncé_Question () {
        return this.#Ennoncé_Question;
    }
    setEnnoncé_Question (Ennoncé) {
        this.#Ennoncé_Question = Ennoncé;
    }
    getBarème_20 () {
        return this.#Barème_20;
    }
    setBarème_20 (Barem20) {
        this.#Barème_20 = Barem20;
    }
    getId_Examen () {
        return this.#Id_Examen;
    }
    setId_Examen (Id_Examen) {
        this.#Id_Examen = Id_Examen;
    }
}