-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 19, 2026 at 05:29 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `examen_en_ligne`
--

-- --------------------------------------------------------

--
-- Table structure for table `assiste_`
--

CREATE TABLE `assiste_` (
  `Matricule_Etudiant` varchar(50) NOT NULL,
  `Id_Examen` int(11) NOT NULL,
  `Resultat` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE `passage` (
  `Matricule_Etudiant` varchar(50) NOT NULL,
  `Id_Examen` int(11) NOT NULL,
  `Debut_Passage` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Matricule_Etudiant`,`Id_Examen`),
  KEY `Id_Examen` (`Id_Examen`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `etudiant`
--

CREATE TABLE `etudiant` (
  `Matricule_Etudiant` varchar(50) NOT NULL,
  `Nom_Etudiant` varchar(100) NOT NULL,
  `email_Etudiant` varchar(150) NOT NULL,
  `Mdp_etudiant` varchar(255) NOT NULL,
  `Statuts_Inscription` tinyint(1) NOT NULL DEFAULT 0,
  `ID_Niveau` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `etudiant`
--

INSERT INTO `etudiant` (`Matricule_Etudiant`, `Nom_Etudiant`, `email_Etudiant`, `Mdp_etudiant`, `Statuts_Inscription`, `ID_Niveau`) VALUES
('E001', 'Angeli Herimpitia', 'angeliherimpitia@gmail.com', '$2b$10$ikQ9cPf0UmCJrPE4dG4KxeelRqnnP/Lex6tq0M5jYPwOT6RGOmD2a', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `examen`
--

CREATE TABLE `examen` (
  `Id_Examen` int(11) NOT NULL,
  `Heure_Debut` datetime NOT NULL,
  `Heure_Fin` datetime NOT NULL,
  `Statut_Examen` enum('brouillon','confirme') NOT NULL DEFAULT 'brouillon',
  `Type_Examen` enum('normal','rattrapage') NOT NULL DEFAULT 'normal',
  `ID_Matiere` int(11) NOT NULL,
  `ID_Niveau` int(11) NOT NULL,
  `Matricule_Professeur` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `matiere`
--

CREATE TABLE `matiere` (
  `ID_Matiere` int(11) NOT NULL,
  `Libelle_Matiere` varchar(100) NOT NULL,
  `ID_Niveau` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matiere`
--

INSERT INTO `matiere` (`ID_Matiere`, `Libelle_Matiere`, `ID_Niveau`) VALUES
(1, 'Algorithme', 1);

-- --------------------------------------------------------

--
-- Table structure for table `niveau`
--

CREATE TABLE `niveau` (
  `ID_Niveau` int(11) NOT NULL,
  `Libelle_Niveau` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `niveau`
--

INSERT INTO `niveau` (`ID_Niveau`, `Libelle_Niveau`) VALUES
(1, 'L2 GB');

-- --------------------------------------------------------

--
-- Table structure for table `proffesseur`
--

CREATE TABLE `proffesseur` (
  `Matricule_Professeur` varchar(50) NOT NULL,
  `email_Professeur` varchar(150) NOT NULL,
  `Mdp_Proffesseur` varchar(255) NOT NULL,
  `Nom_Professeur` varchar(100) NOT NULL,
  `Status_Inscription` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `proffesseur`
--

INSERT INTO `proffesseur` (`Matricule_Professeur`, `email_Professeur`, `Mdp_Proffesseur`, `Nom_Professeur`, `Status_Inscription`) VALUES
('POO1', 'solangeraharisoa05@gmail.com', '$2b$10$syhjaBI9lAJ2UiKNuBUaTe3IZs/XqcNHBboK/VRA8CB134DWhRIx.', 'Solange Raharisoa ', 1);

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

CREATE TABLE `question` (
  `ID_Question` int(11) NOT NULL,
  `Ennoncé_question` text NOT NULL,
  `Barème_20_` decimal(4,2) NOT NULL,
  `Id_Examen` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reponse`
--

CREATE TABLE `reponse` (
  `ID_Reponse` int(11) NOT NULL,
  `Contenue_reponse` text NOT NULL,
  `EstVrais_` tinyint(1) NOT NULL DEFAULT 0,
  `ID_Question` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `res_admin`
--

CREATE TABLE `res_admin` (
  `Id_Admin` int(11) NOT NULL,
  `Nom_Admin` varchar(100) NOT NULL,
  `Mdp_Admin` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

CREATE TABLE `demande` (
  `Id_Demande` int(11) NOT NULL,
  `Role_Demandeur` enum('etudiant','professeur') NOT NULL,
  `Id_Demandeur` varchar(50) NOT NULL,
  `Type_Demande` enum('modification','suppression') NOT NULL,
  `Donnees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Donnees`)),
  `Statut` enum('en_attente','acceptee','refusee') NOT NULL DEFAULT 'en_attente',
  `Date_Demande` datetime NOT NULL DEFAULT current_timestamp(),
  `Date_Traitement` datetime DEFAULT NULL,
  `Traite_Par` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id_Demande`),
  KEY `demande_statut_idx` (`Statut`,`Date_Demande`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `res_admin`
--

INSERT INTO `res_admin` (`Id_Admin`, `Nom_Admin`, `Mdp_Admin`) VALUES
(1, 'Administrateur', '$2b$10$upO9RRkkcPYnjDpSzmFcCOwJCHS7/Ns4tB1qAChzgu6IIqdHtFCxG');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assiste_`
--
ALTER TABLE `assiste_`
  ADD PRIMARY KEY (`Matricule_Etudiant`,`Id_Examen`),
  ADD KEY `Id_Examen` (`Id_Examen`);

--
-- Indexes for table `etudiant`
--
ALTER TABLE `etudiant`
  ADD PRIMARY KEY (`Matricule_Etudiant`),
  ADD KEY `ID_Niveau` (`ID_Niveau`) USING BTREE;

--
-- Indexes for table `examen`
--
ALTER TABLE `examen`
  ADD PRIMARY KEY (`Id_Examen`),
  ADD KEY `ID_Matiere` (`ID_Matiere`),
  ADD KEY `ID_Niveau` (`ID_Niveau`),
  ADD KEY `Matricule_Professeur` (`Matricule_Professeur`);

--
-- Indexes for table `matiere`
--
ALTER TABLE `matiere`
  ADD PRIMARY KEY (`ID_Matiere`),
  ADD KEY `ID_Niveau` (`ID_Niveau`);

--
-- Indexes for table `niveau`
--
ALTER TABLE `niveau`
  ADD PRIMARY KEY (`ID_Niveau`);

--
-- Indexes for table `proffesseur`
--
ALTER TABLE `proffesseur`
  ADD PRIMARY KEY (`Matricule_Professeur`),
  ADD UNIQUE KEY `email_Professeur` (`email_Professeur`);

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`ID_Question`),
  ADD KEY `Id_Examen` (`Id_Examen`);

--
-- Indexes for table `reponse`
--
ALTER TABLE `reponse`
  ADD PRIMARY KEY (`ID_Reponse`),
  ADD KEY `ID_Question` (`ID_Question`);

--
-- Indexes for table `res_admin`
--
ALTER TABLE `res_admin`
  ADD PRIMARY KEY (`Id_Admin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `examen`
--
ALTER TABLE `examen`
  MODIFY `Id_Examen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `demande`
--
ALTER TABLE `demande`
  MODIFY `Id_Demande` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `matiere`
--
ALTER TABLE `matiere`
  MODIFY `ID_Matiere` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `niveau`
--
ALTER TABLE `niveau`
  MODIFY `ID_Niveau` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `ID_Question` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reponse`
--
ALTER TABLE `reponse`
  MODIFY `ID_Reponse` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `res_admin`
--
ALTER TABLE `res_admin`
  MODIFY `Id_Admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assiste_`
--
ALTER TABLE `assiste_`
  ADD CONSTRAINT `assiste__ibfk_1` FOREIGN KEY (`Matricule_Etudiant`) REFERENCES `etudiant` (`Matricule_Etudiant`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `assiste__ibfk_2` FOREIGN KEY (`Id_Examen`) REFERENCES `examen` (`Id_Examen`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `passage`
--
ALTER TABLE `passage`
  ADD CONSTRAINT `passage_ibfk_1` FOREIGN KEY (`Matricule_Etudiant`) REFERENCES `etudiant` (`Matricule_Etudiant`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passage_ibfk_2` FOREIGN KEY (`Id_Examen`) REFERENCES `examen` (`Id_Examen`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `etudiant`
--
ALTER TABLE `etudiant`
  ADD CONSTRAINT `etudiant_ibfk_1` FOREIGN KEY (`ID_Niveau`) REFERENCES `niveau` (`ID_Niveau`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `examen`
--
ALTER TABLE `examen`
  ADD CONSTRAINT `examen_ibfk_1` FOREIGN KEY (`ID_Matiere`) REFERENCES `matiere` (`ID_Matiere`) ON UPDATE CASCADE,
  ADD CONSTRAINT `examen_ibfk_2` FOREIGN KEY (`ID_Niveau`) REFERENCES `niveau` (`ID_Niveau`) ON UPDATE CASCADE,
  ADD CONSTRAINT `examen_ibfk_3` FOREIGN KEY (`Matricule_Professeur`) REFERENCES `proffesseur` (`Matricule_Professeur`) ON UPDATE CASCADE;

--
-- Constraints for table `matiere`
--
ALTER TABLE `matiere`
  ADD CONSTRAINT `matiere_ibfk_1` FOREIGN KEY (`ID_Niveau`) REFERENCES `niveau` (`ID_Niveau`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `question_ibfk_1` FOREIGN KEY (`Id_Examen`) REFERENCES `examen` (`Id_Examen`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reponse`
--
ALTER TABLE `reponse`
  ADD CONSTRAINT `reponse_ibfk_1` FOREIGN KEY (`ID_Question`) REFERENCES `question` (`ID_Question`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
