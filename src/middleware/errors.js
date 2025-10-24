function error(message, code) {
    let e = new Error(message);

    if(code) {
        e.statusCode = code;
    }

    return e;
}

module.exports = error;  // ← Exporta la función DIRECTAMENTE, no como objeto