/*
 * Standard mode for displaying data (wms or kml).
 */
var mode = "kml";

/*
 * Maximum number of features getting pulled from the server (only applicable for gml).
 */
var max_features = 100;

/*
 * Labels for the KML description (<span class="atr-name">).
 */
var real_nutzung_labels = {
    "BEZ": "Bezirksnummer",
    "ZBEZ": "Zählbezirksnummer",
    "ZGEB": "Zählgebietsnummer",
    "BLK": "Baublockssnummer",
    "NUTZUNG_CODE": "Nutzungscode",
    "NUTZUNG_LEVEL3": "Nutzung 3",
    "NUTZUNG_LEVEL2": "Nutzung 2",
    "NUTZUNG_LEVEL1": "Nutzung 1"
}

var ubahn_labels = {
    "LINFO": "Linie",
    "NAME": "Name",
    "STATUS": "Status",
    "KOMMENTAR": "Kommentar",
    "HTXT": "Name",
    "HBEM": "Bemerkung",
    "EROEFF_JAHR": "Eröffnung",
    "EROEFFNUNG_JAHR": "Eröffnung (Jahr)",
    "EROEFFNUNG_MONAT": "Eröffnung (Monat)",
    "UBAHNHALTOGD": "Haltestelle",
    "PLANUNGUBHALTOGD": "Haltestelle"
}

var zgebiet_labels= {
    "BEZNR": "Bezirksnummer",
    "ZBEZNR": "Zählbezirksnummer",
    "ZGEBNR": "Zählgebietsnummer",
    "BLKNR": "Baublocksnummer",
    "BEZ": "Bezirksnummer",
    "ZBEZ": "Zählbezirksnummer",
    "ZGEB": "Zählgebietsnummer",
    "BLK": "Baublocksnummer",
    "FLAECHE": "Fläche (m2)",
    "UMFANG": "Umfang (m)",
    "AKT_TIMESTAMP": "Letzte Aktualisierung"
}

/*
 * List of available layers.
 */
var standardData = Array(
{
    name: "Straßenbahn - Planung",
    layers: ["PLANUNGBIMOGD", "PLANUNGBIMHALTOGD"],
    labels: {
        "LINIE": "Linie",
        "KOMMENTAR": "Kommentar",
        "EROEFFNUNG": "Eröffnung",
        "HST_NAME": "Haltestelle",
        "PLANUNGBIMHALTOGD": "Haltestelle"
    }
},
{
    name: "U-Bahnnetz - Bestand",
    layers: ["UBAHNOGD", "UBAHNHALTOGD"],
    labels: ubahn_labels
},
{
    name: "U-Bahnlinien - Planung",
    layers: ["PLANUNGUBAHNOGD", "PLANUNGUBHALTOGD"],
    labels: ubahn_labels
},
{
    name: "Hochrangiges Straßennetz - Planung",
    layers: ["PLANUNGAUTOBOGD", "PLANUNGASTOGD", "PLANUNGHPTSTROGD", "PLANUNGKNOTENOGD", "PLANUNGSCHNELLOGD"],
    labels: {
        "NAME": "Name",
        "QUELLE": "Quelle",
        "FERTIG": "vorrauss. Fertigstellung",
        "KOMMENTAR": "Kommentar",
        "STATUS": "Neubau",
        "PLANUNGAUTOBOGD": "Autobahn",
        "PLANUNGASTOGD": "Ast",
        "PLANUNGHPTSTROGD": "Hauptstraße",
        "PLANUNGKNOTENOGD": "Knoten",
        "PLANUNGSCHNELLOGD": "Schnellstraße"
    }
},
{
    name: "Themenradwege", 
    layers: ["THEMENRADWEGOGD"]
    },
{
    name: "Wiener Gewässernetz",
    layers: ["FLIESSGEWOGD"],
    labels: {
        "NAME": "Name",
        "HAUPTNEBEN": "Haupt (1), Neben (2)"
    }
},
{
    name: "Stehende Gewässer",
    layers: ["STEHENDEGEWOGD"],
    labels: {
        "NAME": "Name"
    }
},
{
    name: "Haltestellen",
    layers: ["HALTESTELLEWLOGD"],
    labels: {
        "BEZEICHNUNG": "Name",
        "WL_NUMMER": "WL-Nummer"
    }
},
{
    name: "Park & Ride Anlagen - Standorte",
    layers: ["PARKANDRIDEOGD"],
    labels: {
        "BEZIRK": "Bezirk",
        "ADRESSE": "Adresse",
        "GARAGENNAME": "Name",
        "GARAGENBETREIBER": "Betreiber",
        "WEBLINK1": "Link"
    }
},
{
    name: "Zählbezirksgrenzen", 
    layers: ["ZAEHLBEZIRKOGD"]
    },
{
    name: "Zählgebietsgrenzen",
    layers: ["ZAEHLGEBIETOGD"],
    labels: zgebiet_labels
},
{
    name: "Wiener Grüngürtel",
    layers: ["GRUENFREIFLOGD", "GRUENGEWOGD"],
    labels: {
        "LANDSCHAFT": "Landschaft</span></strong><br />(1: Bisamberg - Südliches Weinviertel<br />2: Kulturlandschaft Marchfeld<br />3: Donauraum-Nationalpark Donauauen<br />4: Terrassenlandschaft im Süden von Wien<br />5: Wienerwald<br />99: Grünflächen kleiner als 1 ha<br />0: wichtige stadtgliedernde Grünzüge und Grünverbindungen, Parkanlagen teilweise inklusive Gebäude, Stadtgärten, historische Gartenanlagen, Sportanlagen, Friedhöfe)<strong><span>",
        "FLAECHE": "Fläche (m2)",
        "BEZEICHNUNG": "Bezeichnung"
    }
},
{
    name: "Realnutzungskartierung 2007/2008",
    layers: ["REALNUT200708OGD"],
    labels: real_nutzung_labels
},
{
    name: "Realnutzungskartierung 2009",
    layers: ["REALNUT2009OGD"],
    labels: real_nutzung_labels
},
{
    name: "Baublöcke",
    layers: ["BAUBLOCKOGD"],
    labels: zgebiet_labels
},
{
    name: "Baumkataster",
    layers: ["BAUMOGD"],
    labels: {
        "BAUMNUMMER": "Nummer des Baumes",
        "GEBIET": "Gebiet",
        "STRASSE": "Straße",
        "ART": "Art",
        "PFLANZJAHR": "Pflanzjahr",
        "STAMMUMFANG": "Umfang in 1m Höhe (cm)",
        "KRONENDURCHMESSER": "Durchmesser der Krone (m)",
        "BAUMHOEHE": "Höhe (m)"
    }
},
{
    name: "Kurzparkzonen & Streifen",
    layers: ["KURZPARKZONEOGD", "KURZPARKSTREIFENOGD"]
}
);
