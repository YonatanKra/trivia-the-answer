import 'https://unpkg.com/@vonage/vivid@latest/layout';
import 'https://unpkg.com/@vonage/vivid@latest/card';
import 'https://unpkg.com/@vonage/vivid@latest/button';
import 'https://unpkg.com/@vonage/vivid@latest/divider';
import { getQuestions } from './getQuestions.js';

const getQuestionResultTemplate = (result, refLink) => {
    return `
        <div class="rows-display">
            <div>
                <h2>${result}</h2>
                ${refLink ? `<vwc-button appearance="filled" href="${refLink}" target="_blank" label="רוצה לדעת את התשובה? קליק אחד לפרק התשובה!"></vwc-button>` : ''}
            </div>
            <vwc-button appearance="filled" id="next-question-button" label="לשאלה הבאה"></vwc-button>
        </div>
`
}

const getFinalResult = (grade) => {
    return `
    <div class="column">
        <h2>הנך בעל/ת ${grade}% מ״התשובה״</h2>
        ${grade >= 80 ? `
        <vwc-divider role="separator" orientation="horizontal"></vwc-divider>
            <div>
                בתור בעל/ת תשובה, יש לך את הזכות ללמד עוד אנשים!
            </div>

            <vwc-button connotation="cta" 
                        target="_blank" 
                        icon="edit-line" 
                        label="רוצה להוסיף שאלות בעצמך?"
                        href="https://forms.gle/mWWNMJoCCwByPNN6A">
            </vwc-button>

        ` : ``}
        <vwc-button id="try-again" 
                    size="${grade >= 80 ? 'super-condensed' : 'normal'}" 
                    appearance="${grade >= 80 ? 'ghost' : 'filled'}" 
                    label="${grade >= 80 ? 'היה כיף! רוצה עוד פעם!' : 'רוצה לנסות שוב?'}">
        </vwc-button>
    </div>
        
    `;
}

const getInstructionsScreenTemplate = () => {
    return `
    <div class="column">
        <p>
            אפליקציה זו בוחנת את היכרותך עם ״התשובה״.
            בתום השאלות נדע האם וכמה את/ה בעל/ת תשובה!
            <br/>
            <br/>
            רוצה להוסיף שאלות בעצמך? בסיום יינתן ציון ״בעל התשובה״. אם הצטיינת, תינתן לך אפשרות להוסיף שאלות נוספות בעצמך!
            <br/>
            <br/>
            <b>נ.ב.</b>
            אם לא מצליחים בשאלה, אל דאגה, תמיד אפשר להקשיב לפרק המתאים :)
            
        </p>
        <vwc-button id="start-button" appearance="filled" connotation="success" label="יאללה, נתחיל!"></vwc-button>
    </div>
    `;
};

const setCalculationAnimation = () => {
    return `
    <div class="calculation-animation">
        <img src="./assets/rolling-drums.gif" alt="rolling-drums while calculating the results"/>
    </div>
    `;
};

function shuffleArray(shuffledArray) {
    const array = JSON.parse(JSON.stringify(shuffledArray));
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class ItamarTrivia extends HTMLElement {
    #questions;
    #points = 0;
    #currentQuestion = 0;
    #started = false;

    get #tryAgainButton() {
        return this.shadowRoot.querySelector('#try-again');
    }

    get #answersElement() {
        return this.shadowRoot.querySelector('#answers');
    }

    get #resultElement() {
        return this.shadowRoot.querySelector("#result");
    }

    get #questionElement() {
        return this.shadowRoot.querySelector("#question");
    }
    
    constructor() {
        super();
        const template = document.getElementById("trivia-question-template");
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(template.content.cloneNode(true));
    }

    async #getQuestions() {
        this.#questions = shuffleArray(await getQuestions());
    }

    async connectedCallback() {
        await this.#getQuestions();
        this.#showQuestion();
    }

    restart = (showSplash = false) => {
        this.#started = !showSplash;
        this.#currentQuestion = 0;
        this.#points = 0;
        const tmpParent = this.parentNode;
        this.remove();
        tmpParent.appendChild(this);
    }

    #showSplash() {
        this.#resultElement.innerHTML = getInstructionsScreenTemplate();
        this.#resultElement.querySelector('#start-button').addEventListener('click', () => this.restart(false));
        this.#showResults(true);
    }

    #showQuestion = () => {
        if (!this.#started) {
            this.#showSplash();
            return;
        }
        if (this.#currentQuestion >= this.#questions.length) {
            this.#showFinalResults();
            return;
        }
        this.#showResults(false);
        const question = this.#questions[this.#currentQuestion];
        this.shadowRoot.querySelector("#question").innerHTML = question.question;
        this.#showAnswers(question);
    }

    #showFinalResults = () => {
        this.#showResults(true);
        this.#resultElement.innerHTML = setCalculationAnimation();
        setTimeout(() => {
            this.#resultElement.innerHTML = getFinalResult(Math.round(100 * this.#points / (this.#questions.length - 1)));
            this.#tryAgainButton?.addEventListener('click', () => this.restart(false));
        }, 1000);
    }

    #showAnswers(question) {
        this.#answersElement.innerHTML = "";
        const shuffledAnswers = shuffleArray(question.answers);
        for (let i = 0; i < shuffledAnswers.length; i++) {
            this.#setAnswerButton(shuffledAnswers[i], question);
        }
    }

    #setAnswerButton(answer, {sourceLink, correctAnswer}) {
        const button = document.createElement("vwc-button");
        button.appearance = 'filled';
        button.connotation = 'cta';
        button.label = answer;
        button.onclick = () => {
            this.#showResults(true);
            if (answer === this.#questions[this.#currentQuestion].answers[correctAnswer - 1]) {
                this.#points++;
                this.#resultElement.innerHTML = getQuestionResultTemplate('נכון!');
            } else {
                this.#resultElement.innerHTML = getQuestionResultTemplate('טעות!', sourceLink);
            }
            this.#currentQuestion++;
            
            const nextButton = this.shadowRoot.querySelector('#next-question-button');
            if (this.#currentQuestion < this.#questions.length - 1) {
                nextButton.addEventListener('click', this.#showQuestion);
            } else {
                nextButton.label = 'לסיכום...';
                nextButton.addEventListener('click', this.#showFinalResults);
            }
            
        };
        this.#answersElement.appendChild(button);
    }

    #showResults = (showResults) => {
        this.#questionElement.classList.toggle('hidden', showResults);
        this.#answersElement.classList.toggle('hidden', showResults);
        this.#resultElement.classList.toggle('hidden', !showResults);
    }
}

customElements.define("itamar-trivia", ItamarTrivia);