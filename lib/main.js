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

const updateInterval = 1 * 1000;
var lastUpdated = (new Date).getTime();

let w = widget.Widget({
  label: "Memory usage",
  contentURL: data.url("widget.html"),
  contentScriptFile: data.url("widget.js"),
  width: 126,
  onClick: function() { tabs.open("about:memory"); },
  onMessage: function() {
    if((new Date).getTime() - lastUpdated > updateInterval) {
      lastUpdated = (new Date).getTime();
      let manager = Cc["@mozilla.org/memory-reporter-manager;1"].
          getService(Ci.nsIMemoryReporterManager);
  
      let data = {};
      let iter = manager.enumerateReporters();
      while (iter.hasMoreElements()) {
          let reporter = iter.getNext().QueryInterface(Ci.nsIMemoryReporter);
          data[reporter.path] = reporter.memoryUsed;
      }
  
      w.postMessage(data);
    }
  }
});

