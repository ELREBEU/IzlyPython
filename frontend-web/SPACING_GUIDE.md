# Guide de modification des espacements et hauteurs

Ce fichier explique où modifier les espacements et hauteurs des différentes sections de l'application mobile.

## 📍 Fichiers principaux

### 1. Dashboard.jsx (`src/pages/Dashboard.jsx`)

#### Container principal (ligne 39)
```jsx
className="... pt-0 md:pt-12 ..."
```
- `pt-0` : Padding top du container principal (mobile) - ACTUELLEMENT À 0 !
- **Réduis** cette valeur pour remonter TOUT le contenu (mais déjà au minimum)
- **Augmente** cette valeur pour descendre TOUT le contenu (ex: `pt-1`, `pt-2`)

#### Header (Logo + Icône utilisateur) (ligne 42)
```jsx
className="... mb-0 ... py-1.5"
```
- `mb-0` : Margin bottom du header
- `py-1.5` : Padding vertical du header (réduit pour gagner de l'espace)
- Modifie ces valeurs pour ajuster l'espace entre le header et le cercle

#### MoneyCircle Area (ligne 61)
```jsx
className="-mt-4 md:mt-0 mb-0 ..."
```
- `-mt-4` : Margin top négatif pour REMONTER le cercle
- **Plus négatif** (ex: `-mt-6`, `-mt-8`) = cercle plus haut
- **Moins négatif** (ex: `-mt-2`, `-mt-1`) = cercle plus bas
- `mb-0` : Margin bottom du cercle

#### Section "Vos avantages" (ligne 73)
```jsx
className="... py-3 ... -mt-12"
```
- `py-3` : Padding vertical de la section (réduit)
- `-mt-12` : Margin top négatif TRÈS NÉGATIF pour REMONTER la section
- **Plus négatif** (ex: `-mt-14`, `-mt-16`) = section plus haute
- **Moins négatif** (ex: `-mt-10`, `-mt-8`) = section plus basse

### 2. MoneyCircle.jsx (`src/components/MoneyCircle.jsx`)

#### Container du cercle (ligne 8)
```jsx
className="... w-[85vw] h-[85vw] max-w-[390px] max-h-[390px] ... my-0 ..."
```
- `w-[85vw]` et `h-[85vw]` : Taille du cercle en % de la largeur viewport (AUGMENTÉ)
- **Augmente** la valeur (ex: `88vw`, `90vw`) pour un cercle plus GRAND
- **Réduis** la valeur (ex: `82vw`, `80vw`) pour un cercle plus PETIT
- `max-w-[390px]` : Largeur maximale (en pixels) - AUGMENTÉ
- `my-0` : Margin vertical du cercle

#### Padding des cercles intermédiaires (lignes 10, 12, 14)
```jsx
p-5 md:p-12  // Outer circle - RÉDUIT pour cercle blanc plus grand
p-5 md:p-12  // Middle circle 2 - RÉDUIT
p-4 md:p-10  // Middle circle 1 - RÉDUIT
```
- Ces valeurs contrôlent l'épaisseur des anneaux
- **Réduis** pour des anneaux plus fins et un cercle blanc plus grand
- **Augmente** pour des anneaux plus épais et un cercle blanc plus petit

#### Taille du montant (ligne 32)
```jsx
className="text-[3.2rem] ... md:text-8xl ..."
```
- `text-[3.2rem]` : Taille du montant sur mobile (RÉDUIT légèrement)
- **Augmente** (ex: `text-[3.5rem]`, `text-[3.8rem]`) pour un montant plus GRAND
- **Réduis** (ex: `text-[3rem]`, `text-[2.8rem]`) pour un montant plus PETIT

## 🎯 Modifications rapides courantes

### Pour remonter TOUT le contenu d'un cran
✅ **OPTIMISÉ - Valeurs actuelles (DERNIÈRE VERSION) :**
1. `Dashboard.jsx` ligne 39 : `pt-0` (au minimum absolu)
2. `Dashboard.jsx` ligne 61 : `-mt-6` (très négatif - cercle remonté)
3. `Dashboard.jsx` ligne 73 : `-mt-16` (EXTRÊMEMENT négatif - section très remontée)

**Pour remonter ENCORE PLUS (si nécessaire) :**
1. `Dashboard.jsx` ligne 61 : change `-mt-6` → `-mt-8` ou `-mt-10`
2. `Dashboard.jsx` ligne 73 : change `-mt-16` → `-mt-18` ou `-mt-20`

⚠️ **Attention** : Les valeurs actuelles sont déjà très optimisées. Plus négatif peut causer des chevauchements.

### Pour agrandir le cercle du solde
✅ **DÉJÀ FAIT - Valeurs actuelles :**
1. `MoneyCircle.jsx` ligne 8 : `w-[85vw]` et `max-w-[390px]`
2. Padding réduit : `p-5`, `p-5`, `p-4` pour un cercle blanc plus grand

**Pour agrandir ENCORE PLUS :**
1. `MoneyCircle.jsx` ligne 8 : change `w-[85vw]` → `w-[88vw]` ou `w-[90vw]`
2. Ajuste aussi `max-w-[390px]` → `max-w-[410px]`

### Pour réduire l'espace entre les sections
- Augmente les valeurs de margin négatives (`-mt-X`)
- Plus le nombre est grand (ex: `-mt-12`), plus c'est remonté

### Pour augmenter l'espace entre les sections
- Réduis les valeurs de margin négatives (`-mt-X`)
- Ou utilise des margins positives (`mt-X`)

## ⚠️ Points d'attention

- Les modifications affectent **uniquement la version mobile**
- Les classes avec `md:` sont pour desktop, ne les modifie pas
- Teste toujours après chaque modification
- Utilise `npm run dev` pour voir les changements en temps réel
- Access depuis ton téléphone à `http://<ton-ip>:5173`

## 🔍 Classes Tailwind utiles

- `mt-X` : margin-top (positif = descend)
- `-mt-X` : margin-top négatif (négatif = monte)
- `pt-X` : padding-top
- `py-X` : padding vertical (top + bottom)
- `mb-X` : margin-bottom
- `w-[Xvw]` : largeur en % du viewport
- `h-[Xvw]` : hauteur en % du viewport

Où X est un nombre (0, 1, 2, 4, 6, 8, 10, 12, etc.)
