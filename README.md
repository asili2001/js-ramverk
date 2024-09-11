# SSR Editor

Group project for DV1677 js-ramverk course at BTH.

**Members:**
*Axel Jönsson*
*Ahmad Asili*

## Val av ramverk
Vi var lite inne på att välja React Native, men landade i att det varken var nödvändigt eller speciellt lämpat just för denna kursen eftersom det inte fanns ett tydligt användningsområde för just Native-specifik funktionalitet i projektet. 
Sedan funderade vi lite på Angular eftersom vi inte hade tidigare erfarenhet av det och det vore kul att testa något nytt.
Vi funderade även lite på Vue men vi landade till slut i ett beslut att välja React.
Vi var båda överens om att det inte spelade så stor roll vilket ramverk vi valde, det fanns för och nackdelar för samtliga.
De mest avgörande faktorerna som vi vägde in när vi valde ramverk var:
- Att välja ett ramverk vi *var* vana vid sedan tidigare och fördjupa oss i det.
- Att välja ett ramverk i *inte var* vana vid sedan tidigare och lära oss något nytt. 
- Generell känsla för de olika ramverkens struktur och syntax.
- Arbetsmarknadens efterfrågan av kunskap för de olika ramverken.

En avgörande anledning till varför vi valde React var hur React organiserar html, css och javascript. Vi känner båda att Reacts struktur bidrar till en enkel och organiserad kodstruktur. För oss är det mer intuitivt att gruppera HTML (JSX) och JavaScript tillsammans, och hålla CSS separat. 

React är ett ramverk som vi båda har andvänt tidigare.
Genom att välja React hoppas vi få möjligheten att lära oss ramverket på en grundlig nivå genom repetition av redan etablerad kunskap samt att fördjupa oss i ramverket på en mer avancerad nivå genom förkovring av ytterligare kunskap. 
Valet av React ger oss förhoppningsvis även mer tid att implementera fler av den tredje inlämningens krav.


## Steg för att få applikationen att funka
Vi började med att starta appen men märkte snabbt att vi behövte initiera databasen genom att köra
"bash ./db/reset_db.bash". Sedan märkte vi även att vi saknade en ".env" fil för att systemet skulle fungera, här lade vi till vår PORT.
Tabellen saknade primär-nyckel så vi lade till "id" för att vi skulle ha möjligheten att uppdatera dokumentet utifrån dess primär-nyckel. Vi insertade även ett nytt dokument i databasen i migrate.sql för att ha något att utgå ifrån när man resettade databasen.

Efter implementationen märkte vi att form-elementen endast supportar POST- och GET-requests, därför har vi använt oss av JavaScripts "fetch" för att kunna skicka PUT requests till servern, för att utföra uppdateringar av dokument. 

## Applikationens arbetsflöde
För att skapa ett nytt dokument så tycker man på knappen "New Document".
För att uppdatera ett dokument så klickar man på det i listan av dokument för att komma till dokumentet; därefter utför man sina uppdateringar.
