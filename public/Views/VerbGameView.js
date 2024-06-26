import DialogoView from "./DialogoView.js";
import LanguageManager from "../LanguageManager.js";
import iOSVoiceSelector from "../iOSVoiceSelector.js";

/**View for the verb game. */
export default class VerbGameView extends DialogoView {
    #backBtn;
    #img;

    #navigateToAssociateVerbsGameEvent;

    #verb = {};
    #appLanguageVerb = {};
    #currentVerb = 1;
    #BCP47;
    #speech;
    #couldLoadVoices = false;

    /**Constructs a new VerbGameView instance.
     * @param {string} [viewID=""] The id of the view to create.
     * @param {string} verbName The name of the verb aS sent by the server.
     * @param {Object} verb The verb to display in this VerbGameView instance.
     * @param {Object} appLanguageVerb The verb in the app's language, to display under the verb.
     * @param {string} [BCP47=""] The BCP47 code of the verb's language, so it can be spoken.
     */
    constructor(viewID="", verbName, verb, appLanguageVerb, BCP47 = "") {
        super(viewID);

        this.#verb = verb;
        this.#appLanguageVerb = appLanguageVerb;
        this.#BCP47 = BCP47;
        
        this.#speech = new SpeechSynthesisUtterance();
        this.#initializeVoice().then(() => {
            this.#setSpeechVoice();

            if(!this.#couldLoadVoices)
                this.#speech.lang = this.#BCP47;
            
            window.speechSynthesis.speak(this.#speech);
        });

        this.#speech.text = this.#verb[this.#currentVerb];

        this.#img = document.getElementById("img");
        this.#img.src = "./server-images/verbs/" + verbName + "/" + 
            this.#currentVerb + "-" + verbName + ".png";

        let lblCurrentAppVerb = document.getElementById("lblCurrentAppVerb");
        lblCurrentAppVerb.innerText = this.#appLanguageVerb[this.#currentVerb.toString()];

        let lblCurrentVerb = document.getElementById("lblCurrentVerb");
        lblCurrentVerb.innerText = this.#verb[this.#currentVerb.toString()];

        lblCurrentVerb.addEventListener("click", async () => {
            if(this.#verb[this.#currentVerb.toString()] !== undefined)
                this.#currentVerb++;
                
            if(this.#verb[this.#currentVerb.toString()] == undefined) { //Don't try this at home, kids!
                await this.#navigateToAssociateVerbsGameEvent();
            }
                
            if(this.#verb[this.#currentVerb.toString()] !== undefined) {
                this.#speech.text = this.#verb[this.#currentVerb];
                window.speechSynthesis.speak(this.#speech);
            }

            this.#img.src = "./server-images/verbs/" + verbName + "/" + 
                this.#currentVerb + "-" + verbName + ".png";

            lblCurrentVerb.innerText = this.#verb[this.#currentVerb.toString()];
            lblCurrentAppVerb.innerText = this.#appLanguageVerb[this.#currentVerb.toString()];
        });
    }

    /**Initializes the Speech Synthesis API. */
    async #initializeVoice() {
        await this.#waitForVoicesToLoad().then(voices => {
            let selectedVoice = voices.find(voice => voice.lang === this.#BCP47);
            if (selectedVoice) {
                this.#speech.voice = selectedVoice;
                this.#couldLoadVoices = true;
            } else {
                console.warn('No matching voice found. Using default.');
            }
        }).catch(err => console.error("Error loading voices", err));
    }
    
    async #waitForVoicesToLoad() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const checkVoices = () => {
                let voices = window.speechSynthesis.getVoices();
                voices = iOSVoiceSelector.getiOSVoices(voices);
                if (voices.length > 0) {
                    resolve(voices);
                } else if (attempts < 10) { // Try up to 10 times
                    attempts++;
                    setTimeout(checkVoices, 100); // Wait 100ms before trying again
                } else {
                    reject(new Error("Voices not loaded"));
                }
            };
            checkVoices();
        });
    }

    /**Sets the proper voice for a language. */
    #setSpeechVoice() {
        let voicesLoaded = () => {
            let voices = window.speechSynthesis.getVoices();
            let selectedVoice = voices.find(voice => voice.lang === this.#BCP47);
    
            if (selectedVoice)
                this.#speech.voice = selectedVoice;
            else
                console.warn('No matching voice found. Using default.');
    
            //Remove the event listener once voices are loaded
            window.speechSynthesis.removeEventListener('voiceschanged', voicesLoaded);
        };
    
        if (window.speechSynthesis.onvoiceschanged !== undefined)
            window.speechSynthesis.onvoiceschanged = voicesLoaded;
        else
            voicesLoaded(); //Execute immediately if voices are already loaded or the event is not supported
    }

    onNavigatingToAssociateVerbsGame(callback) {
        this.#navigateToAssociateVerbsGameEvent = callback;
    }
 }
