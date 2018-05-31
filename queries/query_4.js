JSON.stringify(
    db.daily_stats.aggregate([
        {
            "$group": {
                _id: "$_id.week",
                timeslots: {
                    "$push": "$timeslots"
                },
                date: {"$min": "$date"}
            }
        }, {
            "$sort": {"date": 1}
        }
    ]).map(d => {
        var slotSize = 4 * 15;
        var timeslots = Array.from(new Array(5)).map(_ => new Array(slotSize).fill(0));

        d.locations = new Array(5).fill(0);

        for(var i = 0; i < d.timeslots.length;i++) {
            for(var s = 0; s < slotSize;s++){
                var location = d.timeslots[i][s];
                timeslots[location][s]++;
                d.locations[location]++;
            }
        }

        d.timeslots = timeslots;

        return d;
    }));