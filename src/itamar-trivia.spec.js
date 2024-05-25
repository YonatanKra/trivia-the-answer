import { describe } from 'vitest';
import {ItamarTrivia} from './itamar-trivia.js';

describe('itamar-trivia', () => {
    it('should define the custom element', () => {
        const definedElement = customElements.get('itamar-trivia')[0];
        expect(definedElement).toBe(ItamarTrivia);
    });

    //TODO::test connected callback and move from there...
    describe('connected element', () => {
        
    });
});