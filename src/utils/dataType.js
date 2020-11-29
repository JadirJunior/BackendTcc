var date = new Date();
const convertData = require('./convertData');

module.exports = {
    getDayOfWeek: () => {
        return convertData.DayWeek(date.getDay());
    },

    getYear: () => {
        return date.getFullYear();
    },

    getDayMonth: () => {
        return date.getDate();
    },

    getMonth: () => {
        return convertData.getMes(date.getMonth()+1);
    }
}