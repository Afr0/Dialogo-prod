import Languages from "../Languages.mjs";

/**Set the preferred language for a new user request based on the accept-language header.
 * It only does this if the accept header is actually set.
*/
export default function preferredLanguage(req, res, next) {
    let acceptLanguage = req.headers['accept-language'];

    let languagePreference = Languages.ImplementedLanguages.English; //Default language

    if (acceptLanguage) {
        acceptLanguage = acceptLanguage.toLowerCase();

        if (acceptLanguage.includes("en"))
            languagePreference = Languages.ImplementedLanguages.English;
        else if (acceptLanguage.includes("it"))
            languagePreference = Languages.ImplementedLanguages.Italian;
        else if (acceptLanguage.includes("ru"))
            languagePreference = Languages.ImplementedLanguages.Russian;
    }

    req.preferredLanguage = languagePreference;
    next();
}