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

        <div>
            <a target="_blank"
            href="https://forms.gle/mWWNMJoCCwByPNN6A">
                <vwc-icon name="edit-line"></vwc-icon> רוצה להוסיף שאלות?</a>
        </div>
    </div>
    ` : ''}
    `;
}

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

    #showQuestion = () => {
        this.#resultElement.classList.remove('active');
        const question = this.#questions[this.#currentQuestion];
        this.shadowRoot.querySelector("#question").innerHTML = question.question;
        this.#showAnswers(question);
    }

    #showAnswers(question) {
        const answersElement = this.shadowRoot.querySelector("#answers");
        answersElement.innerHTML = "";
        const shuffledAnswers = shuffleArray(question.answers);
        for (let i = 0; i < shuffledAnswers.length; i++) {
            this.#setAnswerButton(answersElement, shuffledAnswers[i], question);
        }
    }

    get #resultElement() {
        return this.shadowRoot.querySelector("#result");
    }

    #setAnswerButton(answersElement, answer, {sourceLink, correctAnswer}) {
        const button = document.createElement("vwc-button");
        button.appearance = 'filled';
        button.connotation = 'cta';
        button.label = answer;
        button.onclick = () => {
            this.#resultElement.classList.add('active');
            if (answer === this.#questions[this.#currentQuestion].answers[correctAnswer - 1]) {
                this.#points++;
                this.#resultElement.innerHTML = getQuestionResultTemplate('נכון!');
            } else {
                this.#resultElement.innerHTML = getQuestionResultTemplate('טעות!', sourceLink);
            }
            this.#currentQuestion++;
            if (this.#currentQuestion < this.#questions.length) {
                this.shadowRoot.querySelector('#next-question-button').addEventListener('click', this.#showQuestion);
            } else {
                this.#resultElement.innerHTML = getFinalResult(100 * this.#points / this.#questions.length);
            }
        };
        answersElement.appendChild(button);
    }
}

customElements.define("itamar-trivia", ItamarTrivia);

// TODO::ask someone to help with design?
// TODO::tests
// TODO::refactor
