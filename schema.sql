-- Conversion de HFSQL vers SQL


CREATE TABLE indicateur_engagement (
    ID_INDICATEUR_ENG VARCHAR(255) PRIMARY KEY,
    date_enreg DATETIME,
    solde_caisse VARCHAR(255),
    solde_client VARCHAR(255),
    solde_compagnie VARCHAR(255),
    solde_quittance_nonreverse VARCHAR(255),
    effacer BOOLEAN,
    date_synchro DATETIME,
    sync BOOLEAN,
    montant_engagement VARCHAR(255),
    solde_banque VARCHAR(255),
    montant_couverture VARCHAR(255)
);

CREATE TABLE INFO_SOCIETE (
    raisonsocial VARCHAR(255) PRIMARY KEY,
    Adresse VARCHAR(255),
    tel_courtier VARCHAR(255),
    email_courtier VARCHAR(255),
    logo_courtier VARCHAR(255) CHARACTER SET utf8mb4,
    date_enreg DATETIME,
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    BP_coutier VARCHAR(255),
    Fax_coutier VARCHAR(255),
    basdepage VARCHAR(255),
    param_CEMAC INT,
    param_CCA INT,
    daterecupserveur DATETIME
);

CREATE TABLE CLIENT (
    ID_Client VARCHAR(255) PRIMARY KEY,
    Nom_client VARCHAR(255),
    Adresse VARCHAR(255),
    Email VARCHAR(255),
    Telephone VARCHAR(255),
    Tel_WhatsApp VARCHAR(255),
    Date_naissance DATETIME,
    Profession VARCHAR(255),
    date_enreg DATETIME,
    civilite VARCHAR(255),
    Source VARCHAR(255),
    pays VARCHAR(255),
    Autres_Informations VARCHAR(255),
    est_entreprise BOOLEAN,
    representant_Entreprise VARCHAR(255),
    IDUTILISATEUR_source VARCHAR(255),
    IDUTILISATEUR_save VARCHAR(255),
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    role_representant VARCHAR(255),
    nif_client VARCHAR(255),
    prenom_client VARCHAR(255),
    date_permis_cond DATETIME,
    Fax_client VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE UTILISATEUR (
    IDUTILISATEUR VARCHAR(255) PRIMARY KEY,
    Nom_utilisateur VARCHAR(255),
    Adresse_email VARCHAR(255),
    Mot_de_passe VARCHAR(255),
    Tel_utilisateur VARCHAR(255),
    Role_utilisateur VARCHAR(255),
    login_utilisateur VARCHAR(255),
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    date_modif DATETIME,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    CodeAgence VARCHAR(255),
    est_desactiver BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE INTERACTION (
    IDINTERACTION VARCHAR(255) PRIMARY KEY,
    ID_Client VARCHAR(255),
    Type_interaction VARCHAR(255),
    date_heure_interaction DATETIME,
    duree_interaction VARCHAR(255),
    Lieu VARCHAR(255),
    Description TEXT,
    Resultat_interaction VARCHAR(255),
    Date_rappel DATETIME,
    rappel_necessaire BOOLEAN,
    IDUTILISATEUR_action VARCHAR(255),
    effacer BOOLEAN,
    date_synchro DATETIME,
    date_enreg DATETIME,
    date_modif DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    sync BOOLEAN,
    titre_rappel VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE DROITS (
    code_Droit VARCHAR(255) PRIMARY KEY,
    libelle_droit VARCHAR(255),
    IDGROUPE INT,
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    date_enreg DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE GROUPE_DROIT (
    IDGROUPE INT PRIMARY KEY,
    LIBELLE_GROUPE VARCHAR(255),
    date_synchro DATETIME,
    effacer BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE POSSEDE_DROIT (
    Code_Droit VARCHAR(255) PRIMARY KEY,
    droitactif BOOLEAN,
    date_synchro DATETIME,
    sync BOOLEAN,
    CodeAgence VARCHAR(255),
    IDUTILISATEUR_save VARCHAR(255),
    date_enreg DATETIME,
    date_modif DATETIME,
    IDUTILISATEUR VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE TACHES (
    IDTACHES VARCHAR(255) PRIMARY KEY,
    date_echeance_tache DATETIME,
    date_creation_tache DATETIME,
    titre_tache VARCHAR(255),
    date_cloture_tache DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_enreg DATETIME,
    date_synchro DATETIME,
    sync BOOLEAN,
    effacer BOOLEAN,
    IDUTILISATEUR_affecter VARCHAR(255),
    description_tache TEXT,
    statut_tache INT,
    date_modif DATETIME,
    ID_Client VARCHAR(255),
    IDINTERACTION VARCHAR(255),
    code_couleur VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE COMPAGNIE (
    id_compagnie VARCHAR(255) PRIMARY KEY,
    nom_compagnie VARCHAR(255),
    tel_compagnie VARCHAR(255),
    adresse_compagnie VARCHAR(255),
    email_compagnie VARCHAR(255),
    logo VARCHAR(255) CHARACTER SET utf8mb4,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    codification_compagnie VARCHAR(255),
    Url_logo VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE GROUPE_PRODUIT (
    code_groupe_prod VARCHAR(255) PRIMARY KEY,
    lib_groupe_prod VARCHAR(255),
    sync BOOLEAN,
    date_synchro DATETIME,
    effacer BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE PRODUIT (
    id_produit VARCHAR(255) PRIMARY KEY,
    lib_produit VARCHAR(255),
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    branche VARCHAR(255),
    type_risque VARCHAR(255),
    codification_produit VARCHAR(255),
    Id_compagnie VARCHAR(255),
    taux_commission DECIMAL(15,2),
    montant_fixe_commission VARCHAR(255),
    taux_taxe VARCHAR(255),
    code_groupe_prod VARCHAR(255),
    frais_gestion INT,
    frais_adhesion INT,
    taux_frais_gestion DECIMAL(15,2),
    taux_com_premiere_an DECIMAL(15,2),
    taux_com_an_suivant DECIMAL(15,2),
    daterecupserveur DATETIME
);

CREATE TABLE Contrat (
    id_contrat VARCHAR(255) PRIMARY KEY,
    estprojet BOOLEAN,
    numPolice VARCHAR(255),
    date_acte DATETIME,
    date_effet DATETIME,
    Date_echeance DATETIME,
    duree_contrat INT,
    ID_Client VARCHAR(255),
    Id_produit VARCHAR(255),
    prime_nette_brute INT,
    reductions VARCHAR(255),
    prime_net_red INT,
    Id_compagnie VARCHAR(255),
    accessoires INT,
    taxe INT,
    CEMAC INT,
    CSS INT,
    TSVL INT,
    CCA INT,
    prime_totale INT,
    montant_reductions INT,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_enreg DATETIME,
    date_modif DATETIME,
    nature_contrat VARCHAR(255),
    type_doc VARCHAR(255),
    attestation_jaune VARCHAR(255),
    attestation_rose VARCHAR(255),
    commission_courtier INT,
    CodeAgence VARCHAR(255),
    numAvenant VARCHAR(255),
    code_apporteur VARCHAR(255),
    taux_com_apporteur DECIMAL(15,2),
    montant_com_apporteur INT,
    type_contrat VARCHAR(255),
    surprime_taux DECIMAL(15,2),
    surprime_fixe INT,
    montant_surprime INT,
    fractionnement DECIMAL(15,2),
    daterecupserveur DATETIME,
    est_suspendu BOOLEAN,
    date_début_suspension DATETIME,
    date_fin_suspension DATETIME,
    Motif_avenant VARCHAR(255),
    duree_paiement INT,
    frequence_paiement VARCHAR(255),
    observation TEXT,
    piece_justif VARCHAR(255),
    est_resilier BOOLEAN,
    date_resiliation DATETIME,
    prime_ristone DECIMAL(15,2),
    numPolice_assureur VARCHAR(255),
    generation_auto_cotisation BOOLEAN
);

CREATE TABLE Risques (
    id_risque VARCHAR(255) PRIMARY KEY,
    type_risque VARCHAR(255),
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    designation_risque VARCHAR(255),
    veh_marque VARCHAR(255),
    veh_modele VARCHAR(255),
    veh_type VARCHAR(255),
    veh_energie VARCHAR(255),
    veh_carrosserie VARCHAR(255),
    veh_puissance VARCHAR(255),
    veh_valeurneuve VARCHAR(255),
    veh_valeurvenale VARCHAR(255),
    veh_datemisecircul DATETIME,
    veh_immat VARCHAR(255),
    veh_chassis VARCHAR(255),
    veh_usage VARCHAR(255),
    veh_nbplace INT,
    veh_cat VARCHAR(255),
    veh_nbremorque INT,
    veh_conducteur_hab VARCHAR(255),
    veh_mat_inflammable BOOLEAN,
    bat_adresse VARCHAR(255),
    bat_localisation VARCHAR(255),
    bat_activite VARCHAR(255),
    bat_type VARCHAR(255),
    bat_usage VARCHAR(255),
    bat_superficie DECIMAL(15,2),
    bat_nb_piece INT,
    bat_valeur DECIMAL(15,2),
    bat_systeme_secu VARCHAR(255),
    bat_qualite_assure VARCHAR(255),
    veh_type_remorque VARCHAR(255),
    veh_marque_remorque VARCHAR(255),
    veh_immat_remorque VARCHAR(255),
    ass_nom VARCHAR(255),
    ass_prenom VARCHAR(255),
    ass_datenaissance DATETIME,
    ass_adresse VARCHAR(255),
    ass_bp VARCHAR(255),
    ass_ville VARCHAR(255),
    ass_telephone VARCHAR(255),
    ass_facebook VARCHAR(255),
    ass_autreinfo VARCHAR(255),
    ass_profession VARCHAR(255),
    ass_personne_acontacter VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE Garanties (
    ID_Garantie VARCHAR(255) PRIMARY KEY,
    lib_garantie VARCHAR(255),
    Id_produit VARCHAR(255),
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    inclus_PF BOOLEAN,
    inclus_ValeurVenal BOOLEAN,
    num_ordre INT,
    est_obligatoire BOOLEAN,
    capital_deces INT,
    capital_invalidite INT,
    capital_fraismedicaux INT,
    tx_commision DECIMAL(15,2),
    tx_taxe DECIMAL(15,2),
    code_groupe_garantie VARCHAR(255),
    inclus_surprime BOOLEAN,
    reduc_com_flotte BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE Contrat_Risques (
    Id_risque VARCHAR(255) PRIMARY KEY,
    Id_contrat VARCHAR(255),
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    daterecupserveur DATETIME,
    attestation_jaune VARCHAR(255),
    attestation_rose VARCHAR(255),
    montant_cotisation INT,
    mode_paiement VARCHAR(255),
    est_incorporation BOOLEAN,
    jour_debut_cotisation INT,
    date_debut_cotisation DATETIME
);

CREATE TABLE Contrat_Garanties (
    ID_Garantie VARCHAR(255) PRIMARY KEY,
    Id_contrat VARCHAR(255),
    lib_garantie VARCHAR(255),
    capital VARCHAR(255),
    nb_risque INT,
    prime_annuelle INT,
    prime_periode INT,
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    franchise VARCHAR(255),
    Id_risque VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE Agence (
    CodeAgence VARCHAR(255) PRIMARY KEY,
    numero_agence VARCHAR(255),
    nom_agence VARCHAR(255),
    adresse_agence VARCHAR(255),
    tel_agence VARCHAR(255),
    email_agence VARCHAR(255),
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    date_modif DATETIME,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE Contact_compagnie (
    idcontact_compagnie VARCHAR(255) PRIMARY KEY,
    Nom_contact VARCHAR(255),
    tel_contact VARCHAR(255),
    whatsapp_contact VARCHAR(255),
    email_contact VARCHAR(255),
    fonction_contact VARCHAR(255),
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    date_modif DATETIME,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    Id_compagnie VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE DOCUMENTS (
    IDDOCUMENTS VARCHAR(255) PRIMARY KEY,
    sync BOOLEAN,
    effacer BOOLEAN,
    date_synchro DATETIME,
    date_modif DATETIME,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    titre_document VARCHAR(255),
    ID_Client VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE cat_vehicule (
    code_cat VARCHAR(255) PRIMARY KEY,
    lib_cat VARCHAR(255),
    description_cat TEXT,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_modif DATETIME,
    date_synchro DATETIME,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    enable_flotte BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE tarif_auto (
    idtarif VARCHAR(255) PRIMARY KEY,
    id_produit VARCHAR(255),
    groupe VARCHAR(255),
    code_cat VARCHAR(255),
    energie VARCHAR(255),
    puissance_fiscale INT,
    valeur_vehicule INT,
    ID_Garantie VARCHAR(255),
    prime_fixe INT,
    surprime_passager DECIMAL(15,2),
    franchise_fixe INT,
    taux_franchise DECIMAL(15,2),
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    capital INT,
    surprime_remorque DECIMAL(15,2),
    franchise_min INT,
    prime_minimun INT,
    prime_taux DECIMAL(15,2),
    prime_taux_sur VARCHAR(255),
    franchise_max INT,
    Id_compagnie VARCHAR(255),
    prime_taux_garantie VARCHAR(255),
    surprime_passager_fixe VARCHAR(255),
    nb_passager_surprime INT,
    daterecupserveur DATETIME
);

CREATE TABLE quittance (
    idquittance VARCHAR(255) PRIMARY KEY,
    Id_contrat VARCHAR(255),
    date_synchro DATETIME,
    effacer BOOLEAN,
    date_enreg DATETIME,
    sync BOOLEAN,
    numquittance VARCHAR(255),
    prime_totale INT,
    etat_quittance INT,
    prime_reverse BOOLEAN,
    date_annulation DATETIME,
    annuler_par VARCHAR(255),
    est_regle_chez_assureur BOOLEAN,
    IDUTILISATEUR VARCHAR(255),
    id_cotisation VARCHAR(255),
    daterecupserveur DATETIME,
    observation_quittance TEXT
);

CREATE TABLE ATTESTATION (
    id_compagnie VARCHAR(255) PRIMARY KEY,
    id_attestation VARCHAR(255),
    Num_attestation VARCHAR(255),
    Etat_attestation INT,
    Remarque_attestation TEXT,
    date_synchro DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_enreg DATETIME,
    date_modif DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    type_attestation VARCHAR(255),
    ref_lot VARCHAR(255),
    CodeAgence VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE Caisse (
    IDCaisse VARCHAR(255) PRIMARY KEY,
    Categorie_Caisse VARCHAR(255),
    seuil_encaissement DECIMAL(15,2),
    sync BOOLEAN,
    Effacer BOOLEAN,
    lib_caisse VARCHAR(255),
    est_archiver BOOLEAN,
    date_synchro DATETIME,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    est_caisse_principale BOOLEAN,
    detenteeur_caisse VARCHAR(255),
    CodeAgence VARCHAR(255),
    daterecupserveur DATETIME,
    Nom_utilisateur VARCHAR(255),
    nom_agence VARCHAR(255),
    solde_caisse VARCHAR(255)
);

CREATE TABLE MOUVEMENTS (
    idquittance VARCHAR(255) PRIMARY KEY,
    idmouvement VARCHAR(255),
    datemouvement DATETIME,
    mont_debit VARCHAR(255),
    mont_credit VARCHAR(255),
    observation TEXT,
    sync BOOLEAN,
    Effacer BOOLEAN,
    IDTYPE_MVT VARCHAR(255),
    solde_caisse VARCHAR(255),
    LibType_Mouvement VARCHAR(255),
    idtransfert VARCHAR(255),
    nature_compte VARCHAR(255),
    date_annulation DATETIME,
    num_MVT INT,
    est_annuler_par VARCHAR(255),
    date_enreg_mvt DATETIME,
    est_annuler BOOLEAN,
    IDCaisse VARCHAR(255),
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    Nom_utilisateur VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE TYPE_MVT_AUTOMATIQUE (
    IDTYPE_MVT VARCHAR(255) PRIMARY KEY,
    LibType_Mouvement VARCHAR(255),
    typeOP BOOLEAN,
    Acteur VARCHAR(255),
    date_synchro DATETIME,
    effacer BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE TYPE_MVT_MANUEL (
    IDTYPE_MVT VARCHAR(255) PRIMARY KEY,
    LibType_Mouvement VARCHAR(255),
    typeOP BOOLEAN,
    Effacer BOOLEAN,
    Acteur VARCHAR(255),
    IDUTILISATEUR_save VARCHAR(255),
    date_enreg DATETIME,
    date_modif DATETIME,
    date_synchro DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE VISIBILITE_CAISSE (
    estvisible BOOLEAN PRIMARY KEY,
    sync BOOLEAN,
    IDCaisse VARCHAR(255),
    IDUTILISATEUR_save VARCHAR(255),
    date_synchro DATETIME,
    date_enreg DATETIME,
    ID_utilisateur VARCHAR(255),
    date_modif DATETIME,
    effacer BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE FRAIS_ACCESSOIRE (
    IDFRAISACCESS VARCHAR(255) PRIMARY KEY,
    INTERV_MIN INT,
    INTERV_MAX INT,
    MONTANT INT,
    Id_compagnie VARCHAR(255),
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE COMMISSION_CATEGORIE (
    Code_cat VARCHAR(255) PRIMARY KEY,
    Id_compagnie VARCHAR(255),
    tx_commision DECIMAL(15,2),
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    date_enreg DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE tarif_mrh (
    ID_Garantie VARCHAR(255) PRIMARY KEY,
    IDtarif_mrh VARCHAR(255),
    id_produit VARCHAR(255),
    idcompagnie VARCHAR(255),
    montant_plafond INT,
    taux DECIMAL(15,2),
    franchise_min INT,
    franchise_max INT,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    date_modif DATETIME,
    surprime_taux DECIMAL(15,2),
    surprime_fixe INT,
    prime_fixe INT,
    franchise_fixe INT,
    taux_franchise DECIMAL(15,2),
    capital_min VARCHAR(255),
    capital_max VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE REVERSEMENT_PRIME (
    idreversement VARCHAR(255) PRIMARY KEY,
    idgroupereversement VARCHAR(255),
    num_ordre_rev VARCHAR(255),
    lib_reversement VARCHAR(255),
    Idquittance VARCHAR(255),
    montant_reverse INT,
    datereversement DATETIME,
    date_enreg DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    Id_compagnie VARCHAR(255),
    idmouvement VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE GROUPE_GARANTIE (
    code_groupe_garantie VARCHAR(255) PRIMARY KEY,
    lib_groupe_garantie VARCHAR(255),
    Code_groupe_prod VARCHAR(255),
    sync BOOLEAN,
    effacer BOOLEAN,
    date_synchro DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE Demande_Annulation (
    ID_Demande VARCHAR(255) PRIMARY KEY,
    Date_Demande DATETIME,
    Raison VARCHAR(255),
    Statut VARCHAR(255),
    Commentaire TEXT,
    date_synchro DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_enreg DATETIME,
    date_Modification DATETIME,
    idquittance VARCHAR(255),
    ID_utilisateur VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE Validation_Demande_Annulation (
    ID_Validation VARCHAR(255) PRIMARY KEY,
    ID_Demande VARCHAR(255),
    Role_Responsable VARCHAR(255),
    Statut VARCHAR(255),
    Date_Validation DATETIME,
    Commentaire TEXT,
    IDUTILISATEUR VARCHAR(255),
    date_enreg DATETIME,
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE Declaration_Sinistre (
    ID_Sinistre VARCHAR(255) PRIMARY KEY,
    Date_Sinistre DATETIME,
    Type_Sinistre VARCHAR(255),
    Lieu_Sinistre VARCHAR(255),
    Description_Sinistre TEXT,
    Statut VARCHAR(255),
    Commentaire TEXT,
    Date_Declaration DATETIME,
    date_modif DATETIME,
    date_enreg DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    id_contrat VARCHAR(255),
    ID_utilisateur VARCHAR(255),
    Nom_declarant VARCHAR(255),
    Adresse_declarant VARCHAR(255),
    telephone_declarant VARCHAR(255),
    mail_declarant VARCHAR(255),
    type_dommage VARCHAR(255),
    Description_dommage TEXT,
    Nom_adverse VARCHAR(255),
    adresse_adverse VARCHAR(255),
    telephone_adverse VARCHAR(255),
    assureur_adverse VARCHAR(255),
    numpolice_adverse VARCHAR(255),
    detail_bien_impliquer TEXT,
    daterecupserveur DATETIME,
    numero_sinistre VARCHAR(255)
);

CREATE TABLE COMMERCIAUX (
    ID_Commercial VARCHAR(255) PRIMARY KEY,
    Nom_Raison_Sociale VARCHAR(255),
    Date_naissance DATETIME,
    Adresse VARCHAR(255),
    Telephone VARCHAR(255),
    Email VARCHAR(255),
    Date_Embauche DATETIME,
    Type_Commercial VARCHAR(255),
    date_Modification DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_enreg DATETIME,
    login_commercial VARCHAR(255),
    mdp_commercial VARCHAR(255),
    NIF_RCCM VARCHAR(255),
    Numero_Piece_Identite VARCHAR(255),
    Sous_Type_Commercial VARCHAR(255),
    Reference_Commercial VARCHAR(255),
    Frequence_paiement VARCHAR(255),
    daterecupserveur DATETIME,
    code_retour VARCHAR(255)
);

CREATE TABLE PAIEMENT_COMMISSIONS (
    IDPAIEMENT_COMMISSIONS VARCHAR(255) PRIMARY KEY,
    date_paiement DATETIME,
    observation TEXT,
    ID_Commercial VARCHAR(255),
    sync BOOLEAN,
    effacer BOOLEAN,
    IDUTILISATEUR_save VARCHAR(255),
    date_synchro DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE DETAILS_PAIEMENT_COMMISSION (
    IDPAIEMENT_COMMISSIONS VARCHAR(255) PRIMARY KEY,
    IDCOMMISSIONS_COMMERCIAL VARCHAR(255),
    montant_paye DECIMAL(15,2),
    sync BOOLEAN,
    date_synchro DATETIME,
    effacer BOOLEAN,
    daterecupserveur DATETIME
);

CREATE TABLE COMMISSIONS_COMMERCIAL (
    IDCOMMISSIONS_COMMERCIAL VARCHAR(255) PRIMARY KEY,
    date_generation DATETIME,
    montant_commission DECIMAL(15,2),
    id_contrat VARCHAR(255),
    ID_Commercial VARCHAR(255),
    effacer BOOLEAN,
    sync BOOLEAN,
    date_modif DATETIME,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_enreg DATETIME,
    statut_commission INT,
    daterecupserveur DATETIME
);

CREATE TABLE REMUNERATION_COMMERCIAUX (
    IDREMUNERATION_COMMERCIAUX VARCHAR(255) PRIMARY KEY,
    code_groupe_prod VARCHAR(255),
    pourcentage_commission DECIMAL(15,2),
    mode_remuneration VARCHAR(255),
    commission_fixe DECIMAL(15,2),
    sync BOOLEAN,
    effacer BOOLEAN,
    IDUTILISATEUR_save VARCHAR(255),
    date_enreg DATETIME,
    date_synchro DATETIME,
    date_modif DATETIME,
    ID_Commercial VARCHAR(255),
    daterecupserveur DATETIME
);

CREATE TABLE cotisations (
    Id_contrat VARCHAR(255) PRIMARY KEY,
    Id_risque VARCHAR(255),
    numero_ordre_cotisation INT,
    id_cotisation VARCHAR(255),
    date_emission DATETIME,
    date_encaissement DATETIME,
    montant_brut INT,
    type_mouvement VARCHAR(255),
    frais_adhesion INT,
    frais_gestion INT,
    montant_investi INT,
    date_enreg DATETIME,
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    est_regle_chez_assureur BOOLEAN,
    daterecupserveur DATETIME,
    montant_commission INT
);

CREATE TABLE Beneficiaire (
    id_beneficiaire VARCHAR(255) PRIMARY KEY,
    nom_beneficiaire VARCHAR(255),
    prenom_beneficiaire VARCHAR(255),
    datenaissance DATETIME,
    adresse_beneficiaire VARCHAR(255),
    bp_beneficiaire VARCHAR(255),
    ville_beneficiaire VARCHAR(255),
    telephone_beneficiaire VARCHAR(255),
    facebook_beneficiaire VARCHAR(255),
    autresinfos_beneficiaire VARCHAR(255),
    profession_beneficiaire VARCHAR(255),
    Id_risque VARCHAR(255),
    date_enreg DATETIME,
    date_modif DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE ENCAISSEMENT_COMMISSION (
    id_encaissement VARCHAR(255) PRIMARY KEY,
    date_encaissement DATETIME,
    idgroupereversement VARCHAR(255),
    montant_total INT,
    date_enreg DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    date_modif DATETIME,
    observation TEXT,
    daterecupserveur DATETIME
);

CREATE TABLE REPART_ACCESSOIRE (
    IDREPART VARCHAR(255) PRIMARY KEY,
    access_min INT,
    access_max INT,
    part_access_fixe INT,
    Part_access_taux DECIMAL(15,2),
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    date_modif DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    Id_compagnie VARCHAR(255),
    date_enreg DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE REVERSEMENT (
    idgroupereversement VARCHAR(255) PRIMARY KEY,
    montant_reverse_total INT,
    datereversement DATETIME,
    date_enreg DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    lib_reversement VARCHAR(255),
    Id_compagnie VARCHAR(255),
    num_ordre_rev VARCHAR(255),
    periode_rev VARCHAR(255),
    est_valide BOOLEAN,
    Commission_genere INT,
    daterecupserveur DATETIME,
    montant_payer INT
);

CREATE TABLE REVERSEMENT_DETAILS (
    idreversement VARCHAR(255) PRIMARY KEY,
    idgroupereversement VARCHAR(255),
    Idquittance VARCHAR(255),
    montant_reverse INT,
    date_enreg DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    daterecupserveur DATETIME,
    montant_commission INT
);

CREATE TABLE REVERSEMENT_REGLEMENT (
    idregle_rev VARCHAR(255) PRIMARY KEY,
    date_reglement DATETIME,
    date_enreg DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    IDUTILISATEUR_save VARCHAR(255),
    Idgroupereversement VARCHAR(255),
    Observation_reglement TEXT,
    Montant_Regle INT,
    Mode_versement VARCHAR(255),
    daterecupserveur DATETIME,
    idmouvement VARCHAR(255)
);

CREATE TABLE TYPE_MOUVEMENT (
    IDTYPE_MVT VARCHAR(50) PRIMARY KEY,
    LibType_Mouvement VARCHAR(255),
    TYPE_ENREG VARCHAR(255),
    IDUTILISATEUR_save VARCHAR(255),
    date_modif DATETIME,
    date_enreg DATETIME,
    effacer BOOLEAN,
    sync BOOLEAN,
    date_synchro DATETIME,
    daterecupserveur DATETIME
);

CREATE TABLE test_batch_import (
    ID INT PRIMARY KEY,
    NAMIF VARCHAR(255),
    DATE DATETIME
);

CREATE TABLE test_import_perf (
    id INT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at DATETIME
);