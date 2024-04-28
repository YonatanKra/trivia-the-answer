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
const cachedData = localStorage.getItem('sheetData');

export async function getQuestions() {
    if (cachedData) {
        const data = JSON.parse(cachedData);
        return data;
    } else {
        try {
            const questions = (await getSheetData(spreadsheetId, sheetName, apiKey))
                .filter((item, index) => index !== 0)
                .map(question => new Question(...normalizeQuestion(question)));
            
            localStorage.setItem('sheetData', JSON.stringify(questions));
            return questions;
        } catch(e) {
            console.error(e);
        }
    }
}