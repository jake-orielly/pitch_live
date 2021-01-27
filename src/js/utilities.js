function getCardImage(card) {
    let cardName;
    if (card == "back") 
        return require("../assets/cards/red_back.png");
    if (card == "placeholder") 
        return require("../assets/cards/placeholder.png");
    let faceMap = { Jack: "J", Queen: "Q", King: "K", Ace: "A" };
    let num = card.num;
    if (isNaN(num)) 
        num = faceMap[num];
    cardName = num + card.suit[0];
    // TODO: Figure out why the "AD" card was giving issues
    if (cardName == "AD")
        cardName = "AX"
    return require("../assets/cards/" + cardName + ".png");
}

export default { getCardImage }