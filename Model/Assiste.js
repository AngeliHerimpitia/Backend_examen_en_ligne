export class Assiste {
    #Matricule_Etudiant = "E001";
    #Id_Examen = "EX001";
    #Resultat = 0.00;


    constructor(Matricule_Etudiant, Id_Exam, Resultat) {
        this.#Matricule_Etudiant = Matricule_Etudiant;
        this.#Id_Examen = Id_Exam;
        this.#Resultat = Resultat;
    }
    getMatricule_Etudiant() {
        return this.#Matricule_Etudiant;
    }
    getId_Examen () {
        return this.#Id_Examen;
    }
    getResultat () {
        return this.#Resultat;
    }
    setMatricule_Etudiant(Matricule_Etudiant) {
        this.#Matricule_Etudiant =  Matricule_Etudiant;
    }
    setId_Examen (Id_Exam) {
        this.#Id_Examen = Id_Exam;
    }
    setResultat (Resultat) {
        this.#Resultat = Resultat;
    }


}
