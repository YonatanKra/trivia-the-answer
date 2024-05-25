import { getQuestions } from './getQuestions.js';

function createFetchResponse(data) {
  return { ok: true, json: () => new Promise((resolve) => resolve(data)) }
}

describe('getQuestions', () => {

    beforeEach(() => {
        vi.spyOn(global, 'fetch');
        vi.spyOn(console, 'error').mockReturnValue({});
    });

    afterEach(() => {
        global.fetch.mockRestore();
        console.error.mockRestore();
    });

    it('should log an error if fetch fails', async () => {
        const response = createFetchResponse({});
        response.ok = false;
        fetch.mockResolvedValue(response);
        await getQuestions();
        expect(console.error).toHaveBeenCalledWith('Failed to fetch spreadsheet. Error: undefined');
    });

    it('should fetch questions from spreadsheet', async () => {
        const spreadsheetId = '1vFqQwGPFh-5GcTpgnIzw9e10SER4dcE0mvj384JRe90';
        const sheetName = 'Sheet1';
        const apiKey = 'AIzaSyAEMteZt2odUw84JKPI_UVuXqtaP-zrWxc';
        
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
    
        expect(questions).toMatchInlineSnapshot(`
          [
            Question {
              "answers": [
                "מטאור",
                "חרב",
                "פיצה",
                "יותר מדי גלידה",
              ],
              "correctAnswer": 1,
              "question": "מה השמיד את הדינוזאורים",
              "sourceLink": "https://www.osimhistoria.com/theanswer/ep156_dinosaurs",
            },
          ]
        `)
    });

    it('should return data from local storage if exists', async () => {
        const data = {testData: 'test'};
        localStorage.setItem('sheetData', JSON.stringify(data));
        localStorage.setItem('sheetDataTime', new Date().getTime());

        const questions = await getQuestions();

        localStorage.setItem('sheetData', null);
        localStorage.setItem('sheetDataTime', null);
        expect(fetch).not.toHaveBeenCalled();
        expect(questions).toEqual(data);
    });
});