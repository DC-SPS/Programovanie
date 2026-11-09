# Modul 00: Git a Verzovanie Kódu

Vítajte v prvom module. **Git** je distribuovaný systém správy verzií, ktorý je celosvetovým štandardom pre vývoj softvéru.

Umožňuje zaznamenávať históriu zmien v kóde, vracať sa k predošlým verziám, vytvárať nezávislé vývojové vetvy a bezpečne spolupracovať v tíme prostredníctvom platforiem ako **GitHub**.

---

## 🎯 Vzdelávacie ciele
Po absolvovaní tohto modulu budete vedieť:
- Vysvetliť rozdiel medzi lokálnym verzionovaním a vzdialeným repozitárom (GitHub).
- Rozumieť stavom súborov v Gite (*Working Directory*, *Staging Area*, *Repository*).
- Bezpečne používať základné príkazy: `git init`, `git status`, `git add`, `git commit`, `git log`.
- Vytvárať a spájať vetvy (`git branch`, `git checkout` / `git switch`, `git merge`).
- Riešiť vzniknuté Merge konflikty.
- Pracovať so vzdialeným repozitárom: `git clone`, `git fetch`, `git pull`, `git push`.
- Konfigurovať `.gitignore` pre ignorovanie nepodstatných alebo citlivých súborov.

---

## 🗺️ Učebná cesta modulu

| Lekcia | Názov a Téma | Popis |
| :--- | :--- | :--- |
| [`00_Uvod/`](./00_Uvod/) | Úvod do verzionovania a štruktúra | Princíp fungovania správy verzií a inštalácia Gitu. |
| [`01_Zakladne_prikazy/`](./01_Zakladne_prikazy/) | Základný pracovný cyklus | Príkazy status, add, commit, log a správne commit správy. |
| [`02_Vetvy_a_merging/`](./02_Vetvy_a_merging/) | Vetvenie a zlučovanie | Vytváranie vetiev, prepínanie a spájanie zmien do hlavnej vetvy. |
| [`03_GitHub_a_remote_repozitare/`](./03_GitHub_a_remote_repozitare/) | Remote repozitáre | Klonovanie, push, pull a spolupráca na GitHube. |
| [`04_Riesenie_konfliktov/`](./04_Riesenie_konfliktov/) | Riešenie konfliktov | Príčka konfliktov, konfliktné značky a postupy opravy. |
| [`cvicenia/`](./cvicenia/) | Praktické cvičenia | Praktické úlohy pre overenie vedomostí. |

---

## 📺 Odporúčané študijné zdroje

### 🎬 Oficiálny kurz Gitu – Informatika s Mišom
Pre názornú výučbu odporúčame sledovať videá z kanála **Informatika s Mišom**:
- 🔗 **YouTube kanál**: [Informatika s Mišom](https://www.youtube.com/@InformatikasMi%C5%A1om)
- 🎥 **Lekcia 1**: [Čo je to Git a prečo ho používať](https://www.youtube.com/watch?v=GcZsboL_xIs)
- 🎥 **Lekcia 2**: [Ako funguje Git – Základné princípy](https://www.youtube.com/watch?v=wemgFIiwEnU)

### 📚 Odborné referencie
- 📖 [Oficiálna Git dokumentácia (Git SCM)](https://git-scm.com/doc)
- 📖 [GitHub Docs – Getting started with Git](https://docs.github.com/en/get-started)

---

## 🛠️ Rýchly prehľad najdôležitejších príkazov

```bash
# Prvotná konfigurácia
git config --global user.name "Janko Hrasko"
git config --global user.email "janko.hrasko@skola.sk"

# Zistenie stavu a pridanie do Staging Area
git status
git add nazov_suboru.py
git add .

# Vytvorenie commitu
git commit -m "feat: Pridaný výpočet obvodu kruhu"

# Práca s vetvami
git branch nova-funkcia
git switch nova-funkcia
git merge nova-funkcia

# Spolupráca so serverom
git push origin main
git pull origin main
```

---

## 🏁 Pokračovanie v štúdiu

Po zvládnutí modulu Git pokračujte modulom [`01_Python`](../01_Python/), kde využijete získané zručnosti pri verzovaní prvých Python skriptov.


## Kompletný kurz – prednášky 00 až 20

Vizuálny ťahák a dvadsať samostatných HTML prednášok sú dostupné aj v [katalógu kurzu](./index.html).

- [00 Git v kocke](./00_Git_v_kocke.html)
- [01 Úvod – v znamení verzovania kódu](./01_Uvod.html)
- [02 Čo je to Git](./02_Co_je_Git.html)
- [03 Inštalácia Gitu vo Windows a macOS](./03_Instalacia_Gitu.html)
- [04 Visual Studio Code a Git](./04_VS_Code_a_Git.html)
- [05 Ako funguje Git](./05_Ako_funguje_Git.html)
- [06 Základné príkazy – init, add, commit](./06_Zakladne_prikazy.html)
- [07 Commity a Vim](./07_Commity_a_Vim.html)
- [08 git rm](./08_git_rm.html)
- [09 git mv](./09_git_mv.html)
- [10 git branch](./10_git_branch.html)
- [11 git merge](./11_git_merge.html)
- [12 Čo je to GitHub](./12_Co_je_GitHub.html)
- [13 git clone a git fetch](./13_git_clone_a_fetch.html)
- [14 git pull a git push](./14_git_pull_a_push.html)
- [15 Merge konflikty](./15_Merge_konflikty.html)
- [16 Súbor .gitignore](./16_gitignore.html)
- [17 git log a história](./17_git_log_a_historia.html)
- [18 git reset a git checkout](./18_git_reset_a_checkout.html)
- [19 README.md a Markdown](./19_README_a_Markdown.html)
- [20 Ako Git naozaj funguje – interná databáza](./20_Git_pod_kapotou.html)
