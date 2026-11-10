# Programovanie – Výučbový repozitár pre Stredné Odborné Školy

Vítajte v oficiálnom vzdelávacom repozitári pre predmet **Programovanie**. Repozitár je koncipovaný ako ucelená výučbová platforma určená pre študentov stredných odborných škôl so zameraním na **informatiku, mechatroniku a elektrotechniku**.

Cieľom kurzu je prejsť od úplných základov verzionovania kódu a skriptovania až po pokročilé procedurálne, objektovo orientované a systémové programovanie pre operačný systém Windows.

---

## 🗺️ Interaktívna orientácia v kurze

Kurz pozostáva z 5 nadväzujúcich modulov. Kliknutím na modul prejdete na jeho podrobnú dokumentáciu:

| Modul | Obsah a technológie | Výsledok učenia študenta |
| :--- | :--- | :--- |
| 🎓 [`00_Git_a_Verzovanie`](./00_Git_a_Verzovanie/) | Git, GitHub, správa verzií, vetvenie, riešenie konfliktov | Študent bezpečne spravuje zdrojový kód, tvorí commity a spolupracuje v tíme. |
| 🐍 [`01_Python`](./01_Python/) | Python 3, algoritmy, dátové štruktúry, OOP, súbory | Študent rozvíja algoritmické myslenie a dokáže vytvárať vlastné skripty a aplikácie. |
| ⚙️ [`02_C`](./02_C/) | ANSI C / C99 / C17, správa pamäte, ukazovatele, štruktúry | Študent rozumie pracám s pamäťou, ukazovateľom a nízkourovňovému riadeniu. |
| 🧩 [`03_C++`](./03_C++/) | Moderné C++ (C++17), OOP, RAII, STL kontajnery, polymorfizmus | Študent dokáže navrhovať štruktúrované, bezpečné a objektovo orientované aplikácie. |
| 🖥️ [`04_Win32_API`](./04_Win32_API/) | Win32 API, C/C++, GUI okno, WndProc, udalosti, GDI | Študent rozumie tvorbe natívnych desktopových okenných aplikácií pre OS Windows. |

---

## 🎓 Odporúčaná učebná cesta (Roadmapa)

Pre dosiahnutie najlepších výsledkov odporúčame dodržiavať nasledujúcu pedagogickú postupnosť:

```text
       00_Git_a_Verzovanie
   (Správa verzií a práca v tíme)
               ↓
           01_Python
   (Algoritmy a základy skriptovania)
               ↓
             02_C
   (Procedurálne programovanie a pamäť)
               ↓
            03_C++
   (Objektový návrh a moderné C++)
               ↓
          04_Win32_API
   (Natívne desktopové aplikácie pre Windows)
```

*Poznámka: Poradie reprezentuje odporúčanú metodickú nadväznosť. Výučbu je možné prispôsobiť predchádzajúcim vedomostiam žiakov.*

---

## 🛠️ Technické požiadavky na softvér

Pre prácu na cvičeniach budete potrebovať nasledujúce overené vývojové nástroje:

1. **Verzionovací systém**:
   - [Git SCM](https://git-scm.com/doc) (vrátane Git Bash pre Windows)
2. **Vývojové prostredie (IDE) & Editory**:
   - [Visual Studio Code](https://code.visualstudio.com/) (s rozšíreniami *Python*, *C/C++ Extension Pack*)
   - [Microsoft Visual Studio Community](https://visualstudio.microsoft.com/) (požadovaný modul *Desktop development with C++*)
3. **Kompilátory a interpretre**:
   - **Python 3.10+**: [Oficiálna dokumentácia Pythonu](https://docs.python.org/3/tutorial/)
   - **GCC / MinGW-w64**: [GCC Documentation](https://gcc.gnu.org/)
   - **MSVC (Microsoft Visual C++)**: Pre Win32 API vývoj

---

## 📺 Odporúčané externé výučbové zdroje

- 🎬 **YouTube kanál Informatika s Mišom**: [Informatika s Mišom](https://www.youtube.com/@InformatikasMi%C5%A1om)
- 📖 **Slovenský kurz Pythonu**: [python.input.sk](https://python.input.sk/)
- 🌐 **W3Schools Tutoriály**: [W3Schools Python](https://www.w3schools.com/python/), [W3Schools C](https://www.w3schools.com/c/), [W3Schools C++](https://www.w3schools.com/cpp/)
- 📚 **Odborná dokumentácia**: [cppreference.com (C/C++)](https://en.cppreference.com/w/), [Microsoft Learn Win32 API](https://learn.microsoft.com/en-us/windows/win32/desktop-programming)

---

## 💡 Pokyny pre prácu študenta

1. **Klonovanie repozitára**:
   ```bash
   git clone https://github.com/DC-SPS/Programovanie.git
   cd Programovanie
   ```
2. **Priebeh výučby**:
   - Otvorte si požadovaný modul a prečítajte si lokálne `README.md`.
   - Prechádzajte jednotlivé lekcie v podadresároch a riešte priložené úlohy v priečinku `cvicenia/`.
   - Na záver modulu vypracujte praktický miniprojekt v priečinku `projekty/`.

---

## 🤝 Prispievanie a pravidlá

Pravidlá pre prácu s kódovým štýlom, štruktúrou lekcií a pridávanie nových cvičení pre učiteľov nájdete v dokumente [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

*Prajeme vám veľa úspechov pri štúdiu programovania!*

## Synchronizácia prednášok cez Firebase

Prednášky používajú Google Authentication a Realtime Database. Prihlasovanie cez synchronizačný panel je dostupné po otvorení stránky na doméne povolenej vo Firebase. Synchronizácia zdieľa stránku, sekciu, stav prehrávania, režim Žiak/Učiteľ, rýchlosť a hlas. QR kód otvor na druhom zariadení a prihlás sa tým istým účtom.

### Nastavenie Firebase

1. Vytvor projekt vo [Firebase Console](https://console.firebase.google.com/) alebo použi projekt `programovanie-sps`.
2. V **Authentication → Sign-in method** povoľ poskytovateľa **Google**.
3. V **Authentication → Settings → Authorized domains** pridaj doménu produkčného nasadenia `programovanie-gules.vercel.app` a doménu na lokálny vývoj (`localhost`, ak ju Firebase projekt povoľuje).
4. V **Realtime Database** vytvor databázu v regióne **europe-west1**. Webová URL musí byť `https://programovanie-sps-default-rtdb.europe-west1.firebasedatabase.app`. Ak Firebase pridelí inú URL alebo názov databázy, aktualizuj `databaseURL` v `firebase-config.js` podľa URL zobrazenej v konzole.
5. Nasaď pravidlá z repozitára: `npx firebase-tools deploy --only database --project programovanie-sps`. Pravidlá povoľujú čítanie a zápis iba prihlásenému vlastníkovi pod `/sessions/{uid}` a `/presence/{uid}`.
6. Over, že `apiKey`, `authDomain`, `projectId` a `appId` v `firebase-config.js` patria k webovej aplikácii tohto Firebase projektu.

Synchronizácia používa ID zariadenia uložené v `localStorage`; samotný obsah stránok zostáva statický a dostupný podľa existujúcej ochrany nasadenia.
