class ProgressionService {
    static addExp(users, expAmount, constrainLevel = false) {
        for (let user of users) {
            if (!user) {
                throw new Error(`Existem jogadores sem ficha ou com ficha incompleta.`);
            }

            user.addExp(expAmount, constrainLevel);
        }
    }

    static addMasteryExp(users, expAmount) {
        for (let user of users) {
            if (!user) {
                throw new Error(`Existem jogadores sem ficha ou com ficha incompleta.`);
            }

            user.addMasteryExp(expAmount);
        }
    }

    static addExpAndMastery(user, expAmount) {
        const masteryExp = Math.ceil(expAmount / 2);

        ProgressionService.addExp([user], expAmount);
        ProgressionService.addMasteryExp([user], masteryExp);
    }
}

module.exports = ProgressionService;