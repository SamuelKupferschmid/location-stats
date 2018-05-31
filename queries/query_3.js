db.daily_stats.insert(db.timeslots.aggregate([
    {
        "$group": {
            _id: { week: "$_id.week", day: "$_id.day"},
            timeslots: {
                "$push": {
                    timeslot: "$_id.timeslot",
                    location: "$location"
                }
            },
            date: {"$min": "$date"}
        }
    }, {
        "$sort": {"date": 1}
    }
]).map(d => {
    let timeslots = d.timeslots;
    timeslots.sort((a, b) => a.timeslot - b.timeslot);

    d.timeslots = Array(4 * 15).fill("0");

    d.locations = new Array(5).fill(0);

    timeslots.forEach(s => {
        d.timeslots[s.timeslot] = s.location;
        d.locations[s.location]++;
    });

    //find commute times
    var lastKnownLocation = -1;
    for(var i = 0; i < d.timeslots.length;i++) {
        if(d.timeslots[i] !== "0") {
            var age = i - lastKnownLocation;

            if(age < 8) {
                for(var j = lastKnownLocation + 1; j < i;j++) {
                    d.timeslots[j] = "4";
                    d.locations[4]++;
                }
            }

            lastKnownLocation = i;
        }
    }

    return d;
}));