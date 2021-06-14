var fileName = "mempool.csv";

const csv = require('csv-parser');
var fs = require('fs');

var jsonObj = {
    "metaData":{
        "withoutParentTotalTransaction":0,
        "withoutParentTotalWeight":0,
        "withoutParentTotalFees":0,
        "withParentTotalTransaction":0,
        "withParentTotalTransaction":0,
        "withParentTotalWeight":0,
        "withParentTotalFees":0,
        "maxWeight":4000000,
        "total_tx":0
    },
    tx_id_array_withParent:[],
    tx_id_array_withoutParent:[]
};

// Open file demo.txt in read mode
fs.createReadStream(fileName)
  .pipe(csv())
  .on('data', (row) => {
    var individual_Tx_Data = {
        "tx_id":row.tx_id,
        "fee":parseInt(row.fee),
        "weight":parseInt(row.weight)
    } 

    if( !row["parents "].split(";")[0]=='' ){
        individual_Tx_Data.parents = row["parents "].split(";");
        jsonObj.tx_id_array_withParent.push(individual_Tx_Data);
        jsonObj.metaData.withParentTotalTransaction +=1;
        jsonObj.metaData.withParentTotalWeight += parseInt(row.weight);
        jsonObj.metaData.withParentTotalFees += parseInt(row.fee);
    }else{
        jsonObj.tx_id_array_withoutParent.push(individual_Tx_Data);
        jsonObj.metaData.withoutParentTotalTransaction +=1;
        jsonObj.metaData.withoutParentTotalWeight += parseInt(row.weight);
        jsonObj.metaData.withoutParentTotalFees += parseInt(row.fee);
    }

    jsonObj.metaData.total_tx +=1;
    
  })
  .on('end', () => {
    console.log('CSV file successfully processed');

    jsonObj.tx_id_array_withParent.sort( function(a,b){
        return b.fee/b.weight-a.fee/a.weight;
    });

    jsonObj.tx_id_array_withoutParent.sort( function(a,b){
        return b.weight-a.weight;
    });

    fs.writeFile("users.json", JSON.stringify(jsonObj), err => {
     
        // Checking for errors
        if (err) throw err; 
       
        console.log("Done writing"); // Success
    });

  });