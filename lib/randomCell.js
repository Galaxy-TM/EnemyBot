const RARITY = require("../lib/rarities");

module.exports = () => {
    let random = Math.random();
    for (let c in RARITY) {
        if (random < RARITY[c]) {
            return c;
        }
    }
}