// ==UserScript==
// @name        RX Flottenprofile
// @version     0.4.1
// @description Verwalten von verschiedenen Flottenprofilen
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @downloadURL https://github.com/skuzzle/scriptz/raw/master/revorix/fleetprofiles/fleetprofiles.user.js
// @updateURL   https://github.com/skuzzle/scriptz/raw/master/revorix/fleetprofiles/fleetprofiles.user.js
// @namespace   projectpolly.de
// @require     http://code.jquery.com/jquery-1.10.2.min.js
// @include     /(87\.106\.151\.92|www\.revorix\.info)\S*/schiff_portal\.php/
// @include     /(87\.106\.151\.92|www\.revorix\.info)\S*/schiff_list\.php(\?(asr|cabzug|hsid|hrsid|cusid=\d+&cuzid)=\d+)?#?$/
// ==/UserScript==


/*
Changelog
Version 0.5.0 - TODO
    + Automatically select newly created profile for editing
    + Do not jump to top of page when adding ships
    + Minor beautifications

Version 0.4.1 - 07.03.2015
    + Improve rounding of selection ratio

Version 0.4 - 28.02.2015
    + Add 'Clanwache' Feature

Version 0.3 - 20.02.2015
    + Add default profile
    + Do not modify fleet name etc. when adding/removing ships (in Ship Portal)

Version 0.2 - 31.12.2014
    + Add buttons to add/remove ships to current selection
    + Remember the last edited profile
    + Fix display bug if no matching ships are available

Version 0.1 - 16.05.2014
    + GUI to add/modify and delete fleet profiles
    + Automatically chose best matching fleet profile
    + Manually chose different profile if needed
*/



// Possible types for the 'entry' field in a profile. DO NOT MODIFY THESE VALUES
var ENTRY_PORTAL     = 1;
var ENTRY_SECTOR     = 2;
var ENTRY_INDIVIDUAL = 3;
var ENTRY_CLAN       = 4;
var ENTRY_TYPES      = [
    { name : "Entrittsportale",      id : ENTRY_PORTAL },
    { name : "Sektoren",             id : ENTRY_SECTOR },
    { name : "Individuelles Portal", id : ENTRY_INDIVIDUAL },
    { name : "Clan Portal",          id : ENTRY_CLAN }
];


// Possible types for the 'quad' field in a profile when 'entry' is
// set to ENTRY_PORTAL. DO NOT MODIFY THESE VALUES
var QUAD_JERICHO_21_9        = 50675;
var QUAD_JERICHO_15_11       = 50709;
var QUAD_JERICHO_6_14        = 50752;
var QUAD_JERICHO_33_13       = 53143;
var QUAD_LYRA_MAJOR_3_6      = 36631;
var QUAD_NEW_HOPE_20_6       = 45456;
var QUAD_NEW_HOPE_19_16      = 45618;
var QUAD_NEW_HOPE_19_28      = 45786;
var QUAD_OCULUM_CORVUS_20_24 = 39797;
var ALL_QUADS = [
    { name : "Jericho 21, 9",        id : QUAD_JERICHO_21_9 },
    { name : "Jericho 15, 1",        id : QUAD_JERICHO_15_11 },
    { name : "Jericho 6, 14",        id : QUAD_JERICHO_6_14 },
    { name : "Jericho 33, 13",       id : QUAD_JERICHO_33_13 },
    { name : "Lyra Major 3, 6",      id : QUAD_LYRA_MAJOR_3_6 },
    { name : "New Hope 20, 6",       id : QUAD_NEW_HOPE_20_6 },
    { name : "New Hope 19, 16",      id : QUAD_NEW_HOPE_19_16 },
    { name : "New Hope 19, 28",      id : QUAD_NEW_HOPE_19_28 },
    { name : "Oculum Corvus 20, 24", id : QUAD_OCULUM_CORVUS_20_24 }
];

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


var MSG_NAME_NOT_VALID = "'{0}' ist kein gültiger Profilname. Erlaubte Zeichen: a-z, 0-9 und _";
var MSG_PROFILE_EXISTS = "Profil '{0}' existiert bereits";
var MSG_PROFILE_MANAGER = "Profil Manager";
var MSG_NEW_PROFILE = "Neues Profil";
var MSG_ADD = "Hinzufügen";
var MSG_ADD_SHORT = "+";
var MSG_ADDED = "Profil '{0}' hinzugefügt."
var MSG_REMOVE_SHORT = "-";
var MSG_LIST_PROFILES = "Profile:";
var MSG_PROFILE = "Profil";
var MSG_FLEET_NAME = "Flottenname:";
var MSG_FLEET_NAME_HINT = "(leer lassen um Revorix-generierten Namen zu verwenden)";
var MSG_FLEET_PW = "Passwort:";
var MSG_LEAVE_EMPTY_HINT = "(oder leer lassen)";
var MSG_FLEET_TAG = "Tag:";
var MSG_ENTRY_TYPE = "Sprungort:";
var MSG_ACTIVATE_TARN = "Sofort tarnen";
var MSG_IGNORE_PROFILE = "Profil deaktivieren";
var MSG_NO_PROFILES = "Keine Profile Eingerichtet";
var MSG_SAVE_PROFILE = "Speichern";
var MSG_REMOVE_PROFILE = "Profil löschen";
var MSG_SAVED = "Gespeichert";
var MSG_DELETED = "Profil '{0}' wurde gelöscht";
var MSG_ENABLE_PROFILES = "Profile editieren";
var MSG_ADD_TO = "Zum Profil hinzufügen";
var MSG_REMOVE_FROM = "Aus Profil entfernen";
var MSG_TITLE_TOGGLE = "Schiffe aus diesem Profil aus-/abwählen";
var MSG_TITLE_ADD = "Schiffe aus diesem Profil zur Auswahl hinzufügen";
var MSG_TITLE_REMOVE = "Schiffe aus diesem Profil der Auswahl entfernen";
var MSG_SET_DEFAULT = "Als Standard-Profil";
var MSG_REMOVE_DEFAULT = "Nicht mehr als Standard-Profil";
var MSG_TITLE_SET_DEFAULT = "Schiffe aus dem Standard-Profil werden im Portal automatisch ausgewählt";
var MSG_TITLE_REMOVE_DEFAULT = "Kein Profil wird als Standard-Profil markiert. Im Portal werden die Schiffe aus dem am besten passende Profil ausgewählt";
var MSG_CLANWACHE_PROFIL = "Clanwache-Profil (Rückführen deaktivieren)";
var MSG_ENABLE_CW_MODE = "Clanwache-Modus";

var PROPERTY_PROFILES = "polly.portal.PROFILES";
var PROPERTY_ENABLE_PROFILES = "polly.portal.ENABLE";
var PROPERTY_LAST_SELECTED = "polly.portal.LAST_SELECTED"
var PROPERTY_DEFAULT_PROFILE = "polly.portal.DEFAULT_PROFILE";
var PROPERTY_CW_MODE_ENABLED = "polly.portal.CW_MODE";

var TOGGLE = {};
var RX_FLEET_NAME = "";
var ID_REGEX = /\?sid=(\d+)/;
var DEACTIVATED_COLOR = "#626d82";



// Execute the script when the page is fully loaded
$(window).load(main);



function main() {
    var uri = document.baseURI;

    if (uri.indexOf("schiff_portal") != -1) {
        portalIntegration();
    } else if (uri.indexOf("schiff_list") != -1) {
        shipListIntegration();
    }
}



function shipListIntegration() {
    shipListGui();
}



function shipListGui() {
    var profiles = getProfiles();
    var tbl = findLastTable();
    var c = "";

    c += '<br><div id="outerprofile" class="wrp ce"><div class="tl"><div class="tr"><div class="tc"></div></div></div><div class="ml"><div class="mr">';
    c += '<table class="wrpd full profile">';
    c += '<thead>';
    c += '<tr><th colspan="2" class="nfo">{0}</th></tr>'.format(MSG_PROFILE_MANAGER);
    c += '</thead>';
    c += '<tbody>';
    c += '<tr><td>{0}</td>'.format(MSG_NEW_PROFILE);
    c += '<td><input type="text" name="nwprflnm" class="text"/> <input type="button" value="{0}" name="ddprfl" class="button"/></td>'.format(MSG_ADD);
    c += '</tr>';
    c += '<td></td>';
    c += '<td id="changeProfile">'+profileTable()+'</td>';
    c += '</tr>';
    c += '</tbody>';
    c += '</table>';
    c += '</div></div><div class="bl"><div class="br"><div class="bc"></div></div></div>';

    $(tbl).parent().parent().next().after(c);

    $('input[name="ddprfl"]').click(handleAddProfile);
    $('input[name="svprlf"]').click(handleSaveProfile);
    $('input[name="rmprlf"]').click(handleRemoveProfile);
    adjustShipTable();
}

// handles click of Add Profile button
function handleAddProfile() {
    var inp = $('input[name="nwprflnm"]')
    var name = inp.val();
    try {
        addProfile(name);
        inp.val("");
        $("#profilesTop").append('<option value="{0}">{0}</option>'.format(name));
        $("#profilesTop").val(name);
        $("#profilesTop").trigger("change");
        alert(MSG_ADDED.format(name));
    } catch (e) {
        alert(e);
        return;
    }
}

function handleSaveProfile() {
    var name = $("#profilesTop").val();
    var profile = getProfiles()[name];
    profile["name"] = $('input[name="fltnm"]').val();
    profile["password"] = $('input[name="fltpw"]').val();
    profile["tag"] = $('input[name="flttg"]').val();
    profile["tarn"] = $('input[name="chktrn"]').is(":checked");
    profile["ignore"] = $('input[name="chkgnr"]').is(":checked");
    profile["isClanwache"] = $('input[name="chkcw"]').is(":checked");
    profile["entry"] = $('select[name="ntrytyp"]').val();
    profile["quad"] = $('select[name="qdtyp"]').val();
    storeProfiles(getProfiles());
    alert(MSG_SAVED);
}

function handleRemoveProfile() {
    var name = $("#profilesTop").val();
    deleteProfile(name);
    $("#profilesTop").find('option[value="'+name+'"]').remove();
    $("#profilesTop").trigger("change");
    alert(MSG_DELETED.format(name));
}

// returns the html content string for a <select> element containing all profiles
function profilesAsOptions(profiles) {
    var cnt = "";
    $.each(profiles, function(k, v) {
        var display = isDefault(k) ? k+" (S)" : k;
        cnt += '<option value="'+k+'">'+display+'</option>';
    });
    return cnt;
}

function adjustShipTable() {
    var table = findShipTable();
    var profiles = getProfiles();

    var bfr = "";
    bfr = '<tr><td><input type="checkbox" id="enable"/><label for="enable">{1}</label> <span class="profile" style="margin-left:15px">{0} </span><select class="profile" id="profilesTop"></select> <a href="#" id="toggleDefault" style="display:none"></a><div style="float:right"><input type="checkbox" id="cwMode"/><label for="cwMode">{2}</label></div></td></th>'.format(MSG_PROFILE, MSG_ENABLE_PROFILES, MSG_ENABLE_CW_MODE);
    $('td[class="ce"]').parent().after(bfr);
    table.attr("id", "shipTable");

    $("#enable").prop("checked", getEnableProfiles());
    $("#enable").change(function() {
        var enable =  $(this).is(":checked");
        GM_setValue(PROPERTY_ENABLE_PROFILES, enable);
        if (enable) {
            $("#outerprofile").show();
            $(".profile").show();
            $("#toggleDefault").show();
            $("#profilesTop").trigger("change");
        } else {
            $("#outerprofile").hide();
            $(".profile").hide();
            $("#toggleDefault").hide();
            resetColors();
        }
    });

    // CW Mode
    $("#cwMode").prop("checked", isCwModeEnabled());
    $("#cwMode").change(function() {
        var enable =  $(this).is(":checked");
        setCwModeEnabled(enable);
        toggleCwMode(table, enable);
    });

    $("#profilesTop").html(profilesAsOptions(profiles));
    $("#profilesTop").val(getLastSelectedProfileName());
    $("#profilesTop").change(function() {
        if (!getEnableProfiles()) {
            return;
        }
        var name = $(this).val();

        if (name === null) {
            // no profiles exist
            $("#selProfile").html("{0}: {1}".format(MSG_PROFILE, "&lt;Kein&gt;"));
            $("#editProfile").hide();
            $(".addTo").hide();
            $(".removeFrom").hide();
        } else {
            $("#editProfile").show();
            setLastSelectedProfileName(name);
            var profile = getProfiles()[name];
            colorShips(profile);
            hideShowButtons(profile);
            $("#selProfile").html("{0}: {1}".format(MSG_PROFILE, name));
            showProfile(name, profile);
            toggleDefaultLink(name);
        }
    });

    var name = $("#profilesTop").val();
    var profile = getProfiles()[name];
    table.find("tr:nth-child(1) td").attr("colspan", "11");
    table.find("tr:nth-child(2)").append("<td class='profile' id='selProfile'></td>");
    table.find("tr:nth-child(n+3)").each(function() {
        var ftd = $(this).find("td:nth-child(1)").first();
        var id = idFromTd(ftd);
        $(this).append('<td class="profile" style="text-align:center"><a href="#" shipid="{1}" class="addTo" title="{3}">+++</a><a href="#" shipid="{1}" class="removeFrom" title="{4}">&minus;&minus;&minus;</a></td>'.format(MSG_ADD_SHORT, id, MSG_REMOVE_SHORT, MSG_ADD_TO, MSG_REMOVE_FROM));
    });

    $(".addTo").click(function(evt) {
        var name = $("#profilesTop").val();
        var profile = getProfiles()[name];
        var shipId = parseInt($(this).attr("shipid"), 10);

        evt.preventDefault();
        addShip(profile, shipId);
        colorShips(profile);
        hideShowButtons(profile);
    });
    $(".removeFrom").click(function(evt) {
        var name = $("#profilesTop").val();
        var profile = getProfiles()[name];
        var shipId = parseInt($(this).attr("shipid"), 10);

        evt.preventDefault();
        removeShip(profile, shipId);
        colorShips(profile);
        hideShowButtons(profile);
    });
    $("#toggleDefault").click(function(evt) {
        var name = $("#profilesTop").val();

        evt.preventDefault();
        if (isDefault(name)) {
            // Remove default profile
            setDefaultProfile("");
        } else {
            setDefaultProfile(name);
        }
        $("#profilesTop").html(profilesAsOptions(profiles));
        $("#profilesTop").val(getLastSelectedProfileName());
        toggleDefaultLink(name);
    });

    $("#profilesTop").trigger("change");
    $("#enable").trigger("change");
    $("#cwMode").trigger("change");
}

function toggleCwMode(table, enable) {
    table.find("tr:nth-child(n+3)").each(function() {
        // check 'Rückführung' column
        var rufu = $(this).find("td:nth-child(10)").first();
        var txt = rufu.text();
        if (txt !== "Rückführung") {
            // skip this row
            return true;
        }
        // get ship id
        var ftd = $(this).find("td:nth-child(1)").first();
        var id = idFromTd(ftd);
        var inProfile = isInCwProfile(id);

        if (enable && inProfile) {
            rufu.text("Rückführung");
            rufu.css( { color: DEACTIVATED_COLOR } );
        } else if (!enable && inProfile) {
            rufu.css( { color: "white" } );
            rufu.html('<a href="schiff_list.php?sid={0}">Rückführung</a>'.format(id));
        }
    });
}

function toggleDefaultLink(selectedProfile) {
    var link = $("#toggleDefault");
    if (isDefault(selectedProfile)) {
        link.attr("title", MSG_TITLE_REMOVE_DEFAULT);
        link.html(MSG_REMOVE_DEFAULT);
    } else {
        link.html(MSG_SET_DEFAULT);
        link.attr("title", MSG_TITLE_SET_DEFAULT);
    }
}

// extracts a ship id from the provided td and returns it as string
function idFromTd(ftd) {
    var a = ftd.find("a").first();
    var href = a.attr("href");
    var match = ID_REGEX.exec(href);
    var id = match[1];
    return id;
}

function resetColors() {
    var table = findShipTable();
    table.find("tr:nth-child(n+3)").each(function() {
        $(this).css( { color : "white" } );
    });
}

function colorShips(profile) {
    var table = findShipTable();
    table.find("tr:nth-child(n+3)").each(function() {
        var ftd = $(this).find("td:nth-child(1)").first();
        var ids = idFromTd(ftd);
        var id = parseInt(ids, 10);
        if ($.inArray(id, profile.ids) == -1) {
            ftd.parent().css( { color : DEACTIVATED_COLOR } );
        } else {
            ftd.parent().css( { color : "white" } );
        }
    });
}

function hideShowButtons(profile) {
    $(".addTo").each(function() {
        var id = parseInt($(this).attr("shipid"), 10);
        if ($.inArray(id, profile.ids) != -1) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
    $(".removeFrom").each(function() {
        var id = parseInt($(this).attr("shipid"), 10);
        if ($.inArray(id, profile.ids) == -1) {
            $(this).hide();
        } else {
            $(this).show();
        }
    });
}


function showProfile(name, profile) {
    var entryTypeSelect = $('select[name="ntrytyp"]');
    var quadTypeSelect = $('select[name="qdtyp"]');

    // fill select input with different entry types
    var opt = "";
    $.each(ENTRY_TYPES, function(idx) {
        var entry = ENTRY_TYPES[idx];
        opt += '<option value="'+entry.id+'">'+entry.name+'</option>';
    });
    entryTypeSelect.html(opt);
    entryTypeSelect.val(profile["entry"]);

    // change handler to show/hide the quad selector
    entryTypeSelect.change(function() {
        var val = parseInt($(this).val(), 10);
        if (val == ENTRY_PORTAL) {
            quadTypeSelect.show();
        } else {
            quadTypeSelect.hide();
        }
    });

    // fill select input with different entry portals
    var quadopt = "";
    $.each(ALL_QUADS, function(idx) {
        var quad = ALL_QUADS[idx];
        quadopt += '<option value="'+quad.id+'">'+quad.name+'</option>';
    });
    quadTypeSelect.html(quadopt);
    quadTypeSelect.val(profile["quad"]);

    var isCw = profile.isClanwache != undefined && profile.isClanwache;
    $("#profileName").html("{0}: <b>{1}</b>".format(MSG_PROFILE, name));
    $('input[name="fltnm"]').val(profile["name"]);
    $('input[name="fltpw"]').val(profile["password"]);
    $('input[name="flttg"]').val(profile["tag"]);
    $('input[name="ntrytyp"]').val(profile["entry"]);
    $('input[name="qdtyp"]').val(profile["quad"]);
    $('input[name="chktrn"]').prop("checked", profile["tarn"]);
    $('input[name="chkcw"]').prop("checked", isCw);
    $('input[name="chkgnr"]').prop("checked", profile["ignore"]);
    entryTypeSelect.trigger("change");
}


function profileTable() {
    var c = "";
    c += '<table id="editProfile" style="width:100%">';
    c += '<tr><td id="profileName" colspan="2">{0}</td></tr>';
    c += '<tr><td>{0}</td><td><input type="text" name="fltnm" class="text"/> {1}</td></tr>'.format(MSG_FLEET_NAME, MSG_FLEET_NAME_HINT);
    c += '<tr><td>{0}</td><td><input type="text" name="fltpw" class="text"/> {1}</td></tr>'.format(MSG_FLEET_PW, MSG_LEAVE_EMPTY_HINT);
    c += '<tr><td>{0}</td><td><input type="text" name="flttg" class="text"/> {1}</td></tr>'.format(MSG_FLEET_TAG, MSG_LEAVE_EMPTY_HINT);
    c += '<tr><td>{0}</td><td><select name="ntrytyp"></select> <select name="qdtyp"></select></td></tr>'.format(MSG_ENTRY_TYPE);
    c += '<tr><td></td><td><input type="checkbox" name="chktrn" id="chktrn"/> <label for="chktrn">{0}</label></td></tr>'.format(MSG_ACTIVATE_TARN);
    c += '<tr><td></td><td><input type="checkbox" name="chkcw" id="chkcw"/> <label for="chkcw">{0}</label></td></tr>'.format(MSG_CLANWACHE_PROFIL);
    c += '<tr><td></td><td><input type="checkbox" name="chkgnr" id="chkgnr"/> <label for="chkgnr">{0}</label></td></tr>'.format(MSG_IGNORE_PROFILE);
    c += '<tr><td></td><td><input type="button" name="svprlf" value="{0}" class="button"/> <input type="button" name="rmprlf" value="{1}" class="button"/></td></tr>'.format(MSG_SAVE_PROFILE, MSG_REMOVE_PROFILE);
    c += '</table>';
    return c;
}

function removeShip(profile, id) {
    var idx = $.inArray(id, profile.ids);
    if (idx == -1) {
        return;
    }
    profile.ids.splice(idx, 1);
    storeProfiles(getProfiles());
}
function addShip(profile, id) {
    if ($.inArray(id, profile.ids) != -1) {
        return;
    }
    profile.ids.push(id);
    storeProfiles(getProfiles());
}

function addProfile(name) {
    if (!isValidProfileName(name)) {
        throw MSG_NAME_NOT_VALID.format(name);
    }
    var profiles = getProfiles();
    if (profiles[name] != undefined) {
        throw MSG_PROFILE_EXISTS.format(name);
    }
    profiles[name] = {
        ids         : [],
        name        : "",
        password    : "",
        tag         : "",
        entry       : ENTRY_PORTAL,
        quad        : QUAD_NEW_HOPE_19_28,
        tarn        : true,
        isClanwache : false,
        ignore      : false
    };
    storeProfiles(profiles);
}

// deletes a whole profile
function deleteProfile(name) {
    var profiles = getProfiles();
    var deleted = profiles[name];
    delete profiles[name];
    storeProfiles(profiles);
}

function isValidProfileName(name) {
    return /[a-zA-Z0-9_]+/.test(name);
}


// store profiles to settings
function storeProfiles(profiles) {
    var str = JSON.stringify(profiles);
    GM_setValue(PROPERTY_PROFILES, str);
}
// Read profiles from settings
var profileStore;
function getProfiles() {
    if (profileStore == undefined) {
        profileStore = readProfiles();
    }
    return profileStore;
}
function readProfiles() {
    var str = GM_getValue(PROPERTY_PROFILES, "{}");
    return JSON.parse(str);
}



function portalIntegration() {
    // save rx generated fleet name
    RX_FLEET_NAME = $('input[name="fname"]').val();

    var bm = findBestMatchingProfile();

    if (enableAutoSelectProfile()) {
        selectProfile(bm.best, true, "toggle");
        TOGGLE[bm.name] = false;
    }

    portalGui(bm);
}


function portalGui(bestMatch) {
    $('table[class="full gnfo"] tr:nth-child(1) td').attr('colspan', '2');
    $('table[class="full gnfo"] tr:nth-child(2)').append('<td id="prfls"></td>');
    $('table[class="full gnfo"] tr:nth-child(3) td').attr('colspan', '2');
    $('table[class="full gnfo"]').attr( "class", "full wrpd" );
    var prf = "";

    $.each(getProfiles(), function (k, v) {
        if (v.ignore || v.ids.length == 0) { return true; }
        var matches = bestMatch.matches[k] == undefined ? 0 : bestMatch.matches[k];
        var ratio = roundn(matches / v.ids.length, 2);
        var display = isDefault(k) ? k+" (S)" : k;
        if (matches !== 0) {
            prf += '<a class="prfllnk" action="add" href="#" name="{0}" title="{1}">+++</a> <a class="prfllnk" action="remove" href="#" name="{0}" title="{2}">&minus;&minus;&minus;</a> '.format(k, MSG_TITLE_ADD, MSG_TITLE_REMOVE);
            prf += '<a class="prfllnk" action="toggle" href="#" name="{0}" title="{1}">'.format(k, MSG_TITLE_TOGGLE);
        }
        prf += display;
        if (matches !== 0) {
            prf += '</a>';
        }
        prf += ' (' + matches + "/"+ v.ids.length +", "+ roundn(ratio*100.0,2)+ '%)';
        if (v == bestMatch.best && bestMatch.matches[k] != undefined) {
            prf += " &lt;-";
        }
        prf += "</br>";
    });

    $("#prfls").html(prf);
    $('.prfllnk').click(profileClick);
}

// loads a profile if its link was clicked
function profileClick(evt) {
    var name = $(this).attr("name");
    var action = $(this).attr("action");
    var check = TOGGLE[name] == undefined ? true : TOGGLE[name];

    evt.preventDefault();
    $.each(getProfiles(), function (k, v) {
        if (v.ignore) { return true; }
        TOGGLE[k] = true;
    });
    TOGGLE[name] = !check;
    selectProfileByName(name, check, action);
}



function findBestMatchingProfile() {
    var ships = $('input[name="fships[]"]');
    var matches = {};
    var ret = {
        best : null,
        name : null,
        matches : {}
    };

    // Count occurrence of ships
    ships.each(function() {
        var id = $(this).val();
        $.each(getProfiles(), function (k, v) {
            if (v.ignore) { return true; }

            if (ret.matches[k] == undefined) {
                ret.matches[k] = 0;
            }
            $.each(v.ids, function (idx) {
                if (v.ids[idx] == id) {
                    ret.matches[k] += 1;
                }
            });
        });
    });

    // select profile with best matches to ship count ratio (or default profile)

    $.each(getProfiles(), function (k, v) {
        // XXX: ignores default profile too!
        if (v.ignore) { return true; }

        if (ret.best === null) {
            ret.best = v;
            ret.name = k;
        }

        var cRatio = calcRatio(k, v, ret.matches[k]);
        var bRatio = calcRatio(ret.name, ret.best, ret.matches[ret.name]);

        if (cRatio >= bRatio) {
            ret.best = v;
            ret.name = k;
        }
    });

    return ret;
}
function calcRatio(name, profile, matches) {
    if (isDefault(name)) {
        return 2.0;
    } else {
        return matches / profile.ids.length;
    }
}

// select ships from the provided profile
function selectProfile(profile, check, action) {
    // select ships in this profile
    var ships = $('input[name="fships[]"]');
    ships.each(function() {
        var id = parseInt($(this).val(), 10);
        var isInProfile = $.inArray(id, profile.ids) != -1;
        if (action == "toggle") {
            this.checked = check && isInProfile;
        } else if (action == "add") {
            this.checked = isInProfile ? true : this.checked;
        } else if (action == "remove") {
            this.checked = isInProfile ? false : this.checked;
        }
    });

    // trigger recalculation of admiralität
    ships.first().trigger("click");
    ships.first().trigger("click");

    if (action !== "toggle") {
        // do not modify fleet settings if ships are added/removed
        return;
    }

    // set fleet name if specified in profile
    if (check && profile["name"] != undefined && profile["name"] != "") {
        $('input[name="fname"]').val(profile["name"]);
    } else {
        // set name to the rx generated one
        $('input[name="fname"]').val(RX_FLEET_NAME);
    }

    // set fleet tag if specified
    if (check && profile["tag"] != undefined) {
        $('input[name="ftg"]').val(profile["tag"]);
    } else {
        // reset tag if none was specified
        $('input[name="ftg"]').val("");
    }

    // set fleet pw if specified
    if (check && profile["password"] != undefined) {
        $('input[name="anschluss"]').val(profile["password"]);
    } else {
        $('input[name="anschluss"]').val("");
    }

    // set entry point
    if (profile["entry"] != undefined) {
        var e = profile["entry"];
        $('input[name="sptr"][value="'+e+'"]').prop("checked", true);

        var sl = $('select[name="fport"]');
        sl.prop("disabled", e != ENTRY_PORTAL);
        if (e == ENTRY_PORTAL) {
            var quad = profile["quad"];
            if (quad == undefined) {
                alert("Quadrant wurde nicht angegeben");
            } else {
                sl.val(quad);
            }
        }
    }

    // set tarn
    if (check && profile["tarn"] != undefined) {
        $('input[name="flstl"]').prop("checked", profile["tarn"]);
    } else {
        // default is on
        $('input[name="flstl"]').prop("checked", true);
    }
}

// Checks whether given id occurs in a 'Clanwache' profile
function isInCwProfile(id) {
    var result = false;
    $.each(getProfiles(), function(name, profile) {
        if (profile.isClanwache && containsShip(profile, id)) {
            result = true;
            return false; // abort loop
        }
    });
    return result;
}
// Checks whether the given profile contains a ship with given id
function containsShip(profile, id) {
    if (typeof id == "string") {
        id = parseInt(id, 10);
    }
    for (i = 0; i < profile.ids.length; ++i) {
        var shipId = profile.ids[i];
        if (shipId === id) {
            return true;
        }
    }
    return false;
}
// Whether the given name is the default profile
function isDefault(profileName) {
    return profileName === getDefaultProfileName();
}
// Gets thedefault profile name or "" if none is set
function getDefaultProfileName() {
    return GM_getValue(PROPERTY_DEFAULT_PROFILE, "");
}
// Sets the default profile name
function setDefaultProfile(profileName) {
    GM_setValue(PROPERTY_DEFAULT_PROFILE, profileName);
}
// Name of the last edited profile if any
function getLastSelectedProfileName() {
    return GM_getValue(PROPERTY_LAST_SELECTED, "");
}
// Sets the name of the last edited profile
function setLastSelectedProfileName(name) {
    GM_setValue(PROPERTY_LAST_SELECTED, name);
}
// Whether profile manager is activated in ship overview
function getEnableProfiles() {
    return GM_getValue(PROPERTY_ENABLE_PROFILES, true);
}
// select ships from a profile by name
function selectProfileByName(name, check, action) {
    var profile = getProfiles()[name];
    selectProfile(profile, check, action);
}
// whether to initially select best matching profile
function enableAutoSelectProfile() {
    return true;
}
// Whether  clanwache mode is activated
function isCwModeEnabled() {
    return GM_getValue(PROPERTY_CW_MODE_ENABLED, true);
}
function setCwModeEnabled(enabled) {
    GM_setValue(PROPERTY_CW_MODE_ENABLED, enabled);
}
// rounds a number to the specified amount of digits
function roundn(num, dig) {
    var p = Math.pow(10, dig);
    return Math.round(num * p) / p;
}

//Finds the last wrpd full table on the current page
function findLastTable() {
    var tables = $('table[class="wrpd full"]');
    if (tables.length > 0) {
        return tables[tables.length - 1];
    }
    return null;
}
// finds the table which displays the ships
function findShipTable() {
    var tables = $('table[class="wrpd full"]');
    var result = tables.first();
    tables.each(function() {
        var td = $(this).find('.nfo');
        if (td.length != 0) {
            result = $(this);
            return false;
        }
        return true;
    });
    return result;
}
