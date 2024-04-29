async function getSheetData(spreadsheetId, sheetName, apiKey) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
    console.log(url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching spreadsheet data: ${response.statusText}`);
        }
        const data = await response.json();
        return data.values; // Array containing spreadsheet data
    } catch (error) {
        console.error("Error fetching sheet data:", error);
        return null;
    }
}

const spreadsheetId = '1vFqQwGPFh-5GcTpgnIzw9e10SER4dcE0mvj384JRe90';
const sheetName = 'Sheet1';
const apiKey = 'AIzaSyAEMteZt2odUw84JKPI_UVuXqtaP-zrWxc';

export class Question {
    constructor(question, answers, correctAnswer, sourceLink) {
        this.question = question;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
        this.sourceLink = sourceLink;
    }
}

function normalizeQuestion(question) {
    const questionString = question.splice(0, 1)[0];
    const answers = question.splice(0, 4);
    const correctAnswer = 1;
    const sourceLink = question[0];

    return [
        questionString,
        answers,
        correctAnswer,
        sourceLink
    ]
}

function isLocalStorageTimeValid() {
    const now = new Date().getTime();
    const savedTime = localStorage.getItem('sheetDataTime');
    const timeDiff = now - savedTime;
    return savedTime && timeDiff < 12 * 60 * 60 * 1000;
}

function getDataFromLocalStorage() {
    if (isLocalStorageTimeValid()) {
        return localStorage.getItem('sheetData');;
    }
    return null;
}

function setDataInLocalStorage(data) {
    localStorage.setItem('sheetData', JSON.stringify(data));
    localStorage.setItem('sheetDataTime', new Date().getTime());
}

function transformDataToQuestions(data) {
    return data.filter((item, index) => index !== 0)
        .map(question => new Question(...normalizeQuestion(question)));
}

export async function getQuestions() {
    const cachedData = getDataFromLocalStorage();
    if (cachedData) {
        const questions = JSON.parse(cachedData);
        return questions;
    } else {
        try {
            const questions = transformDataToQuestions(await getSheetData(spreadsheetId, sheetName, apiKey));
                
            setDataInLocalStorage(questions);
            return questions;
        } catch(e) {
            console.error(e);
        }
    }
}