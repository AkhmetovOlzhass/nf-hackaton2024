import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv';
import { readJsonFile, saveDataToJsonFile } from './storage';
import { generateFullText } from './promts';
import { readSheetData, updateSheetData } from './googleAuth';
import { extractSpreadsheetId } from './excractId';
import { preparedData } from './promts';

dotenv.config();
const token = process.env.TG as string;

const userStates = {};

async function sendMessageToMentor(bot, mentorChatId, message) {
    await bot.sendMessage(mentorChatId, message);
}

const options = {
    reply_markup: {
        inline_keyboard: [
            [{ text: 'Да', callback_data: 'yes' }],
            [{ text: 'Нет', callback_data: 'no' }]
        ]
    }
};

export const bot = new TelegramBot(token, { polling: true });

function startBot() {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;

        if (!userStates[chatId]) {
            userStates[chatId] = { step: "waitingForLink" };
        }

        if (userStates[chatId].awaitingFunctionInput) {
            if (userStates[chatId].stepAwaiting === "explain") {
                const oldData = readJsonFile('output.json');
                oldData[userStates[chatId].rowIndex].push(userStates[chatId].answer);
                oldData[userStates[chatId].rowIndex].push(text);
                preparedData.push(oldData[userStates[chatId].rowIndex])
                
                await saveDataToJsonFile(oldData);
                await updateSheetData(extractSpreadsheetId(userStates[chatId].link), userStates[chatId].sheetName, oldData);
                delete userStates[chatId].awaitingFunctionInput;
                continueProcessing(oldData, userStates[chatId].rowIndex + 1, chatId, userStates[chatId].sheetName);
            }
            return;
        }

        switch (userStates[chatId].step) {
            case "waitingForLink":
                if (text && text.includes('docs.google.com/spreadsheets')) {
                    userStates[chatId].link = text;
                    userStates[chatId].step = "waitingForSheetName";
                    bot.sendMessage(chatId, "Теперь введите название страницы. Например: Sheet3");
                } else {
                    bot.sendMessage(chatId, "Привет, введите ссылку на Excel таблицу. Например: docs.google.com/spreadsheets/d/your_id/");
                }
                break;
            case "waitingForSheetName":
                userStates[chatId].sheetName = text;
                await processData(chatId, text);
                break;
        }
    });

    bot.on('callback_query', async (callbackQuery) => {
        const message = callbackQuery.message;
        const data = callbackQuery.data;
        const chatId = message!.chat.id;

        if (data === 'yes' || data === 'no') {
            userStates[chatId].answer = data === 'yes' ? 'Yes' : 'No';
            bot.sendMessage(chatId, `Пожалуйста, опишите в пару предложений, почему вы ответили '${data === 'yes' ? 'да' : 'нет'}':`);
            userStates[chatId].stepAwaiting = "explain";
        }
    });
}

async function processData(chatId, text) {
    const spreadLink = userStates[chatId].link;
    const spreadsheetId = extractSpreadsheetId(spreadLink);
    const range = text;

    bot.sendMessage(chatId, `В процессе...`);

    await readSheetData(spreadsheetId, range)
        .then(data => saveDataToJsonFile(data))
        .catch(error => console.error('Error:', error));

    const oldData = readJsonFile('output.json');

    await continueProcessing(oldData, 1, chatId, range);
}

async function continueProcessing(oldData, startIndex, chatId, sheetName) {

    const spreadLink = userStates[chatId].link;
    const spreadsheetId = extractSpreadsheetId(spreadLink)
    const max = oldData[0].length-1;

    for (let i = startIndex; i < oldData.length; i++) {
        
        if(oldData[i][max]){
            preparedData.push(oldData[i])
            continue;
        } else{
            const evaluation = await generateFullText(oldData[i]);
            if(evaluation){
                if (evaluation.decision === 'Uncertain') {
                    let viewData = '';
                    oldData[i].forEach((el, j) => {
                        viewData += `${oldData[0][j]}: ${oldData[i][j]} \n\n`
                    })
                    
                    bot.sendMessage(chatId, viewData, options);
                    userStates[chatId].awaitingFunctionInput = true;
                    userStates[chatId].stepAwaiting = "first";
                    userStates[chatId].rowIndex = i;
                    break;
                } else {
                    oldData[i].push(evaluation.decision);
                    oldData[i].push(evaluation.reason);
                }
                await saveDataToJsonFile(oldData);
                await updateSheetData(spreadsheetId, sheetName, oldData);
            } else{
                i--;
            }
            if (i == oldData.length-1) {
                bot.sendMessage(chatId, "Обработка всех данных завершена.").then(() => {
                    process.exit(0); // Закрывает сервер после отправки последнего сообщения
                });
            }
        }

    }

    
}

export { startBot, sendMessageToMentor };