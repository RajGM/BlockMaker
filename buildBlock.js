    const data = require("./users.json");

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

    let tx_id_Map = new Map();

    for (var i = 0; i < data.tx_id_array_withoutParent.length; i++) {

        if (data.tx_id_array_withoutParent[i].weight + currentWeight < data.metaData.maxWeight) {

            tx_id_Map.set(data.tx_id_array_withoutParent[i].tx_id, true);
            tx_id_Map_withoutParent.set(data.tx_id_array_withoutParent[i].tx_id, { "fee": data.tx_id_array_withoutParent[i].fee, "weight": data.tx_id_array_withoutParent[i].weight, "isCompleted": true, "parents": data.tx_id_array_withoutParent[i].parents });
            currentValue += data.tx_id_array_withoutParent[i].fee;
            currentWeight += data.tx_id_array_withoutParent[i].weight;

        } else {
            break;
        }

    }

    label1: while (tx_id_Map_withParent.size>=1) {

        const iterator1 = tx_id_Map_withParent[Symbol.iterator]();
        
        for (const item of iterator1) {
            
            if (item[1].weight + currentWeight <= data.metaData.maxWeight) {

                var parentsArray = item[1].parents;
                for (var i = parentsArray.length - 1; i >= 0; i--) {
                    if (tx_id_Map.has(parentsArray[i])) {
                        parentsArray.splice(i, 1);
                    }
                }

                for (var i = 0; i < parentsArray.length; i++) {
                    if (calculate_allParents(parentsArray[i])) {
                     
                        if(i==parentsArray.length-1){

                            if (item[1].weight + currentWeight <= data.metaData.maxWeight) {
                                tx_id_Map.set(item[0], true);
                                currentValue += item[1].fee;
                                currentWeight += item[1].weight;
                            }else{
                                tx_id_Map_withParent.delete(item[0]);
                            }

                        }
                        
                    } else {
                        tx_id_Map_withParent.delete(item[0]);
                        break;
                    }

                }

            } else {
                tx_id_Map_withParent.delete(item[0]);
            }


        }

    }

    console.log("TotalWeight:" + currentWeight);
    console.log("TotalFee:" + currentValue);

function calculate_allParents(parentElement) {
    if (tx_id_Map.has(parentElement)) {
        return true;
    } else if (tx_id_Map_withoutParent.has(parentElement) && tx_id_Map_withoutParent.get(parentElement).isCompleted == false) {

        if (tx_id_Map_withoutParent.get(parentElement).weight + currentWeight <= data.metaData.maxWeight) {
            var currentTx = tx_id_Map_withoutParent.get(parentElement);
        
            tx_id_Map.set(parentElement, true);
            tx_id_Map_withoutParent.set(parentElement).isCompleted = true;
            tx_id_Map_withoutParent.set(parentElement, { "fee": currentTx.fee, "weight": currentTx.fee, "isCompleted": true, "parents": currentTx.parents });

            currentValue += currentTx.fee;
            currentWeight += currentTx.weight;

        } else {
            return false;
        }

    } else if (tx_id_Map_withParent.has(parentElement) && tx_id_Map_withParent.get(parentElement).isCompleted != true) {
        var moreParents = tx_id_Map_withParent.get(parentElement).parents;

        for (var j = moreParents.length - 1; j >= 0; j--) {
            if (tx_id_Map.has(moreParents[j])) {
                moreParents.splice(j, 1);
            }
        }

        for (var i = 0; i < moreParents.length; i++) {

            if (calculate_allParents(moreParents[i])) {
                
                if(i==moreParents.length-1){

                    if (tx_id_Map_withParent.get(parentElement).weight + currentWeight <= data.metaData.maxWeight) {
                        tx_id_Map.set(parentElement, true);
                        currentValue += tx_id_Map_withParent.get(parentElement).fee;
                        currentWeight += tx_id_Map_withParent.get(parentElement).weight;
                    }else{
                        //delete Parent
                        
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

