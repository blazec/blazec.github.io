import json
import csv

DISTRICT = 2
PARTY = 4
VOTE_PERCENTAGE = 8
WINNER = 11
PARTIES = ("NDP", "Liberal", "Conservative", "Bloc Quebecois", "Green")

json_file = open("electoral_districts.json")
districts = json.load(json_file)


## Parse csv file containing individual results
csv_file = "output.csv"

with open(csv_file, newline='') as csv_input:
    csv_reader = csv.reader(csv_input, skipinitialspace=True)
    row = next(csv_reader)

    ## Make a dictionary that maps FEDNUM to ({Party: percent}, winning_party))
    party_percentage = {}
    district_results = {}

    district_winners = {}
    
    prev_district = 0
    
    for row in csv_reader:
        
        curr_district = int(row[DISTRICT])
        party = row[PARTY]
        vote_percentage = row[VOTE_PERCENTAGE]

        if party in PARTIES:
            # new district -> map previous district to party percentages
            if prev_district != 0 and curr_district != prev_district:
                district_results[prev_district] = party_percentage
                district_winners[prev_district] = prev_winner
                party_percentage = {}
            
            party_percentage[party] = vote_percentage

        prev_district = curr_district
        prev_winner = row[WINNER]

    ## Add the last district
    district_results[prev_district] = party_percentage
    district_winners[prev_district] = prev_winner
        

## Iterate over feature properties and add property party_percentages
## to feature with feature number FEDNUM
import operator
features = districts["features"]

districts_con = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": []}
districts_lib = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": []}
districts_ndp = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": []}
districts_green = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": []}
districts_bloc = {"type": "FeatureCollection", "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, "features": []}


for feature in features:
    fednum = feature["properties"]["FEDNUM"]
    
    if fednum in district_results:
        feature["properties"]["ELECTION_RESULTS"] = district_results[fednum]
        winner = district_winners[fednum]#max(district_results[fednum].items(), key=operator.itemgetter(1))[0]
        
        feature["properties"]["WINNER"] = winner

        if winner == "Green":
            feature["properties"]["fill"] = "#31a354"
            districts_green["features"].append(feature)
        elif winner == "NDP":
            feature["properties"]["fill"] = "#feb24c"
            districts_ndp["features"].append(feature)
        elif winner == "Liberal":
            feature["properties"]["fill"] = "#de2d26"
            districts_lib["features"].append(feature)
        elif winner == "Conservative":
            feature["properties"]["fill"] = "#2c7fb8"
            districts_con["features"].append(feature)
        elif winner == "Bloc": 
            feature["properties"]["fill"] = "#a6bddb"
            districts_bloc["features"].append(feature)

        
with open('districtResults.geojson', 'w') as out:
    json.dump(districts, out)
    
with open('resultsGreen.geojson', 'w') as out:
    json.dump(districts_green, out)

with open('resultsLiberal.geojson', 'w') as out:
    json.dump(districts_lib, out)

with open('resultsConservative.geojson', 'w') as out:
    json.dump(districts_con, out)

with open('resultsNDP.geojson', 'w') as out:
    json.dump(districts_ndp, out)

with open('resultsBloc.geojson', 'w') as out:
    json.dump(districts_bloc, out)

