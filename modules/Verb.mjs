import storageManager from "./storageManager.mjs";

/**Represents a verb as stored in the DB. */
class Verb {
    #name = "";
    #englishVerb = {};
    #italianVerb = {};
    #russianVerb = {};

    getName() {
        return this.#name;
    }

    getEnglishVerb() {
        return JSON.stringify(this.#englishVerb);
    }

    getItalianVerb() {
        return JSON.stringify(this.#italianVerb);
    }

    getRussianVerb() {
        return JSON.stringify(this.#russianVerb);
    }

    /**Constructs a new Verb instance. */
    constructor(name = "", english = {}, italian = {}, russian = {}) {
        this.#name = name;
        this.#englishVerb = english;
        this.#italianVerb = italian;
        this.#russianVerb = russian;
    }

    /**Gets all verbs stored in the DB. Probably not for production use. :P */
    static async getVerbs() {
        let verbs = await storageManager.getVerbs();
        return verbs;
    }
}

export default Verb;