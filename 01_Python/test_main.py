"""Testy štartovacej ukážky na výpočet štatistík."""

import math
import unittest
from contextlib import redirect_stdout
from io import StringIO

from main import main, vypocitaj_statistiky


class VypocitajStatistikyTesty(unittest.TestCase):
    def test_prazdny_zoznam_vrati_none(self) -> None:
        self.assertIsNone(vypocitaj_statistiky([]))

    def test_vypocita_zakladne_statistiky(self) -> None:
        self.assertEqual(
            vypocitaj_statistiky([2.0, 4.0, 6.0]),
            {"sucet": 12.0, "priemer": 4.0, "min": 2.0, "max": 6.0},
        )

    def test_presne_scitava_zrusujuce_sa_hodnoty(self) -> None:
        statistiky = vypocitaj_statistiky([1e16, 1.0, -1e16])

        self.assertIsNotNone(statistiky)
        self.assertEqual(statistiky["sucet"], 1.0)
        self.assertAlmostEqual(statistiky["priemer"], 1.0 / 3.0)

    def test_odmietne_nekonecne_alebo_neciselne_hodnoty(self) -> None:
        for hodnota in (math.nan, math.inf, True, "10", 10**1000):
            with self.subTest(hodnota=hodnota):
                with self.assertRaises(ValueError):
                    vypocitaj_statistiky([hodnota])

    def test_odmietne_sucet_mimo_rozsahu(self) -> None:
        with self.assertRaisesRegex(ValueError, "prekročil"):
            vypocitaj_statistiky([1e308, 1e308])

    def test_main_vypise_vysledky_ukazkovych_hodnot(self) -> None:
        vystup = StringIO()

        with redirect_stdout(vystup):
            main()

        self.assertIn("Namerané hodnoty", vystup.getvalue())
        self.assertIn("Priemer: 12.56", vystup.getvalue())


if __name__ == "__main__":
    unittest.main()
