import { getQuestions } from './getQuestions.js';

global.fetch = vi.fn()

function createFetchResponse(data) {
  return { ok: true, json: () => new Promise((resolve) => resolve(data)) }
}

describe('getQuestions', () => {
    it('should fetch questions from spreadsheet', async () => {
        const spreadsheetId = '1vFqQwGPFh-5GcTpgnIzw9e10SER4dcE0mvj384JRe90';
        const sheetName = 'Sheet1';
        const apiKey = 'AIzaSyAEMteZt2odUw84JKPI_UVuXqtaP-zrWxc';

        const expectedQuestions = [
            {
                question: 'מה השמיד את הדינוזאורים',
                answers: ["מטאור","חרב","פיצה","יותר מדי גלידה"],
                correctAnswer: 1,
                sourceLink: 'https://www.osimhistoria.com/theanswer/ep156_dinosaurs'
            }
        ];
        
        const getQuestionsResponse = {
            values: [
                    ["question","correctAnswer","wrongAnswer1","wrongAnswer2","wrongAnswer3","sourceLink","emailAdress","name"],
                    ["מה השמיד את הדינוזאורים","מטאור","חרב","פיצה","יותר מדי גלידה","https://www.osimhistoria.com/theanswer/ep156_dinosaurs"]
                ]
        };
        fetch.mockResolvedValue(createFetchResponse(getQuestionsResponse));
    
        const questions = await getQuestions();
    

        expect(fetch).toHaveBeenCalledWith(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`
        )
    
        expect(questions).toEqual(expectedQuestions)
    });
});