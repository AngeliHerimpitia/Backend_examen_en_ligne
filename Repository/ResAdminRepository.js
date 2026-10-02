import { Res_Admin } from '../Model/Res_admin.js'; // 
import { ConnexionBd } from '../ConnexionBd/ConnexionBd.js';
import bcrypt from 'bcrypt';

export class ResAdminRepository {
  #ConnexionBd = new ConnexionBd();

  async TousResAdmin() { 
    const connexion = await this.#ConnexionBd.connect();
    const [rows] = await connexion.query('SELECT * FROM res_admin');
    return rows.map((row) => new Res_Admin(
      row.Id_Admin,
      row.Nom_Admin,
      row.Mdp_Admin
    ));
  }

  async ajouter(admin) {
    const connexion = await this.#ConnexionBd.connect();
    const motDePasse = await bcrypt.hash(admin.getMdp_Admin(), 10);
    const [resultat] = await connexion.execute(
      'INSERT INTO res_admin (Nom_Admin, Mdp_Admin) VALUES (?, ?)',
      [admin.getNom_Admin(), motDePasse]
    );
    return resultat.affectedRows > 0;
  }

  async modifier(idAdmin, champs) {
    const connexion = await this.#ConnexionBd.connect();
    const modifications = [];
    const parametres = [];
    if (champs.nom !== undefined) {
      modifications.push('Nom_Admin = ?');
      parametres.push(champs.nom);
    }
    if (champs.motDePasse) {
      modifications.push('Mdp_Admin = ?');
      parametres.push(await bcrypt.hash(champs.motDePasse, 10));
    }
    const [resultat] = await connexion.execute(
      `UPDATE res_admin SET ${modifications.join(', ')} WHERE Id_Admin = ?`,
      [...parametres, idAdmin]
    );
    return resultat.affectedRows > 0;
  }
}
