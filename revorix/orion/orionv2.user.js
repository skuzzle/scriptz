// ==UserScript==
// @name        Polly Orion V2
// @version     1.11.1
// @description Polly Revorix Integration
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_info
// @grant       GM_xmlhttpRequest
// @downloadURL https://github.com/skuzzle/scriptz/raw/master/revorix/orion/orionv2.user.js
// @updateURL   https://github.com/skuzzle/scriptz/raw/master/revorix/orion/orionv2.user.js
// @namespace   projectpolly.de
// @require     http://code.jquery.com/jquery-1.10.2.min.js
// @require     http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/md5.js
// @include     http://www.revorix.info/*/map.php*
// @include     http://www.revorix.info/*/news.php*
// @include     http://www.revorix.info/*/rx.php?set=5&fid=*
// @include     http://www.revorix.info/*/rx.php?set=6*
// @include     http://www.revorix.info/*/rx.php?set=3*
// @include     http://www.revorix.de*
// @include     http://www.revorix.info/login/
// @include     http://www.revorix.info/php/map_fflotte.php?fid=*
// @include     http://www.revorix.info/php/map_fracht.php?fid=*
// @include     http://www.revorix.info/php/venad_list.php?pktsur=1
// @include     http://www.revorix.info/php/venad_list.php?pkttop=1
// @include     http://www.revorix.info/php/setup.php*
// @include     http://www.revorix.info/php/news_pop.php*
// @include     http://www.revorix.info/php/map_attack.php?fida=*
// @include     http://www.revorix.info/php/map_attack.php?fid=*
// @include     http://www.revorix.info/php/handel_all.php*
// @include     http://www.revorix.info/php/handel_eigen.php*
// ==/UserScript==


/*
Changelog
    [ CURRENT ] Version 1.11.1 - 16.10.2015
        + Orion Webservice verbessert

    [ CURRENT ] Version 1.11.0 - 10.10.2015
        + Neuer Webservice zum captcha lösen
        
    Version 1.10.1 - 06.03.2015
        + Auto-Slurp innerhalb des Laderaums (de)aktivierbar
        + 'Zuück zur Karte' Funktion nach dem beladen von Schiffen
        + Verbessertes Layout in der Frachtraum Ansicht

     Version 1.10.0 - 06.03.2015
        + Laderaum Integration

    Version 1.9.0 - 23.02.2015
        + Add training mode
        + Adjust Fleet Tag

    Version 1.8.6 - 22.01.2014
        + Add link to heat map

    Version 1.8.5 - 22.01.2014
        + Show full Changelog in Rx settings
        + Opt-in for disabling login button

    Version 1.8.4 - 22.01.2014
        + Behavior hot fix

    Version 1.8.3 - 22.01.2014
        + Improve login integration
        + Show changelog after script has been updated

    Version 1.8.2 - 19.01.2014
        + Distinguish between main page and server login for the auto login feature
        + Configurable password and auto enter for Clanwache

    Version 1.8.1 - 18.01.2015
        + Remove Attack link for own Clan Wache

    Version 1.8 - 18.01.2015
        + Auto login if captcha is available

    Version 1.7 - 31.12.2014
        + Login Button will be disabled until correct code has been entered.
        + If login code could not completely be resolved, the unresolved character
          will be selected within the input field for the code.
        + Script will be executed when document is ready

    Version 1.6 - 16.05.2014
        + Resource prices are shown in HZ
        + Resource prices are now shown as tool tip correctly, no matter which
          skin is selected

    Version 1.5 - 11.05.2014
        + Added nickname list for orion in game chat
        + Orion Script version is now included in server communication to allow
          server side backward compatibility

    Version 1.4 - 10.05.2014
        + Show current HZ prices in ress bar
        + OrionChat can bes disabled in Rx Settings

    Version 1.3 - 10.05.2014
        + Add Orion In-Game chat
        + Add possibility for the server to display certain warnings after any
          request
        + Showing previous sector of portals that have been moved to unknown
        - Removed code sharing feature as it is not needed anymore

    Version 1.2b - 12.03.2014
        + Added 2 missing @include directives

    Version 1.2a - 12.03.2014
        + Template Engine Fail in polly caused the whole script to fail

    Version 1.2 - 12.03.2014
        + support different sector sizes
        + integrated sending of battle reports
        + improved displaying of scoreboard changes. Date is now always included

    Version 1.1 - 23.02.2014
        + add link to refresh sky news on rx news page
        + add link to show/hide orion control in map view
        + show fleets of orion users in same quadrant in flight news
        + add link to sector of corresponding news entry in flight news
        + add button to test polly login settings
        + if your browser does not insert revorix login name automatically, orion
          will do it for you
        + score board changes were not displayed properly
        - venad can no longer be set in rx settings as it would have been overridden
          on next login anyhow

    Version 1.0a - 19.02.2014
        + store and transmit polly password as MD5
        + add Orion preferences to rx settings page
        + support GM auto update feature
        + externalize most string messages
        + pretty printed source
        + added changelog to script header :)
*/

// Features. Settings these to false will disable the corresponding feature
// completely. Most features offer additional settings using the user interface
// when enabled

// WARNING: disabling one feature may result in undefined behavior for some
//          other feature
var FEATURE_ALL = true; // turns off all features completely when set to false
var FEATURE_LOGIN_INTEGRATION = true; // login code insertion. WARNING: if you turn this off, your venad can not determined automatically
var FEATURE_MAP_INTEGRATION = true; // unveiling map, sending fleet and sector data
var FEATURE_NEWS_INTEGRATION = true; // showing flight news in news overview
var FEATURE_SEND_FLEETSCANS = true; // send fleet scans to polly
var FEATURE_SEND_SCOREBOARD = true; // send score board to polly
var FEATURE_BATTLE_REPORTS = true; // send battle reports to polly
var FEATURE_ORION_CHAT = true; // enable orion ingame chat and Orion online list
var FEATURE_RESOURCE_PRICES = true; // show prices in HZ and tooltip
var FEATURE_TRAINING = true; // Support for ship training
var FEATURE_CARGO = true; // cargo view integration


//==== NO MANUAL MODIFICATIONS BEYOND THIS LINE ====


var DEBUG = false; // Whether debug output is shown on console
var LOCAL_SERVER = false; // use local server for testing
var VERSION = "1.6"; // Expected API version of server responses
var DEFAULT_REQUEST_TIMEOUT = 5000; // ms
var SCRIPT_EXECUTION_DELAY = 150; //ms

// Runtime available changelog
var CHANGELOG = {};
CHANGELOG['1.11.1'] = "* Orion Webservice verbessert.";
CHANGELOG['1.11.0'] = "* Neuer Webservice zum Captcha lösen.";
CHANGELOG['1.10.1'] = "* Auto-Slurp innerhalb des Laderaums (de)aktivierbar.\n* 'Zuück zur Karte' Funktion nach dem beladen von Schiffen.\n* Verbessertes Layout in der Frachtraum Ansicht.";
CHANGELOG['1.10.0'] = "* Button zum einfachen Einladen von Resourcen hinzugefügt.\n* Auto-Slurp: Resourcen automatisch auf Schiffe verteilen wenn der Frachtraum aufgerufen wird.";
CHANGELOG['1.9.0']  = "* Modus zum sicheren trainieren von Schiffen hinzugefügt (Beta).\n* Erkennung der Clanwache an den neuen Flotten-Tag angepasst.";
CHANGELOG['1.8.6']  = "* In der Karte wird ein Link zur Quadranten Heatmap angezeigt.";
CHANGELOG['1.8.5']  = "* Changelog aller Versionen wird in den Rx Einstellungen angezeigt.\n* Opt-in für Deaktivierung des Login Buttons.";
CHANGELOG['1.8.4']  = "* Hot-Fix: Changelog darf nur ein mal angezeigt werden.";
CHANGELOG['1.8.3']  = "* Neue Einstellungen: Soll Login Button deaktiviert werden bis der korrekte Code eingegeben wurde?\n* Bug-Fix beim Logincode handling.\n* Benachrichtigung wenn das Script aktualisiert wurde.\n* Orion Script Version wird in den Rx Einstellungen angezeigt.";

//API URLs
var POLLY_URL = LOCAL_SERVER ? "https://localhost:83" : "https://projectpolly.de:443";
var CAPTCHA_URL = "http://projectpolly.de/polly/rest/captcha";
var API_REQUEST_SECTOR = "/api/orion/json/sector";
var API_REQUEST_QUADRANT = "/api/orion/json/quadrant";
var API_POST_SECTOR = "/api/orion/json/postSector";
var API_SUBMIT_CODE = "/api/orion/get/loginCode";
var API_REQUEST_CODE = "/api/orion/json/requestCode";
var API_ORION_NEWS = "/api/orion/json/news";
var API_POST_FLEET_SCAN = "/api/postQFleetScan";
var API_POST_SCOREBOARD = "/api/postScoreboard";
var API_POST_BATTLE_REPORT = "/postQReport";
var API_TEST_LOGIN = "/api/testLogin";
var API_ADD_TO_CHAT = "/orion/chat/add";
var API_REQUEST_CHAT = "/orion/chat/request";
var API_GET_PRICES = "/api/orion/prices";
var API_HEAT_MAP = "/api/orion/heatMap";
var IMG_URL_DEFAULT = "http://www.revorix.info/gfx/q/";
var IMG_URL_8 = "http://www.revorix.info/gfx/q8/";
var IMG_URL_15 = "http://www.revorix.info/gfx/q15/";
var RX_SECTOR_URL = "http://www.revorix.info/php/map.php?q={0}&x={1}&y={2}";

//Setting keys
var PROPERTY_SELECTED_FLEET = "polly.orion.selectedFleet";
var PROPERTY_SELECTED_FLEET_ID = "polly.orion.selectedFleetId";
var PROPERTY_POST_SECTOR_INFOS = "polly.orion.postSectorInfos";
var PROPERTY_POST_OWN_FLEET_INFOS = "polly.orion.postOwnFleetInfos";
var PROPERTY_AUTO_UNVEIL = "polly.orion.autoUnveil";
var PROPERTY_LOCAL_CACHE = "polly.orion.localCache";
var PROPERTY_ENABLE_QUAD_SKY_NEWS = "polly.orion.skyNewsQuad";
var PROPERTY_ENABLE_SKY_NEWS = "polly.orion.skyNews";
var PROPERTY_ORION_ON = "polly.orion.on";
var PROPERTY_ORION_SELF = "polly.orion.self";
var PROPERTY_ORION_RX_LOGIN = "polly.orion.rxLoginName";
var PROPERTY_CACHED_QUADRANT = "polly.orion.quad.";
var PROPERTY_FILL_IN_CODE = "polly.orion.fillInCode";
var PROPERTY_MAX_NEWS_ENTRIES = "polly.orion.maxNewsEntries";
var PROPERTY_FLEET_POSITION = "polly.orion.fleetPosition";
var PROPERTY_NEWS_SUBSCRIPTION = "polly.orion.newsSubscription";
var PROPERTY_CREDENTIAL_WARNING = "polly.orion.credentialWarning";
var PROPERTY_SEND_SCOREBOARD = "polly.orion.sendScoreboard";
var PROPERTY_SHOW_SCOREBOARD_CHANGE = "polly.orion.showScoreboardChange";
var PROPERTY_LOGIN_NAME = "polly.orion.loginName";
var PROPERTY_LOGIN_PASSWORD = "polly.orion.loginPassword";
var PROPERTY_CLAN_TAG = "polly.orion.clanTag";
var PROPERTY_DISPLAY_INSTALL_NOTE = "polly.orion.installNote";
var PROPERTY_ORION_HIDDEN = "polly.orion.orionHidden";
var PROPERTY_SECTOR_SIZE = "polly.orion.sectorSize";
var PROPERTY_CHAT_ENTRIES = "polly.orion.chatEntries";
var PROPERTY_ENABLE_CHAT = "polly.orion.enableChat";
var PROPERTY_AUTO_LOGIN = "polly.orion.autoLogin"; // on ServerLogin Page
var PROPERTY_AUTO_LOGIN_MAIN_PAGE = "polly.orion.autoLoginMainPage"; // on main RX page
var PROPERTY_CW_PASSWORD = "polly.orion.cwPassword";
var PROPERTY_CW_AUTO_ENTER = "polly.orion.cwAutoEnter";
var PROPERTY_DISABLE_LOGIN_BUTTON = "polly.orion.disableLogin";
var PROPERTY_LAST_SECTOR_JSON = "polly.orion.lastSecotJson";
var PROPERTY_RESOURCE_ORDER = "polly.orion.resourceOrder";
var PROPERTY_AUTO_SLURP = "polly.orion.autoSlurp";
var PROPERTY_BACK_TO_MAP = "polly.orion.backToMap";

var PROPERTY_PREVIOUS_VERSION = "polly.orion.prevVersion";

// DEPRECATED PROPERTIES
var PROPERTY_SHARE_CODE = "polly.orion.shareCode";
var PROPERTY_TEMPORARY_CODE = "polly.orion.tempCode";

//Strings
//from: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };
}

var MSG_INSTALL_NOTE = "Orion V2 wurde installiert.\nIn den Revorix Einstellungen kannst du das Script konfigurieren.";
var MSG_SHOW_SIGHTED_FLEET = "Zeige gesichtete Flotten an";
var MSG_SHOW_FLEET_POSITION = "Zeige Flottenposition von anderen Orion Nutzern an";
var MSG_SHOW_NEW_PORTALS = "Zeige neue Portale an";
var MSG_SHOW_MOVED_PORTALS = "Zeige versetzte Portale an";
var MSG_SHOW_REMOVED_PORTALS = "Zeige Portale an die nach Unbekannt versetzt wurden";
var MSG_SHOW_TRAINS_ADDED = "Zeige neue Capi Trainings";
var MSG_SHOW_TRAINS_FINISED = "Zeige abgeschlossene Capi Trainings";
var MSG_SHOW_BILL_CLOSED = "Zeige bezahlte Capi Training Rechnungen";
var MSG_POLLY_USERNAME = "Polly Benutzername";
var MSG_POLLY_PW = "Polly Passwort";
var MSG_LEAVE_EMPTY = "Feld nur ausfüllen wenn das Passwort beim Speichern geändert werden soll";
var MSG_VENAD = "Venadname";
var MSG_CLAN_TAG = "Dein Clan Tag";
var MSG_STORE_SETTINGS = "Speichern";
var MSG_TEST_SETTINGS = "Test Login";
var MSG_LOGIN_FAIL = "Login fehlgeschlagen";
var MSG_SEND_SCOREBOARD = "Scoreboard senden";
var MSG_SHOW_CHANGES = "Änderungen anzeigen";
var MSG_NO_CHANGE = "Keine Änderung";
var MSG_PREFERENCES = "Einstellungen";
var MSG_MAX_NEWS_ENTRIES = "Maximale Anzahl angezeigter Nachrichten:";
var MSG_SKY_NEWS = "Orion Sky News";
var MSG_REFRESH = "Aktualisieren";
var MSG_TURN_ON = "Einschalten";
var MSG_REPORTER = "Reporter";
var MSG_SUBJECT = "Betreff";
var MSG_DATE = "Datum";
var MSG_DETAILS = "Details";
var MSG_NEWS_NOT_AVAILABLE = "News nicht verfügbar";
var MSG_SAVED = "Gespeichert";
var MSG_ONLY_NUMBERS = "Nur Zahlen erlaubt";
var MSG_NO_ENTRIES = "Keine Einträge vorhanden";
var MSG_SUBJECT_ORION_FLEET = "Orion Flotte: {0} - {1}";
var MSG_SUBJECT_FLEET_SPOTTED = "Flotte gesichtet: {0} - {1}";
var MSG_SUBJECT_PORTAL_ADDED = "Neues Portal: {0}";
var MSG_SUBJECT_PORTAL_MOVED = "Portal verlegt: {0}";
var MSG_SUBJECT_TRAINING_ADDED = "Neues Training gestartet: {0}";
var MSG_SUBJECT_TRAINING_FINISHED = "Training abgeschlossen: {0}";
var MSG_SUBJECT_BILL_CLOSED = "Training bezahlt";
var MSG_DETAILS_PORTAL_REMOVED = "von {0} nach Unbekannt";
var MSG_DETAILS_TRAINING_ADDED = "aktueller Wert: {0}, Kosten: {1} Cr";
var MSG_UNKNOWN = "Unbekannt";
var MSG_VENAD_SET = "Dein Orion Venadname wurde auf {0} festgelegt.\n\nDiese Meldung erscheint nur ein mal";
var MSG_SHARE_CODE = "Code teilen";
var MSG_INSERT_CODE = "Code automatisch einsetzen";
var MSG_ACTIVATE_ORION = "Orion aktivieren";
var MSG_UNVEIL_MAP = "Karte aufdecken";
var MSG_PREVENT_RELOAD = "Neuladen der Karte vermeiden";
var MSG_TRANSMIT_DATA = "Daten an Polly senden";
var MSG_SHARE_OWN_FLEET_POSITION = "Eigene Flottenposition freigeben";
var MSG_SHOW_SKY_NEWS = "Sky News für diesen Quadranten anzeigen";
var MSG_CLEAR_QUAD_CACHE = "Lokalen Cache für diesen Quadranten löschen";
var MSG_STATUS = "Status";
var MSG_CACHE_CLEARED = "Lokaler Cache für {0} gelöscht";
var MSG_OWN_FLEET = "Eigene Flotten: ";
var MSG_OPPONENT_FLEET = "Fremde Flotten: ";
var MSG_CLAN_PORTALS = "Clan Portale: ";
var MSG_OWN_PORTALS = "Individuelle Portale: ";
var MSG_SKY_OFF = "Sky News ist deaktiviert";
var MSG_NO_DATA_IS_SENT = "Daten werden nicht gesendet";
var MSG_DATA_TRANSMITTED = "Sektordaten wurden gesendet";
var MSG_NO_CREDENTIAL_WARNING = "Senden nicht möglich, da du deine Polly Logindaten nicht angegeben hast.\nDu kannst die Daten in den Revorix Einstellungen ändern\n\nDiese Warnung wird nur einmal angezeigt";
var MSG_SHOW_ORION = "Einblenden";
var MSG_HIDE_ORION = "Ausblenden";
var MSG_CHAT_ENTRIES = "Chat Einträge";
var MSG_ORION_CHAT = "OrionChat";
var MSG_SEND = "Senden";
var MSG_CHAT_IRC_COPY = "IRC";
var MSG_ACTIVATE_CHAT = "Orion Chat aktivieren";
var MSG_ACTIVATE_AUTO_LOGIN = "Auto Login aktivieren";
var MSG_LINK_REMOVED = "Gewaltsam eindringen (Link entfernt, da eigene Clanwache)";
var MSG_AUTO_LOGIN_MAIN = "Auf der Hauptseite";
var MSG_AUTO_LOGIN_SERVER = "Beim Server Login";
var MSG_CW_PASSWORD = "Clanwache Passwort";
var MSG_CW_AUTO_ENTER = "Clanwache Passwort automatisch senden";
var MSG_DISABLE_LOGIN_BUTTON = "Login Button deaktivieren, bis der richtige Code eingegeben wurde";
var MSG_SCRIPT_UPDATED = "Orion Script wurde auf Version {0} aktualisiert. Neu in dieser Version: \n\n{1}";
var MSG_ORION_VERSION = "Orion Script Version";
var MSG_TRAIN_MODE = "Trainigs Modus";
var MSG_ATTACKER_INFO = "Angreifer Flotte: {0}<br>Angreifer Schaden (roh): {1}<br>Sektor: {2}<br>Boni: {3}<br><br>Schaden (inkl. Bonus): {4}</br><b>Schaden (TPT, inkl. Bonus): <span style='color:red'>{5}</span></b> ";
var MSG_WRONG_SECTOR_WARNING = "Achtung: Orion hat den falschen Sektor gewählt.\nBitte wähle in der Karte den Sektor auf dem sich die Flotten befinden bevor du auf 'Angreifen' klickst";
var MSG_RES_ORDER = "Reihenfolge in der Ressourcen eingeladen werden sollen (Komma-getrennte Res Kürzel)";
var MSG_NO_RESOURCE = "'{0}' ist kein gültiges Ressourcen Kürzel";
var MSG_UNLOAD = "Entladen";
var MSG_LOAD = "Einladen";
var MSG_LOAD_HALF = "Hälfte einladen";
var MSG_AUTO_SLURP = "Resourcen automatisch auf Schiffe verteilen (Auto-Slurp)";
var MSG_BACK_TO_MAP = "Nach dem Einladen zurück zur Karte";

//Default clan tag
var CLAN_TAG = "[Loki]";
var CW_TAG = "Von Asgard aus schlugen sie eine Bruecke auf dass ihnen Midgard nie entruecke.";

//Different kinds of news entries
var NEWS_ORION_FLEET = "ORION_FLEET";
var NEWS_FLEET_SPOTTED = "FLEET_SPOTTED";
var NEWS_PORTAL_ADDED = "PORTAL_ADDED";
var NEWS_PORTAL_MOVED = "PORTAL_MOVED";
var NEWS_PORTAL_REMOVED = "PORTAL_REMOVED";
var NEWS_TRAINING_ADDED = "TRAINING_ADDED";
var NEWS_TRAINING_FINISHED = "TRAINING_FINISHED";
var NEWS_BILL_CLOSED = "BILL_CLOSED";
var ALL_NEWS = [{
        key : NEWS_FLEET_SPOTTED,
        desc : MSG_SHOW_SIGHTED_FLEET
    }, {
        key : NEWS_ORION_FLEET,
        desc : MSG_SHOW_FLEET_POSITION
    }, {
        key : NEWS_PORTAL_ADDED,
        desc : MSG_SHOW_NEW_PORTALS
    }, {
        key : NEWS_PORTAL_MOVED,
        desc : MSG_SHOW_MOVED_PORTALS
    }, {
        key : NEWS_PORTAL_REMOVED,
        desc : MSG_SHOW_REMOVED_PORTALS
    }, {
        key : NEWS_TRAINING_ADDED,
        desc : MSG_SHOW_TRAINS_ADDED
    }, {
        key : NEWS_TRAINING_FINISHED,
        desc : MSG_SHOW_TRAINS_FINISED
    }, {
        key : NEWS_BILL_CLOSED,
        desc : MSG_SHOW_BILL_CLOSED
    }
];

//Global Helpers
var MODIFIED_IMGS = [];
var LAST_SECTOR = null;

//Collection of listeners to be notified when orion settings change
var PROPERTY_CHANGE_LISTENERS = [];
//Collection of listeners to be notified when sector data has been parsed
var SECTOR_INFO_LISTENERS = [];

//Execute the script when the page is fully loaded
$(window).load(function () {
    setTimeout(main, SCRIPT_EXECUTION_DELAY);
});

//Main entry point of this script. Checks document uri to decide which actions
//to perform
function main() {
    cleanUp();
    handleUpdate();
    if (!FEATURE_ALL) {
        return;
    }
    var uri = document.baseURI;

    if (uri.indexOf("map.php") !== -1) {
        if (FEATURE_MAP_INTEGRATION) {
            mapIntegration();
        }

        if (FEATURE_SEND_FLEETSCANS && !FEATURE_MAP_INTEGRATION) {
            // if MAP_INTEGRATION is enabled, it will store the current sector
            // position, otherwise, do it here:
            storeFleetPosition();
        }
    } else if (uri.indexOf("set=5") !== -1) {
        if (FEATURE_MAP_INTEGRATION) {
            fleetControlIntegration();
        }
    } else if (uri.indexOf("set=3") !== -1) {
        if (FEATURE_RESOURCE_PRICES) {
            ressIntegration();
        }
    } else if (uri.indexOf("set=6") !== -1) {
        if (FEATURE_MAP_INTEGRATION) {
            // browsing quadrant without having a fleet selected

            GM_deleteValue(PROPERTY_SELECTED_FLEET);
            GM_deleteValue(PROPERTY_SELECTED_FLEET_ID);
        }
    } else if (uri.indexOf("news.php") !== -1) {
        if (FEATURE_NEWS_INTEGRATION) {
            newsIntegration();
        }

        if (FEATURE_ORION_CHAT && getChatEnabled()) {
            orionChatIntegration();
        }

        // Show install note
        if (GM_getValue(PROPERTY_DISPLAY_INSTALL_NOTE, true)) {
            GM_setValue(PROPERTY_DISPLAY_INSTALL_NOTE, false);
            alert(MSG_INSTALL_NOTE);
        }
    } else if (uri.indexOf("index.php") !== -1 || uri === "http://www.revorix.de/") {
        if (FEATURE_LOGIN_INTEGRATION) {
            loginIntegration(false); // normal login
        }
    } else if (uri.indexOf("login") !== -1) {
        if (FEATURE_LOGIN_INTEGRATION) {
            loginIntegration(true); // sever login
        }
    } else if (uri.indexOf("map_fflotte.php") !== -1) {
        if (FEATURE_SEND_FLEETSCANS) {
            fleetScanIntegration();
        }
    } else if (uri.indexOf("pktsur=1") !== -1) {
        if (FEATURE_SEND_SCOREBOARD) {
            scoreboardIntegration(false);
        }
    } else if (uri.indexOf("pkttop=1") !== -1) {
        if (FEATURE_SEND_SCOREBOARD) {
            scoreboardIntegration(true); // top 50
        }
    } else if (uri.indexOf("setup.php") !== -1) {
        settingIntegration();
    } else if (uri.indexOf("sgfx_select.php") !== -1) {
        sectorSizeIntegration();
    } else if (uri.indexOf("news_pop") !== -1) {
        if (FEATURE_BATTLE_REPORTS) {
            battleReportIntegration(false); // news kb
        }
    } else if (uri.indexOf("map_attack.php?fida") !== -1) {
        if (FEATURE_BATTLE_REPORTS) {
            battleReportIntegration(true); // live kb
        }
    } else if (uri.indexOf("map_attack.php?fid") !== -1) {
        if (FEATURE_TRAINING) {
            trainingIntegration();
        }
    } else if (uri.indexOf("handel") !== -1) {
        if (FEATURE_RESOURCE_PRICES) {
            ressIntegrationHz();
        }
    } else if (uri.indexOf("map_fracht") !== -1) {
        if (FEATURE_CARGO) {
            cargoIntegration();
        }
    }
}
// Cleans up deprecated settings
function cleanUp() {
    GM_deleteValue(PROPERTY_SHARE_CODE);
    GM_deleteValue(PROPERTY_TEMPORARY_CODE);
}

function handleUpdate() {
    var prevVersion = GM_getValue(PROPERTY_PREVIOUS_VERSION, ""),
    currentVersion = GM_info.script.version;
    if (prevVersion !== currentVersion) {
        GM_setValue(PROPERTY_PREVIOUS_VERSION, currentVersion);
        var cl = CHANGELOG[currentVersion];
        if (cl !== null && cl !== undefined) {
            var msg = MSG_SCRIPT_UPDATED.format(currentVersion, cl);
            alert(msg);
        }
    }
}

//==== FEATURE: Resource Prices ====
function ressIntegration() {
    var regex = /.*\d+\.gif/;
    requestJson(API_GET_PRICES, {}, function (result) {
        $("img").filter(function (idx) {
            var src = $(this).attr("src");
            return regex.test(src);
        }).each(function (idx) {
            $(this).attr("title", "Preis " + result.prices[idx] +
                " Cr (" + result.date + ")");
        });
    });
}

function ressIntegrationHz() {
    var tbl = findLastTable();
    requestJson(API_GET_PRICES, {}, function (result) {
        var html = "<p style='text-align:left;'>Preise von <b>" + result.date + "</b><br/>";
        $.each(result.prices, function (idx) {
            html += ' <img src="' + ressImg(idx) + '" /> ' + result.prices[idx];
        });
        html += "</p>";
        $(tbl).before(html);
    });
}

//==== FEATURE: CARGO VIEW ====
function cargoIntegration() {
    injectResOrder();
    injectGlobal(slurpX);
    injectGlobal(loadx);

    var zuladenBtn = $("input[name='senden']");
    var settingsHtml = "";
    settingsHtml += '<input type="checkbox" id="autoSlurp" name="autoSlurp"/><label for="autoSlurp">{0}</label><br/>'.format(MSG_AUTO_SLURP);
    settingsHtml += '<input type="checkbox" id="backToMap" name="backToMap"/><label for="backToMap">{0}</label><br/>'.format(MSG_BACK_TO_MAP);
    var html = "";
    html += '<input type="button" class="button" value="{0}" id="unpackage"/> '.format(MSG_UNLOAD);
    html += '<input type="button" class="button" value="{0}" id="package"/> '.format(MSG_LOAD);
    html += '<input type="button" class="button" value="{0}" id="packageHalf"/><br/>'.format(MSG_LOAD_HALF);

    zuladenBtn.parents("td").before('<td>'+settingsHtml+'</td><td>'+html+'</td>');
    
    $("#autoSlurp").attr("checked", isAutoSlurp()).change(function() {
        var auto = $(this).is(":checked");
        setAutoSlurp(auto);
    });
    $("#backToMap").attr("checked", isBackToMap()).change(function() {
        var back = $(this).is(":checked");
        setBackToMap(back);
    });
    
    $("#unpackage").click(function() {
        exec(unloadRess);
    });
    
    $("#package").click(function() {
        exec(function() { loadx(1); });
        if (isBackToMap()) {
            $("input[name='senden_map']").click();
        }
    });
    $("#packageHalf").click(function() {
        exec(function() { loadx(2); });
        if (isBackToMap()) {
            $("input[name='senden_map']").click();
        }
    });
    if (isAutoSlurp()) {
        exec(function() { loadx(1); });
    }
}

function unloadRess() {
    var i;
    for (i = 13; i >= 0; --i) {
        puke(i);
    }
}

function loadx(x) {
    var i;
    for(i = 0; i < RESOURCES.length; ++i) {
        var ress = RESOURCES[i];
        puke(ress);
    }
    for(i = 0; i < RESOURCES.length; ++i) {
        var ress = RESOURCES[i];
        slurpX(ress, x);
    }
}

function slurpX(ress, x) {
    var ship;
    var maxLoad = Math.floor(r_free[ress] / x);

    for(ship = 0; ship < ships; ship++) {
        var tmp = Math.min(maxLoad, unused[ship]);
        maxLoad -= tmp;
        update(ship, ress, r_ships[ship][ress] + tmp);
    }
    resview();
}

//==== FEATURE: ORION CHAT ====
function orionChatIntegration() {
    $("html").css({
        paddingTop : "150px"
    });
    var ad = $("#ad");
    ad.css({
        margin : "0px",
        left : "5px",
        width : "900px",
        textAlign : "left",
        height : "120px"
    });
    var tbl = "";
    tbl += '<table id="orionActive"  class="wrpd" style="float:right">';
    tbl += '<thead>';
    tbl += '<tr><th class="nfo">Orion Aktiv</th></tr>';
    tbl += '</thead>';
    tbl += '<tbody>';
    tbl += '</tbody>';
    tbl += '</table>';
    tbl += '<table class="wrpd" id="orionChat">';
    tbl += '<thead>';
    tbl += '<tr><th class="nfo">{0}</th><th id="secondHead" colspan="2" style="text-align:right;width:100%" class="nfo"><a href="#" id="refreshChat">{1}</a></th></tr>'.format(MSG_ORION_CHAT, MSG_REFRESH);
    tbl += '</thead>';
    tbl += '<tbody>';
    tbl += '</tbody>';
    tbl += '<tfoot>';
    tbl += '<tr><td><input type="text" id="chatText" style="width:590px"/><input id="ircCopy" type="checkbox" checked/> {0} <input style="width:60px" type="button" value="{1}" id="sendChat"/></td></tr>'.format(MSG_CHAT_IRC_COPY, MSG_SEND);
    tbl += '</tfoot>';
    tbl += '</table>';

    ad.html(tbl);

    $("#orionChat").css({
        width : "716px",
        borderSpacing : "0"
    });
    $("#orionChat > tbody, thead tr").css({
        display : "block"
    });
    $("#orionChat > tbody").css({
        height : "90px",
        overflowY : "auto",
        overflowX : "hidden"
    });
    $("#sendChat").click(sendChatEntry);
    $("#chatText").keypress(function (event) {
        if (event.which === 13) {
            sendChatEntry();
        }
    });
    requestChatEntries(false);
    $("#refreshChat").click(function () {
        requestChatEntries(true);
    });
    window.setInterval(function () {
        requestChatEntries(true);
        /* true for polling */
    }, getChatRefreshInterval());
}

function scrollDownChat() {
    var tbody = $("#orionChat > tbody"),
    scrollTo = tbody.find("tr:last-child"),
    top = scrollTo.offset().top - tbody.offset().top + tbody.scrollTop();
    tbody.animate({
        scrollTop : top
    }, 1);
}

function requestChatEntries(polling) {
    var tbody = $("#orionChat > tbody");
    var params = {
        isPoll : polling,
        max : getMaxChatEntries(),
        venad : getSelf()
    };
    requestJson(API_REQUEST_CHAT, params, function (result) {
        if (!polling) {
            tbody.html("");
        }
        $.each(result.chat, function (idx) {
            var itm = result.chat[idx];
            tbody.append('<tr><td>' + itm.date + '</td><td>' + itm.sender + '</td><td>' + itm.message + '</td>');
        });
        var nickBody = $("#orionActive > tbody");
        nickBody.html("");
        $.each(result.activeNicks, function (idx) {
            var nick = result.activeNicks[idx];
            nickBody.append('<tr><td>' + nick + '</td></tr>');
        });
        $("#orionChat tr > :nth-child(1)").css({
            width : "110px"
        });
        $("#orionChat tr > :nth-child(2)").css({
            width : "100px"
        });
        $("#orionChat tr > :nth-child(3)").css({
            width : "490px"
        });
        $("#secondHead").css({
            width : "100%"
        }); // HACK
        scrollDownChat();
    });
}

function sendChatEntry() {
    var inp = $("#chatText"),
    ircCopy = $("#ircCopy").is(":checked"),
    txt = inp.val();

    inp.val("");
    inp.focus();
    if (txt === "") {
        return;
    }
    postJson(API_ADD_TO_CHAT, {
        sender : getSelf(),
        message : txt,
        irc : ircCopy
    },
        function (result) {
        requestChatEntries(true);
    });
}

//==== FEATURE: SEND BATTLE REPORT ====
function battleReportIntegration(isLiveKb) {
    if (!isKB()) {
        return;
    }
    var postData = getBattleReportData(isLiveKb);
    postForm(API_POST_BATTLE_REPORT, {
        report : postData,
        isLive : isLiveKb
    }, function (result) {
        printStatusBattelReport(result.message);
        if (result.lowPzWarning) {
            alert(result.lowPzShips);
        }
    });
}

function printStatusBattelReport(status) {
    if (status !== "") {
        status = " - " + status;
    }
    var node = getElementByXPath("/html/body/table/tbody/tr[2]/td/table/tbody/tr/td");
    try {
        if (node.innerHTML.indexOf("Zurückgelassene Ressourcen") !== -1) {
            node.innerHTML = "Zurückgelassene Ressourcen" + status;
        }
    } catch (e) {
        // live kb
        node = getElementByXPath("/html/body/div[2]/div[2]/div/table/tbody/tr/td/table/tbody/tr/td");
        try {
            if (node.innerHTML.indexOf("Zurückgelassene Ressourcen") !== -1) {
                node.innerHTML = "Zurückgelassene Ressourcen" + status;
            }
        } catch (e1) {}
    }
}

function getBattleReportData(isLiveKb) {
    var tableNode = null;
    if (isLiveKb) {
        tableNode = getElementByXPath("/html/body/div[2]/div[2]/div/table/tbody");
    } else {
        tableNode = getElementByXPath("/html/body/table/tbody");
    }
    var postData = tableNode.textContent;
    return postData;
}

function isKB() {
    // kb of stored message
    var node = getElementByXPath("/html/body/table/tbody/tr[2]/td/table/tbody/tr/td");
    try {
        if (node.innerHTML.indexOf("Zurückgelassene Ressourcen") !== -1) {
            return true;
        }
    } catch (e) {
        // live kb
        node = getElementByXPath("/html/body/div[2]/div[2]/div/table/tbody/tr/td/table/tbody/tr/td");
        try {
            if (node.innerHTML.indexOf("Zurückgelassene Ressourcen") !== -1) {
                return true;
            }
        } catch (e1) {
            return false;
        }
    }
    return false;
}

//integration to find the selected sector size
function sectorSizeIntegration() {
    var submit = $('input[name="senden"]');
    submit.click(function () {
        var selection = $('input[name="sgfx"]:checked').val();
        setProperty(PROPERTY_SECTOR_SIZE, selection, this);
    });
}

//==== FEATURE: SETTINGS ====
function settingIntegration() {
    var body = $('body'),
    content = "";
    content += '<br/><div id="orion" class="wrpd ce"><div class="ml"><div class="mr"><table class="wrpd full">';
    content += '<tr><td class="nfo" colspan="3">Orion Einstellungen</td></tr>';
    content += '<tr>';
    content += '<td>{0}</td><td>{1}</td>'.format(MSG_ORION_VERSION, GM_info.script.version);
    content += '<td rowspan="12" style="vertical-align:middle; text-align:center"><input tabindex="300" class="Button" type="button" id="savePolly" value="{0}"/><br/><input tabindex="301" class="Button" type="button" id="testSettings" value="{1}"/></td>'.format(MSG_STORE_SETTINGS, MSG_TEST_SETTINGS);
    content += '</tr>';
    content += '<tr><td>{0}</td><td><input tabindex="255" class="text" type="text" id="pollyName"/></td></tr>'.format(MSG_POLLY_USERNAME);
    content += '<tr><td>{0}</td><td><input tabindex="256" class="text" type="password" id="pollyPw"/> ({1})</td></tr>'.format(MSG_POLLY_PW, MSG_LEAVE_EMPTY);
    content += '<tr><td>{0}</td><td><input tabindex="257" type="checkBox" id="activateChat"/></td></tr>'.format(MSG_ACTIVATE_CHAT);
    content += '<tr><td>{0}</td><td><input tabindex="258" type="checkBox" id="activateAutoLoginMain" name="autoLoginMain"/><label for="autoLoginMain">{1}</label> <input tabindex="259" type="checkBox" id="activateAutoLoginServer" name="autoLoginServer"/><label for="autoLoginServer">{2}</label></td></tr>'.format(MSG_ACTIVATE_AUTO_LOGIN, MSG_AUTO_LOGIN_MAIN, MSG_AUTO_LOGIN_SERVER);
    content += '<tr><td>{0}</td><td><input tabindex="260" type="checkBox" id="disableLoginButton"/></td></tr>'.format(MSG_DISABLE_LOGIN_BUTTON);
    content += '<tr><td>{0}</td><td><input tabindex="261" class="text" type="text" id="maxChatEntries"/></td></tr>'.format(MSG_CHAT_ENTRIES);
    content += '<tr><td>{0}</td><td>{1}</td></tr>'.format(MSG_VENAD, getSelf());
    content += '<tr><td>{0}</td><td><input tabindex="262" class="text" type="text" id="clantag"/></td></tr>'.format(MSG_CLAN_TAG);
    content += '<tr><td>{0}</td><td><input tabindex="263" class="text" type="text" id="cwPassword"/></td></tr>'.format(MSG_CW_PASSWORD);
    content += '<tr><td>{0}</td><td><input tabindex="264" type="checkBox" id="cwAutoEnter"/></td></tr>'.format(MSG_CW_AUTO_ENTER);
    content += '<tr><td>{0}</td><td><input tabindex="265" class="text" type="text" id="resOrder"/></td></tr>'.format(MSG_RES_ORDER);
    content += '<tr><td>{0}</td><td><input tabindex="266" type="checkBox" id="autoSlurp"/></td><td style="text-align:center"><span id="ok" style="display:none; color:green">OK</span></td></tr>'.format(MSG_AUTO_SLURP);
    content += '</table></div></div></div>';
    content += createChangelogTable();
    body.append(content);

    $("#savePolly").click(saveOrionSettings);
    $("#testSettings").click(testSettings);
    $("#pollyName").val(getPollyUserName());
    $("#maxChatEntries").val(getMaxChatEntries());
    $("#activateChat").attr("checked", getChatEnabled());
    $("#activateAutoLoginMain").attr("checked", getAutoLoginMainEnabled());
    $("#activateAutoLoginServer").attr("checked", getAutoLoginServerEnabled());
    $("#disableLoginButton").attr("checked", getLoginButtonDisabled());
    $("#clantag").val(getClanTag());
    $("#cwPassword").val(getCwPassword());
    $("#cwAutoEnter").attr("checked", getCwAutoEnter());
    $("#resOrder").val(getResOrderAsString());
    $("#autoSlurp").attr("checked", isAutoSlurp());
}

function saveOrionSettings() {
    var userName = $("#pollyName").val(),
    tag = $("#clantag").val(),
    pw = $("#pollyPw").val(),
    hash = CryptoJS.MD5(pw).toString();

    GM_setValue(PROPERTY_LOGIN_NAME, userName);
    if (pw !== "") {
        GM_setValue(PROPERTY_LOGIN_PASSWORD, hash);
    }
    GM_setValue(PROPERTY_CLAN_TAG, tag);

    var maxEntries = parseInt($("#maxChatEntries").val(), 10),
    chatEnabled = $("#activateChat").is(":checked"),
    autoLoginMainEnabled = $("#activateAutoLoginMain").is(":checked"),
    autoLoginServerEnabled = $("#activateAutoLoginServer").is(":checked"),
    cwPassword = $("#cwPassword").val(),
    cwAutoEnter = $("#cwAutoEnter").is(":checked"),
    loginDisabled = $("#disableLoginButton").is(":checked"),
    resOrder = $("#resOrder").val(),
    autoSlurp = $("#autoSlurp").is(":checked");

    GM_setValue(PROPERTY_CHAT_ENTRIES, maxEntries);
    GM_setValue(PROPERTY_ENABLE_CHAT, chatEnabled);
    setAutoLoginMainEnabled(autoLoginMainEnabled);
    setAutoLoginServerEnabled(autoLoginServerEnabled);
    setCwPassword(cwPassword);
    setCwAutoEnter(cwAutoEnter);
    setLoginButtonDisabled(loginDisabled);
    setResOrder(resOrder);
    setAutoSlurp(autoSlurp);

    $("#ok").fadeIn(500, function () {
        $(this).fadeOut(1000);
    });
}

function createChangelogTable() {
    var cl = "";
    $.each(CHANGELOG, function (version, changes) {
        var tmp = "Version: {0}<br/>{1}<br/><br/>".format(version, changes.replace(/\n/gi, "<br/>"));
        cl += tmp;
    });

    var result = '<br/><div id="changelog" class="wrpd ce"><div class="ml"><div class="mr"><table class="wrpd full">';
    result += '<tr><td class="nfo">Orion Changelog</td></tr>';
    result += '<tr><td>{0}</td></tr>'.format(cl);
    result += '</table></div></div></div>';
    return result;
}

function testSettings() {
    requestJson(API_TEST_LOGIN, {}, function (result) {
        if (result.success) {
            $("#ok").fadeIn(500, function () {
                $(this).fadeOut(1000);
            });
        } else {
            alert(MSG_LOGIN_FAIL);
        }
    });
}

//==== FEATURE: SEND SCOREBOARD ====
function getScoreboard() {
    var tableData = document.getElementsByTagName("td");
    var postData = "";

    var start = 4; // skip header
    var length = tableData.length - 1; // skip footer

    for (var i = start; i <= length; i++) {
        if (tableData[i].firstChild.tagName == 'A') { //venad with profile and clantag
            postData += tableData[i].firstChild.textContent;
            if (tableData[i].firstChild.nextSibling) { //venad with profile without clantag
                postData += tableData[i].firstChild.nextSibling.textContent;
            }
        } else { //venad without profile and without clantag
            postData += tableData[i].firstChild.textContent;
        }

        if (i % 3 === 0) {
            postData += "\n";
        } else {
            postData += " ";
        }
    }
    return postData;
}

function getTop50Scoreboard() {
    var tableData = document.getElementsByTagName("td");
    var postData = "";

    var start = 5; // skip header
    var length = tableData.length - 1; // skip footer

    var col = 0;
    for (var i = start; i <= length; i++) {
        if (col === 2) {
            col++;
            continue; // skip "Titel" column;
        }

        if (tableData[i].firstChild.tagName == 'A') { //venad with profile and clantag
            postData += tableData[i].firstChild.textContent;
            if (tableData[i].firstChild.nextSibling) { //venad with profile without clantag
                postData += tableData[i].firstChild.nextSibling.textContent;
            }
        } else { //venad without profile and without clantag
            postData += tableData[i].firstChild.textContent;
        }

        if (col++ === 3) {
            postData += "\n";
            col = 0;
        } else {
            postData += " ";
        }
    }
    return postData;
}

function printStatusScoreboard(status) {
    $("#status").html(status);
}

function scoreboardIntegration(isTop50) {
    scoreboardGui();
    if (!getSendScoreboard()) {
        return;
    }
    var postData = isTop50 ? getTop50Scoreboard() : getScoreboard();
    postForm(API_POST_SCOREBOARD, {
        paste : postData
    }, function (result) {
        printStatusScoreboard(result.message);
        showChanges(result.entries, isTop50);
    });
}

function scoreboardGui() {
    var mr = $('div[class="mr"]');
    var content = "";
    content += '<p style="text-align:left">';
    content += createCheckBox(MSG_SEND_SCOREBOARD, PROPERTY_SEND_SCOREBOARD, '');
    content += createCheckBox(MSG_SHOW_CHANGES, PROPERTY_SHOW_SCOREBOARD_CHANGE, '');
    content += '<span id="status"></span>';
    content += '</p>';

    mr.prepend(content);

    initCheckbox(PROPERTY_SEND_SCOREBOARD);
    initCheckbox(PROPERTY_SHOW_SCOREBOARD_CHANGE);
}

function showChanges(resultEntries, isTop50) {
    if (!getShowScoreboardChanges()) {
        return;
    }
    var table = findLastTable();
    var skip = 2;

    for (var i = 0; i < resultEntries.length; ++i) {
        var rowIdx = skip + i;
        var row = table.rows[rowIdx];
        var entry = resultEntries[i];

        var pointsDiff = entry.currentPoints - entry.previousPoints;
        var rankDiff = entry.currentRank - entry.previousRank;
        var rankText = "";
        if (entry.previousRank === -1 || rankDiff === 0) {
            rankText = " -- {0} seit {1}".format(MSG_NO_CHANGE, entry.previousDate);
        } else if (rankDiff < 0) {
            rankText = '<span style="color:green"> +{0} (vorher: {1})</span> {2}'.format(-rankDiff, entry.previousRank, entry.previousDate);
        } else if (rankDiff > 0) {
            rankText = '<span style="color:read"> -{0} (vorher: {1})</span> {2}'.format(rankDiff, entry.previousRank, entry.previousDate);

        }
        $(row.cells[0]).append(rankText);

        var pointsIdx = isTop50 ? 3 : 2;
        var pointText = '<span> ' + pointsDiff + '</span>';
        if (entry.previousPoints === -1 || pointsDiff === 0) {
            pointText = " -- {0} seit {1}".format(MSG_NO_CHANGE, entry.previousDate);
        } else if (pointsDiff > 0) {
            pointText = '<span style="color:green"> +{0} (vorher: {1})</span> {2}'.format(pointsDiff, entry.previousPoints, entry.previousDate);
        } else if (pointsDiff < 0) {
            pointText = '<span style="color:red"> {0} (vorher: {1})</span> {2}'.format(pointsDiff, entry.previousPoints, entry.previousDate);
        }

        $(row.cells[pointsIdx]).append(pointText);
    }
}

//==== FEATURE: SEND FLEET SCANS ====
function storeFleetPosition() { ///html/body/div[2]/div[2]/div/table/tbody/tr/td[2]
    var node = getElementByXPath("/html/body/div[2]/div[2]/div/table/tbody/tr/td[2]");
    var position = node.firstChild.textContent;
    setProperty(PROPERTY_FLEET_POSITION, position, this);
}

function getShips() {
    var node = null;
    node = getElementByXPath("/html/body/table[3]");
    return node.textContent;
}

function getSensors() {
    var node = null;
    node = getElementByXPath("/html/body/table/tbody/tr[2]/td");
    return node.firstChild.textContent + "\n";
}

function getLeader() {
    var node = null; //html/body/table[2]/tbody
    node = getElementByXPath("/html/body/table[2]/tbody");
    var fleetNameAndLeader = node.childNodes[2].textContent;
    var fleetTag = node.childNodes[3].textContent;
    return fleetNameAndLeader + "\n" + fleetTag;
}

function getData() {
    var data = GM_getValue(PROPERTY_FLEET_POSITION) + "\n";
    data = data + getSensors();
    data = data + getLeader();
    data = data + getShips();
    return data;
}

function printStatus(status) {
    if (status !== "") {
        status = " - " + status;
    }
    var node = getElementByXPath("/html/body/table[2]/tbody/tr/td");
    try {
        if (node.innerHTML.indexOf("Flotten Daten") != -1) {
            node.innerHTML = "Flotten Daten" + status;
        }
    } catch (e) {}
}

function fleetScanIntegration() {
    var postData = getData();
    postForm(API_POST_FLEET_SCAN, {
        scan : postData
    }, function (result) {
        printStatus(result.message);
    });
}

//==== FEATURE: NEWS INTEGRATION ====
function newsIntegration() {
    newsGui();
    firePropertyChanged(this, PROPERTY_ENABLE_SKY_NEWS, false, getEnableSkyNews());
}

//Shows the Orion news in the revorix news overview
function newsGui() {
    var contentDiv = $(".mr");

    var newContent = "";
    // settings
    newContent += '<table id="settingsTable" style="display:none"; class="wrpd full">\n';
    newContent += '<tr>\n';
    newContent += '<td class="nfo" colspan="6">{0}</td>\n'.format(MSG_PREFERENCES);
    newContent += '</tr>\n';
    for (var i = 0; i < ALL_NEWS.length; ++i) {
        var mustCheck = isSubscribbed(ALL_NEWS[i].key);
        newContent += '<tr>\n';
        newContent += '<td colspan="3">' + ALL_NEWS[i].desc + '</td><td colspan="3">';
        newContent += '<input type="checkbox" id="' + ALL_NEWS[i].key + '" class="orionSettings"';
        if (mustCheck) {
            newContent += ' checked';
        }
        newContent += '/></td>\n';
        newContent += '</tr>\n';
    }
    newContent += '<tr>\n';
    newContent += '<td colspan="3">{0}<br\><span style="color:green" style="border:1px solid black;width:30px;display:inline" id="entryStatus">&nbsp;</span></td>'.format(MSG_MAX_NEWS_ENTRIES);
    var me = getMaxNewsEntries() + 1;
    newContent += '<td colspan="3"><input id="maxEntries" type="text" value="{0}"/></td>\n'.format(me);
    newContent += '</tr>\n';
    newContent += '</table>\n';

    // news
    newContent += '<table class="wrpd full">\n';
    newContent += '<tr style="">\n';
    newContent += '<td class="nfo" colspan="5">{0}</td><td style="text-align:right;padding-top:0px" class="nfo"><input type="checkbox" id="toggleOrionNews"/>{1} | <a id="refreshOrion" href="#">{2}</a> | <a id="toggleSettings" href="#">{3}</a></td>\n'.format(MSG_SKY_NEWS, MSG_TURN_ON, MSG_REFRESH, MSG_PREFERENCES);
    newContent += '</tr>\n';
    newContent += '<tr class="hideIfOff">\n';
    newContent += '<td colspan="2">{0}</td><td>{1}</td><td>{2}</td><td colspan="2">{3}</td>\n'.format(MSG_REPORTER, MSG_SUBJECT, MSG_DATE, MSG_DETAILS);
    newContent += '</tr>\n';
    newContent += '<tbody id="orionNews" class="hideIfOff">';
    newContent += '<tr><td colspan="6">{0}</td></tr>'.format(MSG_NEWS_NOT_AVAILABLE);
    newContent += '</tbody>\n';
    newContent += '</table>\n';

    contentDiv.prepend(newContent);

    $("#toggleOrionNews").change(function () {
        var val = $(this).is(":checked");
        setProperty(PROPERTY_ENABLE_SKY_NEWS, val, this);
    }).attr("checked", getEnableSkyNews());

    $("#refreshOrion").click(function () {
        if (getOrionActivated()) {
            requestNews(getMaxNewsEntries());
        }
    });

    $("#toggleSettings").click(function () {
        $("#settingsTable").fadeToggle();
    });
    $(".orionSettings").change(function () {
        var val = $(this).is(":checked");
        var key = $(this).attr("id");
        if (val) {
            subscribe(key);
        } else {
            unsubscribe(key);
        }
    });
    $("#maxEntries").change(function () {
        var val = "" + $(this).val();
        if (val.match(/^\d+$/)) {
            setProperty(PROPERTY_MAX_NEWS_ENTRIES, parseInt(val, 10) - 1, this);
            $("#entryStatus").html(" {0}!".format(MSG_SAVED)).css({
                color : "green"
            });
        } else {
            $("#entryStatus").html(" {0}!".format(MSG_ONLY_NUMBERS)).css({
                color : "red"
            });
            $(this).val(getMaxNewsEntries() + 1);
        }
    }).keypress(function () {
        $("#entryStatus").html("&nbsp;");
    });
    addPropertyChangeListener(handleEnableSkyNews);
}

//handles change of PROPERTY_ENABLE_SKY_NEWS to retrieve and display the latest
//news
function handleEnableSkyNews(property, oldVal, newVal) {
    if (property != PROPERTY_ENABLE_SKY_NEWS) {
        return;
    }

    if (newVal) {
        requestNews(getMaxNewsEntries());
        $(".hideIfOff").show();
    } else {
        $(".hideIfOff").hide();
    }
}

function requestNews(maxEntries) {
    requestJson(API_ORION_NEWS, {
        venad : getSelf()
    }, function (result) {
        var newContent = "";
        if (result.length === 0) {
            newContent += '<tr><td colspan="6">{0}</td></tr>'.format(MSG_NO_ENTRIES);
        } else {
            $.each(result, function (idx, entry) {
                if (idx > maxEntries) {
                    return false;
                } else if (!isSubscribbed(entry.type)) {
                    return true;
                }
                logObject(entry);
                newContent += '<tr>';
                newContent += '<td colspan="2">' + entry.reporter + '</td>';
                newContent += '<td>' + getSubjectFromNewsEntry(entry) + '</td>';
                newContent += '<td>' + entry.date + '</td>';
                newContent += '<td colspan="2">' + getDetailsFromNewsEntry(entry) + '</td>';
                newContent += '</tr>';
                return true;
            });
        }
        $("#orionNews").html(newContent);
    });
}

//Requests current orion news but filters them to retain only those which are
//subject to the provided quadrant
function requestNewsForQuadrant(maxEntries, quadName, onSuccess) {
    requestJson(API_ORION_NEWS, {
        venad : getSelf()
    }, function (result) {
        var entries = [];
        $.each(result, function (idx, entry) {
            if (entries.length >= maxEntries) {
                return false;
            }
            var sector = getSectorFromNewsEntry(entry);
            if (sector.quadName == quadName) {
                entries.push(entry);
            }
            return true;
        });
        onSuccess(entries);
    });
}

function getSubjectFromNewsEntry(entry) {
    switch (entry.type) {
    case NEWS_ORION_FLEET:
        return MSG_SUBJECT_ORION_FLEET.format(entry.subject.name, entry.subject.ownerName);
    case NEWS_FLEET_SPOTTED:
        return MSG_SUBJECT_FLEET_SPOTTED.format(entry.subject.name, entry.subject.ownerName);
    case NEWS_PORTAL_ADDED:
        return MSG_SUBJECT_PORTAL_ADDED.format(entry.subject.ownerName);
    case NEWS_PORTAL_REMOVED:
    case NEWS_PORTAL_MOVED:
        return MSG_SUBJECT_PORTAL_MOVED.format(entry.subject.ownerName);
    case NEWS_TRAINING_ADDED:
        return MSG_SUBJECT_TRAINING_ADDED.format(entry.subject.type);
    case NEWS_TRAINING_FINISHED:
        return MSG_SUBJECT_TRAINING_FINISHED.format(entry.subject.type);
    case NEWS_BILL_CLOSED:
        return MSG_SUBJECT_BILL_CLOSED;
    }
    return "?";
}

function getDetailsFromNewsEntry(entry) {
    switch (entry.type) {
    case NEWS_ORION_FLEET:
    case NEWS_FLEET_SPOTTED:
    case NEWS_PORTAL_ADDED:
    case NEWS_PORTAL_MOVED:
        return location(getSectorFromNewsEntry(entry), true);
    case NEWS_PORTAL_REMOVED:
        return MSG_DETAILS_PORTAL_REMOVED.format(location(getSectorFromNewsEntry(entry), true));
    case NEWS_TRAINING_ADDED:
        return MSG_DETAILS_TRAINING_ADDED.format(entry.subject.currentValue, entry.subject.costs);
    case NEWS_TRAINING_FINISHED:
        return "";
    case NEWS_BILL_CLOSED:
        return "";
    }
    return "?";
}

function getSectorFromNewsEntry(entry) {
    switch (entry.type) {
    case NEWS_ORION_FLEET:
    case NEWS_FLEET_SPOTTED:
    case NEWS_PORTAL_ADDED:
    case NEWS_PORTAL_MOVED:
    case NEWS_PORTAL_REMOVED:
        return entry.subject.sector;
    default:
        return {
            quadName : MSG_UNKNOWN,
            x : 0,
            y : 0
        };
    }
}

//==== FEATURE: LOGIN INTEGRATION ====
var doFocusCodeField;
var loginBtn;
var isServerLogin;
function loginIntegration(serverLogin) {
    var loginBtnSelector = 'input[src="set/gfx/in5.gif"]';
        isServerLogin = serverLogin;
    if (serverLogin) {
        loginBtnSelector = 'input[src="tpl/gfx/in5.gif"]'
    }
    loginBtn = $(loginBtnSelector);
    var inputVname = $('input[name="vname"]');
    var inputUcode = $('input[name="ucode"]');
    var rxName = $('input[name="uname"]');

    inputUcode.css({
        backgroundImage : "none"
    });
    codeFail(loginBtn, inputUcode);
    inputUcode.bind('input propertychange', function () {
        var currentCode = inputUcode.val();
        var idx = currentCode.indexOf("?");
        var disable = idx != -1 || currentCode.length != 4;
        if (disable) {
            codeFail(loginBtn, inputUcode);
        } else {
            codeSuccess(loginBtn, inputUcode);
        }
    });

    // insert venad name
    inputVname.attr("value", getSelf());

    if (rxName.val() === "") {
        // insert rx user name and focus pw field
        rxName.val(getRxLoginName());
        var inputPw = $('input[name="upasswort"]');
        inputPw.focus();
        doFocusCodeField = false;
    } else {
        // select code. assumption is that user name and pw are inserted by the
        // browser
        inputUcode.select();
        doFocusCodeField = true;
    }

    loginGui(serverLogin, loginBtn);
    loginBtn.click(function () {
        var self = $('input[name="vname"]').val();

        // store rx user name
        setProperty(PROPERTY_ORION_RX_LOGIN, rxName.val(), this);

        if (self !== "" && self.toLowerCase() !== getSelf().toLowerCase()) {
            alert(MSG_VENAD_SET.format(self));
        }
        setProperty(PROPERTY_ORION_SELF, self, this);
    });

    firePropertyChanged(this, PROPERTY_FILL_IN_CODE, false, getAutoFillInCode());
}

function handleAutoLogin(serverLogin, loginButton) {
    if (serverLogin && getAutoLoginServerEnabled() ||
        !serverLogin && getAutoLoginMainEnabled()) {

        loginButton.focus();
        loginButton.click();
    }
}

function codeSuccess(loginButton, inputUCode) {
    if (getLoginButtonDisabled()) {
        loginButton.prop("disabled", false);
    }
    inputUCode.css({
        backgroundColor : "green"
    });
    handleAutoLogin(isServerLogin, loginButton);
}

function codeFail(loginButton, code) {
    if (getLoginButtonDisabled()) {
        loginButton.prop("disabled", true);
    }
    code.css({
        backgroundColor : "red"
    });
}

//Adds checkbox to login formulars
function loginGui(serverLogin, loginBtn) {
    if (serverLogin) {
        // remove <br>
        loginBtn.prev().remove();
        $("#ri").css({
            "textAlign" : "left"
        });
    } else {
        $('form[name="ls"]').css({
            "textAlign" : "left"
        });
    }

    var append = "";
    append += createCheckBox(MSG_INSERT_CODE, PROPERTY_FILL_IN_CODE);
    loginBtn.before(append);
    initCheckbox(PROPERTY_FILL_IN_CODE);
    addPropertyChangeListener(handleInsertCode);
}
//Handle the change of auto inserting the code
function handleInsertCode(property, oldVal, newVal) {
    if (property != PROPERTY_FILL_IN_CODE) {
        return;
    }

    if (newVal) {
        requestJsonX(CAPTCHA_URL, "", {}, function (result) {
            var inp = $('input[name="ucode"]');
            inp.val(result.code);
            var idx = result.code.indexOf("?");
            var invalidCode = idx != -1;

            if (doFocusCodeField) {
                if (invalidCode) {
                    var input = inp[0];
                    setInputSelection(input, idx, idx + 1);
                    // login button will be enabled by changing the value of the code input
                } else {
                    inp.focus().select();
                }
            }

            if (!invalidCode) {
                codeSuccess(loginBtn, inp);
            }

        });
    } else {
        $('input[name="ucode"]').val("");
    }
}

//==== FEATURE: TRAINING INTEGRATION ====
function trainingIntegration() {
    var lastSector = getLastSector();

    var infoTable = $('table.gnfo');
    var attackerFleet = getAttackerFleetName(infoTable.html());
    if (isTrainModeAttacker(attackerFleet)) {
        var aw = parseInt(getAw(attackerFleet), 10);
        var awTPT = calculateAwTPT(aw, lastSector.attacker);
        var sectorValid = verifyCorrectSector(lastSector, attackerFleet);
        if (!sectorValid) {
            alert(MSG_WRONG_SECTOR_WARNING);
        }

        attackerInfoGui(infoTable, lastSector, aw, attackerFleet);
        var defenderTable = $('table[class="wrpd full"]').first();
        defenderInfoGui(lastSector, defenderTable, awTPT, true);
    }
}

function defenderInfoGui(sector, defenderTable, awTPT, sectorValid) {
    $(defenderTable).find("td").each(function (foo) {
        var me = $(this);
        var idx = me.index();
        if (idx == 1) {
            var defenderFleet = me.text();

            if (isTrainingDefender(defenderFleet)) {
                var def = getDef(defenderFleet);
                var damage = def - awTPT;
                var info = "Def: {0} ".format(def);
                if (damage < 0 || !sectorValid) {
                    info += '<span style="color: red">';
                } else {
                    info += '<span style="color: green">';
                }
                info += "Differenz: <b>{0}</b>".format(damage);
                info += '</span>';
                me.html("<b>" + defenderFleet + "</b> " + info);
            }
        }
    });
}

function verifyCorrectSector(sector, fleetName) {
    var fleets = sector.ownFleets;
    for (i = 0; i < fleets.length; ++i) {
        if (fleets[i].fleetName === fleetName) {
            return true;
        }
    }
    return false;
}

function attackerInfoGui(infoTable, sector, aw, attackerFleet) {
    var sectorName = '{0} X:{1} Y:{2}'.format(sector.quadName, sector.x, sector.y);
    var boni = 'Angreifer: <b>{0}%</b>, Verteidiger: {1}%'.format(sector.attacker, sector.defender);
    var awTPT = calculateAwTPT(aw, sector.attacker);
    var rawAw = calculateAw(aw, sector.attacker);

    var html = '<table class="full gnfo" style="margin-top:10px;">';
    html += '<tr><td style="backround-image: none; border-top: 5px solid red; border-bottom: 5px solid red">';
    html += '<b>{0}</b><br>'.format(MSG_TRAIN_MODE);
    html += MSG_ATTACKER_INFO.format(attackerFleet, aw, sectorName, boni, rawAw, awTPT);
    html += '</td></tr>';
    html += '</table>';
    infoTable.after(html);
}

function calculateAw(rawAw, rawBonus) {
    var factor = calcFactor(rawBonus);
    return rawAw * factor;
}

function calculateAwTPT(rawAw, rawBonus) {
    var factor = calcFactor(rawBonus);
    return rawAw * factor * 0.5;
}

function calcFactor(rawBonus) {
    return 1.0 + rawBonus / 100.0;
}

function isTrainModeAttacker(attackerName) {
    var regex = /aw-\d+/;
    return regex.test(attackerName);
}

function isTrainingDefender(defenderName) {
    var regex = /sc-\d+-pz-\d+/;
    return regex.test(defenderName);
}

function getAw(attackerName) {
    return attackerName.substr(attackerName.indexOf("-") + 1);
}

function getDef(defenderName) {
    var regex = /sc-(\d+)-pz-(\d+)/;
    regex.test(defenderName);
    return parseInt(RegExp.$1, 10) + parseInt(RegExp.$2, 10);
}

function getAttackerFleetName(tableHtml) {
    var start = tableHtml.indexOf("Flotte: ");
    if (start != -1) {
        start += "Flotte: ".length;
        var end = tableHtml.indexOf("<br>", start);
        var length = end - start;
        return tableHtml.substr(start, length);
    }
    return "<unknown>";
}

//==== FEATURE: MAP INTEGRATION ====
//Entry point for the script which is executed for the fleet control panel page
function fleetControlIntegration() {
    // Find out currently selected own fleet
    var table = $('table[width="100%"]')[0];
    var cell = $(table.rows[1].cells[0]).text();
    var fleetName = cell.split("\n")[0].replace(/ /g, "");

    var fleetId = findFleetId($("body").html());

    GM_setValue(PROPERTY_SELECTED_FLEET_ID, fleetId);
    GM_setValue(PROPERTY_SELECTED_FLEET, fleetName);
}

//Entry point of this script for revorix flight integration
function mapIntegration() {
    handleClanWache();
    mapGui();
    initProperties();
}

//Adds a listener which is notified when sector information is available
//signature of the listener: sector
function addSectorInfoListener(listener) {
    SECTOR_INFO_LISTENERS.push(listener)
}

//Notifies all listeners about available sector information
function fireSectorInfoParsed(sector) {
    for (var i = 0; i < SECTOR_INFO_LISTENERS.length; ++i) {
        try {
            SECTOR_INFO_LISTENERS[i].call(null, sector);
        } catch (ignore) {
            log(ignore);
        }
    }
}

//Reads information of currently displayed fleets
function parseFleetInformation(includeOwnFleets) {
    var YOUR_FLEET = "Ihre Flotte: ";
    var ALIEN_PREFIX = "Reg-Nr";

    var table = findLastTable();
    var cell = table.rows[1].cells[0];
    var result = {
        ownFleets : [],
        fleets : []
    };
    $.each($(cell).html().split("<br>"), function (idx, row) {
        if (row === "") {
            return true;
        }
        var strippedRow = stripHtml(row);
        if (startsWith(strippedRow, YOUR_FLEET)) {
            if (includeOwnFleets) {
                var fleetId = findFleetId(row);
                var fleetName = strippedRow.substr(YOUR_FLEET.length);
                result.ownFleets.push({
                    'fleetId' : fleetId,
                    'fleetName' : fleetName,
                    'owner' : getSelf() + getClanTag()
                });
            }
        } else if (startsWith(strippedRow, ALIEN_PREFIX)) {
            return true;
        } else {
            var parts = strippedRow.split(" - ");
            result.fleets.push({
                fleetName : parts[0],
                owner : parts[1]
            });
        }
    });
    return result;
}

//Reads information of the currently displayed sector and returns them as
//object
function parseCurrentSectorInformation() {
    if (LAST_SECTOR !== undefined && LAST_SECTOR !== null) {
        return LAST_SECTOR;
    }
    var QUAD_INFO_REGEX = /([a-zA-Z0-9- ]+) X:(\d+) Y:(\d+)/;
    var SENS_REGEX = /Sensorstärke: (.+)/;
    var RESS_REGEX = /r(\d+)\.gif">(\d+) \((\d+(\.\d+)?)\)/;
    var WORMHOLE_REGEX = /"map_wrm\.php.+>(.+)<\/a>/;

    var qd = $("td[width='200']");
    var quadDetails = qd.text();
    var rows = qd.html().split("<br>");
    var result = {
        valid : true,
        production : [],
        personalPortals : [],
        clanPortals : []
    };

    var MODE_NONE = 0;
    var MODE_PERSONAL_PORTAL = 1;
    var MODE_CLAN_PROTAL = 2;
    var mode = MODE_NONE;

    $.each(rows, function (idx, row) {
        if (row.search(WORMHOLE_REGEX) != -1) {
            result['wormhole'] = RegExp.$1;
        }
        if (QUAD_INFO_REGEX.test(row)) {
            result['quadName'] = RegExp.$1;
            result['x'] = parseInt(RegExp.$2, 10);
            result['y'] = parseInt(RegExp.$3, 10);
        } else if (row.indexOf("txt.gif") != -1) {
            result['type'] = stripHtml(row);
        } else if (row.indexOf("a.gif") != -1) {
            var boni = stripHtml(row).replace(/%/g, "").split(" ");
            result['attacker'] = parseInt(boni[0], 10);
            result['defender'] = parseInt(boni[1], 10);
            result['guard'] = parseInt(boni[2], 10);
        } else if (SENS_REGEX.test(row)) {
            result['sens'] = RegExp.$1;
        } else if (RESS_REGEX.test(row)) {
            result.production.push({
                ressId : parseInt(RegExp.$1, 10),
                rate : (RegExp.$3)
            });
        } else if (row.indexOf("Individuelles Portal") != -1) {
            mode = MODE_PERSONAL_PORTAL;
        } else if (row.indexOf("Clan Portal") != -1) {
            mode = MODE_CLAN_PROTAL;
        } else if (startsWith(row, "</td>")) {
            mode = MODE_NONE;
        } else if (mode == MODE_PERSONAL_PORTAL) {
            result.personalPortals.push(row);
        } else if (mode == MODE_CLAN_PROTAL) {
            result.clanPortals.push(row);
        }
        return true;
    });
    result.valid = result['x'] !== null && result['y'] !== null &&
        result['type'] !== null && result['quadName'] !== null;

    LAST_SECTOR = result;
    return result;
}

//initially reads some settings and notifies listeners about them
function initProperties() {
    // When sector info is available, store current position for the fleet
    // scan script
    addSectorInfoListener(function (sector) {
        var position = sector.quadName + " X:" + sector.x + " Y:" + sector.y;
        GM_setValue(PROPERTY_FLEET_POSITION, position);
    });
    firePropertyChanged(this, PROPERTY_ORION_ON, false, getOrionActivated());
    handleShowOrion(getOrionHidden(), getOrionActivated());
}

function handleClanWache() {
    var td = $(".ce");

    if (td === null || td === undefined) {
        return;
    }
    var text = td.text();
    if (text.contains(CW_TAG)) {
        var link = $('a[href^="map_attack"]');
        link.replaceWith(MSG_LINK_REMOVED);
        var code = $('input[name="dcode"]');
        code.val(getCwPassword());

        if (getCwAutoEnter()) {
            var enter = $('input[name="eindringen"]');
            enter.click();
        }
    }
}

//Creates orion gui within revorix flight view
function mapGui() {
    var table = findLastTable();
    if (table === null) {
        log("No table found?!");
        return;
    }
    var firstCell = $(table.rows[1].cells[0]);
    var jtbl = $(table);
    var appendStr = '';
    var margin = "margin-left: 20px";
    var display = getOrionActivated() ? "" : "display:none";
    appendStr += '<tr><td>';
    var showToggleText = getOrionHidden() ? MSG_SHOW_ORION : MSG_HIDE_ORION;
    appendStr += '<p><b style="color:yellow">Orion</b> ' + createLink(showToggleText, "", "toggleShow") + ' | <a target="_blank" id="heatMap" href="#">HeatMap</a></p>';
    appendStr += createCheckBox(MSG_ACTIVATE_ORION, PROPERTY_ORION_ON);
    appendStr += '<span class="hideIfOff" style="' + display + '">';
    appendStr += createCheckBox(MSG_UNVEIL_MAP, PROPERTY_AUTO_UNVEIL, margin);
    appendStr += createCheckBox(MSG_PREVENT_RELOAD, PROPERTY_LOCAL_CACHE, margin);
    appendStr += createCheckBox(MSG_TRANSMIT_DATA, PROPERTY_POST_SECTOR_INFOS, margin);
    appendStr += createCheckBox(MSG_SHARE_OWN_FLEET_POSITION, PROPERTY_POST_OWN_FLEET_INFOS, margin);
    appendStr += createCheckBox(MSG_SHOW_SKY_NEWS, PROPERTY_ENABLE_QUAD_SKY_NEWS, margin);
    appendStr += createLink(MSG_CLEAR_QUAD_CACHE, margin, "clearCache") + '<br/>';
    appendStr += '</span>';

    appendStr += '<p class="hideIfOff" style="' + display + '"><b style="color:yellow">{0}</b></p>'.format(MSG_STATUS);
    appendStr += '<p style="' + margin + ';' + display + '" id="status" class="hideIfOff"></span></p>'

    appendStr += '</td><td>'
    appendStr += '<p class="hideIfOff" style="' + display + '"><b style="color:yellow">{0}</b></p>'.format(MSG_SKY_NEWS);
    appendStr += '<p id="news" class="hideIfOff" style="' + display + '"></span></p>'
    appendStr += '</td></tr>';
    jtbl.append(appendStr);

    // hook up checkboxes with event handlers
    initCheckbox(PROPERTY_ORION_ON);
    initCheckbox(PROPERTY_AUTO_UNVEIL);
    initCheckbox(PROPERTY_LOCAL_CACHE);
    initCheckbox(PROPERTY_POST_SECTOR_INFOS);
    initCheckbox(PROPERTY_POST_OWN_FLEET_INFOS);
    initCheckbox(PROPERTY_ENABLE_QUAD_SKY_NEWS);

    // HACK: set up links separately
    $("#toggleShow").click(function () {
        setProperty(PROPERTY_ORION_HIDDEN, !getOrionHidden(), this);
    });
    $("#clearCache").click(function () {
        var sector = parseCurrentSectorInformation();
        var cacheKey = PROPERTY_CACHED_QUADRANT + sector.quadName;
        GM_deleteValue(cacheKey);
        appendStatus(MSG_CACHE_CLEARED.format(sector.quadName));
    });

    // Print info about activation status of Sky News
    addPropertyChangeListener(enableCheckboxActions);
    addPropertyChangeListener(handleUnveilMap);
    addPropertyChangeListener(handlePostSectorInfos);
    addPropertyChangeListener(handleEnableSkyNewsQuads);
    addPropertyChangeListener(handleToggleShow);

    addSectorInfoListener(function (sector) {
        var appendIf = function (caption, arr) {
            if (arr.length !== 0) {
                appendStatus(caption + arr.length);
            }
        };

        appendIf(MSG_OWN_FLEET, sector.ownFleets);
        appendIf(MSG_OPPONENT_FLEET, sector.fleets);
        appendIf(MSG_CLAN_PORTALS, sector.clanPortals);
        appendIf(MSG_OWN_PORTALS, sector.personalPortals);

        var params = {};
        params['venad'] = getSelf();
        params['quadrant'] = sector.quadName;
        var heatMapUrl = makeApiUrl(API_HEAT_MAP, true, params);
        $("#heatMap").attr("href", heatMapUrl);
    });
}
//Finds the last wrpd full table on the current page
function findLastTable() {
    var tables = $('table[class="wrpd full"]');
    if (tables.length > 0) {
        return tables[tables.length - 1];
    }
    return null;
}
//Creates a checkbox for changing the provided property
function createCheckBox(caption, property, style) {
    if (!style)
        var style = "";

    var checked = GM_getValue(property, false) ? "checked" : "";
    var id = property.replace(/\./g, "_");
    return '<input type="checkbox" class="orionSettings" id=' + id + ' style="' +
    style + '" ' + checked + ' /> ' + caption + '<br/>';
}

function createLink(caption, style, id) {
    return '<a href="#" id="' + id + '" style="' + style + '">' + caption + '</a>'
}
//Initializes a checkbox: sets its checked state according to its property and
//adds a change handler which changes their property
function initCheckbox(property) {
    var id = property.replace(/\./g, "_");
    var chk = $("#" + id);
    chk.attr("checked", GM_getValue(property, false));
    chk.change(function () {
        var val = $(this).is(":checked");
        setProperty(property, val, this);
    });
}
//Sets the provided string to the sky news display
function setSkyNewsText(s) {
    $("#news").html(s);
}
//Appends the provided string to the status display
function appendStatus(s) {
    $("#status").append(s + "<br/>");
}
//Clears current status display
function clearStatus(s) {
    if (!s)
        var s = "";
    $("#status").html(s + "</br>");
}

//
//Disables or enables all checkboxes according to current orion activation state
function enableCheckboxActions(property, oldVal, newVal) {
    if (property != PROPERTY_ORION_ON) {
        return;
    }
    var id = PROPERTY_ORION_ON.replace(/\./g, "_");
    $(".orionSettings").filter(function (idx) {
        return $(this).attr("id") != id;
    }).attr("disabled", !newVal);

    handleShowOrion(getOrionHidden(), newVal);
    if (!newVal) {
        clearStatus();
    }
}

//Handles click on Show/Hide Orion without deactivating it
function handleToggleShow(property, oldVal, newVal) {
    if (property != PROPERTY_ORION_HIDDEN) {
        return;
    }

    handleShowOrion(newVal, getOrionActivated());
}

//Decides whether orion controls should be shown
function handleShowOrion(hidden, activated) {
    var toggleShow = $("#toggleShow");

    if (activated) {
        toggleShow.show();
    } else {
        toggleShow.hide();
    }

    if (hidden) {
        $(".hideIfOff").hide();
        toggleShow.text(MSG_SHOW_ORION);
    } else if (!activated) {
        $(".hideIfOff").hide();
    } else {
        toggleShow.show();
        $(".hideIfOff").fadeIn();
        $("#toggleShow").text(MSG_HIDE_ORION);
    }
}

function handleUnveilMap(property, oldVal, newVal) {
    switch (property) {
    case PROPERTY_AUTO_UNVEIL:
    case PROPERTY_ORION_ON:
        break;
    default:
        return;
    }
    var unveil = getOrionActivated() && getUnveilQuadrant();
    var sector = parseCurrentSectorInformation();
    var cacheKey = PROPERTY_CACHED_QUADRANT + sector.quadName;
    if (unveil) {
        var request = getUseLocalCache() ? requestCachedJson : forceRequestCachedJson;

        log("Unveiling...");
        request(API_REQUEST_QUADRANT, {
            q : sector.quadName
        },
            cacheKey, handleUnveil);
    } else {
        log("Hiding...");
        hideMap();
    }
}

function handleEnableSkyNewsQuads(property, oldVal, newVal) {
    switch (property) {
    case PROPERTY_ENABLE_QUAD_SKY_NEWS:
    case PROPERTY_ORION_ON:
        break;
    default:
        return;
    }
    var enable = getEnableQuadSkyNews() && getOrionActivated();
    if (!enable) {
        setSkyNewsText(MSG_SKY_OFF);
        $('td[width="200"]').css({
            "width" : "200"
        });
    } else {
        $('td[width="200"]').css({
            "width" : "320"
        });
        setSkyNewsText("");
        var sector = parseCurrentSectorInformation();
        requestNewsForQuadrant(getMaxNewsEntries(), sector.quadName, function (entries) {
            var newContent = "";
            var q = findQuadrantIdFroumUri().toString();

            // sort entries by type
            entries.sort(function (a, b) {
                return a.type.localeCompare(b.type);
            });
            $.each(entries, function (idx, entry) {
                var sector = getSectorFromNewsEntry(entry);

                var plus = "+";
                switch (entry.type) {
                case NEWS_ORION_FLEET:
                    var href = RX_SECTOR_URL.format(findQuadrantIdFroumUri(), sector.x, sector.y);
                    newContent += '<span class="hover" x="{0}" y="{1}" title="Reporter: {2} um {3}">Orion Flotte: <b>{4}</b> bei <a href="{6}">{5}</a> ({3})</span>'.format(sector.x, sector.y, entry.reporter, entry.date, entry.subject.ownerName, location(sector, false), href);
                    newContent += ' (' + entry.date + ')</span>';
                    newContent += "<br/>";
                    break;
                case NEWS_FLEET_SPOTTED:
                    var href = RX_SECTOR_URL.format(findQuadrantIdFroumUri(), sector.x, sector.y);
                    newContent += '<span class="hover" x="{0}" y="{1}" title="Reporter: {2} um {3}">Flotte: <b>{4}</b> bei <a href="{6}">{5}</a> ({3})</span>'.format(sector.x, sector.y, entry.reporter, entry.date, entry.subject.ownerName, location(sector, false), href);
                    newContent += ' (' + entry.date + ')</span>';
                    newContent += "<br/>";
                    break;
                case NEWS_PORTAL_MOVED:
                case NEWS_PORTAL_REMOVED:
                    plus = "-"; // fall through
                case NEWS_PORTAL_ADDED:
                    newContent += '<span class="hover" x="{0}" y="{1}">'.format(sector.x, sector.y);
                    newContent += plus + "Ind. Portal: <b>{0}</b> bei {1}".format(entry.subject.ownerName, location(sector, false));
                    newContent += ' </span>';
                    newContent += "</br>";
                    break;
                }
            });
            setSkyNewsText(newContent);
            $(".hover").mouseover(function () {
                var x = $(this).attr("x");
                var y = $(this).attr("y");
                var alt = "X:" + x + " " + "Y:" + y;
                var imgx = $('img[alt="' + alt + '"]');
                imgx.attr("src_old", imgx.attr("src"));
                imgx.attr("src", img("u.gif"));
                imgx.attr("width", "15");
                imgx.attr("height", "15");
            });
            $(".hover").mouseout(function () {
                var x = $(this).attr("x");
                var y = $(this).attr("y");
                var alt = "X:" + x + " " + "Y:" + y;
                var imgx = $('img[alt="' + alt + '"]');
                imgx.attr("src", imgx.attr("src_old"));
                imgx.attr("width", "10");
                imgx.attr("height", "10");
            });
        });
    }
}

function hoverSector() {}

function findQuadrantIdFroumUri() {
    var idx = /q=(\d+)/;
    var uri = document.baseURI;
    if (idx.test(uri)) {
        return RegExp.$1;
    }
    return 0;
}

function handlePostSectorInfos(property, oldVal, newVal) {
    switch (property) {
    case PROPERTY_POST_SECTOR_INFOS:
    case PROPERTY_ORION_ON:
        break;
    default:
        return;
    }
    var doPost = getPostSectorInfos() && getOrionActivated();
    if (!doPost) {
        clearStatus("<b>{0}!</b>".format(MSG_NO_DATA_IS_SENT));
        return;
    }
    clearStatus();
    var sector = parseCurrentSectorInformation();

    var fleets = {
        ownFleets : [],
        fleets : []
    };

    if (getPostSectorInfos()) {
        fleets = parseFleetInformation(getPostOwnFleetInfos());
    }

    sector['ownFleets'] = fleets.ownFleets;
    sector['fleets'] = fleets.fleets;
    sector['shareOwnFleets'] = getPostOwnFleetInfos();
    sector['self'] = getSelf();
    LAST_SECTOR = sector;
    setLastSector(sector);

    fireSectorInfoParsed(sector);

    logObject(sector);

    if (getPostSectorInfos()) {
        postJson(API_POST_SECTOR, sector, function () {
            appendStatus(MSG_DATA_TRANSMITTED);
        });
    }
}

//process the json comming from the server
function handleUnveil(json) {
    var sectorInfos = {};
    $.each(json.sectors, function (idx, value) {
        var k = key(value.x, value.y);
        sectorInfos[k] = value;
    });
    var sector = parseCurrentSectorInformation();
    var prescanned = sector.sens == "vorgescannt";
    unveilMap(sectorInfos, prescanned);
}

function unveilMap(sectorInfos, prescanned) {
    var REGEX = /X:(\d+) Y:(\d+)/;
    if (!MODIFIED_IMGS) {
        log("huh");
        return;
    }
    $("img").each(function () {
        var ths = $(this);
        var alt = ths.attr("alt");
        var src = ths.attr("src");

        if (alt && REGEX.test(alt)) {
            var x = RegExp.$1;
            var y = RegExp.$2;
            var k = key(x, y);
            var sector = sectorInfos[k];
            if (sector) {
                MODIFIED_IMGS.push({
                    img : this,
                    src : src
                });
                var newSrc = img(sector.imgName);

                if (prescanned && sector.type === "") {
                    // black out images
                    newSrc = img("u.gif");
                }
                ths.attr("src", newSrc);
                var production = "";
                $.each(sector.production, function (idx, value) {
                    production += value.ress + ": " + value.rate.toString() + "\n";
                });
                ths.attr("title", "X:" + sector.x + " Y:" + sector.y + " " + sector.type + "\n" +
                    sector.attacker.toString() +
                    "%, " + sector.defender.toString() +
                    "%, " + sector.guard + "%".toString() + "\n\n" +
                    production);
            }
        }
    });
}

//hides sector images
function hideMap() {
    if (!MODIFIED_IMGS) {
        return;
    }
    var noneImg = img("u.gif");
    log("Hiding..." + MODIFIED_IMGS.length);
    $.each(MODIFIED_IMGS, function (idx, value) {
        $(value.img).attr("src", value.src);
    });
}

//==== Local Orion Library Functions ====


//Polly connection
//Posts the provided object to the provided url serializing it into json format
function postJson(api, obj, onSuccess) {
    checkCredentials();
    obj["user"] = getPollyUserName();
    obj["pw"] = getPollyPw();
    obj["version"] = VERSION;
    //obj["api"] = API_VERSION;
    post(api, JSON.stringify(obj), onSuccess);
}
//Posts the provided params like a serialized form
function postForm(api, params, onSuccess) {
    checkCredentials();
    params["user"] = getPollyUserName();
    params["pw"] = getPollyPw();
    params["version"] = VERSION;
    var data = makeQueryPart(params);
    post(api, data, onSuccess);
}

function post(api, body, onSuccess) {
    var request = {
        url : POLLY_URL + api,
        data : body,
        timeout : DEFAULT_REQUEST_TIMEOUT,
        onerror : function () {
            log("Fehler beim Senden");
        },
        onload : function (result) {
            log("Daten an polly gesendet");
            if (onSuccess) {
                try {
                    var json = JSON.parse(result.responseText);
                    onSuccess(json);
                } catch (ignore) {
                    log("error while processing server response");
                }
            }
        }
    };
    GM_xmlhttpRequest(request);
}
//Performs a simple GET request and parses the result as JSON passing it to the
//provided function
function requestJson(api, params, onSuccess) {
    requestJsonX(POLLY_URL, api, params, onSuccess);
}

function requestJsonX(base, api, params, onSuccess) {
    var requestUrl = makeApiUrlX(base, api, true, params);
    GM_xmlhttpRequest({
        url : requestUrl,
        timeout : DEFAULT_REQUEST_TIMEOUT,
        method : "GET",
        onload : function (response) {
            if (!onSuccess) {
                return;
            }
            try {
                var json = JSON.parse(response.responseText);
                if (typeof json.serverAlert != "undefined") {
                    alert(json.serverAlert);
                }
                onSuccess(json);
            } catch (e) {
                log("error while processing server response");
            }
        }
    });
}


//Requests a json object from the provided url and passes it to the onSuccess
//function if the request was successful. Additionally, the result will be
//stored locally using the provided key. The next call to this method using the
//same key will return the cached object
function requestCachedJson(api, params, cacheKey, onSuccess) {
    var cached = GM_getValue(cacheKey, null);
    if (cached !== null) {
        var obj = JSON.parse(cached);
        log("Reconstructed object from cache (" + cacheKey + ")");
        onSuccess(obj);
        return;
    }
    requestJson(api, params, function (result) {
        // cache the result
        GM_setValue(cacheKey, JSON.stringify(result));
        // delegate to provided success handler
        onSuccess(result);
    });
}

//Requests a json object from the provided url and passes it to the onSuccess
//function if the request was successful. The result will be cached using
//the specified cacheKey
function forceRequestCachedJson(api, params, cacheKey, onSuccess) {
    GM_deleteValue(cacheKey);
    requestCachedJson(api, params, cacheKey, onSuccess);
}

function makeApiUrlX(base, api, needLogin, params) {
    var url = base + api;
    if (needLogin) {
        checkCredentials();
        params["user"] = getPollyUserName();
        params["pw"] = getPollyPw();
    }
    params["version"] = VERSION;
    var query = makeQueryPart(params);
    return url += "?" + query;
}

function makeApiUrl(api, needLogin, params) {
    return makeApiUrlX(POLLY_URL, api, needLogin, params);
}

function makeQueryPart(params) {
    var qry = "";
    var i = 0;
    var length = Object.keys(params).length - 1;
    $.each(params, function (key, value) {
        var appendAmp = i++ != length;
        qry += key
        qry += "=";
        qry += encodeURI(value);
        if (appendAmp) {
            qry += "&"
        }
    });
    return qry;
}

//==== ORION SCRIPT USER SETTINGS ====

//Notifies all registered listeners about a changed orion setting
function firePropertyChanged(source, property, oldVal, newVal) {
    for (var i = 0; i < PROPERTY_CHANGE_LISTENERS.length; ++i) {
        try {
            PROPERTY_CHANGE_LISTENERS[i].call(source, property, oldVal, newVal);
        } catch (ignore) {}
    }
}

//Adds a listener which is to be notified when any orion setting is changed.
//Listener must be a function with signature: property, oldVal, newVal
function addPropertyChangeListener(listener) {
    PROPERTY_CHANGE_LISTENERS.push(listener);
}

//Getters and setters for various orion settings
//Sets a generic property and fires corresponding change event
function setProperty(property, newVal, source) {
    var oldVal = GM_getValue(property, false);
    if (oldVal != newVal) {
        GM_setValue(property, newVal);
        firePropertyChanged(source, property, oldVal, newVal);
    }
}

//Determines whether to unveil the current quadrant
function getUnveilQuadrant() {
    return GM_getValue(PROPERTY_AUTO_UNVEIL, "false");
}

//Gets the name of the selected own fleet
function getSelectedFleet() {
    return GM_getValue(PROPERTY_SELECTED_FLEET, "");
}
//Gets the revorix id of the selected own fleet
function getSelectedFleetId() {
    return GM_getValue(PROPERTY_SELECTED_FLEET_ID, -1);
}

//Gets whether orion is currently activated
function getOrionActivated() {
    return GM_getValue(PROPERTY_ORION_ON, false);
}

//Whether sector data is cached locally instead of always reloaded from the server
function getUseLocalCache() {
    return GM_getValue(PROPERTY_LOCAL_CACHE, true);
}

//Whether to post own fleet information back to polly
function getPostOwnFleetInfos() {
    return GM_getValue(PROPERTY_POST_OWN_FLEET_INFOS, false);
}

//Whether to post sector information back to polly
function getPostSectorInfos() {
    return GM_getValue(PROPERTY_POST_SECTOR_INFOS, false);
}

//Whether to enable showing sky news during flight
function getEnableQuadSkyNews() {
    return GM_getValue(PROPERTY_ENABLE_QUAD_SKY_NEWS, false);
}

//Whether to enable sky news in revorix news page
function getEnableSkyNews() {
    return GM_getValue(PROPERTY_ENABLE_SKY_NEWS, false);
}

//Gets the currently logged in venad name
function getSelf() {
    return GM_getValue(PROPERTY_ORION_SELF, "");
}

//Whether to fill in the login code shared by others
function getAutoFillInCode() {
    return GM_getValue(PROPERTY_FILL_IN_CODE, false);
}

//gets the maximum number of news entries to display
function getMaxNewsEntries() {
    return GM_getValue(PROPERTY_MAX_NEWS_ENTRIES, 20);
}

//subscribes to the provided news type
function subscribe(newsType) {
    var current = JSON.parse(GM_getValue(PROPERTY_NEWS_SUBSCRIPTION, "{}"));
    current[newsType] = true;
    GM_setValue(PROPERTY_NEWS_SUBSCRIPTION, JSON.stringify(current));
}
//unsubscribes for the provided news type
function unsubscribe(newsType) {
    var current = JSON.parse(GM_getValue(PROPERTY_NEWS_SUBSCRIPTION, "{}"));
    current[newsType] = false;
    GM_setValue(PROPERTY_NEWS_SUBSCRIPTION, JSON.stringify(current));
}
//whether user subscribed for the provided news type
function isSubscribbed(newsType) {
    var str = GM_getValue(PROPERTY_NEWS_SUBSCRIPTION, "");
    if (str === "") {
        return true;
    }
    var current = JSON.parse(str);
    return current[newsType];
}
//Checks whether you have your polly credentials set and shows a warning
//if not
function checkCredentials() {
    var showWarning = GM_getValue(PROPERTY_CREDENTIAL_WARNING, true);
    if (showWarning) {
        var warning = "";
        if (getPollyUserName() === "" || getPollyPw() === "") {
            alert(MSG_NO_CREDENTIAL_WARNING);
            GM_setValue(PROPERTY_CREDENTIAL_WARNING, false);
        }
    }
}
//Gets the polly user name for logging in
function getPollyUserName() {
    return GM_getValue(PROPERTY_LOGIN_NAME, "");
}
//Gets the polly password for logging in
function getPollyPw() {
    return GM_getValue(PROPERTY_LOGIN_PASSWORD, "");
}
//Gets the clan tag
function getClanTag() {
    return GM_getValue(PROPERTY_CLAN_TAG, CLAN_TAG);
}

//Whether to send scoreboard to polly
function getSendScoreboard() {
    return GM_getValue(PROPERTY_SEND_SCOREBOARD, true);
}

//Whether to display changes of scoreboard since last submit
function getShowScoreboardChanges() {
    return GM_getValue(PROPERTY_SHOW_SCOREBOARD_CHANGE, true);
}

//Whether orion controls should be hidden
function getOrionHidden() {
    return GM_getValue(PROPERTY_ORION_HIDDEN, false);
}

//gets the revorix login name
function getRxLoginName() {
    return GM_getValue(PROPERTY_ORION_RX_LOGIN, "");
}

//gets the selected sector size
function getSectorSize() {
    return GM_getValue(PROPERTY_SECTOR_SIZE, "Default");
}
// gets the maximum number of chat entries to display
function getMaxChatEntries() {
    return Math.min(GM_getValue(PROPERTY_CHAT_ENTRIES, 15), 100);
}
// returns the orion chat refresh interval in ms
function getChatRefreshInterval() {
    return 20000; // 20 seconds
}
// Whether chat is enabled
function getChatEnabled() {
    return GM_getValue(PROPERTY_ENABLE_CHAT, true);
}

// Whether to automatically login as soon as the correct code has been entered
// on main page
function getAutoLoginMainEnabled() {
    return GM_getValue(PROPERTY_AUTO_LOGIN_MAIN_PAGE, false);
}
function setAutoLoginMainEnabled(enabled) {
    GM_setValue(PROPERTY_AUTO_LOGIN_MAIN_PAGE, enabled);
}
// on server login page
function getAutoLoginServerEnabled() {
    return GM_getValue(PROPERTY_AUTO_LOGIN, false);
}
function setAutoLoginServerEnabled(enabled) {
    GM_setValue(PROPERTY_AUTO_LOGIN, enabled);
}

// Clanwache Password
function getCwPassword() {
    return GM_getValue(PROPERTY_CW_PASSWORD, "");
}
function setCwPassword(password) {
    GM_setValue(PROPERTY_CW_PASSWORD, password);
}

// Auto enter Clanwache
function getCwAutoEnter() {
    return GM_getValue(PROPERTY_CW_AUTO_ENTER, false);
}
function setCwAutoEnter(autoEnter) {
    GM_setValue(PROPERTY_CW_AUTO_ENTER, autoEnter);
}

// disable login button until correct code is inserted
function getLoginButtonDisabled() {
    return GM_getValue(PROPERTY_DISABLE_LOGIN_BUTTON, false);
}
function setLoginButtonDisabled(disabled) {
    GM_setValue(PROPERTY_DISABLE_LOGIN_BUTTON, disabled);
}

// get last visited sector
function setLastSector(sector) {
    GM_setValue(PROPERTY_LAST_SECTOR_JSON, JSON.stringify(sector));
}
function getLastSector() {
    return JSON.parse(GM_getValue(PROPERTY_LAST_SECTOR_JSON));
}

function setAutoSlurp(autoSlurp) {
    return GM_setValue(PROPERTY_AUTO_SLURP, autoSlurp);
}
function isAutoSlurp() {
    return GM_getValue(PROPERTY_AUTO_SLURP, false);
}

function isBackToMap() {
    return GM_getValue(PROPERTY_BACK_TO_MAP, false);
}
function setBackToMap(backToMap) {
    GM_setValue(PROPERTY_BACK_TO_MAP, backToMap);
}

// set resource order as string
function setResOrder(order) {
    var arr = order.split(",");
    var i;
    for (i = 0; i < arr.length; ++i) {
        var idx = getResIndex(arr[i]);
        if (idx == undefined) {
            alert(MSG_NO_RESOURCE.format(arr[i]));
            return;
        }
    }
    GM_setValue(PROPERTY_RESOURCE_ORDER, order);
}

function getResOrderAsString() {
    return GM_getValue(PROPERTY_RESOURCE_ORDER, "iso,eg,es,rad,em,org,synt,fe,lm,sm,cr");
}

function injectResOrder() {
    var order = getResOrderAsString().split(",");
    var script = "var RESOURCES = [";
    var i;
    for (i = 0; i < order.length; ++i) {
        script += getResIndex(order[i]).toString();
        if (i != order.length - 1) {
            script += ",";
        }
    }
    script += "];";
    injectGlobal(script);
}

function getResIndex(s) {
    var map = {
        cr : 0,
        nrg : 1,
        rek : 2,
        reks : 2,
        erz : 3,
        org : 4,
        orgs : 4,
        synt : 5,
        synth : 5,
        fe : 6,
        lm : 7,
        sm : 8,
        em : 9,
        rad : 10,
        rads : 10,
        es : 11,
        eg : 12,
        egs : 12,
        iso : 13,
        isos : 13
    };
    return map[s.toLowerCase()];
}



//==== HELPER FUNCTIONS ====
//Prints a string to the console if DEBUG is true
function log(s) {
    if (DEBUG) {
        console.log(s);
    }
}
//Prints the json representation of the provided object to the console if
//DEBUG is true
function logObject(o) {
    log(JSON.stringify(o));
}
//Finds the first fleet id within the provided string. Returns -1 if no fleet
//id was found
function findFleetId(str) {
    var REGEX_FLEET_ID = /.*fid=(\d+).*/;
    if (!str) {
        return -1;
    } else if (REGEX_FLEET_ID.test(str)) {
        return parseInt(RegExp.$1, 10);
    }
    return -1;
}
//Finds all referenced fleet ids within the provided dom element
function findFleetIds(str) {
    var REGEX_FLEET_ID = /fid=(\d+)/g;
    var ids = [];
    if (!str) {
        return ids;
    } else {
        var pattern = new RegExp(REGEX_FLEET_ID);
        var match = REGEX_FLEET_ID.exec(str);
        while (match !== null) {
            ids.push(parseInt(match[1]), 10);
            match = REGEX_FLEET_ID.exec(str);
        }
    }
    return ids;
}
//strips off all html tags from the given string
function stripHtml(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function getElementByXPath(path) {
    result = document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}
//Tests whether the string str begins with the string test
function startsWith(str, test) {
    if (str.length < test.length) {
        return false;
    }
    return str.substr(0, test.length) == test;
}
//formats a sector to string
function location(sector, doQuad) {
    if (!doQuad)
        var doQuad = true;
    var result = doQuad ? sector.quadName + " " : "";
    return result + sector.x + "," + sector.y;
}
//Gives a link to a revorix sector image
function img(name) {
    var sz = getSectorSize();
    var url = IMG_URL_DEFAULT;
    if (sz == "8x8") {
        url = IMG_URL_8;
    } else if (sz == "15x15") {
        url = IMG_URL_15;
    }
    return url + name;
}
// gets the url for the resource with provided index (0-13)
function ressImg(idx) {
    var idxx = idx + 1;
    return "http://www.revorix.info/start/1/res/r" + idxx + ".gif";
}
//creates a map key for a coordinate pair
function key(x, y) {
    return x + "_" + y;
}

// select some text inside input element
// from: http://stackoverflow.com/a/3085656/2489557
function setInputSelection(input, startPos, endPos) {
    input.focus();
    if (typeof input.selectionStart != "undefined") {
        input.selectionStart = startPos;
        input.selectionEnd = endPos;
    } else if (document.selection && document.selection.createRange) {
        // IE branch
        input.select();
        var range = document.selection.createRange();
        range.collapse(true);
        range.moveEnd("character", endPos);
        range.moveStart("character", startPos);
        range.select();
    }
}

function exec(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = '(' + fn + ')();';
    document.body.appendChild(script); // run the script
    document.body.removeChild(script); // clean up
}

function injectGlobal(fn) {
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = fn.toString();
    document.body.appendChild(script); // run the script
}
