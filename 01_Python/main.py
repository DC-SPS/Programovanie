#!/usr/bin/env python3
"""
Modul 01: Python - Ukážkový štartovací skript
Tento skript demonštruje základné funkcie, prácu so zoznamami a podmienkami v Pythone.
"""

from typing import Optional


def vypocitaj_statistiky(cisla: list[float]) -> Optional[dict[str, float]]:
    """Vráti štatistiky alebo None, ak je zoznam prázdny."""
    if not cisla:
        return None

    sucet = sum(cisla)
    priemer = sucet / len(cisla)
    return {
        "sucet": sucet,
        "priemer": priemer,
        "min": min(cisla),
        "max": max(cisla)
    }

def main():
    print("=== Vitajte v module 01: Python ===")

    # Práca so zoznamom
    namerane_hodnoty = [12.5, 14.2, 9.8, 15.0, 11.3]
    print(f"Namerané hodnoty: {namerane_hodnoty}")

    vysledky = vypocitaj_statistiky(namerane_hodnoty)

    print("\nVýsledky spracovania:")
    if vysledky is None:
        print("Nie sú k dispozícii žiadne hodnoty na spracovanie.")
    else:
        for kluc, hodnota in vysledky.items():
            print(f"  - {kluc.capitalize()}: {hodnota:.2f}")

if __name__ == "__main__":
    main()
