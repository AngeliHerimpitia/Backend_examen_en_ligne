export class Reponse {
    #Id_Reponse;
    #Contenue_Reponse;
    #Est_Vrais;
    #ID_Question;

    constructor (Id_Reponse, contenue, EstVrais = false, Id_Question) {
        this.#Id_Reponse = Id_Reponse;
        this.#Contenue_Reponse = contenue;
        this.#Est_Vrais = EstVrais;
        this.#ID_Question = Id_Question;
    }
    getID_Reponse () {
        return this.#Id_Reponse;
    }
    setID_Reponse (Id_Reponse) {
        this.#Id_Reponse = Id_Reponse;
    }
    getContenue_Reponse () {
        return this.#Contenue_Reponse;
    }
    setContenue_Reponse (Contenue) {
        this.#Contenue_Reponse = Contenue;
    }
    getEst_Vrais () {
        return this.#Est_Vrais;
    }
    setEst_Vrais (Est_Vrais) {
        this.#Est_Vrais = Est_Vrais;
    }
    getID_Question () {
        return this.#ID_Question;
    }
    setID_Question (Id_Question)  {
        this.#ID_Question = Id_Question;
    }
}