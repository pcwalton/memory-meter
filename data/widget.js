let samples = [];
let max = 0;

on('message', function(data) {
    let sample = {
        alloc: data['malloc/allocated'],
        js: data['js/gc-heap']
    };
    samples.push(sample);
    max = Math.max(max, sample.alloc);

    let display = ((sample.alloc / 1000000) | 0);
    if (display < 1000)
        display += " MB";
    else
        display = ((display / 1000).toFixed(2)) + " GB";
    document.getElementById('number').innerHTML = display;

    let canvas = document.getElementById('c');
    let height = canvas.height, width = canvas.width;
    if (samples.length > width)
        samples.shift();

    // Redraw
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < canvas.width; i++) {
        let sample = samples[i];
        if (!sample)
            continue;

        let alloc = sample.alloc / max * 14;
        let js = sample.js / max * 14;
        ctx.fillStyle = 'rgb(68, 106, 150)';
        ctx.fillRect(i, height - alloc, 1, height);
        ctx.fillStyle = 'rgb(94, 138, 190)';
        ctx.fillRect(i, height - js, 1, js);
    }
});

function poke() {
    postMessage("");
    setTimeout(poke, 1000);
}
setTimeout(poke, 1000);

