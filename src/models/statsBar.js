class StatsBar {
    constructor(name, currentValue, maxValue, tempValue = 0) {
        this.name = name;
        this.set(currentValue, maxValue, tempValue);
    }

    set(currentValue, maxValue, tempValue = 0) {
        this.current = currentValue;
        this.max = maxValue;
        this.temp = tempValue;

        this.constrainMax();
        this.constrainTemp();
        this.constrainCurrent();
    }

    increaseMax(amount) {
        this.max += amount;
        this.constrainMax();
        this.constrainCurrent();
    }

    increaseTemp(amount) {
        this.temp += amount;
        this.constrainTemp();
    }

    increaseCurrent(amount) {
        if (amount >= 0) {
            this.current += amount;
        } else {
            let remainingAmount = amount;
            if (this.temp > 0) {
                remainingAmount += this.temp;
                this.increaseTemp(amount);
            }
    
            if (remainingAmount !== 0) {
                this.current += remainingAmount;
            }
        }

        this.constrainCurrent();
    }

    constrainCurrent() {
        if (this.current > this.max) {
            this.current = this.max;
        } else if (this.current < 0) {
            this.current = 0;
        }
    }

    constrainTemp() {
        if (this.temp < 0) { this.temp = 0; }
    }

    constrainMax() {
        if (this.max < 0) { this.max = 0; }
    }
}

module.exports = StatsBar;
