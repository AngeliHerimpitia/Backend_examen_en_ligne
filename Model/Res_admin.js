export class Res_Admin {
    #Id_Admin;
    #Nom_Admin;
    #Mdp_Admin;

    constructor (Id_Admin, Nom_Admin, Mdp_Admin) {
        this.#Id_Admin = Id_Admin;
        this.#Nom_Admin = Nom_Admin;
        this.#Mdp_Admin = Mdp_Admin;
    }
    getId_Admin () {
        return this.#Id_Admin;
    }
    setId_Admin (Id_Admin) {
        this.#Id_Admin = Id_Admin;
    }
    getNom_Admin () {
        return this.#Nom_Admin;
    }
    setNom_Admin (Nom_Admin) {
        this.#Nom_Admin = Nom_Admin;
    }
    getMdp_Admin () {
        return this.#Mdp_Admin;
    }
    setMdp_Admin (Mdp_Admin) {
        this.#Mdp_Admin = Mdp_Admin;
    }
}