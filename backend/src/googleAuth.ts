import { google } from 'googleapis';

async function authenticate() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "./hwbackend1.json",
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const googleSheets = google.sheets({ version: 'v4', auth });
        return googleSheets;
    } catch (error) {
        console.error('Ошибка при аутентификации:', error);
        throw error;  // Перебрасываем ошибку дальше, чтобы она могла быть обработана на более высоком уровне.
    }
}

async function readSheetData(spreadsheetId, range) {
    try {
        const googleSheets = await authenticate();

        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values;
    } catch (error) {
        console.error('Ошибка при чтении данных:', error);
        return null
    }
}

async function updateSheetData(spreadsheetId, range, values) {
    
    
    const googleSheets = await authenticate();

    const request = {
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: values
        }
    };

    try {
        const response = await googleSheets.spreadsheets.values.update(request);
        console.log('Данные успешно обновлены:', response.data);
    } catch (err) {
        console.error('Ошибка при обновлении данных:', err);
        
    }
}


export { readSheetData, updateSheetData };