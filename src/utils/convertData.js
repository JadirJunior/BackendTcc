module.exports = {
    DayWeek: (day) => {
        if (day === 0) return 1;
        if (day === 1) return 2;
        if (day === 2) return 3;
        if (day === 3) return 4;
        if (day === 4) return 5;
        if (day === 5) return 6;
        if (day === 6) return 7;
    },

    getMes: (value) => {
        if (value === 1) return "Janeiro"
        if (value === 2) return "Fevereiro"
        if (value === 3) return "Março"
        if (value === 4) return "Abril"
        if (value === 5) return "Maio"
        if (value === 6) return "Junho"
        if (value === 7) return "Julho"
        if (value === 8) return "Agosto"
        if (value === 9) return "Setembro"
        if (value === 10) return "Outubro"
        if (value === 11) return "Novembro"
        if (value === 12) return "Dezembro"
    }
}