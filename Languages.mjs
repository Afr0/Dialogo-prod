/**Represents the languages currently supported by Dialogo. This class
 * is shared by the server and client.
 */
export default class Languages {
    static ImplementedLanguages = {
        Italian: 1,
        English: 2,
        Russian: 3
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

        return null; // Return null if no matching key is found
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
}