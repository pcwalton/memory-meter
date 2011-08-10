/*
 *  memory-meter/lib/main.js
 *
 *  Copyright (c) 2011 Mozilla Foundation
 *  Patrick Walton <pcwalton@mimiga.net>
 */

const widget = require('widget');
const tabs = require('tabs');
const data = require('self').data;
const { Cc, Ci, Cu } = require('chrome');

const MEMORY_PATHS = {
    // Fx4 ?
    'heap-used': true, 'explicit/js/gc-heap': true,
    // Fx5
    'malloc/allocated': true, 'js/gc-heap': true,
    // Fx>=5
    'resident': true, 'js-gc-heap': true
};

Cu.import("resource://gre/modules/Services.jsm", this);

let w = widget.Widget({
  label: "Memory usage",
  contentURL: data.url("widget.html"),
  contentScriptFile: data.url("widget.js"),
  width: 126,
  id: 'memory-meter',
  onClick: function() { tabs.open("about:memory"); },
});

let memoryReporterManager = Cc["@mozilla.org/memory-reporter-manager;1"].
    getService(Ci.nsIMemoryReporterManager);

let widgetUpdater = {
    // Called when the timer goes off.
    notify: function() {
        let data = {};
        let iter = memoryReporterManager.enumerateReporters();
        while (iter.hasMoreElements()) {
            let reporter = iter.getNext().QueryInterface(Ci.nsIMemoryReporter);
            if (MEMORY_PATHS[reporter.path])
                data[reporter.path] = reporter.memoryUsed || reporter.amount;
        }

        w.postMessage(data);
    },

    // Called when we get a console message.
    observe: function(msg) {
        if (/^(?:CC|GC) timestamp:/.test(msg.message))
            w.postMessage('gc');
    }
};

function main() {
    let branch = Services.prefs.getBranch(null);
    branch.setBoolPref('javascript.options.mem.log', true);

    Services.console.registerListener(widgetUpdater);

    this.timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    this.timer.initWithCallback(widgetUpdater, 1000,
        Ci.nsITimer.TYPE_REPEATING_SLACK);
}

main();

