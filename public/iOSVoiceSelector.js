export default class iOSVoiceSelector {
    static #iOSVoiceNames = [
        'Maged',
        'Zuzana',
        'Sara',
        'Anna',
        'Melina',
        'Karen',
        'Samantha',
        'Daniel',
        'Rishi',
        'Moira',
        'Tessa',
        'Mónica',
        'Paulina',
        'Satu',
        'Amélie',
        'Thomas',
        'Carmit',
        'Lekha',
        'Mariska',
        'Damayanti',
        'Alice',
        'Kyoko',
        'Yuna',
        'Ellen',
        'Xander',
        'Nora',
        'Zosia',
        'Luciana',
        'Joana',
        'Ioana',
        'Milena',
        'Yuri',
        'Katya',
        'Laura',
        'Alva',
        'Kanya',
        'Yelda',
        'Tian-Tian',
        'Sin-Ji',
        'Mei-Jia'
    ];
    
    /**Returns true if we're on iOS, false otherwise.
     * From: https://talkrapp.com/speechSynthesis.html
     */
    static #oniOS() {
        var hasWindow = typeof window === 'object' && window !== null && window.self === window && window.navigator !== null;
        return hasWindow && /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
    }

    /**Find appropriate voices for iOS.
     * From: https://talkrapp.com/speechSynthesis.html
     * @param {any[]} [voices=[]] Voices found using window.speechSynthesis.getVoices();
     * @returns The voices array if not on iOS, or the appropriate
     * list of voices for iOS if on iOS.
     */
    static getiOSVoices(voices = []) {
        if (this.#oniOS()) {
            let iOSVoices = []
            for (var i = 0; i < voices.length; ++i) {
                if (this.#iOSVoiceNames.includes(voices[i].name))
                    iOSVoices.push(voices[i]);
            }

            return iOSVoices;
        }

        return voices;
    }
}