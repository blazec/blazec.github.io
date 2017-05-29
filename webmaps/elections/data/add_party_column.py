import csv

CANDIDATE_NAME = 3
MAJORITY = 8
input_file = "voting_results_by_party.csv"
output_file = "output.csv"

with open(input_file, newline='') as csv_input:
    with open(output_file, 'w') as csv_output:
        csv_reader = csv.reader(csv_input, skipinitialspace=True)
        csv_writer = csv.writer(csv_output, lineterminator='\n')
        
        row = next(csv_reader)
        row.insert(CANDIDATE_NAME + 1, "Party")
        row.append("Winner")
        csv_writer.writerow(row)
        
        for row in csv_reader:
            candidate = row[CANDIDATE_NAME]

            # Set party name
            if "NDP-New Democratic Party" in candidate:
                party = "NDP"
            elif "Liberal" in candidate:
                party = "Liberal"
            elif "Conservative" in candidate:
                party = "Conservative"
            elif "Bloc Qu" in candidate:
                party = "Bloc"
            elif "Green Party" in candidate:
                party = "Green"
            else:
                party = ""

            if row[MAJORITY].isdigit():
                winner = party
                
            row.insert(CANDIDATE_NAME + 1, party)
            row.append(winner)
            csv_writer.writerow(row)
        
        
        
