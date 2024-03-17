import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

/**View for the Associate Verbs game. */
export default class AssociateVerbsGameView extends DialogoView {
    #backBtn;
    #lblScore;

    #navigateToIndexEvent;
    #navigateToLanguagePortalEvent;

    #verb = {};
    #pronouns = [];
    #verbs = {};
    #draggedItem = null;

    #BCP47;
    #speech;

    #score = 0;
    #numDrops = 0;

    /**Constructs a new AssociateVerbsGameView instance.
     * @param {string} [viewID=""] The id of the view to create.
     * @param {Object} verb The verb to display in this VerbGameView instance.
     * @param {string} BCP47 The BCP47 language code of the verb's language, so it can be spoken. 
     */
    constructor(viewID="", verb, BCP47 = "") {
        super(viewID);

        this.#verb = verb;

        this.#BCP47 = BCP47;
        this.#speech = new SpeechSynthesisUtterance();
        this.#speech.lang = this.#BCP47;

        let i = 0;
        for (let key in verb) {
            if (typeof verb[key] === "string") {
                this.#pronouns.push(verb[key].split(" ")[0]);
                this.#verbs[this.#pronouns[i]] = verb[key].split(" ")[1];
                i++;
            }
            else
                console.warn(`The value of verb[${key}] is not a string:`, verb[key]);
        }

        let header = document.getElementById("Header");
        LanguageManager.getTranslation("associateverbs").then((translation) => {
            header.textContent = translation;
        });

        let divI = document.getElementById("I");
        divI.textContent = this.#pronouns[0];

        let divYou = document.getElementById("You");
        divYou.textContent = this.#pronouns[1];

        let divHe = document.getElementById("He");
        divHe.textContent = this.#pronouns[2];

        let divWe = document.getElementById("We");
        divWe.textContent = this.#pronouns[3];

        //If you think "YouTwo" is a retarded name, hate the language not the programmer :P
        let divYouTwo = document.getElementById("YouTwo");
        divYouTwo.textContent = this.#pronouns[4];

        let divThey = document.getElementById("They");
        divThey.textContent = this.#pronouns[5];

        this.#backBtn = document.getElementById("backBtn");
        LanguageManager.getTranslation("back").then((translation) => {
            this.#backBtn.textContent = translation;
        });
        
        this.#backBtn.addEventListener("click", async () => {
            await this.#navigateToIndexEvent();
        });

        this.#lblScore = document.getElementById("lblScore");
        LanguageManager.getTranslation("score").then((translation) => {
            this.#lblScore.textContent = translation + this.#score.toString();
        });

        this.#populateVerbs();
    }

    /**Populates the verbs container with the verbs used to construct this class. */
    #populateVerbs() {
        let verbsContainer = document.getElementById("verbs-container");
        let verbEntries = Object.entries(this.#verbs);
        this.shuffleArray(verbEntries);
    
        verbEntries.forEach(([pronoun, verb]) => {
            const verbDiv = document.createElement("div");
            verbDiv.classList.add("verb");
            verbDiv.textContent = verb;
            verbDiv.setAttribute("draggable", true);
            verbDiv.addEventListener("dragstart", this.#dragStart);
            verbsContainer.appendChild(verbDiv);
        });

        document.querySelectorAll(".pronoun").forEach(item => {
            item.addEventListener("dragover", this.#allowDrop);
            item.addEventListener("drop", this.#drop);
        });
    }

    /**Event handler for the dragstart event.*/
    #dragStart = (e) => {
        this.#draggedItem = e.target;
    }

    /**Event handler for the dragover event.*/
    #allowDrop = (e) => {
        e.preventDefault();
    }
    
    /**Event handler for the drop event.*/
    #drop = (e) => {
        e.preventDefault();
        let pronoun = e.target.textContent.trim();

        if (this.#draggedItem.textContent === this.#verbs[pronoun]) {
            e.target.appendChild(this.#draggedItem);
            this.#speech.text = pronoun + " " + this.#verbs[pronoun];
            window.speechSynthesis.speak(this.#speech);
            this.#score++;
            this.#numDrops++;
        } else 
            if(this.#score > 0) this.#score--;
    
        LanguageManager.getTranslation("score").then((translation) => {
            this.#lblScore.textContent = translation + this.#score.toString();
        });
    
        if (this.#numDrops === Object.keys(this.#verbs).length) {
            if (this.#score === Object.keys(this.#verbs).length)
                this.#navigateToLanguagePortalEvent();
            else if (this.#score < Object.keys(this.#verbs).length) {
                LanguageManager.getTranslation("goagain").then(async (translation) => {
                    await this.createConfirmationToast(translation, 
                    async () => await this.#resetGame(),
                    async () => await this.#navigateToLanguagePortalEvent());
                });
            }
        }
    };
    
    /**Resets the game if the player wants to practice more! :D */
    #resetGame() {
        this.#score = 0;
        this.#numDrops = 0;

        let verbEntries = Object.entries(this.#verbs);
        this.shuffleArray(verbEntries);

        let divI = document.getElementById("I");
        divI.removeChild(divI.lastChild);
    
        let divYou = document.getElementById("You");
        divYou.removeChild(divYou.lastChild);
    
        let divHe = document.getElementById("He");
        divHe.removeChild(divHe.lastChild);
    
        let divWe = document.getElementById("We");
        divWe.removeChild(divWe.lastChild);

        let divYouTwo = document.getElementById("YouTwo");
        divYouTwo.removeChild(divYouTwo.lastChild);

        let divThey = document.getElementById("They");
        divThey.removeChild(divThey.lastChild);

        this.#populateVerbs();
    
        LanguageManager.getTranslation("score").then((translation) => {
            this.#lblScore.textContent = translation + "0"; //Reset score to 0 in display
        });
    }

    /**Event handler for navigating to the Index view. */
    onNavigatingToIndex(callback) {
        this.#navigateToIndexEvent = callback;
    }

    /**Event handler for navigating to the Language Portal view. */
    onNavigatingToLanguagePortal(callback) {
        this.#navigateToLanguagePortalEvent = callback;
    }

    /**Shuffles the elements of a given array. */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); //Random index from 0 to i
            [array[i], array[j]] = [array[j], array[i]]; //Swap elements
        }
    }
 }
