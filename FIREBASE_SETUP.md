# Firebase: prihlásenie a ochrana údajov

## Aktuálny stav

- Google prihlásenie je pripravené výhradne pre učiteľa a predvolene čaká na Firebase konfiguráciu v `firebase-config.js`.
- Nebol vytvorený Firebase projekt ani nakonfigurovaný poskytovateľ e-mailov.
- Súčasné HTML kvízy iba vyhodnocujú odpovede v prehliadači; výsledky ani inú aktivitu neposielajú na server.
- Firestore pravidlá v `firestore.rules` predvolene zakazujú zápis. Sú pripravené tak, aby po nasadení prihlásený žiak mohol čítať iba vlastné údaje a učiteľské konto mohlo čítať záznamy; zápis zostáva vypnutý.
- Obsah prednášok je stále verejný. Prihlasovacia stránka nezamyká HTML materiály.
- E-mailové reporty nie sú implementované. Frekvencia reportov nebola potvrdená.

Schválenie školy na spracúvanie údajov žiakov nebolo potvrdené. `studentDataProcessingApproved` preto ostáva `false`: nezapína sa študentské prihlasovanie, zber výsledkov ani automatické odosielanie e-mailov. Učiteľská e-mailová adresa nie je uložená v zdrojovom kóde; porovnanie sa vykonáva serverovo s hodnotou Firebase Secret Manager.

## Potrebné nastavenia po schválení školy

1. **Schválenie a informovanie:** škola určí účel, právny základ, dobu uchovávania, osoby s prístupom, spôsob žiadosti o opravu/vymazanie a informácie pre žiakov (a podľa školských pravidiel aj ich zákonných zástupcov). Zvážte, či sú naozaj potrebné odpovede z testov alebo postačí súhrnný výsledok.
2. **Vytvorenie Firebase projektu:** založte projekt pod školským alebo povereným administrátorským účtom. Pred zapnutím služieb skontrolujte región a podmienky spracúvania.
3. **Učiteľský e-mail ako tajomstvo:** v koreňovom priečinku spustite `firebase functions:secrets:set TEACHER_EMAIL` a zadajte adresu učiteľa do interaktívnej výzvy. Nevkladajte ju do príkazu, súboru `.env`, HTML, JavaScriptu ani Firestore pravidiel. Hodnota sa uloží do Firebase Secret Manager a nie je súčasťou repozitára.
4. **Identity Platform a blokovacie funkcie:** vo Firebase Console povoľte Identity Platform a nakonfigurujte blokovacie funkcie pre vytvorenie účtu aj prihlásenie. V `functions/index.js` tieto funkcie povoľujú výhradne e-mail uložený v tajomstve a odmietnu ostatné účty ešte pred ich vytvorením alebo prihlásením. Pri úspešnom prihlásení server vydá session claim `teacher`, ktorý používajú Firestore pravidlá. Nasadenie vyžaduje projekt s podporou Identity Platform a príslušné oprávnenia/účtovanie podľa nastavení Google Cloud. Ak blokovacie funkcie nie sú aktívne, Google poskytovateľa nezapínajte.
5. **Google Authentication:** po nasadení blokovacích funkcií vo Firebase Console povoľte poskytovateľa Google. Pridajte produkčnú doménu webu do autorizovaných domén. Testujte cez `localhost` alebo HTTPS; Google OAuth nebude fungovať pri otvorení stránky cez `file://`.
6. **Webová aplikácia:** zaregistrujte webovú aplikáciu vo Firebase Console a vložte jej verejné webové nastavenia (`apiKey`, `authDomain`, `projectId`, `appId`) do `firebase-config.js`. Firebase web konfigurácia nie je heslo; bezpečnosť musí vynucovať serverová blokovacia funkcia a Firestore Security Rules. Kľúč obmedzte v Google Cloud Console na potrebné API a domény.
7. **Nasadenie serverových kontrol:** v koreňovom priečinku nastavte Firebase CLI na projekt, nainštalujte závislosti v `functions` a nasaďte `allowTeacherAccountCreation` aj `allowTeacherSignIn` cez `firebase deploy --only functions`. Až po ich úspešnom nasadení povoľte Google poskytovateľa a vyskúšajte učiteľský účet. Tlačidlo na stránke sa aktivuje po doplnení konfigurácie Firebase.
8. **Pravidlá Firestore:** vytvorte Firestore databázu a nasaďte pravidlá cez `firebase deploy --only firestore:rules` (cestu k `firestore.rules` určuje `firebase.json`). Pred nasadením otestujte pravidlá vo Firebase Emulator Suite. Zápisy sú zámerne vypnuté, kým sa neschváli a neimplementuje konkrétna schéma udalostí.
9. **Žiacke funkcie:** po schválení školy možno osobitne navrhnúť registráciu žiakov, dátovú schému, uchovávanie a prístupové pravidlá. Až potom nastavte `studentDataProcessingApproved` na `true`; toto nastavenie samo o sebe žiakom prihlásenie nepovolí, pretože blokovacie funkcie momentálne povoľujú výhradne učiteľa.
10. **E-mailové súhrny:** frekvencia a rozsah súhrnov zatiaľ nie sú potvrdené. E-mailový poskytovateľ musí byť volaný zo zabezpečenej serverovej funkcie; SMTP/API kľúč nikdy nepatrí do HTML ani JavaScriptu v prehliadači.

## Overenie po nastavení

- V anonymnom okne skúste čítať Firestore kolekcie; prístup musí byť odmietnutý.
- Overte, že učiteľský Google účet sa dokáže prihlásiť a iný účet odmietnu blokovacie funkcie ešte pred vytvorením Firebase účtu. Skontrolujte tiež, že v publikovaných súboroch nie je e-mail učiteľa.
- Overte, že neprihlásený používateľ nemôže čítať Firestore a že zápis ostáva vypnutý.
- Použite fiktívne testovacie údaje a overte, že sa v e-mailoch ani logoch neobjavia celé odpovede, ak sa schváli iba súhrn.
- Overte odhlásenie, zmazanie testovacích záznamov a postup pri zrušení účtu.
