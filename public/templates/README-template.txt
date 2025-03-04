ISTRUZIONI PER L'UTILIZZO DEL TEMPLATE CSV PER IMPORTARE CORRIERI
=================================================================

Il template CSV contiene le seguenti colonne:

1. carrier_name: Nome del corriere (es. BRT, DHL, GLS)
2. logo_url: URL del logo del corriere (es. /images/carriers/brt.png)
3. is_volumetric: Se il corriere applica calcolo volumetrico (true/false)
4. fuel_surcharge: Percentuale di supplemento carburante (es. 8.5)
5. is_active: Se il corriere è attivo (true/false)
6. service_name: Nome del servizio (es. Standard, Express, International)
7. service_code: Codice del servizio (es. STD, EXP, INT)
8. service_description: Descrizione del servizio
9. delivery_time_min: Tempo minimo di consegna in ore (es. 24)
10. delivery_time_max: Tempo massimo di consegna in ore (es. 48)
11. destination_type: Tipo di destinazione (national, eu, extra_eu)
12. destination_country: Codice del paese per spedizioni internazionali (es. DE, FR)
13. weight_min: Peso minimo della fascia in kg (es. 0)
14. weight_max: Peso massimo della fascia in kg (es. 1)
15. purchase_price: Prezzo di acquisto in € (es. 5.5)
16. retail_price: Prezzo di vendita in € (es. 7.9)

COME COMPILARE IL TEMPLATE:
--------------------------

1. Per ogni corriere, inserire tutte le informazioni base (colonne 1-5)
2. Per ogni servizio offerto dal corriere, creare righe separate per ogni fascia di peso
3. Per servizi internazionali, specificare il paese nella colonna destination_country
4. Lasciare vuota la colonna destination_country per servizi nazionali
5. Il margine viene calcolato automaticamente come (retail_price - purchase_price) / retail_price * 100

ESEMPIO:
-------

Per un corriere BRT con due servizi (Standard e Express) e tre fasce di peso (0-1kg, 1-3kg, 3-5kg),
dovrai creare 6 righe nel CSV (2 servizi x 3 fasce di peso).

NOTA: Assicurarsi che tutti i campi numerici utilizzino il punto come separatore decimale (es. 5.5, non 5,5).

Per ulteriori informazioni contattare il supporto tecnico. 