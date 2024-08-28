class Token {
    static TARGET = "TARGET";
    static DELIMITER = "DELIMITER";
    static OPEN_PARENTHESIS = "OPEN_PARENTHESIS";
    static CLOSE_PARENTHESIS = "CLOSE_PARENTHESIS";
    static LINE_END = "LINE_END";
    static PROPERTY = "PROPERTY";
    static OPERATION = "OPERATION";
    static DICE_EXPRESSION = "DICE_EXPRESSION";
    static TIME_DELIMITER = "TIME_DELIMITER";
    static TIME_COUNTER = "TIME_COUNTER";
    static PROFICIENCY_VALUE = "PROFICIENCY_VALUE";
    static NUMBER = "NUMBER";
    static UNKNOWN = "UNKNOWN";

    static SKILL_TOKEN_VALUES = ["acro", "ades", "atle", "enga", "furt", "inti", "intu", "inve", "natu", "perc", "perf", "pers", "pres", "sobr", "pfor", "pdes", "pconst", "pcon", "pcar"];
    
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

module.exports = Token;
