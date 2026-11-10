# Téma 4 · Hodina 19: Historický úvod a normy jazyka C++

> **Interaktívna verzia v štýle prednášok Pythonu:** [Otvoriť vizuálnu prednášku s prepínačom žiak/učiteľ, kopírovaním kódu a samoopravným kvízom](./01_Uvod_a_normy_C++.html).

**Veľká téma:** Úvod do programovania v štruktúrovanom programovacom jazyku
**Miesto v kurze:** 19. z 66 vyučovacích hodín; prvá zo štyroch hodín úvodnej témy
**Trvanie:** 45 minút

## Nadväznosť na Python

Študenti už poznajú algoritmy a základy programovania v Pythone. V tejto hodine na tieto vedomosti nadviažu tým, že spoznajú spôsob, akým sa pravidlá jazyka C++ spoločne opisujú a ako kompilátor podľa zvoleného štandardu prekladá program. Syntax C a C++ zatiaľ nezamieňame; podrobné porovnanie príde pri konkrétnych programovacích konštrukciách.

## Ciele hodiny

Na konci hodiny študent:

- vlastnými slovami vysvetlí rozdiel medzi jazykom C++, štandardom C++17 a kompilátorom;
- uvedie, prečo je užitočné dohodnúť sa v kurze na jednej verzii štandardu;
- rozpozná prepínač `-std=c++17` v príkaze na preklad a opíše jeho účel;
- uvedie aspoň jeden míľnik vývoja štandardov C++ bez tvrdenia, že C++17 je najnovšia verzia.

## Predchádzajúce vedomosti a príprava

**Študenti by mali vedieť:** že zdrojový program zapisuje programátor v programovacom jazyku a že na vykonanie programu počítač potrebuje príslušné nástroje. Predchádzajúca znalosť syntaxe C nie je potrebná.

**Príprava prostredia:**

- Na hodinu stačí tabuľa alebo projektor a pripravená časová os pojmov.
- Kompilátor netreba inštalovať ani používať. Ak je v učebni dostupný GCC, učiteľ môže voliteľne ukázať príkaz na preklad; dostupnosť konkrétneho prostredia sa v tejto lekcii nepredpokladá.
- Pripravte kartičky alebo snímku s pojmami **programátor**, **zdrojový kód**, **C++**, **štandard C++17**, **kompilátor** a **spustiteľný program**.

## Časový plán na 45 minút

| Čas | Trvanie | Časť hodiny | Činnosť |
|---|---:|---|---|
| 0–5 min | 5 min | Úvod a motivácia | Krátka časť úvodného videa alebo otázka, prečo rôzni programátori potrebujú spoločné pravidlá. |
| 5–11 min | 6 min | Historický úvod | Umiestnenie C++ a hlavných štandardov na časovú os. |
| 11–19 min | 8 min | Výklad pojmov | Rozlíšenie jazyka, štandardu, kompilátora a programu. |
| 19–25 min | 6 min | Prečo C++17 | Vysvetlenie dohodnutého cieľa kurzu a významu prepínača štandardu. |
| 25–32 min | 7 min | Ukážka učiteľa | Prečítanie krátkeho programu C++17 a príkazu na jeho preklad. |
| 32–39 min | 7 min | Aktivita študentov | Práca vo dvojiciach: usporiadanie pojmov a vysvetlenie ich vzťahov. |
| 39–43 min | 4 min | Kontrola porozumenia | Krátke otázky a oprava nepresných tvrdení. |
| 43–45 min | 2 min | Záver | Lístok pri odchode. |
| **Spolu** | **45 min** |  |  |

## Výklad učiteľa

### 1. Stručná história

C++ sa začalo vyvíjať na prelome 70. a 80. rokov 20. storočia. Jazyk vytvoril Bjarne Stroustrup; jeho práca nadviazala na jazyk C a rozšírila ho o ďalšie možnosti. Medzinárodný štandard pomáha presnejšie určiť, čo znamená platný program a aké správanie sa očakáva od jeho implementácie.

Na tabuľu alebo snímku pripravte zjednodušenú časovú os:

**C++ vzniká → C++98 → C++11 → C++14 → C++17 → C++20 → C++23**

Označenia verzií často odkazujú na rok dokončenia technickej práce alebo schválenia. Aktuálny publikovaný štandard je C++23, formálne označený **ISO/IEC 14882:2024**. Preto C++17 v tomto kurze neoznačujeme za najnovšiu verziu: je to dohodnutý cieľ výučby.

### 2. Jazyk, štandard, kompilátor a program

- **C++** je programovací jazyk.
- **Štandard C++17** je verzia špecifikácie, ktorá opisuje pravidlá jazyka C++ a jeho štandardnej knižnice.
- **Kompilátor** je nástroj, ktorý prekladá zdrojový kód. Príkladmi sú GCC, Clang a MSVC. Ich podpora štandardov a dostupných rozšírení sa môže líšiť.
- **Zdrojový kód** je text programu, ktorý napísal programátor.
- **Spustiteľný program** je výsledok prekladu, ktorý možno spustiť v príslušnom prostredí.

Štandard nie je kompilátor ani samostatný program, ktorý sa inštaluje. Prepínač kompilátora môže požiadať o režim konkrétnej verzie štandardu, ale sám nedoplní funkcie, ktoré kompilátor alebo jeho štandardná knižnica nepodporujú.

### 3. Prečo v kurze používame C++17

Kurz používa C++17, aby boli príklady, zadania a nastavenia prekladu v rámci hodín čo najviac zjednotené. Rovnaký štandard znižuje riziko, že si študenti vysvetlia rozdielne výsledky spôsobené odlišnými jazykovými režimami ako chybu v algoritme. C++17 je výučbová voľba kurzu, nie tvrdenie, že novšie verzie neexistujú alebo že každý kompilátor podporuje všetky časti štandardu rovnako.

## Ukážka C++17 a postupný rozbor

Tento krátky program používa `std::string_view`, ktorý patrí do štandardnej knižnice C++17. Jeho účelom v tejto hodine nie je učiť podrobnosti o reťazcoch, ale ukázať vzťah medzi zdrojovým kódom, štandardom a kompilátorom. Podrobnejšie vysvetlenie prvého samostatného programu patrí do hodiny 20.

```cpp
#include <iostream>
#include <string_view>

int main() {
    constexpr std::string_view standard = "C++17";
    std::cout << "Dohodnutý štandard: " << standard << '\n';
    return 0;
}
```

Ak je dostupný kompilátor GCC s podporou C++17, učiteľ môže ukázať preklad:

```sh
g++ -std=c++17 -Wall -Wextra -pedantic main.cpp -o program
```

Na Windows sa výsledný program spúšťa ako `program.exe`; na systémoch Unix-like sa zvyčajne spúšťa príkazom `./program`. Samotný príkaz kompilátora a spustenie závisia od nainštalovaného nástroja a terminálu. V tejto hodine netreba študentom nastavovať vývojové prostredie.

Očakávaný výstup:

```text
Dohodnutý štandard: C++17
```

**Rozbor pre učiteľa:**

1. `#include <iostream>` a `#include <string_view>` sprístupňujú deklarácie zo štandardnej knižnice.
2. `int main()` je vstupný bod programu; podrobný rozbor patrí do nasledujúcej hodiny.
3. `std::string_view` je typ zo štandardnej knižnice, dostupný od C++17.
4. `std::cout` vypíše text a `'\n'` pridá nový riadok.
5. Prepínač `-std=c++17` žiada GCC, aby prekladal v jazykovom režime C++17. Ostatné prepínače zapínajú varovania a prísnejšie diagnostické upozornenia.

Zdôraznite, že príkaz je príklad pre GCC, nie univerzálny príkaz pre všetky kompilátory. Možnosť prekladu v režime C++17 závisí aj od podpory konkrétnej verzie kompilátora a knižnice.

## Aktivita študentov

Vo dvojiciach priraďte kartičky k vysvetleniam a potom ústne opíšte cestu od programu po jeho spustenie:

| Pojem | Vysvetlenie |
|---|---|
| Programátor | Vytvára zdrojový kód. |
| C++ | Jazyk, v ktorom je zdrojový kód napísaný. |
| C++17 | Verzia štandardu jazyka C++. |
| GCC | Príklad kompilátora, ktorý môže prekladať C++ kód. |
| `-std=c++17` | Príklad požiadavky na jazykový režim kompilátora GCC. |
| Spustiteľný program | Výsledok prekladu, ktorý možno spustiť v príslušnom prostredí. |

**Očakávaný výsledok:** študenti správne odlíšia špecifikáciu jazyka od nástroja a zoradia pojmy približne takto: programátor → zdrojový kód v C++ → kompilátor nastavený na C++17 → spustiteľný program.

### Úlohy

**Základná úroveň**

Prečítajte si príkaz:

```sh
g++ -std=c++17 main.cpp -o program
```

Pomenujte kompilátor, súbor so zdrojovým kódom, zvolený štandard a názov výsledného programu.

**Kritérium úspechu:** správne označíte `g++`, `main.cpp`, `-std=c++17` a `program`.

**Rozširujúca úroveň**

Posúďte tvrdenie: „Ak dvaja študenti používajú rôzne verzie kompilátora, určite používajú rôzne programovacie jazyky.“ Opravte ho tak, aby rozlišovalo verziu nástroja od štandardu jazyka, a uveďte, čo ešte treba skontrolovať pri porovnávaní prostredí.

**Očakávaný výsledok:** rôzne verzie kompilátora môžu implementovať rovnaký jazykový štandard; treba overiť podporu štandardu a nastavený jazykový režim.

## Otázky na priebežné overenie

1. Je C++17 názov kompilátora, programovacieho jazyka alebo verzie štandardu?
2. Čo robí kompilátor so zdrojovým kódom?
3. Čo v príkaze GCC vyjadruje `-std=c++17`?
4. Znamená dohoda na C++17, že ide o najnovšiu verziu C++?

**Očakávané odpovede:** C++17 je verzia štandardu jazyka C++; kompilátor prekladá zdrojový kód; `-std=c++17` žiada GCC o jazykový režim C++17; nie, existuje aj C++23.

## Lístok pri odchode

Pred odchodom dokončite dve vety:

1. „C++17 je …“
2. „V kurze sa držíme C++17, aby …“

**Kontrola:** odpoveď má správne pomenovať štandard a uviesť spoločné nastavenie alebo konzistentné príklady ako dôvod.

## Časté chyby a nedorozumenia

- **„C++17 je iný jazyk než C++.“** C++17 je verzia štandardu jazyka C++.
- **„Kompilátor je štandard.“** Kompilátor je nástroj; štandard je špecifikácia.
- **„Každý kompilátor podporuje všetky štandardy rovnako.“** Podpora závisí od kompilátora, jeho verzie a štandardnej knižnice.
- **„`-std=c++17` nainštaluje podporu C++17.“** Prepínač iba vyberá jazykový režim, ktorý musí kompilátor podporovať.
- **„C++17 je najnovší štandard.“** Kurz si ho zvolil ako spoločný výučbový cieľ; publikovaný štandard C++23 je novší.
- **„C a C++ sú totožné.“** Sú to príbuzné, ale odlišné jazyky. V kurze píšeme C++17 a syntax C používame iba pri výslovnom porovnaní.

## Pomôcky, video a domáca úloha

**Pomôcky:** tabuľa alebo projektor, časová os štandardov, kartičky s pojmami. Kompilátor je voliteľný pre učiteľskú ukážku; dostupnosť vybavenia sa nepredpokladá.

**Video:** [Kurz C C++ | Lekcia 1 | Úvod – Informatika s Mišom](https://www.youtube.com/watch?v=bz-IgboqUP0&list=PLNAMH_0HgWT_lzUDYYKHYczKvjT4xqLCn&index=1). Použite iba krátku motivačnú časť; keďže video patrí ku kurzu C/C++, vysvetlite, že praktická časť tohto kurzu používa C++17 a že syntax C a C++ sa nemá zamieňať.

**Domáca úloha (dobrovoľná):** Vysvetlite vlastnými slovami rozdiel medzi štandardom a kompilátorom. Ak poznáte nástroj, ktorý používate, zistite jeho názov; nič neinštalujte ani nemeňte v nastaveniach.

## Poznámky pre učiteľa

- Cieľovou skupinou sú študenti 2. ročníka; predpokladajte skúsenosť s programovaním v Pythone podľa README kurzu, nie znalosť syntaxe C.
- Hlavným výstupom je presné rozlíšenie pojmov a dôvod používania C++17. Historický prehľad udržte stručný.
- Ukážku s `std::string_view` použite ako názorný príklad štandardnej knižnice C++17; nevysvetľujte do hĺbky jej životnosť ani vnútornú implementáciu.
- Ak v prostredí nie je vhodný kompilátor, rozoberte príkaz iba na tabuli. Neinštalujte ani nekonfigurujte nástroje bez overenia miestnych pravidiel.
- **Obsah podľa osnovy:** historický úvod, účel C++, normy jazyka a prehľad kompilácie.
- **Dobrovoľné rozšírenie:** konkrétny preklad krátkeho programu a porovnanie jazykových režimov kompilátora.

## Zdroje

- [ISO: ISO/IEC 14882:2024 – Programming languages — C++](https://www.iso.org/standard/83626.html) — publikovaný štandard C++23.
- [Standard C++: The Standard](https://isocpp.org/std/the-standard) — vysvetlenie označenia C++23 a súvislosti s ISO/IEC 14882:2024.
- [GCC: Language Standards Supported by GCC](https://gcc.gnu.org/onlinedocs/gcc/Standards.html) — spôsob výberu jazykového štandardu a podpora štandardov v GCC.
- [Bjarne Stroustrup: FAQ](https://www.stroustrup.com/bs_faq.html) — doplnkový zdroj informácií o autorovi a histórii C++.
- [Video: Kurz C C++ | Lekcia 1 | Úvod](https://www.youtube.com/watch?v=bz-IgboqUP0&list=PLNAMH_0HgWT_lzUDYYKHYczKvjT4xqLCn&index=1) — motivačný úvod.
- [cppreference: `std::basic_string_view`](https://en.cppreference.com/w/cpp/string/basic_string_view) — doplnková referencia k typu `std::string_view`.
