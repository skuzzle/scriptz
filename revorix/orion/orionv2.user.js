// ==UserScript==
// @name        Polly Orion V2
// @version     2.0.0
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
    [ CURRENT ] Version 2.0.0
        - Nicht mehr unterstützte Funktionen entfernt
        - Hz Preise funktionieren wieder
        
    Version 1.13.0
        - Use SSL

    Version 1.12.0
        - CryptoJS Dependency entfernt
    Version 1.11.1 - 16.10.2015
        + Orion Webservice verbessert

    Version 1.11.0 - 10.10.2015
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
var FEATURE_RESOURCE_PRICES = true; // show prices in HZ and tooltip
var FEATURE_CARGO = true; // cargo view integration


//==== NO MANUAL MODIFICATIONS BEYOND THIS LINE ====


var DEBUG = false; // Whether debug output is shown on console
var LOCAL_SERVER = false; // use local server for testing
var VERSION = "1.6"; // Expected API version of server responses
var DEFAULT_REQUEST_TIMEOUT = 5000; // ms
var SCRIPT_EXECUTION_DELAY = 150; //ms

// Runtime available changelog
var CHANGELOG = {};
CHANGELOG["2.0.0"] = "* HZ Preise werden wieder abgerufen\n* Nicht mehr unterstützte Funktionen entfernt\n\nEvtl. muss der Browser Cache gelöscht werden, falls das Abrufen des Captchas nicht richtig funktioniert.";
CHANGELOG["1.13.0"] = "* Polly nutzt jetzt HTTPS.";
CHANGELOG["1.12.0"] = "* CryptoJS dependency entfernt.";
CHANGELOG["1.11.1"] = "* Orion Webservice verbessert.";
CHANGELOG["1.11.0"] = "* Neuer Webservice zum Captcha lösen.";
CHANGELOG["1.10.1"] = "* Auto-Slurp innerhalb des Laderaums (de)aktivierbar.\n* 'Zuück zur Karte' Funktion nach dem beladen von Schiffen.\n* Verbessertes Layout in der Frachtraum Ansicht.";
CHANGELOG["1.10.0"] = "* Button zum einfachen Einladen von Resourcen hinzugefügt.\n* Auto-Slurp: Resourcen automatisch auf Schiffe verteilen wenn der Frachtraum aufgerufen wird.";
CHANGELOG["1.9.0"]  = "* Modus zum sicheren trainieren von Schiffen hinzugefügt (Beta).\n* Erkennung der Clanwache an den neuen Flotten-Tag angepasst.";
CHANGELOG["1.8.6"]  = "* In der Karte wird ein Link zur Quadranten Heatmap angezeigt.";
CHANGELOG["1.8.5"]  = "* Changelog aller Versionen wird in den Rx Einstellungen angezeigt.\n* Opt-in für Deaktivierung des Login Buttons.";
CHANGELOG["1.8.4"]  = "* Hot-Fix: Changelog darf nur ein mal angezeigt werden.";
CHANGELOG["1.8.3"]  = "* Neue Einstellungen: Soll Login Button deaktiviert werden bis der korrekte Code eingegeben wurde?\n* Bug-Fix beim Logincode handling.\n* Benachrichtigung wenn das Script aktualisiert wurde.\n* Orion Script Version wird in den Rx Einstellungen angezeigt.";

//API URLs
var POLLY_URL = LOCAL_SERVER ? "http://localhost:8080" : "https://projectpolly.de:443";
var CAPTCHA_URL = "https://projectpolly.de/polly/rest/captcha";
var API_GET_PRICES = "/polly/rest/prices";
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
        return this.replace(/\{(\d+)\}/g, function (match, number) {
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

    if (uri.indexOf("set=3") !== -1) {
        if (FEATURE_RESOURCE_PRICES) {
            ressIntegration();
        }
    } else if (uri.indexOf("news.php") !== -1) {
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
    } else if (uri.indexOf("setup.php") !== -1) {
        settingIntegration();
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
    GM_deleteValue(PROPERTY_AUTO_UNVEIL);
    GM_deleteValue(PROPERTY_SELECTED_FLEET);
    GM_deleteValue(PROPERTY_SELECTED_FLEET_ID);
    GM_deleteValue(PROPERTY_ORION_ON);
    GM_deleteValue(PROPERTY_LOCAL_CACHE);
    GM_deleteValue(PROPERTY_POST_OWN_FLEET_INFOS);
    GM_deleteValue(PROPERTY_POST_SECTOR_INFOS);
    GM_deleteValue(PROPERTY_ENABLE_QUAD_SKY_NEWS);
    GM_deleteValue(PROPERTY_ENABLE_SKY_NEWS);
    GM_deleteValue(PROPERTY_MAX_NEWS_ENTRIES);
    GM_deleteValue(PROPERTY_LOGIN_NAME);
    GM_deleteValue(PROPERTY_LOGIN_PASSWORD);
    GM_deleteValue(PROPERTY_SEND_SCOREBOARD);
    GM_deleteValue(PROPERTY_SHOW_SCOREBOARD_CHANGE);
    GM_deleteValue(PROPERTY_ORION_HIDDEN);
    GM_deleteValue(PROPERTY_SECTOR_SIZE);
    GM_deleteValue(PROPERTY_CHAT_ENTRIES);
    GM_deleteValue(PROPERTY_LAST_SECTOR_JSON);
}

function handleUpdate() {
    var prevVersion = GM_getValue(PROPERTY_PREVIOUS_VERSION, "");
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


//==== FEATURE: SETTINGS ====
function settingIntegration() {
    var body = $('body'),
    content = "";
    content += '<br/><div id="orion" class="wrpd ce"><div class="ml"><div class="mr"><table class="wrpd full">';
    content += '<tr><td class="nfo" colspan="3">Orion Einstellungen</td></tr>';
    content += '<tr>';
    content += '<td>{0}</td><td>{1}</td>'.format(MSG_ORION_VERSION, GM_info.script.version);
    content += '<td rowspan="12" style="vertical-align:middle; text-align:center"><input tabindex="300" class="Button" type="button" id="savePolly" value="{0}"/></td>'.format(MSG_STORE_SETTINGS);
    content += '</tr>';
    content += '<tr><td>{0}</td><td><input tabindex="258" type="checkBox" id="activateAutoLoginMain" name="autoLoginMain"/><label for="autoLoginMain">{1}</label> <input tabindex="259" type="checkBox" id="activateAutoLoginServer" name="autoLoginServer"/><label for="autoLoginServer">{2}</label></td></tr>'.format(MSG_ACTIVATE_AUTO_LOGIN, MSG_AUTO_LOGIN_MAIN, MSG_AUTO_LOGIN_SERVER);
    content += '<tr><td>{0}</td><td><input tabindex="260" type="checkBox" id="disableLoginButton"/></td></tr>'.format(MSG_DISABLE_LOGIN_BUTTON);
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
    var userName = $("#pollyName").val();
    tag = $("#clantag").val();
    pw = $("#pollyPw").val();
    hash = "not needed anymore";

    GM_setValue(PROPERTY_LOGIN_NAME, userName);
    if (pw !== "") {
        GM_setValue(PROPERTY_LOGIN_PASSWORD, hash);
    }
    GM_setValue(PROPERTY_CLAN_TAG, tag);

    autoLoginMainEnabled = $("#activateAutoLoginMain").is(":checked");
    autoLoginServerEnabled = $("#activateAutoLoginServer").is(":checked");
    cwPassword = $("#cwPassword").val();
    cwAutoEnter = $("#cwAutoEnter").is(":checked");
    loginDisabled = $("#disableLoginButton").is(":checked");
    resOrder = $("#resOrder").val();
    autoSlurp = $("#autoSlurp").is(":checked");

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

//==== FEATURE: LOGIN INTEGRATION ====
var doFocusCodeField;
var loginBtn;
var isServerLogin;
function loginIntegration(serverLogin) {
    var loginBtnSelector = 'input[src="set/gfx/in5.gif"]';
        isServerLogin = serverLogin;
    if (serverLogin) {
        loginBtnSelector = 'input[src="tpl/gfx/in5.gif"]';
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

//==== FEATURE: MAP INTEGRATION ====
//Entry point of this script for revorix flight integration
function mapIntegration() {
    handleClanWache();
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

//==== Local Orion Library Functions ====


//Polly connection
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

//Gets the currently logged in venad name
function getSelf() {
    return GM_getValue(PROPERTY_ORION_SELF, "");
}

//Whether to fill in the login code shared by others
function getAutoFillInCode() {
    return GM_getValue(PROPERTY_FILL_IN_CODE, false);
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
//Gets the clan tag
function getClanTag() {
    return GM_getValue(PROPERTY_CLAN_TAG, CLAN_TAG);
}

//gets the revorix login name
function getRxLoginName() {
    return GM_getValue(PROPERTY_ORION_RX_LOGIN, "");
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
