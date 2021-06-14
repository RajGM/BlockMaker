const data = require("./users.json");

//dp test
// var testArr1 = [];
// var testArr2 = [];
// for(var i=0;i<data.metaData.maxWeight;i++){
//     testArr1.push(0);
//     testArr2.push(0);
// }
//test ends here

//test allCombined
// data.newArray = [];
// data.newArray = data.tx_id_array_withoutParent.concat(data.tx_id_array_withParent);
// data.newArray.sort(function (a, b) {
//     return b.fee / b.weight - a.fee / a.weight;
// });
//test ends here

let tx_id_Map_withoutParent = new Map();
for (var i = 0; i < data.tx_id_array_withoutParent.length; i++) {
    var currentTx_id = data.tx_id_array_withoutParent[i];
    tx_id_Map_withoutParent.set(currentTx_id.tx_id, { "fee": currentTx_id.fee, "weight": currentTx_id.fee, "isCompleted": false, "parents": currentTx_id.parents });
}

let tx_id_Map_withParent = new Map();
for (var i = 0; i < data.tx_id_array_withParent.length; i++) {
    var currentTx_id = data.tx_id_array_withParent[i];
    tx_id_Map_withParent.set(currentTx_id.tx_id, { "fee": currentTx_id.fee, "weight": currentTx_id.fee, "isCompleted": false, "parents": currentTx_id.parents });
}

var currentWeight = 0;
var currentValue = 0;

console.log("Max Weight:" + data.metaData.maxWeight);

let tx_id_Map = new Map();

for (var i = 0; i < data.tx_id_array_withoutParent.length; i++) {

    if (data.tx_id_array_withoutParent[i].weight + currentWeight < data.metaData.maxWeight) {

        tx_id_Map.set(data.tx_id_array_withoutParent[i].tx_id, 'true');
        tx_id_Map_withoutParent.set(data.tx_id_array_withoutParent[i].tx_id[1].isCompleted,'true');
        currentValue += data.tx_id_array_withoutParent[i].fee;
        currentWeight += data.tx_id_array_withoutParent[i].weight;

    } else {
        break;
    }

}

label1:while (true) {

    const iterator1 = tx_id_Map_withParent[Symbol.iterator]();

    for (const item of iterator1) {

        if (item[1].weight + currentWeight <= data.metaData.maxWeight) {
            
            if(check_allParents_tx_status(item[1].parents)){
                tx_id_Map.set(item[0],'true');
                currentValue = item[1].fee;
                currentWeight = item[1].weight;
            }else{
                //add all parents as well
                

            }

        } else {
            console.log("PARENT BREAK");
            break label1;
        }


    }

}


console.log("TotalWeight:" + currentWeight);
console.log("TotalFee:" + currentValue);

function check_allParents_tx_status(parentArrList) {

    var parentValue = {
        fee:0,
        weight:0
    }

    for (var i = 0; i < parentArrList.length; i++) {
        if (!tx_id_Map.has(parentArrList[i])) {
            //if parent yes then check its parent and call recursively
            var moreParents = tx_id_Map_withParent.get(parentArrList[i])[1].parents;
            console.log("moreParents:"+moreParents);
        }
    }

    if( parentValue.fee == 0 && parentValue.weight == 0 ){
        return true;
    }else{

    }

    
}