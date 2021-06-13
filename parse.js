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
        "withParentTotalFees":0
    }
};

// Open file demo.txt in read mode
fs.createReadStream(fileName)
  .pipe(csv())
  .on('data', (row) => {
    jsonObj[row.tx_id]={
        "fee":parseInt(row.fee),
        "wight":(row.weight),
        "parents":[]
    };

   
    if( !row["parents "].split(";")[0]=='' ){
        jsonObj[row.tx_id].parents=row["parents "].split(";");
        jsonObj.metaData.withParentTotalTransaction +=1;
        jsonObj.metaData.withParentTotalWeight += parseInt(row.weight);
        jsonObj.metaData.withParentTotalFees += parseInt(row.fee);
    }else{
        jsonObj.metaData.withoutParentTotalTransaction +=1;
        jsonObj.metaData.withoutParentTotalWeight += parseInt(row.weight);
        jsonObj.metaData.withoutParentTotalFees += parseInt(row.fee); 
    }
    
  })
  .on('end', () => {
    console.log('CSV file successfully processed');

    fs.writeFile("users.json", JSON.stringify(jsonObj), err => {
     
        // Checking for errors
        if (err) throw err; 
       
        console.log("Done writing"); // Success
    });

  });