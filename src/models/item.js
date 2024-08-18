class Item {
    constructor(id, name, level, type, description, price, tier, weight, imgUrl, emoji, details) {
        this.id = id;
        this.name = name;
        this.queryName = name.toUpperCase();
        this.level = level;
        this.type = type;
        this.description = description;
        this.price = price;
        this.tier = tier;
        this.weight = weight;
        this.imgUrl = imgUrl;
        this.emoji = emoji;
        this.creator = "O Inventor";
        this.details = details;
    }

    static fromDTO(itemDTO) {
        if (!itemDTO) {
            return null;
        }

        return new Item(
            itemDTO.id, 
            itemDTO.name,
            itemDTO.level,
            itemDTO.type, 
            itemDTO.description, 
            itemDTO.price, 
            itemDTO.tier, 
            itemDTO.weight, 
            itemDTO.imgUrl,
            itemDTO.emoji,
            JSON.parse(itemDTO.details)
        );
    }
}

module.exports = Item;
