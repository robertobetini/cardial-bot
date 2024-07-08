class Item {
    constructor(id, name, type, description, price, tier, weight, imgUrl, details) {
        this.id = id;
        this.name = name;
        this.queryName = name.toUpperCase();
        this.type = type;
        this.description = description;
        this.price = price;
        this.tier = tier;
        this.weight = weight;
        this.imgUrl = imgUrl;
        this.details = details;
    }

    static fromDTO(itemDTO) {
        if (!itemDTO) {
            return null;
        }

        return new Item(
            itemDTO.id, 
            itemDTO.name, 
            itemDTO.type, 
            itemDTO.description, 
            itemDTO.price, 
            itemDTO.tier, 
            itemDTO.weight, 
            itemDTO.imgUrl,
            JSON.parse(itemDTO.details)
        );
    }
}

module.exports = Item;
