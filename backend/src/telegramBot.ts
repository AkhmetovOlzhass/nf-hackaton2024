import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv';
import { AIFunction } from './AIFunction';

dotenv.config();
const token = process.env.TG;

const userStates = {};

function startBot() {
    if(token){
        const bot = new TelegramBot(token, { polling: true });
        bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            if (!userStates[chatId]) {
                userStates[chatId] = { step: "waitingForLink" };
            }

            switch (userStates[chatId].step) {
                case "waitingForLink":
                    if (text && text.includes('docs.google.com/spreadsheets')) {
                        userStates[chatId].link = text;
                        userStates[chatId].step = "waitingForSheetName";
                        bot.sendMessage(chatId, `Теперь введите название страницы. Например: Sheet3`);
                    } else {
                        bot.sendMessage(chatId, `Привет, Введи ссылку на Excel таблицу. Например: docs.google.com/spreadsheets/d/your_id/`);
                    }
                    break;
                case "waitingForSheetName":
                    userStates[chatId].sheetName = text;
                    bot.sendMessage(chatId, `Процесс обработки начался!`);

                    AIFunction(userStates[chatId].link, userStates[chatId].sheetName)

                    

                    delete userStates[chatId]; // очистка состояния пользователя
                    break;
            }
        });
    }
}

export {startBot};