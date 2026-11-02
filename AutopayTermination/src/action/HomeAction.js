// HTML5-Base common 2022.09.23
let actions = {
    changeValue: (name,data) => ({
        type: 'home/CHANGE_VALUE',
        name: name,
        value: data
    }),
    changeValueJO: (data) => ({
        type: 'home/CHANGE_VALUE_JO',
        value: data
    }),
    changeLanguage: (language) => ({
        type: 'home/CHANGELANG',
        language: language
    }),
    changeFile: (file) => ({
        type: 'home/CHANGEFILE',
        file: file
    }),
    setFncMsgFilename: (filename) => ({
        type: 'home/SET_FNCMSG_FILENAME',
        filename: filename
    })    
};
export default actions;