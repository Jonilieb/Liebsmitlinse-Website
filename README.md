# Liebs mit Linse

Eine bildzentrierte Galerie für den Instagram-Kanal `@liebsmitlinse`.

## Instagram verbinden

Die Seite nutzt serverseitig die offizielle **Instagram API with Instagram Login**. Dafür muss das Instagram-Konto ein Professional-Konto (Business oder Creator) sein.

1. In Meta for Developers eine App mit dem Produkt „Instagram API“ anlegen.
2. `liebsmitlinse` über „Instagram Login“ autorisieren und die Berechtigung `instagram_business_basic` freigeben.
3. Den erzeugten langlebigen Access Token lokal in `.env.local` hinterlegen:

   ```text
   INSTAGRAM_ACCESS_TOKEN=...
   ```

4. Beim Hosting denselben Wert als geschützte Umgebungsvariable eintragen.

Ohne Token zeigt die Seite absichtlich eine kuratierte Vorschau. Sobald der Token vorhanden ist, lädt `/api/instagram` automatisch alle verfügbaren Beiträge (inklusive Pagination), cached sie 15 Minuten und zeigt bei Videos deren Vorschaubild.

## Lokal starten

```bash
npm run dev
```

## Produktion prüfen

```bash
npm run build
```
