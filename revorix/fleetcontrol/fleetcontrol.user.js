// ==UserScript==
// @name        RX Flottensteuerung
// @namespace   projectpolly.de
// @version     0.1.0-alpha
// @grant       GM_getValue
// @downloadURL https://github.com/skuzzle/scriptz/raw/master/revorix/fleetcontrol/fleetcontrol.user.js
// @updateURL   https://github.com/skuzzle/scriptz/raw/master/revorix/fleetcontrol/fleetcontrol.user.js
// @require     http://code.jquery.com/jquery-1.10.2.min.js
// @include     http://www.revorix.info/*/map*
// @include     http://www.revorix.info/*/rx.php?set=4&fid=*
// @include     http://www.revorix.info/*/rx.php?set=5&fid=*
// ==/UserScript==

// Arrows
var LEFT           = 37;
var UP             = 38;
var RIGHT          = 39;
var DOWN           = 40;

// Num Block
var NUM_DOWN_LEFT  = 49;
var NUM_DOWN       = 50;
var NUM_DOWN_RIGHT = 51;
var NUM_LEFT       = 52;
var NUM_MIDDLE     = 53;
var NUM_RIGHT      = 54;
var NUM_UP_LEFT    = 55;
var NUM_UP         = 56;
var NUM_UP_RIGHT   = 57;

// Links
var MOVE_LINK      = "http://www.revorix.info/php/map.php?fid={0}&dir={1}";
var ATTACK_LINK    = "http://www.revorix.info/php/map_attack.php?fid={0}";
var CARGO_LINK     = "http://www.revorix.info/php/map_fracht.php?fid={0}";
var TARN_LINK      = "http://www.revorix.info/php/map_tarnung.php?fid={0}";
var SPLIT_LINK     = "http://www.revorix.info/php/map_fspalt.php?fid={0}";
var JOIN_LINK      = "http://www.revorix.info/php/map_ansch.php?fid={0}";
var QUAD_JUMP_LINK = "http://www.revorix.info/php/map_qspr.php?fid={0}";
var RETURN_LINK    = "http://www.revorix.info/php/map_rueck.php?fid={0}";
var FUEL_LINK      = "http://www.revorix.info/php/map_ftank.php?fid={0}";
var HAND_OVER_LINK = "http://www.revorix.info/php/map_fgive.php?fid={0}";
var GUARD_LINK     = "http://www.revorix.info/php/map_wache.php?fid={0}";

// Action mapping
var KEY_MAP = {
    a: ATTACK_LINK,
    f: CARGO_LINK,
    s: SPLIT_LINK,
    q: QUAD_JUMP_LINK,
    r: RETURN_LINK,
    t: FUEL_LINK,
    v: JOIN_LINK,
    u: HAND_OVER_LINK,
    b: GUARD_LINK
}


//Strings
//from: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

$(document).ready(main);

var FLEET_ID = "undefined";
function main() {
    var uri = document.baseURI;
    FLEET_ID = storeFleetId(uri);
    mapIntegration();
}

var FLEET_ID_REGEX = /fid=(\d+)/;
function storeFleetId(uri) {
    if (FLEET_ID_REGEX.test(uri)) {
        return RegExp.$1;
    }
    return "undefined";
}

function mapIntegration() {
    registerKeyEventHandler();
}

function registerKeyEventHandler() {
    $(document).keypress(handleKeyEvent);
}

function handleKeyEvent(event) {
    if (event.target.nodeName.toLowerCase() == "input") {
        return;
    } else if (FLEET_ID === "undefined") {
        return;
    }

    // check characters first
    var character = String.fromCharCode(event.which);
    var link = KEY_MAP[character];
    if (link != undefined) {
        //event.preventDefault();
        navigateTo(link.format(FLEET_ID));
        return;
    }
    
    // check direction
    var dir = getDir(event.which, event.keyCode);
    if (dir === "undefined") {
        return;
    }
    //event.preventDefault();
    navigateTo(MOVE_LINK.format(FLEET_ID, dir));
}

function navigateTo(url) {

    var a = document.createElement('a');
    a.href = url;
    a.target = "rxqb";
    fireClickEvent(a);
}

function fireClickEvent(element) {
    var evt = new window.MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    });

    element.dispatchEvent(evt);
}

function getDir(which, keyCode) {
    // check up arrow
    switch (keyCode) {
    case UP:    return "n";
    case LEFT:  return "w";
    case DOWN:  return "s";
    case RIGHT: return "o";
    default:
        // nothing;
    }

    // check numblock
    switch (which) {
    case NUM_DOWN_LEFT:
        return "sw";
    case NUM_DOWN:
        return "s";
    case NUM_DOWN_RIGHT:
        return "so";
    case NUM_LEFT:
        return "w";
    case NUM_MIDDLE:
        return "m";
    case NUM_RIGHT:
        return "o";
    case NUM_UP_LEFT:
        return "nw";
    case NUM_UP:
        return "n";
    case NUM_UP_RIGHT:
        return "no";
    default:
        return "undefined";
    }
}