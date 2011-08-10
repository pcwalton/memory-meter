/*
 *  memory-meter/data/widget.js
 *
 *  Copyright (c) 2011 Mozilla Foundation
 *  Patrick Walton <pcwalton@mimiga.net>
 */

const GC_BAR_HEIGHT = 2;

let samples = [];
let max = 0;
let gcOccurred = false;

function redraw() {
    let canvas = document.getElementById('c');
    let height = canvas.height, width = canvas.width;
    if (samples.length > width)
        samples.shift();

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    let gcSize = 0;

    let graphHeight = height - GC_BAR_HEIGHT - 1;

    for (let i = 0; i < width; i++) {
        let sample = samples[i];
        if (!sample)
            continue;

        let alloc = sample.alloc / max * graphHeight;
        let js = sample.js / max * graphHeight;

        ctx.fillStyle = 'rgb(68, 106, 150)';
        ctx.fillRect(i, height - alloc, 1, alloc);
        ctx.fillStyle = 'rgb(94, 138, 190)';
        ctx.fillRect(i, height - js, 1, js);

        if (sample.gc)
            gcSize = GC_BAR_HEIGHT;

        if (gcSize > 0) {
            ctx.fillStyle = "rgb(144, 94, 190)";
            ctx.fillRect(i, 0, 1, gcSize);
            gcSize--;
        }
    }
}

on('message', function(data) {
    if (!document)
        return;

    if (typeof(data) === 'string') {
        gcOccurred = true;
        return;
    }

    let sample = {
        alloc: data['heap-used'] || data['malloc/allocated'] || data['resident'],
        js: data['explicit/js/gc-heap'] || data['js/gc-heap'] || data['js-gc-heap'],
        gc: gcOccurred
    };
    samples.push(sample);
    max = Math.max(max, sample.alloc);
    gcOccurred = false;

    let display = ((sample.alloc / 1000000) | 0);
    if (display < 1000)
        display += " MB";
    else
        display = ((display / 1000).toFixed(2)) + " GB";
    document.getElementById('number').innerHTML = display;

    let width = document.getElementById('c').width;
    if (samples.length > width)
        samples.shift();

    // Redraw
    redraw();
});

