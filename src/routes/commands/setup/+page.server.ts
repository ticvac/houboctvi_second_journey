// src/routes/setup/+page.server.ts
import { db } from '$lib/server/db';
import { area, ritual, seed, userVisibleRituals, userVisitedArea, user, userMushroomCount, mushroom, userAlmanachAccess, locationEntry } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { generateHexSpiralPoints } from '$lib/hexGrid.js';
import { generateRandomPoint, generateRandomPoints } from '$lib/randomPoints.js';
import { generateMultipleRandomPoints } from '$lib/multipleRandomPoints';
import { eq } from 'drizzle-orm';


let mushs = [
    {
        "name":"Kouřalka Krásnoprstenná",
        "filename":"kouralka.png",
        "sanity":"5",
        "toxicity":"5",
        "tastefulnes":"3",
        "rarity":"13",
        "almanach":"Je známá pro svoji výrazně fialovou barvu. Od jiných kouřalek právě tuhle poznáte díky jejímu výraznému prstenu a zvláštnímu kloboučku. Je malý a posázený velkými kruhy. Ve Středozemi běžně roste, a i když ji najdete skoro všude, nedoporučuje se ji sbírat ve velkém. Je mírně halucinogenní a ve velkých množstvích může způsobovat nevolnost či zvracení.\nÚprava je nejlepší nad středním ohněm se zeleninou a masem ve vývaru. Výborně podtrhuje chuť hlavně masa zaječího. Když se usuší, může sloužit jako dobré koření. Musí se však sušit alespoň měsíc. Toto koření pak můžete použít ať už do polévky na maso nebo do dýmky pro zpestření zážitku z kouření s přáteli. Dávejte však pozor, po usušení se musí koření podávat jen po špetkách. Nezpůsobuje sice už žádné zažívací potíže, její halucinogenní účinky však usušením zesílí."
    },
    {
        "name": "Pálivka Rychločasá",
        "filename": "palivka_rychlocasa.png",
        "sanity": "0",
        "toxicity": "5",
        "tastefulnes": "-7.0",
        "rarity": "12",
        "almanach": "Velmi zvláštní houba. Poznáte ji díky jejímu ohnivému vzhledu. Kloubouk i nohu má rudou a pokud ji promnete v rukou, ucítíte mírné teplo.\nJe těžké narazit na čerstvou Pálivku Rychločasou. Vyroste a zplesniví během několika hodin. Odhodlaní houbaři vyrážejí do lesů hned, jak skončí letní či jarní deštík a hledají čerstvě vyrostlé „Rychlovky“, jak jim někteří přezdívají. Tento název se pravděpodobně poprvé začal používat v Hůrce, kde Dorli Bulidor, místní hobit mastičkář, poprvé zkusil Rychlovku velmi rychle nadrtit a poté smíchat s čerstvým býlím.\nUkázalo se, že bylinky, které by se musely sušit dlouhé týdny se téměř okamžitě usušily, zatímco Rychlovka se prakticky celá vlastním teplem vypařila. Rychlovka se tak začala používat ne na jídlo, ve kterém sice nezpůsobovala žádné neblahé zdravotní problémy, pouze nechutnou trpkou chuť, a začala se používat na rychlé sušení jakékoliv byliny či houby."
    },
    {
        "name": "Královka Gondorská",
        "filename": "kralovka_gondorska.png",
        "sanity": "0",
        "toxicity": "-2",
        "tastefulnes": "14.0",
        "rarity": "16",
        "almanach": "Krásná houba, která se sem nějak dostala až z dalekého Gondoru, pravděpodobně na botách dúnadanů. Má silnou šedivou nohu a veliký bílý klobouk. Nemá žádný prsten. Říká se, že za plného měsíce houba mírně září, avšak není to nijak potvrzená informace, která pravděpodobně vznikla v jižních částech Kraje, kde úplňkům a novům přikládají přespřílišnou váhu.\nChuťově je naprosto úžasná. Její masivní klobouk se dá jíst jako řízek v celku, nakrájený a upečený na malé kousky. Jednu dobu se jednalo o nejžádanější houbu v celém Eriadoru. Posledních pár let se začala objevovat o něco častěji v okolí starého hvozdu. Mezi mladými hobity se z hledání této houby stala soutěž, která testuje jak bystrost, tak odvahu.\nDávejte však pozor na jednu věc. Tuto houbu je nejlepší podávat samotnou. V kombinaci s ostatními houbami ztrácí svou výjimečnou chuť. Některé houby z rodu Úvalovitých dokonce mohou s touto houbou při vaření vytvořit velmi jedovatou a ne moc chutnou potravinu."
    },
    {
        "name": "Úvalka Západní",
        "filename": "uvalka_zapadni.png",
        "sanity": "3",
        "toxicity": "2",
        "tastefulnes": "5.0",
        "rarity": "10",
        "almanach": "Tuto houbu můžeme často najít na loukách, či na krajích lesů. Má hnědý klobouk, na kterém se objevují nepravidelné žluté obrazce a dlouhou bílou nohu bez prstenu. Svůj název získala ze své tendence se naklánět na západ, jelikož jí velmi svědčí světlo zapadajícího slunce.\nŘíká se, že Úvalka západní roste častěji na místě, kde jezdí (a trousí) koně. Co je na tom pravdy se moc neví, protože koně se v Kraji příliš nevyskytují. Co můžeme říct skoro s jistotou je, že oslíci, ovce, ani krávy zvýšený růst Úvalky západní nezpůsobují.\nHouba je poměrně chutná, i když ve větších množstvích může být trochu halucinogenní a v extrémních dávkách může způsobovat zvýšený tep a nevolnost. Doporučuje se přidávat buď do polévky nebo jako malé plátky přidávat na upečené maso."
    },
    {
        "name": "Bělenka Vycházková",
        "filename": "belenka_vychazkova.png",
        "sanity": "0",
        "toxicity": "1",
        "tastefulnes": "1.6",
        "rarity": "8",
        "almanach": "Na tuto houbu můžete nejčastěji narazit při vaší odpolední procházce. Má krásnou, blankytně modrou barvu, malý klobouk a tenoučkou nohu bez prstenu. Je sice drobná, ale většinou jich najdete více na jednom místě. Nejčastěji roste právě na kraji cest, mezi oblázky nebo v trávě.\nSama o sobě tato houba není úplně nejchutnější. Syrová je trpká a při vaření se rozplizne. Bonela Křivonožková z hostince U Divoké krávy však zjistila, že čím více jich vaříte najednou, tím lépe chutnají. V množstvích okolo 5ti prý byly houby moc dobré. Je však možné, že od nějakého množství by houby mohly mít neblahé účinky na zdraví. Testováno bylo množství maximálně 7."
    },
    {
        "name": "Stará dobrá Bralská",
        "filename": "Bralovska.png",
        "sanity": "-3",
        "toxicity": "-3",
        "tastefulnes": "5.0",
        "rarity": "11",
        "almanach": "Tahle houba roste v Kraji snad od nepaměti. Má hezkou trávozelenou barvu a válcovitý klobouk. Roste na pařezech či poblíž stromů, nejlépe se jí daří v kyselejší půdě poblíž lesních potůčků.\nŘíká se první z ní udělal kulajdu Firagir Bral a tak si ji zamiloval, že ji měli Bralové po sto let ve znaku. Její popularita však na nějakou dobu zapříčinila, že skoro vymizela a jediné místo, kde se dala najít byl hrob starého Firafira. Právě díky těmto houbám z Firagirova hrobu se těmto houbám podařilo znovu rozšířit. Nyní jsou respektovány nejen pro jejich dobrou chuť, ale i pro jejich význam pro rodinu Bralů. Říká se, že jejich chuť povzbouzí mysl, zlepšuje náladu a léčí."
    },
    {
        "name": "Cirdanova Zhouba",
        "filename": "cirdanova_zhouba.png",
        "sanity": "9",
        "toxicity": "2",
        "tastefulnes": "2",
        "rarity": "13",
        "almanach": "Tato houba má krásnou, černou nohu a velký kulatý klobouk na kterém často bývají fleky zvláštně připomínající labutě. Na noze má stříbrný prsten a ten na sobě má ve vzácných případech jeden světlemodrý flíček. Nachází se nejčastěji u velkých vodních ploch na samých okrajích lesů.\nJejí jméno je poněkud zvláštní a nijak nekoreluje s její poživatelností. V dávných časech kolovala legenda, že velký elfí pán na podobně vypadající houbu doplatil, avšak ten žil mnohem více jihozápadně. Tuto legendu rozšířil Lorigel Bral, cestovatel. Prý o tom četl v dalekých krajích v elfích knihovnách, ale obecně byl považován jen za blázna a pomatence.\nTato houba není nijak smrtelně jedovatá, i když vám z ní může být trochu nevolno. V čem ale vyniká, je omámení mysli. Po požití jen malé dávky mysl odplouvá do přeludů a světa klamů. Chuť má nasládlou, avšak nevýraznou."
    },
    {
        "name": "Sýrovka Podšitá",
        "filename": "Syrovka_podsita.png",
        "sanity": "0",
        "toxicity": "3",
        "tastefulnes": "4",
        "rarity": "7",
        "almanach": "Výrazně oranžová houba, která se dá najít podle jejího sýrového zápachu. Nemá tradiční tvar houby, její klobouk má tvar trychtýře a její výtrusnice jsou tak vidět spíš, než její klobou.\nProslavila se jako houba oblíbená podvodnými statkáři, kteří ředily své sýry vodou a doplňovaly je právě výtažkem se sýrovky.  Stalo se tak na jaře roku 1538, polovina hůrčanů zažívala šílené zažívací problémy. Sýrovka má totiž při větších koncentracích projímací účinky. V menších koncentracích je to však docela dobrá houba a může posloužit jako svačina na delších procházkách."
    },
    {
        "name": "Ptáčátko lesní",
        "filename": "ptacatko_lesni.png",
        "sanity": "5",
        "toxicity": "0",
        "tastefulnes": "3",
        "rarity": "7",
        "almanach": "Tahle houba dostala jméno podle svého vzhledu. Na první pohled byste totiž vůbec neřekli, že to nějaká houba je. Je bílá a vypadá, jako ptačí vajíčko. Pozornější houbař si všimne, že má přeci jenom trochu méně pravidelný tvar, nežli ptačí vejce a na povrchu je mírně pórovatá.\nSnad každý malý hobit, který tuto houbu objevil, byl neskutečně zmaten. Ptačí vajíčka sice nejsou tradiční součástí hobití kuchyně, ale za exotickou ingredienci by je také žádný kuchař neoznačil. Když však v lese najdete toto vlhké měkké „ptačí vajíčko“, může vás to pěkně polekat či zmást. Každý správný houbař však ví, že tato houba je skvělé koření do každé polévky a tak by se neměl lekat, ale jásat. Jediné na co je nutné dávat pozor je fakt, že v menších dávkách tato houba může způsobovat halucinace a bolest hlavy. Tuto chybu však udělá jen málo kdo, jelikož chuť této houby nejlépe vynikne při požití většího množství."
    },
    {
        "name": "Stonkovka polní",
        "filename": "stonkovka_polni.png",
        "sanity": "0",
        "toxicity": "-2",
        "tastefulnes": "7",
        "rarity": "9",
        "almanach": "Drobná, ale chutná houba. Nachází se nejčastěji na loukách, ale není výjimečné najít ji i na své zahrádce. Má tenoulinký hnědý stonek a drobný zelený klobouček, pod jehož vahou se často prohýbá.\nProslavila se hlavně mezi hobitkami, které si z ní pletou krásné věnce. Postupem času se stalo tradicí, že Jaro se v Kraji přivítává jarními hody, na kterých hobití děvčata tančí s věnci z těchto hub a následně nějakému fešnému mládenci svůj věnec dají, společně ho sní a protančí spolu večer.\nNejčastěji se používá, jako příloha na chléb se sýrem. Má jemnou sladkokyselou chuť a je oblíbenou svačinkou mladých hobitů dovádějících na loukách i chovného dobytku. Mimo svou osvěžující chuť je také výborná proti žaludečním problémům a jiným zažívacím neduhům."
    },
    {
        "name": "Chlupatka přátelská",
        "filename": "chlupatka_pratelska.png",
        "sanity": "5",
        "toxicity": "1",
        "tastefulnes": "3",
        "rarity": "9",
        "almanach": "Tato houba roste převážně v chladnějších oblastech. Má silný stříbrný stonek a obrovský šedivý klobouk, na kterém jsou žluté žilky. Čím je tato houba zajímavá je to, že její noha má dlouhé chloupky, které jí chrání od sněhových závějí.\nObjevili ji obchodníci procházející hůrkou, když cestovali přes zelené kopečky. Původně ji kvůli chlupům zaměnili za nějaké zvíře a s vidinou jednoduchého úlovku k ní vyslali salvu šípů. Jejich tragický pokus o ulovení houby započal tradici mezi malými hobiti v házení šišek na stojící cíl – „chlupatku“\nChuť této houby není nic moc, ale většinou dorůstá opravdu velkých rozměrů, takže se z ní člověk dobře nají. Po jejím požití většinou zažijete zvláštní vlnu tepla procházející vaším tělem avšak nenechte se zmást, je to čistě matení vašich smyslů. Nemálo dobrodruhů takto nastydlo nebo hůř, umrzlo."
    },
    {
        "name": "Melian sličná",
        "filename": "Melian_slicna.png",
        "sanity": "10",
        "toxicity": "-5",
        "tastefulnes": "8",
        "rarity": "23",
        "almanach": "Tato extrémně vzácná houba je v Kraji skoro nenalezitelná. Má bledě bílý klobouk a nohu, ale její prstenec je svítivě bílý. Prý matně září a tráva je kolem ní zelenější. Měla by mít šedivé výtrusnice.\nPrý by měla růst poblíž elfích sídel. V Kraji tuhle houbu nikdo už pár desítek let nenašel. Zmínky o ní do Kraje přinesli elfové, kteří se tu vzácně objeví. My hobiti si ale nejraději hledíme svého a elfové nám v tomhle nijak neplánují kazit plány, takže zprávy z jejich světa ke mne doputovávají jen velmi zřídka a skrz mnoho uší.\nŘíká se, že je to houba s pestrou chutí, plnou zpěvu a slz, radosti a trpkosti. Má léčit všechny neduhy a léčit rány na těle i na srdci. Elfové ji však nikdy nesbírají, protože ji prý velmi ctí. Nevím však, jaký efekt bude mít na normálního hobita. Elfí společnost je prý omamná a kouzelná. Kdo ví, jestli tato houba nebude mít podobné účinky."
    },
    {
        "name": "Dřevožralka dubová",
        "filename": "drevozralka_dubova.png",
        "sanity": "1",
        "toxicity": "1",
        "tastefulnes": "6",
        "rarity": "8",
        "almanach": "Tento choroš roste na všech stromech, ale nejčastěji právě na dubech. Má hnědou barvu a žluté výtrusnice. Na kocích je mírně zakroucený. Na dotyk je trochu slizký, a hodně tvrdý. Má mírně dusivý zápach.\nVětšina zahrádkářů ho na své zahrádce vidí velmi nerado. Sráží ji ze stromů všemožným zahradnickým nářadím a pak ji nosí co možná nejdál od své zahrady. Běžně se totiž věří, že tato houba postupně moří strom, na kterém roste. Mimo jiné se stářím její puch nabývá na potenci a žádný správný zahrádkář by si něco takového na své zahradě neměl nechat.\nV čem však zahrádkáři dělají chybu je to, že tuto houbu vyhazují. Čerstvé a ještě mladé Dřevožralky mají totiž výbornou, nasládlou chuť. Doporučuje se je nařezat na kostičky a pak buď osmažit na pánvi nebo upéct v troubě. V dobrých rodinách se restované Dřevožralky podávají jako jednohubkové dezerty ke druhým večeřím."
    },
    {
        "name": "Hrdinka nebezpečná",
        "filename": "hrdinka_nebezpecna.png",
        "sanity": "8",
        "toxicity": "5",
        "tastefulnes": "3",
        "rarity": "16",
        "almanach": "Tato houba má velký zlatý klobouk a silnou šedivou nohu se zlatým prstencem. Roste hluboko v lesích na tmavších místech, nejraději na mechu a v místech, kde není moc popadaného listí. Její vůně zrychluje tep a mate mysl. Na dotyk je hřejivá a pohled na ni vzbuzuje touhu ji utrhnout.\nVyvarujte se však touze ji utrhnout, nebo co hůř, sníst. Tato houba je záludná a šálí mysl tím nejhorším způsobem. V hobitovi, který ji požije, vzbuzuje odvahu a zápal pro objevování, rozdmýchává touhu po dobrodružství a impulzivní chování. Po vyprchání jejího účinku přichází těžká nevolnost, bolest hlavy, nohou a zvracení. Tato houba je v Kraji invazivní a nejlepší je jí rozkopnout a pak jít rychle pryč."
    },
    {
        "name": "Rodinovka špičatá",
        "filename": "rodinovka_spicata.png",
        "sanity": "-4",
        "toxicity": "1",
        "tastefulnes": "4",
        "rarity": "10",
        "almanach": "Tato houba je zvláštní tím, že z její nohy vyrůstá více kloboučků. Její noha je silná a červená a ve výšce přibližně jednoho až dvou palců se začíná větvit do několika kloboučků. Ty jsou drobné, špičaté a mají hnědou barvu. Rodinovku Špičatou najdeme nejčastěji v hluboké trávě nebo v hustém mechovém porostu.\nJejí zvláštní struktura přispěla ke tvorbě jejího názvu. Tradičně se dává mladým hobitím párům, když poprvé založí rodinu. Věří se, že pokud se v rodině alespoň jednou do roka jí pokrm vytvořený z Rodinovky, bude rodina držet při sobě a nebudou v ní panovat žádné nepokoje a rozepře.\nVětšinu této houby tvoří její noha, která je i po uvaření docela tuhá a tvoří tak příjemnou přílohu k měkčím pokrmům. Noha chutná příjemně nahořkle, ale není to nijak překotně chutná houba. Její kloboučky chutnají sladce, ale jejich chuť není nijak výrazná a v jídle se spíš ztratí."
    },
    {
        "name": "Úlovka veliká",
        "filename": "ulovka_velika.png",
        "sanity": "6",
        "toxicity": "15",
        "tastefulnes": "0",
        "rarity": "21",
        "almanach": "Tato houba má velmi zvláštní klobouk, který je černý, má tvar válce a jsou v něm nepravidelně velké kruhové prohlubně. Své jméno houba získala právě díky tomuto zvláštnímu klobouku, který může někomu může připomínat černý úl. Nohu má tmavě modrou bez žádného prstence. Nejčastěji roste v tlejícím listí a v místech, kde je zvýšená vlhkost, takže poblíž potoků v hlubších lesech.\nMezi houbaři je nechvalně proslulá svým odpudivým zápachem, který se z ní line, pokud houbu omylem rozšlápnete. Je velmi těžké ji správně sebrat, jelikož tekutina, která se z ní řine, pokud je nějak poškozena, tvoří onen odporný puch. Správný postup na sebraní je následující: Navlhčete si kapesník a nožem Úlovku opatrně vydloubněte ze země. Po vydloubnutí houbu rychle zabalte do kapesníku a položte ji opatrně na vršek košíku s houbami.\nProč by ale někdo tuto houbu sbíral? Tuto houbu milují snad všichni statkáři, hostinští a vlastně všichni, kdo můžou mít problém s krysami a jinými škůdci. Z Úlovky se totiž dělá výborný jed, který efektivně zabije jakoukoliv malou zvěř. Po vyvaření v teplé vodě houba ztratí schopnost tvořit onen puch, pokud ji následně rozemelete na kaši a namočíte do ní kus chleba či jiné návnady, vytvoříte prvotřídní pochoutku pro vámi nenáviděné škůdce."
    }
];
  

export const load = async (event) => {
    if (!event.locals.user) {
        console.log("User not found, redirecting to login");
        return redirect(302, '/demo/lucia/login');
    }
    if (event.locals.user.username != "user_deleter") {
        console.log("user not admin");
        return redirect(302, '/demo/lucia/login');
    }

    // delete all areas
    await db.delete(locationEntry).execute();
    await db.delete(userAlmanachAccess).execute();
    await db.delete(userMushroomCount).execute();
    await db.delete(userVisibleRituals).execute();
    await db.delete(userVisitedArea).execute();
    await db.delete(ritual).execute();
    await db.delete(seed).execute();
    await db.delete(area).execute();
    await db.delete(mushroom).execute();
    // set users seeds collected to 0
    const users = await db.select().from(user);
    for (const userm of users) {
        await db.update(user).set({ seedsCollected: 0 }).where(eq(user.id, userm.id)).execute();
    }
    // creating mushrooms
    for (const mush of mushs) {
        await db.insert(mushroom).values({
            id: crypto.randomUUID(),
            name: mush.name,
            file_name: mush.filename,
            unsanity: parseInt(mush.sanity),
            tastyfulness: parseInt(mush.tastefulnes),
            rarity: parseInt(mush.rarity),
            almanach: mush.almanach,
        });
    }

    // creating new areas
    let distance = 260;
    let radius = 200;
    let howMany = 20;

    let center: [number, number] = [50.7004203, 15.4772036];
    // let center: [number, number] = [50.7004203, 15.4772036];
    let areaPoints = generateHexSpiralPoints(center[0], center[1], howMany, distance);
    let ritualPoints = generateRandomPoints(areaPoints, radius);
    let seedPoints = generateMultipleRandomPoints(
        areaPoints,
        radius,
        center,
        {
          baseCount: 0,
          distanceMultiplier: 0.002,
          randomSpread: 0,
        }
    )

    for(let i = 0; i < areaPoints.length; i++) {
        const areaId = crypto.randomUUID();
        await db.insert(area).values({
            id: areaId,
            lat: areaPoints[i][0],
            lon: areaPoints[i][1]
        });
        await db.insert(ritual).values({
            id: crypto.randomUUID(),
            lat: ritualPoints[i][0],
            lon: ritualPoints[i][1],
            areaId: areaId
        });
        seedPoints[i].forEach(async (point) => {
            await db.insert(seed).values({
                id: crypto.randomUUID(),
                lat: point[0],
                lon: point[1],
                areaId: areaId
            });
        });
    }
    const areas = await db.select().from(area);
    console.log('Areas:', areas);
    return {
        areas,
    };
}