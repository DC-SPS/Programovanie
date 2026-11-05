"""Testy miniprojektu na spracovanie meraní zo senzorov."""

import json
import math
import re
import tempfile
import unittest
from contextlib import redirect_stdout
from dataclasses import FrozenInstanceError
from datetime import datetime, timedelta
from io import StringIO
from pathlib import Path
from unittest.mock import patch

from spravca_senzorov import (
    PriemerneHodnoty,
    SenzorMeranie,
    SpravcaSenzorov,
    StatistikaSenzora,
    main,
)


class SenzorMeranieTesty(unittest.TestCase):
    def test_overi_a_normalizuje_meranie(self) -> None:
        meranie = SenzorMeranie(" TEMP_01 ", 21.5, 45)

        self.assertEqual(meranie.senzor_id, "TEMP_01")
        self.assertEqual(meranie.vlhkost, 45)
        self.assertEqual(datetime.fromisoformat(meranie.cas).utcoffset(), timedelta(0))
        self.assertRegex(meranie.cas, re.compile(r"\.\d{6}[+-]\d{2}:\d{2}$"))

    def test_odmietne_neplatne_hodnoty(self) -> None:
        neplatne_merania = [
            (" ", 20.0, 50.0),
            (None, 20.0, 50.0),
            ("TEMP_01", "teplo", 50.0),
            ("TEMP_01", math.nan, 50.0),
            ("TEMP_01", 10**1000, 50.0),
            ("TEMP_01", True, 50.0),
            ("TEMP_01", 20.0, -1.0),
            ("TEMP_01", 20.0, 101.0),
            ("TEMP_01", 20.0, math.inf),
            ("TEMP_01", 20.0, True),
        ]

        for hodnoty in neplatne_merania:
            with self.subTest(hodnoty=hodnoty):
                with self.assertRaises(ValueError):
                    SenzorMeranie(*hodnoty)

    def test_vlhkost_prijima_hranicne_hodnoty(self) -> None:
        for vlhkost in (0, 100):
            with self.subTest(vlhkost=vlhkost):
                meranie = SenzorMeranie("TEMP_01", 20.0, vlhkost)
                self.assertIs(type(meranie.teplota), float)
                self.assertIs(type(meranie.vlhkost), float)
                self.assertEqual(meranie.vlhkost, vlhkost)

    def test_meranie_po_vytvoreni_nemoze_byt_zmenene(self) -> None:
        meranie = SenzorMeranie("TEMP_01", 21.5, 45.0)

        with self.assertRaises(FrozenInstanceError):
            meranie.teplota = 99.0

    def test_obnovi_meranie_zo_slovnika_bez_zmeny_casu(self) -> None:
        povodne = SenzorMeranie("TEMP_01", 21.5, 45.0)

        obnovene = SenzorMeranie.from_dict(povodne.to_dict())

        self.assertEqual(obnovene, povodne)

    def test_obnova_zachova_povodne_pocasove_pasmo(self) -> None:
        data = {
            "senzor_id": "TEMP_01",
            "teplota": 21.5,
            "vlhkost": 45.0,
            "cas": "2026-11-04T12:00:00+05:30",
        }

        meranie = SenzorMeranie.from_dict(data)

        self.assertEqual(meranie.cas, data["cas"])

    def test_obnova_normalizuje_iso_utc_z_na_offset(self) -> None:
        data = {
            "senzor_id": "TEMP_01",
            "teplota": 21.5,
            "vlhkost": 45.0,
            "cas": "2026-11-04T12:00:00Z",
        }

        meranie = SenzorMeranie.from_dict(data)

        self.assertEqual(meranie.cas, "2026-11-04T12:00:00+00:00")

    def test_obnova_odmietne_chybajuce_pole_a_cas_bez_casoveho_pasna(self) -> None:
        data = {
            "senzor_id": "TEMP_01",
            "teplota": 21.5,
            "vlhkost": 45.0,
            "cas": "2026-11-04T12:00:00",
        }

        with self.assertRaises(ValueError):
            data_bez_casu = {key: value for key, value in data.items() if key != "cas"}
            SenzorMeranie.from_dict(data_bez_casu)
        with self.assertRaises(ValueError):
            SenzorMeranie.from_dict(data)

        data["cas"] = "nie je ISO čas"
        with self.assertRaisesRegex(ValueError, "ISO 8601"):
            SenzorMeranie.from_dict(data)

    def test_obnova_odmietne_neznamu_json_polozku(self) -> None:
        data = SenzorMeranie("TEMP_01", 21.5, 45.0).to_dict()
        data["neocakavane"] = "hodnota"

        with self.assertRaisesRegex(ValueError, "iba polia"):
            SenzorMeranie.from_dict(data)


class SpravcaSenzorovTesty(unittest.TestCase):
    def test_priemer_prazdneho_zoznamu_nie_je_definovany(self) -> None:
        self.assertIsNone(SpravcaSenzorov().vypocitaj_priemerne_hodnoty())

    def test_skupinove_statistiky_su_prazdne_bez_merani(self) -> None:
        self.assertEqual(SpravcaSenzorov().vypocitaj_statistiky_podla_senzora(), {})

    def test_vypocita_priemery(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("A", 20.0, 40.0))
        spravca.pridaj_meranie(SenzorMeranie("B", 22.0, 60.0))

        self.assertEqual(
            spravca.vypocitaj_priemerne_hodnoty(),
            PriemerneHodnoty(21.0, 50.0),
        )

    def test_priemer_teploty_zachova_male_hodnoty_pri_velkych_cislach(self) -> None:
        spravca = SpravcaSenzorov()
        for teplota in (1e16, 1.0, -1e16):
            spravca.pridaj_meranie(SenzorMeranie("A", teplota, 50.0))

        priemery = spravca.vypocitaj_priemerne_hodnoty()

        self.assertIsNotNone(priemery)
        self.assertAlmostEqual(priemery.priemerna_teplota, 1.0 / 3.0)

    def test_spolocny_priemer_je_nemenny_objekt(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("A", 20.0, 40.0))
        priemery = spravca.vypocitaj_priemerne_hodnoty()

        with self.assertRaises(FrozenInstanceError):
            priemery.priemerna_teplota = 99.0

    def test_vypocita_statistiky_pre_kazdy_senzor(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("A", 20.0, 40.0))
        spravca.pridaj_meranie(SenzorMeranie("B", 22.0, 60.0))
        spravca.pridaj_meranie(SenzorMeranie("A", 24.0, 50.0))

        self.assertEqual(
            spravca.vypocitaj_statistiky_podla_senzora(),
            {
                "A": StatistikaSenzora(
                    2,
                    22.0,
                    20.0,
                    24.0,
                    45.0,
                    40.0,
                    50.0,
                ),
                "B": StatistikaSenzora(
                    1,
                    22.0,
                    22.0,
                    22.0,
                    60.0,
                    60.0,
                    60.0,
                ),
            },
        )

    def test_skupinovy_priemer_zachova_male_hodnoty_pri_velkych_cislach(self) -> None:
        spravca = SpravcaSenzorov()
        for teplota in (1e16, 1.0, -1e16):
            spravca.pridaj_meranie(SenzorMeranie("A", teplota, 50.0))

        statistika = spravca.vypocitaj_statistiky_podla_senzora()["A"]

        self.assertEqual(statistika.pocet_merani, 3)
        self.assertAlmostEqual(statistika.priemerna_teplota, 1.0 / 3.0)

    def test_odmietne_objekt_ktory_nie_je_meranie(self) -> None:
        with self.assertRaises(TypeError):
            SpravcaSenzorov().pridaj_meranie("nie je meranie")

    def test_merania_poskytuju_nemenny_pohlad(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("A", 20.0, 40.0))
        povodny_pohlad = spravca.merania

        self.assertIsInstance(povodny_pohlad, tuple)
        self.assertEqual(len(povodny_pohlad), 1)
        with self.assertRaises(AttributeError):
            povodny_pohlad.append(SenzorMeranie("B", 22.0, 60.0))
        spravca.pridaj_meranie(SenzorMeranie("B", 22.0, 60.0))
        self.assertEqual(len(povodny_pohlad), 1)
        self.assertEqual(len(spravca.merania), 2)

    def test_vyhlada_merania_podla_senzora(self) -> None:
        spravca = SpravcaSenzorov()
        meranie_a = SenzorMeranie("A", 20.0, 40.0)
        spravca.pridaj_meranie(meranie_a)
        spravca.pridaj_meranie(SenzorMeranie("B", 22.0, 60.0))

        self.assertEqual(spravca.vyhladaj_merania(" A "), (meranie_a,))
        self.assertEqual(spravca.vyhladaj_merania("CHYBA"), ())
        with self.assertRaises(ValueError):
            spravca.vyhladaj_merania(" ")

    def test_vypocita_suhrn_pre_jeden_senzor(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("A", 20.0, 40.0))
        spravca.pridaj_meranie(SenzorMeranie("A", 24.0, 60.0))

        statistika = spravca.vypocitaj_statistiku_senzora("A")

        self.assertIsNotNone(statistika)
        self.assertEqual(statistika.pocet_merani, 2)
        self.assertEqual(statistika.priemerna_teplota, 22.0)
        self.assertEqual(statistika.minimalna_vlhkost, 40.0)
        self.assertEqual(statistika.maximalna_vlhkost, 60.0)
        self.assertIsNone(spravca.vypocitaj_statistiku_senzora("CHYBA"))

    def test_statistika_senzora_je_nemenny_objekt(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("A", 20.0, 40.0))
        statistika = spravca.vypocitaj_statistiku_senzora("A")

        with self.assertRaises(FrozenInstanceError):
            statistika.priemerna_teplota = 99.0

    def test_exportuje_json_s_casovym_pasmo(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("TEMP_01", 21.5, 45.0))

        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            spravca.uloz_do_json(cesta)
            zaznam = json.loads(cesta.read_text(encoding="utf-8"))[0]

        self.assertEqual(zaznam["senzor_id"], "TEMP_01")
        self.assertEqual(set(zaznam), {"senzor_id", "teplota", "vlhkost", "cas"})
        casovy_offset = datetime.fromisoformat(zaznam["cas"]).utcoffset()
        self.assertEqual(casovy_offset, timedelta(0))

    def test_export_prazdneho_spravcu_vytvori_prazdny_zoznam(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "prazdne.json"
            SpravcaSenzorov().uloz_do_json(cesta)

            self.assertEqual(json.loads(cesta.read_text(encoding="utf-8")), [])

    def test_export_bezpecne_nahradi_existujuci_subor(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("TEMP_01", 21.5, 45.0))
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            cesta.write_text("starý obsah", encoding="utf-8")

            spravca.uloz_do_json(cesta)

            obsah = cesta.read_text(encoding="utf-8")
            self.assertTrue(obsah.endswith("\n"))
            self.assertEqual(len(json.loads(obsah)), 1)

    def test_export_zachova_unicode_v_id_senzora(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("Senzor_Ž", 20.0, 50.0))
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"

            spravca.uloz_do_json(cesta)

            self.assertIn("Senzor_Ž", cesta.read_text(encoding="utf-8"))

    def test_nacita_exportovane_merania(self) -> None:
        povodny = SpravcaSenzorov()
        povodny.pridaj_meranie(SenzorMeranie("TEMP_01", 21.5, 45.0))

        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            povodny.uloz_do_json(cesta)
            nacitany = SpravcaSenzorov.nacitaj_zo_json(cesta)

        self.assertEqual(nacitany.merania, povodny.merania)

    def test_merania_mozno_nacitat_a_atomicky_nahradit_v_tom_istom_subore(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            povodne = SpravcaSenzorov()
            povodne.pridaj_meranie(SenzorMeranie("TEMP_01", 21.5, 45.0))
            povodne.uloz_do_json(cesta)

            nacitane = SpravcaSenzorov.nacitaj_zo_json(cesta)
            nacitane.uloz_do_json(cesta)

            opat_nacitane = SpravcaSenzorov.nacitaj_zo_json(cesta)
            self.assertEqual(opat_nacitane.merania, povodne.merania)

    def test_nacitanie_odmietne_neplatnu_json_strukturu(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            cesta.write_text('{"merania": []}', encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "Koreňová hodnota"):
                SpravcaSenzorov.nacitaj_zo_json(cesta)

            cesta.write_text("nie je JSON", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "platný JSON"):
                SpravcaSenzorov.nacitaj_zo_json(cesta)

    def test_nacitanie_odmietne_nan_a_duplicitne_polia(self) -> None:
        neplatne_vstupy = [
            (
                '[{"senzor_id":"A","teplota":NaN,"vlhkost":40,'
                '"cas":"2026-11-04T12:00:00+00:00"}]',
                "NaN",
            ),
            (
                '[{"senzor_id":"A","teplota":Infinity,"vlhkost":40,'
                '"cas":"2026-11-04T12:00:00+00:00"}]',
                "Infinity",
            ),
            (
                '[{"senzor_id":"A","senzor_id":"B","teplota":20,'
                '"vlhkost":40,"cas":"2026-11-04T12:00:00+00:00"}]',
                "duplicitné pole",
            ),
        ]
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            for obsah, sprava in neplatne_vstupy:
                with self.subTest(sprava=sprava):
                    cesta.write_text(obsah, encoding="utf-8")
                    with self.assertRaisesRegex(ValueError, sprava):
                        SpravcaSenzorov.nacitaj_zo_json(cesta)

    def test_nacita_prazdny_zoznam_bez_merani(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "prazdne.json"
            cesta.write_text("[]", encoding="utf-8")

            spravca = SpravcaSenzorov.nacitaj_zo_json(cesta)

        self.assertEqual(spravca.merania, ())
        self.assertIsNone(spravca.vypocitaj_priemerne_hodnoty())

    def test_nacitanie_neexistujuceho_suboru_povoli_oserror(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "chyba.json"

            with self.assertRaises(FileNotFoundError):
                SpravcaSenzorov.nacitaj_zo_json(cesta)

    def test_nacitanie_povie_poradie_neplatneho_zaznamu(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "neuplne.json"
            for obsah in ('[{"senzor_id": "A"}]', '["nie je objekt"]'):
                with self.subTest(obsah=obsah):
                    cesta.write_text(obsah, encoding="utf-8")
                    with self.assertRaisesRegex(ValueError, "pozícii 1"):
                        SpravcaSenzorov.nacitaj_zo_json(cesta)

    def test_neplatny_json_zachova_predchadzajuci_subor(self) -> None:
        meranie = SenzorMeranie("TEMP_01", 21.5, 45.0)
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(meranie)

        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            cesta.write_text("pôvodné dáta", encoding="utf-8")

            with patch.object(
                SenzorMeranie,
                "to_dict",
                return_value={"teplota": math.nan},
            ):
                with self.assertRaises(ValueError):
                    spravca.uloz_do_json(cesta)

            self.assertEqual(cesta.read_text(encoding="utf-8"), "pôvodné dáta")
            self.assertEqual(
                [subor.name for subor in Path(docasny_priecinok).iterdir()],
                ["merania.json"],
            )

    def test_chyba_pri_premenovani_docasneho_suboru_zachova_export(self) -> None:
        spravca = SpravcaSenzorov()
        spravca.pridaj_meranie(SenzorMeranie("TEMP_01", 21.5, 45.0))
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "merania.json"
            cesta.write_text("pôvodné dáta", encoding="utf-8")

            with patch(
                "spravca_senzorov.os.replace",
                side_effect=OSError("chyba disku"),
            ):
                with self.assertRaisesRegex(OSError, "chyba disku"):
                    spravca.uloz_do_json(cesta)

            self.assertEqual(cesta.read_text(encoding="utf-8"), "pôvodné dáta")
            nazvy_suborov = [
                subor.name for subor in Path(docasny_priecinok).iterdir()
            ]
            self.assertEqual(nazvy_suborov, ["merania.json"])

    def test_cli_pouzije_zadanu_vystupnu_cestu(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "vlastny_vystup.json"
            vystup = StringIO()
            with redirect_stdout(vystup):
                navratovy_kod = main(["--vystup", str(cesta)])
            self.assertTrue(cesta.exists())

        self.assertEqual(navratovy_kod, 0)
        self.assertIn("vlastny_vystup.json", vystup.getvalue())
        self.assertIn("Štatistiky podľa senzora", vystup.getvalue())
        self.assertIn("TEMP_01", vystup.getvalue())
        self.assertIn("rozsah", vystup.getvalue())

    def test_cli_nacita_a_znovu_exportuje_merania(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            vstup = Path(docasny_priecinok) / "vstup.json"
            vystupny_subor = Path(docasny_priecinok) / "vystup.json"
            povodny = SpravcaSenzorov()
            povodny.pridaj_meranie(SenzorMeranie("TEMP_09", 18.5, 55.0))
            povodny.uloz_do_json(vstup)
            konzola = StringIO()

            with redirect_stdout(konzola):
                navratovy_kod = main(["-i", str(vstup), "-o", str(vystupny_subor)])

            self.assertEqual(
                json.loads(vystupny_subor.read_text(encoding="utf-8")),
                json.loads(vstup.read_text(encoding="utf-8")),
            )

        self.assertEqual(navratovy_kod, 0)
        self.assertIn("TEMP_09", konzola.getvalue())

    def test_cli_spracuje_prazdny_vstupny_zoznam(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            vstup = Path(docasny_priecinok) / "prazdne.json"
            vystupny_subor = Path(docasny_priecinok) / "vystup.json"
            vstup.write_text("[]", encoding="utf-8")
            konzola = StringIO()

            with redirect_stdout(konzola):
                navratovy_kod = main(
                    ["--vstup", str(vstup), "--vystup", str(vystupny_subor)]
                )

            self.assertEqual(json.loads(vystupny_subor.read_text(encoding="utf-8")), [])

        self.assertEqual(navratovy_kod, 0)
        self.assertIn("zoznam meraní je prázdny", konzola.getvalue())

    def test_cli_odmietne_chybny_vstupny_json(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            vstup = Path(docasny_priecinok) / "chybny.json"
            vystupny_subor = Path(docasny_priecinok) / "vystup.json"
            vstup.write_text("{}", encoding="utf-8")
            konzola = StringIO()

            with redirect_stdout(konzola):
                argumenty = ["--vstup", str(vstup), "--vystup", str(vystupny_subor)]
                navratovy_kod = main(argumenty)

            self.assertFalse(vystupny_subor.exists())

        self.assertEqual(navratovy_kod, 1)
        self.assertIn("[CHYBA]", konzola.getvalue())

    def test_cli_vrati_chybu_ak_vystupny_priecinok_neexistuje(self) -> None:
        with tempfile.TemporaryDirectory() as docasny_priecinok:
            cesta = Path(docasny_priecinok) / "chyba" / "merania.json"
            vystup = StringIO()
            with redirect_stdout(vystup):
                navratovy_kod = main(["--vystup", str(cesta)])
            self.assertFalse(cesta.exists())

        self.assertEqual(navratovy_kod, 1)
        self.assertIn("[CHYBA]", vystup.getvalue())

    def test_cli_help_zobrazi_prehlad_argumentov(self) -> None:
        vystup = StringIO()

        with redirect_stdout(vystup):
            with self.assertRaises(SystemExit) as chyba:
                main(["--help"])

        self.assertEqual(chyba.exception.code, 0)
        self.assertIn("--vystup", vystup.getvalue())
        self.assertIn("--vstup", vystup.getvalue())


if __name__ == "__main__":
    unittest.main()
