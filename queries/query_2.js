DBQuery.shellBatchSize = 500;

db.timeslots.insert(
    db.preprocessed.aggregate([
        {
            "$group": {
                _id: {week: "$week", day: "$day", timeslot: "$timeslot", location: "$location"},
                date: {"$min": "$date"},
                count: {"$sum": 1}
            }
        },
        {
            "$group": {
                _id: {week: "$_id.week", day: "$_id.day", timeslot: "$_id.timeslot"},
                date: {"$min": "$date"},
                locations: {
                    "$push": {
                        location: "$_id.location",
                        count: {"$sum": "$count"}
                    }
                }
            }
        }
    ], {allowDiskUse: true}).map(d => {
        let locations = d.locations;

        locations.sort((a, b) => b.count - a.count);
        d.location = locations[0].location;
        delete d.locations;
        return d;
    }));