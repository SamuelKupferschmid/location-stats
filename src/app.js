let labels = ['Home', 'Office', 'School', 'Commute'];
let namedColumns = labels.map(l => [l]);
let areaTypes = labels.reduce((acc,cur)=> { acc[cur] = 'area-spline'; return acc },{});
let overviewChart = c3.generate({
    bindto: '#overviewChart',
    data: {
        columns: namedColumns,
        types: areaTypes,
        groups: [labels]
    },
    axis: {
        x: {
            tick: {
                format: function (x) {
                    let date = new Date(data[x].date);
                    return date.getDay() + '.' + (date.getMonth()+1) + '.' + date.getFullYear() + ' ' + x;
                }
            }
        }
    },
    tooltip: {
        show: false
    },
    subchart: {
        show: true,
        onbrush: updateRange
    },
    zoom: {
        onzoomend: updateRange
    }
});

overviewChart.zoom.enable(true);


let dayTimelineChart = c3.generate({
    bindto: '#dayTimelineChart',
    data: {
        columns: namedColumns,
        types: areaTypes,
    },
    axis: {
        x: {
            tick: {
                format: function (x) {
                    return ((x / 4) + 6).toFixed() + ':' + ((x % 4) * 15).toFixed().padStart(2, '0');
                }
            }
        }
    },tooltip: {
        show: false
    }
});

var rangeRatioChart = c3.generate({
    bindto: '#rangeRatioChart',
    data: {
        columns: namedColumns,
        type: 'donut',
    },
    donut: {
        title: 'Hours / Week',
        label: {
            format: function (value, ratio, id) {
                return value + 'h';
            }
        }
    }
});


function updateRange(range) {
    dayStart = Math.floor(range[0]);

    if (dayStart < 0)
        dayStart = 0;
    dayEnd = Math.ceil(range[1]);

    if (dayEnd >= data.length)
        dayEnd = data.length - 1;

    timeslots = Array.from(new Array(4), () => new Array(60).fill(0));
    sum = new Array(4).fill(0);

    for (var i = dayStart; i <= dayEnd; i++) {
        for (var s = 0; s < 46; s++) {
            var l = data[i].timeslots[s];
            if (l >= 0 && l < 3) {
                timeslots[l][s]++;
                sum[l]++;
            }
        }
    }

    var weeks = dayEnd - dayStart;
    sum = sum.map((v) => Math.round(v / weeks));

    var columns = namedColumns.map((arr, i) => arr.concat(timeslots[i]));

    var donutColumns = namedColumns.map((arr, i) => arr.concat(sum[i]));

    dayTimelineChart.load({columns: columns});

    rangeRatioChart.load({columns:donutColumns});


}

function animate2() {
    let cursor = 0;
    let length = 4;
    let steps = 1;

    let move = () => {
        cursor += steps;
        requestAnimationFrame(move);
        goToRange(cursor, cursor + length);
    };

    move();
}

function goToRange(start, end) {
    let range = [start, end];
    overviewChart.zoom(range);
    updateRange(range)
}

let data;
$.getJSON('data.json', function (content) {
    data = content;


    let columns = labels.map(l => [l]);

    for (let i = 0; i < data.length; i++) {
        for (let c = 0; c < columns.length; c++) {
            columns[c].push(data[i].locations[c+1]);
        }
    }
    overviewChart.load({
        columns: columns
    });

    updateRange([0,99999]);
});