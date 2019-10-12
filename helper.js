module.exports.randint = (min, max) => {
    // получить случайное число от (min-0.5) до (max+0.5)
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

module.exports.isNotEmpty = (array) => {
    return typeof array !== 'undefined' && array.length > 0
}