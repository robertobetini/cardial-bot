class Skills {
    constructor(userId, guildId) {
        this.userId = userId;
        this.guildId = guildId;

        this.athletics = "NoProficiency";
        this.acrobatics = "NoProficiency";
        this.jugglery = "NoProficiency";
        this.stealth = "NoProficiency";
        this.animalTraining = "NoProficiency";
        this.intuition = "NoProficiency";
        this.investigation = "NoProficiency";
        this.nature = "NoProficiency";
        this.perception = "NoProficiency";
        this.survivability = "NoProficiency";
        this.deception = "NoProficiency";
        this.intimidation = "NoProficiency";
        this.performance = "NoProficiency";
        this.persuasion = "NoProficiency";
    }

    static fromDTO(fullUserDTO) {
        if (!fullUserDTO) {
            return null;
        }

        const skills = new Skills(fullUserDTO.userId, fullUserDTO.guildId);

        skills.athletics = fullUserDTO.athletics;
        skills.acrobatics = fullUserDTO.acrobatics;
        skills.jugglery = fullUserDTO.jugglery;
        skills.stealth = fullUserDTO.stealth;
        skills.animalTraining = fullUserDTO.animalTraining;
        skills.intuition = fullUserDTO.intuition;
        skills.investigation = fullUserDTO.investigation;
        skills.nature = fullUserDTO.nature;
        skills.perception = fullUserDTO.perception;
        skills.survivability = fullUserDTO.survivability;
        skills.deception = fullUserDTO.deception;
        skills.intimidation = fullUserDTO.intimidation;
        skills.performance = fullUserDTO.performance;
        skills.persuasion = fullUserDTO.persuasion;

        return skills;
    }
}

module.exports = Skills;
