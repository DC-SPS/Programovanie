# Modul 01: Python – Algoritmizácia a základy programovania

Vitajte v druhom module kurzu Programovanie. V tomto module sa **algoritmické myslenie učíte a precvičujete pomocou jazyka Python**. Jeho čitateľná syntax vám umožní sústrediť sa na návrh postupu, jeho kroky a overenie výsledku.

Po zvládnutí základov algoritmizácie v Pythone pokračujte modulom [C](../02_C/README.md) a následne modulom [C++](../03_C++/README.md). V týchto jazykoch budete algoritmy zapisovať ďalej a postupne sa dostanete k typom, pamäti a objektovému návrhu.

## Ciele modulu

Po absolvovaní aktuálnych materiálov budete vedieť:

- vysvetliť pojem algoritmus a rozlíšiť vstup, spracovanie a výstup;
- navrhnúť a znázorniť algoritmus pomocou postupnosti, vetvenia a opakovania;
- čítať, trasovať a upravovať základné algoritmy zapísané v Pythone;
- pracovať s premennými, základnými dátovými typmi, kolekciami a funkciami v ukážkach kurzu;
- opísať základné vlastnosti programovacích jazykov a rozpoznať úvodné princípy OOP.

## Učebná cesta

Prehľad na stránke [`index.html`](./index.html) je hlavným zoznamom dostupných prednášok a precvičovania.

| Časť | Obsah | Materiály |
| --- | --- | --- |
| 1. Úvod do predmetu | Bezpečnosť v učebni, prostredie a prvý program | [1.1 Bezpečnosť pri práci](./1.1%20Bezpe%C4%8Dnos%C5%A5%20pri%20pr%C3%A1ci.html), [1.2 Vstup do predmetu](./1.2%20Vstup%20do%20predmetu.html) |
| 2. Algoritmizácia v Pythone | Algoritmy, vývojové diagramy, podmienky, cykly, podprogramy, funkcie, triedenie a rekurzia | Lekcie [2.1 až 2.11.1](./index.html#algoritmizacia) |
| Doplnkové materiály | Premenné, pretypovanie, dátové štruktúry, výrezy, komprehencie a úvodné témy | Priečinok [`Učebné materiály`](./U%C4%8Debn%C3%A9%20materi%C3%A1ly/) |
| 3. Programovanie všeobecne | Delenie jazykov a úvod do jazykov vyššieho typu a OOP | Lekcie [3.1 a 3.2](./index.html#programovanie-vseobecne) |
| 4. Opakovanie | Základy algoritmov a interaktívne testy | Sekcia opakovania na stránke [`index.html`](./index.html#opakovanie) |

Algoritmické témy študujte v uvedenom poradí a priebežne si skúšajte príklady v Pythone. Po ich zvládnutí prejdite do [modulu C](../02_C/README.md) a potom do [modulu C++](../03_C++/README.md).

## Miniprojekt

V priečinku [`projekty`](./projekty/) je ukážkový projekt na spracovanie meraní zo senzorov. Použite ho na prepojenie práce s údajmi, funkciami a základmi objektového návrhu.

## Odporúčané študijné zdroje

- [Python – dokumentácia a tutoriál](https://docs.python.org/3/tutorial/)
- [PEP 8 – štýl kódu v Pythone](https://peps.python.org/pep-0008/)
- [Slovenský kurz Pythonu](https://python.input.sk/)
- [Informatika s Mišom – YouTube](https://www.youtube.com/@InformatikasMi%C5%A1om)

## Ukážka výpočtu v Pythone

Vytvorte si samostatný súbor, napríklad `priemer.py`, a vyskúšajte funkciu na výpočet priemeru:

```python
def vypocitaj_priemer(hodnoty: list[float]) -> float:
    """Vráti aritmetický priemer zoznamu čísel."""
    if not hodnoty:
        return 0.0
    return sum(hodnoty) / len(hodnoty)


teploty = [21.5, 22.0, 19.8, 23.1, 20.4]
print(f"Priemerná teplota je {vypocitaj_priemer(teploty):.2f} °C")
```

Po dokončení modulu pokračujte v [C](../02_C/README.md) a následne v [C++](../03_C++/README.md).
