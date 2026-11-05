#!/usr/bin/env python3
"""
Miniprojekt: Systém na spracovanie meraní zo senzorov
Modul: 01_Python / projekty
"""

import argparse
import json
import os
import tempfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from math import fsum, isfinite
from pathlib import Path
from typing import Optional, Union


MIN_VLHKOST = 0.0
MAX_VLHKOST = 100.0


def _je_konecne_cislo(hodnota: object) -> bool:
    if isinstance(hodnota, bool) or not isinstance(hodnota, (int, float)):
        return False
    try:
        return isfinite(hodnota)
    except OverflowError:
        return False


def _aktualny_cas() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


def _odmietni_json_konstantu(hodnota: str) -> None:
    raise ValueError(f"JSON obsahuje nepovolenú číselnú hodnotu {hodnota}.")


def _json_objekt_bez_duplikatov(polozky: list[tuple[str, object]]) -> dict[str, object]:
    objekt: dict[str, object] = {}
    for kluc, hodnota in polozky:
        if kluc in objekt:
            raise ValueError(f"JSON obsahuje duplicitné pole {kluc!r}.")
        objekt[kluc] = hodnota
    return objekt


@dataclass(frozen=True)
class SenzorMeranie:
    """Jedno overené meranie teploty a vlhkosti zo senzora."""

    senzor_id: str
    teplota: float
    vlhkost: float
    cas: str = field(default_factory=_aktualny_cas)

    def __post_init__(self) -> None:
        if not isinstance(self.senzor_id, str) or not self.senzor_id.strip():
            raise ValueError("ID senzora nesmie byť prázdne.")
        if not _je_konecne_cislo(self.teplota):
            raise ValueError("Teplota musí byť konečné číslo.")
        if (
            not _je_konecne_cislo(self.vlhkost)
            or not MIN_VLHKOST <= self.vlhkost <= MAX_VLHKOST
        ):
            raise ValueError(
                f"Vlhkosť musí byť číslo v rozsahu {MIN_VLHKOST:g} "
                f"až {MAX_VLHKOST:g} %."
            )
        if not isinstance(self.cas, str):
            raise ValueError("Čas merania musí byť text vo formáte ISO 8601.")
        cas_iso = f"{self.cas[:-1]}+00:00" if self.cas.endswith("Z") else self.cas
        try:
            casova_zona = datetime.fromisoformat(cas_iso).utcoffset()
        except ValueError as chyba:
            raise ValueError(
                "Čas merania musí byť platný formát ISO 8601."
            ) from chyba
        if casova_zona is None:
            raise ValueError("Čas merania musí obsahovať časové pásmo.")

        object.__setattr__(self, "senzor_id", self.senzor_id.strip())
        object.__setattr__(self, "teplota", float(self.teplota))
        object.__setattr__(self, "vlhkost", float(self.vlhkost))
        object.__setattr__(self, "cas", cas_iso)

    def to_dict(self) -> dict[str, object]:
        """Pripraví meranie na uloženie vo formáte JSON."""
        return {
            "senzor_id": self.senzor_id,
            "teplota": self.teplota,
            "vlhkost": self.vlhkost,
            "cas": self.cas
        }

    @classmethod
    def from_dict(cls, data: dict[str, object]) -> "SenzorMeranie":
        """Vytvorí a overí meranie načítané zo slovníka JSON."""
        if not isinstance(data, dict):
            raise ValueError("Záznam merania musí byť JSON objekt.")
        povinne_polia = {"senzor_id", "teplota", "vlhkost", "cas"}
        chybajuce_polia = povinne_polia - data.keys()
        nadbytocne_polia = data.keys() - povinne_polia
        if chybajuce_polia or nadbytocne_polia:
            raise ValueError(
                "Záznam musí obsahovať iba polia: "
                "senzor_id, teplota, vlhkost a cas."
            )
        try:
            return cls(
                senzor_id=data["senzor_id"],
                teplota=data["teplota"],
                vlhkost=data["vlhkost"],
                cas=data["cas"],
            )
        except KeyError as chyba:
            raise ValueError(f"V zázname chýba pole {chyba.args[0]!r}.") from chyba


@dataclass(frozen=True)
class StatistikaSenzora:
    """Súhrn počtu a priemerných hodnôt pre jeden senzor."""

    pocet_merani: int
    priemerna_teplota: float
    minimalna_teplota: float
    maximalna_teplota: float
    priemerna_vlhkost: float
    minimalna_vlhkost: float
    maximalna_vlhkost: float


@dataclass(frozen=True)
class PriemerneHodnoty:
    """Priemerná teplota a vlhkosť zo všetkých meraní."""

    priemerna_teplota: float
    priemerna_vlhkost: float


class SpravcaSenzorov:
    """Zhromažďuje merania a poskytuje nad nimi základné operácie."""

    def __init__(self) -> None:
        self._merania: list[SenzorMeranie] = []

    @property
    def merania(self) -> tuple[SenzorMeranie, ...]:
        """Vráti nemenný pohľad na uložené merania."""
        return tuple(self._merania)

    def pridaj_meranie(self, meranie: SenzorMeranie) -> None:
        """Pridá ďalšie meranie do spravovaného zoznamu."""
        if not isinstance(meranie, SenzorMeranie):
            raise TypeError("Do správcu možno pridať iba objekt SenzorMeranie.")
        self._merania.append(meranie)

    def vyhladaj_merania(self, senzor_id: str) -> tuple[SenzorMeranie, ...]:
        """Vráti všetky merania s presne zhodným ID senzora."""
        if not isinstance(senzor_id, str) or not senzor_id.strip():
            raise ValueError("ID senzora na vyhľadanie nesmie byť prázdne.")
        hladane_id = senzor_id.strip()
        return tuple(
            meranie for meranie in self.merania if meranie.senzor_id == hladane_id
        )

    @classmethod
    def nacitaj_zo_json(cls, subor_cesta: Union[str, Path]) -> "SpravcaSenzorov":
        """Načíta a overí zoznam meraní zo súboru JSON."""
        try:
            with open(subor_cesta, "r", encoding="utf-8") as subor:
                data = json.load(
                    subor,
                    parse_constant=_odmietni_json_konstantu,
                    object_pairs_hook=_json_objekt_bez_duplikatov,
                )
        except json.JSONDecodeError as chyba:
            raise ValueError("Vstupný súbor neobsahuje platný JSON.") from chyba

        if not isinstance(data, list):
            raise ValueError("Koreňová hodnota JSON musí byť zoznam meraní.")

        spravca = cls()
        for index, zaznam in enumerate(data, start=1):
            try:
                spravca.pridaj_meranie(SenzorMeranie.from_dict(zaznam))
            except ValueError as chyba:
                raise ValueError(
                    f"Neplatné meranie na pozícii {index}: {chyba}"
                ) from chyba
        return spravca

    def vypocitaj_priemerne_hodnoty(self) -> Optional[PriemerneHodnoty]:
        """Vráti priemernú teplotu a vlhkosť alebo None pri prázdnom zozname."""
        merania = self.merania
        if not merania:
            return None
        priem_teplota = fsum(m.teplota for m in merania) / len(merania)
        priem_vlhkost = fsum(m.vlhkost for m in merania) / len(merania)
        return PriemerneHodnoty(priem_teplota, priem_vlhkost)

    @staticmethod
    def _vytvor_statistiku(merania: tuple[SenzorMeranie, ...]) -> StatistikaSenzora:
        return StatistikaSenzora(
            pocet_merani=len(merania),
            priemerna_teplota=(
                fsum(meranie.teplota for meranie in merania) / len(merania)
            ),
            minimalna_teplota=min(meranie.teplota for meranie in merania),
            maximalna_teplota=max(meranie.teplota for meranie in merania),
            priemerna_vlhkost=(
                fsum(meranie.vlhkost for meranie in merania) / len(merania)
            ),
            minimalna_vlhkost=min(meranie.vlhkost for meranie in merania),
            maximalna_vlhkost=max(meranie.vlhkost for meranie in merania),
        )

    def vypocitaj_statistiku_senzora(
        self,
        senzor_id: str,
    ) -> Optional[StatistikaSenzora]:
        """Vráti súhrn jedného senzora alebo None, ak nemá merania."""
        merania = self.vyhladaj_merania(senzor_id)
        if not merania:
            return None
        return self._vytvor_statistiku(merania)

    def vypocitaj_statistiky_podla_senzora(self) -> dict[str, StatistikaSenzora]:
        """Vráti počet meraní a priemery teploty a vlhkosti pre každý senzor."""
        skupiny: dict[str, list[SenzorMeranie]] = {}
        for meranie in self.merania:
            skupiny.setdefault(meranie.senzor_id, []).append(meranie)

        return {
            senzor_id: self._vytvor_statistiku(tuple(merania))
            for senzor_id, merania in skupiny.items()
        }

    def uloz_do_json(self, subor_cesta: Union[str, Path]) -> None:
        """Uloží všetky merania do súboru JSON v kódovaní UTF-8."""
        data = [m.to_dict() for m in self.merania]
        ciel = Path(subor_cesta)
        docasny_subor: Optional[Path] = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=ciel.parent,
                prefix=f".{ciel.name}.",
                suffix=".tmp",
                delete=False,
            ) as subor:
                docasny_subor = Path(subor.name)
                json.dump(data, subor, indent=4, ensure_ascii=False, allow_nan=False)
                subor.write("\n")
            os.replace(docasny_subor, ciel)
        except (OSError, ValueError):
            if docasny_subor is not None:
                try:
                    docasny_subor.unlink()
                except OSError:
                    pass
            raise


def main(argumenty: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Spracovanie meraní zo senzorov.")
    parser.add_argument(
        "-o",
        "--vystup",
        type=Path,
        default=Path("merania_out.json"),
        help="cesta k výstupnému JSON súboru (predvolene: merania_out.json)",
    )
    parser.add_argument(
        "-i",
        "--vstup",
        type=Path,
        help="načítať merania z existujúceho JSON súboru namiesto vzorových dát",
    )
    nastavenia = parser.parse_args(argumenty)

    print("=== Miniprojekt: Spracovanie Meraní Senzorov ===")
    if nastavenia.vstup is None:
        spravca = SpravcaSenzorov()
        # Vloženie vzorových meraní
        spravca.pridaj_meranie(SenzorMeranie("TEMP_01", 21.5, 45.0))
        spravca.pridaj_meranie(SenzorMeranie("TEMP_02", 23.1, 48.2))
        spravca.pridaj_meranie(SenzorMeranie("TEMP_01", 20.8, 44.5))
    else:
        try:
            spravca = SpravcaSenzorov.nacitaj_zo_json(nastavenia.vstup)
        except (OSError, ValueError) as chyba:
            print(f"[CHYBA] Merania sa nepodarilo načítať: {chyba}")
            return 1

    priemery = spravca.vypocitaj_priemerne_hodnoty()
    if priemery is None:
        print("Priemer nie je k dispozícii, pretože zoznam meraní je prázdny.")
    else:
        print(f"Priemerná teplota: {priemery.priemerna_teplota:.2f} °C")
        print(f"Priemerná vlhkosť: {priemery.priemerna_vlhkost:.2f} %")

    print("\nŠtatistiky podľa senzora:")
    statistiky = spravca.vypocitaj_statistiky_podla_senzora()
    for senzor_id, statistika in statistiky.items():
        print(
            f"  - {senzor_id}: {statistika.pocet_merani} meraní, "
            f"priemerná teplota {statistika.priemerna_teplota:.2f} °C, "
            f"rozsah {statistika.minimalna_teplota:.2f} až "
            f"{statistika.maximalna_teplota:.2f} °C, "
            f"priemerná vlhkosť {statistika.priemerna_vlhkost:.2f} %, "
            f"rozsah {statistika.minimalna_vlhkost:.2f} až "
            f"{statistika.maximalna_vlhkost:.2f} %"
        )

    # Uloženie dát
    cesta_k_suboru = nastavenia.vystup
    try:
        spravca.uloz_do_json(cesta_k_suboru)
    except (OSError, ValueError) as chyba:
        print(f"[CHYBA] Merania sa nepodarilo uložiť do {cesta_k_suboru}: {chyba}")
        return 1

    print(f"[OK] Merania boli úspešne uložené do: {cesta_k_suboru}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
