const generatePatientToken = (threadId, patientId) => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MED-TOKEN-${year}-${randomSuffix}`;
};

module.exports = {
    generatePatientToken
};
