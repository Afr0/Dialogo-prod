export class Languages {
    static ImplementedLanguages = {
        Italian: 1,
        English: 2,
        Russian: 3
    }

    static BCP47 = {
        Italian: "it-IT",
        English: "en-GB",
        Russian: "ru-RU"
    }

    /**Returns the string representation of a language based on a given key.
     * @param {number} langValue The key of the language to return the string representation for.
     * @returns The string representation of the language corresponding to the given key. 
     *          Returns null if no key was found.
     */
    static getLanguageName(langValue) {
        for (let key in this.ImplementedLanguages) {
            if (this.ImplementedLanguages[key] === langValue)
                return key;
        }

        return null;
    }

    /**Gets the integer ID of a language based on a given language name.
     * @param {string} [langName=""] The name of the language to return the ID for.
     * @returns The integer ID of a language, or 0 if the language name didn't match 
     *          any stored languages.
     */
    static getLanguageValue(langName = "") {
        for (let key in this.ImplementedLanguages) {
            if(key.toString() === langName || key.toString().toLowerCase() === langName)
                return this.ImplementedLanguages[key];
        }

        return 0;
    }

    /**Gets a BCP47 language value from a provided language name.
     * @param {string} [langName=""] The name of the language.
     * @returns A BCP47 language code, or an empty string if the language wasn't found.
     */
    static BCP47FromLangName(langName = "") {
        for (let key in this.BCP47) {
            if(key.toString() === langName || key.toString().toLowerCase() === langName)
                return this.BCP47[key];
        }

        return "";  
    }
}

const CURRENTLANGUAGE_CACHE = "currentLanguage";

/**A very simple manager for locales.
 * Originally written for Helseflora: Applikasjonsutvikling 1.
 * Improved upon for this project by making everything static.
 */
export default class LanguageManager {
    static #currentLanguage = 2;
    static #translations = [];

    /**Sets the language used by the LanguageManager
     * (and by extension, the application).
     * @param {number} lang The language to set. Please
     * pick one from the Languages class. Defaults to 2 for Eng.
     * @param {boolean} overrideCache Should the current language
     * be overridden? If this isn't set, the language will only be
     * set if it hasn't already been set (I.E exists in the cache).
     * Defaults to false.
     * @returns True if successful, false otherwise.
     */
    static async setLanguage(lang = 2, overrideCache = false) {
        try {
            if((!localStorage.getItem(CURRENTLANGUAGE_CACHE)) || 
              (localStorage.getItem(CURRENTLANGUAGE_CACHE) && overrideCache)) {
                LanguageManager.#currentLanguage = lang;
                await LanguageManager.#loadLanguage(lang);
                localStorage.setItem(CURRENTLANGUAGE_CACHE, lang)
              }
              else {
                if (!LanguageManager.#translations[LanguageManager.#currentLanguage])
                    //Persist dammit!
                    LanguageManager.#loadLanguage(LanguageManager.#currentLanguage);
              }
        }
        catch(exception) {
            LanguageManager.#currentLanguage = 2;
            return false;
        }

        return true;
    }

    /**Loads the specified language asynchronously.
     */
    static async #loadLanguage(lang = 2) {
        if(!LanguageManager.#translations)
            LanguageManager.#translations = [];

        try {
            const response = await fetch(`./Locales/${Languages.getLanguageName(lang)}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            LanguageManager.#translations[lang] = await response.json();
        } catch (error) {
            console.error("Could not load language file:", error);
            throw error; //Caught in setLanguage().
        }
    }

    /**Gets a translation for the specified key.
     * @param {string} key The ID of the string (translation) to get.
     * @returns The translation if it was found, otherwise null.
     */
    static async getTranslation(key = "") {
        if(!LanguageManager.#currentLanguage) {
            LanguageManager.#currentLanguage = localStorage.getItem(CURRENTLANGUAGE_CACHE);

            if(!LanguageManager.#currentLanguage) {
                console.warn("Tried to use getTranslation() before language was set!");
                return null;
            }
        }

        if (!LanguageManager.#translations[LanguageManager.#currentLanguage]) 
            //Persist dammit!
            await LanguageManager.#loadLanguage(LanguageManager.#currentLanguage);

        return LanguageManager.#translations[LanguageManager.#currentLanguage][key] || `{{${key}}}`;
    }
}