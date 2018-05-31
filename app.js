let labels = ['Zuhause', 'Büro', 'Schule', 'Reiseweg'];
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
                    return date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear();
                }
            }
        },
        y : {
            show : false
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
        },
        y : {
            show : false
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
        title: 'Stunden / Wochen',
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

    timeslots = Array.from(new Array(5), () => new Array(60).fill(0));
    sum = new Array(5).fill(0);

    for (var i = dayStart; i <= dayEnd; i++) {
        for(var l = 0; l < 5; l++) {
            for(var s = 0; s < 60;s++) {
                var val = data[i].timeslots[l][s];
                timeslots[l][s] += val;
                sum[l] += val;
            }
        }
    }

    timeslots = timeslots.slice(1,5);
    sum = sum.slice(1,5);

    var weeks = dayEnd - dayStart;
    sum = sum.map((v) => Math.round(v / (weeks * 4)));

    var columns = namedColumns.map((arr, i) => arr.concat(timeslots[i]));

    var donutColumns = namedColumns.map((arr, i) => arr.concat(sum[i]));

    dayTimelineChart.load({columns: columns});

    rangeRatioChart.load({columns:donutColumns});


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