var fs = require('fs');

const data = require("./users.json");

let tx_id_Map_withoutParent = new Map();
for (var i = 0; i < data.tx_id_array_withoutParent.length; i++) {
    var currentTx_id = data.tx_id_array_withoutParent[i];
    tx_id_Map_withoutParent.set(currentTx_id.tx_id, { "fee": currentTx_id.fee, "weight": currentTx_id.weight, "isCompleted": false, "parents": currentTx_id.parents });
}

let tx_id_Map_withParent = new Map();
for (var i = 0; i < data.tx_id_array_withParent.length; i++) {
    var currentTx_id = data.tx_id_array_withParent[i];
    tx_id_Map_withParent.set(currentTx_id.tx_id, { "fee": currentTx_id.fee, "weight": currentTx_id.weight, "isCompleted": false, "parents": currentTx_id.parents });
}

var printSeqID = [];

var currentWeight = 0;
var currentValue = 0;

let tx_id_Map = new Map();
var stopAll = false;

function calculateAll_withoutParnet() {
    for (var i = 0; i < data.tx_id_array_withoutParent.length; i++) {

        if (data.tx_id_array_withoutParent[i].weight + currentWeight < data.metaData.maxWeight && !tx_id_Map.has(data.tx_id_array_withoutParent[i].tx_id)) {

            tx_id_Map.set(data.tx_id_array_withoutParent[i].tx_id, true);
            tx_id_Map_withoutParent.set(data.tx_id_array_withoutParent[i].tx_id, { "fee": data.tx_id_array_withoutParent[i].fee, "weight": data.tx_id_array_withoutParent[i].weight, "isCompleted": true, "parents": data.tx_id_array_withoutParent[i].parents });

            currentValue += data.tx_id_array_withoutParent[i].fee;
            currentWeight += data.tx_id_array_withoutParent[i].weight;
            printSeqID.push(data.tx_id_array_withoutParent[i].tx_id);
        } else {
            stopAll = true;
            break;
        }

    }

}

function calculateAll_withParnet() {

    while (tx_id_Map_withParent.size >= 1) {

        const iterator1 = tx_id_Map_withParent[Symbol.iterator]();

        for (const item of iterator1) {

            if (item[1].weight + currentWeight < data.metaData.maxWeight) {

                var parentsArray = item[1].parents;
                for (var i = parentsArray.length - 1; i >= 0; i--) {
                    if (tx_id_Map.has(parentsArray[i])) {
                        parentsArray.splice(i, 1);
                    }
                }

                parentArrayBreak: for (var i = 0; i < parentsArray.length; i++) {
                    if (calculate_Parent(parentsArray[i])) {

                        if (i == parentsArray.length - 1) {

                            if (item[1].weight + currentWeight <= data.metaData.maxWeight) {
                                tx_id_Map.set(item[0], true);
                                tx_id_Map_withParent.set(item[0], { "fee": item[1].fee, "weight": item[1].weight, "isCompleted": true, "parents": item[1].parents });
                                currentValue += item[1].fee;
                                currentWeight += item[1].weight;
                                printSeqID.push(item[0]);
                            } else {
                                tx_id_Map_withParent.delete(item[0]);
                            }

                        }

                    } else {
                        tx_id_Map_withParent.delete(item[0]);
                        break parentArrayBreak;
                    }

                }

            } else {
                tx_id_Map_withParent.delete(item[0]);
            }


        }

    }

}

function calculate_Parent(parentElement) {
    if (tx_id_Map.has(parentElement)) {
        return true;
    } else if (tx_id_Map_withoutParent.has(parentElement) && tx_id_Map_withoutParent.get(parentElement).isCompleted == false) {
        if (tx_id_Map_withoutParent.get(parentElement).weight + currentWeight <= data.metaData.maxWeight) {
            var currentTx = tx_id_Map_withoutParent.get(parentElement);

            tx_id_Map.set(parentElement, true);
            tx_id_Map_withoutParent.set(parentElement, { "fee": currentTx.fee, "weight": currentTx.fee, "isCompleted": true, "parents": currentTx.parents });
            printSeqID.push(parentElement);
            currentValue += currentTx.fee;
            currentWeight += currentTx.weight;

        } else {
            tx_id_Map_withoutParent.delete(parentElement);
            return false;
        }

    } else if (tx_id_Map_withParent.has(parentElement) && tx_id_Map_withParent.get(parentElement).isCompleted == false) {
        var moreParents = tx_id_Map_withParent.get(parentElement).parents;

        for (var j = moreParents.length - 1; j >= 0; j--) {
            if (tx_id_Map.has(moreParents[j])) {
                moreParents.splice(j, 1);
            }
        }

        for (var i = 0; i < moreParents.length; i++) {

            if (calculate_Parent(moreParents[i])) {

                if (i == moreParents.length - 1) {

                    if (tx_id_Map_withParent.get(parentElement).weight + currentWeight <= data.metaData.maxWeight) {
                        var currentTx = tx_id_Map_withParent.get(parentElement);
                        tx_id_Map.set(parentElement, true);
                        tx_id_Map_withParent.set(parentElement, { "fee": currentTx.fee, "weight": currentTx.weight, "isCompleted": true, "parents": currentTx.parents });
                        printSeqID.push(parentElement);
                        currentValue += currentTx.fee;
                        currentWeight += currentTx.weight;
                    } else {
                        tx_id_Map_withParent.delete(parentElement);
                        return false;
                    }

                }

            } else {
                tx_id_Map_withParent.delete(parentElement);
                return false;
            }

        }

    } else {
        return false;
    }

}

function calculateAll() {

    calculateAll_withoutParnet();
    if (!stopAll) {
        calculateAll_withParnet();
    }

    fs.writeFile('block.txt', printSeqID.join('\n'), (err) => {

        // In case of a error throw err.
        if (err) throw err;
    });

    console.log("TotalWeight:" + currentWeight);
    console.log("TotalFee:" + currentValue);

}

calculateAll();

//knapSack test
var testArr1 = [];
var testArr2 = [];
for (var i = 0; i < data.metaData.maxWeight; i++) {
    testArr1.push(0);
    testArr2.push(0);
}
//test ends here

//knapsack Test

function calculate_withKnapsack() {

    var localFee = 0;
    var localWeight = 0;
    var iPlace = 1;
    while (true) {
        for (var j = 0; j < data.metaData.maxWeight; j++) {
            testArr2[j] = testArr1[j];
            if (true) {
                
            }
        }
        //copy to first one
    }

}

//calculate_withKnapsack();
//test ends here





//leastWeight Test
var leastWeightSeq = [];
function calculateAll_withoutParnet_withLeastWeight() {
    console.log("FUNCTION CALLED");
    var localWeight = 0, localFee = 0;
    data.tx_id_array_withoutParent.sort(function (a, b) {
        return a.weight - b.weight;
    });
    //console.log("Sorted Array:",data.tx_id_array_withoutParent);
    console.log("AL RECORDS");
    for (var i = 0; i < data.tx_id_array_withoutParent.length; i++) {
        if (localWeight + data.tx_id_array_withoutParent[i].weight <= data.metaData.maxWeight) {
            leastWeightSeq.push(data.tx_id_array_withoutParent[i].tx_id);
            localWeight += data.tx_id_array_withoutParent[i].weight;
            localFee += data.tx_id_array_withoutParent[i].fee;
        } else {
            break;
        }

    }
    console.log("Local FEE:", localFee);
    console.log("Local Weight", localWeight);

    fs.writeFile('block.txt', leastWeightSeq.join('\n'), (err) => {

        // In case of a error throw err.
        if (err) throw err;
    });

}

//calculateAll_withoutParnet_withLeastWeight();
