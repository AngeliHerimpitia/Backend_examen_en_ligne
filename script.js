import {ProffesseurRepository} from './Repository/ProffesseurRepository.js';
 import {Proffesseur} from './Model/Proffesseur.js';

const BtnAjout = document.querySelector('#Ajout_btn');
const BtnAnnuler = document.querySelector('#Annuler_btn');
BtnAjout.addEventListener("click", async () => {
    const MatriculeProf = document.querySelector('#Matricule_Enter').value.trim();
    const NomProf = document.querySelector('#Nom_Enter').value.trim();
    const EmailProf = document.querySelector('#Email_Enter').value.trim();
    const MdpProf = document.querySelector('#Mdp_Enter').value.trim();
    
    const Prof = new Proffesseur(
        MatriculeProf,
        NomProf,
        EmailProf,
        MdpProf
    ); 

    const ProfRepertoire = new ProffesseurRepository();
    
    let resultat = await ProfRepertoire.inscrire(Prof);
    console.log(resultat);
    if (resultat) {
        alert("Proffesseur ajouté avec succées ");
    }
    else {
        alert("ereure l'or de l'ajout ");
    }
})
BtnAnnuler.addEventListener("click",  () => {
    alert("Hello World 2");
})