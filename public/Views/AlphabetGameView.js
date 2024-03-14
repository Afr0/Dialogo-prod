import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";

export default class AlphabetGameView extends DialogoView {
    #backBtn;

    #navigateToIndexEvent;
    #navigateToLanguagePortalEvent;

    #alphabet = {};
    #appAlphabet = {};
    #charmapping = {};
    #currentChar = 0;
    #currentAppChar = 0;

    #currentCharSound;
    #soundDir;

    #isRussian = false;
    #isAppRussian = false;

    /**Constructs a new AlphabetGameView instance.
     * @param {string} [viewId=""] The id of the view to create.
     * @param {Object} alphabet The alphabet to display in this AlphabetGameView instance.
     * @param {Object} appAlphabet The app's alphabet, to display under the alphabet.
     * @param {Object} charmapping The character mapping loaded from the alphabet's sound dir.
     * @param {string} soundDir The correct directory corresponding to the correct alphabet.
     */
    constructor(viewID="", alphabet, appAlphabet, appLanguage, charmapping, soundDir = "") {
        super(viewID);

        this.#alphabet = alphabet;
        this.#appAlphabet = appAlphabet;
        this.#charmapping = charmapping;
        this.#soundDir = soundDir;
        this.#currentCharSound = document.getElementById("currentCharSound");
        this.#currentCharSound.src = this.#soundDir + this.#charmapping[alphabet[this.#currentChar]];

        (async () => { //Play the first character.
            await this.#currentCharSound.play().catch(e => console.error("Error playing sound:", e));
        });

        this.#backBtn = document.getElementById("backBtn");
        LanguageManager.getTranslation("back").then((translation) => {
            this.#backBtn.textContent = translation;
        });
        
        this.#backBtn.addEventListener("click", async () => {
            await this.#navigateToIndexEvent();
        });

        //This is a suboptimal solution, but finding a generalized solution to accommodate
        //any language that may or may not have an alphabet longer than the Italian one
        //is outside the timeframe scope of this project.
        if(this.#isItalian(this.#alphabet)) {
            if(appLanguage === "english")
                this.#appAlphabet = alphabet; //Hack.
        }

        let lblCurrentAppChar = document.getElementById("lblCurrentAppChar");
        lblCurrentAppChar.innerText = this.#appAlphabet[this.#currentAppChar];

        let lblCurrentChar = document.getElementById("lblCurrentChar");
        lblCurrentChar.innerText = this.#alphabet[this.#currentChar];

        this.#isRussian = this.#isCyrillic(this.#alphabet[this.#currentChar]);
        this.#isAppRussian = this.#isCyrillic(this.#appAlphabet[this.#currentChar]);

        lblCurrentChar.addEventListener("click", async () => {
            if(this.#currentChar <= alphabet.length) {
                this.#currentAppChar++;
                this.#currentChar++;
            }

            if(this.#alphabet[this.#currentChar] == null) { //Don't try this at home, kids!
                this.#navigateToLanguagePortalEvent();
            }

            this.#currentCharSound.src = this.#soundDir + this.#charmapping[alphabet[this.#currentChar]];
            await this.#currentCharSound.play().catch(e => console.error("Error playing sound:", e));
            lblCurrentChar.innerText = this.#alphabet[this.#currentChar];

            if(!this.#isAppRussian) {
                lblCurrentAppChar.innerText = this.#isRussian ? 
                    this.#cyrillicToLatin(this.#alphabet[this.#currentAppChar]) : 
                    this.#appAlphabet[this.#currentAppChar];
            } else 
                lblCurrentAppChar.innerText = this.#latinToCyrillic(this.#alphabet[this.#currentAppChar]);
        });
    }

    onNavigatingToIndex(callback) {
        this.#navigateToIndexEvent = callback;
    }

    onNavigatingToLanguagePortal(callback) {
        this.#navigateToLanguagePortalEvent = callback;
    }

    /**Checks the first character of an alphabet to see if it's cyrillic.
     * @param {string} [charToTest=""] The FIRST character of the alphabet to test.
     * @returns True if it's a cyrillic alphabet, false otherwise.
     */
    #isCyrillic(charToTest = "") {
        if(charToTest === "А")
            return true;
        else
            return false;
    }

    /**Checks an alphabet to see if it's italian.
     * @returns True if it is, false otherwise. */
    #isItalian(alphabet) {
        //Less than ideal way of checking, since it doesn't accomodate 
        //other alphabets that are also 21 chars, but it works for now.
        if(Object.keys(alphabet).length == 21)
            return true;

        return false;
    }

    /**Converts the cyrillic to the latin alphabet, based on the
     * Library of Congress Romanization: https://www.loc.gov/catdir/cpso/romanization/russian.pdf
     */
    #cyrillicToLatin(cyrillicChar = "") {
        switch(cyrillicChar) {
            case "А":
                return "A";
            case "Б":
                return "B";
            case "В":
                return "V";
            case "Г":
                return "G";
            case "Д":
                return "D";
            case "Е":
                return "YE";
            case "Ё":
                //This is a retarded romanization that has no relevance to 
                //English (or Italian) speakers, but we'll let it be here for now
                //for standardization reasons.
                return "Ë";
            case "Ж":
                return "ZH";
            case "З":
                return "Z";
            case "И":
                return "I";
            case "Й":
                return "J";
            case "К":
                return "K";
            case "Л":
                return "L";
            case "М":
                return "M";
            case "Н":
                return "N";
            case "О":
                return "O";
            case "П":
                return "P";
            case "Р":
                return "R";
            case "С":
                return "S";
            case "Т":
                return "T";
            case "У":
                //This is a retarded romanization that has no relevance to 
                //English (or Italian) speakers, but we'll let it be here for now
                //for standardization reasons.
                return "U";
            case "Ф":
                return "F";
            case "Х":
                return "Kh";
            case "Ц":
                return "TS";
            case "Ч":
                return "CH";
            case "Ш":
                return "SH";
            case "Щ":
                return "SHCH";
            case "Ъ":
                return '" HARD SIGN';
            case "Ы":
                return "Y";
            case "ь":
                return "' SOFT SIGN";
            case "Э":
                return "E";
            case "Ю":
                return "YU";
            case "Я":
                return "YA";
        }
    }

    /**Converts the latin to the cyrillic alphabet, where possible.
     * Returns "" by default for sounds in Latin languages that do not
     * exist in Russian.
    */
    #latinToCyrillic(latinChar = "") {
        switch(latinChar) {
            case "A":
                return "А";
            case "B":
                return "Б";
            case "V":
                return "В";
            case "G":
                return "Г";
            case "D":
                return "Д";
            case "E":
                return "Э";
            case "Z":
                return "З";
            case "H":
                return "Х";
            case "I":
                return "И";
            case "J":
                return "Й";
            case "K":
                return "К";
            case "L":
                return "Л";
            case "M":
                return "М";
            case "N":
                return "Н";
            case "O":
                return "О";
            case "P":
                return "П";
            case "R":
                return "Р";
            case "S":
                return "С";
            case "T":
                return "Т";
            case "U":
                return "У";
            case "F":
                return "Ф";
            default:
                return "";
        }
    }
 }