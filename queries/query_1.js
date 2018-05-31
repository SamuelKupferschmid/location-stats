var dayLength = 60 * 60 * 24;

var homeLocations = [[43.3296011, 8.1325571]];
var schoolLocation = [43.3296011, 8.1325571];
var workLocations = [[43.3296011, 8.1325571],[43.3296011, 8.1325571]];

var tolerance = 0.005;

var distance = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
var minDistance = (positions, target) => positions.map(p => distance(p, target)).reduce((acc, cur) => acc < cur ? acc : cur, 9999);

db.preprocessed.insert(
    db.full.find({}, {
        "_id": 0,
        "latitudeE7": 1,
        "longitudeE7": 1,
        "timestampMs": 1
    })
        .sort({"timestampMs": 1})
        .map(d => {
            let ts = d.timestampMs / 1000;
            let day = Math.ceil(ts / dayLength);
            return {
                "date": new Date(ts * 1000),
                "day": day.toFixed(),
                "week": Math.ceil(day / 7).toFixed(),
                "timeslot": (Math.ceil((ts % dayLength) / (3600 / 4)) - 24).toFixed(),
                "long": d.longitudeE7 * Math.pow(10, -7),
                "lat": d.latitudeE7 * Math.pow(10, -7)
            }
        }).filter(d => d.timeslot >= 0 && d.timeslot < 15 * 4)
        .map(d => {
            let distances = [
                tolerance,
                minDistance(homeLocations, [d.lat, d.long]),
                minDistance(workLocations, [d.lat, d.long]),
                distance(schoolLocation, [d.lat, d.long])
            ];

            let minValue = tolerance;
            let location = 0;

            distances.forEach((v,i)=> {
                if(v < minValue)
                    location = i;
            });

            return {
                "date": d.date,
                "day": d.day,
                "week": d.week,
                "timeslot": d.timeslot,
                "location": location.toFixed()
            }
        })
)