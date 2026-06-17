# Développement d'applications Offline-First pour le Web

**Concevoir des applications web résilientes, performantes et disponibles même hors-ligne**

---

## Le constat : la connectivité n'est pas fiable

### ✅ 3G/4G/5G

Couverture encore partielle, zones d'ombre fréquentes.

### ⚠️ WiFi public

Instable, capricieux, parfois payant ou avec portail captif.

### 🚫 Mode Avion / Tunnel

Métro, avion, montagne : la perte de connexion est la norme.

> "Le réseau n'est pas un endroit sûr pour stocker vos données"
> — *Principles of Offline-First Development*

---

## Approche traditionnelle vs Offline-First

### ❌ Online-First

- Le serveur est la **source de vérité**.
- Sans réseau = page blanche ou spinner.
- L'utilisateur subit la latence réseau.
- Requête → attente → réponse.
- UX dégradée, frustration utilisateur.
- 53 % des utilisateurs quittent un site qui met plus de 3 secondes à charger.

### ✅ Offline-First

- Le client est la **source de vérité**.
- Fonctionne avec ou sans réseau.
- Réponses instantanées grâce au cache local.
- Synchronisation en arrière-plan quand le réseau est disponible.
- Priorité à l'expérience utilisateur.
- Les données sont toujours disponibles.

---

## Qu'est-ce que le Offline-First ?

Le **Offline-First** est un paradigme de conception où l'application est pensée pour fonctionner prioritairement avec des données locales, puis se synchronise avec le serveur de manière asynchrone lorsque la connexion est disponible.

### Piliers principaux

- **Données locales** : stockage local comme source principale.
- **Sync asynchrone** : synchronisation en tâche de fond.
- **Résilience réseau** : fonctionnement en mode dégradé gracieux.

---

## Le manifeste Offline-First

1. **Local d'abord**
   Les opérations s'exécutent d'abord localement. L'utilisateur n'attend jamais le réseau.

2. **Sync en arrière-plan**
   La synchronisation avec le serveur se fait de manière asynchrone et transparente.

3. **Gestion des conflits**
   Stratégies de résolution de conflits : Last-Write-Wins, CRDT, Operational Transform.

4. **Progression**
   L'application fonctionne même hors-ligne : le réseau est une amélioration, pas une nécessité.

5. **Expérience utilisateur**
   L'utilisateur ne doit jamais être bloqué par l'absence de réseau.

---

## Pourquoi Offline-First ?

### 📈 Expérience utilisateur

- **Instantané** : pas de temps d'attente.
- **Toujours disponible** : même en mode avion.
- **Transparent** : l'utilisateur ne voit pas la différence.
- **Fluide** : pas de spinners ni de pages blanches.

### ⚙️ Technique

- **Portée mondiale** : fonctionne partout.
- **Réduction de la latence** : données en local.
- **Résilience** : tolérance aux pannes réseau.
- **Coûts serveur réduits** : moins de requêtes API.

---

## Cas d'usage concrets

### 📝 Google Docs / Notion

Édition hors-ligne, synchronisation automatique et conflits gérés.

### 📧 Gmail / Outlook

Composition hors-ligne, envoi différé et brouillons locaux.

### 🎵 Spotify / Netflix

Téléchargement, lecture hors-ligne et mise en cache intelligente.

### 🛒 Applications e-commerce

Panier hors-ligne, catalogue en cache et commandes différées.

### 🏥 Santé / Médical

Dossiers patients accessibles même sans réseau.

### 🏗️ BTP / Terrain

Relevés sur chantier sans connexion, puis synchronisation au retour.

---

## Architecture d'une application Offline-First

Le **Service Worker** intercepte chaque requête HTTP et décide, selon la stratégie, s'il répond depuis le cache ou s'il contacte le serveur.

### Côté client

- Interface utilisateur
- Service Worker
- Cache API
- IndexedDB
- Cache Storage

### Côté serveur

- API Server
- Base de données

### Stratégies possibles

- Cache First
- Network First
- Synchronisation en arrière-plan

---

## Les technologies clés

### Service Worker

Script qui tourne en arrière-plan, indépendant de la page.

Fonctionnalités :

- Intercepte les requêtes réseau.
- Gère le cache.
- Permet les push notifications.
- Permet la synchronisation en arrière-plan.

### Cache API

Stocke les paires `Request` → `Response`.

Idéal pour :

- Ressources statiques.
- Images, CSS, JS, HTML.
- Stratégies de cache flexibles.
- Accès synchrone.

### IndexedDB

Base de données NoSQL côté navigateur.

Fonctionnalités :

- Stockage structuré : objets, fichiers.
- Requêtes indexées.
- Transactions ACID.
- Grandes quantités de données.

---

## Stockage navigateur : comparatif

| Technologie | Type | Capacité | Persistance | Sync | Cas d'usage |
|---|---|---:|---|---|---|
| `localStorage` | Clé / valeur, chaîne | ~5-10 Mo | ✅ Oui | ❌ Non | Préférences utilisateur |
| `sessionStorage` | Clé / valeur, chaîne | ~5-10 Mo | ❌ Session | ❌ Non | Données temporaires |
| Cache API | Requête / réponse HTTP | ~50 Mo+ | ✅ Oui | ❌ Non | Assets statiques |
| IndexedDB | NoSQL, objets | ~50 Mo - 1 Go+ | ✅ Oui | ❌ Non | Données structurées |
| Cookies | Clé / valeur, chaîne | ~4 Ko | ✅ Oui | ❌ Non | Authentification |

> 💡 À savoir : le Offline-First combine généralement **Cache API** pour les assets et les réponses API, avec **IndexedDB** pour les données métier.

---

## Qu'est-ce qu'un Service Worker ?

Un **Service Worker** est un script JavaScript qui :

- Tourne en arrière-plan.
- Joue le rôle de proxy réseau.
- Est indépendant de la page web.
- Reste actif même page fermée.
- Fonctionne uniquement en HTTPS.

### ✅ Ce qu'il peut faire

- Intercepter les requêtes `fetch`.
- Gérer le cache.
- Recevoir des push notifications.
- Faire de la synchronisation en arrière-plan.

### ❌ Ce qu'il ne peut pas faire

- Accéder au DOM.
- Lire directement le `localStorage`.
- Faire des appels synchrones.
- Bloquer le thread principal.

> 📌 Analogie : c'est comme un proxy inverse situé entre votre application et le réseau, qui vit dans le navigateur.

---

## Cycle de vie d'un Service Worker

1. **Installation**
   Téléchargement du script. Idéal pour pré-cacher les ressources.

2. **Activation**
   Nettoyage des anciens caches. Prise de contrôle des pages.

3. **Fonctionnement**
   Interception des requêtes, gestion du cache, synchronisation.

Flux simplifié :

```text
Install event → skipWaiting → Activate event → Fetch / Message
```

---

## Enregistrement d'un Service Worker

### Points importants

- Le Service Worker doit être servi depuis la même origine que la page.
- Le fichier `sw.js` doit être à la racine pour intercepter toutes les requêtes du scope.
- HTTPS est obligatoire, sauf sur `localhost` pour le développement.

```ts
// main.ts — Dans votre application
if ("serviceWorker" in navigator) {
  // Enregistrement du Service Worker
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("✅ SW enregistré avec succès !");
    })
    .catch((error) => {
      console.error("❌ Échec de l'enregistrement du SW :", error);
    });
}
```

---

## Événement `install` — Pré-cache des ressources

### Objectif

Télécharger et mettre en cache les ressources critiques avant que le Service Worker ne prenne le contrôle.

```js
// sw.js — Événement install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/index.html", "/app.js", "/style.css"]);
    })
  );
});
```

### À retenir

- `waitUntil` prolonge l'événement jusqu'à la fin du cache.
- Utilisez `self.skipWaiting()` pour activer le Service Worker immédiatement.

---

## Événement `activate` — Nettoyage des caches

### Objectif

Nettoyer les anciens caches et prendre le contrôle des pages ouvertes.

```js
// sw.js — Événement activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== "v1")
          .map((key) => caches.delete(key))
      )
    )
  );
});
```

### À retenir

- Supprimez les caches des anciennes versions pour libérer de l'espace.
- Utilisez `self.clients.claim()` pour prendre le contrôle immédiat.

---

## Événement `fetch` — Interception des requêtes

### Objectif

Intercepter chaque requête HTTP et décider quoi répondre : cache ou réseau.

```js
// sw.js — Événement fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### À retenir

- `respondWith` permet de répondre à la requête interceptée.
- Stratégie utilisée ici : **Cache First**.

---

## Stratégie 📦 Cache First

### Principe

Vérifier le cache d'abord. Si la ressource est en cache, on la retourne immédiatement. Sinon, on va la chercher sur le réseau.

```js
// Cache First — Pour les ressources qui changent rarement
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Idéal pour

- Assets statiques : CSS, JS, images.
- Polices et icônes.
- Page d'accueil.

### Attention

- Risque de servir une version obsolète.
- Nécessite une gestion des versions du cache.

---

## Stratégie 🌐 Network First

### Principe

Essayer le réseau d'abord. En cas d'échec, notamment hors-ligne, fallback sur le cache.

```js
// Network First — Pour les données qui doivent être fraîches
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
```

### Idéal pour

- Appels API.
- Données fraîches : météo, actualités.
- Contenu dynamique.

### Inconvénient

- Plus lent quand le réseau est disponible.
- Dépendant de la latence réseau.

---

## Stratégie 🔄 Stale-While-Revalidate

### Principe

Retourner la version en cache immédiatement, puis mettre à jour le cache en arrière-plan avec la version réseau.

```js
// Stale-While-Revalidate — Le meilleur des deux mondes
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        caches.open("v1").then((cache) => cache.put(event.request, response));
        return response.clone();
      });
      return cached || fetchPromise;
    })
  );
});
```

### Idéal pour

- Pages web, articles et blogs.
- Contenu éditorial.

### Avantage

- Réponse instantanée + donnée fraîche.
- L'utilisateur ne voit jamais de spinner.

---

## Stratégie 🚀 Network Only

### Principe

Toujours aller sur le réseau. Pas de fallback cache. Si le réseau est indisponible, la requête échoue.

```js
// Network Only — Pour les opérations critiques
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
```

### Idéal pour

- Paiements en ligne.
- Données sensibles : bancaires, médicales.
- Formulaires d'authentification.

### Risque

- Ne fonctionne pas hors-ligne.
- L'utilisateur voit une erreur si le réseau est absent.

---

## Mise à jour d'un Service Worker

Flux simplifié :

```text
L'utilisateur visite la page
→ register("sw.js")
→ Le fichier est différent, byte-diff
→ install event
→ skipWaiting() pour prendre le contrôle immédiatement
→ Plus aucune page contrôlée par l'ancien Service Worker
→ activate event
→ Nettoyage des anciens caches
→ Les nouvelles pages sont contrôlées
```

---

## IndexedDB — 1. Ouvrir la base et créer le store

### Objectif

Ouvrir ou créer la base IndexedDB et définir la structure des données avec un store et ses index.

```js
// 1. Ouvrir ou créer la base
const request = indexedDB.open("offline-app", 1);

request.onupgradeneeded = () => {
  // 2. Créer le store avec un index pour la sync
  const db = request.result;
  const store = db.createObjectStore("todos", {
    keyPath: "id",
    autoIncrement: true
  });
};
```

### À retenir

- `indexedDB.open(name, version)` crée la base si elle n'existe pas.
- `onupgradeneeded` est appelé à la création ou au changement de version.

---

## IndexedDB — 2. Ajouter des données hors-ligne

### Objectif

Écrire des données dans le store localement, même sans connexion réseau.

```js
request.onsuccess = () => {
  const db = request.result;

  // 3. Ajouter un élément hors-ligne
  const addTx = db.transaction("todos", "readwrite");
  addTx.objectStore("todos").add({
    title: "Apprendre IndexedDB",
    synced: false
  });

  addTx.oncomplete = () => console.log("✅ Élément ajouté !");
};
```

### À retenir

- Une transaction est nécessaire pour toute opération.
- `readwrite` pour écrire, `readonly` pour lire.
- Le flag `synced: false` marque l'élément comme non synchronisé.

---

## IndexedDB — 3. Lire et filtrer les données

### Objectif

Récupérer les données locales et filtrer celles qui doivent être synchronisées avec le serveur.

```js
request.onsuccess = () => {
  const db = request.result;

  // 4. Lire tous les éléments
  const getTx = db.transaction("todos", "readonly");
  const getAll = getTx.objectStore("todos").getAll();

  getAll.onsuccess = () => {
    const todos = getAll.result;
    console.log("📦 Données locales :", todos);

    // 5. Filtrer les éléments non synchronisés
    const unsynced = todos.filter((todo) => !todo.synced);
    console.log("🔄 Éléments à synchroniser :", unsynced.length);
  };
};
```

---

## Synchronisation des données

La synchronisation est le mécanisme qui permet de propager les modifications locales vers le serveur lorsque le réseau revient, puis de récupérer les changements distants.

Points à prévoir :

- Marquer les données non synchronisées.
- Déclencher la synchronisation au retour du réseau.
- Réessayer les opérations échouées.
- Gérer les conflits de manière explicite.

---

## Gestion des conflits

Problème fondamental du Offline-First : que faire quand deux modifications entrent en conflit ?

### 🕐 Last-Write-Wins

La modification la plus récente écrase l'autre.

- Simple à implémenter.
- Peut entraîner une perte de données.

### 🧩 CRDT

**Conflict-free Replicated Data Types**.

- Convergence mathématique.
- Utilisé par des outils collaboratifs comme Figma ou Google Docs.

### ✍️ Operational Transform

Transformation d'opérations pour les appliquer dans le bon ordre.

- Utilisé par Etherpad ou Google Wave.

> 💡 Conseil : commencez par **Last-Write-Wins** avec un timestamp. Passez aux **CRDT** quand la complexité le justifie.

---

## Outils et librairies : Workbox

### 📦 Workbox

Bibliothèque Google qui simplifie la gestion des Service Workers.

```js
// sw.js avec Workbox
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  /\.(?:js|css|png)$/,
  new CacheFirst({ cacheName: 'assets' })
);

registerRoute(
  /\/api\/.*/,
  new NetworkFirst({ cacheName: 'api' })
);
```

### Fonctionnalités clés

- Precaching : pré-cache automatique des assets.
- Stratégies prêtes à l'emploi : `CacheFirst`, `NetworkFirst`, `StaleWhileRevalidate`.
- Background Sync : requêtes différées quand le réseau revient.
- Periodic Sync : mises à jour périodiques.
- Navigation Preload : réduction de la latence.
- Injection automatique du manifeste dans le build.

Ressource : `developer.chrome.com/docs/workbox`

---

## Outils et librairies : RXDB

### 🗄️ RXDB

Base de données réactive pour applications Offline-First.

Fonctionnalités :

- Observables : données réactives avec RxJS.
- Réplication : synchronisation avec CouchDB, Firebase ou GraphQL.
- Schema validation : basé sur JSON Schema.
- Encryption : chiffrement côté client.
- Multiplateforme : Node, Browser, React Native.

```js
const db = await createRxDatabase({
  name: 'mydb',
  storage: getRxStorageDexie()
});

await db.addCollections({
  todos: {
    schema: { version: 0, primaryKey: 'id' }
  }
});

await db.todos.insert({ id: '1', title: 'Offline-First' });

const all = await db.todos.find().exec();
console.log(all);
```

---

## Autres outils et écosystème

### 🗄️ PouchDB

Base NoSQL client-serveur compatible CouchDB.

- Sync bidirectionnelle.

### 🔥 Firebase Firestore

Persistance locale automatique et synchronisation native.

- Mode offline intégré.

### ⚛️ Hoodie

Backend Offline-First sans serveur.

- Idéal pour prototypes.

### 📡 Apollo GraphQL

Cache normalisé, persistance possible.

- Plugin requis.

### 🔌 TanStack Query

Gestion du cache serveur et persistance.

- `persistQueryClient`.

### 🔄 Offline.js

Détection de la connectivité réseau.

- Complémentaire.

---

## PWA + Offline-First : le duo gagnant

Une **Progressive Web App** est le vecteur idéal pour délivrer une expérience Offline-First.

### Installable

L'utilisateur peut ajouter l'application à son écran d'accueil.

### Offline-ready

Service Worker + Cache + IndexedDB.

### Engagement

Push notifications, badge d'icône et ré-engagement.

> Les PWA ont un taux de conversion 36 % supérieur aux applications mobiles natives selon une étude Google de 2023.

---

## Points clés à retenir

### 🎯 Le Offline-First est un mindset

Pensez d'abord à l'expérience hors-ligne. Le réseau est une amélioration progressive.

### 🛡️ Service Workers = clé de voûte

Proxy réseau programmable. Cache, synchronisation et push passent par le Service Worker.

### 📊 IndexedDB pour les données

Stockez les données métier localement. Utilisez Dexie.js ou RXDB pour simplifier.

### 🔄 La synchronisation est un problème complexe

Gérez les conflits dès le départ. Utilisez les CRDT pour les applications collaboratives.

---

## Pour aller plus loin

### Ressources

- `web.dev/learn/pwa`
- `developer.chrome.com/docs/workbox`
- `rxdb.info`
- `pouchdb.com`

### Livres et articles

- *Building Progressive Web Apps* — Tal Ater, O'Reilly
- *Offline First Web Development* — Google Developers
- `offlinefirst.org`
- *Service Worker Cookbook* — Mozilla
- Guide complet PWA par Google
- Documentation Workbox
- Documentation RXDB
- PouchDB — Base de données JavaScript
- Le manifeste Offline-First
- Recettes Service Worker
