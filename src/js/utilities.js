function getCardImage(card) {
    if (card == "back") 
        return require("../assets/cards/red_back.png");
    if (card == "placeholder") 
        return require("../assets/cards/placeholder.png");
    let faceMap = { Jack: "J", Queen: "Q", King: "K", Ace: "A" };
    let num = card.num;
    if (isNaN(num)) 
        num = faceMap[num];
    return require("../assets/cards/" + num + card.suit[0] + ".png");
}

export default { getCardImage }