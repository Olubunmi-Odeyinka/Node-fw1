module.exports.add = (a, b) =>{
    return a + b;
}

module.exports.asyncAdd = (a, b, callback) =>{
    setTimeout(() => {
        callback(a + b);
    }, 1000)
}