
import { readSheetData, updateSheetData } from './googleAuth';
import { readJsonFile, saveDataToJsonFile } from './storage';
import { extractSpreadsheetId } from './excractId';
import { generateFullText } from './promts';

async function AIFunction(link, nameOfList) {
    const spreadLink = link;
    const spreadsheetId = extractSpreadsheetId(spreadLink)
    const range = nameOfList;

    
    //readTable

    // await readSheetData(spreadsheetId, range)
    // .then(data => saveDataToJsonFile(data))
    // .catch(error => console.error('Error:', error));


    //update json

    const oldData = readJsonFile('output.json');
    oldData.forEach(async (el, i) => {
        if(i == 1){
            const promtData = await generateFullText(el);
            console.log(promtData);
            return
        }
    })
    
    // await saveDataToJsonFile(promtData)


    //update table

    // const newData = readJsonFile('output.json')
    // await updateSheetData(spreadsheetId, range, newData)
}

export {AIFunction}