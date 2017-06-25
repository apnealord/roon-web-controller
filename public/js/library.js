var socket = io();
var settings = [];

$(document).ready(function() {
    showPage();
});

function showPage() {
    // Read settings from cookie
    settings.zoneID = readCookie('settings[\'zoneID\']');
    settings.displayName = readCookie('settings[\'displayName\']');

    // Set page fields to settings
    if (settings.zoneID === null) {
        $("#overlayZoneList").show();
    }

    if (settings.displayName !== null){
        $("#buttonZoneName").html(settings.displayName);
        if (settings.zoneID !== null) {
            goHome(settings.zoneID);
        }
    }

    enableSockets();
}

function enableSockets() {
    socket.on("zoneList", function(payload) {
        $("#zoneList").html("");

        if (payload !== null) {
            for (var x in payload){
                $("#zoneList").append("<button type=\"button\" class=\"buttonOverlay\" onclick=\"selectZone(\'" + payload[x].zone_id + "\', \'" + payload[x].display_name + "\')\">" + payload[x].display_name + "</button>");
            }
        }
    });
}

function selectZone(zone_id, display_name) {
    settings.zoneID = zone_id;
//     setCookie('settings[\'zoneID\']', settings.zoneID);

    settings.displayName = display_name;
//     setCookie('settings[\'displayName\']', settings.displayName);
    $("#buttonZoneName").html(settings.displayName);
    $("#overlayZoneList").hide();
}

function goBack(zone_id) {
    var data = {};
    data.zone_id = zone_id;
    data.options = {pop_levels: 1};

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/roonapi/goRefreshBrowse',
        success: function(payload) {
            showData(payload, zone_id, 1);
        }
    });
}

function goHome(zone_id) {
    var data = {};
    data.zone_id = zone_id;
    data.options = {pop_all: true};

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/roonapi/goRefreshBrowse',
        success: function(payload) {
            showData(payload, zone_id, 1);
        }
    });
}

function goRefresh(zone_id) {
    var data = {};
    data.zone_id = zone_id;
    data.options = { refresh_list: true };

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
           contentType: 'application/json',
           url: '/roonapi/goRefreshBrowse',
           success: function(payload) {
               showData(payload, zone_id, 1);
           }
    });
}

function goList(zone_id, item_key, listoffset) {
    var data = {};
    data.zone_id = zone_id;
    data.options = {item_key: item_key};

    if (listoffset === undefined) {
        data.listoffset = 0;
    } else {
        data.listoffset = listoffset;
    }

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: '/roonapi/goRefreshBrowse',
        success: function(payload) {
            showData(payload, zone_id);
        }
    });
}

function goPage(zone_id, listoffset) {
    var data = {};
    if (listoffset === undefined) {
        data.listoffset = 0;
    } else {
        data.listoffset = listoffset;
    }

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
           contentType: 'application/json',
           url: '/roonapi/goLoadBrowse',
           success: function(payload) {
               showData(payload, zone_id);
           }
    });
}

function showData( payload, zone_id ) {
    $("#items").html("");

    var items = payload.data.items;
    var list = payload.data.list;

    if ( items !== null){
        for (var x in items) {
            if (items[x].input_prompt) {
                var html = "";
                html += "<form action=\"submit\" class=\"searchGroup\">";
                html += "<input type=\"text\" class=\"searchForm\" placeholder=\"" + items[x].input_prompt.prompt + "\">";
                html += "<button type=\"submit\" class=\"itemListButton\">" + getSVG('search') + "</button>";
                $("#items").append(html)
            } else {
                $("#items").append("<button type=\"button\" class=\"itemListItem\" onclick=\"goList(\'" + zone_id + "\', \'" + items[x].item_key + "\')\">" + items[x].title + "</button>");
            }
        }

        if (list.display_offset > 0) {
            $("#buttonPrev")
                .prop("disabled", false)
                .attr("onclick", "goPage(\'" + zone_id + "\', \'" + (list.display_offset - 100) + "\')")
                .html(getSVG('prev'));
        } else {
            $("#buttonPrev")
                .prop("disabled", true)
                .html(getSVG('prev'));
        }

        if ((list.display_offset + items.length) < list.count ) {
            $("#buttonNext")
                .prop("disabled", false)
                .attr("onclick", "goPage(\'" + zone_id + "\', \'" + (list.display_offset + 100) + "\')")
                .html(getSVG('next'));
        } else {
            $("#buttonNext")
                .prop("disabled", true)
                .html(getSVG('next'));
        }

        if (list.level == 0) {
            $("#buttonBack")
                .prop("disabled", true)
                .html(getSVG('back'));
            $("#buttonHome")
                .prop("disabled", true)
                .html(getSVG('home'));
        } else {
            $("#buttonBack")
                .attr("onclick", "goBack(\'" + settings.zoneID + "\')")
                .html(getSVG('back'))
                .prop("disabled", false);
            $("#buttonHome")
                .attr("onclick", "goHome(\'" + settings.zoneID + "\')")
                .html(getSVG('home'))
                .prop("disabled", false);
        }


        $("#buttonRefresh").html(getSVG('refresh')).attr("onclick", "goRefresh(\'" + settings.zoneID + "\')");

        $("#pageNumber").html((list.display_offset + 1) + "-" + (list.display_offset + items.length) + " of " + list.count);
        $("#listTitle").html(list.title);
        $("#listSubtitle").html(list.subtitle);
        $("#listImageKey").html(list.image_key);
    }
}


function readCookie(name){
    return Cookies.get(name);
}

// function setCookie(name, value){
//     Cookies.set(name, value, { expires: 7 });
// }

function getSVG(cmd) {
    switch (cmd) {
        case "home":
            return "<svg viewBox=\"0 0 24.00 24.00\"><path d=\"M 9.99939,19.998L 9.99939,13.998L 13.9994,13.998L 13.9994,19.998L 18.9994,19.998L 18.9994,11.998L 21.9994,11.998L 11.9994,2.99805L 1.99939,11.998L 4.99939,11.998L 4.99939,19.998L 9.99939,19.998 Z \"/></svg>";
        case "back":
            return "<svg viewBox=\"0 0 24.00 24.00\"><path d=\"M 20,11L 20,13L 7.98958,13L 13.4948,18.5052L 12.0806,19.9194L 4.16116,12L 12.0806,4.08058L 13.4948,5.49479L 7.98958,11L 20,11 Z \"/></svg>";
        case "refresh":
            return "<svg viewBox=\"0 0 24.00 24.00\"><path d=\"M 17.65,6.35C 16.2,4.9 14.21,4 12,4C 7.58,4 4.01,7.58 4.01,12C 4.01,16.42 7.58,20 12,20C 15.73,20 18.84,17.45 19.73,14L 17.65,14C 16.83,16.33 14.61,18 12,18C 8.69,18 6,15.31 6,12C 6,8.69 8.69,6 12,6C 13.66,6 15.14,6.69 16.22,7.78L 13,11L 20,11L 20,4L 17.65,6.35 Z \"/></svg>";
        case "prev":
            return "<svg viewBox=\"0 0 24.00 24.00\"><path d=\"M 15.4135,16.5841L 10.8275,11.9981L 15.4135,7.41207L 13.9995,5.99807L 7.99951,11.9981L 13.9995,17.9981L 15.4135,16.5841 Z \"/></svg>";
        case "next":
            return "<svg viewBox=\"0 0 24.00 24.00\"><path d=\"M 8.58527,16.584L 13.1713,11.998L 8.58527,7.41198L 9.99927,5.99798L 15.9993,11.998L 9.99927,17.998L 8.58527,16.584 Z \"/></svg>";
        case "search":
            return "<svg viewBox=\"0 0 24.00 24.00\"><path d=\"M 9.5,3C 13.0899,3 16,5.91015 16,9.5C 16,11.1149 15.411,12.5923 14.4362,13.7291L 14.7071,14L 15.5,14L 20.5,19L 19,20.5L 14,15.5L 14,14.7071L 13.7291,14.4362C 12.5923,15.411 11.1149,16 9.5,16C 5.91015,16 3,13.0899 3,9.5C 3,5.91015 5.91015,3 9.5,3 Z M 9.5,5.00001C 7.01472,5.00001 5,7.01473 5,9.50001C 5,11.9853 7.01472,14 9.5,14C 11.9853,14 14,11.9853 14,9.50001C 14,7.01473 11.9853,5.00001 9.5,5.00001 Z \"/></svg>";
        case "music":
            return "<svg viewBox=\"0 0 24.00 24.00\"><path d=\"M 21,3L 21,15.5C 21,17.433 19.433,19 17.5,19C 15.567,19 14,17.433 14,15.5C 14,13.567 15.567,12 17.5,12C 18.0368,12 18.5454,12.1208 19,12.3368L 19,6.4698L 9,8.59536L 9,17.5C 9,19.433 7.433,21 5.5,21C 3.567,21 2,19.433 2,17.5C 2,15.567 3.567,14 5.5,14C 6.0368,14 6.54537,14.1208 7,14.3368L 7,5.97579L 21,3 Z \"/></svg>";
        default:
            break;
    }
}