# Miniprojekt: Správca meraní zo senzorov

Ukážkový program načíta alebo vytvorí merania teploty a vlhkosti, vypočíta
štatistiky a uloží výsledky do JSON súboru. Používa iba štandardnú knižnicu
Pythonu 3.9 alebo novšieho.

## Spustenie

Z koreňového priečinka repozitára spustite ukážkové merania:

```powershell
python 01_Python/projekty/spravca_senzorov.py
```

Predvolene sa výstup uloží do `merania_out.json` v aktuálnom priečinku.
Vlastnú cestu určíte prepínačom `--vystup`:

```powershell
python 01_Python/projekty/spravca_senzorov.py --vystup data/merania.json
```

Existujúci súbor načítate cez `--vstup`. V tomto príklade sa načítané merania
znova uložia do rovnakého súboru:

```powershell
python 01_Python/projekty/spravca_senzorov.py --vstup data/merania.json --vystup data/merania.json
```

Program vypíše spoločné priemery a pre každý senzor počet meraní, priemer a
rozsah teploty aj vlhkosti. Pri chybe načítania alebo uloženia vypíše správu a
vráti nenulový návratový kód. Pomoc s prepínačmi zobrazí:

```powershell
python 01_Python/projekty/spravca_senzorov.py --help
```

## Formát údajov

Koreňom JSON súboru je zoznam meraní. Každé meranie obsahuje presne tieto polia:

```json
[
  {
    "senzor_id": "TEMP_01",
    "teplota": 21.5,
    "vlhkost": 45.0,
    "cas": "2026-11-04T12:00:00+00:00"
  }
]
```

ID senzora nesmie byť prázdne, teplota musí byť konečné číslo a vlhkosť musí
byť v rozsahu 0 až 100 %. Čas musí byť platný ISO 8601 s časovým pásmom; UTC
možno zapísať aj s príponou `Z`. Nové časové značky sa vytvárajú v UTC.
Program odmieta duplicitné polia, neznáme polia a neštandardné JSON hodnoty
`NaN` a `Infinity`. Export používa UTF-8 a pri zápise bezpečne nahradí cieľový
súbor až po úspešnom vytvorení nového obsahu.

## Spustenie testov

Z koreňového priečinka repozitára spustite:

```powershell
python -m unittest discover -s 01_Python/projekty -p "test_*.py" -v
```

Testy kontrolujú validáciu meraní, výpočty, import a export JSON aj správanie
príkazového riadka.
