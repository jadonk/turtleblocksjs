define(["webL10n",
        "sugar-web/activity/shortcut",
        "sugar-web/bus",
        "sugar-web/env",
        "sugar-web/datastore",
        "sugar-web/graphics/icon",
        "sugar-web/graphics/activitypalette"], function (
    l10n, shortcut, bus, env, datastore, icon, activitypalette) {

    var datastoreObject = null;

    var activity = {};

    activity.setup = function () {
        bus.listen();

        l10n.start();

        var activityButton = document.getElementById("activity-button");

        var activityPalette = new activitypalette.ActivityPalette();

        // Colorize the activity icon.
        activity.getXOColor(function (error, colors) {
            icon.colorize(activityButton, colors);
            invokerElem =
                document.querySelector("#activity-palette .palette-invoker");
            icon.colorize(invokerElem, colors);
        });

        // Make the activity stop with the stop button.
        var stopButton = document.getElementById("stop-button");
        stopButton.addEventListener('click', function (e) {
            activity.close();
        });

        shortcut.add("Ctrl", "Q", this.close);

        datastoreObject = new datastore.DatastoreObject();

        env.getEnvironment(function (error, environment) {
            datastoreObject.setMetadata({
                "activity": environment.bundleId,
                "activity_id": environment.activityId
            });
            datastoreObject.save(function () {});
        });
    };

    activity.getDatastoreObject = function () {
        return datastoreObject;
    };

    activity.getXOColor = function (callback) {
        function onResponseReceived(error, result) {
            if (error === null) {
                callback(null, {
                    stroke: result[0][0],
                    fill: result[0][1]
                });
            } else {
                callback(null, {
                    stroke: "#00A0FF",
                    fill: "#8BFF7A"
                });
            }
        }

        bus.sendMessage("activity.get_xo_color", [], onResponseReceived);
    };

    activity.close = function (callback) {
        function onResponseReceived(error, result) {
            if (error === null) {
                callback(null);
            } else {
                console.log("activity.close called");
            }
        }

        bus.sendMessage("activity.close", [], onResponseReceived);
    };

    activity.showAlert = function (title, message, btnLabel, btnCallback) {
        if (btnLabel == null) {
            btnLabel = 'Ok';
        }

        var fragment = document.createDocumentFragment();
        var div = document.createElement('div');
        div.className = 'alert';
        div.id = 'activity-alert';
        div.innerHTML = '<p><b>' + title + '</b><br/>' + message + '</p>' +
            '<p class="button-box">' +
            '<button id="actvity-alert-btn" class="icon">' +
            '<span class="ok"></span>' +
            btnLabel + '</button></p>';
        fragment.appendChild(div);

        document.body.appendChild(fragment.cloneNode(true));

        var btn = document.getElementById("actvity-alert-btn");
        btn.addEventListener('click', function (e) {
            var alertNode = document.getElementById("activity-alert");
            if (alertNode.parentNode) {
                alertNode.parentNode.removeChild(alertNode);
            }
            if (btnCallback != null) {
                btnCallback();
            }
        });

    };

    return activity;
});
