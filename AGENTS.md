# AGENTS.md — Guide de référence pour assistants et agents automatisés
*Last updated: 2026-06-17*

Ce fichier sert de point d'entrée pour le contexte du projet, les commandes, la charte graphique et les consignes de développement pour le **Hackathon Comutitres & Île-de-France Mobilités (IDFM)** (15 au 19 Juin 2026).

---

Contexte du Hackathon (Juin 2026)
---------------------------------
Comutitres est une filiale d'IDFM gérant l'intégralité du back-office de la billettique (6,7 millions de clients actifs, 9,4 millions de déplacements quotidiens). 

### Chronologie des activités :
- **Lundi 15/06** : Lancement, Présentation Client et démarrage du **Sprint 1**.
- **Mardi 16/06** : Sessions Q&A et **Sprint 2** (Point mi-parcours avec les coachs).
- **Mercredi 17/06** : Flash Pédagogique *« Offline-First Web Apps » (Amin Nairi)* et **Sprint 3**.
- **Jeudi 18/06** : Flash Pédagogique *« CTPO is the new CTO » (Jérémy Serval)*, **Sprint 4**, Nocturne & Soirée Pizza.
- **Vendredi 19/06** : Sprint Final, **Soutenances** (10 min démo + 5 min Q&A) et délibérations du jury.

### Cadrage d'intégration pour le hackathon
- Privilégier les parcours démontrables, les mocks API et les adaptateurs propres plutôt que de rendre la démo dépendante d'intégrations externes.
- Un mode live sandbox peut être ajouté en bonus, sur demande explicite, si l'intégration est simple, isolée par feature flag et accompagnée d'un fallback mock immédiat.
- Ne pas faire dépendre le parcours principal de FranceConnect, API Particulier, CAF/MSA, DGFiP ou autres services sous habilitation.
- Pour les APIs réellement ouvertes (adresse, géographie, Sirene si utile), garder aussi un fallback mock afin que la démo reste stable.
- Les intégrations externes doivent servir les scénarios métier du hackathon : orientation forfait, justificatifs, droits TST/bourse, paiement simulé et back-office.

---

Cartographie de la Documentation (Sources de Vérité)
---------------------------------------------------
Pour éviter toute redondance et pollution de contexte, les règles métier détaillées doivent être consultées directement dans leurs fichiers d'origine :

1. **Notions métier & Modèle de données** : Consulter [notions_metier_structurantes_comutitres.md](docs/notions_metier_structurantes_comutitres.md) (Définitions de Porteur, Payeur, Responsable Légal, Support, Droit).
2. **Cycle de vie & Transitions d'âge** : Consulter [cycle_vie_titres_transport.md](docs/cycle_vie_titres_transport.md) (Bascule Scolaire à 11 ans, compte Connect à 15 ans, payeur à 16 ans, Navigo Senior à 62 ans, TST trimestriel).
3. **Analyse CGVU & Règles spécifiques** : Consulter [analyse_cgvu_idfm_regles_metier.md](docs/analyse_cgvu_idfm_regles_metier.md) (Règles imagine R, impayés Liberté+, cohabitation des cartes, conformité RGPD, Docker & télémétrie Glitchtip/Umami).
4. **FAQ, Perte/Vol & Remboursements** : Consulter [faq_idfm_questions_reponses.md](docs/faq_idfm_questions_reponses.md) (Procédures de SAV, d'opposition et de réclamations).
5. **Attendus & Barème académique (ESGI)** : Consulter [attendus_et_bareme_hackathon_esgi.md](docs/attendus_et_bareme_hackathon_esgi.md) (Critères d'évaluation, répartition des notes de soutenance sur 20 points, exigences UI/UX, Agile, Front/Back, DevOps).
6. **Périmètre fonctionnel & Backlog MVP** : Consulter [perimetre_fonctionnel_hackathon_comutitres.md](docs/perimetre_fonctionnel_hackathon_comutitres.md) (Découpage en priorités MVP 1, 2 et 3, scénarios de démonstration cibles, attendus de la refonte).
7. **Schéma métier global & Modèle conceptuel** : Consulter [schema_enrichi_comutitres.md](docs/schema_enrichi_comutitres.md) (Diagramme ER de relation Porteur/Payeur/Contrat/Droit, architecture macro et états back-office consolidés).
8. **Développement Web Offline-First** : Consulter [offline-first-web.md](docs/offline-first-web.md) (Principes du Manifeste Offline-First, Service Workers, stratégies de cache Cache-First/Network-First/Stale-While-Revalidate, IndexedDB et gestion des conflits).

---

Charte Graphique & Communication (Brief Client)
-----------------------------------------------

### Couleurs de Référence
- **Bleu IDFM** : `#64B5F6` (RVB: `100, 181, 246`)
- **Interaction** : `#1972D2` (RVB: `25, 114, 210`) | **Focus** : `#0050AA` (RVB: `0, 80, 170`)
- **Anthracite** : `#25303B` (RVB: `37, 48, 59`)
- **Bleu clair** : `#F5F9FF` (RVB: `245, 249, 255`) | **Bleu moyen** : `#DEEEFF` (RVB: `222, 238, 255`)
- **Couleurs secondaires** : Rouge (`#C52625`), Orange (`#F39224`), Jaune (`#FFE500`), Rose (`#E72F69`), Violet (`#4F338B`), Vert (`#007D44`).

### Contraintes de Communication (Réseaux Sociaux / Pitchs)
- **Règle absolue** : Ne jamais mentionner ou taguer directement *Île-de-France Mobilités* ou *IDF Mobilités* en public. 
- Taguer et mentionner **Comutitres** uniquement, sans restriction.

---

Commandes courantes
-------------------

### Backend (`back/` - NestJS TypeScript)
- Lancement dev : `pnpm start:dev`
- Compilation/Build : `pnpm build`
- Vérification Lint : `pnpm lint`
- Tests unitaires / E2E : `pnpm test` | `pnpm test:e2e`

### Frontend (`front/` - React Vite TypeScript)
- Lancement dev : `pnpm dev`
- Compilation/Build : `pnpm build`
- Vérification Lint : `pnpm lint`
- Visualiser le build : `pnpm preview`

---

Règles pour les Agents (Agent Rules)
------------------------------------

### I. Philosophie de Développement

1. **Think Before Coding (Penser avant de coder)** :
   - Décrivez votre approche et demandez validation avant d'écrire du code.
   - Posez des questions de clarification au lieu de deviner en cas d'ambiguïté.
   - Présentez les compromis (tradeoffs) plutôt que de choisir une approche silencieusement.
2. **Simplicity First (La simplicité d'abord)** :
   - Écrivez le minimum de code nécessaire. Pas de fonctionnalités spéculatives ni d'abstractions prématurées.
3. **Surgical Changes (Changements chirurgicaux)** :
   - Ne modifiez que le strict nécessaire pour accomplir la tâche. Respectez le style existant du fichier modifié.
   - Ne reformatez pas et ne refactorez pas le code adjacent sain.
4. **Goal-Driven Execution (Exécution par objectif)** :
   - Définissez des critères de succès clairs (ex: tests à passer) et validez vos modifications avant de clore la tâche.

### II. Pratiques Opérationnelles & Efficacité

5. **Compounding Engineering (Capitalisation)** :
   - À chaque correction de l'utilisateur, mettez à jour [AGENTS.md](AGENTS.md) pour éviter que l'erreur ne se reproduise.
6. **Context Minimalism (Minimalisme du contexte)** :
   - Gardez votre contexte de jetons propre. N'ouvrez pas et ne lisez pas de fichiers inutiles pour la tâche en cours.
7. **Feedback Loops & Verification (Boucles de validation)** :
   - Lancez systématiquement les lints, builds et tests appropriés dans les dossiers `front/` ou `back/` avant d'affirmer qu'une modification est fonctionnelle.

Conventions
-----------
- Tenir `AGENTS.md` à jour lorsque de nouveaux docs sont ajoutés.
- Ajouter un en-tête `Last updated: YYYY-MM-DD` lors de toute modification importante.

Mise à jour et maintenance
--------------------------
- Responsable: Équipe projet Comutitres.
- Processus: Mettre à jour les fichiers dans `docs/` puis `AGENTS.md` si nécessaire; ouvrir une PR décrivant les changements.
