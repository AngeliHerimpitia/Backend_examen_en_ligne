import { Assiste } from '../Model/Assiste.js';
import { Etudiant } from '../Model/Etudiant.js';
import { Examen } from '../Model/Examen.js';
import { Matiere } from '../Model/Matiere.js';
import { Niveau } from '../Model/Niveau.js';
import { Proffesseur } from '../Model/Proffesseur.js';
import { Question } from '../Model/Question.js';
import { Reponse } from '../Model/Reponse.js';
import { Res_Admin } from '../Model/Res_admin.js';

export function convertirModele(valeur) {
	if (Array.isArray(valeur)) return valeur.map(convertirModele);
	if (!valeur || typeof valeur !== 'object') return valeur;
	if (valeur instanceof Etudiant) return {
		matricule: valeur.getMatricule_Etudiant(), nom: valeur.getNom_Etudiant(),
		email: valeur.getEmail_Etudiant(), inscrit: valeur.getStatus_Inscription(),
		idNiveau: valeur.getID_Niveau()
	};
	if (valeur instanceof Proffesseur) return {
		matricule: valeur.getMatricule_Professeur(), email: valeur.getEmail_Professeur(),
		nom: valeur.getNom_Professeur(), inscrit: valeur.getStatuts_Inscription()
	};
	if (valeur instanceof Niveau) return { id: valeur.getID_Niveau(), libelle: valeur.getLibelle_Niveau() };
	if (valeur instanceof Matiere) return {
		id: valeur.getID_Matiere(), libelle: valeur.getLibelle_Matiere(), idNiveau: valeur.getID_Niveau()
	};
	if (valeur instanceof Examen) return {
		id: valeur.getId_Examen(), debut: valeur.getHeure_Debut(), fin: valeur.getHeure_Fin(),
		idMatiere: valeur.getId_Matiere(), idNiveau: valeur.getId_Niveau(),
		matriculeProfesseur: valeur.getMatricule_Professeur()
	};
	if (valeur instanceof Question) return {
		id: valeur.getId_Question(), ennonce: valeur.getEnnoncé_Question(),
		bareme: valeur.getBarème_20(), idExamen: valeur.getId_Examen()
	};
	if (valeur instanceof Reponse) return {
		id: valeur.getID_Reponse(), contenu: valeur.getContenue_Reponse(),
		estVraie: valeur.getEst_Vrais(), idQuestion: valeur.getID_Question()
	};
	if (valeur instanceof Assiste) return {
		matriculeEtudiant: valeur.getMatricule_Etudiant(), idExamen: valeur.getId_Examen(),
		resultat: valeur.getResultat()
	};
	if (valeur instanceof Res_Admin) return { id: valeur.getId_Admin(), nom: valeur.getNom_Admin() };
	return valeur;
}